import { BadRequestException, NotFoundException } from "@nestjs/common";
import { Test, type TestingModule } from "@nestjs/testing";
import { PrismaService } from "#api/database/prisma.service";
import { WoredasService } from "#api/modules/lookups/woredas.service";

const MOCK_TENANT_ID = "tenant-123";
const MOCK_SUBCITY_ID = "subcity-123";
const MOCK_WOREDA_ID = "woreda-123";

const mockWoreda = {
	id: MOCK_WOREDA_ID,
	tenantId: MOCK_TENANT_ID,
	subCityId: MOCK_SUBCITY_ID,
	code: "W01",
	name: "Woreda 01",
	nameAm: "\u12CF\u1228\u12F3 01",
	sortOrder: 0,
	isActive: true,
	createdAt: new Date(),
	updatedAt: new Date(),
};

const mockPrismaService = {
	woreda: {
		findFirst: jest.fn(),
		findMany: jest.fn(),
		create: jest.fn(),
		update: jest.fn(),
		delete: jest.fn(),
	},
	subCity: {
		findFirst: jest.fn(),
	},
};

describe("WoredasService", () => {
	let service: WoredasService;
	let prisma: typeof mockPrismaService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [WoredasService, { provide: PrismaService, useValue: mockPrismaService }],
		}).compile();

		service = module.get<WoredasService>(WoredasService);
		prisma = module.get(PrismaService);

		jest.clearAllMocks();
	});

	describe("create", () => {
		const createDto = {
			subCityId: MOCK_SUBCITY_ID,
			code: "W02",
			name: "Woreda 02",
			nameAm: "\u12CF\u1228\u12F3 02",
		};

		it("should create a new woreda", async () => {
			prisma.subCity.findFirst.mockResolvedValue({ id: MOCK_SUBCITY_ID });
			prisma.woreda.findFirst.mockResolvedValue(null);
			prisma.woreda.create.mockResolvedValue({ ...mockWoreda, ...createDto, id: "new-id" });

			const result = await service.create(MOCK_TENANT_ID, createDto);

			expect(result.code).toBe("W02");
			expect(prisma.woreda.create).toHaveBeenCalled();
		});

		it("should throw BadRequestException if sub-city not found", async () => {
			prisma.subCity.findFirst.mockResolvedValue(null);

			await expect(service.create(MOCK_TENANT_ID, createDto)).rejects.toThrow(BadRequestException);
		});

		it("should throw BadRequestException if woreda code exists", async () => {
			prisma.subCity.findFirst.mockResolvedValue({ id: MOCK_SUBCITY_ID });
			prisma.woreda.findFirst.mockResolvedValue(mockWoreda);

			await expect(service.create(MOCK_TENANT_ID, { ...createDto, code: "W01" })).rejects.toThrow(BadRequestException);
		});
	});

	describe("findAll", () => {
		it("should return all woredas for tenant", async () => {
			prisma.woreda.findMany.mockResolvedValue([mockWoreda]);

			const result = await service.findAll(MOCK_TENANT_ID);

			expect(result).toHaveLength(1);
			expect(result[0].code).toBe("W01");
		});
	});

	describe("findBySubCity", () => {
		it("should return woredas for a specific sub-city", async () => {
			prisma.woreda.findMany.mockResolvedValue([mockWoreda]);

			const result = await service.findBySubCity(MOCK_TENANT_ID, MOCK_SUBCITY_ID);

			expect(result).toHaveLength(1);
			expect(result[0].subCityId).toBe(MOCK_SUBCITY_ID);
		});
	});

	describe("findOne", () => {
		it("should return a woreda by id", async () => {
			prisma.woreda.findFirst.mockResolvedValue(mockWoreda);

			const result = await service.findOne(MOCK_TENANT_ID, MOCK_WOREDA_ID);

			expect(result.id).toBe(MOCK_WOREDA_ID);
		});

		it("should throw NotFoundException if woreda not found", async () => {
			prisma.woreda.findFirst.mockResolvedValue(null);

			await expect(service.findOne(MOCK_TENANT_ID, "nonexistent")).rejects.toThrow(NotFoundException);
		});
	});

	describe("update", () => {
		const updateDto = { name: "Updated Name" };

		it("should update a woreda", async () => {
			prisma.woreda.findFirst.mockResolvedValue(mockWoreda);
			prisma.woreda.update.mockResolvedValue({ ...mockWoreda, ...updateDto });

			const result = await service.update(MOCK_TENANT_ID, MOCK_WOREDA_ID, updateDto);

			expect(result.name).toBe("Updated Name");
		});

		it("should throw NotFoundException if woreda not found", async () => {
			prisma.woreda.findFirst.mockResolvedValue(null);

			await expect(service.update(MOCK_TENANT_ID, "nonexistent", updateDto)).rejects.toThrow(NotFoundException);
		});
	});

	describe("remove", () => {
		it("should delete a woreda", async () => {
			prisma.woreda.findFirst.mockResolvedValue(mockWoreda);
			prisma.woreda.delete.mockResolvedValue(mockWoreda);

			const result = await service.remove(MOCK_TENANT_ID, MOCK_WOREDA_ID);

			expect(result.message).toBe("Woreda deleted successfully");
		});

		it("should throw NotFoundException if woreda not found", async () => {
			prisma.woreda.findFirst.mockResolvedValue(null);

			await expect(service.remove(MOCK_TENANT_ID, "nonexistent")).rejects.toThrow(NotFoundException);
		});
	});
});
