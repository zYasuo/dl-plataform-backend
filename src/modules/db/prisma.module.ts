import { Module } from "@nestjs/common";
import { prismaDB } from "../../lib/db/conection.db";
import { PrismaServiceConnection } from "./prisma.service";

@Module({
    providers: [{ provide: "PRISMA_CLIENT", useValue: prismaDB }, PrismaServiceConnection],
    exports: ["PRISMA_CLIENT", PrismaServiceConnection]
})
export class PrismaModule {}
