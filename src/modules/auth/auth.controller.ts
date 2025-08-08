import { JWTAuthGuard } from "src/common/guards/jwt-auth.guard";
import { CreateUserDTO } from "../user/dto/user-create.dto";
import type { IAuthService } from "./interface/auth-service.interface";
import { AuthDTO, AuthHeader } from "./dto/auth.dto";
import { Post, Controller, Body, UsePipes, ValidationPipe, Inject, Get, UseGuards, Headers } from "@nestjs/common";

@Controller("auth")
export class AuthController {
    constructor(
        @Inject("IAuthService")
        private readonly authService: IAuthService
    ) {}

    @Post("/sign-up")
    @UsePipes(new ValidationPipe())
    async register(@Body() data: CreateUserDTO) {
        return this.authService.register(data);
    }

    @Post("/sign-in")
    @UsePipes(new ValidationPipe())
    async login(@Body() data: AuthDTO) {
        return this.authService.login(data);
    }

    @Get("/validate")
    @UseGuards(JWTAuthGuard)
    async validateToken(@Headers("authorization") header: AuthHeader) {
        const token = header?.authorization?.replace("Bearer ", "");
        return this.authService.validateToken(token);
    }

    @Post("/logout")
    @UseGuards(JWTAuthGuard)
    async logout(@Headers("authorization") header: AuthHeader) {
        const token = header?.authorization?.replace("Bearer ", "");
        await this.authService.revokeToken(token);
        return { message: "Logged out successfully" };
    }

    @Post("/verify-email")
    async verifyEmail(@Body() { token }: { token: string }) {
        return this.authService.verifyEmail(token);
    }

    @Post("/resend-verification")
    async resendVerification(@Body() { email }: { email: string }) {
        return this.authService.resendVerificationEmail(email);
    }
}
