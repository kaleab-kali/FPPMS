import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

class EmployeeBasicDto {
	@ApiProperty({ description: "Employee ID" })
	id: string;

	@ApiProperty({ description: "Employee code" })
	employeeId: string;

	@ApiProperty({ description: "Full name" })
	fullName: string;

	@ApiPropertyOptional({ description: "Full name in Amharic" })
	fullNameAm?: string;
}

class ShiftBasicDto {
	@ApiProperty({ description: "Shift ID" })
	id: string;

	@ApiProperty({ description: "Shift code" })
	code: string;

	@ApiProperty({ description: "Shift name" })
	name: string;

	@ApiProperty({ description: "Start time" })
	startTime: string;

	@ApiProperty({ description: "End time" })
	endTime: string;

	@ApiPropertyOptional({ description: "Color" })
	color?: string;
}

export class ShiftAssignmentResponseDto {
	@ApiProperty({ description: "Assignment ID" })
	id: string;

	@ApiProperty({ description: "Tenant ID" })
	tenantId: string;

	@ApiProperty({ description: "Employee ID" })
	employeeId: string;

	@ApiProperty({ description: "Shift ID" })
	shiftId: string;

	@ApiProperty({ description: "Shift date" })
	shiftDate: Date;

	@ApiProperty({ description: "Assignment status" })
	status: string;

	@ApiPropertyOptional({ description: "Employee ID this shift was swapped with" })
	swappedWithEmployeeId?: string;

	@ApiPropertyOptional({ description: "User who approved the swap" })
	swapApprovedBy?: string;

	@ApiProperty({ description: "Created timestamp" })
	createdAt: Date;

	@ApiProperty({ description: "Updated timestamp" })
	updatedAt: Date;

	@ApiPropertyOptional({ description: "Employee details", type: EmployeeBasicDto })
	employee?: EmployeeBasicDto;

	@ApiPropertyOptional({ description: "Shift details", type: ShiftBasicDto })
	shift?: ShiftBasicDto;
}

export class BulkAssignmentResponseDto {
	@ApiProperty({ description: "Number of assignments created" })
	created: number;

	@ApiProperty({ description: "Number of assignments skipped (already exists)" })
	skipped: number;

	@ApiProperty({ description: "Number of assignments failed" })
	failed: number;

	@ApiProperty({ description: "Error messages", type: [String] })
	errors: string[];
}
