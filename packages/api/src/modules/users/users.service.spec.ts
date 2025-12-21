import { BadRequestException, NotFoundException } from "@nestjs/common";
import { Test, type TestingModule } from "@nestjs/testing";
import { UserStatus } from "@prisma/client";
import { PrismaService } from "#api/database/prisma.service";
import { UsersService } from "#api/modules/users/users.service";

const MOCK_TENANT_ID = "tenant-123";
const MOCK_USER_ID = "user-123";
const MOCK_CENTER_ID = "center-123";
const MOCK_ROLE_ID = "role-123";
const MOCK_EMPLOYEE_ID = "employee-123";

const mockUser = {
	id: MOCK_USER_ID,
	tenantId: MOCK_TENANT_ID,
	centerId: MOCK_CENTER_ID,
	employeeId: MOCK_EMPLOYEE_ID,
	username: "testuser",
	email: "test@example.com",
	passwordHash: "hashed-password",
	passwordSalt: "salt",
	status: UserStatus.ACTIVE,
	mustChangePassword: false,
	failedLoginAttempts: 0,
	lockedUntil: null,
	lastLoginAt: null,
	deletedAt: null,
	createdAt: new Date(),
	updatedAt: new Date(),
	userRoles: [
		{
			role: {
				id: MOCK_ROLE_ID,
				code: "HR_OFFICER",
				name: "HR Officer",
			},
		},
	],
};

const mockEmployee = {
	id: MOCK_EMPLOYEE_ID,
	tenantId: MOCK_TENANT_ID,
	centerId: MOCK_CENTER_ID,
	employeeId: "EMP-001",
	email: "employee@example.com",
	firstName: "John",
	middleName: "D",
	lastName: "Doe",
};

const mockPrismaService = {
	user: {
		findFirst: jest.fn(),
		findMany: jest.fn(),
		create: jest.fn(),
		update: jest.fn(),
	},
	center: {
		findFirst: jest.fn(),
	},
	employee: {
		findFirst: jest.fn(),
	},
	role: {
		findMany: jest.fn(),
	},
	userRole: {
		createMany: jest.fn(),
		deleteMany: jest.fn(),
	},
};

