import { AuthDTO } from "./dto/auth.dto";
import { AuthService } from "./auth.service";
import { Post, Controller, Body, UsePipes, ValidationPipe } from "@nestjs/common";

@Controller("auth")
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post("/login")
    @UsePipes(new ValidationPipe())
    async login(@Body() data: AuthDTO) {
        return this.authService.createAccessToken(data);
    }
}
