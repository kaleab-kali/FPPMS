import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString, MinLength } from "class-validator";

export class RejectRewardDto {
	@ApiProperty({
		description: "Reason for rejection",
		example: "Documentation incomplete. Missing employment verification.",
		minLength: 10,
	})
	@IsString()
	@MinLength(10)
	rejectionReason: string;

	@ApiPropertyOptional({
		description: "Additional notes",
		example: "Please resubmit with complete documentation",
	})
	@IsString()
	@IsOptional()
	notes?: string;
}
