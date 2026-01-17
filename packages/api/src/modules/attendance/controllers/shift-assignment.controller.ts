import { Body, Controller, Delete, Get, Param, Post, Query } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "#api/common/decorators/current-user.decorator";
import { Permissions } from "#api/common/decorators/permissions.decorator";
import { AuthUserDto } from "#api/common/dto/auth-user.dto";
import {
	BulkAssignmentResponseDto,
	BulkShiftAssignmentDto,
	CreateShiftAssignmentDto,
	ShiftAssignmentResponseDto,
	SwapShiftDto,
} from "../dto";
import { ShiftAssignmentService } from "../services/shift-assignment.service";

@ApiTags("shift-assignments")
@ApiBearerAuth("JWT-auth")
@Controller("shift-assignments")
export class ShiftAssignmentController {
	constructor(private readonly shiftAssignmentService: ShiftAssignmentService) {}

	@Post()
	@Permissions("attendance.assign.shift")
	@ApiOperation({
		summary: "Create shift assignment",
		description: "Assign a shift to an employee for a specific date",
	})
	@ApiResponse({ status: 201, description: "Shift assignment created", type: ShiftAssignmentResponseDto })
	@ApiResponse({ status: 400, description: "Invalid input or assignment already exists" })
	@ApiResponse({ status: 401, description: "Unauthorized" })
	@ApiResponse({ status: 403, description: "Insufficient permissions" })
	@ApiResponse({ status: 404, description: "Employee or shift not found" })
	create(@CurrentUser() user: AuthUserDto, @Body() dto: CreateShiftAssignmentDto): Promise<ShiftAssignmentResponseDto> {
		return this.shiftAssignmentService.create(user.tenantId, dto);
	}

	@Post("bulk")
	@Permissions("attendance.assign.shift")
	@ApiOperation({
		summary: "Bulk assign shifts",
		description: "Assign shifts to multiple employees for a date range",
	})
	@ApiResponse({ status: 201, description: "Bulk assignment processed", type: BulkAssignmentResponseDto })
	@ApiResponse({ status: 400, description: "Invalid input" })
	@ApiResponse({ status: 401, description: "Unauthorized" })
	@ApiResponse({ status: 403, description: "Insufficient permissions" })
	@ApiResponse({ status: 404, description: "Shift not found" })
	createBulk(
		@CurrentUser() user: AuthUserDto,
		@Body() dto: BulkShiftAssignmentDto,
	): Promise<BulkAssignmentResponseDto> {
		return this.shiftAssignmentService.createBulk(user.tenantId, dto);
	}

	@Get()
	@Permissions("attendance.read.record")
	@ApiOperation({
		summary: "List shift assignments",
		description: "Get shift assignments with filtering",
	})
	@ApiQuery({ name: "employeeId", required: false, description: "Filter by employee ID" })
	@ApiQuery({ name: "shiftId", required: false, description: "Filter by shift ID" })
	@ApiQuery({ name: "startDate", required: false, description: "Start date (YYYY-MM-DD)" })
	@ApiQuery({ name: "endDate", required: false, description: "End date (YYYY-MM-DD)" })
	@ApiResponse({ status: 200, description: "List of shift assignments", type: [ShiftAssignmentResponseDto] })
	@ApiResponse({ status: 401, description: "Unauthorized" })
	@ApiResponse({ status: 403, description: "Insufficient permissions" })
	findAll(
		@CurrentUser() user: AuthUserDto,
		@Query("employeeId") employeeId?: string,
		@Query("shiftId") shiftId?: string,
		@Query("startDate") startDate?: string,
		@Query("endDate") endDate?: string,
	): Promise<ShiftAssignmentResponseDto[]> {
		return this.shiftAssignmentService.findAll(user.tenantId, { employeeId, shiftId, startDate, endDate });
	}

