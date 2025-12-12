import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";
import { SYSTEM_ROLES } from "#api/common/constants/roles.constant";
import { CurrentUser } from "#api/common/decorators/current-user.decorator";
import { Roles } from "#api/common/decorators/roles.decorator";
import { AuthUserDto } from "#api/common/dto/auth-user.dto";
import {
	CreateCivilianEmployeeDto,
	CreateMilitaryEmployeeDto,
	CreateTemporaryEmployeeDto,
	EmployeeFilterDto,
	EmployeeListResponseDto,
	EmployeeResponseDto,
	UpdateEmployeeDto,
} from "#api/modules/employees/dto/index";
import { EmployeesService } from "#api/modules/employees/employees.service";

@ApiTags("employees")
@ApiBearerAuth("JWT-auth")
@Controller("employees")
export class EmployeesController {
	constructor(private employeesService: EmployeesService) {}

	@Post("military")
	@Roles(SYSTEM_ROLES.IT_ADMIN, SYSTEM_ROLES.HQ_ADMIN, SYSTEM_ROLES.HR_DIRECTOR, SYSTEM_ROLES.HR_OFFICER)
	@ApiOperation({ summary: "Register military employee", description: "Register a new military employee" })
	@ApiResponse({ status: 201, description: "Military employee registered", type: EmployeeResponseDto })
	@ApiResponse({ status: 400, description: "Invalid input or rank not found" })
	registerMilitary(
		@CurrentUser() user: AuthUserDto,
		@Body() dto: CreateMilitaryEmployeeDto,
	): Promise<EmployeeResponseDto> {
		return this.employeesService.registerMilitaryEmployee(user.tenantId, dto, user.id);
	}

	@Post("civilian")
	@Roles(SYSTEM_ROLES.IT_ADMIN, SYSTEM_ROLES.HQ_ADMIN, SYSTEM_ROLES.HR_DIRECTOR, SYSTEM_ROLES.HR_OFFICER)
	@ApiOperation({ summary: "Register civilian employee", description: "Register a new civilian employee" })
	@ApiResponse({ status: 201, description: "Civilian employee registered", type: EmployeeResponseDto })
	@ApiResponse({ status: 400, description: "Invalid input" })
	registerCivilian(
		@CurrentUser() user: AuthUserDto,
		@Body() dto: CreateCivilianEmployeeDto,
	): Promise<EmployeeResponseDto> {
		return this.employeesService.registerCivilianEmployee(user.tenantId, dto, user.id);
	}

	@Post("temporary")
	@Roles(SYSTEM_ROLES.IT_ADMIN, SYSTEM_ROLES.HQ_ADMIN, SYSTEM_ROLES.HR_DIRECTOR, SYSTEM_ROLES.HR_OFFICER)
	@ApiOperation({ summary: "Register temporary employee", description: "Register a new temporary/contract employee" })
	@ApiResponse({ status: 201, description: "Temporary employee registered", type: EmployeeResponseDto })
	@ApiResponse({ status: 400, description: "Invalid input" })
	registerTemporary(
		@CurrentUser() user: AuthUserDto,
		@Body() dto: CreateTemporaryEmployeeDto,
	): Promise<EmployeeResponseDto> {
		return this.employeesService.registerTemporaryEmployee(user.tenantId, dto, user.id);
	}

