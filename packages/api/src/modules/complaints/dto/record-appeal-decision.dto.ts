import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { AppealDecision } from "@prisma/client";
import { IsDateString, IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from "class-validator";

export class RecordAppealDecisionDto {
	@ApiProperty({
		description: "The decision on the appeal",
		enum: AppealDecision,
		enumName: "AppealDecision",
		example: AppealDecision.UPHELD,
	})
	@IsEnum(AppealDecision)
	@IsNotEmpty()
	decision: AppealDecision;

	@ApiProperty({
		description: "Date when the appeal decision was made (ISO 8601 format)",
		example: "2025-02-10",
	})
	@IsDateString()
	@IsNotEmpty()
	reviewedAt: string;

	@ApiProperty({
		description: "Reason for the appeal decision",
		example: "After review, the original punishment is deemed appropriate given the severity of the offense",
		maxLength: 3000,
	})
	@IsString()
	@IsNotEmpty()
	@MaxLength(3000)
	decisionReason: string;

	@ApiPropertyOptional({
		description: "New punishment if the appeal decision modified the original (only if decision is MODIFIED)",
		example: "Reduced to 5% salary deduction instead of 10%",
		maxLength: 1000,
	})
	@IsString()
	@IsOptional()
	@MaxLength(1000)
	newPunishment?: string;

	@ApiPropertyOptional({
		description: "Additional notes about the appeal decision",
		example: "Decision reviewed by legal department before finalization",
		maxLength: 1000,
	})
	@IsString()
	@IsOptional()
	@MaxLength(1000)
	notes?: string;
}
