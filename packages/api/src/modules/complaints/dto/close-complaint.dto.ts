import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsDateString, IsNotEmpty, IsOptional, IsString, MaxLength } from "class-validator";

export class CloseComplaintDto {
	@ApiProperty({
		description: "Date when the complaint was closed (ISO 8601 format)",
		example: "2025-02-20",
	})
	@IsDateString()
	@IsNotEmpty()
	closedDate: string;

	@ApiProperty({
		description: "Reason for closing the complaint",
		example: "All appeals exhausted, punishment executed, case closed",
		maxLength: 1000,
	})
	@IsString()
	@IsNotEmpty()
	@MaxLength(1000)
	closureReason: string;

	@ApiPropertyOptional({
		description: "Additional notes about the closure",
		example: "Salary deduction applied in March 2025 payroll",
		maxLength: 1000,
	})
	@IsString()
	@IsOptional()
	@MaxLength(1000)
	notes?: string;
}
