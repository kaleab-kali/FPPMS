import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class CreateServiceRewardDto {
	@ApiProperty({
		description: "Employee ID (database ID)",
		example: "clx1234567890employee",
	})
	@IsString()
	employeeId: string;

	@ApiProperty({
		description: "Milestone ID",
		example: "clx1234567890milestone",
	})
	@IsString()
	milestoneId: string;

	@ApiPropertyOptional({
		description: "Notes for creating this reward record",
		example: "Employee has reached 10 years milestone",
	})
	@IsString()
	@IsOptional()
	notes?: string;
}
