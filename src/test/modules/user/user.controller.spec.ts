import { IUserService } from "../../../modules/user/user.service";
import { JWTAuthGuard } from "../../../common/guards/jwt-auth.guard";
import { CreateUserDTO } from "../../../modules/user/dto/user-create.dto";
import { UserController } from "../../../modules/user/user.controller";
import { Test, TestingModule } from "@nestjs/testing";
import { BadRequestException, NotFoundException } from "@nestjs/common";

describe("UserController", () => {
    let controller: UserController;
    let userService: jest.Mocked<IUserService>;

    const mockUserService = {
        create: jest.fn(),
        checkEmail: jest.fn(),
        profileUser: jest.fn(),
        searchUserByEmail: jest.fn()
    } as jest.Mocked<IUserService>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [UserController],
            providers: [
                {
                    provide: "IUserService",
                    useValue: mockUserService
                }
            ]
        })
            .overrideGuard(JWTAuthGuard)
            .useValue({ canActivate: jest.fn(() => true) })
            .compile();

        controller = module.get<UserController>(UserController);
        userService = module.get("IUserService");
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("Controller Definition", () => {
        it("should be defined", () => {
            expect(controller).toBeDefined();
        });

        it("should have userService injected", () => {
            expect(controller["userService"]).toBe(userService);
        });
    });

    describe("POST /user/create", () => {
        const createUserDto: CreateUserDTO = {
            email: "test@example.com",
            name: "Test User",
            password: "password123"
        };

        const mockUserResponse = {
            message: "User created sucess",
            data: {
                id: "1",
                email: "test@example.com",
                name: "Test User",
                password: "hashedPassword",
                createdAt: new Date(),
                updatedAt: new Date()
            }
        };

        it("should create a user successfully", async () => {
            userService.create.mockResolvedValue(mockUserResponse);

            const result = await controller.create(createUserDto);

            expect(userService.create).toHaveBeenCalledWith(createUserDto);
            expect(userService.create).toHaveBeenCalledTimes(1);
            expect(result).toEqual(mockUserResponse);
        });

        it("should handle BadRequestException when email already exists", async () => {
            const error = new BadRequestException("Email already used");
            userService.create.mockRejectedValue(error);

            await expect(controller.create(createUserDto)).rejects.toThrow(new BadRequestException("Email already used"));

            expect(userService.create).toHaveBeenCalledWith(createUserDto);
            expect(userService.create).toHaveBeenCalledTimes(1);
        });

        it("should handle validation errors", async () => {
            const invalidDto = {
                email: "invalid-email",
                name: "",
                password: "123"
            } as CreateUserDTO;

            const error = new BadRequestException("Validation failed");
            userService.create.mockRejectedValue(error);

            await expect(controller.create(invalidDto)).rejects.toThrow(new BadRequestException("Validation failed"));
        });

        it("should handle internal server errors", async () => {
            const error = new Error("Internal server error");
            userService.create.mockRejectedValue(error);

            await expect(controller.create(createUserDto)).rejects.toThrow("Internal server error");
        });
    });

    describe("GET /user/profile", () => {
        const email = "test@example.com";
        const mockUserProfile = {
            email: "test@example.com",
            name: "Test User"
        };

        it("should get user profile successfully", async () => {
            userService.profileUser.mockResolvedValue(mockUserProfile);

            const result = await controller.getUserProfile(email);

            expect(userService.profileUser).toHaveBeenCalledWith(email);
            expect(userService.profileUser).toHaveBeenCalledTimes(1);
            expect(result).toEqual(mockUserProfile);
        });

        it("should return null when user not found", async () => {
            userService.profileUser.mockResolvedValue(null);

            const result = await controller.getUserProfile(email);

            expect(userService.profileUser).toHaveBeenCalledWith(email);
            expect(result).toBeNull();
        });

        it("should handle NotFoundException", async () => {
            const error = new NotFoundException("User not found.");
            userService.profileUser.mockRejectedValue(error);

            await expect(controller.getUserProfile(email)).rejects.toThrow(new NotFoundException("User not found."));

            expect(userService.profileUser).toHaveBeenCalledWith(email);
        });

        it("should handle empty email parameter", async () => {
            const emptyEmail = "";
            const error = new BadRequestException("Email parameter is required");
            userService.profileUser.mockRejectedValue(error);

            await expect(controller.getUserProfile(emptyEmail)).rejects.toThrow(BadRequestException);
        });

        it("should handle invalid email format", async () => {
            const invalidEmail = "invalid-email-format";
            const error = new BadRequestException("Invalid email format");
            userService.profileUser.mockRejectedValue(error);

            await expect(controller.getUserProfile(invalidEmail)).rejects.toThrow(BadRequestException);
        });
    });

    describe("Guard Protection", () => {
        it("should protect /profile endpoint with JWTAuthGuard", () => {
            const guardMetadata = Reflect.getMetadata("__guards__", controller.getUserProfile);
            expect(guardMetadata).toBeDefined();
        });
    });

    describe("Validation Pipes", () => {
        it("should apply ValidationPipe to create endpoint", () => {
            const pipesMetadata = Reflect.getMetadata("__pipes__", controller.create);
            expect(pipesMetadata).toBeDefined();
        });

        it("should apply ValidationPipe to getUserProfile endpoint", () => {
            const pipesMetadata = Reflect.getMetadata("__pipes__", controller.getUserProfile);
            expect(pipesMetadata).toBeDefined();
        });
    });
});
