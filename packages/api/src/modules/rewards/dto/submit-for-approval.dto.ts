import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class SubmitForApprovalDto {
	@ApiPropertyOptional({
		description: "Additional notes for the approval request",
		example: "Employee has completed all requirements for this milestone",
	})
	@IsString()
	@IsOptional()
	notes?: string;
}
