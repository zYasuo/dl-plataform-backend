import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { UserModule } from "src/user/user.module";
import { AuthService } from "./auth.service";
import { PrismaModule } from "src/db-module/prisma.module";
import { AuthController } from "./auth.controller";

@Module({
    imports: [
        PrismaModule,
        UserModule,
        JwtModule.register({
            secret: "minha-chave-secreta",
            signOptions: { expiresIn: "1h" }
        })
    ],
    controllers: [AuthController],
    providers: [AuthService],
    exports: [AuthService]
})
export class AuthModule {}
