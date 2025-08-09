import { CreateUserDTO } from "../../user/dto/user-create.dto";
import { IAuthResponse } from "./auth-response.interface";
import { ITokenValidationResult } from "./jwt-payload.interface";
import { AuthDTO, VerifyEmailDTO, AuthHeaderDTO } from "../dto/auth.dto";

export interface IAuthService {
    register(data: CreateUserDTO): Promise<{ message: string }>;
    login(data: AuthDTO): Promise<IAuthResponse>;
    verifyEmail(data: VerifyEmailDTO): Promise<boolean>;
    resendVerificationEmail(email: string): Promise<boolean>;
    validateToken(data: AuthHeaderDTO): Promise<ITokenValidationResult>;
    revokeToken(data: string): Promise<void>;
    cleanExpiredTokens(): Promise<void>;
}
