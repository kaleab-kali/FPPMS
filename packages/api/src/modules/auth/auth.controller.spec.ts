import { Test, type TestingModule } from "@nestjs/testing";

jest.mock("uuid", () => ({
	v4: jest.fn(() => "mock-uuid-v4"),
}));

import { AuthController } from "#api/modules/auth/auth.controller";
import { AuthService } from "#api/modules/auth/auth.service";

const MOCK_USER_ID = "user-123";
const MOCK_TENANT_ID = "tenant-123";

const mockLoginUser = {
	id: MOCK_USER_ID,
	username: "testuser",
	tenantId: MOCK_TENANT_ID,
	centerId: undefined,
	roles: ["IT_ADMIN"],
	permissions: ["users.read.all"],
	requirePasswordChange: false,
};

const mockAuthService = {
	login: jest.fn(),
	getProfile: jest.fn(),
	changePassword: jest.fn(),
	resetPassword: jest.fn(),
};

describe("AuthController", () => {
	let controller: AuthController;
	let authService: typeof mockAuthService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [AuthController],
			providers: [{ provide: AuthService, useValue: mockAuthService }],
		}).compile();

		controller = module.get<AuthController>(AuthController);
		authService = module.get(AuthService);

		jest.clearAllMocks();
	});

	describe("login", () => {
		it("should return login response with token", async () => {
			const expectedResponse = {
				accessToken: "mock-token",
				user: mockLoginUser,
			};
			authService.login.mockResolvedValue(expectedResponse);

			const result = await controller.login({ user: mockLoginUser }, { username: "testuser", password: "password" });

			expect(result).toEqual(expectedResponse);
			expect(authService.login).toHaveBeenCalledWith(mockLoginUser);
		});
	});

	describe("getProfile", () => {
		it("should return user profile", async () => {
			authService.getProfile.mockResolvedValue(mockLoginUser);

			const result = await controller.getProfile({
				id: MOCK_USER_ID,
				username: "testuser",
				tenantId: MOCK_TENANT_ID,
				roles: ["IT_ADMIN"],
				permissions: [],
			});

			expect(result).toEqual(mockLoginUser);
			expect(authService.getProfile).toHaveBeenCalledWith(MOCK_USER_ID);
		});
	});

	describe("changePassword", () => {
		it("should change password successfully", async () => {
			const dto = {
				currentPassword: "old",
				newPassword: "new123",
				confirmPassword: "new123",
			};
			authService.changePassword.mockResolvedValue({ message: "Password changed successfully" });

			const result = await controller.changePassword(
				{ id: MOCK_USER_ID, username: "testuser", tenantId: MOCK_TENANT_ID, roles: [], permissions: [] },
				dto,
			);

			expect(result.message).toBe("Password changed successfully");
			expect(authService.changePassword).toHaveBeenCalledWith(MOCK_USER_ID, dto);
		});
	});

	describe("resetPassword", () => {
		it("should reset password successfully", async () => {
			const dto = { newPassword: "new123", confirmPassword: "new123" };
			authService.resetPassword.mockResolvedValue({ message: "Password reset successfully" });

			const result = await controller.resetPassword("target-user-id", dto, {
				id: MOCK_USER_ID,
				username: "admin",
				tenantId: MOCK_TENANT_ID,
				roles: ["IT_ADMIN"],
				permissions: [],
			});

			expect(result.message).toBe("Password reset successfully");
			expect(authService.resetPassword).toHaveBeenCalledWith("target-user-id", dto, MOCK_USER_ID);
		});
	});
});