describe("UsersService", () => {
	let service: UsersService;
	let prisma: typeof mockPrismaService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [UsersService, { provide: PrismaService, useValue: mockPrismaService }],
		}).compile();

		service = module.get<UsersService>(UsersService);
		prisma = module.get(PrismaService);

		jest.clearAllMocks();
	});

	describe("create", () => {
		const createDto = {
			employeeId: MOCK_EMPLOYEE_ID,
			username: "newuser",
			password: "Password123!",
			roleIds: [MOCK_ROLE_ID],
		};

		it("should create a new user", async () => {
			prisma.employee.findFirst.mockResolvedValue(mockEmployee);
			prisma.user.findFirst.mockResolvedValueOnce(null).mockResolvedValueOnce(null).mockResolvedValueOnce(mockUser);
			prisma.user.create.mockResolvedValue(mockUser);
			prisma.role.findMany.mockResolvedValue([{ id: MOCK_ROLE_ID }]);
			prisma.userRole.createMany.mockResolvedValue({ count: 1 });

			const result = await service.create(MOCK_TENANT_ID, createDto, "admin-123");

			expect(result.username).toBe("testuser");
			expect(prisma.user.create).toHaveBeenCalled();
		});

		it("should throw BadRequestException if employee not found", async () => {
			prisma.employee.findFirst.mockResolvedValue(null);

			await expect(service.create(MOCK_TENANT_ID, createDto, "admin")).rejects.toThrow(BadRequestException);
		});

		it("should throw BadRequestException if employee already has user account", async () => {
			prisma.employee.findFirst.mockResolvedValue(mockEmployee);
			prisma.user.findFirst.mockResolvedValue(mockUser);

			await expect(service.create(MOCK_TENANT_ID, createDto, "admin")).rejects.toThrow(BadRequestException);
		});

		it("should throw BadRequestException if username exists", async () => {
			prisma.employee.findFirst.mockResolvedValue(mockEmployee);
			prisma.user.findFirst.mockResolvedValueOnce(null).mockResolvedValueOnce(mockUser);

			await expect(service.create(MOCK_TENANT_ID, { ...createDto, username: "testuser" }, "admin")).rejects.toThrow(
				BadRequestException,
			);
		});

		it("should throw BadRequestException if center not found", async () => {
			prisma.employee.findFirst.mockResolvedValue(mockEmployee);
			prisma.user.findFirst.mockResolvedValueOnce(null).mockResolvedValueOnce(null);
			prisma.center.findFirst.mockResolvedValue(null);

			await expect(
				service.create(MOCK_TENANT_ID, { ...createDto, centerId: "invalid-center" }, "admin"),
			).rejects.toThrow(BadRequestException);
		});
	});

	describe("findAll", () => {
		it("should return all users for tenant", async () => {
			prisma.user.findMany.mockResolvedValue([mockUser]);

			const result = await service.findAll(MOCK_TENANT_ID);

			expect(result).toHaveLength(1);
			expect(result[0].username).toBe("testuser");
		});
	});

	describe("findByCenter", () => {
		it("should return users for a specific center", async () => {
			prisma.user.findMany.mockResolvedValue([mockUser]);

			const result = await service.findByCenter(MOCK_TENANT_ID, MOCK_CENTER_ID);

			expect(result).toHaveLength(1);
			expect(result[0].centerId).toBe(MOCK_CENTER_ID);
		});
	});

	describe("findOne", () => {
		it("should return a user by id", async () => {
			prisma.user.findFirst.mockResolvedValueOnce(mockUser);

			const result = await service.findOne(MOCK_TENANT_ID, MOCK_USER_ID);

			expect(result.id).toBe(MOCK_USER_ID);
		});

		it("should throw NotFoundException if user not found", async () => {
			prisma.user.findFirst.mockResolvedValueOnce(null);

			await expect(service.findOne(MOCK_TENANT_ID, "nonexistent")).rejects.toThrow(NotFoundException);
		});
	});

	describe("update", () => {
		const updateDto = { email: "updated@example.com" };

		it("should update a user", async () => {
			prisma.user.findFirst.mockResolvedValueOnce(mockUser).mockResolvedValueOnce({ ...mockUser, ...updateDto });
			prisma.user.update.mockResolvedValue({ ...mockUser, ...updateDto });

			const result = await service.update(MOCK_TENANT_ID, MOCK_USER_ID, updateDto, "admin-123");

			expect(result.email).toBe("updated@example.com");
		});

		it("should throw NotFoundException if user not found", async () => {
			prisma.user.findFirst.mockResolvedValue(null);

			await expect(service.update(MOCK_TENANT_ID, "nonexistent", updateDto, "admin")).rejects.toThrow(
				NotFoundException,
			);
		});

		it("should throw BadRequestException if center not found", async () => {
			prisma.user.findFirst.mockResolvedValue(mockUser);
			prisma.center.findFirst.mockResolvedValue(null);

			await expect(
				service.update(MOCK_TENANT_ID, MOCK_USER_ID, { centerId: "invalid-center" }, "admin"),
			).rejects.toThrow(BadRequestException);
		});
	});

	describe("remove", () => {
		it("should soft delete a user", async () => {
			prisma.user.findFirst.mockResolvedValue(mockUser);
			prisma.user.update.mockResolvedValue({ ...mockUser, deletedAt: new Date() });

			const result = await service.remove(MOCK_TENANT_ID, MOCK_USER_ID, "admin-123");

			expect(result.message).toBe("User deleted successfully");
		});

		it("should throw NotFoundException if user not found", async () => {
			prisma.user.findFirst.mockResolvedValue(null);

			await expect(service.remove(MOCK_TENANT_ID, "nonexistent", "admin")).rejects.toThrow(NotFoundException);
		});
	});

	describe("unlockUser", () => {
		it("should unlock a user", async () => {
			prisma.user.findFirst.mockResolvedValue({ ...mockUser, status: UserStatus.LOCKED });
			prisma.user.update.mockResolvedValue(mockUser);

			const result = await service.unlockUser(MOCK_TENANT_ID, MOCK_USER_ID);

			expect(result.message).toBe("User unlocked successfully");
		});

		it("should throw NotFoundException if user not found", async () => {
			prisma.user.findFirst.mockResolvedValue(null);

			await expect(service.unlockUser(MOCK_TENANT_ID, "nonexistent")).rejects.toThrow(NotFoundException);
		});
	});
});
