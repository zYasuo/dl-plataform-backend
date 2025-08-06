export interface IUser {
    name: string | null;
    email: string;
}

export interface IUserResonse {
    message: string;
    data: IUser;
}
