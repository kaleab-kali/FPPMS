import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsDateString, IsNotEmpty, IsOptional, IsString, MaxLength } from "class-validator";

export class ForwardToHqDto {
	@ApiProperty({
		description: "ID of the HQ discipline committee to forward the complaint to",
		example: "clx1234567890hqcommittee",
	})
	@IsString()
	@IsNotEmpty()
	hqCommitteeId: string;

	@ApiProperty({
		description: "Date when the complaint was forwarded to HQ (ISO 8601 format)",
		example: "2025-02-01",
	})
	@IsDateString()
	@IsNotEmpty()
	forwardedDate: string;

	@ApiPropertyOptional({
		description: "Additional notes about forwarding to HQ",
		example: "Forwarded to HQ Discipline Committee for final punishment decision",
		maxLength: 1000,
	})
	@IsString()
	@IsOptional()
	@MaxLength(1000)
	notes?: string;
}
