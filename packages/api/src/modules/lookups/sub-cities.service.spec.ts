import { BadRequestException, NotFoundException } from "@nestjs/common";
import { Test, type TestingModule } from "@nestjs/testing";
import { PrismaService } from "#api/database/prisma.service";
import { SubCitiesService } from "#api/modules/lookups/sub-cities.service";

const MOCK_TENANT_ID = "tenant-123";
const MOCK_REGION_ID = "region-123";
const MOCK_SUBCITY_ID = "subcity-123";

const mockSubCity = {
	id: MOCK_SUBCITY_ID,
	tenantId: MOCK_TENANT_ID,
	regionId: MOCK_REGION_ID,
	code: "BOLE",
	name: "Bole",
	nameAm: "\u1266\u120C",
	sortOrder: 0,
	isActive: true,
	createdAt: new Date(),
	updatedAt: new Date(),
};

const mockPrismaService = {
	subCity: {
		findFirst: jest.fn(),
		findMany: jest.fn(),
		create: jest.fn(),
		update: jest.fn(),
		delete: jest.fn(),
	},
	region: {
		findFirst: jest.fn(),
	},
	woreda: {
		findMany: jest.fn(),
	},
};

describe("SubCitiesService", () => {
	let service: SubCitiesService;
	let prisma: typeof mockPrismaService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [SubCitiesService, { provide: PrismaService, useValue: mockPrismaService }],
		}).compile();

		service = module.get<SubCitiesService>(SubCitiesService);
		prisma = module.get(PrismaService);

		jest.clearAllMocks();
	});

	describe("create", () => {
		const createDto = {
			regionId: MOCK_REGION_ID,
			code: "YEKA",
			name: "Yeka",
			nameAm: "\u12E8\u12AB",
		};

		it("should create a new sub-city", async () => {
			prisma.region.findFirst.mockResolvedValue({ id: MOCK_REGION_ID });
			prisma.subCity.findFirst.mockResolvedValue(null);
			prisma.subCity.create.mockResolvedValue({ ...mockSubCity, ...createDto, id: "new-id" });

			const result = await service.create(MOCK_TENANT_ID, createDto);

			expect(result.code).toBe("YEKA");
			expect(prisma.subCity.create).toHaveBeenCalled();
		});

		it("should throw BadRequestException if region not found", async () => {
			prisma.region.findFirst.mockResolvedValue(null);

			await expect(service.create(MOCK_TENANT_ID, createDto)).rejects.toThrow(BadRequestException);
		});

		it("should throw BadRequestException if sub-city code exists", async () => {
			prisma.region.findFirst.mockResolvedValue({ id: MOCK_REGION_ID });
			prisma.subCity.findFirst.mockResolvedValue(mockSubCity);

			await expect(service.create(MOCK_TENANT_ID, { ...createDto, code: "BOLE" })).rejects.toThrow(BadRequestException);
		});
	});

	describe("findAll", () => {
		it("should return all sub-cities for tenant", async () => {
			prisma.subCity.findMany.mockResolvedValue([mockSubCity]);

			const result = await service.findAll(MOCK_TENANT_ID);

			expect(result).toHaveLength(1);
			expect(result[0].code).toBe("BOLE");
		});
	});

	describe("findByRegion", () => {
		it("should return sub-cities for a specific region", async () => {
			prisma.subCity.findMany.mockResolvedValue([mockSubCity]);

			const result = await service.findByRegion(MOCK_TENANT_ID, MOCK_REGION_ID);

			expect(result).toHaveLength(1);
			expect(result[0].regionId).toBe(MOCK_REGION_ID);
		});
	});

	describe("findOne", () => {
		it("should return a sub-city by id", async () => {
			prisma.subCity.findFirst.mockResolvedValue(mockSubCity);

			const result = await service.findOne(MOCK_TENANT_ID, MOCK_SUBCITY_ID);

			expect(result.id).toBe(MOCK_SUBCITY_ID);
		});

		it("should throw NotFoundException if sub-city not found", async () => {
			prisma.subCity.findFirst.mockResolvedValue(null);

			await expect(service.findOne(MOCK_TENANT_ID, "nonexistent")).rejects.toThrow(NotFoundException);
		});
	});

	describe("update", () => {
		const updateDto = { name: "Updated Name" };

		it("should update a sub-city", async () => {
			prisma.subCity.findFirst.mockResolvedValue(mockSubCity);
			prisma.subCity.update.mockResolvedValue({ ...mockSubCity, ...updateDto });

			const result = await service.update(MOCK_TENANT_ID, MOCK_SUBCITY_ID, updateDto);

			expect(result.name).toBe("Updated Name");
		});

		it("should throw NotFoundException if sub-city not found", async () => {
			prisma.subCity.findFirst.mockResolvedValue(null);

			await expect(service.update(MOCK_TENANT_ID, "nonexistent", updateDto)).rejects.toThrow(NotFoundException);
		});
	});

	describe("remove", () => {
		it("should delete a sub-city", async () => {
			prisma.subCity.findFirst.mockResolvedValue(mockSubCity);
			prisma.woreda.findMany.mockResolvedValue([]);
			prisma.subCity.delete.mockResolvedValue(mockSubCity);

			const result = await service.remove(MOCK_TENANT_ID, MOCK_SUBCITY_ID);

			expect(result.message).toBe("Sub-city deleted successfully");
		});

		it("should throw NotFoundException if sub-city not found", async () => {
			prisma.subCity.findFirst.mockResolvedValue(null);

			await expect(service.remove(MOCK_TENANT_ID, "nonexistent")).rejects.toThrow(NotFoundException);
		});

		it("should throw BadRequestException if sub-city has woredas", async () => {
			prisma.subCity.findFirst.mockResolvedValue(mockSubCity);
			prisma.woreda.findMany.mockResolvedValue([{ id: "woreda-1" }]);

			await expect(service.remove(MOCK_TENANT_ID, MOCK_SUBCITY_ID)).rejects.toThrow(BadRequestException);
		});
	});
});
