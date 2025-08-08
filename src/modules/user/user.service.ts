import * as argon2 from "argon2";
import { IUserService } from "./interfaces/user-service.interface";
import { CreateUserDTO } from "./dto/user-create.dto";
import type { IEmailService } from "../email/interface/email-service.interface";
import { PrismaClient, user } from "@prisma/client";
import { IUserResonse, IUser } from "./interfaces/user-response.interface";
import { Inject, Injectable, BadRequestException, NotFoundException, InternalServerErrorException } from "@nestjs/common";
@Injectable()
export class UserService implements IUserService {
    constructor(
        @Inject("PRISMA_CLIENT") private prismaDB: PrismaClient,
        @Inject("IEmailService") private emailService: IEmailService
    ) {}

    async create(data: CreateUserDTO): Promise<IUserResonse> {
        const emailExists = await this.checkEmail(data.email);

        if (emailExists) {
            throw new BadRequestException("Email already used");
        }

        const hashedPassword = await this.hashPassword(data.password);

        const newData: CreateUserDTO = {
            ...data,
            password: hashedPassword
        };

        const createUser = await this.prismaDB.user.create({ data: newData });
        if (!createUser) {
            throw new InternalServerErrorException("Internal Error");
        }

        const { email, name } = createUser;

        const emailResponse = await this.emailService.sendWelcomeEmail(email, name!);
        console.log(emailResponse);

        const responseData: IUser = {
            name: name,
            email: email
        };
        return {
            message: "User created sucess",
            data: responseData
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

    async searchUserByEmail(email: string): Promise<user | null> {
        const user = await this.prismaDB.user.findUnique({
            where: { email: email }
        });

        if (!user) {
            throw new NotFoundException("User not found.");
        }

        return user;
    }
}
