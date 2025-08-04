import { User } from "@prisma/client";

export interface IUserResonse {
    message: string;
    data: User;
}
