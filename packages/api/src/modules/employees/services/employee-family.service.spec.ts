import { NotFoundException } from "@nestjs/common";
import { Test, type TestingModule } from "@nestjs/testing";
import { Gender } from "@prisma/client";
import { PrismaService } from "#api/database/prisma.service";
import { EmployeeFamilyService } from "#api/modules/employees/services/employee-family.service";

const MOCK_TENANT_ID = "tenant-123";
const MOCK_EMPLOYEE_ID = "emp-123";
const MOCK_FAMILY_MEMBER_ID = "family-123";

const mockEmployee = {
	id: MOCK_EMPLOYEE_ID,
	tenantId: MOCK_TENANT_ID,
	fullName: "John Doe",
	deletedAt: null,
};

const mockFamilyMember = {
	id: MOCK_FAMILY_MEMBER_ID,
	tenantId: MOCK_TENANT_ID,
	employeeId: MOCK_EMPLOYEE_ID,
	relationship: "SPOUSE",
	fullName: "Jane Doe",
	fullNameAm: "ጄን ዶ",
	gender: Gender.FEMALE,
	dateOfBirth: new Date("1992-05-15"),
	nationalId: "12345678",
	phone: "+251911222333",
	occupation: "Teacher",
	isAlive: true,
	deletedAt: null,
	createdAt: new Date(),
	updatedAt: new Date(),
};

const mockPrismaService = {
	employee: {
		findFirst: jest.fn(),
	},
	employeeFamilyMember: {
		create: jest.fn(),
		findFirst: jest.fn(),
		findMany: jest.fn(),
		update: jest.fn(),
	},
};

