export interface IAuthResponse {
    access_token: string;
    user: {
        id: string;
        name: string;
        email: string;
        image?: string;
    };
    expires_in: string;
    token_type: string;
}