import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsArray, IsDateString, IsNotEmpty, IsOptional, IsString, MaxLength } from "class-validator";

export class ProcessSingleIncrementDto {
	@ApiProperty({
		description: "The salary eligibility record ID to process",
		example: "clx1234567890",
	})
	@IsString()
	@IsNotEmpty()
	eligibilityId: string;

	@ApiPropertyOptional({
		description: "Effective date for the increment (defaults to eligibility date)",
		example: "2025-06-01",
	})
	@IsDateString()
	@IsOptional()
	effectiveDate?: string;

	@ApiPropertyOptional({
		description: "Optional notes for the salary increment",
		example: "Regular biennial step increment",
	})
	@IsString()
	@MaxLength(500)
	@IsOptional()
	notes?: string;
}

export class ProcessBatchIncrementDto {
	@ApiProperty({
		description: "Array of salary eligibility record IDs to process",
		example: ["clx1234567890", "clx0987654321"],
		type: [String],
	})
	@IsArray()
	@IsString({ each: true })
	@IsNotEmpty()
	eligibilityIds: string[];

	@ApiPropertyOptional({
		description: "Effective date for all increments (defaults to each eligibility date)",
		example: "2025-06-01",
	})
	@IsDateString()
	@IsOptional()
	effectiveDate?: string;

	@ApiPropertyOptional({
		description: "Optional notes for the batch increment",
		example: "Q2 2025 batch salary step increments",
	})
	@IsString()
	@MaxLength(500)
	@IsOptional()
	notes?: string;
}

export class RejectEligibilityDto {
	@ApiProperty({
		description: "The salary eligibility record ID to reject",
		example: "clx1234567890",
	})
	@IsString()
	@IsNotEmpty()
	eligibilityId: string;

	@ApiProperty({
		description: "Reason for rejecting the salary step eligibility",
		example: "Employee has pending disciplinary action",
	})
	@IsString()
	@IsNotEmpty()
	@MaxLength(500)
	rejectionReason: string;
}
