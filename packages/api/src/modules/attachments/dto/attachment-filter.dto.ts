import { ApiPropertyOptional } from "@nestjs/swagger";
import { AttachableType } from "@prisma/client";
import { Transform } from "class-transformer";
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from "class-validator";

export class AttachmentFilterDto {
	@ApiPropertyOptional({
		description: "Filter by category",
		example: "contracts",
	})
	@IsString()
	@IsOptional()
	category?: string;

	@ApiPropertyOptional({
		description: "Search in title and description",
		example: "contract",
	})
	@IsString()
	@IsOptional()
	search?: string;

	@ApiPropertyOptional({
		description: "Page number for pagination",
		example: 1,
		default: 1,
		minimum: 1,
	})
	@IsOptional()
	@IsInt()
	@Min(1)
	@Transform(({ value }) => parseInt(value, 10))
	page?: number = 1;

	@ApiPropertyOptional({
		description: "Number of items per page",
		example: 20,
		default: 20,
		minimum: 1,
		maximum: 100,
	})
	@IsOptional()
	@IsInt()
	@Min(1)
	@Max(100)
	@Transform(({ value }) => parseInt(value, 10))
	limit?: number = 20;
}

export class AttachmentByRecordParamsDto {
	@ApiPropertyOptional({
		description: "The type of entity to get attachments for",
		enum: AttachableType,
		enumName: "AttachableType",
		example: "EMPLOYEE",
	})
	@IsEnum(AttachableType)
	type: AttachableType;

	@ApiPropertyOptional({
		description: "The ID of the record to get attachments for",
		example: "clx1234567890abcdef",
	})
	@IsString()
	recordId: string;
}
