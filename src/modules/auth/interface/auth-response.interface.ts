export interface IAuthResponse {
    access_token: string;
    refresh_token: string;
    user: {
        id: string;
        name: string;
        email: string;
        image?: string;
    };
    expires_in: number;
    token_type: string;
}