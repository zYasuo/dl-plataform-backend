import { IsEmail, IsString, IsNotEmpty, MaxLength, MinLength, IsOptional } from "class-validator";

export class CreateUserDTO {
    @IsNotEmpty({ message: "Field is must contain value" })
    @IsString({ message: "Name is must be string" })
    @MaxLength(46)
    name: string;

    @IsEmail({}, { message: "Email is must be valid" })
    @IsNotEmpty({ message: "Field is must contain value" })
    @IsString({ message: "Name is must be string" })
    email: string;

    @IsString({ message: "Name is must be string" })
    @IsNotEmpty({ message: "Field is must contain value" })
    @MinLength(8)
    @MaxLength(24)
    password: string;

    @IsOptional({ message: "Field is must contain value" })
    email_verified: boolean;
}
