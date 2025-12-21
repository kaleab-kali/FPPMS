import { NotFoundException } from "@nestjs/common";
import { Test, type TestingModule } from "@nestjs/testing";
import { PrismaService } from "#api/database/prisma.service";
import { EmployeeMedicalService } from "#api/modules/employees/services/employee-medical.service";

const MOCK_TENANT_ID = "tenant-123";
const MOCK_EMPLOYEE_ID = "emp-123";
const MOCK_RECORD_ID = "record-123";
const MOCK_FAMILY_MEMBER_ID = "family-123";
const MOCK_USER_ID = "user-123";

const mockEmployee = {
	id: MOCK_EMPLOYEE_ID,
	tenantId: MOCK_TENANT_ID,
	fullName: "John Doe",
	deletedAt: null,
};

const mockFamilyMember = {
	id: MOCK_FAMILY_MEMBER_ID,
	employeeId: MOCK_EMPLOYEE_ID,
	relationship: "SPOUSE",
	fullName: "Jane Doe",
	isAlive: true,
	dateOfBirth: new Date("1992-05-15"),
	divorceDate: null,
	deletedAt: null,
};

const mockMedicalRecord = {
	id: MOCK_RECORD_ID,
	tenantId: MOCK_TENANT_ID,
	employeeId: MOCK_EMPLOYEE_ID,
	familyMemberId: null,
	isForSelf: true,
	visitDate: new Date("2024-01-15"),
	institutionName: "City Hospital",
	institutionNameAm: "ሲቲ ሆስፒታል",
	visitType: "CHECKUP",
	diagnosis: "General checkup",
	amountCovered: 500,
	totalBillAmount: 1000,
	deletedAt: null,
	familyMember: null,
	employee: mockEmployee,
};

const mockPrismaService = {
	employee: {
		findFirst: jest.fn(),
	},
	employeeFamilyMember: {
		findFirst: jest.fn(),
		findMany: jest.fn(),
	},
	employeeMedicalRecord: {
		create: jest.fn(),
		findFirst: jest.fn(),
		findMany: jest.fn(),
		update: jest.fn(),
	},
};

