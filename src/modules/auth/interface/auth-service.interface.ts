import { AuthDTO } from "../dto/auth.dto";
import { CreateUserDTO } from "../../user/dto/user-create.dto";
import { IAuthResponse } from "./auth-response.interface";
import { ITokenValidationResult } from "./jwt-payload.interface";

export interface IAuthService {
    register(data: CreateUserDTO): Promise<{ message: string }>;
    login(data: AuthDTO): Promise<IAuthResponse>;
    verifyEmail(token: string): Promise<{ message: string }>;
    resendVerificationEmail(email: string): Promise<{ message: string }>;
    validateToken(token: string): Promise<ITokenValidationResult>;
    revokeToken(token: string): Promise<void>;
    cleanExpiredTokens(): Promise<void>;
}
