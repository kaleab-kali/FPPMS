import { ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsDateString, IsInt, IsOptional, IsString, Max, Min } from "class-validator";
import { ATTENDANCE_STATUS } from "./create-attendance-record.dto";

export class AttendanceQueryDto {
	@ApiPropertyOptional({ description: "Filter by employee ID" })
	@IsString()
	@IsOptional()
	employeeId?: string;

	@ApiPropertyOptional({ description: "Filter by center ID" })
	@IsString()
	@IsOptional()
	centerId?: string;

	@ApiPropertyOptional({ description: "Filter by department ID" })
	@IsString()
	@IsOptional()
	departmentId?: string;

	@ApiPropertyOptional({ description: "Filter by shift ID" })
	@IsString()
	@IsOptional()
	shiftId?: string;

	@ApiPropertyOptional({ description: "Start date for date range filter (YYYY-MM-DD)", example: "2025-01-01" })
	@IsDateString()
	@IsOptional()
	startDate?: string;

	@ApiPropertyOptional({ description: "End date for date range filter (YYYY-MM-DD)", example: "2025-01-31" })
	@IsDateString()
	@IsOptional()
	endDate?: string;

	@ApiPropertyOptional({ description: "Filter by attendance date (YYYY-MM-DD)", example: "2025-01-15" })
	@IsDateString()
	@IsOptional()
	attendanceDate?: string;

	@ApiPropertyOptional({
		description: "Filter by attendance status",
		enum: Object.values(ATTENDANCE_STATUS),
	})
	@IsString()
	@IsOptional()
	status?: string;

	@ApiPropertyOptional({ description: "Search by employee name or ID" })
	@IsString()
	@IsOptional()
	search?: string;

	@ApiPropertyOptional({ description: "Page number", default: 1 })
	@Transform(({ value }) => (value ? Number.parseInt(value, 10) : 1))
	@IsInt()
	@Min(1)
	@IsOptional()
	page?: number;

	@ApiPropertyOptional({ description: "Page size", default: 20 })
	@Transform(({ value }) => (value ? Number.parseInt(value, 10) : 20))
	@IsInt()
	@Min(1)
	@Max(100)
	@IsOptional()
	pageSize?: number;

	@ApiPropertyOptional({ description: "Sort field", default: "attendanceDate" })
	@IsString()
	@IsOptional()
	sortBy?: string;

	@ApiPropertyOptional({ description: "Sort order", enum: ["asc", "desc"], default: "desc" })
	@IsString()
	@IsOptional()
	sortOrder?: "asc" | "desc";
}
