import { JWTAuthGuard } from "src/common/guards/jwt-auth.guard";
import { CreateUserDTO } from "../user/dto/user-create.dto";
import type { IAuthService } from "./interface/auth-service.interface";
import { AuthDTO, AuthHeaderDTO, VerifyEmailDTO } from "./dto/auth.dto";
import { Post, Controller, Body, UsePipes, ValidationPipe, Inject, Get, UseGuards, Headers } from "@nestjs/common";

@Controller("auth")
export class AuthController {
    constructor(
        @Inject("IAuthService")
        private readonly authService: IAuthService
    ) {}

    @Post("/sign-up")
    @UsePipes(new ValidationPipe())
    async signup(@Body() data: CreateUserDTO) {
        return this.authService.signup(data);
    }

    @Post("/sign-in")
    @UsePipes(new ValidationPipe())
    async login(@Body() data: AuthDTO) {
        return this.authService.signin(data);
    }

    @Get("/validate")
    @UseGuards(JWTAuthGuard)
    async validateToken(@Headers("authorization") data: AuthHeaderDTO) {
        return this.authService.validateToken(data);
    }

    @Post("/logout")
    @UseGuards(JWTAuthGuard)
    async logout(@Headers("authorization") header: AuthHeaderDTO) {
        const token = header?.authorization?.replace("Bearer ", "");
        await this.authService.revokeToken(token);
        return { message: "Logged out successfully" };
    }

    @Post("/verify-email")
    async verifyEmail(@Body() data: VerifyEmailDTO) {
        return this.authService.verifyEmail(data);
    }

    @Post("/resend-verification")
    async resendVerification(@Body() { email }: { email: string }) {
        return this.authService.resendVerificationEmail(email);
    }
}
