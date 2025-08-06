import type { IUserService } from "./user.service";
import { JWTAuthGuard } from "../auth/jwt/jwt-auth.guard";
import { CreateUserDTO } from "./dto/user-create.dto";
import { IUser, IUserResonse } from "./dto/user-response.interface";
import { Controller, Post, Body, UsePipes, ValidationPipe, Get, Query, UseGuards, Request, Inject } from "@nestjs/common";

@Controller("user")
export class UserController {
    constructor(
        @Inject("IUserService")
        private readonly userService: IUserService
    ) {}

    @Post("/create")
    @UsePipes(new ValidationPipe())
    async create(@Body() data: CreateUserDTO): Promise<IUserResonse> {
        return this.userService.create(data);
    }

    @Get("/profile")
    @UseGuards(JWTAuthGuard)
    @UsePipes(new ValidationPipe())
    async getUserProfile(@Query("email") email: string): Promise<IUser | null> {
        return this.userService.profileUser(email);
    }
}
