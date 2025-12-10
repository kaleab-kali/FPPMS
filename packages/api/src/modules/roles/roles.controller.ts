import { Body, Controller, Delete, Get, Param, Patch, Post } from "@nestjs/common";
import { SYSTEM_ROLES } from "#api/common/constants/roles.constant";
import { CurrentUser } from "#api/common/decorators/current-user.decorator";
import { Roles } from "#api/common/decorators/roles.decorator";
import { AuthUserDto } from "#api/common/dto/auth-user.dto";
import { CreateRoleDto } from "#api/modules/roles/dto/create-role.dto";
import { RoleResponseDto } from "#api/modules/roles/dto/role-response.dto";
import { UpdateRoleDto } from "#api/modules/roles/dto/update-role.dto";
import { RolesService } from "#api/modules/roles/roles.service";

@Controller("roles")
@Roles(SYSTEM_ROLES.IT_ADMIN, SYSTEM_ROLES.HQ_ADMIN)
export class RolesController {
	constructor(private rolesService: RolesService) {}

	@Post()
	create(@CurrentUser() user: AuthUserDto, @Body() dto: CreateRoleDto): Promise<RoleResponseDto> {
		return this.rolesService.create(user.tenantId, dto);
	}

	@Get()
	findAll(@CurrentUser() user: AuthUserDto): Promise<RoleResponseDto[]> {
		return this.rolesService.findAll(user.tenantId);
	}

	@Get(":id")
	findOne(@CurrentUser() user: AuthUserDto, @Param("id") id: string): Promise<RoleResponseDto> {
		return this.rolesService.findOne(user.tenantId, id);
	}

	@Get("code/:code")
	findByCode(@CurrentUser() user: AuthUserDto, @Param("code") code: string): Promise<RoleResponseDto> {
		return this.rolesService.findByCode(user.tenantId, code);
	}

	@Patch(":id")
	update(
		@CurrentUser() user: AuthUserDto,
		@Param("id") id: string,
		@Body() dto: UpdateRoleDto,
	): Promise<RoleResponseDto> {
		return this.rolesService.update(user.tenantId, id, dto);
	}

	@Delete(":id")
	remove(@CurrentUser() user: AuthUserDto, @Param("id") id: string): Promise<{ message: string }> {
		return this.rolesService.remove(user.tenantId, id);
	}
}
