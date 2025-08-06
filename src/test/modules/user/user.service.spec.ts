import * as argon2 from "argon2";
import { UserService, type IUserService } from "../../../modules/user/user.service";
import { CreateUserDTO } from "../../../modules/user/dto/user-create.dto";
import { Test, TestingModule } from "@nestjs/testing";
import { BadRequestException, NotFoundException } from "@nestjs/common";

jest.mock("argon2");
const mockedArgon2 = argon2 as jest.Mocked<typeof argon2>;

describe("UserService", () => {
    let service: IUserService;
    let prismaClient: any;

    const mockPrismaClient = {
        user: {
            create: jest.fn(),
            findUnique: jest.fn()
        }
    } as any;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                {
                    provide: "IUserService",
                    useClass: UserService
                },
                {
                    provide: "PRISMA_CLIENT",
                    useValue: mockPrismaClient
                }
            ]
        }).compile();

        service = module.get<IUserService>("IUserService");
        prismaClient = module.get("PRISMA_CLIENT");
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("Service Definition", () => {
        it("should be defined", () => {
            expect(service).toBeDefined();
        });

        it("should be instance of UserService", () => {
            expect(service).toBeInstanceOf(UserService);
        });
    });
    describe("create", () => {
        const createUserDto: CreateUserDTO = {
            email: "test@example.com",
            name: "Test User",
            password: "password123"
        };

        const mockUser = {
            id: "1",
            email: "test@example.com",
            name: "Test User",
            password: "hashedPassword",
            createdAt: new Date(),
            updatedAt: new Date()
        };

        beforeEach(() => {
            mockedArgon2.hash.mockResolvedValue("hashedPassword");
        });

        it("should create a user successfully", async () => {
            mockPrismaClient.user.findUnique.mockResolvedValue(null);
            mockPrismaClient.user.create.mockResolvedValue(mockUser);

            const result = await service.create(createUserDto);

            expect(mockPrismaClient.user.findUnique).toHaveBeenCalledWith({
                where: { email: createUserDto.email }
            });
            expect(mockedArgon2.hash).toHaveBeenCalledWith("password123", {
                type: argon2.argon2id,
                memoryCost: 2 ** 16,
                timeCost: 3,
                parallelism: 1
            });
            expect(mockPrismaClient.user.create).toHaveBeenCalledWith({
                data: {
                    ...createUserDto,
                    password: "hashedPassword"
                }
            });
            expect(result).toEqual({
                message: "User created sucess",
                data: mockUser
            });
        });

        it("should throw BadRequestException when email already exists", async () => {
            mockPrismaClient.user.findUnique.mockResolvedValue(mockUser);

            await expect(service.create(createUserDto)).rejects.toThrow(new BadRequestException("Email already used"));

            expect(mockPrismaClient.user.findUnique).toHaveBeenCalledWith({
                where: { email: createUserDto.email }
            });
            expect(mockPrismaClient.user.create).not.toHaveBeenCalled();
        });

        it("should throw error when Prisma create fails", async () => {
            mockPrismaClient.user.findUnique.mockResolvedValue(null);
            const error = new Error("Database error");
            mockPrismaClient.user.create.mockRejectedValue(error);

            await expect(service.create(createUserDto)).rejects.toThrow("Database error");
        });
    });

    describe("checkEmail", () => {
        const email = "test@example.com";

        it("should return true when email exists", async () => {
            const mockUser = { id: "1", email, name: "Test" };
            mockPrismaClient.user.findUnique.mockResolvedValue(mockUser);

            const result = await service.checkEmail(email);

            expect(mockPrismaClient.user.findUnique).toHaveBeenCalledWith({
                where: { email }
            });
            expect(result).toBe(true);
        });

        it("should return false when email does not exist", async () => {
            mockPrismaClient.user.findUnique.mockResolvedValue(null);

            const result = await service.checkEmail(email);

            expect(mockPrismaClient.user.findUnique).toHaveBeenCalledWith({
                where: { email }
            });
            expect(result).toBe(false);
        });
    });

    describe("profileUser", () => {
        const email = "test@example.com";
        const mockUser = {
            id: "1",
            email: "test@example.com",
            name: "Test User",
            password: "hashedPassword",
            createdAt: new Date(),
            updatedAt: new Date()
        };

        it("should return user profile when user exists", async () => {
            mockPrismaClient.user.findUnique.mockResolvedValue(mockUser);

            const result = await service.profileUser(email);

            expect(mockPrismaClient.user.findUnique).toHaveBeenCalledWith({
                where: { email }
            });
            expect(result).toEqual({
                email: mockUser.email,
                name: mockUser.name
            });
        });

        it("should throw NotFoundException when user does not exist", async () => {
            mockPrismaClient.user.findUnique.mockResolvedValue(null);

            await expect(service.profileUser(email)).rejects.toThrow(new NotFoundException("User not found."));

            expect(mockPrismaClient.user.findUnique).toHaveBeenCalledWith({
                where: { email }
            });
        });
    });

    describe("searchUserByEmail", () => {
        const email = "test@example.com";
        const mockUser = {
            id: "1",
            email: "test@example.com",
            name: "Test User",
            password: "hashedPassword",
            createdAt: new Date(),
            updatedAt: new Date()
        };

        it("should return user when user exists", async () => {
            mockPrismaClient.user.findUnique.mockResolvedValue(mockUser);

            const result = await service.searchUserByEmail(email);

            expect(mockPrismaClient.user.findUnique).toHaveBeenCalledWith({
                where: { email }
            });
            expect(result).toEqual(mockUser);
        });

        it("should throw NotFoundException when user does not exist", async () => {
            mockPrismaClient.user.findUnique.mockResolvedValue(null);

            await expect(service.searchUserByEmail(email)).rejects.toThrow(new NotFoundException("User not found."));

            expect(mockPrismaClient.user.findUnique).toHaveBeenCalledWith({
                where: { email }
            });
        });
    });
});
