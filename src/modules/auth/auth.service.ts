import { AuthDTO } from "./dto/auth.dto";
import * as argon2 from "argon2";
import { JwtService } from "@nestjs/jwt";
import { IAuthResponse } from "./interface/auth-response.interface";
import type { IAuthService } from "./interface/auth-service.interface";
import type { IUserService } from "../user/interfaces/user-service.interface";
import { PrismaClient, token, user } from "@prisma/client";
import { ICreateJWT, ICreateTokenDB, ITokenValidationResult } from "./interface/jwt-payload.interface";
import { ForbiddenException, Inject, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";

@Injectable()
export class AuthService implements IAuthService {
    constructor(
        @Inject("PRISMA_CLIENT") private prismaDB: PrismaClient,
        @Inject("IUserService") private readonly userService: IUserService,
        private readonly jwtService: JwtService
    ) {}

    async login(data: AuthDTO): Promise<IAuthResponse> {
        const dataValidate = await this.validateLogin(data);

        const payloadToken: ICreateJWT = {
            name: dataValidate.name,
            email: dataValidate.email,
            sub: dataValidate.id
        };

        const generateToken = await this.jwtService.signAsync(payloadToken, {
            expiresIn: "7d"
        });

        await this.createTokenDB({
            refresh_token: generateToken,
            user_id: dataValidate.id
        });

        return { access_token: generateToken };
    }

    private async validateLogin(data: AuthDTO): Promise<user> {
        const searchData = await this.userService.searchUserByEmail(data.email);

        if (!searchData) {
            throw new NotFoundException("User not found.");
        }

        const isValidPassword = await argon2.verify(searchData.password, data.password);

        if (!isValidPassword) {
            throw new UnauthorizedException("Invalid credentials.");
        }

        return searchData;
    }

    private async createTokenDB(payload: ICreateTokenDB): Promise<token> {
        const tokenDB = await this.prismaDB.token.create({
            data: payload
        });

        if (!tokenDB) {
            throw new ForbiddenException("Access Denied");
        }

        return tokenDB;
    }

    async validateToken(token: string): Promise<ITokenValidationResult> {
        const decoded = this.jwtService.verify<ICreateJWT>(token, {
            secret: process.env.JWT_SECRET_KEY
        });

        const tokenInDB = await this.prismaDB.token.findFirst({
            where: { refresh_token: token }
        });

        if (!tokenInDB) {
            throw new UnauthorizedException("Token revoked or not found");
        }

        const user = await this.userService.searchUserByEmail(decoded.email);
        if (!user) {
            throw new UnauthorizedException("User not found");
        }

        return {
            valid: true,
            payload: decoded,
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            }
        };
    }
    async revokeToken(token: string): Promise<void> {
        await this.prismaDB.token.deleteMany({
            where: { refresh_token: token }
        });
    }
}
