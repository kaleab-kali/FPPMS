import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { SYSTEM_ROLES } from "#api/common/constants/roles.constant";
import { CurrentUser } from "#api/common/decorators/current-user.decorator";
import { Roles } from "#api/common/decorators/roles.decorator";
import { AuthUserDto } from "#api/common/dto/auth-user.dto";
import { DepartmentsService } from "#api/modules/departments/departments.service";
import { CreateDepartmentDto } from "#api/modules/departments/dto/create-department.dto";
import { DepartmentResponseDto } from "#api/modules/departments/dto/department-response.dto";
import { UpdateDepartmentDto } from "#api/modules/departments/dto/update-department.dto";

@Controller("departments")
export class DepartmentsController {
	constructor(private departmentsService: DepartmentsService) {}

	@Post()
	@Roles(SYSTEM_ROLES.IT_ADMIN, SYSTEM_ROLES.HQ_ADMIN)
	create(@CurrentUser() user: AuthUserDto, @Body() dto: CreateDepartmentDto): Promise<DepartmentResponseDto> {
		return this.departmentsService.create(user.tenantId, dto);
	}

	@Get()
	findAll(@CurrentUser() user: AuthUserDto): Promise<DepartmentResponseDto[]> {
		return this.departmentsService.findAll(user.tenantId);
	}

	@Get("hierarchy")
	findHierarchy(
		@CurrentUser() user: AuthUserDto,
		@Query("parentId") parentId?: string,
	): Promise<DepartmentResponseDto[]> {
		return this.departmentsService.findHierarchy(user.tenantId, parentId);
	}

	@Get(":id")
	findOne(@CurrentUser() user: AuthUserDto, @Param("id") id: string): Promise<DepartmentResponseDto> {
		return this.departmentsService.findOne(user.tenantId, id);
	}

	@Patch(":id")
	@Roles(SYSTEM_ROLES.IT_ADMIN, SYSTEM_ROLES.HQ_ADMIN)
	update(
		@CurrentUser() user: AuthUserDto,
		@Param("id") id: string,
		@Body() dto: UpdateDepartmentDto,
	): Promise<DepartmentResponseDto> {
		return this.departmentsService.update(user.tenantId, id, dto);
	}

	@Delete(":id")
	@Roles(SYSTEM_ROLES.IT_ADMIN, SYSTEM_ROLES.HQ_ADMIN)
	remove(@CurrentUser() user: AuthUserDto, @Param("id") id: string): Promise<{ message: string }> {
		return this.departmentsService.remove(user.tenantId, id);
	}
}
