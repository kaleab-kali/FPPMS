import {
	BadRequestException,
	Body,
	Controller,
	Delete,
	Get,
	Logger,
	Param,
	Post,
	Query,
	Res,
	UnauthorizedException,
	UploadedFile,
	UseInterceptors,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { FileInterceptor } from "@nestjs/platform-express";
import {
	ApiBearerAuth,
	ApiBody,
	ApiConsumes,
	ApiOperation,
	ApiParam,
	ApiQuery,
	ApiResponse,
	ApiTags,
} from "@nestjs/swagger";
import { AttachableType } from "@prisma/client";
import type { Response } from "express";
import { memoryStorage } from "multer";
import { CurrentUser } from "#api/common/decorators/current-user.decorator";
import { Permissions } from "#api/common/decorators/permissions.decorator";
import { Public } from "#api/common/decorators/public.decorator";
import { AuthUserDto } from "#api/common/dto/auth-user.dto";
import { AttachmentsService } from "#api/modules/attachments/attachments.service";
import {
	AttachmentDeleteResponseDto,
	AttachmentFilterDto,
	AttachmentListResponseDto,
	AttachmentResponseDto,
	UploadAttachmentDto,
} from "#api/modules/attachments/dto";

const MAX_FILE_SIZE = 50 * 1024 * 1024;

@ApiTags("attachments")
@ApiBearerAuth("JWT-auth")
@Controller("attachments")
export class AttachmentsController {
	private readonly logger = new Logger(AttachmentsController.name);

	constructor(
		private readonly attachmentsService: AttachmentsService,
		private readonly jwtService: JwtService,
	) {}

	@Post()
	@Permissions("attachments.create.attachment")
	@UseInterceptors(
		FileInterceptor("file", {
			storage: memoryStorage(),
			limits: { fileSize: MAX_FILE_SIZE },
		}),
	)
	@ApiOperation({
		summary: "Upload an attachment",
		description: "Upload a file attachment to associate with any record type (employee, complaint, etc.)",
	})
	@ApiConsumes("multipart/form-data")
	@ApiBody({
		schema: {
			type: "object",
			required: ["file", "attachableType", "attachableId", "title"],
			properties: {
				file: {
					type: "string",
					format: "binary",
					description: "The file to upload",
				},
				attachableType: {
					type: "string",
					enum: Object.values(AttachableType),
					description: "Type of entity this attachment belongs to",
				},
				attachableId: {
					type: "string",
					description: "ID of the entity this attachment belongs to",
				},
				title: {
					type: "string",
					description: "Title of the attachment",
				},
				category: {
					type: "string",
					description: "Optional category for organization",
				},
				description: {
					type: "string",
					description: "Optional description",
				},
			},
		},
	})
	@ApiResponse({
		status: 201,
		description: "Attachment uploaded successfully",
		type: AttachmentResponseDto,
	})
	@ApiResponse({ status: 400, description: "Invalid file or missing required fields" })
	@ApiResponse({ status: 401, description: "Unauthorized" })
	@ApiResponse({ status: 403, description: "Forbidden - insufficient permissions" })
	@ApiResponse({ status: 404, description: "Referenced record not found" })
	upload(
		@CurrentUser() user: AuthUserDto,
		@UploadedFile() file: Express.Multer.File,
		@Body() dto: UploadAttachmentDto,
	): Promise<AttachmentResponseDto> {
		this.logger.log(
			`Upload request - attachableType: ${dto.attachableType}, attachableId: ${dto.attachableId}, title: ${dto.title}`,
		);

		if (!file) {
			this.logger.error("No file received");
			throw new BadRequestException("File is required");
		}

		if (!file.buffer || file.buffer.length === 0) {
			this.logger.error("File buffer is empty");
			throw new BadRequestException("File must have content");
		}

		if (file.size > MAX_FILE_SIZE) {
			this.logger.error(`File too large: ${file.size}`);
			throw new BadRequestException(`File is too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB`);
		}

		return this.attachmentsService.upload(user.tenantId, dto, file, user.id);
	}

	@Get(":type/:recordId")
	@Permissions("attachments.read.attachment")
	@ApiOperation({
		summary: "List attachments for a record",
		description: "Get all attachments associated with a specific record",
	})
	@ApiParam({
		name: "type",
		enum: AttachableType,
		description: "The type of entity to get attachments for",
		example: "EMPLOYEE",
	})
	@ApiParam({
		name: "recordId",
		description: "The ID of the record to get attachments for",
		example: "clx1234567890abcdef",
	})
	@ApiResponse({
		status: 200,
		description: "List of attachments for the record",
		type: AttachmentListResponseDto,
	})
	@ApiResponse({ status: 401, description: "Unauthorized" })
	@ApiResponse({ status: 403, description: "Forbidden - insufficient permissions" })
	findByRecord(
		@CurrentUser() user: AuthUserDto,
		@Param("type") type: AttachableType,
		@Param("recordId") recordId: string,
		@Query() filter: AttachmentFilterDto,
	): Promise<AttachmentListResponseDto> {
		return this.attachmentsService.findByRecord(user.tenantId, type, recordId, filter);
	}

	@Get("file/:id")
	@Public()
	@ApiOperation({
		summary: "Download attachment file",
		description: "Stream the attachment file content. Requires a valid JWT token as query parameter.",
	})
	@ApiParam({
		name: "id",
		description: "The ID of the attachment to download",
		example: "clx1234567890abcdef",
	})
	@ApiQuery({
		name: "token",
		required: true,
		description: "JWT access token for authentication",
	})
	@ApiResponse({
		status: 200,
		description: "File content streamed successfully",
		content: {
			"application/octet-stream": {
				schema: {
					type: "string",
					format: "binary",
				},
			},
		},
	})
	@ApiResponse({ status: 401, description: "Invalid or missing token" })
	@ApiResponse({ status: 404, description: "Attachment not found" })
	async getFile(@Param("id") id: string, @Query("token") token: string, @Res() res: Response): Promise<void> {
		if (!token) {
			throw new UnauthorizedException("Token is required");
		}

		const payload = this.jwtService.verify(token);
		if (!payload?.tenantId) {
			throw new UnauthorizedException("Invalid token");
		}

		const { stream, mimeType, fileName, fileSize } = await this.attachmentsService.getFile(payload.tenantId, id);

		res.setHeader("Content-Type", mimeType);
		res.setHeader("Content-Length", fileSize);
		res.setHeader("Content-Disposition", `attachment; filename="${encodeURIComponent(fileName)}"`);
		res.setHeader("Cache-Control", "private, max-age=86400");

		stream.pipe(res);
	}

	@Delete(":id")
	@Permissions("attachments.delete.attachment")
	@ApiOperation({
		summary: "Delete an attachment",
		description: "Soft delete an attachment (marks as deleted but preserves the record)",
	})
	@ApiParam({
		name: "id",
		description: "The ID of the attachment to delete",
		example: "clx1234567890abcdef",
	})
	@ApiResponse({
		status: 200,
		description: "Attachment deleted successfully",
		type: AttachmentDeleteResponseDto,
	})
	@ApiResponse({ status: 401, description: "Unauthorized" })
	@ApiResponse({ status: 403, description: "Forbidden - insufficient permissions" })
	@ApiResponse({ status: 404, description: "Attachment not found" })
	delete(@CurrentUser() user: AuthUserDto, @Param("id") id: string): Promise<AttachmentDeleteResponseDto> {
		return this.attachmentsService.delete(user.tenantId, id);
	}
}
