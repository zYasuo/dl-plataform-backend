import { user } from "@prisma/client";
import { CreateUserDTO } from "../dto/user-create.dto";
import { IUser, IUserResonse } from "./user-response.interface";

export interface IUserService {
    create(data: CreateUserDTO): Promise<IUserResonse>;
    checkEmail(email: string): Promise<boolean>;
    profileUser(email: string): Promise<IUser | null>;
    searchUserByEmail(email: string): Promise<user | null>;
}
