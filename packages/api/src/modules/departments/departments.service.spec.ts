import { BadRequestException, NotFoundException } from "@nestjs/common";
import { Test, type TestingModule } from "@nestjs/testing";
import { PrismaService } from "#api/database/prisma.service";
import { DepartmentsService } from "#api/modules/departments/departments.service";

const MOCK_TENANT_ID = "tenant-123";
const MOCK_DEPARTMENT_ID = "dept-123";

const mockDepartment = {
	id: MOCK_DEPARTMENT_ID,
	tenantId: MOCK_TENANT_ID,
	code: "HR",
	name: "Human Resources",
	nameAm: "\u12E8\u1230\u12CD \u1210\u12ED\u120D",
	description: "Human Resources Department",
	parentId: null,
	headEmployeeId: null,
	sortOrder: 0,
	isActive: true,
	createdAt: new Date(),
	updatedAt: new Date(),
};

const mockPrismaService = {
	department: {
		findFirst: jest.fn(),
		findMany: jest.fn(),
		create: jest.fn(),
		update: jest.fn(),
		delete: jest.fn(),
	},
	position: {
		findMany: jest.fn(),
	},
};

describe("DepartmentsService", () => {
	let service: DepartmentsService;
	let prisma: typeof mockPrismaService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [DepartmentsService, { provide: PrismaService, useValue: mockPrismaService }],
		}).compile();

		service = module.get<DepartmentsService>(DepartmentsService);
		prisma = module.get(PrismaService);

		jest.clearAllMocks();
	});

	describe("create", () => {
		const createDto = {
			code: "FIN",
			name: "Finance",
		};

		it("should create a new department", async () => {
			prisma.department.findFirst.mockResolvedValue(null);
			prisma.department.create.mockResolvedValue({ ...mockDepartment, ...createDto, id: "new-id" });

			const result = await service.create(MOCK_TENANT_ID, createDto);

			expect(result.code).toBe("FIN");
			expect(prisma.department.create).toHaveBeenCalled();
		});

		it("should throw BadRequestException if department code exists", async () => {
			prisma.department.findFirst.mockResolvedValue(mockDepartment);

			await expect(service.create(MOCK_TENANT_ID, { ...createDto, code: "HR" })).rejects.toThrow(BadRequestException);
		});

		it("should throw BadRequestException if parent department not found", async () => {
			prisma.department.findFirst.mockResolvedValueOnce(null).mockResolvedValueOnce(null);

			await expect(service.create(MOCK_TENANT_ID, { ...createDto, parentId: "invalid-parent" })).rejects.toThrow(
				BadRequestException,
			);
		});
	});

	describe("findAll", () => {
		it("should return all departments for tenant", async () => {
			prisma.department.findMany.mockResolvedValue([mockDepartment]);

			const result = await service.findAll(MOCK_TENANT_ID);

			expect(result).toHaveLength(1);
			expect(result[0].code).toBe("HR");
		});
	});

	describe("findHierarchy", () => {
		it("should return root departments when no parentId", async () => {
			prisma.department.findMany.mockResolvedValue([mockDepartment]);

			const result = await service.findHierarchy(MOCK_TENANT_ID);

			expect(result).toHaveLength(1);
		});

		it("should return child departments for given parentId", async () => {
			const childDept = { ...mockDepartment, id: "child-1", parentId: MOCK_DEPARTMENT_ID };
			prisma.department.findMany.mockResolvedValue([childDept]);

			const result = await service.findHierarchy(MOCK_TENANT_ID, MOCK_DEPARTMENT_ID);

			expect(result).toHaveLength(1);
			expect(result[0].parentId).toBe(MOCK_DEPARTMENT_ID);
		});
	});

	describe("findOne", () => {
		it("should return a department by id", async () => {
			prisma.department.findFirst.mockResolvedValue(mockDepartment);

			const result = await service.findOne(MOCK_TENANT_ID, MOCK_DEPARTMENT_ID);

			expect(result.id).toBe(MOCK_DEPARTMENT_ID);
		});

		it("should throw NotFoundException if department not found", async () => {
			prisma.department.findFirst.mockResolvedValue(null);

			await expect(service.findOne(MOCK_TENANT_ID, "nonexistent")).rejects.toThrow(NotFoundException);
		});
	});

	describe("update", () => {
		const updateDto = { name: "Updated Name" };

		it("should update a department", async () => {
			prisma.department.findFirst.mockResolvedValue(mockDepartment);
			prisma.department.update.mockResolvedValue({ ...mockDepartment, ...updateDto });

			const result = await service.update(MOCK_TENANT_ID, MOCK_DEPARTMENT_ID, updateDto);

			expect(result.name).toBe("Updated Name");
		});

		it("should throw NotFoundException if department not found", async () => {
			prisma.department.findFirst.mockResolvedValue(null);

			await expect(service.update(MOCK_TENANT_ID, "nonexistent", updateDto)).rejects.toThrow(NotFoundException);
		});

		it("should throw BadRequestException if department is its own parent", async () => {
			prisma.department.findFirst.mockResolvedValue(mockDepartment);

			await expect(
				service.update(MOCK_TENANT_ID, MOCK_DEPARTMENT_ID, { parentId: MOCK_DEPARTMENT_ID }),
			).rejects.toThrow(BadRequestException);
		});
	});

	describe("remove", () => {
		it("should delete a department", async () => {
			prisma.department.findFirst.mockResolvedValue(mockDepartment);
			prisma.department.findMany.mockResolvedValue([]);
			prisma.position.findMany.mockResolvedValue([]);
			prisma.department.delete.mockResolvedValue(mockDepartment);

			const result = await service.remove(MOCK_TENANT_ID, MOCK_DEPARTMENT_ID);

			expect(result.message).toBe("Department deleted successfully");
		});

		it("should throw NotFoundException if department not found", async () => {
			prisma.department.findFirst.mockResolvedValue(null);

			await expect(service.remove(MOCK_TENANT_ID, "nonexistent")).rejects.toThrow(NotFoundException);
		});

		it("should throw BadRequestException if department has children", async () => {
			prisma.department.findFirst.mockResolvedValue(mockDepartment);
			prisma.department.findMany.mockResolvedValue([{ id: "child-1" }]);

			await expect(service.remove(MOCK_TENANT_ID, MOCK_DEPARTMENT_ID)).rejects.toThrow(BadRequestException);
		});

		it("should throw BadRequestException if department has positions", async () => {
			prisma.department.findFirst.mockResolvedValue(mockDepartment);
			prisma.department.findMany.mockResolvedValue([]);
			prisma.position.findMany.mockResolvedValue([{ id: "position-1" }]);

			await expect(service.remove(MOCK_TENANT_ID, MOCK_DEPARTMENT_ID)).rejects.toThrow(BadRequestException);
		});
	});
});
