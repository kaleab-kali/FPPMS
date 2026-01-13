import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsDateString, IsInt, IsNotEmpty, IsOptional, IsString, Max, MaxLength, Min } from "class-validator";

export class ManualStepJumpDto {
	@ApiProperty({
		description: "The employee ID (UUID) to apply the manual step jump",
		example: "clx1234567890",
	})
	@IsString()
	@IsNotEmpty()
	employeeId: string;

	@ApiProperty({
		description: "The target salary step number (0-9)",
		example: 7,
		minimum: 0,
		maximum: 9,
	})
	@IsInt()
	@Min(0)
	@Max(9)
	toStep: number;

	@ApiProperty({
		description: "Reference number of the Commissioner order authorizing the step jump",
		example: "CO/2025/SAL/001",
	})
	@IsString()
	@IsNotEmpty()
	@MaxLength(100)
	orderReference: string;

	@ApiProperty({
		description: "Reason for the manual step jump",
		example: "Exceptional performance recognition by Commissioner",
	})
	@IsString()
	@IsNotEmpty()
	@MaxLength(500)
	reason: string;

	@ApiProperty({
		description: "Effective date for the step jump (ISO date string)",
		example: "2025-06-01",
	})
	@IsDateString()
	@IsNotEmpty()
	effectiveDate: string;

	@ApiPropertyOptional({
		description: "Path to the uploaded order document",
		example: "/uploads/orders/co-2025-sal-001.pdf",
	})
	@IsString()
	@IsOptional()
	documentPath?: string;

	@ApiPropertyOptional({
		description: "Additional notes for the manual step jump",
		example: "Approved during June 2025 Commissioner review",
	})
	@IsString()
	@MaxLength(500)
	@IsOptional()
	notes?: string;
}
