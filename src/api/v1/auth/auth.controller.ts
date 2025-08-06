import { AuthDTO } from "./dto/auth.dto";
import type { IAuthService } from "./auth.service";
import { Post, Controller, Body, UsePipes, ValidationPipe, UseGuards } from "@nestjs/common";

@Controller("auth")
export class AuthController {
    constructor(private readonly authService: IAuthService) {}

    @Post("/login")
    @UsePipes(new ValidationPipe())
    async login(@Body() data: AuthDTO) {
        return this.authService.login(data);
    }
}
