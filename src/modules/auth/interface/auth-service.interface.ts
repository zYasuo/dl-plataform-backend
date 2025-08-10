import { CreateUserDTO } from "../../user/dto/user-create.dto";
import { IAuthResponse } from "./auth-response.interface";
import { ITokenValidationResult } from "./jwt-payload.interface";
import { AuthDTO, VerifyEmailDTO, AuthHeaderDTO, RefreshTokenDTO } from "../dto/auth.dto";

export interface IAuthService {
    signup(data: CreateUserDTO): Promise<{ message: string }>;
    signin(data: AuthDTO): Promise<IAuthResponse>;
    verifyEmail(data: VerifyEmailDTO): Promise<boolean>;
    resendVerificationEmail(email: string): Promise<boolean>;
    validateToken(data: AuthHeaderDTO): Promise<ITokenValidationResult>;
    refreshAccessToken(refreshTokenDto: RefreshTokenDTO): Promise<{ access_token: string; expires_in: number }>;
    revokeToken(token: string): Promise<void>;
    logout(refreshToken: string): Promise<void>;
    logoutAllDevices(userId: string): Promise<void>;
    cleanExpiredTokens(): Promise<void>;
}