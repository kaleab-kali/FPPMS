import * as fs from "node:fs";
import * as path from "node:path";
import { BadRequestException, Injectable, Logger, NotFoundException } from "@nestjs/common";
import { AttachableType, Prisma } from "@prisma/client";
import { calculateFileHash, generateUniqueFilename, sanitizeFilename } from "#api/common/utils/file.util";
import { PrismaService } from "#api/database/prisma.service";
import { AttachmentFilterDto, UploadAttachmentDto } from "#api/modules/attachments/dto";

const UPLOAD_BASE_DIR = "uploads/attachments";
const MAX_FILE_SIZE = 50 * 1024 * 1024;

const ALLOWED_MIME_TYPES = [
	"application/pdf",
	"image/jpeg",
	"image/png",
	"image/gif",
	"image/webp",
	"application/msword",
	"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
	"application/vnd.ms-excel",
	"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
	"text/plain",
	"text/csv",
] as const;

@Injectable()
export class AttachmentsService {
	private readonly logger = new Logger(AttachmentsService.name);

	constructor(private readonly prisma: PrismaService) {}

	async upload(tenantId: string, dto: UploadAttachmentDto, file: Express.Multer.File, uploadedBy: string) {
		this.logger.log(`=== ATTACHMENT UPLOAD START ===`);
		this.logger.log(`tenantId: ${tenantId}, attachableType: ${dto.attachableType}, attachableId: ${dto.attachableId}`);

		if (!file) {
			this.logger.error("File is null/undefined");
			throw new BadRequestException("File is required");
		}

		if (!file.buffer || file.buffer.length === 0) {
			this.logger.error("File buffer is missing or empty");
			throw new BadRequestException("File content is required");
		}

		if (file.size > MAX_FILE_SIZE) {
			this.logger.error(`File too large: ${file.size} bytes`);
			throw new BadRequestException(`File is too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB`);
		}

		if (!ALLOWED_MIME_TYPES.includes(file.mimetype as (typeof ALLOWED_MIME_TYPES)[number])) {
			this.logger.error(`Invalid file type: ${file.mimetype}`);
			throw new BadRequestException(
				`File type ${file.mimetype} is not allowed. Allowed types: ${ALLOWED_MIME_TYPES.join(", ")}`,
			);
		}

		const recordExists = await this.verifyRecordExists(tenantId, dto.attachableType, dto.attachableId);
		if (!recordExists) {
			this.logger.error(`Record not found: ${dto.attachableType}/${dto.attachableId}`);
			throw new NotFoundException(`${dto.attachableType} record not found`);
		}

		const fileHash = calculateFileHash(file.buffer);
		this.logger.log(`File hash: ${fileHash}`);

		const uploadPath = path.join(UPLOAD_BASE_DIR, tenantId, dto.attachableType, dto.attachableId);
		this.logger.log(`Upload path: ${uploadPath}`);

		if (!fs.existsSync(uploadPath)) {
			this.logger.log(`Creating directory: ${uploadPath}`);
			fs.mkdirSync(uploadPath, { recursive: true });
		}

		const sanitizedOriginalName = sanitizeFilename(file.originalname);
		const uniqueFileName = generateUniqueFilename(sanitizedOriginalName);
		const filePath = path.join(uploadPath, uniqueFileName);
		this.logger.log(`Saving file to: ${filePath}`);

		fs.writeFileSync(filePath, file.buffer);
		this.logger.log(`File saved successfully`);

		const attachment = await this.prisma.attachment.create({
			data: {
				tenantId,
				attachableType: dto.attachableType,
				attachableId: dto.attachableId,
				category: dto.category,
				title: dto.title,
				description: dto.description,
				filePath,
				fileName: file.originalname,
				fileSize: file.size,
				mimeType: file.mimetype,
				fileHash,
				uploadedBy,
			},
		});

		this.logger.log(`Attachment record created: ${attachment.id}`);
		this.logger.log(`=== ATTACHMENT UPLOAD SUCCESS ===`);

		return attachment;
	}

	async findByRecord(
		tenantId: string,
		attachableType: AttachableType,
		attachableId: string,
		filter: AttachmentFilterDto,
	) {
		const { category, search, page = 1, limit = 20 } = filter;
		const skip = (page - 1) * limit;

		const where: Prisma.AttachmentWhereInput = {
			tenantId,
			attachableType,
			attachableId,
			deletedAt: null,
		};

		if (category) {
			where.category = category;
		}

		if (search) {
			where.OR = [
				{ title: { contains: search, mode: "insensitive" } },
				{ description: { contains: search, mode: "insensitive" } },
			];
		}

		const [attachments, total] = await Promise.all([
			this.prisma.attachment.findMany({
				where,
				skip,
				take: limit,
				orderBy: { uploadedAt: "desc" },
			}),
			this.prisma.attachment.count({ where }),
		]);

		return { data: attachments, total };
	}

	async findOne(tenantId: string, id: string) {
		const attachment = await this.prisma.attachment.findFirst({
			where: { id, tenantId, deletedAt: null },
		});

		if (!attachment) {
			throw new NotFoundException("Attachment not found");
		}

		return attachment;
	}

	async getFile(tenantId: string, id: string) {
		const attachment = await this.findOne(tenantId, id);

		if (!fs.existsSync(attachment.filePath)) {
			this.logger.error(`File not found on disk: ${attachment.filePath}`);
			throw new NotFoundException("Attachment file not found on server");
		}

		const stream = fs.createReadStream(attachment.filePath);
		return {
			stream,
			mimeType: attachment.mimeType,
			fileName: attachment.fileName,
			fileSize: attachment.fileSize,
		};
	}

	async delete(tenantId: string, id: string) {
		const attachment = await this.findOne(tenantId, id);

		await this.prisma.attachment.update({
			where: { id: attachment.id },
			data: { deletedAt: new Date() },
		});

		this.logger.log(`Attachment soft deleted: ${id}`);

		return { message: "Attachment deleted successfully" };
	}

	private async verifyRecordExists(
		tenantId: string,
		attachableType: AttachableType,
		attachableId: string,
	): Promise<boolean> {
		const modelMap: Record<AttachableType, string> = {
			EMPLOYEE: "employee",
			COMPLAINT: "complaint",
			INVENTORY: "inventoryItem",
			WEAPON: "weapon",
			DOCUMENT: "document",
			TRANSFER: "employeeTransfer",
			RETIREMENT: "retirementRecord",
			APPRAISAL: "performanceAppraisal",
			LEAVE_REQUEST: "leaveRequest",
			CENTER: "center",
		} as const;

		const modelName = modelMap[attachableType];

		if (!modelName) {
			this.logger.warn(`Unknown attachable type: ${attachableType}`);
			return true;
		}

		const prismaModel = this.prisma[modelName as keyof typeof this.prisma];
		if (!prismaModel || typeof (prismaModel as { findFirst?: unknown }).findFirst !== "function") {
			this.logger.warn(`Model ${modelName} not found or does not support findFirst`);
			return true;
		}

		const record = await (prismaModel as { findFirst: (args: unknown) => Promise<unknown> }).findFirst({
			where: { id: attachableId, tenantId },
			select: { id: true },
		});

		return record !== null;
	}
}
