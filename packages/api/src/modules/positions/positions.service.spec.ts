import { BadRequestException, NotFoundException } from "@nestjs/common";
import { Test, type TestingModule } from "@nestjs/testing";
import { PrismaService } from "#api/database/prisma.service";
import { PositionsService } from "#api/modules/positions/positions.service";

const MOCK_TENANT_ID = "tenant-123";
const MOCK_POSITION_ID = "pos-123";
const MOCK_DEPARTMENT_ID = "dept-123";

const mockPosition = {
	id: MOCK_POSITION_ID,
	tenantId: MOCK_TENANT_ID,
	departmentId: MOCK_DEPARTMENT_ID,
	code: "HR_MGR",
	name: "HR Manager",
	nameAm: "\u12E8\u1230\u12CD \u1210\u12ED\u120D \u1235\u122B \u12A0\u1235\u1270\u12F3\u12F3\u122A",
	description: "Human Resources Manager",
	sortOrder: 0,
	isActive: true,
	createdAt: new Date(),
	updatedAt: new Date(),
};

const mockPrismaService = {
	position: {
		findFirst: jest.fn(),
		findMany: jest.fn(),
		create: jest.fn(),
		update: jest.fn(),
		delete: jest.fn(),
	},
	department: {
		findFirst: jest.fn(),
	},
};

describe("PositionsService", () => {
	let service: PositionsService;
	let prisma: typeof mockPrismaService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [PositionsService, { provide: PrismaService, useValue: mockPrismaService }],
		}).compile();

		service = module.get<PositionsService>(PositionsService);
		prisma = module.get(PrismaService);

		jest.clearAllMocks();
	});

	describe("create", () => {
		const createDto = {
			code: "HR_ASST",
			name: "HR Assistant",
		};

		it("should create a new position", async () => {
			prisma.position.findFirst.mockResolvedValue(null);
			prisma.position.create.mockResolvedValue({ ...mockPosition, ...createDto, id: "new-id" });

			const result = await service.create(MOCK_TENANT_ID, createDto);

			expect(result.code).toBe("HR_ASST");
			expect(prisma.position.create).toHaveBeenCalled();
		});

		it("should throw BadRequestException if position code exists", async () => {
			prisma.position.findFirst.mockResolvedValue(mockPosition);

			await expect(service.create(MOCK_TENANT_ID, { ...createDto, code: "HR_MGR" })).rejects.toThrow(
				BadRequestException,
			);
		});

		it("should throw BadRequestException if department not found", async () => {
			prisma.position.findFirst.mockResolvedValue(null);
			prisma.department.findFirst.mockResolvedValue(null);

			await expect(service.create(MOCK_TENANT_ID, { ...createDto, departmentId: "invalid-dept" })).rejects.toThrow(
				BadRequestException,
			);
		});
	});

	describe("findAll", () => {
		it("should return all positions for tenant", async () => {
			prisma.position.findMany.mockResolvedValue([mockPosition]);

			const result = await service.findAll(MOCK_TENANT_ID);

			expect(result).toHaveLength(1);
			expect(result[0].code).toBe("HR_MGR");
		});
	});

	describe("findByDepartment", () => {
		it("should return positions for a specific department", async () => {
			prisma.position.findMany.mockResolvedValue([mockPosition]);

			const result = await service.findByDepartment(MOCK_TENANT_ID, MOCK_DEPARTMENT_ID);

			expect(result).toHaveLength(1);
			expect(result[0].departmentId).toBe(MOCK_DEPARTMENT_ID);
		});
	});

	describe("findOne", () => {
		it("should return a position by id", async () => {
			prisma.position.findFirst.mockResolvedValue(mockPosition);

			const result = await service.findOne(MOCK_TENANT_ID, MOCK_POSITION_ID);

			expect(result.id).toBe(MOCK_POSITION_ID);
		});

		it("should throw NotFoundException if position not found", async () => {
			prisma.position.findFirst.mockResolvedValue(null);

			await expect(service.findOne(MOCK_TENANT_ID, "nonexistent")).rejects.toThrow(NotFoundException);
		});
	});

	describe("update", () => {
		const updateDto = { name: "Updated Name" };

		it("should update a position", async () => {
			prisma.position.findFirst.mockResolvedValue(mockPosition);
			prisma.position.update.mockResolvedValue({ ...mockPosition, ...updateDto });

			const result = await service.update(MOCK_TENANT_ID, MOCK_POSITION_ID, updateDto);

			expect(result.name).toBe("Updated Name");
		});

		it("should throw NotFoundException if position not found", async () => {
			prisma.position.findFirst.mockResolvedValue(null);

			await expect(service.update(MOCK_TENANT_ID, "nonexistent", updateDto)).rejects.toThrow(NotFoundException);
		});

		it("should throw BadRequestException if department not found", async () => {
			prisma.position.findFirst.mockResolvedValue(mockPosition);
			prisma.department.findFirst.mockResolvedValue(null);

			await expect(service.update(MOCK_TENANT_ID, MOCK_POSITION_ID, { departmentId: "invalid-dept" })).rejects.toThrow(
				BadRequestException,
			);
		});
	});

	describe("remove", () => {
		it("should delete a position", async () => {
			prisma.position.findFirst.mockResolvedValue(mockPosition);
			prisma.position.delete.mockResolvedValue(mockPosition);

			const result = await service.remove(MOCK_TENANT_ID, MOCK_POSITION_ID);

			expect(result.message).toBe("Position deleted successfully");
		});

		it("should throw NotFoundException if position not found", async () => {
			prisma.position.findFirst.mockResolvedValue(null);

			await expect(service.remove(MOCK_TENANT_ID, "nonexistent")).rejects.toThrow(NotFoundException);
		});
	});
});
