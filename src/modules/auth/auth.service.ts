import * as argon2 from "argon2";
import { JwtService } from "@nestjs/jwt";
import { IAuthResponse } from "./interface/auth-response.interface";
import { CreateUserDTO } from "../user/dto/user-create.dto";
import type { IAuthService } from "./interface/auth-service.interface";
import type { IUserService } from "../user/interfaces/user-service.interface";
import type { IEmailService } from "../email/interface/email-service.interface";
import { PrismaClient, token, user } from "@prisma/client";
import { ICreateJWT, ICreateTokenDB, ITokenValidationResult } from "./interface/jwt-payload.interface";
import { AuthDTO, AuthHeaderDTO, RefreshTokenDTO, VerifyEmailDTO } from "./dto/auth.dto";
import { BadRequestException, Inject, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from "@nestjs/common";

@Injectable()
export class AuthService implements IAuthService {
    constructor(
        @Inject("PRISMA_CLIENT") private prismaDB: PrismaClient,
        @Inject("IUserService") private readonly userService: IUserService,
        @Inject("IEmailService") private readonly emailService: IEmailService,
        private readonly jwtService: JwtService
    ) {}

    async signup(data: CreateUserDTO): Promise<{ message: string }> {
        await this.userService.create(data);
        const verificationToken = await this.generateVerificationToken(data.email);
        await this.emailService.sendWelcomeEmail(data.email, data.name, verificationToken);

        return {
            message: "User created successfully. Please check your email to verify your account."
        };
    }

    async verifyEmail(data: VerifyEmailDTO): Promise<boolean> {
        return await this.prismaDB.$transaction(async (tx) => {
            const verification = await tx.verification.findUnique({
                where: { id: data.token }
            });

            if (!verification) {
                throw new BadRequestException("Invalid verification token");
            }

            if (verification.expires_at < new Date()) {
                throw new BadRequestException("Verification token has expired");
            }

            if (verification.value !== "email_verification") {
                throw new BadRequestException("Invalid verification token");
            }

            const updatedUser = await tx.user.update({
                where: { email: verification.identifier },
                data: {
                    email_verified: true,
                    updated_at: new Date()
                }
            });

            if (!updatedUser) {
                throw new InternalServerErrorException("Failed to verify email");
            }

            await tx.verification.delete({
                where: { id: data.token }
            });

            return true;
        });
    }

    async resendVerificationEmail(email: string): Promise<boolean> {
        const user = await this.userService.searchUserByEmail(email);

        if (!user) {
            throw new NotFoundException("User not found");
        }

        if (user.email_verified) {
            throw new BadRequestException("Email already verified");
        }

        await this.prismaDB.verification.deleteMany({
            where: {
                identifier: email,
                value: "email_verification"
            }
        });

        const verificationToken = await this.generateVerificationToken(email);
        await this.emailService.sendWelcomeEmail(email, user.name, verificationToken);

        return true;
    }

    private async generateVerificationToken(email: string): Promise<string> {
        await this.prismaDB.verification.deleteMany({
            where: {
                identifier: email,
                value: "email_verification"
            }
        });

        const token = crypto.randomUUID();
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 24);

        const verification = await this.prismaDB.verification.create({
            data: {
                id: token,
                identifier: email,
                value: "email_verification",
                expires_at: expiresAt,
                created_at: new Date(),
                updated_at: new Date()
            }
        });

        if (!verification) {
            throw new InternalServerErrorException("Failed to create verification token");
        }

        return token;
    }

    async signin(data: AuthDTO): Promise<IAuthResponse> {
        const dataValidate = await this.validateLogin(data);

        const payloadToken: ICreateJWT = {
            name: dataValidate.name,
            email: dataValidate.email,
            sub: dataValidate.id
        };

        const accessToken = await this.jwtService.signAsync(payloadToken, {
            expiresIn: "15m"
        });

        const refreshToken = await this.jwtService.signAsync(
            {
                sub: dataValidate.id,
                type: "refresh",
                jti: crypto.randomUUID()
            },
            {
                expiresIn: "7d"
            }
        );

        const expirationDate = new Date();
        expirationDate.setDate(expirationDate.getDate() + 7);

        await this.prismaDB.token.deleteMany({
            where: { user_id: dataValidate.id }
        });

        await this.createTokenDB({
            refresh_token: refreshToken,
            user_id: dataValidate.id,
            expires_at: expirationDate
        });

        return {
            access_token: accessToken,
            refresh_token: refreshToken,
            user: {
                id: dataValidate.id,
                name: dataValidate.name,
                email: dataValidate.email,
                image: dataValidate.image!
            },
            expires_in: 900,
            token_type: "Bearer"
        };
    }

    async refreshAccessToken(refreshTokenDto: RefreshTokenDTO): Promise<{ access_token: string; refresh_token: string; expires_in: number }> {
        try {
            const decoded = this.jwtService.verify<{ sub: string; type: string; jti: string }>(refreshTokenDto.refresh_token);

            if (decoded.type !== "refresh") {
                throw new UnauthorizedException("Invalid refresh token type");
            }

            const tokenInDB = await this.prismaDB.token.findFirst({
                where: {
                    refresh_token: refreshTokenDto.refresh_token,
                    expires_at: { gt: new Date() }
                },
                include: { user: true }
            });

            if (!tokenInDB) {
                throw new UnauthorizedException("Refresh token expired or revoked");
            }

            const payloadToken: ICreateJWT = {
                name: tokenInDB.user.name,
                email: tokenInDB.user.email,
                sub: tokenInDB.user.id
            };

            const newAccessToken = await this.jwtService.signAsync(payloadToken, {
                expiresIn: "15m"
            });

            const newRefreshToken = await this.jwtService.signAsync(
                {
                    sub: tokenInDB.user.id,
                    type: "refresh",
                    jti: crypto.randomUUID()
                },
                { expiresIn: "7d" }
            );

            await this.prismaDB.token.update({
                where: { id: tokenInDB.id },
                data: {
                    refresh_token: newRefreshToken,
                    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                    updated_at: new Date()
                }
            });

            return {
                access_token: newAccessToken,
                refresh_token: newRefreshToken,
                expires_in: 900
            };
        } catch (error) {
            if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
                throw new UnauthorizedException("Invalid or expired refresh token");
            }
            throw error;
        }
    }

    async validateToken(data: AuthHeaderDTO): Promise<ITokenValidationResult> {
        try {
            const decoded = this.jwtService.verify<ICreateJWT>(data.authorization);

            return {
                valid: true,
                payload: decoded,
                user: {
                    id: decoded.sub,
                    name: decoded.name!,
                    email: decoded.email
                }
            };
        } catch (error) {
            if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
                throw new UnauthorizedException("Invalid or expired access token");
            }
            throw error;
        }
    }

    async revokeToken(token: string): Promise<void> {
        await this.prismaDB.token.deleteMany({
            where: { refresh_token: token }
        });
    }

    async logout(refreshToken: string): Promise<void> {
        await this.prismaDB.token.deleteMany({
            where: { refresh_token: refreshToken }
        });
    }

    async logoutAllDevices(userId: string): Promise<void> {
        await this.prismaDB.token.deleteMany({
            where: { user_id: userId }
        });
    }

    async cleanExpiredTokens(): Promise<void> {
        await this.prismaDB.token.deleteMany({
            where: {
                expires_at: { lt: new Date() }
            }
        });
    }

    private async validateLogin(data: AuthDTO): Promise<user> {
        const user = await this.userService.searchUserByEmail(data.email);

        if (!user) {
            throw new UnauthorizedException("Invalid credentials");
        }

        if (!user.email_verified) {
            throw new UnauthorizedException("Please verify your email before logging in");
        }

        const isValidPassword = await argon2.verify(user.password, data.password);

        if (!isValidPassword) {
            throw new UnauthorizedException("Invalid credentials");
        }

        return user;
    }

    private async createTokenDB(payload: ICreateTokenDB): Promise<token> {
        return this.prismaDB.token.create({
            data: {
                user_id: payload.user_id,
                refresh_token: payload.refresh_token,
                expires_at: payload.expires_at,
                updated_at: new Date()
            }
        });
    }
}
