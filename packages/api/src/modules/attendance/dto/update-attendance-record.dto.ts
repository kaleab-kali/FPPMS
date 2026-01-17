import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsDateString, IsInt, IsOptional, IsString, Max, Min } from "class-validator";
import { ATTENDANCE_STATUS, CLOCK_METHOD } from "./create-attendance-record.dto";

export class UpdateAttendanceRecordDto {
	@ApiPropertyOptional({ description: "Shift ID" })
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
	})
	@IsString()
	@IsOptional()
	clockInMethod?: string;

	@ApiPropertyOptional({
		description: "Clock out method",
		enum: Object.values(CLOCK_METHOD),
	})
	@IsString()
	@IsOptional()
	clockOutMethod?: string;

	@ApiPropertyOptional({
		description: "Attendance status",
		enum: Object.values(ATTENDANCE_STATUS),
	})
	@IsString()
	@IsOptional()
	status?: string;

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
