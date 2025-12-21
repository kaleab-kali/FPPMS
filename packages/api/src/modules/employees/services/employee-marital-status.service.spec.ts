import { NotFoundException } from "@nestjs/common";
import { Test, type TestingModule } from "@nestjs/testing";
import { MaritalStatus } from "@prisma/client";
import { PrismaService } from "#api/database/prisma.service";
import { EmployeeMaritalStatusService } from "#api/modules/employees/services/employee-marital-status.service";

const MOCK_TENANT_ID = "tenant-123";
const MOCK_EMPLOYEE_ID = "emp-123";
const MOCK_STATUS_ID = "status-123";
const MOCK_USER_ID = "user-123";

const mockEmployee = {
	id: MOCK_EMPLOYEE_ID,
	tenantId: MOCK_TENANT_ID,
	fullName: "John Doe",
	maritalStatus: MaritalStatus.SINGLE,
	marriageDate: null,
	deletedAt: null,
};

const mockMaritalStatus = {
	id: MOCK_STATUS_ID,
	tenantId: MOCK_TENANT_ID,
	employeeId: MOCK_EMPLOYEE_ID,
	status: "MARRIED",
	effectiveDate: new Date("2024-01-15"),
	certificatePath: null,
	courtOrderPath: null,
	remarks: "Marriage ceremony",
	recordedBy: MOCK_USER_ID,
	deletedAt: null,
	createdAt: new Date(),
	updatedAt: new Date(),
};

const mockPrismaService = {
	employee: {
		findFirst: jest.fn(),
		update: jest.fn(),
	},
	employeeMaritalStatus: {
		create: jest.fn(),
		findFirst: jest.fn(),
		findMany: jest.fn(),
		update: jest.fn(),
	},
	employeeFamilyMember: {
		updateMany: jest.fn(),
	},
};

