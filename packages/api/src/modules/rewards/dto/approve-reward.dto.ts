import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class ApproveRewardDto {
	@ApiPropertyOptional({
		description: "Notes from the approver",
		example: "Verified all documentation. Approved for award ceremony.",
	})
	@IsString()
	@IsOptional()
	notes?: string;
}
