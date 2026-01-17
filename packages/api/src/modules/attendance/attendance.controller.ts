import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "#api/common/decorators/current-user.decorator";
import { Permissions } from "#api/common/decorators/permissions.decorator";
import { AuthUserDto } from "#api/common/dto/auth-user.dto";
import { AttendanceService } from "./attendance.service";
import {
	AttendanceQueryDto,
	AttendanceRecordResponseDto,
	BulkAttendanceDto,
	BulkAttendanceResponseDto,
	CreateAttendanceRecordDto,
	UpdateAttendanceRecordDto,
} from "./dto";

@ApiTags("attendance")
@ApiBearerAuth("JWT-auth")
@Controller("attendance")
export class AttendanceController {
	constructor(private readonly attendanceService: AttendanceService) {}

	@Post()
	@Permissions("attendance.create.record")
	@ApiOperation({
		summary: "Create attendance record",
		description: "Create a new attendance record for an employee",
	})
	@ApiResponse({ status: 201, description: "Attendance record created", type: AttendanceRecordResponseDto })
	@ApiResponse({ status: 400, description: "Invalid input or record already exists" })
	@ApiResponse({ status: 401, description: "Unauthorized" })
	@ApiResponse({ status: 403, description: "Insufficient permissions" })
	@ApiResponse({ status: 404, description: "Employee or shift not found" })
	create(
		@CurrentUser() user: AuthUserDto,
		@Body() dto: CreateAttendanceRecordDto,
	): Promise<AttendanceRecordResponseDto> {
		return this.attendanceService.create(user.tenantId, dto, user.id);
	}

	@Post("bulk")
	@Permissions("attendance.create.bulk")
	@ApiOperation({
		summary: "Create bulk attendance records",
		description: "Create multiple attendance records at once",
	})
	@ApiResponse({ status: 201, description: "Bulk attendance records processed", type: BulkAttendanceResponseDto })
	@ApiResponse({ status: 400, description: "Invalid input" })
	@ApiResponse({ status: 401, description: "Unauthorized" })
	@ApiResponse({ status: 403, description: "Insufficient permissions" })
	createBulk(@CurrentUser() user: AuthUserDto, @Body() dto: BulkAttendanceDto): Promise<BulkAttendanceResponseDto> {
		return this.attendanceService.createBulk(user.tenantId, dto, user.id);
	}

	@Get()
	@Permissions("attendance.read.record")
	@ApiOperation({
		summary: "List attendance records",
		description: "Get attendance records with filtering and pagination",
	})
	@ApiResponse({ status: 200, description: "List of attendance records" })
	@ApiResponse({ status: 401, description: "Unauthorized" })
	@ApiResponse({ status: 403, description: "Insufficient permissions" })
	findAll(@CurrentUser() user: AuthUserDto, @Query() query: AttendanceQueryDto) {
		return this.attendanceService.findAll(user.tenantId, query);
	}

	@Get("daily/:date")
	@Permissions("attendance.read.record")
	@ApiOperation({
		summary: "Get daily attendance",
		description: "Get all attendance records for a specific date",
	})
	@ApiParam({ name: "date", description: "Date in YYYY-MM-DD format", example: "2025-01-15" })
	@ApiResponse({ status: 200, description: "Daily attendance records", type: [AttendanceRecordResponseDto] })
	@ApiResponse({ status: 401, description: "Unauthorized" })
	@ApiResponse({ status: 403, description: "Insufficient permissions" })
	findByDate(
		@CurrentUser() user: AuthUserDto,
		@Param("date") date: string,
		@Query("centerId") centerId?: string,
		@Query("departmentId") departmentId?: string,
	) {
		return this.attendanceService.findByDate(user.tenantId, date, centerId, departmentId);
	}

	@Get("employee/:employeeId")
	@Permissions("attendance.read.record")
	@ApiOperation({
		summary: "Get employee attendance history",
		description: "Get attendance records for a specific employee",
	})
	@ApiParam({ name: "employeeId", description: "Employee ID" })
	@ApiResponse({ status: 200, description: "Employee attendance records", type: [AttendanceRecordResponseDto] })
	@ApiResponse({ status: 401, description: "Unauthorized" })
	@ApiResponse({ status: 403, description: "Insufficient permissions" })
	@ApiResponse({ status: 404, description: "Employee not found" })
	findByEmployee(
		@CurrentUser() user: AuthUserDto,
		@Param("employeeId") employeeId: string,
		@Query("startDate") startDate?: string,
		@Query("endDate") endDate?: string,
	) {
		return this.attendanceService.findByEmployee(user.tenantId, employeeId, startDate, endDate);
	}

	@Get(":id")
	@Permissions("attendance.read.record")
	@ApiOperation({
		summary: "Get attendance record by ID",
		description: "Get a single attendance record by its ID",
	})
	@ApiParam({ name: "id", description: "Attendance record ID" })
	@ApiResponse({ status: 200, description: "Attendance record found", type: AttendanceRecordResponseDto })
	@ApiResponse({ status: 401, description: "Unauthorized" })
	@ApiResponse({ status: 403, description: "Insufficient permissions" })
	@ApiResponse({ status: 404, description: "Attendance record not found" })
	findOne(@CurrentUser() user: AuthUserDto, @Param("id") id: string): Promise<AttendanceRecordResponseDto> {
		return this.attendanceService.findOne(user.tenantId, id);
	}

	@Patch(":id")
	@Permissions("attendance.update.record")
	@ApiOperation({
		summary: "Update attendance record",
		description: "Update an existing attendance record",
	})
	@ApiParam({ name: "id", description: "Attendance record ID" })
	@ApiResponse({ status: 200, description: "Attendance record updated", type: AttendanceRecordResponseDto })
	@ApiResponse({ status: 400, description: "Invalid input" })
	@ApiResponse({ status: 401, description: "Unauthorized" })
	@ApiResponse({ status: 403, description: "Insufficient permissions" })
	@ApiResponse({ status: 404, description: "Attendance record or shift not found" })
	update(
		@CurrentUser() user: AuthUserDto,
		@Param("id") id: string,
		@Body() dto: UpdateAttendanceRecordDto,
	): Promise<AttendanceRecordResponseDto> {
		return this.attendanceService.update(user.tenantId, id, dto);
	}

	@Delete(":id")
	@Permissions("attendance.delete.record")
	@ApiOperation({
		summary: "Delete attendance record",
		description: "Delete an attendance record",
	})
	@ApiParam({ name: "id", description: "Attendance record ID" })
	@ApiResponse({ status: 200, description: "Attendance record deleted" })
	@ApiResponse({ status: 401, description: "Unauthorized" })
	@ApiResponse({ status: 403, description: "Insufficient permissions" })
	@ApiResponse({ status: 404, description: "Attendance record not found" })
	delete(@CurrentUser() user: AuthUserDto, @Param("id") id: string) {
		return this.attendanceService.delete(user.tenantId, id);
	}
}