describe("EmployeeMaritalStatusService", () => {
	let service: EmployeeMaritalStatusService;
	let prisma: typeof mockPrismaService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [EmployeeMaritalStatusService, { provide: PrismaService, useValue: mockPrismaService }],
		}).compile();

		service = module.get<EmployeeMaritalStatusService>(EmployeeMaritalStatusService);
		prisma = module.get(PrismaService);

		jest.clearAllMocks();
	});

	describe("create", () => {
		const createDto = {
			employeeId: MOCK_EMPLOYEE_ID,
			status: "MARRIED",
			effectiveDate: new Date("2024-01-15"),
			remarks: "Marriage ceremony",
		};

		it("should create a marital status record", async () => {
			prisma.employee.findFirst.mockResolvedValue(mockEmployee);
			prisma.employeeMaritalStatus.create.mockResolvedValue(mockMaritalStatus);
			prisma.employee.update.mockResolvedValue(mockEmployee);

			const result = await service.create(MOCK_TENANT_ID, createDto, MOCK_USER_ID);

			expect(result).toBeDefined();
			expect(result.status).toBe("MARRIED");
			expect(prisma.employee.update).toHaveBeenCalledWith({
				where: { id: MOCK_EMPLOYEE_ID },
				data: { maritalStatus: "MARRIED" },
			});
		});

		it("should update spouse divorce date when status is DIVORCED", async () => {
			const divorceDto = { ...createDto, status: "DIVORCED" };
			prisma.employee.findFirst.mockResolvedValue(mockEmployee);
			prisma.employeeMaritalStatus.create.mockResolvedValue({ ...mockMaritalStatus, status: "DIVORCED" });
			prisma.employee.update.mockResolvedValue(mockEmployee);
			prisma.employeeFamilyMember.updateMany.mockResolvedValue({ count: 1 });

			await service.create(MOCK_TENANT_ID, divorceDto, MOCK_USER_ID);

			expect(prisma.employeeFamilyMember.updateMany).toHaveBeenCalledWith({
				where: {
					tenantId: MOCK_TENANT_ID,
					employeeId: MOCK_EMPLOYEE_ID,
					relationship: { in: ["SPOUSE", "HUSBAND", "WIFE"] },
					deletedAt: null,
					divorceDate: null,
				},
				data: { divorceDate: divorceDto.effectiveDate },
			});
		});

		it("should throw NotFoundException when employee not found", async () => {
			prisma.employee.findFirst.mockResolvedValue(null);

			await expect(service.create(MOCK_TENANT_ID, createDto, MOCK_USER_ID)).rejects.toThrow(NotFoundException);
		});
	});

	describe("findAllByEmployee", () => {
		it("should return all marital status records for an employee", async () => {
			prisma.employee.findFirst.mockResolvedValue(mockEmployee);
			prisma.employeeMaritalStatus.findMany.mockResolvedValue([mockMaritalStatus]);

			const result = await service.findAllByEmployee(MOCK_TENANT_ID, MOCK_EMPLOYEE_ID);

			expect(result).toHaveLength(1);
			expect(result[0].status).toBe("MARRIED");
		});

		it("should throw NotFoundException when employee not found", async () => {
			prisma.employee.findFirst.mockResolvedValue(null);

			await expect(service.findAllByEmployee(MOCK_TENANT_ID, MOCK_EMPLOYEE_ID)).rejects.toThrow(NotFoundException);
		});
	});

	describe("getCurrentStatus", () => {
		it("should return current marital status", async () => {
			prisma.employee.findFirst.mockResolvedValue({
				id: MOCK_EMPLOYEE_ID,
				maritalStatus: MaritalStatus.MARRIED,
				marriageDate: new Date("2024-01-15"),
			});
			prisma.employeeMaritalStatus.findFirst.mockResolvedValue(mockMaritalStatus);

			const result = await service.getCurrentStatus(MOCK_TENANT_ID, MOCK_EMPLOYEE_ID);

			expect(result.currentStatus).toBe(MaritalStatus.MARRIED);
			expect(result.lastChange).toBeDefined();
		});

		it("should throw NotFoundException when employee not found", async () => {
			prisma.employee.findFirst.mockResolvedValue(null);

			await expect(service.getCurrentStatus(MOCK_TENANT_ID, MOCK_EMPLOYEE_ID)).rejects.toThrow(NotFoundException);
		});
	});

	describe("findOne", () => {
		it("should return a marital status record by id", async () => {
			prisma.employeeMaritalStatus.findFirst.mockResolvedValue(mockMaritalStatus);

			const result = await service.findOne(MOCK_TENANT_ID, MOCK_STATUS_ID);

			expect(result).toBeDefined();
			expect(result.id).toBe(MOCK_STATUS_ID);
		});

		it("should throw NotFoundException when record not found", async () => {
			prisma.employeeMaritalStatus.findFirst.mockResolvedValue(null);

			await expect(service.findOne(MOCK_TENANT_ID, "nonexistent")).rejects.toThrow(NotFoundException);
		});
	});

	describe("update", () => {
		const updateDto = {
			status: "DIVORCED",
			effectiveDate: new Date("2024-06-15"),
			remarks: "Divorce finalized",
		};

		it("should update a marital status record", async () => {
			prisma.employeeMaritalStatus.findFirst.mockResolvedValue(mockMaritalStatus);
			prisma.employeeMaritalStatus.update.mockResolvedValue({ ...mockMaritalStatus, ...updateDto });

			const result = await service.update(MOCK_TENANT_ID, MOCK_STATUS_ID, updateDto);

			expect(result.status).toBe("DIVORCED");
			expect(prisma.employeeMaritalStatus.update).toHaveBeenCalled();
		});

		it("should throw NotFoundException when record not found", async () => {
			prisma.employeeMaritalStatus.findFirst.mockResolvedValue(null);

			await expect(service.update(MOCK_TENANT_ID, "nonexistent", updateDto)).rejects.toThrow(NotFoundException);
		});
	});

	describe("delete", () => {
		it("should soft delete a marital status record", async () => {
			prisma.employeeMaritalStatus.findFirst.mockResolvedValue(mockMaritalStatus);
			prisma.employeeMaritalStatus.update.mockResolvedValue({ ...mockMaritalStatus, deletedAt: new Date() });

			const result = await service.delete(MOCK_TENANT_ID, MOCK_STATUS_ID);

			expect(result).toBeDefined();
			expect(prisma.employeeMaritalStatus.update).toHaveBeenCalledWith({
				where: { id: MOCK_STATUS_ID },
				data: { deletedAt: expect.any(Date) },
			});
		});

		it("should throw NotFoundException when record not found", async () => {
			prisma.employeeMaritalStatus.findFirst.mockResolvedValue(null);

			await expect(service.delete(MOCK_TENANT_ID, "nonexistent")).rejects.toThrow(NotFoundException);
		});
	});
});
