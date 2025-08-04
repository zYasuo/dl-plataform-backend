import { IsNotEmpty, IsString } from "class-validator";

export class AuthDTO {
    @IsNotEmpty({ message: "Field is must contain value" })
    @IsString({ message: "Name is must be string" })
    email: string;
    password: string;
}