	@Get()
	@ApiOperation({ summary: "List employees", description: "Get all employees with filtering and pagination" })
	@ApiQuery({ name: "search", required: false, description: "Search by name, employee ID, or phone" })
	@ApiQuery({ name: "employeeType", required: false, enum: ["MILITARY", "CIVILIAN", "TEMPORARY"] })
	@ApiQuery({
		name: "status",
		required: false,
		enum: ["ACTIVE", "INACTIVE", "ON_LEAVE", "SUSPENDED", "RETIRED", "TERMINATED", "DECEASED"],
	})
	@ApiQuery({ name: "gender", required: false, enum: ["MALE", "FEMALE"] })
	@ApiQuery({ name: "centerId", required: false, description: "Filter by center" })
	@ApiQuery({ name: "departmentId", required: false, description: "Filter by department" })
	@ApiQuery({ name: "positionId", required: false, description: "Filter by position" })
	@ApiQuery({ name: "rankId", required: false, description: "Filter by rank (military only)" })
	@ApiQuery({ name: "page", required: false, description: "Page number (default: 1)" })
	@ApiQuery({ name: "pageSize", required: false, description: "Page size (default: 20, max: 100)" })
	@ApiResponse({ status: 200, description: "List of employees", type: [EmployeeListResponseDto] })
	findAll(
		@CurrentUser() user: AuthUserDto,
		@Query() filter: EmployeeFilterDto,
	): Promise<{ data: EmployeeListResponseDto[]; total: number; page: number; pageSize: number }> {
		return this.employeesService.findAll(user.tenantId, filter);
	}

	@Get("statistics")
	@ApiOperation({ summary: "Get employee statistics", description: "Get employee counts by type, status, and gender" })
	@ApiResponse({ status: 200, description: "Employee statistics" })
	getStatistics(@CurrentUser() user: AuthUserDto): Promise<{
		total: number;
		byType: Record<string, number>;
		byStatus: Record<string, number>;
		byGender: Record<string, number>;
	}> {
		return this.employeesService.getStatistics(user.tenantId);
	}

	@Get("by-employee-id/:employeeId")
	@ApiOperation({ summary: "Get employee by employee ID", description: "Get employee by FPC-XXXX/YY format ID" })
	@ApiResponse({ status: 200, description: "Employee details", type: EmployeeResponseDto })
	@ApiResponse({ status: 404, description: "Employee not found" })
	findByEmployeeId(
		@CurrentUser() user: AuthUserDto,
		@Param("employeeId") employeeId: string,
	): Promise<EmployeeResponseDto> {
		return this.employeesService.findByEmployeeId(user.tenantId, employeeId);
	}

	@Get(":id")
	@ApiOperation({ summary: "Get employee by ID", description: "Get a single employee by UUID" })
	@ApiResponse({ status: 200, description: "Employee details", type: EmployeeResponseDto })
	@ApiResponse({ status: 404, description: "Employee not found" })
	findOne(@CurrentUser() user: AuthUserDto, @Param("id") id: string): Promise<EmployeeResponseDto> {
		return this.employeesService.findOne(user.tenantId, id);
	}

	@Patch(":id")
	@Roles(SYSTEM_ROLES.IT_ADMIN, SYSTEM_ROLES.HQ_ADMIN, SYSTEM_ROLES.HR_DIRECTOR, SYSTEM_ROLES.HR_OFFICER)
	@ApiOperation({ summary: "Update employee", description: "Update employee details" })
	@ApiResponse({ status: 200, description: "Employee updated", type: EmployeeResponseDto })
	@ApiResponse({ status: 404, description: "Employee not found" })
	update(
		@CurrentUser() user: AuthUserDto,
		@Param("id") id: string,
		@Body() dto: UpdateEmployeeDto,
	): Promise<EmployeeResponseDto> {
		return this.employeesService.update(user.tenantId, id, dto, user.id);
	}

	@Delete(":id")
	@Roles(SYSTEM_ROLES.IT_ADMIN, SYSTEM_ROLES.HQ_ADMIN)
	@ApiOperation({ summary: "Delete employee", description: "Soft delete an employee" })
	@ApiResponse({ status: 200, description: "Employee deleted" })
	@ApiResponse({ status: 404, description: "Employee not found" })
	remove(@CurrentUser() user: AuthUserDto, @Param("id") id: string): Promise<{ message: string }> {
		return this.employeesService.remove(user.tenantId, id, user.id);
	}
}
