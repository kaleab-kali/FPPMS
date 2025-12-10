import { BadRequestException, NotFoundException } from "@nestjs/common";
import { Test, type TestingModule } from "@nestjs/testing";
import { PrismaService } from "#api/database/prisma.service";
import { RolesService } from "#api/modules/roles/roles.service";

const MOCK_TENANT_ID = "tenant-123";
const MOCK_ROLE_ID = "role-123";

const mockRolePermissions = [
	{
		id: "rp-1",
		roleId: MOCK_ROLE_ID,
		permissionId: "perm-1",
		permission: {
			id: "perm-1",
			module: "employees",
			action: "read",
			resource: "employee",
			description: "View employees",
		},
	},
];

const mockRole = {
	id: MOCK_ROLE_ID,
	tenantId: MOCK_TENANT_ID,
	code: "HR_OFFICER",
	name: "HR Officer",
	nameAm: "\u12E8\u1230\u12CD \u1210\u12ED\u120D \u1260\u120B\u1260\u1275",
	description: "Human Resources Officer",
	isSystemRole: false,
	level: 70,
	accessScope: "OWN_CENTER",
	isActive: true,
	createdAt: new Date(),
	updatedAt: new Date(),
	rolePermissions: mockRolePermissions,
};

const mockSystemRole = {
	...mockRole,
	id: "system-role-123",
	code: "IT_ADMIN",
	name: "IT Administrator",
	isSystemRole: true,
	level: 100,
	accessScope: "ALL_CENTERS",
	rolePermissions: [],
};

const mockPrismaService = {
	role: {
		findFirst: jest.fn(),
		findMany: jest.fn(),
		create: jest.fn(),
		update: jest.fn(),
		delete: jest.fn(),
	},
	userRole: {
		findMany: jest.fn(),
	},
	rolePermission: {
		deleteMany: jest.fn(),
		createMany: jest.fn(),
	},
};

describe("RolesService", () => {
	let service: RolesService;
	let prisma: typeof mockPrismaService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [RolesService, { provide: PrismaService, useValue: mockPrismaService }],
		}).compile();

		service = module.get<RolesService>(RolesService);
		prisma = module.get(PrismaService);

		jest.clearAllMocks();
	});

	describe("create", () => {
		const createDto = {
			code: "NEW_ROLE",
			name: "New Role",
			level: 50,
			accessScope: "OWN_CENTER",
		};

		it("should create a new role", async () => {
			prisma.role.findFirst.mockResolvedValue(null);
			prisma.role.create.mockResolvedValue({ ...mockRole, ...createDto, id: "new-id" });

			const result = await service.create(MOCK_TENANT_ID, createDto);

			expect(result.code).toBe("NEW_ROLE");
			expect(prisma.role.create).toHaveBeenCalled();
		});

		it("should throw BadRequestException if role code exists", async () => {
			prisma.role.findFirst.mockResolvedValue(mockRole);

			await expect(service.create(MOCK_TENANT_ID, { ...createDto, code: "HR_OFFICER" })).rejects.toThrow(
				BadRequestException,
			);
		});
	});

	describe("findAll", () => {
		it("should return all roles including system roles", async () => {
			prisma.role.findMany.mockResolvedValue([mockRole, mockSystemRole]);

			const result = await service.findAll(MOCK_TENANT_ID);

			expect(result).toHaveLength(2);
		});
	});

	describe("findOne", () => {
		it("should return a role by id", async () => {
			prisma.role.findFirst.mockResolvedValue(mockRole);

			const result = await service.findOne(MOCK_TENANT_ID, MOCK_ROLE_ID);

			expect(result.id).toBe(MOCK_ROLE_ID);
		});

		it("should throw NotFoundException if role not found", async () => {
			prisma.role.findFirst.mockResolvedValue(null);

			await expect(service.findOne(MOCK_TENANT_ID, "nonexistent")).rejects.toThrow(NotFoundException);
		});
	});

	describe("findByCode", () => {
		it("should return a role by code", async () => {
			prisma.role.findFirst.mockResolvedValue(mockRole);

			const result = await service.findByCode(MOCK_TENANT_ID, "HR_OFFICER");

			expect(result.code).toBe("HR_OFFICER");
		});

		it("should throw NotFoundException if role not found", async () => {
			prisma.role.findFirst.mockResolvedValue(null);

			await expect(service.findByCode(MOCK_TENANT_ID, "NONEXISTENT")).rejects.toThrow(NotFoundException);
		});
	});

	describe("update", () => {
		const updateDto = { name: "Updated Name" };

		it("should update a role", async () => {
			const updatedRole = { ...mockRole, name: "Updated Name" };
			prisma.role.findFirst.mockResolvedValueOnce(mockRole).mockResolvedValueOnce(updatedRole);
			prisma.role.update.mockResolvedValue(updatedRole);

			const result = await service.update(MOCK_TENANT_ID, MOCK_ROLE_ID, updateDto);

			expect(result.name).toBe("Updated Name");
		});

		it("should throw NotFoundException if role not found", async () => {
			prisma.role.findFirst.mockResolvedValue(null);

			await expect(service.update(MOCK_TENANT_ID, "nonexistent", updateDto)).rejects.toThrow(NotFoundException);
		});

		it("should allow partial update of system role", async () => {
			const partialUpdateDto = { nameAm: "Updated Amharic Name", description: "Updated description" };
			const updatedSystemRole = {
				...mockSystemRole,
				nameAm: "Updated Amharic Name",
				description: "Updated description",
			};
			prisma.role.findFirst.mockResolvedValueOnce(mockSystemRole).mockResolvedValueOnce(updatedSystemRole);
			prisma.role.update.mockResolvedValue(updatedSystemRole);

			const result = await service.update(MOCK_TENANT_ID, "system-role-123", partialUpdateDto);

			expect(result.nameAm).toBe("Updated Amharic Name");
		});
	});

	describe("remove", () => {
		it("should delete a role", async () => {
			prisma.role.findFirst.mockResolvedValue(mockRole);
			prisma.userRole.findMany.mockResolvedValue([]);
			prisma.role.delete.mockResolvedValue(mockRole);

			const result = await service.remove(MOCK_TENANT_ID, MOCK_ROLE_ID);

			expect(result.message).toBe("Role deleted successfully");
		});

		it("should throw NotFoundException if role not found", async () => {
			prisma.role.findFirst.mockResolvedValue(null);

			await expect(service.remove(MOCK_TENANT_ID, "nonexistent")).rejects.toThrow(NotFoundException);
		});

		it("should throw BadRequestException if trying to delete system role", async () => {
			prisma.role.findFirst.mockResolvedValue(mockSystemRole);

			await expect(service.remove(MOCK_TENANT_ID, "system-role-123")).rejects.toThrow(BadRequestException);
		});

		it("should throw BadRequestException if role is assigned to users", async () => {
			prisma.role.findFirst.mockResolvedValue(mockRole);
			prisma.userRole.findMany.mockResolvedValue([{ id: "user-role-1" }]);

			await expect(service.remove(MOCK_TENANT_ID, MOCK_ROLE_ID)).rejects.toThrow(BadRequestException);
		});
	});
});
