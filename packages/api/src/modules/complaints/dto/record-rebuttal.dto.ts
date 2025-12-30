import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsDateString, IsNotEmpty, IsOptional, IsString, MaxLength } from "class-validator";

export class RecordRebuttalDto {
	@ApiProperty({
		description: "Date when the rebuttal was received (ISO 8601 format)",
		example: "2025-01-24",
	})
	@IsDateString()
	@IsNotEmpty()
	rebuttalReceivedDate: string;

	@ApiProperty({
		description: "Summary content of the rebuttal submitted by the accused",
		example: "Employee claims they were on approved break and has witness testimony",
		maxLength: 3000,
	})
	@IsString()
	@IsNotEmpty()
	@MaxLength(3000)
	rebuttalContent: string;

	@ApiPropertyOptional({
		description: "Additional notes about the rebuttal",
		example: "Rebuttal submitted with supporting documents",
		maxLength: 1000,
	})
	@IsString()
	@IsOptional()
	@MaxLength(1000)
	notes?: string;
}
