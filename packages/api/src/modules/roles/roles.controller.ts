import { Body, Controller, Delete, Get, Param, Patch, Post } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "#api/common/decorators/current-user.decorator";
import { Permissions } from "#api/common/decorators/permissions.decorator";
import { AuthUserDto } from "#api/common/dto/auth-user.dto";
import { CreateRoleDto } from "#api/modules/roles/dto/create-role.dto";
import { RoleResponseDto } from "#api/modules/roles/dto/role-response.dto";
import { UpdateRoleDto } from "#api/modules/roles/dto/update-role.dto";
import { RolesService } from "#api/modules/roles/roles.service";

@ApiTags("roles")
@ApiBearerAuth("JWT-auth")
@Controller("roles")
export class RolesController {
	constructor(private rolesService: RolesService) {}

	@Post()
	@Permissions("roles.create.role")
	@ApiOperation({ summary: "Create role", description: "Create a new role" })
	@ApiResponse({ status: 201, description: "Role created", type: RoleResponseDto })
	create(@CurrentUser() user: AuthUserDto, @Body() dto: CreateRoleDto): Promise<RoleResponseDto> {
		return this.rolesService.create(user.tenantId, dto);
	}

	@Get()
	@Permissions("roles.read.role")
	@ApiOperation({ summary: "List all roles", description: "Get all roles including system roles" })
	@ApiResponse({ status: 200, description: "List of roles", type: [RoleResponseDto] })
	findAll(@CurrentUser() user: AuthUserDto): Promise<RoleResponseDto[]> {
		return this.rolesService.findAll(user.tenantId);
	}

	@Get(":id")
	@Permissions("roles.read.role")
	@ApiOperation({ summary: "Get role by ID", description: "Get a single role by ID" })
	@ApiResponse({ status: 200, description: "Role details", type: RoleResponseDto })
	@ApiResponse({ status: 404, description: "Role not found" })
	findOne(@CurrentUser() user: AuthUserDto, @Param("id") id: string): Promise<RoleResponseDto> {
		return this.rolesService.findOne(user.tenantId, id);
	}

	@Get("code/:code")
	@Permissions("roles.read.role")
	@ApiOperation({ summary: "Get role by code", description: "Get a single role by code" })
	@ApiResponse({ status: 200, description: "Role details", type: RoleResponseDto })
	@ApiResponse({ status: 404, description: "Role not found" })
	findByCode(@CurrentUser() user: AuthUserDto, @Param("code") code: string): Promise<RoleResponseDto> {
		return this.rolesService.findByCode(user.tenantId, code);
	}

	@Patch(":id")
	@Permissions("roles.update.role")
	@ApiOperation({ summary: "Update role", description: "Update role details and permissions" })
	@ApiResponse({ status: 200, description: "Role updated", type: RoleResponseDto })
	@ApiResponse({ status: 404, description: "Role not found" })
	update(
		@CurrentUser() user: AuthUserDto,
		@Param("id") id: string,
		@Body() dto: UpdateRoleDto,
	): Promise<RoleResponseDto> {
		return this.rolesService.update(user.tenantId, id, dto);
	}

	@Delete(":id")
	@Permissions("roles.delete.role")
	@ApiOperation({ summary: "Delete role", description: "Delete a custom role (system roles cannot be deleted)" })
	@ApiResponse({ status: 200, description: "Role deleted" })
	@ApiResponse({ status: 400, description: "Cannot delete system role or role in use" })
	@ApiResponse({ status: 404, description: "Role not found" })
	remove(@CurrentUser() user: AuthUserDto, @Param("id") id: string): Promise<{ message: string }> {
		return this.rolesService.remove(user.tenantId, id);
	}
}
