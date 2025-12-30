import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsDateString, IsNotEmpty, IsOptional, IsString, MaxLength } from "class-validator";

export class AssignCommitteeDto {
	@ApiProperty({
		description: "ID of the discipline committee to assign the complaint to",
		example: "clx1234567890committee",
	})
	@IsString()
	@IsNotEmpty()
	committeeId: string;

	@ApiProperty({
		description: "Date when the complaint was assigned to the committee (ISO 8601 format)",
		example: "2025-01-22",
	})
	@IsDateString()
	@IsNotEmpty()
	assignedDate: string;

	@ApiPropertyOptional({
		description: "Additional notes about the committee assignment",
		example: "Assigned to Center Discipline Committee for investigation",
		maxLength: 1000,
	})
	@IsString()
	@IsOptional()
	@MaxLength(1000)
	notes?: string;
}
