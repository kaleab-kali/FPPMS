import { Controller, Get, Param, Query } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "#api/common/decorators/current-user.decorator";
import { Permissions } from "#api/common/decorators/permissions.decorator";
import { AuthUserDto } from "#api/common/dto/auth-user.dto";
import {
	AttendanceOverviewDto,
	AttendanceReportQueryDto,
	AttendanceTrendDto,
	DepartmentAttendanceSummaryDto,
	EmployeeAttendanceSummaryDto,
	LateArrivalReportDto,
} from "../dto/attendance-report.dto";
import { AttendanceReportService } from "../services/attendance-report.service";

@ApiTags("attendance-reports")
@ApiBearerAuth("JWT-auth")
@Controller("attendance/reports")
export class AttendanceReportController {
	constructor(private readonly reportService: AttendanceReportService) {}

	@Get("overview")
	@Permissions("attendance.read.report")
	@ApiOperation({
		summary: "Get attendance overview",
		description: "Get attendance overview for today or a specific date",
	})
	@ApiQuery({ name: "date", required: false, description: "Date (YYYY-MM-DD), defaults to today" })
	@ApiResponse({ status: 200, description: "Attendance overview", type: AttendanceOverviewDto })
	@ApiResponse({ status: 401, description: "Unauthorized" })
	@ApiResponse({ status: 403, description: "Insufficient permissions" })
	getOverview(@CurrentUser() user: AuthUserDto, @Query("date") date?: string): Promise<AttendanceOverviewDto> {
		return this.reportService.getOverview(user.tenantId, date);
	}

	@Get("monthly/:employeeId")
	@Permissions("attendance.read.report")
	@ApiOperation({
		summary: "Get employee monthly summary",
		description: "Get monthly attendance summary for a specific employee",
	})
	@ApiParam({ name: "employeeId", description: "Employee ID" })
	@ApiQuery({ name: "month", required: true, description: "Month (1-12)" })
	@ApiQuery({ name: "year", required: true, description: "Year" })
	@ApiResponse({ status: 200, description: "Employee monthly summary", type: EmployeeAttendanceSummaryDto })
	@ApiResponse({ status: 401, description: "Unauthorized" })
	@ApiResponse({ status: 403, description: "Insufficient permissions" })
	@ApiResponse({ status: 404, description: "Employee not found" })
	getEmployeeMonthlySummary(
		@CurrentUser() user: AuthUserDto,
		@Param("employeeId") employeeId: string,
		@Query("month") month: string,
		@Query("year") year: string,
	): Promise<EmployeeAttendanceSummaryDto> {
		return this.reportService.getEmployeeMonthlySummary(user.tenantId, employeeId, Number(month), Number(year));
	}

	@Get("department/:departmentId")
	@Permissions("attendance.read.report")
	@ApiOperation({
		summary: "Get department summary",
		description: "Get attendance summary for a specific department",
	})
	@ApiParam({ name: "departmentId", description: "Department ID" })
	@ApiQuery({ name: "date", required: false, description: "Date (YYYY-MM-DD), defaults to today" })
	@ApiResponse({ status: 200, description: "Department summary", type: DepartmentAttendanceSummaryDto })
	@ApiResponse({ status: 401, description: "Unauthorized" })
	@ApiResponse({ status: 403, description: "Insufficient permissions" })
	@ApiResponse({ status: 404, description: "Department not found" })
	getDepartmentSummary(
		@CurrentUser() user: AuthUserDto,
		@Param("departmentId") departmentId: string,
		@Query("date") date?: string,
	): Promise<DepartmentAttendanceSummaryDto> {
		return this.reportService.getDepartmentSummary(user.tenantId, departmentId, date);
	}

	@Get("trends")
	@Permissions("attendance.read.report")
	@ApiOperation({
		summary: "Get attendance trends",
		description: "Get attendance trends over a date range",
	})
	@ApiResponse({ status: 200, description: "Attendance trends", type: [AttendanceTrendDto] })
	@ApiResponse({ status: 401, description: "Unauthorized" })
	@ApiResponse({ status: 403, description: "Insufficient permissions" })
	getAttendanceTrends(
		@CurrentUser() user: AuthUserDto,
		@Query() query: AttendanceReportQueryDto,
	): Promise<AttendanceTrendDto[]> {
		return this.reportService.getAttendanceTrends(user.tenantId, query);
	}

	@Get("late-arrivals")
	@Permissions("attendance.read.report")
	@ApiOperation({
		summary: "Get late arrivals report",
		description: "Get list of late arrivals with details",
	})
	@ApiQuery({ name: "lateThreshold", required: false, description: "Minimum late minutes to include (default: 0)" })
	@ApiResponse({ status: 200, description: "Late arrivals report", type: [LateArrivalReportDto] })
	@ApiResponse({ status: 401, description: "Unauthorized" })
	@ApiResponse({ status: 403, description: "Insufficient permissions" })
	getLateArrivalsReport(
		@CurrentUser() user: AuthUserDto,
		@Query() query: AttendanceReportQueryDto,
		@Query("lateThreshold") lateThreshold?: string,
	): Promise<LateArrivalReportDto[]> {
		return this.reportService.getLateArrivalsReport(user.tenantId, query, Number(lateThreshold) || 0);
	}

	@Get("absenteeism")
	@Permissions("attendance.read.report")
	@ApiOperation({
		summary: "Get absenteeism report",
		description: "Get report of employee absences grouped by employee",
	})
	@ApiResponse({ status: 200, description: "Absenteeism report" })
	@ApiResponse({ status: 401, description: "Unauthorized" })
	@ApiResponse({ status: 403, description: "Insufficient permissions" })
	getAbsenteeismReport(@CurrentUser() user: AuthUserDto, @Query() query: AttendanceReportQueryDto) {
		return this.reportService.getAbsenteeismReport(user.tenantId, query);
	}
}
