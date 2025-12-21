import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";
import { SYSTEM_ROLES } from "#api/common/constants/roles.constant";
import { CurrentUser } from "#api/common/decorators/current-user.decorator";
import { Roles } from "#api/common/decorators/roles.decorator";
import { AuthUserDto } from "#api/common/dto/auth-user.dto";
import { CreateUserDto, CreateUserFromEmployeeDto } from "#api/modules/users/dto/create-user.dto";
import { UpdateUserDto } from "#api/modules/users/dto/update-user.dto";
import { UserResponseDto } from "#api/modules/users/dto/user-response.dto";
import { UsersService } from "#api/modules/users/users.service";

@ApiTags("users")
@ApiBearerAuth("JWT-auth")
@Controller("users")
@Roles(SYSTEM_ROLES.IT_ADMIN, SYSTEM_ROLES.HQ_ADMIN, SYSTEM_ROLES.CENTER_ADMIN)
export class UsersController {
	constructor(private usersService: UsersService) {}

	@Post()
	@Roles(SYSTEM_ROLES.IT_ADMIN, SYSTEM_ROLES.HQ_ADMIN)
	@ApiOperation({ summary: "Create user", description: "Create a new user account with custom username/password" })
	@ApiResponse({ status: 201, description: "User created", type: UserResponseDto })
	create(@CurrentUser() user: AuthUserDto, @Body() dto: CreateUserDto): Promise<UserResponseDto> {
		return this.usersService.create(user.tenantId, dto, user.id);
	}

	@Post("from-employee")
	@Roles(SYSTEM_ROLES.IT_ADMIN, SYSTEM_ROLES.HQ_ADMIN)
	@ApiOperation({
		summary: "Create user from employee",
		description: "Create a new user account from an employee with auto-generated username and default password",
	})
	@ApiResponse({ status: 201, description: "User created with generated credentials" })
	createFromEmployee(
		@CurrentUser() user: AuthUserDto,
		@Body() dto: CreateUserFromEmployeeDto,
	): Promise<{ user: UserResponseDto; generatedUsername: string; generatedPassword: string }> {
		return this.usersService.createFromEmployee(user.tenantId, dto, user.id);
	}

	@Get("available-employees")
	@ApiOperation({
		summary: "Get employees without user accounts",
		description: "Get list of active employees who do not have a user account yet",
	})
	@ApiQuery({ name: "search", required: false, description: "Search by employee ID, name" })
	@ApiResponse({ status: 200, description: "List of available employees" })
	findAvailableEmployees(
		@CurrentUser() user: AuthUserDto,
		@Query("search") search?: string,
	): Promise<
		Array<{
			id: string;
			employeeId: string;
			fullName: string;
			fullNameAm: string;
			departmentName?: string;
			positionName?: string;
		}>
	> {
		return this.usersService.findEmployeesWithoutUserAccount(user.tenantId, search);
	}

	@Get()
	@ApiOperation({ summary: "List all users", description: "Get all users, optionally filtered by center" })
	@ApiQuery({ name: "centerId", required: false, description: "Filter by center ID" })
	@ApiResponse({ status: 200, description: "List of users", type: [UserResponseDto] })
	findAll(@CurrentUser() user: AuthUserDto, @Query("centerId") centerId?: string): Promise<UserResponseDto[]> {
		if (centerId) {
			return this.usersService.findByCenter(user.tenantId, centerId);
		}
		return this.usersService.findAll(user.tenantId);
	}

	@Get(":id")
	@ApiOperation({ summary: "Get user by ID", description: "Get a single user by ID" })
	@ApiResponse({ status: 200, description: "User details", type: UserResponseDto })
	@ApiResponse({ status: 404, description: "User not found" })
	findOne(@CurrentUser() user: AuthUserDto, @Param("id") id: string): Promise<UserResponseDto> {
		return this.usersService.findOne(user.tenantId, id);
	}

	@Patch(":id")
	@Roles(SYSTEM_ROLES.IT_ADMIN, SYSTEM_ROLES.HQ_ADMIN)
	@ApiOperation({ summary: "Update user", description: "Update user details" })
	@ApiResponse({ status: 200, description: "User updated", type: UserResponseDto })
	@ApiResponse({ status: 404, description: "User not found" })
	update(
		@CurrentUser() user: AuthUserDto,
		@Param("id") id: string,
		@Body() dto: UpdateUserDto,
	): Promise<UserResponseDto> {
		return this.usersService.update(user.tenantId, id, dto, user.id);
	}

	@Delete(":id")
	@Roles(SYSTEM_ROLES.IT_ADMIN, SYSTEM_ROLES.HQ_ADMIN)
	@ApiOperation({ summary: "Delete user", description: "Delete a user account" })
	@ApiResponse({ status: 200, description: "User deleted" })
	@ApiResponse({ status: 404, description: "User not found" })
	remove(@CurrentUser() user: AuthUserDto, @Param("id") id: string): Promise<{ message: string }> {
		return this.usersService.remove(user.tenantId, id, user.id);
	}

	@Post(":id/unlock")
	@Roles(SYSTEM_ROLES.IT_ADMIN, SYSTEM_ROLES.HQ_ADMIN)
	@ApiOperation({ summary: "Unlock user", description: "Unlock a locked user account" })
	@ApiResponse({ status: 200, description: "User unlocked" })
	@ApiResponse({ status: 404, description: "User not found" })
	unlock(@CurrentUser() user: AuthUserDto, @Param("id") id: string): Promise<{ message: string }> {
		return this.usersService.unlockUser(user.tenantId, id);
	}

	@Post(":id/reset-password")
	@Roles(SYSTEM_ROLES.IT_ADMIN, SYSTEM_ROLES.HQ_ADMIN)
	@ApiOperation({
		summary: "Reset password to default",
		description: "Reset user password to default (Police@YYYY). User must change on next login.",
	})
	@ApiResponse({ status: 200, description: "Password reset to default" })
	@ApiResponse({ status: 404, description: "User not found" })
	resetPassword(
		@CurrentUser() user: AuthUserDto,
		@Param("id") id: string,
	): Promise<{ message: string; newPassword: string }> {
		return this.usersService.resetToDefaultPassword(user.tenantId, id, user.id);
	}
}
