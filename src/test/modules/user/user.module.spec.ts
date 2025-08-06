import { UserModule } from "../../../modules/user/user.module";
import { UserService } from "../../../modules/user/user.service";
import { UserController } from "../../../modules/user/user.controller";
import { Test, TestingModule } from "@nestjs/testing";
import { PrismaServiceConnection } from "../../../modules/db/prisma.service";

describe("UserModule", () => {
    let module: TestingModule;

    const createMockPrismaClient = () => ({
        user: {
            create: jest.fn(),
            findUnique: jest.fn()
        },
        $connect: jest.fn().mockResolvedValue(undefined),
        $disconnect: jest.fn().mockResolvedValue(undefined)
    });

    beforeEach(async () => {
        const mockPrismaClient = createMockPrismaClient();

        module = await Test.createTestingModule({
            imports: [UserModule]
        })
            .overrideProvider("PRISMA_CLIENT")
            .useValue(mockPrismaClient)
            .overrideProvider(PrismaServiceConnection)
            .useValue({
                client: mockPrismaClient,
                onModuleInit: jest.fn(),
                onModuleDestroy: jest.fn()
            })
            .compile();
    });

    afterEach(async () => {
        await module.close();
    });

    describe("Module Compilation", () => {
        it("should compile the module successfully", () => {
            expect(module).toBeDefined();
        });
    });

    describe("Controller Registration", () => {
        it("should register UserController", () => {
            const controller = module.get<UserController>(UserController);

            expect(controller).toBeDefined();
            expect(controller).toBeInstanceOf(UserController);
        });
    });

    describe("Provider Configuration", () => {
        it("should register IUserService provider", () => {
            const service = module.get("IUserService");

            expect(service).toBeDefined();
            expect(service).toBeInstanceOf(UserService);
        });

        it("should export IUserService for other modules", () => {
            expect(() => module.get("IUserService")).not.toThrow();
        });
    });

    describe("Dependency Injection", () => {
        it("should inject IUserService into UserController", () => {
            const controller = module.get<UserController>(UserController);
            const service = module.get("IUserService");

            expect(controller["userService"]).toBe(service);
        });

        it("should inject PRISMA_CLIENT into UserService", () => {
            const service = module.get<UserService>("IUserService");
            const prismaClient = module.get("PRISMA_CLIENT");

            expect(service["prismaDB"]).toBe(prismaClient);
        });
    });

    describe("Module Integration", () => {
        it("should resolve all dependencies without circular references", async () => {
            expect(() => {
                module.get<UserController>(UserController);
                module.get<UserService>("IUserService");
                module.get("PRISMA_CLIENT");
            }).not.toThrow();
        });
    });
});
