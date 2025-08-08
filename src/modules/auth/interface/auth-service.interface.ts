import { AuthDTO } from "../dto/auth.dto";
import { IAuthResponse } from "./auth-response.interface";
import { ITokenValidationResult } from "./jwt-payload.interface";

export interface IAuthService {
    login(data: AuthDTO): Promise<IAuthResponse>;
    validateToken(token: string): Promise<ITokenValidationResult>;
    revokeToken(token: string): Promise<void>;
}
