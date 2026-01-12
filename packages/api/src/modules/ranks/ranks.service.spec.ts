import { BadRequestException, NotFoundException } from "@nestjs/common";
import { Test, type TestingModule } from "@nestjs/testing";
import { PrismaService } from "#api/database/prisma.service";
import { RanksService } from "#api/modules/ranks/ranks.service";

const MOCK_TENANT_ID = "tenant-123";
const MOCK_RANK_ID = "rank-123";

const mockRank = {
	id: MOCK_RANK_ID,
	tenantId: MOCK_TENANT_ID,
	code: "CPT",
	name: "Captain",
	nameAm: "\u12AB\u1355\u1274\u1295",
	level: 10,
	category: "OFFICER",
	baseSalary: { toString: () => "15000.00" },
	ceilingSalary: { toString: () => "20000.00" },
	stepCount: 9,
	stepPeriodYears: 2,
	retirementAge: 55,
	minYearsForPromotion: 4,
	minAppraisalScore: 80,
	badgePath: null,
	sortOrder: 10,
	isActive: true,
	createdAt: new Date(),
	updatedAt: new Date(),
};

const mockSalarySteps = [
	{ id: "step-0", rankId: MOCK_RANK_ID, stepNumber: 0, salaryAmount: { toString: () => "15000.00" }, yearsRequired: 0 },
	{ id: "step-1", rankId: MOCK_RANK_ID, stepNumber: 1, salaryAmount: { toString: () => "15500.00" }, yearsRequired: 2 },
];

const mockPrismaService = {
	militaryRank: {
		findFirst: jest.fn(),
		findMany: jest.fn(),
		findUnique: jest.fn(),
		create: jest.fn(),
		update: jest.fn(),
		delete: jest.fn(),
	},
	militaryRankSalaryStep: {
		createMany: jest.fn(),
		deleteMany: jest.fn(),
	},
	employee: {
		count: jest.fn(),
	},
};

describe("RanksService", () => {
	let service: RanksService;
	let prisma: typeof mockPrismaService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [RanksService, { provide: PrismaService, useValue: mockPrismaService }],
		}).compile();

		service = module.get<RanksService>(RanksService);
		prisma = module.get(PrismaService);

		jest.clearAllMocks();
	});

	describe("create", () => {
		const createDto = {
			code: "MAJ",
			name: "Major",
			nameAm: "\u121C\u1300\u122D",
			level: 11,
			category: "OFFICER",
			baseSalary: 18000,
			ceilingSalary: 25000,
			retirementAge: 55,
		};

		it("should create a new rank", async () => {
			const createdRank = {
				...mockRank,
				...createDto,
				id: "new-id",
				baseSalary: { toString: () => "18000.00" },
				ceilingSalary: { toString: () => "25000.00" },
			};
			prisma.militaryRank.findFirst.mockResolvedValue(null);
			prisma.militaryRank.create.mockResolvedValue(createdRank);
			prisma.militaryRankSalaryStep.createMany.mockResolvedValue({ count: 10 });
			prisma.militaryRank.findUnique.mockResolvedValue({
				...createdRank,
				salarySteps: mockSalarySteps,
			});

			const result = await service.create(MOCK_TENANT_ID, createDto);

			expect(result.code).toBe("MAJ");
			expect(prisma.militaryRank.create).toHaveBeenCalled();
			expect(prisma.militaryRankSalaryStep.createMany).toHaveBeenCalled();
		});

		it("should throw BadRequestException if rank code exists", async () => {
			prisma.militaryRank.findFirst.mockResolvedValue(mockRank);

			await expect(service.create(MOCK_TENANT_ID, { ...createDto, code: "CPT" })).rejects.toThrow(BadRequestException);
		});
	});

	describe("findAll", () => {
		it("should return all ranks including system ranks", async () => {
			prisma.militaryRank.findMany.mockResolvedValue([mockRank]);

			const result = await service.findAll(MOCK_TENANT_ID);

			expect(result).toHaveLength(1);
			expect(result[0].code).toBe("CPT");
		});
	});

	describe("findByCategory", () => {
		it("should return ranks for a specific category", async () => {
			prisma.militaryRank.findMany.mockResolvedValue([mockRank]);

			const result = await service.findByCategory(MOCK_TENANT_ID, "OFFICER");

			expect(result).toHaveLength(1);
			expect(result[0].category).toBe("OFFICER");
		});
	});

	describe("findOne", () => {
		it("should return a rank by id", async () => {
			prisma.militaryRank.findFirst.mockResolvedValue(mockRank);

			const result = await service.findOne(MOCK_TENANT_ID, MOCK_RANK_ID);

			expect(result.id).toBe(MOCK_RANK_ID);
		});

		it("should throw NotFoundException if rank not found", async () => {
			prisma.militaryRank.findFirst.mockResolvedValue(null);

			await expect(service.findOne(MOCK_TENANT_ID, "nonexistent")).rejects.toThrow(NotFoundException);
		});
	});

	describe("update", () => {
		const updateDto = { name: "Updated Name" };

		it("should update a rank", async () => {
			const updatedRank = { ...mockRank, ...updateDto };
			prisma.militaryRank.findFirst.mockResolvedValue(mockRank);
			prisma.militaryRank.update.mockResolvedValue(updatedRank);
			prisma.militaryRank.findUnique.mockResolvedValue({
				...updatedRank,
				salarySteps: mockSalarySteps,
			});

			const result = await service.update(MOCK_TENANT_ID, MOCK_RANK_ID, updateDto);

			expect(result.name).toBe("Updated Name");
		});

		it("should throw NotFoundException if rank not found", async () => {
			prisma.militaryRank.findFirst.mockResolvedValue(null);

			await expect(service.update(MOCK_TENANT_ID, "nonexistent", updateDto)).rejects.toThrow(NotFoundException);
		});
	});

	describe("remove", () => {
		it("should delete a rank", async () => {
			prisma.militaryRank.findFirst.mockResolvedValue(mockRank);
			prisma.employee.count.mockResolvedValue(0);
			prisma.militaryRankSalaryStep.deleteMany.mockResolvedValue({ count: 10 });
			prisma.militaryRank.delete.mockResolvedValue(mockRank);

			const result = await service.remove(MOCK_TENANT_ID, MOCK_RANK_ID);

			expect(result.message).toBe("Rank deleted successfully");
		});

		it("should throw NotFoundException if rank not found", async () => {
			prisma.militaryRank.findFirst.mockResolvedValue(null);

			await expect(service.remove(MOCK_TENANT_ID, "nonexistent")).rejects.toThrow(NotFoundException);
		});

		it("should throw BadRequestException if employees are assigned", async () => {
			prisma.militaryRank.findFirst.mockResolvedValue(mockRank);
			prisma.employee.count.mockResolvedValue(5);

			await expect(service.remove(MOCK_TENANT_ID, MOCK_RANK_ID)).rejects.toThrow(BadRequestException);
		});
	});
});
