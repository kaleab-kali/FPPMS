import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "#api/common/decorators/current-user.decorator";
import { Permissions } from "#api/common/decorators/permissions.decorator";
import { AuthUserDto } from "#api/common/dto/auth-user.dto";
import {
	AssignSuperiorDto,
	BulkAssignSuperiorDto,
	RemoveSuperiorDto,
} from "#api/modules/employees/dto/employee-superior.dto";
import { EmployeeSuperiorService } from "#api/modules/employees/services/employee-superior.service";

@ApiTags("employee-superior")
@ApiBearerAuth("JWT-auth")
@Controller("employee-superior")
export class EmployeeSuperiorController {
	constructor(private readonly superiorService: EmployeeSuperiorService) {}

	@Get("assignments")
	@Permissions("employees.read.superior")
	@ApiOperation({ summary: "Get all employees with their direct superior assignments" })
	@ApiQuery({ name: "centerId", required: false, description: "Filter by center ID" })
	@ApiResponse({ status: 200, description: "List of employees with superior assignments" })
	async getAssignmentList(@CurrentUser() user: AuthUserDto, @Query("centerId") centerId?: string) {
		return this.superiorService.getAssignmentList(user.tenantId, centerId);
	}

	@Get("org-chart")
	@Permissions("employees.read.superior")
	@ApiOperation({ summary: "Get organizational chart (hierarchical structure)" })
	@ApiQuery({ name: "centerId", required: false, description: "Filter by center ID" })
	@ApiQuery({ name: "rootEmployeeId", required: false, description: "Start from specific employee" })
	@ApiResponse({ status: 200, description: "Hierarchical org chart data" })
	async getOrgChart(
		@CurrentUser() user: AuthUserDto,
		@Query("centerId") centerId?: string,
		@Query("rootEmployeeId") rootEmployeeId?: string,
	) {
		return this.superiorService.getOrgChart(user.tenantId, centerId, rootEmployeeId);
	}

	@Post("bulk-assign")
	@Permissions("employees.manage.superior")
	@ApiOperation({ summary: "Assign same superior to multiple employees" })
	@ApiResponse({ status: 201, description: "Bulk assignment completed" })
	@ApiResponse({ status: 400, description: "Validation error or circular reference detected" })
	async bulkAssignSuperior(@CurrentUser() user: AuthUserDto, @Body() dto: BulkAssignSuperiorDto) {
		return this.superiorService.bulkAssignSuperior(user.tenantId, dto, user.id);
	}

	@Get(":employeeId")
	@Permissions("employees.read.superior")
	@ApiOperation({ summary: "Get direct superior of an employee" })
	@ApiParam({ name: "employeeId", description: "Employee ID" })
	@ApiResponse({ status: 200, description: "Direct superior info" })
	@ApiResponse({ status: 404, description: "Employee not found" })
	async getDirectSuperior(@CurrentUser() user: AuthUserDto, @Param("employeeId") employeeId: string) {
		return this.superiorService.getDirectSuperior(user.tenantId, employeeId);
	}

	@Patch(":employeeId")
	@Permissions("employees.manage.superior")
	@ApiOperation({ summary: "Assign or update direct superior for an employee" })
	@ApiParam({ name: "employeeId", description: "Employee ID" })
	@ApiResponse({ status: 200, description: "Superior assigned successfully" })
	@ApiResponse({ status: 400, description: "Circular reference or self-assignment error" })
	@ApiResponse({ status: 404, description: "Employee or superior not found" })
	async assignSuperior(
		@CurrentUser() user: AuthUserDto,
		@Param("employeeId") employeeId: string,
		@Body() dto: AssignSuperiorDto,
	) {
		return this.superiorService.assignSuperior(user.tenantId, employeeId, dto, user.id);
	}

	@Delete(":employeeId")
	@Permissions("employees.manage.superior")
	@ApiOperation({ summary: "Remove direct superior from an employee" })
	@ApiParam({ name: "employeeId", description: "Employee ID" })
	@ApiResponse({ status: 200, description: "Superior removed successfully" })
	@ApiResponse({ status: 400, description: "Employee has no superior assigned" })
	@ApiResponse({ status: 404, description: "Employee not found" })
	async removeSuperior(
		@CurrentUser() user: AuthUserDto,
		@Param("employeeId") employeeId: string,
		@Body() dto: RemoveSuperiorDto,
	) {
		return this.superiorService.removeSuperior(user.tenantId, employeeId, dto, user.id);
	}

	@Get(":employeeId/subordinates")
	@Permissions("employees.read.superior")
	@ApiOperation({ summary: "Get all direct subordinates of an employee" })
	@ApiParam({ name: "employeeId", description: "Employee ID (supervisor)" })
	@ApiResponse({ status: 200, description: "List of direct subordinates" })
	@ApiResponse({ status: 404, description: "Employee not found" })
	async getSubordinates(@CurrentUser() user: AuthUserDto, @Param("employeeId") employeeId: string) {
		return this.superiorService.getSubordinates(user.tenantId, employeeId);
	}

	@Get(":employeeId/chain")
	@Permissions("employees.read.superior")
	@ApiOperation({ summary: "Get chain of command (all superiors up to top)" })
	@ApiParam({ name: "employeeId", description: "Employee ID" })
	@ApiResponse({ status: 200, description: "List of superiors in chain" })
	async getSuperiorChain(@CurrentUser() user: AuthUserDto, @Param("employeeId") employeeId: string) {
		return this.superiorService.getSuperiorChain(user.tenantId, employeeId);
	}

	@Get(":employeeId/history")
	@Permissions("employees.read.superior")
	@ApiOperation({ summary: "Get superior assignment history for an employee" })
	@ApiParam({ name: "employeeId", description: "Employee ID" })
	@ApiResponse({ status: 200, description: "List of historical superior assignments" })
	@ApiResponse({ status: 404, description: "Employee not found" })
	async getAssignmentHistory(@CurrentUser() user: AuthUserDto, @Param("employeeId") employeeId: string) {
		return this.superiorService.getAssignmentHistory(user.tenantId, employeeId);
	}
}