	@Get("employee/:employeeId")
	@Permissions("attendance.read.record")
	@ApiOperation({
		summary: "Get employee shift assignments",
		description: "Get shift assignments for a specific employee",
	})
	@ApiParam({ name: "employeeId", description: "Employee ID" })
	@ApiQuery({ name: "startDate", required: false, description: "Start date (YYYY-MM-DD)" })
	@ApiQuery({ name: "endDate", required: false, description: "End date (YYYY-MM-DD)" })
	@ApiResponse({ status: 200, description: "Employee shift assignments", type: [ShiftAssignmentResponseDto] })
	@ApiResponse({ status: 401, description: "Unauthorized" })
	@ApiResponse({ status: 403, description: "Insufficient permissions" })
	@ApiResponse({ status: 404, description: "Employee not found" })
	findByEmployee(
		@CurrentUser() user: AuthUserDto,
		@Param("employeeId") employeeId: string,
		@Query("startDate") startDate?: string,
		@Query("endDate") endDate?: string,
	): Promise<ShiftAssignmentResponseDto[]> {
		return this.shiftAssignmentService.findByEmployee(user.tenantId, employeeId, startDate, endDate);
	}

	@Get("date/:date")
	@Permissions("attendance.read.record")
	@ApiOperation({
		summary: "Get shift assignments by date",
		description: "Get all shift assignments for a specific date",
	})
	@ApiParam({ name: "date", description: "Date (YYYY-MM-DD)" })
	@ApiQuery({ name: "centerId", required: false, description: "Filter by center ID" })
	@ApiResponse({ status: 200, description: "Shift assignments for date", type: [ShiftAssignmentResponseDto] })
	@ApiResponse({ status: 401, description: "Unauthorized" })
	@ApiResponse({ status: 403, description: "Insufficient permissions" })
	findByDate(
		@CurrentUser() user: AuthUserDto,
		@Param("date") date: string,
		@Query("centerId") centerId?: string,
	): Promise<ShiftAssignmentResponseDto[]> {
		return this.shiftAssignmentService.findByDate(user.tenantId, date, centerId);
	}

	@Post("swap")
	@Permissions("attendance.assign.shift")
	@ApiOperation({
		summary: "Swap shift assignment",
		description: "Swap a shift assignment with another employee",
	})
	@ApiResponse({ status: 200, description: "Shift swapped successfully", type: ShiftAssignmentResponseDto })
	@ApiResponse({ status: 400, description: "Invalid input or cannot swap" })
	@ApiResponse({ status: 401, description: "Unauthorized" })
	@ApiResponse({ status: 403, description: "Insufficient permissions" })
	@ApiResponse({ status: 404, description: "Assignment or employee not found" })
	swapShift(@CurrentUser() user: AuthUserDto, @Body() dto: SwapShiftDto): Promise<ShiftAssignmentResponseDto> {
		return this.shiftAssignmentService.swapShift(user.tenantId, dto, user.id);
	}

	@Delete(":id")
	@Permissions("attendance.assign.shift")
	@ApiOperation({
		summary: "Delete shift assignment",
		description: "Delete a shift assignment",
	})
	@ApiParam({ name: "id", description: "Shift assignment ID" })
	@ApiResponse({ status: 200, description: "Shift assignment deleted" })
	@ApiResponse({ status: 401, description: "Unauthorized" })
	@ApiResponse({ status: 403, description: "Insufficient permissions" })
	@ApiResponse({ status: 404, description: "Shift assignment not found" })
	delete(@CurrentUser() user: AuthUserDto, @Param("id") id: string) {
		return this.shiftAssignmentService.delete(user.tenantId, id);
	}

	@Delete("employee/:employeeId/range")
	@Permissions("attendance.assign.shift")
	@ApiOperation({
		summary: "Delete shift assignments by date range",
		description: "Delete all shift assignments for an employee within a date range",
	})
	@ApiParam({ name: "employeeId", description: "Employee ID" })
	@ApiQuery({ name: "startDate", required: true, description: "Start date (YYYY-MM-DD)" })
	@ApiQuery({ name: "endDate", required: true, description: "End date (YYYY-MM-DD)" })
	@ApiResponse({ status: 200, description: "Shift assignments deleted" })
	@ApiResponse({ status: 401, description: "Unauthorized" })
	@ApiResponse({ status: 403, description: "Insufficient permissions" })
	deleteByDateRange(
		@CurrentUser() user: AuthUserDto,
		@Param("employeeId") employeeId: string,
		@Query("startDate") startDate: string,
		@Query("endDate") endDate: string,
	) {
		return this.shiftAssignmentService.deleteByDateRange(user.tenantId, employeeId, startDate, endDate);
	}
}
