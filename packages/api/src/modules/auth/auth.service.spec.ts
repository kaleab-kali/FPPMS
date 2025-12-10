import { BadRequestException, ForbiddenException, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Test, type TestingModule } from "@nestjs/testing";
import * as hashUtil from "#api/common/utils/hash.util";
import { PrismaService } from "#api/database/prisma.service";

jest.mock("uuid", () => ({
	v4: jest.fn(() => "mock-uuid-v4"),
}));

const { AuthService } = jest.requireActual("#api/modules/auth/auth.service") as {
	AuthService: new (...args: unknown[]) => unknown;
};

const MOCK_USER_ID = "user-123";
const MOCK_TENANT_ID = "tenant-123";
const MOCK_ROLE_ID = "role-123";
const MOCK_PERMISSION_ID = "perm-123";

const mockUser = {
	id: MOCK_USER_ID,
	username: "testuser",
	email: "test@example.com",
	passwordHash: "hashed-password",
	passwordSalt: "bcrypt",
	status: "ACTIVE",
	tenantId: MOCK_TENANT_ID,
	centerId: null,
	mustChangePassword: false,
	failedLoginAttempts: 0,
	lockedUntil: null,
	lastLoginAt: null,
	passwordChangedAt: null,
	deletedAt: null,
	createdAt: new Date(),
	updatedAt: new Date(),
	tenant: { id: MOCK_TENANT_ID, name: "Test Tenant", code: "TEST" },
	center: null,
	userRoles: [
		{
			role: {
				id: MOCK_ROLE_ID,
				code: "IT_ADMIN",
				name: "IT Administrator",
				rolePermissions: [
					{
						permission: {
							id: MOCK_PERMISSION_ID,
							module: "users",
							action: "read",
							resource: "all",
						},
					},
				],
			},
		},
	],
};

const mockPrismaService = {
	user: {
		findFirst: jest.fn(),
		findUnique: jest.fn(),
		update: jest.fn(),
		updateMany: jest.fn(),
	},
	loginHistory: {
		create: jest.fn(),
	},
	auditLog: {
		create: jest.fn(),
	},
};

const mockJwtService = {
	sign: jest.fn().mockReturnValue("mock-jwt-token"),
};

