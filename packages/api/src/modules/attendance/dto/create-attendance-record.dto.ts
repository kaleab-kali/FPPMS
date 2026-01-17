import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsDateString, IsInt, IsNotEmpty, IsOptional, IsString, Max, Min } from "class-validator";

export const ATTENDANCE_STATUS = {
	PRESENT: "PRESENT",
	ABSENT: "ABSENT",
	LATE: "LATE",
	HALF_DAY: "HALF_DAY",
	ON_LEAVE: "ON_LEAVE",
} as const;

export type AttendanceStatus = (typeof ATTENDANCE_STATUS)[keyof typeof ATTENDANCE_STATUS];

export const CLOCK_METHOD = {
	MANUAL: "MANUAL",
	BIOMETRIC_FINGERPRINT: "BIOMETRIC_FINGERPRINT",
	BIOMETRIC_FACE: "BIOMETRIC_FACE",
	CARD_SWIPE: "CARD_SWIPE",
} as const;

export type ClockMethod = (typeof CLOCK_METHOD)[keyof typeof CLOCK_METHOD];

export class CreateAttendanceRecordDto {
	@ApiProperty({ description: "Employee ID", example: "cuid123" })
	@IsString()
	@IsNotEmpty()
	employeeId: string;

	@ApiProperty({ description: "Attendance date (YYYY-MM-DD)", example: "2025-01-15" })
	@IsDateString()
	@IsNotEmpty()
	attendanceDate: string;

	@ApiPropertyOptional({ description: "Shift ID if employee is assigned to a shift" })
	@IsString()
	@IsOptional()
	shiftId?: string;

	@ApiPropertyOptional({ description: "Clock in time ISO string", example: "2025-01-15T08:00:00Z" })
	@IsDateString()
	@IsOptional()
	clockIn?: string;

	@ApiPropertyOptional({ description: "Clock out time ISO string", example: "2025-01-15T17:00:00Z" })
	@IsDateString()
	@IsOptional()
	clockOut?: string;

	@ApiPropertyOptional({
		description: "Clock in method",
		enum: Object.values(CLOCK_METHOD),
		default: CLOCK_METHOD.MANUAL,
	})
	@IsString()
	@IsOptional()
	clockInMethod?: string;

	@ApiPropertyOptional({
		description: "Clock out method",
		enum: Object.values(CLOCK_METHOD),
		default: CLOCK_METHOD.MANUAL,
	})
	@IsString()
	@IsOptional()
	clockOutMethod?: string;

	@ApiProperty({
		description: "Attendance status",
		enum: Object.values(ATTENDANCE_STATUS),
		default: ATTENDANCE_STATUS.PRESENT,
	})
	@IsString()
	@IsNotEmpty()
	status: string;

	@ApiPropertyOptional({ description: "Late minutes (0-1440)", example: 15 })
	@IsInt()
	@Min(0)
	@Max(1440)
	@IsOptional()
	lateMinutes?: number;

	@ApiPropertyOptional({ description: "Additional remarks or notes" })
	@IsString()
	@IsOptional()
	remarks?: string;
}
