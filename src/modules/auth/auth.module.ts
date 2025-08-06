import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { UserModule } from "../user/user.module";
import { AuthService } from "./auth.service";
import { JWTStrategy } from "../../common/jwt.strategy";
import { PrismaModule } from "src/modules/db/prisma.module";
import { AuthController } from "./auth.controller";

@Module({
    imports: [
        PrismaModule,
        UserModule,
        JwtModule.register({
            secret: process.env.JWT_SECRET_KEY,
            signOptions: { expiresIn: "5h" }
        })
    ],
    controllers: [AuthController],
    providers: [
        AuthService,
        JWTStrategy,
        {
            provide: "IAuthService",
            useClass: AuthService
        }
    ],
    exports: [AuthService]
})
export class AuthModule {}
