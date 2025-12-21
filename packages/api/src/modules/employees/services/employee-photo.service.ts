import * as crypto from "node:crypto";
import * as fs from "node:fs";
import * as path from "node:path";
import { BadRequestException, Injectable, Logger, NotFoundException } from "@nestjs/common";
import { PrismaService } from "#api/database/prisma.service";
import { CreateEmployeePhotoDto } from "#api/modules/employees/dto";

const UPLOAD_DIR = "uploads/photos";

@Injectable()
export class EmployeePhotoService {
	private readonly logger = new Logger(EmployeePhotoService.name);

	constructor(private readonly prisma: PrismaService) {}

	async uploadPhoto(tenantId: string, dto: CreateEmployeePhotoDto, file: Express.Multer.File, capturedBy: string) {
		this.logger.log(`=== UPLOAD PHOTO START ===`);
		this.logger.log(`tenantId: ${tenantId}`);
		this.logger.log(`dto: ${JSON.stringify(dto)}`);
		this.logger.log(`capturedBy: ${capturedBy}`);
		this.logger.log(`file exists: ${!!file}`);

		if (!file) {
			this.logger.error("File is null/undefined");
			throw new BadRequestException("File is required");
		}

		this.logger.log(`file.buffer exists: ${!!file.buffer}`);
		this.logger.log(`file.originalname: ${file.originalname}`);
		this.logger.log(`file.size: ${file.size}`);
		this.logger.log(`file.mimetype: ${file.mimetype}`);

		if (!file.buffer) {
			this.logger.error("File buffer is missing");
			throw new BadRequestException("File buffer is required");
		}

		this.logger.log(`buffer length: ${file.buffer.length}`);

		this.logger.log(`Looking up employee: ${dto.employeeId} in tenant: ${tenantId}`);
		const employee = await this.prisma.employee.findFirst({
			where: { id: dto.employeeId, tenantId, deletedAt: null },
		});

		if (!employee) {
			this.logger.error(`Employee not found: ${dto.employeeId}`);
			throw new NotFoundException("Employee not found");
		}
		this.logger.log(`Employee found: ${employee.fullName}`);

		const fileHash = crypto.createHash("sha256").update(file.buffer).digest("hex");
		this.logger.log(`File hash: ${fileHash}`);

		const uploadPath = path.join(UPLOAD_DIR, tenantId, dto.employeeId);
		this.logger.log(`Upload path: ${uploadPath}`);

		if (!fs.existsSync(uploadPath)) {
			this.logger.log(`Creating directory: ${uploadPath}`);
			fs.mkdirSync(uploadPath, { recursive: true });
		}

		const timestamp = Date.now();
		const ext = path.extname(file.originalname) || ".jpg";
		const fileName = `photo_${timestamp}${ext}`;
		const filePath = path.join(uploadPath, fileName);
		this.logger.log(`Saving file to: ${filePath}`);

		fs.writeFileSync(filePath, file.buffer);
		this.logger.log(`File saved successfully`);

		this.logger.log(`Deactivating previous photos`);
		await this.prisma.employeePhoto.updateMany({
			where: { employeeId: dto.employeeId, isActive: true },
			data: { isActive: false },
		});

		this.logger.log(`Creating photo record in database`);
		const photo = await this.prisma.employeePhoto.create({
			data: {
				tenantId,
				employeeId: dto.employeeId,
				filePath,
				fileName,
				fileSize: file.size,
				mimeType: file.mimetype,
				fileHash,
				captureMethod: dto.captureMethod,
				capturedBy,
				isActive: true,
			},
			include: {
				employee: {
					select: { id: true, employeeId: true, fullName: true, fullNameAm: true },
				},
			},
		});
		this.logger.log(`Photo record created: ${photo.id}`);

		this.logger.log(`Updating employee currentPhotoId`);
		await this.prisma.employee.update({
			where: { id: dto.employeeId },
			data: { currentPhotoId: photo.id },
		});

		this.logger.log(`=== UPLOAD PHOTO SUCCESS ===`);
		return photo;
	}

	async getActivePhoto(tenantId: string, employeeId: string) {
		return this.prisma.employeePhoto.findFirst({
			where: { tenantId, employeeId, isActive: true, deletedAt: null },
		});
	}

	async getPhotoFile(tenantId: string, photoId: string) {
		const photo = await this.prisma.employeePhoto.findFirst({
			where: { id: photoId, tenantId, deletedAt: null },
		});

		if (!photo) {
			throw new NotFoundException("Photo not found");
		}

		if (!fs.existsSync(photo.filePath)) {
			throw new NotFoundException("Photo file not found");
		}

		const stream = fs.createReadStream(photo.filePath);
		return { stream, mimeType: photo.mimeType };
	}

	async getPhotoHistory(tenantId: string, employeeId: string) {
		const employee = await this.prisma.employee.findFirst({
			where: { id: employeeId, tenantId, deletedAt: null },
		});

		if (!employee) {
			throw new NotFoundException("Employee not found");
		}

		return this.prisma.employeePhoto.findMany({
			where: { tenantId, employeeId, deletedAt: null },
			orderBy: { capturedAt: "desc" },
		});
	}

	async delete(tenantId: string, photoId: string) {
		const photo = await this.prisma.employeePhoto.findFirst({
			where: { id: photoId, tenantId, deletedAt: null },
		});

		if (!photo) {
			throw new NotFoundException("Photo not found");
		}

		return this.prisma.employeePhoto.update({
			where: { id: photoId },
			data: { deletedAt: new Date(), isActive: false },
		});
	}
}
