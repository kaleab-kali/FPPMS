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
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";
import type { Response } from "express";
import { memoryStorage } from "multer";
import { SYSTEM_ROLES } from "#api/common/constants/roles.constant";
import { CurrentUser } from "#api/common/decorators/current-user.decorator";
import { Public } from "#api/common/decorators/public.decorator";
import { Roles } from "#api/common/decorators/roles.decorator";
import { AuthUserDto } from "#api/common/dto/auth-user.dto";
import { CreateEmployeePhotoDto } from "#api/modules/employees/dto";
import { EmployeePhotoService } from "#api/modules/employees/services/employee-photo.service";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

@ApiTags("employee-photos")
@ApiBearerAuth("JWT-auth")
@Controller("employees/photos")
export class EmployeePhotoController {
	private readonly logger = new Logger(EmployeePhotoController.name);

	constructor(
		private photoService: EmployeePhotoService,
		private jwtService: JwtService,
	) {}

	@Post("upload")
	@Roles(SYSTEM_ROLES.IT_ADMIN, SYSTEM_ROLES.HQ_ADMIN, SYSTEM_ROLES.HR_DIRECTOR, SYSTEM_ROLES.HR_OFFICER)
	@UseInterceptors(
		FileInterceptor("file", {
			storage: memoryStorage(),
			limits: { fileSize: MAX_FILE_SIZE },
		}),
	)
	@ApiOperation({ summary: "Upload employee photo (webcam capture or file upload)" })
	@ApiConsumes("multipart/form-data")
	@ApiBody({
		schema: {
			type: "object",
			properties: {
				file: { type: "string", format: "binary" },
				employeeId: { type: "string" },
				captureMethod: { type: "string", enum: ["WEBCAM", "UPLOAD"] },
			},
		},
	})
	@ApiResponse({ status: 201, description: "Photo uploaded successfully" })
	uploadPhoto(
		@CurrentUser() user: AuthUserDto,
		@UploadedFile() file: Express.Multer.File,
		@Body() dto: CreateEmployeePhotoDto,
	) {
		this.logger.log(`Upload request received - employeeId: ${dto.employeeId}, captureMethod: ${dto.captureMethod}`);
		this.logger.log(`File received: ${!!file}`);

		if (file) {
			this.logger.log(`File info: originalname=${file.originalname}, size=${file.size}, mimetype=${file.mimetype}`);
			this.logger.log(`Buffer exists: ${!!file.buffer}, Buffer size: ${file.buffer?.length || 0}`);
		}

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
			throw new BadRequestException("File is too large. Maximum size is 10MB");
		}

		return this.photoService.uploadPhoto(user.tenantId, dto, file, user.id);
	}

	@Get("employee/:employeeId/active")
	@ApiOperation({ summary: "Get active photo for employee" })
	@ApiResponse({ status: 200, description: "Active photo" })
	getActivePhoto(@CurrentUser() user: AuthUserDto, @Param("employeeId") employeeId: string) {
		return this.photoService.getActivePhoto(user.tenantId, employeeId);
	}

	@Get("file/:photoId")
	@Public()
	@ApiOperation({ summary: "Get photo file by ID" })
	@ApiQuery({ name: "token", required: true, description: "JWT access token" })
	@ApiResponse({ status: 200, description: "Photo file" })
	async getPhotoFile(@Param("photoId") photoId: string, @Query("token") token: string, @Res() res: Response) {
		if (!token) {
			throw new UnauthorizedException("Token is required");
		}

		const payload = this.jwtService.verify(token);
		if (!payload?.tenantId) {
			throw new UnauthorizedException("Invalid token");
		}

		const { stream, mimeType } = await this.photoService.getPhotoFile(payload.tenantId, photoId);
		res.setHeader("Content-Type", mimeType);
		res.setHeader("Cache-Control", "public, max-age=31536000");
		stream.pipe(res);
	}

	@Get("employee/:employeeId/history")
	@ApiOperation({ summary: "Get photo history for employee" })
	@ApiResponse({ status: 200, description: "Photo history" })
	getPhotoHistory(@CurrentUser() user: AuthUserDto, @Param("employeeId") employeeId: string) {
		return this.photoService.getPhotoHistory(user.tenantId, employeeId);
	}

	@Delete(":id")
	@Roles(SYSTEM_ROLES.IT_ADMIN, SYSTEM_ROLES.HQ_ADMIN, SYSTEM_ROLES.HR_DIRECTOR)
	@ApiOperation({ summary: "Delete photo" })
	@ApiResponse({ status: 200, description: "Photo deleted" })
	delete(@CurrentUser() user: AuthUserDto, @Param("id") id: string) {
		return this.photoService.delete(user.tenantId, id);
	}
}
