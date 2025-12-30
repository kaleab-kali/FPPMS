import { BadRequestException, NotFoundException } from "@nestjs/common";
import { Test, type TestingModule } from "@nestjs/testing";
import { EmployeeStatus, EmployeeType, Gender, MaritalStatus, WorkScheduleType } from "@prisma/client";
import { ACCESS_SCOPES } from "#api/common/constants/roles.constant";
import type { AccessContext } from "#api/common/interfaces/request-with-user.interface";
import { PrismaService } from "#api/database/prisma.service";
import { EmployeesService } from "#api/modules/employees/employees.service";
import { EmployeeIdGeneratorService } from "#api/modules/employees/services/employee-id-generator.service";
import { RetirementCalculationService } from "#api/modules/employees/services/retirement-calculation.service";

const MOCK_TENANT_ID = "tenant-123";
const MOCK_EMPLOYEE_ID = "emp-123";
const MOCK_USER_ID = "user-123";
const MOCK_CENTER_ID = "center-123";
const MOCK_DEPARTMENT_ID = "dept-123";
const MOCK_POSITION_ID = "pos-123";
const MOCK_RANK_ID = "rank-123";

const mockAccessContext: AccessContext = {
	centerId: MOCK_CENTER_ID,
	roleAccessScope: ACCESS_SCOPES.ALL_CENTERS,
	effectiveAccessScope: ACCESS_SCOPES.ALL_CENTERS,
};

const mockEmployee = {
	id: MOCK_EMPLOYEE_ID,
	tenantId: MOCK_TENANT_ID,
	employeeId: "MIL-2024-0001",
	employeeType: EmployeeType.MILITARY,
	firstName: "John",
	firstNameAm: "ጆን",
	middleName: "Doe",
	middleNameAm: "ዶ",
	lastName: "Smith",
	lastNameAm: "ስሚዝ",
	fullName: "John Doe Smith",
	fullNameAm: "ጆን ዶ ስሚዝ",
	gender: Gender.MALE,
	dateOfBirth: new Date("1990-01-01"),
	birthPlace: "Addis Ababa",
	birthPlaceAm: "አዲስ አበባ",
	nationality: "Ethiopian",
	primaryPhone: "+251911111111",
	status: EmployeeStatus.ACTIVE,
	maritalStatus: MaritalStatus.SINGLE,
	workScheduleType: WorkScheduleType.REGULAR,
	employmentDate: new Date("2024-01-01"),
	centerId: MOCK_CENTER_ID,
	departmentId: MOCK_DEPARTMENT_ID,
	positionId: MOCK_POSITION_ID,
	rankId: MOCK_RANK_ID,
	isTransfer: false,
	faydaVerified: false,
	currentSalaryStep: 0,
	currentSalary: 10000,
	deletedAt: null,
	createdAt: new Date(),
	updatedAt: new Date(),
	createdBy: MOCK_USER_ID,
	center: { id: MOCK_CENTER_ID, name: "Main Center" },
	department: { id: MOCK_DEPARTMENT_ID, name: "IT Department" },
	position: { id: MOCK_POSITION_ID, name: "Developer" },
	rank: { id: MOCK_RANK_ID, name: "Captain" },
	addresses: [],
	motherInfo: null,
	emergencyContacts: [],
};

const mockPrismaService = {
	employee: {
		create: jest.fn(),
		findFirst: jest.fn(),
		findMany: jest.fn(),
		count: jest.fn(),
		update: jest.fn(),
		groupBy: jest.fn(),
	},
	militaryRank: {
		findFirst: jest.fn(),
	},
	center: {
		findFirst: jest.fn(),
	},
	department: {
		findFirst: jest.fn(),
	},
	position: {
		findFirst: jest.fn(),
	},
	region: {
		findMany: jest.fn().mockResolvedValue([]),
	},
	subCity: {
		findMany: jest.fn().mockResolvedValue([]),
	},
	woreda: {
		findMany: jest.fn().mockResolvedValue([]),
	},
};

