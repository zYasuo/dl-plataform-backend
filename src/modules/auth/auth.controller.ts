import { AuthDTO } from "./dto/auth.dto";
import type { IAuthService } from "./interface/auth-service.interface";
import { Post, Controller, Body, UsePipes, ValidationPipe, Inject } from "@nestjs/common";

@Controller("auth")
export class AuthController {
    constructor(
        @Inject("IAuthService")
        private readonly authService: IAuthService
    ) {}

    @Post("/login")
    @UsePipes(new ValidationPipe())
    async login(@Body() data: AuthDTO) {
        return this.authService.login(data);
    }
}
