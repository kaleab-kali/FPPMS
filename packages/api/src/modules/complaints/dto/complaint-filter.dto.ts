import { ApiPropertyOptional } from "@nestjs/swagger";
import { ComplaintArticle, ComplaintStatus } from "@prisma/client";
import { IsDateString, IsEnum, IsOptional, IsString } from "class-validator";

export class ComplaintFilterDto {
	@ApiPropertyOptional({
		description: "Filter by article type",
		enum: ComplaintArticle,
		enumName: "ComplaintArticle",
		example: ComplaintArticle.ARTICLE_30,
	})
	@IsEnum(ComplaintArticle)
	@IsOptional()
	article?: ComplaintArticle;

	@ApiPropertyOptional({
		description: "Filter by complaint status",
		enum: ComplaintStatus,
		enumName: "ComplaintStatus",
		example: ComplaintStatus.UNDER_HR_REVIEW,
	})
	@IsEnum(ComplaintStatus)
	@IsOptional()
	status?: ComplaintStatus;

	@ApiPropertyOptional({
		description: "Filter by center ID",
		example: "clx1234567890center",
	})
	@IsString()
	@IsOptional()
	centerId?: string;

	@ApiPropertyOptional({
		description: "Filter by accused employee ID",
		example: "clx1234567890employee",
	})
	@IsString()
	@IsOptional()
	accusedEmployeeId?: string;

	@ApiPropertyOptional({
		description: "Search in complaint number or summary",
		example: "CMP-2025",
	})
	@IsString()
	@IsOptional()
	search?: string;

	@ApiPropertyOptional({
		description: "Filter complaints registered from this date (ISO 8601 format)",
		example: "2025-01-01",
	})
	@IsDateString()
	@IsOptional()
	fromDate?: string;

	@ApiPropertyOptional({
		description: "Filter complaints registered until this date (ISO 8601 format)",
		example: "2025-12-31",
	})
	@IsDateString()
	@IsOptional()
	toDate?: string;
}
