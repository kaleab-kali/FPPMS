import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsDateString, IsInt, IsOptional, IsString, Max, Min } from "class-validator";

export class AttendanceReportQueryDto {
	@ApiPropertyOptional({ description: "Start date (YYYY-MM-DD)", example: "2025-01-01" })
	@IsDateString()
	@IsOptional()
	startDate?: string;

	@ApiPropertyOptional({ description: "End date (YYYY-MM-DD)", example: "2025-01-31" })
	@IsDateString()
	@IsOptional()
	endDate?: string;

	@ApiPropertyOptional({ description: "Month (1-12)", example: 1 })
	@Transform(({ value }) => (value ? Number.parseInt(value, 10) : undefined))
	@IsInt()
	@Min(1)
	@Max(12)
	@IsOptional()
	month?: number;

	@ApiPropertyOptional({ description: "Year", example: 2025 })
	@Transform(({ value }) => (value ? Number.parseInt(value, 10) : undefined))
	@IsInt()
	@Min(2020)
	@Max(2100)
	@IsOptional()
	year?: number;

	@ApiPropertyOptional({ description: "Center ID filter" })
	@IsString()
	@IsOptional()
	centerId?: string;

	@ApiPropertyOptional({ description: "Department ID filter" })
	@IsString()
	@IsOptional()
	departmentId?: string;

	@ApiPropertyOptional({ description: "Group results by", enum: ["day", "week", "month"] })
	@IsString()
	@IsOptional()
	groupBy?: "day" | "week" | "month";
}

export class EmployeeAttendanceSummaryDto {
	@ApiProperty({ description: "Employee ID" })
	employeeId: string;

	@ApiProperty({ description: "Employee code" })
	employeeCode: string;

	@ApiProperty({ description: "Employee name" })
	employeeName: string;

	@ApiProperty({ description: "Total working days in period" })
	totalWorkingDays: number;

	@ApiProperty({ description: "Days present" })
	daysPresent: number;

	@ApiProperty({ description: "Days absent" })
	daysAbsent: number;

	@ApiProperty({ description: "Days late" })
	daysLate: number;

	@ApiProperty({ description: "Days on leave" })
	daysOnLeave: number;

	@ApiProperty({ description: "Half days" })
	halfDays: number;

	@ApiProperty({ description: "Total hours worked" })
	totalHoursWorked: number;

	@ApiProperty({ description: "Total overtime hours" })
	totalOvertimeHours: number;

	@ApiProperty({ description: "Total late minutes" })
	totalLateMinutes: number;

	@ApiProperty({ description: "Attendance percentage" })
	attendancePercentage: number;
}

export class DepartmentAttendanceSummaryDto {
	@ApiProperty({ description: "Department ID" })
	departmentId: string;

	@ApiProperty({ description: "Department name" })
	departmentName: string;

	@ApiProperty({ description: "Total employees" })
	totalEmployees: number;

	@ApiProperty({ description: "Average attendance percentage" })
	avgAttendancePercentage: number;

	@ApiProperty({ description: "Total present today" })
	presentToday: number;

	@ApiProperty({ description: "Total absent today" })
	absentToday: number;

	@ApiProperty({ description: "Total late today" })
	lateToday: number;

	@ApiProperty({ description: "Total on leave today" })
	onLeaveToday: number;
}

export class AttendanceTrendDto {
	@ApiProperty({ description: "Date or period label" })
	period: string;

	@ApiProperty({ description: "Date" })
	date: Date;

	@ApiProperty({ description: "Present count" })
	present: number;

	@ApiProperty({ description: "Absent count" })
	absent: number;

	@ApiProperty({ description: "Late count" })
	late: number;

	@ApiProperty({ description: "On leave count" })
	onLeave: number;

	@ApiProperty({ description: "Total employees" })
	total: number;

	@ApiProperty({ description: "Attendance rate percentage" })
	attendanceRate: number;
}

export class LateArrivalReportDto {
	@ApiProperty({ description: "Employee ID" })
	employeeId: string;

	@ApiProperty({ description: "Employee code" })
	employeeCode: string;

	@ApiProperty({ description: "Employee name" })
	employeeName: string;

	@ApiProperty({ description: "Department name" })
	departmentName: string;

	@ApiProperty({ description: "Date of late arrival" })
	date: Date;

	@ApiProperty({ description: "Expected time" })
	expectedTime: string;

	@ApiProperty({ description: "Actual clock in time" })
	actualTime: Date;

	@ApiProperty({ description: "Minutes late" })
	lateMinutes: number;
}

export class AttendanceOverviewDto {
	@ApiProperty({ description: "Total employees" })
	totalEmployees: number;

	@ApiProperty({ description: "Present today" })
	presentToday: number;

	@ApiProperty({ description: "Absent today" })
	absentToday: number;

	@ApiProperty({ description: "Late today" })
	lateToday: number;

	@ApiProperty({ description: "On leave today" })
	onLeaveToday: number;

	@ApiProperty({ description: "Attendance rate percentage" })
	attendanceRate: number;

	@ApiProperty({ description: "Not yet clocked in" })
	notClockedIn: number;
}
