import { Module } from "@nestjs/common";
import { UserService } from "./user.service";
import { PrismaModule } from "../db/prisma.module";
import { UserController } from "./user.controller";

@Module({
    imports: [PrismaModule],
    controllers: [UserController],
    providers: [
        {
            provide: "IUserService",
            useClass: UserService
        }
    ],
    exports: ["IUserService"]
})
export class UserModule {}
