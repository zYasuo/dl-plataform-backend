export interface ICreateJWT {
    name: string | null;
    email: string
}
export interface ICreateTokenDB {
    token: string;
    refreshToken: string;
    userId: string;
    expiresAt: Date;
}