describe("EmployeeFamilyService", () => {
	let service: EmployeeFamilyService;
	let prisma: typeof mockPrismaService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [EmployeeFamilyService, { provide: PrismaService, useValue: mockPrismaService }],
		}).compile();

		service = module.get<EmployeeFamilyService>(EmployeeFamilyService);
		prisma = module.get(PrismaService);

		jest.clearAllMocks();
	});

	describe("create", () => {
		const createDto = {
			employeeId: MOCK_EMPLOYEE_ID,
			relationship: "SPOUSE",
			fullName: "Jane Doe",
			fullNameAm: "ጄን ዶ",
			gender: Gender.FEMALE,
			dateOfBirth: new Date("1992-05-15"),
			nationalId: "12345678",
			phone: "+251911222333",
			occupation: "Teacher",
			isAlive: true,
		};

		it("should create a family member", async () => {
			prisma.employee.findFirst.mockResolvedValue(mockEmployee);
			prisma.employeeFamilyMember.create.mockResolvedValue(mockFamilyMember);

			const result = await service.create(MOCK_TENANT_ID, createDto);

			expect(result).toBeDefined();
			expect(result.id).toBe(MOCK_FAMILY_MEMBER_ID);
			expect(prisma.employeeFamilyMember.create).toHaveBeenCalledWith({
				data: expect.objectContaining({
					tenantId: MOCK_TENANT_ID,
					employeeId: MOCK_EMPLOYEE_ID,
					relationship: "SPOUSE",
				}),
			});
		});

		it("should throw NotFoundException when employee not found", async () => {
			prisma.employee.findFirst.mockResolvedValue(null);

			await expect(service.create(MOCK_TENANT_ID, createDto)).rejects.toThrow(NotFoundException);
		});
	});

	describe("findAllByEmployee", () => {
		it("should return all family members for an employee", async () => {
			prisma.employee.findFirst.mockResolvedValue(mockEmployee);
			prisma.employeeFamilyMember.findMany.mockResolvedValue([mockFamilyMember]);

			const result = await service.findAllByEmployee(MOCK_TENANT_ID, MOCK_EMPLOYEE_ID);

			expect(result).toHaveLength(1);
			expect(result[0].fullName).toBe("Jane Doe");
		});

		it("should throw NotFoundException when employee not found", async () => {
			prisma.employee.findFirst.mockResolvedValue(null);

			await expect(service.findAllByEmployee(MOCK_TENANT_ID, MOCK_EMPLOYEE_ID)).rejects.toThrow(NotFoundException);
		});
	});

	describe("findOne", () => {
		it("should return a family member by id", async () => {
			prisma.employeeFamilyMember.findFirst.mockResolvedValue(mockFamilyMember);

			const result = await service.findOne(MOCK_TENANT_ID, MOCK_FAMILY_MEMBER_ID);

			expect(result).toBeDefined();
			expect(result.id).toBe(MOCK_FAMILY_MEMBER_ID);
		});

		it("should throw NotFoundException when family member not found", async () => {
			prisma.employeeFamilyMember.findFirst.mockResolvedValue(null);

			await expect(service.findOne(MOCK_TENANT_ID, "nonexistent")).rejects.toThrow(NotFoundException);
		});
	});

	describe("update", () => {
		const updateDto = {
			fullName: "Jane Smith",
			phone: "+251922333444",
		};

		it("should update a family member", async () => {
			prisma.employeeFamilyMember.findFirst.mockResolvedValue(mockFamilyMember);
			prisma.employeeFamilyMember.update.mockResolvedValue({ ...mockFamilyMember, ...updateDto });

			const result = await service.update(MOCK_TENANT_ID, MOCK_FAMILY_MEMBER_ID, updateDto);

			expect(result.fullName).toBe("Jane Smith");
			expect(prisma.employeeFamilyMember.update).toHaveBeenCalledWith({
				where: { id: MOCK_FAMILY_MEMBER_ID },
				data: expect.objectContaining(updateDto),
			});
		});

		it("should throw NotFoundException when family member not found", async () => {
			prisma.employeeFamilyMember.findFirst.mockResolvedValue(null);

			await expect(service.update(MOCK_TENANT_ID, "nonexistent", updateDto)).rejects.toThrow(NotFoundException);
		});
	});

	describe("delete", () => {
		it("should soft delete a family member", async () => {
			prisma.employeeFamilyMember.findFirst.mockResolvedValue(mockFamilyMember);
			prisma.employeeFamilyMember.update.mockResolvedValue({ ...mockFamilyMember, deletedAt: new Date() });

			const result = await service.delete(MOCK_TENANT_ID, MOCK_FAMILY_MEMBER_ID);

			expect(result).toBeDefined();
			expect(prisma.employeeFamilyMember.update).toHaveBeenCalledWith({
				where: { id: MOCK_FAMILY_MEMBER_ID },
				data: { deletedAt: expect.any(Date) },
			});
		});

		it("should throw NotFoundException when family member not found", async () => {
			prisma.employeeFamilyMember.findFirst.mockResolvedValue(null);

			await expect(service.delete(MOCK_TENANT_ID, "nonexistent")).rejects.toThrow(NotFoundException);
		});
	});

	describe("getSpouse", () => {
		it("should return spouse for an employee", async () => {
			prisma.employeeFamilyMember.findFirst.mockResolvedValue(mockFamilyMember);

			const result = await service.getSpouse(MOCK_TENANT_ID, MOCK_EMPLOYEE_ID);

			expect(result).toBeDefined();
			expect(result?.relationship).toBe("SPOUSE");
		});

		it("should return null when no spouse found", async () => {
			prisma.employeeFamilyMember.findFirst.mockResolvedValue(null);

			const result = await service.getSpouse(MOCK_TENANT_ID, MOCK_EMPLOYEE_ID);

			expect(result).toBeNull();
		});
	});

	describe("getChildren", () => {
		const mockChild = {
			...mockFamilyMember,
			id: "child-123",
			relationship: "SON",
			fullName: "John Jr",
			gender: Gender.MALE,
		};

		it("should return children for an employee", async () => {
			prisma.employeeFamilyMember.findMany.mockResolvedValue([mockChild]);

			const result = await service.getChildren(MOCK_TENANT_ID, MOCK_EMPLOYEE_ID);

			expect(result).toHaveLength(1);
			expect(result[0].relationship).toBe("SON");
		});

		it("should return empty array when no children found", async () => {
			prisma.employeeFamilyMember.findMany.mockResolvedValue([]);

			const result = await service.getChildren(MOCK_TENANT_ID, MOCK_EMPLOYEE_ID);

			expect(result).toHaveLength(0);
		});
	});
});
