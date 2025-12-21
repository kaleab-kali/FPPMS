import * as fs from "node:fs";
import { NotFoundException } from "@nestjs/common";
import { Test, type TestingModule } from "@nestjs/testing";
import { PrismaService } from "#api/database/prisma.service";
import { EmployeePhotoService } from "#api/modules/employees/services/employee-photo.service";

jest.mock("node:fs");

const MOCK_TENANT_ID = "tenant-123";
const MOCK_EMPLOYEE_ID = "emp-123";
const MOCK_PHOTO_ID = "photo-123";
const MOCK_USER_ID = "user-123";

const mockEmployee = {
	id: MOCK_EMPLOYEE_ID,
	tenantId: MOCK_TENANT_ID,
	fullName: "John Doe",
};

const mockPhoto = {
	id: MOCK_PHOTO_ID,
	tenantId: MOCK_TENANT_ID,
	employeeId: MOCK_EMPLOYEE_ID,
	filePath: "uploads/photos/tenant-123/emp-123/photo_123.jpg",
	fileName: "photo_123.jpg",
	fileSize: 1024,
	mimeType: "image/jpeg",
	fileHash: "abc123",
	captureMethod: "WEBCAM",
	capturedBy: MOCK_USER_ID,
	isActive: true,
	deletedAt: null,
	capturedAt: new Date(),
	employee: mockEmployee,
};

const mockPrismaService = {
	employee: {
		findFirst: jest.fn(),
		update: jest.fn(),
	},
	employeePhoto: {
		create: jest.fn(),
		findFirst: jest.fn(),
		findMany: jest.fn(),
		update: jest.fn(),
		updateMany: jest.fn(),
	},
};

