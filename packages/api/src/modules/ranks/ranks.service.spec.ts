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

const mockPrismaService = {
	militaryRank: {
		findFirst: jest.fn(),
		findMany: jest.fn(),
		create: jest.fn(),
		update: jest.fn(),
		delete: jest.fn(),
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
			baseSalary: "18000.00",
			ceilingSalary: "25000.00",
			retirementAge: 55,
		};

		it("should create a new rank", async () => {
			prisma.militaryRank.findFirst.mockResolvedValue(null);
			prisma.militaryRank.create.mockResolvedValue({
				...mockRank,
				...createDto,
				id: "new-id",
				baseSalary: { toString: () => createDto.baseSalary },
				ceilingSalary: { toString: () => createDto.ceilingSalary },
			});

			const result = await service.create(MOCK_TENANT_ID, createDto);

			expect(result.code).toBe("MAJ");
			expect(prisma.militaryRank.create).toHaveBeenCalled();
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
			prisma.militaryRank.findFirst.mockResolvedValue(mockRank);
			prisma.militaryRank.update.mockResolvedValue({ ...mockRank, ...updateDto });

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
			prisma.militaryRank.delete.mockResolvedValue(mockRank);

			const result = await service.remove(MOCK_TENANT_ID, MOCK_RANK_ID);

			expect(result.message).toBe("Rank deleted successfully");
		});

		it("should throw NotFoundException if rank not found", async () => {
			prisma.militaryRank.findFirst.mockResolvedValue(null);

			await expect(service.remove(MOCK_TENANT_ID, "nonexistent")).rejects.toThrow(NotFoundException);
		});
	});
});