describe("AuthService", () => {
	let service: AuthService;
	let prisma: typeof mockPrismaService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				AuthService,
				{ provide: PrismaService, useValue: mockPrismaService },
				{ provide: JwtService, useValue: mockJwtService },
			],
		}).compile();

		service = module.get<AuthService>(AuthService);
		prisma = module.get(PrismaService);

		jest.clearAllMocks();
	});

	describe("validateUser", () => {
		it("should return user data when credentials are valid", async () => {
			prisma.user.findFirst.mockResolvedValue(mockUser);
			jest.spyOn(hashUtil, "comparePassword").mockResolvedValue(true);
			prisma.user.update.mockResolvedValue(mockUser);
			prisma.loginHistory.create.mockResolvedValue({});

			const result = await service.validateUser("testuser", "password123");

			expect(result).toBeDefined();
			expect(result?.username).toBe("testuser");
			expect(result?.roles).toContain("IT_ADMIN");
			expect(result?.permissions).toContain("users.read.all");
		});

		it("should return undefined when user not found", async () => {
			prisma.user.findFirst.mockResolvedValue(null);

			const result = await service.validateUser("nonexistent", "password");

			expect(result).toBeUndefined();
		});

		it("should throw ForbiddenException when account is locked", async () => {
			prisma.user.findFirst.mockResolvedValue({ ...mockUser, status: "LOCKED" });

			await expect(service.validateUser("testuser", "password")).rejects.toThrow(ForbiddenException);
		});

		it("should throw ForbiddenException when account is inactive", async () => {
			prisma.user.findFirst.mockResolvedValue({ ...mockUser, status: "INACTIVE" });

			await expect(service.validateUser("testuser", "password")).rejects.toThrow(ForbiddenException);
		});

		it("should return undefined and increment failed attempts on wrong password", async () => {
			prisma.user.findFirst.mockResolvedValue(mockUser);
			prisma.user.findUnique.mockResolvedValue(mockUser);
			jest.spyOn(hashUtil, "comparePassword").mockResolvedValue(false);
			prisma.user.update.mockResolvedValue(mockUser);
			prisma.loginHistory.create.mockResolvedValue({});

			const result = await service.validateUser("testuser", "wrongpassword");

			expect(result).toBeUndefined();
			expect(prisma.user.update).toHaveBeenCalled();
		});
	});

	describe("login", () => {
		it("should return access token and user data", async () => {
			const loginUser = {
				id: MOCK_USER_ID,
				username: "testuser",
				tenantId: MOCK_TENANT_ID,
				centerId: undefined,
				roles: ["IT_ADMIN"],
				permissions: ["users.read.all"],
				requirePasswordChange: false,
			};

			const result = await service.login(loginUser);

			expect(result.accessToken).toBe("mock-jwt-token");
			expect(result.user).toEqual(loginUser);
			expect(mockJwtService.sign).toHaveBeenCalled();
		});
	});

	describe("changePassword", () => {
		const changePasswordDto = {
			currentPassword: "oldPassword",
			newPassword: "newPassword123",
			confirmPassword: "newPassword123",
		};

		it("should change password successfully", async () => {
			prisma.user.findUnique.mockResolvedValue(mockUser);
			jest.spyOn(hashUtil, "comparePassword").mockResolvedValue(true);
			jest.spyOn(hashUtil, "hashPassword").mockResolvedValue("new-hashed-password");
			prisma.user.update.mockResolvedValue(mockUser);

			const result = await service.changePassword(MOCK_USER_ID, changePasswordDto);

			expect(result.message).toBe("Password changed successfully");
		});

		it("should throw BadRequestException when passwords do not match", async () => {
			const dto = { ...changePasswordDto, confirmPassword: "different" };

			await expect(service.changePassword(MOCK_USER_ID, dto)).rejects.toThrow(BadRequestException);
		});

		it("should throw UnauthorizedException when user not found", async () => {
			prisma.user.findUnique.mockResolvedValue(null);

			await expect(service.changePassword(MOCK_USER_ID, changePasswordDto)).rejects.toThrow(UnauthorizedException);
		});

		it("should throw BadRequestException when current password is incorrect", async () => {
			prisma.user.findUnique.mockResolvedValue(mockUser);
			jest.spyOn(hashUtil, "comparePassword").mockResolvedValue(false);

			await expect(service.changePassword(MOCK_USER_ID, changePasswordDto)).rejects.toThrow(BadRequestException);
		});
	});

	describe("resetPassword", () => {
		const resetPasswordDto = {
			newPassword: "newPassword123",
			confirmPassword: "newPassword123",
		};

		it("should reset password successfully", async () => {
			prisma.user.findUnique.mockResolvedValue(mockUser);
			jest.spyOn(hashUtil, "hashPassword").mockResolvedValue("new-hashed-password");
			prisma.user.update.mockResolvedValue(mockUser);
			prisma.auditLog.create.mockResolvedValue({});

			const result = await service.resetPassword(MOCK_USER_ID, resetPasswordDto, "admin-123");

			expect(result.message).toContain("Password reset successfully");
		});

		it("should throw BadRequestException when passwords do not match", async () => {
			const dto = { ...resetPasswordDto, confirmPassword: "different" };

			await expect(service.resetPassword(MOCK_USER_ID, dto, "admin-123")).rejects.toThrow(BadRequestException);
		});

		it("should throw BadRequestException when user not found", async () => {
			prisma.user.findUnique.mockResolvedValue(null);

			await expect(service.resetPassword(MOCK_USER_ID, resetPasswordDto, "admin-123")).rejects.toThrow(
				BadRequestException,
			);
		});
	});

	describe("getProfile", () => {
		it("should return user profile", async () => {
			prisma.user.findUnique.mockResolvedValue(mockUser);

			const result = await service.getProfile(MOCK_USER_ID);

			expect(result.id).toBe(MOCK_USER_ID);
			expect(result.username).toBe("testuser");
			expect(result.roles).toContain("IT_ADMIN");
		});

		it("should throw UnauthorizedException when user not found", async () => {
			prisma.user.findUnique.mockResolvedValue(null);

			await expect(service.getProfile(MOCK_USER_ID)).rejects.toThrow(UnauthorizedException);
		});
	});
});
