import { Module } from "@nestjs/common";
import { UserService } from "./user.service";
import { PrismaModule } from "src/db/prisma.module";
import { UserController } from "./user.controller";

@Module({
    imports: [PrismaModule],
    providers: [UserService],
    controllers: [UserController],
    exports: [UserService]
})
export class UserModule {}
