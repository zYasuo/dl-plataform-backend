export interface ICreateJWT {
    name: string | null;
    email: string;
    sub: string;
    iat?: number;
    exp?: number;
}
export interface ICreateTokenDB {
    user_id: string;
    refresh_token: string;
    expires_at: Date;
}
export interface ITokenValidationResult {
    valid: boolean;
    payload: ICreateJWT;
    user?: {
        id: string;
        name: string;
        email: string;
    };
}