describe("EmployeeMedicalService", () => {
	let service: EmployeeMedicalService;
	let prisma: typeof mockPrismaService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [EmployeeMedicalService, { provide: PrismaService, useValue: mockPrismaService }],
		}).compile();

		service = module.get<EmployeeMedicalService>(EmployeeMedicalService);
		prisma = module.get(PrismaService);

		jest.clearAllMocks();
	});

	describe("create", () => {
		const createDto = {
			employeeId: MOCK_EMPLOYEE_ID,
			visitDate: new Date("2024-01-15"),
			institutionName: "City Hospital",
			visitType: "CHECKUP",
			diagnosis: "General checkup",
		};

		it("should create a medical record for self", async () => {
			prisma.employee.findFirst.mockResolvedValue(mockEmployee);
			prisma.employeeMedicalRecord.create.mockResolvedValue(mockMedicalRecord);

			const result = await service.create(MOCK_TENANT_ID, createDto, MOCK_USER_ID);

			expect(result).toBeDefined();
			expect(result.isForSelf).toBe(true);
			expect(prisma.employeeMedicalRecord.create).toHaveBeenCalledWith({
				data: expect.objectContaining({
					tenantId: MOCK_TENANT_ID,
					employeeId: MOCK_EMPLOYEE_ID,
					isForSelf: true,
				}),
				include: expect.any(Object),
			});
		});

		it("should create a medical record for family member", async () => {
			const dtoWithFamily = { ...createDto, familyMemberId: MOCK_FAMILY_MEMBER_ID };
			prisma.employee.findFirst.mockResolvedValue(mockEmployee);
			prisma.employeeFamilyMember.findFirst.mockResolvedValue(mockFamilyMember);
			prisma.employeeMedicalRecord.create.mockResolvedValue({
				...mockMedicalRecord,
				familyMemberId: MOCK_FAMILY_MEMBER_ID,
				isForSelf: false,
			});

			const result = await service.create(MOCK_TENANT_ID, dtoWithFamily, MOCK_USER_ID);

			expect(result.familyMemberId).toBe(MOCK_FAMILY_MEMBER_ID);
			expect(result.isForSelf).toBe(false);
		});

		it("should throw NotFoundException when employee not found", async () => {
			prisma.employee.findFirst.mockResolvedValue(null);

			await expect(service.create(MOCK_TENANT_ID, createDto, MOCK_USER_ID)).rejects.toThrow(NotFoundException);
		});

		it("should throw NotFoundException when family member not found", async () => {
			const dtoWithFamily = { ...createDto, familyMemberId: MOCK_FAMILY_MEMBER_ID };
			prisma.employee.findFirst.mockResolvedValue(mockEmployee);
			prisma.employeeFamilyMember.findFirst.mockResolvedValue(null);

			await expect(service.create(MOCK_TENANT_ID, dtoWithFamily, MOCK_USER_ID)).rejects.toThrow(NotFoundException);
		});
	});

	describe("findAllByEmployee", () => {
		it("should return all medical records for an employee", async () => {
			prisma.employee.findFirst.mockResolvedValue(mockEmployee);
			prisma.employeeMedicalRecord.findMany.mockResolvedValue([mockMedicalRecord]);

			const result = await service.findAllByEmployee(MOCK_TENANT_ID, MOCK_EMPLOYEE_ID);

			expect(result).toHaveLength(1);
			expect(result[0].institutionName).toBe("City Hospital");
		});

		it("should throw NotFoundException when employee not found", async () => {
			prisma.employee.findFirst.mockResolvedValue(null);

			await expect(service.findAllByEmployee(MOCK_TENANT_ID, MOCK_EMPLOYEE_ID)).rejects.toThrow(NotFoundException);
		});
	});

	describe("findOne", () => {
		it("should return a medical record by id", async () => {
			prisma.employeeMedicalRecord.findFirst.mockResolvedValue(mockMedicalRecord);

			const result = await service.findOne(MOCK_TENANT_ID, MOCK_RECORD_ID);

			expect(result).toBeDefined();
			expect(result.id).toBe(MOCK_RECORD_ID);
		});

		it("should throw NotFoundException when record not found", async () => {
			prisma.employeeMedicalRecord.findFirst.mockResolvedValue(null);

			await expect(service.findOne(MOCK_TENANT_ID, "nonexistent")).rejects.toThrow(NotFoundException);
		});
	});

	describe("update", () => {
		const updateDto = {
			diagnosis: "Updated diagnosis",
			amountCovered: 750,
		};

		it("should update a medical record", async () => {
			prisma.employeeMedicalRecord.findFirst.mockResolvedValue(mockMedicalRecord);
			prisma.employeeMedicalRecord.update.mockResolvedValue({ ...mockMedicalRecord, ...updateDto });

			const result = await service.update(MOCK_TENANT_ID, MOCK_RECORD_ID, updateDto);

			expect(result.diagnosis).toBe("Updated diagnosis");
			expect(prisma.employeeMedicalRecord.update).toHaveBeenCalled();
		});

		it("should throw NotFoundException when record not found", async () => {
			prisma.employeeMedicalRecord.findFirst.mockResolvedValue(null);

			await expect(service.update(MOCK_TENANT_ID, "nonexistent", updateDto)).rejects.toThrow(NotFoundException);
		});
	});

	describe("delete", () => {
		it("should soft delete a medical record", async () => {
			prisma.employeeMedicalRecord.findFirst.mockResolvedValue(mockMedicalRecord);
			prisma.employeeMedicalRecord.update.mockResolvedValue({ ...mockMedicalRecord, deletedAt: new Date() });

			const result = await service.delete(MOCK_TENANT_ID, MOCK_RECORD_ID);

			expect(result).toBeDefined();
			expect(prisma.employeeMedicalRecord.update).toHaveBeenCalledWith({
				where: { id: MOCK_RECORD_ID },
				data: { deletedAt: expect.any(Date) },
			});
		});

		it("should throw NotFoundException when record not found", async () => {
			prisma.employeeMedicalRecord.findFirst.mockResolvedValue(null);

			await expect(service.delete(MOCK_TENANT_ID, "nonexistent")).rejects.toThrow(NotFoundException);
		});
	});

	describe("getEligibleFamilyMembers", () => {
		it("should return eligible family members", async () => {
			prisma.employee.findFirst.mockResolvedValue(mockEmployee);
			prisma.employeeFamilyMember.findMany.mockResolvedValue([mockFamilyMember]);

			const result = await service.getEligibleFamilyMembers(MOCK_TENANT_ID, MOCK_EMPLOYEE_ID);

			expect(result).toHaveLength(1);
		});

		it("should exclude deceased family members", async () => {
			prisma.employee.findFirst.mockResolvedValue(mockEmployee);
			prisma.employeeFamilyMember.findMany.mockResolvedValue([{ ...mockFamilyMember, isAlive: false }]);

			const result = await service.getEligibleFamilyMembers(MOCK_TENANT_ID, MOCK_EMPLOYEE_ID);

			expect(result).toHaveLength(0);
		});

		it("should exclude divorced spouse", async () => {
			prisma.employee.findFirst.mockResolvedValue(mockEmployee);
			prisma.employeeFamilyMember.findMany.mockResolvedValue([{ ...mockFamilyMember, divorceDate: new Date() }]);

			const result = await service.getEligibleFamilyMembers(MOCK_TENANT_ID, MOCK_EMPLOYEE_ID);

			expect(result).toHaveLength(0);
		});

		it("should exclude children over 18", async () => {
			const oldChild = {
				...mockFamilyMember,
				relationship: "CHILD",
				dateOfBirth: new Date("2000-01-01"),
			};
			prisma.employee.findFirst.mockResolvedValue(mockEmployee);
			prisma.employeeFamilyMember.findMany.mockResolvedValue([oldChild]);

			const result = await service.getEligibleFamilyMembers(MOCK_TENANT_ID, MOCK_EMPLOYEE_ID);

			expect(result).toHaveLength(0);
		});

		it("should throw NotFoundException when employee not found", async () => {
			prisma.employee.findFirst.mockResolvedValue(null);

			await expect(service.getEligibleFamilyMembers(MOCK_TENANT_ID, MOCK_EMPLOYEE_ID)).rejects.toThrow(
				NotFoundException,
			);
		});
	});

	describe("getMedicalStats", () => {
		it("should return medical statistics for an employee", async () => {
			prisma.employee.findFirst.mockResolvedValue(mockEmployee);
			prisma.employeeFamilyMember.findMany.mockResolvedValue([mockFamilyMember]);
			prisma.employeeMedicalRecord.findMany.mockResolvedValue([mockMedicalRecord]);

			const result = await service.getMedicalStats(MOCK_TENANT_ID, MOCK_EMPLOYEE_ID);

			expect(result.totalFamilyMembers).toBe(1);
			expect(result.totalRecords).toBe(1);
			expect(result.selfRecords).toBe(1);
			expect(result.familyRecords).toBe(0);
			expect(result.totalAmountCovered).toBe(500);
		});

		it("should throw NotFoundException when employee not found", async () => {
			prisma.employee.findFirst.mockResolvedValue(null);

			await expect(service.getMedicalStats(MOCK_TENANT_ID, MOCK_EMPLOYEE_ID)).rejects.toThrow(NotFoundException);
		});
	});
});