const mockEmployeeIdGenerator = {
	generateEmployeeId: jest.fn().mockResolvedValue("MIL-2024-0001"),
};

const mockRetirementCalculation = {
	calculateRetirementDate: jest.fn().mockResolvedValue({
		retirementDate: new Date("2050-01-01"),
		yearsUntilRetirement: 26,
	}),
};

describe("EmployeesService", () => {
	let service: EmployeesService;
	let prisma: typeof mockPrismaService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				EmployeesService,
				{ provide: PrismaService, useValue: mockPrismaService },
				{ provide: EmployeeIdGeneratorService, useValue: mockEmployeeIdGenerator },
				{ provide: RetirementCalculationService, useValue: mockRetirementCalculation },
			],
		}).compile();

		service = module.get<EmployeesService>(EmployeesService);
		prisma = module.get(PrismaService);

		jest.clearAllMocks();
	});

	describe("findOne", () => {
		it("should return an employee by id", async () => {
			prisma.employee.findFirst.mockResolvedValue(mockEmployee);

			const result = await service.findOne(MOCK_TENANT_ID, MOCK_EMPLOYEE_ID, mockAccessContext);

			expect(result).toBeDefined();
			expect(result.id).toBe(MOCK_EMPLOYEE_ID);
			expect(result.fullName).toBe("John Doe Smith");
			expect(prisma.employee.findFirst).toHaveBeenCalledWith({
				where: { id: MOCK_EMPLOYEE_ID, tenantId: MOCK_TENANT_ID, deletedAt: null },
				include: expect.any(Object),
			});
		});

		it("should throw NotFoundException when employee not found", async () => {
			prisma.employee.findFirst.mockResolvedValue(null);

			await expect(service.findOne(MOCK_TENANT_ID, "nonexistent", mockAccessContext)).rejects.toThrow(
				NotFoundException,
			);
		});
	});

	describe("findByEmployeeId", () => {
		it("should return an employee by employeeId", async () => {
			prisma.employee.findFirst.mockResolvedValue(mockEmployee);

			const result = await service.findByEmployeeId(MOCK_TENANT_ID, "MIL-2024-0001", mockAccessContext);

			expect(result).toBeDefined();
			expect(result.employeeId).toBe("MIL-2024-0001");
		});

		it("should throw NotFoundException when employee not found", async () => {
			prisma.employee.findFirst.mockResolvedValue(null);

			await expect(service.findByEmployeeId(MOCK_TENANT_ID, "nonexistent", mockAccessContext)).rejects.toThrow(
				NotFoundException,
			);
		});
	});

	describe("findAll", () => {
		it("should return paginated list of employees", async () => {
			prisma.employee.findMany.mockResolvedValue([mockEmployee]);
			prisma.employee.count.mockResolvedValue(1);

			const result = await service.findAll(MOCK_TENANT_ID, { page: 1, pageSize: 20 }, mockAccessContext);

			expect(result.data).toHaveLength(1);
			expect(result.total).toBe(1);
			expect(result.page).toBe(1);
			expect(result.pageSize).toBe(20);
		});

		it("should filter by search term", async () => {
			prisma.employee.findMany.mockResolvedValue([mockEmployee]);
			prisma.employee.count.mockResolvedValue(1);

			await service.findAll(MOCK_TENANT_ID, { search: "John" }, mockAccessContext);

			expect(prisma.employee.findMany).toHaveBeenCalledWith(
				expect.objectContaining({
					where: expect.objectContaining({
						OR: expect.arrayContaining([
							expect.objectContaining({ fullName: { contains: "John", mode: "insensitive" } }),
						]),
					}),
				}),
			);
		});

		it("should filter by employee type", async () => {
			prisma.employee.findMany.mockResolvedValue([mockEmployee]);
			prisma.employee.count.mockResolvedValue(1);

			await service.findAll(MOCK_TENANT_ID, { employeeType: EmployeeType.MILITARY }, mockAccessContext);

			expect(prisma.employee.findMany).toHaveBeenCalledWith(
				expect.objectContaining({
					where: expect.objectContaining({ employeeType: EmployeeType.MILITARY }),
				}),
			);
		});
	});

	describe("registerMilitaryEmployee", () => {
		const createDto = {
			firstName: "John",
			firstNameAm: "ጆን",
			middleName: "Doe",
			middleNameAm: "ዶ",
			lastName: "Smith",
			lastNameAm: "ስሚዝ",
			gender: Gender.MALE,
			dateOfBirth: new Date("1990-01-01"),
			primaryPhone: "+251911111111",
			employmentDate: new Date("2024-01-01"),
			centerId: MOCK_CENTER_ID,
			departmentId: MOCK_DEPARTMENT_ID,
			positionId: MOCK_POSITION_ID,
			rankId: MOCK_RANK_ID,
		};

		it("should create a military employee", async () => {
			prisma.militaryRank.findFirst.mockResolvedValue({
				id: MOCK_RANK_ID,
				baseSalary: 10000,
				salarySteps: [],
			});
			prisma.center.findFirst.mockResolvedValue({ id: MOCK_CENTER_ID });
			prisma.department.findFirst.mockResolvedValue({ id: MOCK_DEPARTMENT_ID });
			prisma.position.findFirst.mockResolvedValue({ id: MOCK_POSITION_ID });
			prisma.employee.create.mockResolvedValue(mockEmployee);

			const result = await service.registerMilitaryEmployee(MOCK_TENANT_ID, createDto, MOCK_USER_ID, mockAccessContext);

			expect(result).toBeDefined();
			expect(result.employeeType).toBe(EmployeeType.MILITARY);
			expect(mockEmployeeIdGenerator.generateEmployeeId).toHaveBeenCalledWith(MOCK_TENANT_ID, EmployeeType.MILITARY);
		});

		it("should throw BadRequestException when rank not found", async () => {
			prisma.militaryRank.findFirst.mockResolvedValue(null);

			await expect(
				service.registerMilitaryEmployee(MOCK_TENANT_ID, createDto, MOCK_USER_ID, mockAccessContext),
			).rejects.toThrow(BadRequestException);
		});
	});

	describe("update", () => {
		const updateDto = {
			firstName: "Jane",
			primaryPhone: "+251922222222",
		};

		it("should update an employee", async () => {
			prisma.employee.findFirst.mockResolvedValue(mockEmployee);
			prisma.employee.update.mockResolvedValue({ ...mockEmployee, firstName: "Jane" });

			const result = await service.update(MOCK_TENANT_ID, MOCK_EMPLOYEE_ID, updateDto, MOCK_USER_ID, mockAccessContext);

			expect(result).toBeDefined();
			expect(prisma.employee.update).toHaveBeenCalled();
		});

		it("should throw NotFoundException when employee not found", async () => {
			prisma.employee.findFirst.mockResolvedValue(null);

			await expect(
				service.update(MOCK_TENANT_ID, "nonexistent", updateDto, MOCK_USER_ID, mockAccessContext),
			).rejects.toThrow(NotFoundException);
		});
	});

	describe("remove", () => {
		it("should soft delete an employee", async () => {
			prisma.employee.findFirst.mockResolvedValue(mockEmployee);
			prisma.employee.update.mockResolvedValue({ ...mockEmployee, deletedAt: new Date() });

			const result = await service.remove(MOCK_TENANT_ID, MOCK_EMPLOYEE_ID, MOCK_USER_ID, mockAccessContext);

			expect(result.message).toBe("Employee deleted successfully");
			expect(prisma.employee.update).toHaveBeenCalledWith({
				where: { id: MOCK_EMPLOYEE_ID },
				data: expect.objectContaining({
					deletedAt: expect.any(Date),
					status: EmployeeStatus.INACTIVE,
				}),
			});
		});

		it("should throw NotFoundException when employee not found", async () => {
			prisma.employee.findFirst.mockResolvedValue(null);

			await expect(service.remove(MOCK_TENANT_ID, "nonexistent", MOCK_USER_ID, mockAccessContext)).rejects.toThrow(
				NotFoundException,
			);
		});
	});

	describe("changeStatus", () => {
		it("should change employee status", async () => {
			prisma.employee.findFirst.mockResolvedValue(mockEmployee);
			prisma.employee.update.mockResolvedValue({ ...mockEmployee, status: EmployeeStatus.SUSPENDED });

			const result = await service.changeStatus(
				MOCK_TENANT_ID,
				MOCK_EMPLOYEE_ID,
				{
					status: EmployeeStatus.SUSPENDED,
					reason: "Disciplinary action",
					effectiveDate: new Date(),
				},
				MOCK_USER_ID,
				mockAccessContext,
			);

			expect(result).toBeDefined();
			expect(prisma.employee.update).toHaveBeenCalledWith(
				expect.objectContaining({
					data: expect.objectContaining({
						status: EmployeeStatus.SUSPENDED,
					}),
				}),
			);
		});

		it("should throw NotFoundException when employee not found", async () => {
			prisma.employee.findFirst.mockResolvedValue(null);

			await expect(
				service.changeStatus(
					MOCK_TENANT_ID,
					"nonexistent",
					{
						status: EmployeeStatus.SUSPENDED,
						reason: "Test",
						effectiveDate: new Date(),
					},
					MOCK_USER_ID,
					mockAccessContext,
				),
			).rejects.toThrow(NotFoundException);
		});
	});

	describe("returnToActive", () => {
		it("should return suspended employee to active", async () => {
			prisma.employee.findFirst.mockResolvedValue({ ...mockEmployee, status: EmployeeStatus.SUSPENDED });
			prisma.employee.update.mockResolvedValue({ ...mockEmployee, status: EmployeeStatus.ACTIVE });

			const result = await service.returnToActive(MOCK_TENANT_ID, MOCK_EMPLOYEE_ID, MOCK_USER_ID, mockAccessContext);

			expect(result).toBeDefined();
			expect(prisma.employee.update).toHaveBeenCalledWith(
				expect.objectContaining({
					data: expect.objectContaining({
						status: EmployeeStatus.ACTIVE,
					}),
				}),
			);
		});

		it("should throw BadRequestException when employee is already active", async () => {
			prisma.employee.findFirst.mockResolvedValue(mockEmployee);

			await expect(
				service.returnToActive(MOCK_TENANT_ID, MOCK_EMPLOYEE_ID, MOCK_USER_ID, mockAccessContext),
			).rejects.toThrow(BadRequestException);
		});

		it("should throw BadRequestException when employee is deceased", async () => {
			prisma.employee.findFirst.mockResolvedValue({ ...mockEmployee, status: EmployeeStatus.DECEASED });

			await expect(
				service.returnToActive(MOCK_TENANT_ID, MOCK_EMPLOYEE_ID, MOCK_USER_ID, mockAccessContext),
			).rejects.toThrow(BadRequestException);
		});
	});

	describe("getStatistics", () => {
		it("should return employee statistics", async () => {
			prisma.employee.count.mockResolvedValue(100);
			prisma.employee.groupBy
				.mockResolvedValueOnce([
					{ employeeType: EmployeeType.MILITARY, _count: 60 },
					{ employeeType: EmployeeType.CIVILIAN, _count: 30 },
					{ employeeType: EmployeeType.TEMPORARY, _count: 10 },
				])
				.mockResolvedValueOnce([
					{ status: EmployeeStatus.ACTIVE, _count: 90 },
					{ status: EmployeeStatus.INACTIVE, _count: 10 },
				])
				.mockResolvedValueOnce([
					{ gender: Gender.MALE, _count: 70 },
					{ gender: Gender.FEMALE, _count: 30 },
				]);

			const result = await service.getStatistics(MOCK_TENANT_ID, mockAccessContext);

			expect(result.total).toBe(100);
			expect(result.byType[EmployeeType.MILITARY]).toBe(60);
			expect(result.byStatus[EmployeeStatus.ACTIVE]).toBe(90);
			expect(result.byGender[Gender.MALE]).toBe(70);
		});
	});
});
