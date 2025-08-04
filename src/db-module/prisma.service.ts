import { PrismaClient } from "@prisma/client";
import { Injectable, OnModuleInit, OnModuleDestroy, Inject } from "@nestjs/common";

@Injectable()
export class PrismaServiceConnection implements OnModuleInit, OnModuleDestroy {
    constructor(@Inject("PRISMA_CLIENT") private readonly _clientDB: PrismaClient) {}

    get client(): PrismaClient {
        return this._clientDB;
    }

    async onModuleInit() {
        await this._clientDB.$connect();
    }

    async onModuleDestroy() {
        await this._clientDB.$disconnect();
    }
}
