import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "#api/common/decorators/current-user.decorator";
import { Permissions } from "#api/common/decorators/permissions.decorator";
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
	@Permissions("departments.create.department")
	@ApiOperation({ summary: "Create department", description: "Create a new department" })
	@ApiResponse({ status: 201, description: "Department created", type: DepartmentResponseDto })
	create(@CurrentUser() user: AuthUserDto, @Body() dto: CreateDepartmentDto): Promise<DepartmentResponseDto> {
		return this.departmentsService.create(user.tenantId, dto);
	}

	@Get()
	@Permissions("departments.read.department")
	@ApiOperation({ summary: "List all departments", description: "Get all departments for current tenant" })
	@ApiResponse({ status: 200, description: "List of departments", type: [DepartmentResponseDto] })
	findAll(@CurrentUser() user: AuthUserDto): Promise<DepartmentResponseDto[]> {
		return this.departmentsService.findAll(user.tenantId);
	}

	@Get("hierarchy")
	@Permissions("departments.read.department")
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
	@Permissions("departments.read.department")
	@ApiOperation({ summary: "Get department by ID", description: "Get a single department by ID" })
	@ApiResponse({ status: 200, description: "Department details", type: DepartmentResponseDto })
	@ApiResponse({ status: 404, description: "Department not found" })
	findOne(@CurrentUser() user: AuthUserDto, @Param("id") id: string): Promise<DepartmentResponseDto> {
		return this.departmentsService.findOne(user.tenantId, id);
	}

	@Patch(":id")
	@Permissions("departments.update.department")
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
	@Permissions("departments.delete.department")
	@ApiOperation({ summary: "Delete department", description: "Delete a department" })
	@ApiResponse({ status: 200, description: "Department deleted" })
	@ApiResponse({ status: 404, description: "Department not found" })
	remove(@CurrentUser() user: AuthUserDto, @Param("id") id: string): Promise<{ message: string }> {
		return this.departmentsService.remove(user.tenantId, id);
	}
}
