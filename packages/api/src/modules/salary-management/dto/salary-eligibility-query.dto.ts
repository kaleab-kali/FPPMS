import { ApiPropertyOptional } from "@nestjs/swagger";
import { SalaryEligibilityStatus } from "@prisma/client";
import { Transform } from "class-transformer";
import { IsDateString, IsEnum, IsInt, IsOptional, IsString, Max, Min } from "class-validator";

export class SalaryEligibilityQueryDto {
	@ApiPropertyOptional({
		description: "Filter by rank ID",
		example: "clx1234567890",
	})
	@IsString()
	@IsOptional()
	rankId?: string;

	@ApiPropertyOptional({
		description: "Filter by center ID",
		example: "clx1234567890",
	})
	@IsString()
	@IsOptional()
	centerId?: string;

	@ApiPropertyOptional({
		description: "Filter by department ID",
		example: "clx1234567890",
	})
	@IsString()
	@IsOptional()
	departmentId?: string;

	@ApiPropertyOptional({
		description: "Filter by eligibility status",
		enum: SalaryEligibilityStatus,
		example: SalaryEligibilityStatus.PENDING,
	})
	@IsEnum(SalaryEligibilityStatus)
	@IsOptional()
	status?: SalaryEligibilityStatus;

	@ApiPropertyOptional({
		description: "Filter by eligibility date from (ISO date string)",
		example: "2025-01-01",
	})
	@IsDateString()
	@IsOptional()
	eligibilityDateFrom?: string;

	@ApiPropertyOptional({
		description: "Filter by eligibility date to (ISO date string)",
		example: "2025-12-31",
	})
	@IsDateString()
	@IsOptional()
	eligibilityDateTo?: string;

	@ApiPropertyOptional({
		description: "Filter by current step number",
		example: 3,
	})
	@IsInt()
	@Min(0)
	@Max(9)
	@Transform(({ value }) => (value !== undefined && value !== null && value !== "" ? parseInt(value, 10) : undefined))
	@IsOptional()
	currentStep?: number;

	@ApiPropertyOptional({
		description: "Search by employee ID or name",
		example: "FPC-0001",
	})
	@IsString()
	@IsOptional()
	search?: string;

	@ApiPropertyOptional({
		description: "Page number (default: 1)",
		example: 1,
	})
	@IsInt()
	@Min(1)
	@Transform(({ value }) => (value !== undefined && value !== null && value !== "" ? parseInt(value, 10) : undefined))
	@IsOptional()
	page?: number = 1;

	@ApiPropertyOptional({
		description: "Items per page (default: 20, max: 100)",
		example: 20,
	})
	@IsInt()
	@Min(1)
	@Max(100)
	@Transform(({ value }) => (value !== undefined && value !== null && value !== "" ? parseInt(value, 10) : undefined))
	@IsOptional()
	limit?: number = 20;

	@ApiPropertyOptional({
		description: "Sort by field",
		example: "eligibilityDate",
	})
	@IsString()
	@IsOptional()
	sortBy?: string = "eligibilityDate";

	@ApiPropertyOptional({
		description: "Sort order (asc or desc)",
		example: "asc",
	})
	@IsString()
	@IsOptional()
	sortOrder?: "asc" | "desc" = "asc";
}
