import { AuthDTO } from "../dto/auth.dto";
import { IAuthResponse } from "./auth-response.interface";

export interface IAuthService {
    login(data: AuthDTO): Promise<IAuthResponse>;
    validateToken(token: string);
}

