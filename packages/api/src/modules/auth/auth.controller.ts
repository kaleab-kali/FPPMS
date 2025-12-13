import { Body, Controller, Get, Param, Post, Request, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { SYSTEM_ROLES } from "#api/common/constants/roles.constant";
import { CurrentUser } from "#api/common/decorators/current-user.decorator";
import { Public } from "#api/common/decorators/public.decorator";
import { Roles } from "#api/common/decorators/roles.decorator";
import { AuthUserDto } from "#api/common/dto/auth-user.dto";
import { AuthService } from "#api/modules/auth/auth.service";
import { ChangePasswordDto } from "#api/modules/auth/dto/change-password.dto";
import { LoginDto } from "#api/modules/auth/dto/login.dto";
import { LoginResponseDto, LoginUserDto } from "#api/modules/auth/dto/login-response.dto";
import { ResetPasswordDto } from "#api/modules/auth/dto/reset-password.dto";
import { LocalAuthGuard } from "#api/modules/auth/guards/local-auth.guard";

@ApiTags("auth")
@Controller("auth")
export class AuthController {
	constructor(private authService: AuthService) {}

	@Public()
	@UseGuards(LocalAuthGuard)
	@Post("login")
	@ApiOperation({ summary: "User login", description: "Authenticate user with username and password" })
	@ApiResponse({ status: 200, description: "Login successful", type: LoginResponseDto })
	@ApiResponse({ status: 401, description: "Invalid credentials" })
	login(@Request() req: { user: LoginUserDto }, @Body() _loginDto: LoginDto): Promise<LoginResponseDto> {
		return this.authService.login(req.user);
	}

	@Get("me")
	@ApiBearerAuth("JWT-auth")
	@ApiOperation({ summary: "Get current user profile", description: "Returns the authenticated user profile" })
	@ApiResponse({ status: 200, description: "User profile", type: LoginUserDto })
	@ApiResponse({ status: 401, description: "Unauthorized" })
	getProfile(@CurrentUser() user: AuthUserDto): Promise<LoginUserDto> {
		return this.authService.getProfile(user.id);
	}

	@Post("change-password")
	@ApiBearerAuth("JWT-auth")
	@ApiOperation({ summary: "Change password", description: "Change the current user password" })
	@ApiResponse({ status: 200, description: "Password changed successfully" })
	@ApiResponse({ status: 400, description: "Invalid current password" })
	changePassword(@CurrentUser() user: AuthUserDto, @Body() dto: ChangePasswordDto): Promise<{ message: string }> {
		return this.authService.changePassword(user.id, dto);
	}

	@Roles(SYSTEM_ROLES.IT_ADMIN)
	@Post("reset-password/:userId")
	@ApiBearerAuth("JWT-auth")
	@ApiOperation({ summary: "Reset user password (IT Admin)", description: "Reset password for a user - IT Admin only" })
	@ApiResponse({ status: 200, description: "Password reset successfully" })
	@ApiResponse({ status: 403, description: "Forbidden - IT Admin role required" })
	resetPassword(
		@Param("userId") userId: string,
		@Body() dto: ResetPasswordDto,
		@CurrentUser() currentUser: AuthUserDto,
	): Promise<{ message: string }> {
		return this.authService.resetPassword(userId, dto, currentUser.id);
	}
}
