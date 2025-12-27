import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { ComplaintFinding } from "@prisma/client";
import { IsDateString, IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from "class-validator";

export class RecordFindingDto {
	@ApiProperty({
		description: "The finding/verdict for the complaint",
		enum: ComplaintFinding,
		enumName: "ComplaintFinding",
		example: ComplaintFinding.GUILTY,
	})
	@IsEnum(ComplaintFinding)
	@IsNotEmpty()
	finding: ComplaintFinding;

	@ApiProperty({
		description: "Date when the finding was made (ISO 8601 format)",
		example: "2025-01-28",
	})
	@IsDateString()
	@IsNotEmpty()
	findingDate: string;

	@ApiProperty({
		description: "Legal reasoning and justification for the finding",
		example: "Based on witness testimonies and evidence presented, the accused is found guilty of the alleged offense",
		maxLength: 3000,
	})
	@IsString()
	@IsNotEmpty()
	@MaxLength(3000)
	findingReason: string;

	@ApiPropertyOptional({
		description: "Additional notes about the finding",
		example: "Finding was reviewed by legal department",
		maxLength: 1000,
	})
	@IsString()
	@IsOptional()
	@MaxLength(1000)
	notes?: string;
}
