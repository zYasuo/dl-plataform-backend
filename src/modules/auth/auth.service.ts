import { AuthDTO } from "./dto/auth.dto";
import * as argon2 from "argon2";
import { JwtService } from "@nestjs/jwt";
import { CreateUserDTO } from "../user/dto/user-create.dto";
import type { IEmailService } from "../email/interface/email-service.interface";
import { IAuthResponse } from "./interface/auth-response.interface";
import type { IAuthService } from "./interface/auth-service.interface";
import type { IUserService } from "../user/interfaces/user-service.interface";
import { PrismaClient, token, user } from "@prisma/client";
import { ICreateJWT, ICreateTokenDB, ITokenValidationResult } from "./interface/jwt-payload.interface";
import { BadRequestException, Inject, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";

@Injectable()
export class AuthService implements IAuthService {
    constructor(
        @Inject("PRISMA_CLIENT") private prismaDB: PrismaClient,
        @Inject("IUserService") private readonly userService: IUserService,
        @Inject("IEmailService") private readonly emailService: IEmailService,
        private readonly jwtService: JwtService
    ) {}

    async register(data: CreateUserDTO): Promise<{ message: string }> {
        await this.userService.create(data);

        const verificationToken = await this.generateVerificationToken(data.email);

        await this.emailService.sendWelcomeEmail(data.email, data.name, verificationToken);

        return {
            message: "User created successfully. Please check your email to verify your account."
        };
    }

    async login(data: AuthDTO): Promise<IAuthResponse> {
        const dataValidate = await this.validateLogin(data);

        const payloadToken: ICreateJWT = {
            name: dataValidate.name,
            email: dataValidate.email,
            sub: dataValidate.id
        };

        const expiresIn = "7d";
        const accessToken = await this.jwtService.signAsync(payloadToken, {
            expiresIn
        });

        const expirationDate = new Date();
        expirationDate.setDate(expirationDate.getDate() + 7);

        await this.createTokenDB({
            refresh_token: accessToken,
            user_id: dataValidate.id,
            expires_at: expirationDate
        });

        return {
            access_token: accessToken,
            user: {
                id: dataValidate.id,
                name: dataValidate.name,
                email: dataValidate.email,
                image: dataValidate.image!
            },
            expires_in: expiresIn,
            token_type: "Bearer"
        };
    }

    async verifyEmail(token: string): Promise<{ message: string }> {
        const verification = await this.prismaDB.verification.findUnique({
            where: { id: token }
        });

        if (!verification || verification.expires_at < new Date()) {
            throw new BadRequestException("Invalid or expired verification token");
        }

        await this.userService.updateEmailVerification(verification.identifier, true);

        await this.prismaDB.verification.delete({
            where: { id: token }
        });

        return { message: "Email verified successfully" };
    }

    async resendVerificationEmail(email: string): Promise<{ message: string }> {
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

        return { message: "Verification email sent" };
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

    private async generateVerificationToken(email: string): Promise<string> {
        const token = crypto.randomUUID();
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 24);

        await this.prismaDB.verification.create({
            data: {
                id: token,
                identifier: email,
                value: "email_verification",
                expires_at: expiresAt
            }
        });

        return token;
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

    async validateToken(token: string): Promise<ITokenValidationResult> {
        try {
            const decoded = this.jwtService.verify<ICreateJWT>(token, {
                secret: process.env.JWT_SECRET_KEY
            });

            const tokenInDB = await this.prismaDB.token.findFirst({
                where: {
                    refresh_token: token,
                    expires_at: {
                        gt: new Date()
                    }
                },
                include: {
                    user: true
                }
            });

            if (!tokenInDB) {
                throw new UnauthorizedException("Token revoked, expired or not found");
            }

            return {
                valid: true,
                payload: decoded,
                user: {
                    id: tokenInDB.user.id,
                    name: tokenInDB.user.name,
                    email: tokenInDB.user.email
                }
            };
        } catch (error) {
            if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
                throw new UnauthorizedException("Invalid or expired token");
            }
            throw error;
        }
    }

    async revokeToken(token: string): Promise<void> {
        await this.prismaDB.token.deleteMany({
            where: { refresh_token: token }
        });
    }

    async cleanExpiredTokens(): Promise<void> {
        await this.prismaDB.token.deleteMany({
            where: {
                expires_at: {
                    lt: new Date()
                }
            }
        });
    }
}
