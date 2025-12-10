import { BadRequestException, NotFoundException } from "@nestjs/common";
import { Test, type TestingModule } from "@nestjs/testing";
import { PrismaService } from "#api/database/prisma.service";
import { RegionsService } from "#api/modules/lookups/regions.service";

const MOCK_TENANT_ID = "tenant-123";
const MOCK_REGION_ID = "region-123";

const mockRegion = {
	id: MOCK_REGION_ID,
	tenantId: MOCK_TENANT_ID,
	code: "AA",
	name: "Addis Ababa",
	nameAm: "\u12A0\u12F2\u1235 \u12A0\u1260\u1263",
	sortOrder: 0,
	isActive: true,
	createdAt: new Date(),
	updatedAt: new Date(),
};

const mockPrismaService = {
	region: {
		findFirst: jest.fn(),
		findMany: jest.fn(),
		create: jest.fn(),
		update: jest.fn(),
		delete: jest.fn(),
	},
	subCity: {
		findMany: jest.fn(),
	},
};

describe("RegionsService", () => {
	let service: RegionsService;
	let prisma: typeof mockPrismaService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [RegionsService, { provide: PrismaService, useValue: mockPrismaService }],
		}).compile();

		service = module.get<RegionsService>(RegionsService);
		prisma = module.get(PrismaService);

		jest.clearAllMocks();
	});

	describe("create", () => {
		const createDto = {
			code: "OR",
			name: "Oromia",
			nameAm: "\u12A6\u122E\u121A\u12EB",
		};

		it("should create a new region", async () => {
			prisma.region.findFirst.mockResolvedValue(null);
			prisma.region.create.mockResolvedValue({ ...mockRegion, ...createDto, id: "new-id" });

			const result = await service.create(MOCK_TENANT_ID, createDto);

			expect(result.code).toBe("OR");
			expect(prisma.region.create).toHaveBeenCalled();
		});

		it("should throw BadRequestException if region code exists", async () => {
			prisma.region.findFirst.mockResolvedValue(mockRegion);

			await expect(service.create(MOCK_TENANT_ID, { ...createDto, code: "AA" })).rejects.toThrow(BadRequestException);
		});
	});

	describe("findAll", () => {
		it("should return all regions for tenant", async () => {
			prisma.region.findMany.mockResolvedValue([mockRegion]);

			const result = await service.findAll(MOCK_TENANT_ID);

			expect(result).toHaveLength(1);
			expect(result[0].code).toBe("AA");
		});
	});

	describe("findOne", () => {
		it("should return a region by id", async () => {
			prisma.region.findFirst.mockResolvedValue(mockRegion);

			const result = await service.findOne(MOCK_TENANT_ID, MOCK_REGION_ID);

			expect(result.id).toBe(MOCK_REGION_ID);
		});

		it("should throw NotFoundException if region not found", async () => {
			prisma.region.findFirst.mockResolvedValue(null);

			await expect(service.findOne(MOCK_TENANT_ID, "nonexistent")).rejects.toThrow(NotFoundException);
		});
	});

	describe("update", () => {
		const updateDto = { name: "Updated Name" };

		it("should update a region", async () => {
			prisma.region.findFirst.mockResolvedValue(mockRegion);
			prisma.region.update.mockResolvedValue({ ...mockRegion, ...updateDto });

			const result = await service.update(MOCK_TENANT_ID, MOCK_REGION_ID, updateDto);

			expect(result.name).toBe("Updated Name");
		});

		it("should throw NotFoundException if region not found", async () => {
			prisma.region.findFirst.mockResolvedValue(null);

			await expect(service.update(MOCK_TENANT_ID, "nonexistent", updateDto)).rejects.toThrow(NotFoundException);
		});
	});

	describe("remove", () => {
		it("should delete a region", async () => {
			prisma.region.findFirst.mockResolvedValue(mockRegion);
			prisma.subCity.findMany.mockResolvedValue([]);
			prisma.region.delete.mockResolvedValue(mockRegion);

			const result = await service.remove(MOCK_TENANT_ID, MOCK_REGION_ID);

			expect(result.message).toBe("Region deleted successfully");
		});

		it("should throw NotFoundException if region not found", async () => {
			prisma.region.findFirst.mockResolvedValue(null);

			await expect(service.remove(MOCK_TENANT_ID, "nonexistent")).rejects.toThrow(NotFoundException);
		});

		it("should throw BadRequestException if region has sub-cities", async () => {
			prisma.region.findFirst.mockResolvedValue(mockRegion);
			prisma.subCity.findMany.mockResolvedValue([{ id: "subcity-1" }]);

			await expect(service.remove(MOCK_TENANT_ID, MOCK_REGION_ID)).rejects.toThrow(BadRequestException);
		});
	});
});
