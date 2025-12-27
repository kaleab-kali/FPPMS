import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsDateString, IsInt, IsNotEmpty, IsOptional, IsString, Max, MaxLength, Min } from "class-validator";

export class SubmitAppealDto {
	@ApiProperty({
		description: "Appeal level (1=Superior, 2=Dept Head, 3=Center Commander, 4=Vice Commissioner)",
		example: 1,
		minimum: 1,
		maximum: 4,
	})
	@IsInt()
	@Min(1)
	@Max(4)
	@IsNotEmpty()
	appealLevel: number;

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
