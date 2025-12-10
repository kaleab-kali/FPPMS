import { BadRequestException, NotFoundException } from "@nestjs/common";
import { Test, type TestingModule } from "@nestjs/testing";
import { PrismaService } from "#api/database/prisma.service";
import { CentersService } from "#api/modules/centers/centers.service";

const MOCK_TENANT_ID = "tenant-123";
const MOCK_CENTER_ID = "center-123";

const mockCenter = {
	id: MOCK_CENTER_ID,
	tenantId: MOCK_TENANT_ID,
	code: "HQ",
	name: "Headquarters",
	nameAm: "\u12D8\u1241 \u1265\u122E",
	type: "HEADQUARTERS",
	regionId: null,
	subCityId: null,
	woredaId: null,
	address: "Addis Ababa",
	phone: "+251111234567",
	email: "hq@fpc.gov.et",
	parentCenterId: null,
	commanderId: null,
	isActive: true,
	deletedAt: null,
	createdAt: new Date(),
	updatedAt: new Date(),
};

const mockPrismaService = {
	center: {
		findFirst: jest.fn(),
		findMany: jest.fn(),
		create: jest.fn(),
		update: jest.fn(),
	},
};

describe("CentersService", () => {
	let service: CentersService;
	let prisma: typeof mockPrismaService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [CentersService, { provide: PrismaService, useValue: mockPrismaService }],
		}).compile();

		service = module.get<CentersService>(CentersService);
		prisma = module.get(PrismaService);

		jest.clearAllMocks();
	});

	describe("create", () => {
		const createDto = {
			code: "BR01",
			name: "Branch 01",
			type: "BRANCH",
		};

		it("should create a new center", async () => {
			prisma.center.findFirst.mockResolvedValue(null);
			prisma.center.create.mockResolvedValue({ ...mockCenter, ...createDto, id: "new-id" });

			const result = await service.create(MOCK_TENANT_ID, createDto);

			expect(result.code).toBe("BR01");
			expect(prisma.center.create).toHaveBeenCalled();
		});

		it("should throw BadRequestException if center code exists", async () => {
			prisma.center.findFirst.mockResolvedValue(mockCenter);

			await expect(service.create(MOCK_TENANT_ID, { ...createDto, code: "HQ" })).rejects.toThrow(BadRequestException);
		});

		it("should throw BadRequestException if parent center not found", async () => {
			prisma.center.findFirst.mockResolvedValueOnce(null).mockResolvedValueOnce(null);

			await expect(service.create(MOCK_TENANT_ID, { ...createDto, parentCenterId: "invalid-parent" })).rejects.toThrow(
				BadRequestException,
			);
		});
	});

	describe("findAll", () => {
		it("should return all centers for tenant", async () => {
			prisma.center.findMany.mockResolvedValue([mockCenter]);

			const result = await service.findAll(MOCK_TENANT_ID);

			expect(result).toHaveLength(1);
			expect(result[0].code).toBe("HQ");
		});
	});

	describe("findOne", () => {
		it("should return a center by id", async () => {
			prisma.center.findFirst.mockResolvedValue(mockCenter);

			const result = await service.findOne(MOCK_TENANT_ID, MOCK_CENTER_ID);

			expect(result.id).toBe(MOCK_CENTER_ID);
		});

		it("should throw NotFoundException if center not found", async () => {
			prisma.center.findFirst.mockResolvedValue(null);

			await expect(service.findOne(MOCK_TENANT_ID, "nonexistent")).rejects.toThrow(NotFoundException);
		});
	});

	describe("findByCode", () => {
		it("should return a center by code", async () => {
			prisma.center.findFirst.mockResolvedValue(mockCenter);

			const result = await service.findByCode(MOCK_TENANT_ID, "HQ");

			expect(result.code).toBe("HQ");
		});

		it("should throw NotFoundException if center not found", async () => {
			prisma.center.findFirst.mockResolvedValue(null);

			await expect(service.findByCode(MOCK_TENANT_ID, "NONEXISTENT")).rejects.toThrow(NotFoundException);
		});
	});

	describe("findHierarchy", () => {
		it("should return root centers when no parentId", async () => {
			prisma.center.findMany.mockResolvedValue([mockCenter]);

			const result = await service.findHierarchy(MOCK_TENANT_ID);

			expect(result).toHaveLength(1);
		});

		it("should return child centers for given parentId", async () => {
			const childCenter = { ...mockCenter, id: "child-1", parentCenterId: MOCK_CENTER_ID };
			prisma.center.findMany.mockResolvedValue([childCenter]);

			const result = await service.findHierarchy(MOCK_TENANT_ID, MOCK_CENTER_ID);

			expect(result).toHaveLength(1);
			expect(result[0].parentCenterId).toBe(MOCK_CENTER_ID);
		});
	});

	describe("update", () => {
		const updateDto = { name: "Updated Name" };

		it("should update a center", async () => {
			prisma.center.findFirst.mockResolvedValue(mockCenter);
			prisma.center.update.mockResolvedValue({ ...mockCenter, ...updateDto });

			const result = await service.update(MOCK_TENANT_ID, MOCK_CENTER_ID, updateDto);

			expect(result.name).toBe("Updated Name");
		});

		it("should throw NotFoundException if center not found", async () => {
			prisma.center.findFirst.mockResolvedValue(null);

			await expect(service.update(MOCK_TENANT_ID, "nonexistent", updateDto)).rejects.toThrow(NotFoundException);
		});

		it("should throw BadRequestException if center is its own parent", async () => {
			prisma.center.findFirst.mockResolvedValue(mockCenter);

			await expect(service.update(MOCK_TENANT_ID, MOCK_CENTER_ID, { parentCenterId: MOCK_CENTER_ID })).rejects.toThrow(
				BadRequestException,
			);
		});
	});

	describe("remove", () => {
		it("should soft delete a center", async () => {
			prisma.center.findFirst.mockResolvedValue(mockCenter);
			prisma.center.findMany.mockResolvedValue([]);
			prisma.center.update.mockResolvedValue({ ...mockCenter, deletedAt: new Date() });

			const result = await service.remove(MOCK_TENANT_ID, MOCK_CENTER_ID);

			expect(result.message).toBe("Center deleted successfully");
		});

		it("should throw NotFoundException if center not found", async () => {
			prisma.center.findFirst.mockResolvedValue(null);

			await expect(service.remove(MOCK_TENANT_ID, "nonexistent")).rejects.toThrow(NotFoundException);
		});

		it("should throw BadRequestException if center has children", async () => {
			prisma.center.findFirst.mockResolvedValue(mockCenter);
			prisma.center.findMany.mockResolvedValue([{ id: "child-1" }]);

			await expect(service.remove(MOCK_TENANT_ID, MOCK_CENTER_ID)).rejects.toThrow(BadRequestException);
		});
	});
});
