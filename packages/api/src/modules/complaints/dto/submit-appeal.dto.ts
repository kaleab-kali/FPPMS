import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsDateString, IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength } from "class-validator";

export class SubmitAppealDto {
	@ApiProperty({
		description: "Date when the appeal was submitted (ISO 8601 format)",
		example: "2025-02-05",
	})
	@IsDateString()
	@IsNotEmpty()
	appealDate: string;

	@ApiProperty({
		description: "Reason for the appeal",
		example:
			"The accused believes the punishment is too severe and requests reconsideration based on prior good conduct",
		maxLength: 3000,
	})
	@IsString()
	@IsNotEmpty()
	@MaxLength(3000)
	appealReason: string;

	@ApiProperty({
		description: "ID of the employee who will review/decide this appeal (higher authority)",
		example: "clxyz123...",
	})
	@IsUUID()
	@IsNotEmpty()
	reviewerEmployeeId: string;

	@ApiPropertyOptional({
		description: "Additional notes about the appeal submission",
		example: "Appeal submitted within the allowed timeframe",
		maxLength: 1000,
	})
	@IsString()
	@IsOptional()
	@MaxLength(1000)
	notes?: string;
}
