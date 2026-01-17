import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

class EmployeeBasicDto {
	@ApiProperty({ description: "Employee ID" })
	id: string;

	@ApiProperty({ description: "Employee code (e.g., FPC-0001/25)" })
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

	@ApiProperty({ description: "Start time (HH:mm)" })
	startTime: string;

	@ApiProperty({ description: "End time (HH:mm)" })
	endTime: string;
}

export class AttendanceRecordResponseDto {
	@ApiProperty({ description: "Attendance record ID" })
	id: string;

	@ApiProperty({ description: "Tenant ID" })
	tenantId: string;

	@ApiProperty({ description: "Employee ID" })
	employeeId: string;

	@ApiProperty({ description: "Attendance date" })
	attendanceDate: Date;

	@ApiPropertyOptional({ description: "Shift ID" })
	shiftId?: string;

	@ApiPropertyOptional({ description: "Clock in time" })
	clockIn?: Date;

	@ApiPropertyOptional({ description: "Clock out time" })
	clockOut?: Date;

	@ApiPropertyOptional({ description: "Clock in method" })
	clockInMethod?: string;

	@ApiPropertyOptional({ description: "Clock out method" })
	clockOutMethod?: string;

	@ApiPropertyOptional({ description: "Clock in device ID" })
	clockInDeviceId?: string;

	@ApiPropertyOptional({ description: "Clock out device ID" })
	clockOutDeviceId?: string;

	@ApiProperty({ description: "Attendance status" })
	status: string;

	@ApiPropertyOptional({ description: "Hours worked" })
	hoursWorked?: number;

	@ApiPropertyOptional({ description: "Overtime hours" })
	overtimeHours?: number;

	@ApiPropertyOptional({ description: "Late minutes" })
	lateMinutes?: number;

	@ApiPropertyOptional({ description: "Remarks" })
	remarks?: string;

	@ApiPropertyOptional({ description: "Recorded by user ID" })
	recordedBy?: string;

	@ApiProperty({ description: "Created timestamp" })
	createdAt: Date;

	@ApiProperty({ description: "Updated timestamp" })
	updatedAt: Date;

	@ApiPropertyOptional({ description: "Employee details", type: EmployeeBasicDto })
	employee?: EmployeeBasicDto;

	@ApiPropertyOptional({ description: "Shift details", type: ShiftBasicDto })
	shift?: ShiftBasicDto;
}
