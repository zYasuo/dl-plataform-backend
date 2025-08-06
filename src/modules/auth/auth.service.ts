import { AuthDTO } from "./dto/auth.dto";
import * as argon2 from "argon2";
import { JwtService } from "@nestjs/jwt";
import type { IUserService } from "../user/user.service";
import { IAuthResponse } from "./dto/auth-response.interface";
import { ICreateJWT, ICreateTokenDB } from "./jwt/dto/jwt-payload.interface";
import { PrismaClient, Token, User } from "@prisma/client";
import { ForbiddenException, Inject, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";

export interface IAuthService {
    login(data: AuthDTO): Promise<IAuthResponse>;
    validateToken(token: string);
}

@Injectable()
export class AuthService {
    constructor(
        @Inject("PRISMA_CLIENT") private prismaDB: PrismaClient,
        @Inject("IUserService") private readonly userService: IUserService,
        private readonly jwtService: JwtService
    ) {}

    async login(data: AuthDTO): Promise<IAuthResponse> {
        const dataValidate = await this.validateLogin(data);

        const payloadToken: ICreateJWT = {
            name: dataValidate.name,
            email: dataValidate.email
        };

        const generateToken = await this.jwtService.signAsync(payloadToken);

        await this.createTokenDB({
            token: generateToken,
            refreshToken: generateToken,
            userId: dataValidate.id,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        });
        return { access_token: generateToken };
    }

    private async validateLogin(data: AuthDTO): Promise<User> {
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

    private async createTokenDB(payload: ICreateTokenDB): Promise<Token> {
        const tokenDB = await this.prismaDB.token.create({
            data: payload
        });

        if (!tokenDB) {
            throw new ForbiddenException("Access Denied");
        }

        return tokenDB;
    }

    async validateToken(token: string) {
        return this.jwtService.verify(token, {
            secret: process.env.JWT_SECRET_KEY
        });
    }
}
