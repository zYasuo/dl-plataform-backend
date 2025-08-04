import { AuthDTO } from "./dto/auth.dto";
import * as argon2 from "argon2";
import { JwtService } from "@nestjs/jwt";
import { UserService } from "src/user/user.service";
import { IAuthResponse } from "./dto/auth-response.interface";
import { ICreateJWT, ICreateTokenDB } from "./jwt/dto/jwt-payload.interface";
import { PrismaClient, Token, User } from "@prisma/client";
import { ForbiddenException, Inject, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";

@Injectable()
export class AuthService {
    constructor(
        @Inject("PRISMA_CLIENT") private prismaDB: PrismaClient,
        private readonly jwtService: JwtService,
        private readonly userService: UserService
    ) {}

    async createAccessToken(data: AuthDTO): Promise<IAuthResponse> {
        const dataValidate = await this.validateUser(data);

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

    async validateUser(data: AuthDTO): Promise<User> {
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

    async createTokenDB(payload: ICreateTokenDB): Promise<Token> {
        const tokenDB = await this.prismaDB.token.create({
            data: payload
        });

        if (!tokenDB) {
            throw new ForbiddenException("Access Denied");
        }

        return tokenDB;
    }
}
