import { ApiPropertyOptional } from "@nestjs/swagger";
import { RewardEligibility, ServiceRewardStatus } from "@prisma/client";
import { Transform } from "class-transformer";
import { IsDateString, IsEnum, IsInt, IsOptional, IsString, Max, Min } from "class-validator";

export class ServiceRewardFilterDto {
	@ApiPropertyOptional({
		description: "Filter by status",
		enum: ServiceRewardStatus,
		enumName: "ServiceRewardStatus",
		example: "PENDING",
	})
	@IsEnum(ServiceRewardStatus)
	@IsOptional()
	status?: ServiceRewardStatus;

	@ApiPropertyOptional({
		description: "Filter by eligibility status",
		enum: RewardEligibility,
		enumName: "RewardEligibility",
		example: "ELIGIBLE",
	})
	@IsEnum(RewardEligibility)
	@IsOptional()
	eligibilityStatus?: RewardEligibility;

	@ApiPropertyOptional({
		description: "Filter by milestone ID",
		example: "clx1234567890milestone",
	})
	@IsString()
	@IsOptional()
	milestoneId?: string;

	@ApiPropertyOptional({
		description: "Filter by center ID",
		example: "clx1234567890center",
	})
	@IsString()
	@IsOptional()
	centerId?: string;

	@ApiPropertyOptional({
		description: "Filter by employee ID (database ID)",
		example: "clx1234567890employee",
	})
	@IsString()
	@IsOptional()
	employeeId?: string;

	@ApiPropertyOptional({
		description: "Filter rewards from this date onwards",
		example: "2025-01-01",
	})
	@IsDateString()
	@IsOptional()
	fromDate?: string;

	@ApiPropertyOptional({
		description: "Filter rewards up to this date",
		example: "2025-12-31",
	})
	@IsDateString()
	@IsOptional()
	toDate?: string;

	@ApiPropertyOptional({
		description: "Search by employee name or ID",
		example: "John",
	})
	@IsString()
	@IsOptional()
	search?: string;

	@ApiPropertyOptional({
		description: "Page number for pagination",
		example: 1,
		minimum: 1,
		default: 1,
	})
	@IsInt()
	@Min(1)
	@IsOptional()
	@Transform(({ value }) => parseInt(value, 10))
	page?: number = 1;

	@ApiPropertyOptional({
		description: "Number of items per page",
		example: 20,
		minimum: 1,
		maximum: 100,
		default: 20,
	})
	@IsInt()
	@Min(1)
	@Max(100)
	@IsOptional()
	@Transform(({ value }) => parseInt(value, 10))
	limit?: number = 20;
}

export class EligibilityFilterDto {
	@ApiPropertyOptional({
		description: "Filter by milestone ID",
		example: "clx1234567890milestone",
	})
	@IsString()
	@IsOptional()
	milestoneId?: string;

	@ApiPropertyOptional({
		description: "Filter by center ID",
		example: "clx1234567890center",
	})
	@IsString()
	@IsOptional()
	centerId?: string;

	@ApiPropertyOptional({
		description: "Number of months to look ahead for approaching milestones",
		example: 6,
		minimum: 1,
		maximum: 24,
		default: 6,
	})
	@IsInt()
	@Min(1)
	@Max(24)
	@IsOptional()
	@Transform(({ value }) => parseInt(value, 10))
	monthsAhead?: number = 6;

	@ApiPropertyOptional({
		description: "Page number for pagination",
		example: 1,
		minimum: 1,
		default: 1,
	})
	@IsInt()
	@Min(1)
	@IsOptional()
	@Transform(({ value }) => parseInt(value, 10))
	page?: number = 1;

	@ApiPropertyOptional({
		description: "Number of items per page",
		example: 20,
		minimum: 1,
		maximum: 100,
		default: 20,
	})
	@IsInt()
	@Min(1)
	@Max(100)
	@IsOptional()
	@Transform(({ value }) => parseInt(value, 10))
	limit?: number = 20;
}
