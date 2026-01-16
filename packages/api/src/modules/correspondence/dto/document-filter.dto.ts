import { ApiPropertyOptional } from "@nestjs/swagger";
import { DocumentDirection } from "@prisma/client";
import { Transform } from "class-transformer";
import { IsBoolean, IsDateString, IsEnum, IsOptional, IsString, IsUUID } from "class-validator";
import { PaginationQueryDto } from "#api/common/dto/pagination-query.dto";

export class DocumentFilterDto extends PaginationQueryDto {
	@ApiPropertyOptional({ enum: DocumentDirection, description: "Filter by direction" })
	@IsEnum(DocumentDirection)
	@IsOptional()
	direction?: DocumentDirection;

	@ApiPropertyOptional({ description: "Filter by document type ID" })
	@IsUUID()
	@IsOptional()
	documentTypeId?: string;

	@ApiPropertyOptional({ description: "Filter by status" })
	@IsString()
	@IsOptional()
	status?: string;

	@ApiPropertyOptional({ description: "Filter by priority" })
	@IsString()
	@IsOptional()
	priority?: string;

	@ApiPropertyOptional({ description: "Filter by category" })
	@IsString()
	@IsOptional()
	category?: string;

	@ApiPropertyOptional({ description: "Filter by center ID" })
	@IsUUID()
	@IsOptional()
	centerId?: string;

	@ApiPropertyOptional({ description: "Filter by concerned employee ID" })
	@IsUUID()
	@IsOptional()
	concernedEmployeeId?: string;

	@ApiPropertyOptional({ description: "Filter by assigned department ID" })
	@IsUUID()
	@IsOptional()
	assignedDepartmentId?: string;

	@ApiPropertyOptional({ description: "Filter by urgent status" })
	@IsBoolean()
	@Transform(({ value }) => value === "true" || value === true)
	@IsOptional()
	isUrgent?: boolean;

	@ApiPropertyOptional({ description: "Start date for date range filter (YYYY-MM-DD)" })
	@IsDateString()
	@IsOptional()
	startDate?: string;

	@ApiPropertyOptional({ description: "End date for date range filter (YYYY-MM-DD)" })
	@IsDateString()
	@IsOptional()
	endDate?: string;

	@ApiPropertyOptional({ description: "Filter by overdue status" })
	@IsBoolean()
	@Transform(({ value }) => value === "true" || value === true)
	@IsOptional()
	isOverdue?: boolean;

	@ApiPropertyOptional({ description: "Filter by response overdue status" })
	@IsBoolean()
	@Transform(({ value }) => value === "true" || value === true)
	@IsOptional()
	isResponseOverdue?: boolean;
}
