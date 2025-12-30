import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsDateString, IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength } from "class-validator";

export class ForwardToCommitteeDto {
	@ApiProperty({
		description: "ID of the committee to forward the complaint to",
		example: "clxyz123...",
	})
	@IsUUID()
	@IsNotEmpty()
	committeeId: string;

	@ApiProperty({
		description: "Date when the complaint was forwarded (ISO 8601 format)",
		example: "2025-02-05",
	})
	@IsDateString()
	@IsNotEmpty()
	forwardedDate: string;

	@ApiPropertyOptional({
		description: "Additional notes about the forwarding",
		example: "Forwarded to committee due to severity level 5",
		maxLength: 1000,
	})
	@IsString()
	@IsOptional()
	@MaxLength(1000)
	notes?: string;
}
