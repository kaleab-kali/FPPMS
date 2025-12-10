import { Body, Controller, Get, Param, Post, Request, UseGuards } from "@nestjs/common";
import { SYSTEM_ROLES } from "#api/common/constants/roles.constant";
import { CurrentUser } from "#api/common/decorators/current-user.decorator";
import { Public } from "#api/common/decorators/public.decorator";
import { Roles } from "#api/common/decorators/roles.decorator";
import { AuthService } from "#api/modules/auth/auth.service";
import { ChangePasswordDto } from "#api/modules/auth/dto/change-password.dto";
import { LoginDto } from "#api/modules/auth/dto/login.dto";
import { LoginResponseDto, LoginUserDto } from "#api/modules/auth/dto/login-response.dto";
import { ResetPasswordDto } from "#api/modules/auth/dto/reset-password.dto";
import { LocalAuthGuard } from "#api/modules/auth/guards/local-auth.guard";

interface AuthUser {
	id: string;
	username: string;
	tenantId: string;
	centerId?: string;
	roles: string[];
	permissions: string[];
}

@Controller("auth")
export class AuthController {
	constructor(private authService: AuthService) {}

	@Public()
	@UseGuards(LocalAuthGuard)
	@Post("login")
	login(@Request() req: { user: LoginUserDto }, @Body() _loginDto: LoginDto): Promise<LoginResponseDto> {
		return this.authService.login(req.user);
	}

	@Get("me")
	getProfile(@CurrentUser() user: AuthUser): Promise<LoginUserDto> {
		return this.authService.getProfile(user.id);
	}

	@Post("change-password")
	changePassword(@CurrentUser() user: AuthUser, @Body() dto: ChangePasswordDto): Promise<{ message: string }> {
		return this.authService.changePassword(user.id, dto);
	}

	@Roles(SYSTEM_ROLES.IT_ADMIN)
	@Post("reset-password/:userId")
	resetPassword(
		@Param("userId") userId: string,
		@Body() dto: ResetPasswordDto,
		@CurrentUser() currentUser: AuthUser,
	): Promise<{ message: string }> {
		return this.authService.resetPassword(userId, dto, currentUser.id);
	}
}
