import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { ArrayMinSize, IsArray, IsDateString, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateShiftAssignmentDto {
	@ApiProperty({ description: "Employee ID to assign shift to" })
	@IsString()
	@IsNotEmpty()
	employeeId: string;

	@ApiProperty({ description: "Shift ID to assign" })
	@IsString()
	@IsNotEmpty()
	shiftId: string;

	@ApiProperty({ description: "Date of the shift (YYYY-MM-DD)", example: "2025-01-15" })
	@IsDateString()
	@IsNotEmpty()
	shiftDate: string;
}

export class BulkShiftAssignmentDto {
	@ApiProperty({ description: "Shift ID to assign" })
	@IsString()
	@IsNotEmpty()
	shiftId: string;

	@ApiProperty({ description: "Start date for assignment range (YYYY-MM-DD)", example: "2025-01-01" })
	@IsDateString()
	@IsNotEmpty()
	startDate: string;

	@ApiProperty({ description: "End date for assignment range (YYYY-MM-DD)", example: "2025-01-31" })
	@IsDateString()
	@IsNotEmpty()
	endDate: string;

	@ApiProperty({ description: "Employee IDs to assign the shift to", type: [String] })
	@IsArray()
	@ArrayMinSize(1)
	@IsString({ each: true })
	employeeIds: string[];

	@ApiPropertyOptional({
		description: "Days of week to include (0=Sunday, 6=Saturday)",
		type: [Number],
		example: [1, 2, 3, 4, 5],
	})
	@IsArray()
	@IsOptional()
	daysOfWeek?: number[];

	@ApiPropertyOptional({ description: "Whether to skip holidays", default: true })
	@IsOptional()
	skipHolidays?: boolean;
}

export class SwapShiftDto {
	@ApiProperty({ description: "Original shift assignment ID to swap" })
	@IsString()
	@IsNotEmpty()
	assignmentId: string;

	@ApiProperty({ description: "Employee ID to swap with" })
	@IsString()
	@IsNotEmpty()
	swapWithEmployeeId: string;
}
