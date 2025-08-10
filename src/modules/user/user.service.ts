import * as argon2 from "argon2";
import { IUserService } from "./interfaces/user-service.interface";
import { CreateUserDTO } from "./dto/user-create.dto";
import { PrismaClient, user } from "@prisma/client";
import { IUserResonse, IUser } from "./interfaces/user-response.interface";
import { Inject, Injectable, BadRequestException, InternalServerErrorException } from "@nestjs/common";
@Injectable()
export class UserService implements IUserService {
    constructor(@Inject("PRISMA_CLIENT") private prismaDB: PrismaClient) {}

    async create(data: CreateUserDTO): Promise<IUserResonse> {
        const emailExists = await this.checkEmail(data.email);

        if (emailExists) {
            throw new BadRequestException("Email already used");
        }

        const hashedPassword = await this.hashPassword(data.password);

        const { name, email } = data;

        const createUser = await this.prismaDB.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                email_verified: false
            }
        });

        if (!createUser) {
            throw new InternalServerErrorException("Internal Error");
        }

        const responseData: IUser = {
            name: createUser.name,
            email: createUser.email
        };

        return {
            message: "User created successfully",
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
            return null;
        }

        return {
            email: user.email,
            name: user.name
        };
    }

    async searchUserByEmail(email: string): Promise<user | null> {
        return await this.prismaDB.user.findUnique({
            where: { email: email }
        });
    }

    async updateEmailVerification(email: string, verified: boolean): Promise<void> {
        await this.prismaDB.user.update({
            where: { email },
            data: { email_verified: verified }
        });
    }
}
