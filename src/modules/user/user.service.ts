import * as argon2 from "argon2";
import { CreateUserDTO } from "./dto/user-create.dto";
import { PrismaClient, User } from "@prisma/client";
import { IUserResonse, IUser } from "./dto/user-response.interface";
import { Inject, Injectable, BadRequestException, NotFoundException } from "@nestjs/common";

export interface IUserService {
    create(data: CreateUserDTO): Promise<IUserResonse>;
    checkEmail(email: string): Promise<boolean>;
    profileUser(email: string): Promise<IUser | null>;
    searchUserByEmail(email: string): Promise<User | null>;
}

@Injectable()
export class UserService implements IUserService {
    constructor(@Inject("PRISMA_CLIENT") private prismaDB: PrismaClient) {}

    async create(data: CreateUserDTO): Promise<IUserResonse> {
        const emailExists = await this.checkEmail(data.email);

        if (emailExists) {
            throw new BadRequestException("Email already used");
        }

        const hashedPassword = await this.hashPassword(data.password);

        const newData = {
            ...data,
            password: hashedPassword
        } as CreateUserDTO;

        const createUser = await this.prismaDB.user.create({ data: newData });

        return {
            message: "User created sucess",
            data: createUser
        };
    }

    async checkEmail(email: string): Promise<boolean> {
        const user = await this.prismaDB.user.findUnique({
            where: { email }
        });

        return !!user;
    }

    private async hashPassword(password: string): Promise<string> {
        return await argon2.hash(password, {
            type: argon2.argon2id,
            memoryCost: 2 ** 16,
            timeCost: 3,
            parallelism: 1
        });
    }

    async profileUser(email: string): Promise<IUser | null> {
        const user = await this.prismaDB.user.findUnique({
            where: { email: email }
        });

        if (!user) {
            throw new NotFoundException("User not found.");
        }

        const userResponse: IUser = {
            email: user.email,
            name: user.name
        };

        return userResponse;
    }

    async searchUserByEmail(email: string): Promise<User | null> {
        const user = await this.prismaDB.user.findUnique({
            where: { email: email }
        });

        if (!user) {
            throw new NotFoundException("User not found.");
        }

        return user;
    }
}