describe("EmployeePhotoService", () => {
	let service: EmployeePhotoService;
	let prisma: typeof mockPrismaService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [EmployeePhotoService, { provide: PrismaService, useValue: mockPrismaService }],
		}).compile();

		service = module.get<EmployeePhotoService>(EmployeePhotoService);
		prisma = module.get(PrismaService);

		jest.clearAllMocks();
	});

	describe("uploadPhoto", () => {
		const mockFile = {
			originalname: "test.jpg",
			size: 1024,
			mimetype: "image/jpeg",
			buffer: Buffer.from("test image data"),
		} as Express.Multer.File;

		const uploadDto = {
			employeeId: MOCK_EMPLOYEE_ID,
			captureMethod: "WEBCAM" as const,
		};

		it("should upload a photo successfully", async () => {
			prisma.employee.findFirst.mockResolvedValue(mockEmployee);
			prisma.employeePhoto.updateMany.mockResolvedValue({ count: 0 });
			prisma.employeePhoto.create.mockResolvedValue(mockPhoto);
			prisma.employee.update.mockResolvedValue(mockEmployee);
			(fs.existsSync as jest.Mock).mockReturnValue(false);
			(fs.mkdirSync as jest.Mock).mockReturnValue(undefined);
			(fs.writeFileSync as jest.Mock).mockReturnValue(undefined);

			const result = await service.uploadPhoto(MOCK_TENANT_ID, uploadDto, mockFile, MOCK_USER_ID);

			expect(result).toBeDefined();
			expect(result.id).toBe(MOCK_PHOTO_ID);
			expect(prisma.employeePhoto.updateMany).toHaveBeenCalledWith({
				where: { employeeId: MOCK_EMPLOYEE_ID, isActive: true },
				data: { isActive: false },
			});
			expect(prisma.employeePhoto.create).toHaveBeenCalled();
			expect(prisma.employee.update).toHaveBeenCalledWith({
				where: { id: MOCK_EMPLOYEE_ID },
				data: { currentPhotoId: MOCK_PHOTO_ID },
			});
		});

		it("should throw NotFoundException when employee not found", async () => {
			prisma.employee.findFirst.mockResolvedValue(null);

			await expect(service.uploadPhoto(MOCK_TENANT_ID, uploadDto, mockFile, MOCK_USER_ID)).rejects.toThrow(
				NotFoundException,
			);
		});
	});

	describe("getActivePhoto", () => {
		it("should return active photo for employee", async () => {
			prisma.employeePhoto.findFirst.mockResolvedValue(mockPhoto);

			const result = await service.getActivePhoto(MOCK_TENANT_ID, MOCK_EMPLOYEE_ID);

			expect(result).toBeDefined();
			expect(result?.isActive).toBe(true);
			expect(prisma.employeePhoto.findFirst).toHaveBeenCalledWith({
				where: {
					tenantId: MOCK_TENANT_ID,
					employeeId: MOCK_EMPLOYEE_ID,
					isActive: true,
					deletedAt: null,
				},
			});
		});

		it("should return null when no active photo", async () => {
			prisma.employeePhoto.findFirst.mockResolvedValue(null);

			const result = await service.getActivePhoto(MOCK_TENANT_ID, MOCK_EMPLOYEE_ID);

			expect(result).toBeNull();
		});
	});

	describe("getPhotoFile", () => {
		it("should return photo file stream", async () => {
			prisma.employeePhoto.findFirst.mockResolvedValue(mockPhoto);
			(fs.existsSync as jest.Mock).mockReturnValue(true);
			const mockStream = { pipe: jest.fn() };
			(fs.createReadStream as jest.Mock).mockReturnValue(mockStream);

			const result = await service.getPhotoFile(MOCK_TENANT_ID, MOCK_PHOTO_ID);

			expect(result.stream).toBe(mockStream);
			expect(result.mimeType).toBe("image/jpeg");
		});

		it("should throw NotFoundException when photo not found in database", async () => {
			prisma.employeePhoto.findFirst.mockResolvedValue(null);

			await expect(service.getPhotoFile(MOCK_TENANT_ID, MOCK_PHOTO_ID)).rejects.toThrow(NotFoundException);
		});

		it("should throw NotFoundException when file not found on disk", async () => {
			prisma.employeePhoto.findFirst.mockResolvedValue(mockPhoto);
			(fs.existsSync as jest.Mock).mockReturnValue(false);

			await expect(service.getPhotoFile(MOCK_TENANT_ID, MOCK_PHOTO_ID)).rejects.toThrow(NotFoundException);
		});
	});

	describe("getPhotoHistory", () => {
		it("should return photo history for employee", async () => {
			prisma.employee.findFirst.mockResolvedValue(mockEmployee);
			prisma.employeePhoto.findMany.mockResolvedValue([mockPhoto]);

			const result = await service.getPhotoHistory(MOCK_TENANT_ID, MOCK_EMPLOYEE_ID);

			expect(result).toHaveLength(1);
			expect(prisma.employeePhoto.findMany).toHaveBeenCalledWith({
				where: { tenantId: MOCK_TENANT_ID, employeeId: MOCK_EMPLOYEE_ID, deletedAt: null },
				orderBy: { capturedAt: "desc" },
			});
		});

		it("should throw NotFoundException when employee not found", async () => {
			prisma.employee.findFirst.mockResolvedValue(null);

			await expect(service.getPhotoHistory(MOCK_TENANT_ID, MOCK_EMPLOYEE_ID)).rejects.toThrow(NotFoundException);
		});
	});

	describe("delete", () => {
		it("should soft delete a photo", async () => {
			prisma.employeePhoto.findFirst.mockResolvedValue(mockPhoto);
			prisma.employeePhoto.update.mockResolvedValue({ ...mockPhoto, deletedAt: new Date(), isActive: false });

			const result = await service.delete(MOCK_TENANT_ID, MOCK_PHOTO_ID);

			expect(result).toBeDefined();
			expect(prisma.employeePhoto.update).toHaveBeenCalledWith({
				where: { id: MOCK_PHOTO_ID },
				data: { deletedAt: expect.any(Date), isActive: false },
			});
		});

		it("should throw NotFoundException when photo not found", async () => {
			prisma.employeePhoto.findFirst.mockResolvedValue(null);

			await expect(service.delete(MOCK_TENANT_ID, MOCK_PHOTO_ID)).rejects.toThrow(NotFoundException);
		});
	});
});
