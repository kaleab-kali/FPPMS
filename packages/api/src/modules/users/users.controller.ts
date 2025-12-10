import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { SYSTEM_ROLES } from "#api/common/constants/roles.constant";
import { CurrentUser } from "#api/common/decorators/current-user.decorator";
import { Roles } from "#api/common/decorators/roles.decorator";
import { AuthUserDto } from "#api/common/dto/auth-user.dto";
import { CreateUserDto } from "#api/modules/users/dto/create-user.dto";
import { UpdateUserDto } from "#api/modules/users/dto/update-user.dto";
import { UserResponseDto } from "#api/modules/users/dto/user-response.dto";
import { UsersService } from "#api/modules/users/users.service";

@Controller("users")
@Roles(SYSTEM_ROLES.IT_ADMIN, SYSTEM_ROLES.HQ_ADMIN, SYSTEM_ROLES.CENTER_ADMIN)
export class UsersController {
	constructor(private usersService: UsersService) {}

	@Post()
	@Roles(SYSTEM_ROLES.IT_ADMIN, SYSTEM_ROLES.HQ_ADMIN)
	create(@CurrentUser() user: AuthUserDto, @Body() dto: CreateUserDto): Promise<UserResponseDto> {
		return this.usersService.create(user.tenantId, dto, user.id);
	}

	@Get()
	findAll(@CurrentUser() user: AuthUserDto, @Query("centerId") centerId?: string): Promise<UserResponseDto[]> {
		if (centerId) {
			return this.usersService.findByCenter(user.tenantId, centerId);
		}
		return this.usersService.findAll(user.tenantId);
	}

	@Get(":id")
	findOne(@CurrentUser() user: AuthUserDto, @Param("id") id: string): Promise<UserResponseDto> {
		return this.usersService.findOne(user.tenantId, id);
	}

	@Patch(":id")
	@Roles(SYSTEM_ROLES.IT_ADMIN, SYSTEM_ROLES.HQ_ADMIN)
	update(
		@CurrentUser() user: AuthUserDto,
		@Param("id") id: string,
		@Body() dto: UpdateUserDto,
	): Promise<UserResponseDto> {
		return this.usersService.update(user.tenantId, id, dto, user.id);
	}

	@Delete(":id")
	@Roles(SYSTEM_ROLES.IT_ADMIN, SYSTEM_ROLES.HQ_ADMIN)
	remove(@CurrentUser() user: AuthUserDto, @Param("id") id: string): Promise<{ message: string }> {
		return this.usersService.remove(user.tenantId, id, user.id);
	}

	@Post(":id/unlock")
	@Roles(SYSTEM_ROLES.IT_ADMIN, SYSTEM_ROLES.HQ_ADMIN)
	unlock(@CurrentUser() user: AuthUserDto, @Param("id") id: string): Promise<{ message: string }> {
		return this.usersService.unlockUser(user.tenantId, id);
	}
}
