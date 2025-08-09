import { IsNotEmpty, IsString } from "class-validator";

export class AuthDTO {
    @IsNotEmpty({ message: "Field is must contain value" })
    @IsString({ message: "Name is must be string" })
    email: string;
    password: string;
}

export class AuthHeaderDTO{
    @IsNotEmpty({ message: "Field is must contain value" })
    @IsString({ message: "Name is must be string" })
    authorization: string;
}

export class VerifyEmailDTO {
    @IsNotEmpty({ message: "Field is must contain value" })
    @IsString({ message: "Name is must be string" })
    token: string;
}

export class RefreshTokenDTO {
    @IsNotEmpty({ message: "Field is must contain value" })
    @IsString({ message: "Refresh token is must be string" })
    refresh_token: string;
}