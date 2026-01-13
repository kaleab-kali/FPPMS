import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { SalaryChangeType } from "@prisma/client";
import { Transform } from "class-transformer";
import { IsDateString, IsEnum, IsInt, IsOptional, IsString, Max, Min } from "class-validator";

class RankMinimalDto {
	@ApiProperty({ description: "Rank ID" })
	id: string;

	@ApiProperty({ description: "Rank code", example: "CON" })
	code: string;

	@ApiProperty({ description: "Rank name", example: "Constable" })
	name: string;

	@ApiPropertyOptional({ description: "Rank name in Amharic" })
	nameAm: string | null;
}

class EmployeeMinimalForHistoryDto {
	@ApiProperty({ description: "Employee UUID" })
	id: string;

	@ApiProperty({ description: "Employee ID (e.g., FPC-0001/25)" })
	employeeId: string;

	@ApiProperty({ description: "Full name in English" })
	fullName: string;

	@ApiPropertyOptional({ description: "Full name in Amharic" })
	fullNameAm: string | null;
}

export class SalaryHistoryResponseDto {
	@ApiProperty({ description: "Salary history record ID" })
	id: string;

	@ApiProperty({ description: "Tenant ID" })
	tenantId: string;

	@ApiProperty({ description: "Employee ID" })
	employeeId: string;

	@ApiProperty({ description: "Rank ID at the time of change" })
	rankId: string;

	@ApiProperty({
		description: "Type of salary change",
		enum: SalaryChangeType,
		example: SalaryChangeType.STEP_INCREMENT,
	})
	changeType: SalaryChangeType;

	@ApiPropertyOptional({ description: "Previous step number", example: 3 })
	fromStep: number | null;

	@ApiProperty({ description: "New step number", example: 4 })
	toStep: number;

	@ApiPropertyOptional({ description: "Previous salary amount", example: "12500.00" })
	fromSalary: string | null;

	@ApiProperty({ description: "New salary amount", example: "13000.00" })
	toSalary: string;

	@ApiProperty({ description: "Effective date of the salary change" })
	effectiveDate: Date;

	@ApiPropertyOptional({ description: "Reason for the salary change" })
	reason: string | null;

	@ApiPropertyOptional({ description: "Order reference number" })
	orderReference: string | null;

	@ApiPropertyOptional({ description: "Path to supporting document" })
	documentPath: string | null;

	@ApiPropertyOptional({ description: "Previous rank ID (for promotions)" })
	previousRankId: string | null;

	@ApiProperty({ description: "Whether this was an automatic increment" })
	isAutomatic: boolean;

	@ApiPropertyOptional({ description: "User ID who processed the change" })
	processedBy: string | null;

	@ApiProperty({ description: "Timestamp when the change was processed" })
	processedAt: Date;

	@ApiPropertyOptional({ description: "User ID who approved the change" })
	approvedBy: string | null;

	@ApiPropertyOptional({ description: "Timestamp when the change was approved" })
	approvedAt: Date | null;

	@ApiPropertyOptional({ description: "Additional notes" })
	notes: string | null;

	@ApiProperty({ description: "Record creation timestamp" })
	createdAt: Date;

	@ApiPropertyOptional({ description: "Employee details", type: EmployeeMinimalForHistoryDto })
	employee?: EmployeeMinimalForHistoryDto;

	@ApiPropertyOptional({ description: "Rank details", type: RankMinimalDto })
	rank?: RankMinimalDto;

	@ApiPropertyOptional({ description: "Previous rank details (for promotions)", type: RankMinimalDto })
	previousRank?: RankMinimalDto | null;
}

export class SalaryHistoryListResponseDto {
	@ApiProperty({ description: "List of salary history records", type: [SalaryHistoryResponseDto] })
	data: SalaryHistoryResponseDto[];

	@ApiProperty({
		description: "Pagination metadata",
		example: {
			total: 100,
			page: 1,
			limit: 20,
			totalPages: 5,
			hasNextPage: true,
			hasPreviousPage: false,
		},
	})
	meta: {
		total: number;
		page: number;
		limit: number;
		totalPages: number;
		hasNextPage: boolean;
		hasPreviousPage: boolean;
	};
}

export class SalaryHistoryQueryDto {
	@ApiPropertyOptional({
		description: "Filter by salary change type",
		enum: SalaryChangeType,
	})
	@IsEnum(SalaryChangeType)
	@IsOptional()
	changeType?: SalaryChangeType;

	@ApiPropertyOptional({
		description: "Filter by date range start (ISO date string)",
		example: "2025-01-01",
	})
	@IsDateString()
	@IsOptional()
	dateFrom?: string;

	@ApiPropertyOptional({
		description: "Filter by date range end (ISO date string)",
		example: "2025-12-31",
	})
	@IsDateString()
	@IsOptional()
	dateTo?: string;

	@ApiPropertyOptional({
		description: "Filter by rank ID",
	})
	@IsString()
	@IsOptional()
	rankId?: string;

	@ApiPropertyOptional({
		description: "Page number (default: 1)",
		example: 1,
	})
	@IsInt()
	@Min(1)
	@Transform(({ value }) => (value !== undefined && value !== null && value !== "" ? parseInt(value, 10) : undefined))
	@IsOptional()
	page?: number;

	@ApiPropertyOptional({
		description: "Items per page (default: 20, max: 100)",
		example: 20,
	})
	@IsInt()
	@Min(1)
	@Max(100)
	@Transform(({ value }) => (value !== undefined && value !== null && value !== "" ? parseInt(value, 10) : undefined))
	@IsOptional()
	limit?: number;
}
