import { IUser } from "./interfaces/user-response.interface";
import { JWTAuthGuard } from "../../common/guards/jwt-auth.guard";
import type { IUserService } from "./interfaces/user-service.interface";
import { Controller, UsePipes, ValidationPipe, Get, Query, UseGuards, Inject } from "@nestjs/common";

@Controller("user")
export class UserController {
    constructor(
        @Inject("IUserService")
        private readonly userService: IUserService
    ) {}

    @Get("/profile")
    @UseGuards(JWTAuthGuard)
    @UsePipes(new ValidationPipe())
    async getUserProfile(@Query("email") email: string): Promise<IUser | null> {
        return this.userService.profileUser(email);
    }
}
