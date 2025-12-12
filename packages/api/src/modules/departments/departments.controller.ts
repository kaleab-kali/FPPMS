import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";
import { SYSTEM_ROLES } from "#api/common/constants/roles.constant";
import { CurrentUser } from "#api/common/decorators/current-user.decorator";
import { Roles } from "#api/common/decorators/roles.decorator";
import { AuthUserDto } from "#api/common/dto/auth-user.dto";
import { DepartmentsService } from "#api/modules/departments/departments.service";
import { CreateDepartmentDto } from "#api/modules/departments/dto/create-department.dto";
import { DepartmentResponseDto } from "#api/modules/departments/dto/department-response.dto";
import { UpdateDepartmentDto } from "#api/modules/departments/dto/update-department.dto";

@ApiTags("departments")
@ApiBearerAuth("JWT-auth")
@Controller("departments")
export class DepartmentsController {
	constructor(private departmentsService: DepartmentsService) {}

	@Post()
	@Roles(SYSTEM_ROLES.IT_ADMIN, SYSTEM_ROLES.HQ_ADMIN)
	@ApiOperation({ summary: "Create department", description: "Create a new department" })
	@ApiResponse({ status: 201, description: "Department created", type: DepartmentResponseDto })
	create(@CurrentUser() user: AuthUserDto, @Body() dto: CreateDepartmentDto): Promise<DepartmentResponseDto> {
		return this.departmentsService.create(user.tenantId, dto);
	}

	@Get()
	@ApiOperation({ summary: "List all departments", description: "Get all departments for current tenant" })
	@ApiResponse({ status: 200, description: "List of departments", type: [DepartmentResponseDto] })
	findAll(@CurrentUser() user: AuthUserDto): Promise<DepartmentResponseDto[]> {
		return this.departmentsService.findAll(user.tenantId);
	}

	@Get("hierarchy")
	@ApiOperation({ summary: "Get department hierarchy", description: "Get departments in hierarchical structure" })
	@ApiQuery({ name: "parentId", required: false, description: "Parent department ID" })
	@ApiResponse({ status: 200, description: "Department hierarchy", type: [DepartmentResponseDto] })
	findHierarchy(
		@CurrentUser() user: AuthUserDto,
		@Query("parentId") parentId?: string,
	): Promise<DepartmentResponseDto[]> {
		return this.departmentsService.findHierarchy(user.tenantId, parentId);
	}

	@Get(":id")
	@ApiOperation({ summary: "Get department by ID", description: "Get a single department by ID" })
	@ApiResponse({ status: 200, description: "Department details", type: DepartmentResponseDto })
	@ApiResponse({ status: 404, description: "Department not found" })
	findOne(@CurrentUser() user: AuthUserDto, @Param("id") id: string): Promise<DepartmentResponseDto> {
		return this.departmentsService.findOne(user.tenantId, id);
	}

	@Patch(":id")
	@Roles(SYSTEM_ROLES.IT_ADMIN, SYSTEM_ROLES.HQ_ADMIN)
	@ApiOperation({ summary: "Update department", description: "Update department details" })
	@ApiResponse({ status: 200, description: "Department updated", type: DepartmentResponseDto })
	@ApiResponse({ status: 404, description: "Department not found" })
	update(
		@CurrentUser() user: AuthUserDto,
		@Param("id") id: string,
		@Body() dto: UpdateDepartmentDto,
	): Promise<DepartmentResponseDto> {
		return this.departmentsService.update(user.tenantId, id, dto);
	}

	@Delete(":id")
	@Roles(SYSTEM_ROLES.IT_ADMIN, SYSTEM_ROLES.HQ_ADMIN)
	@ApiOperation({ summary: "Delete department", description: "Delete a department" })
	@ApiResponse({ status: 200, description: "Department deleted" })
	@ApiResponse({ status: 404, description: "Department not found" })
	remove(@CurrentUser() user: AuthUserDto, @Param("id") id: string): Promise<{ message: string }> {
		return this.departmentsService.remove(user.tenantId, id);
	}
}
