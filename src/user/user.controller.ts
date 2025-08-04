import { User } from "@prisma/client";
import { UserService } from "./user.service";
import { IUserResonse } from "./dto/user-response.interface";
import { CreateUserDTO } from "./dto/user-create.dto";
import { Controller, Post, Body, UsePipes, ValidationPipe, Get, Query } from "@nestjs/common";

@Controller("user")
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Post("/create")
    @UsePipes(new ValidationPipe())
    async create(@Body() data: CreateUserDTO): Promise<IUserResonse> {
        return this.userService.create(data);
    }

    @Get("/search")
    @UsePipes(new ValidationPipe())
    async searchByEmail(@Query("email") email: string): Promise<User | null> {
        return this.userService.searchUserByEmail(email);
    }
}
