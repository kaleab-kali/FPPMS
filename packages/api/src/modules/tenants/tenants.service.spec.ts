import { BadRequestException, NotFoundException } from "@nestjs/common";
import { Test, type TestingModule } from "@nestjs/testing";
import { PrismaService } from "#api/database/prisma.service";
import { TenantsService } from "#api/modules/tenants/tenants.service";

const MOCK_TENANT_ID = "tenant-123";

const mockTenant = {
	id: MOCK_TENANT_ID,
	name: "Federal Police Commission",
	code: "FPC",
	nameAm: "\u134C\u12F4\u122B\u120D \u1356\u120A\u1235 \u12AE\u121A\u123D\u1295",
	type: "HEADQUARTERS",
	isActive: true,
	settings: {},
	createdAt: new Date(),
	updatedAt: new Date(),
};

const mockPrismaService = {
	tenant: {
		findUnique: jest.fn(),
		findMany: jest.fn(),
		create: jest.fn(),
		update: jest.fn(),
	},
};

describe("TenantsService", () => {
	let service: TenantsService;
	let prisma: typeof mockPrismaService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [TenantsService, { provide: PrismaService, useValue: mockPrismaService }],
		}).compile();

		service = module.get<TenantsService>(TenantsService);
		prisma = module.get(PrismaService);

		jest.clearAllMocks();
	});

	describe("create", () => {
		const createDto = {
			name: "New Tenant",
			code: "NEW",
			nameAm: "\u12A0\u12F2\u1235",
			type: "BRANCH",
		};

		it("should create a new tenant", async () => {
			prisma.tenant.findUnique.mockResolvedValue(null);
			prisma.tenant.create.mockResolvedValue({ ...mockTenant, ...createDto, id: "new-id" });

			const result = await service.create(createDto);

			expect(result.code).toBe("NEW");
			expect(prisma.tenant.create).toHaveBeenCalled();
		});

		it("should throw BadRequestException if tenant code exists", async () => {
			prisma.tenant.findUnique.mockResolvedValue(mockTenant);

			await expect(service.create({ ...createDto, code: "FPC" })).rejects.toThrow(BadRequestException);
		});
	});

	describe("findAll", () => {
		it("should return all tenants", async () => {
			prisma.tenant.findMany.mockResolvedValue([mockTenant]);

			const result = await service.findAll();

			expect(result).toHaveLength(1);
			expect(result[0].code).toBe("FPC");
		});
	});

	describe("findOne", () => {
		it("should return a tenant by id", async () => {
			prisma.tenant.findUnique.mockResolvedValue(mockTenant);

			const result = await service.findOne(MOCK_TENANT_ID);

			expect(result.id).toBe(MOCK_TENANT_ID);
		});

		it("should throw NotFoundException if tenant not found", async () => {
			prisma.tenant.findUnique.mockResolvedValue(null);

			await expect(service.findOne("nonexistent")).rejects.toThrow(NotFoundException);
		});
	});

	describe("findByCode", () => {
		it("should return a tenant by code", async () => {
			prisma.tenant.findUnique.mockResolvedValue(mockTenant);

			const result = await service.findByCode("FPC");

			expect(result.code).toBe("FPC");
		});

		it("should throw NotFoundException if tenant not found", async () => {
			prisma.tenant.findUnique.mockResolvedValue(null);

			await expect(service.findByCode("NONEXISTENT")).rejects.toThrow(NotFoundException);
		});
	});

	describe("update", () => {
		const updateDto = { name: "Updated Name" };

		it("should update a tenant", async () => {
			prisma.tenant.findUnique.mockResolvedValue(mockTenant);
			prisma.tenant.update.mockResolvedValue({ ...mockTenant, ...updateDto });

			const result = await service.update(MOCK_TENANT_ID, updateDto);

			expect(result.name).toBe("Updated Name");
		});

		it("should throw NotFoundException if tenant not found", async () => {
			prisma.tenant.findUnique.mockResolvedValue(null);

			await expect(service.update("nonexistent", updateDto)).rejects.toThrow(NotFoundException);
		});
	});

	describe("remove", () => {
		it("should deactivate a tenant", async () => {
			prisma.tenant.findUnique.mockResolvedValue(mockTenant);
			prisma.tenant.update.mockResolvedValue({ ...mockTenant, isActive: false });

			const result = await service.remove(MOCK_TENANT_ID);

			expect(result.message).toBe("Tenant deactivated successfully");
		});

		it("should throw NotFoundException if tenant not found", async () => {
			prisma.tenant.findUnique.mockResolvedValue(null);

			await expect(service.remove("nonexistent")).rejects.toThrow(NotFoundException);
		});
	});
});
