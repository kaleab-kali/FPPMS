import { Body, Controller, Get, Ip, Param, Post, Request, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Throttle } from "@nestjs/throttler";
import { CurrentUser } from "#api/common/decorators/current-user.decorator";
import { Permissions } from "#api/common/decorators/permissions.decorator";
import { Public } from "#api/common/decorators/public.decorator";
import { AuthUserDto } from "#api/common/dto/auth-user.dto";
import { AuthService } from "#api/modules/auth/auth.service";
import { ChangePasswordDto } from "#api/modules/auth/dto/change-password.dto";
import { LoginDto } from "#api/modules/auth/dto/login.dto";
import { LoginResponseDto, LoginUserDto, RefreshTokenResponseDto } from "#api/modules/auth/dto/login-response.dto";
import { RefreshTokenDto } from "#api/modules/auth/dto/refresh-token.dto";
import { ResetPasswordDto } from "#api/modules/auth/dto/reset-password.dto";
import { LocalAuthGuard } from "#api/modules/auth/guards/local-auth.guard";

@ApiTags("auth")
@Controller("auth")
export class AuthController {
	constructor(private authService: AuthService) {}

	@Public()
	@UseGuards(LocalAuthGuard)
	@Throttle({ short: { limit: 5, ttl: 60000 } })
	@Post("login")
	@ApiOperation({ summary: "User login", description: "Authenticate user with username and password" })
	@ApiResponse({ status: 200, description: "Login successful", type: LoginResponseDto })
	@ApiResponse({ status: 401, description: "Invalid credentials" })
	login(
		@Request() req: { user: LoginUserDto; headers: { "user-agent"?: string } },
		@Body() _loginDto: LoginDto,
		@Ip() ip: string,
	): Promise<LoginResponseDto> {
		const deviceInfo = req.headers["user-agent"];
		return this.authService.login(req.user, ip, deviceInfo);
	}

	@Public()
	@Post("refresh")
	@ApiOperation({
		summary: "Refresh tokens",
		description: "Get new access and refresh tokens using a valid refresh token",
	})
	@ApiResponse({ status: 200, description: "Tokens refreshed successfully", type: RefreshTokenResponseDto })
	@ApiResponse({ status: 401, description: "Invalid or expired refresh token" })
	refreshTokens(
		@Body() dto: RefreshTokenDto,
		@Ip() ip: string,
		@Request() req: { headers: { "user-agent"?: string } },
	): Promise<RefreshTokenResponseDto> {
		const deviceInfo = req.headers["user-agent"];
		return this.authService.refreshTokens(dto.refreshToken, ip, deviceInfo);
	}

	@Public()
	@Post("logout")
	@ApiOperation({ summary: "Logout", description: "Revoke the refresh token and logout" })
	@ApiResponse({ status: 200, description: "Logged out successfully" })
	logout(@Body() dto: RefreshTokenDto): Promise<{ message: string }> {
		return this.authService.logout(dto.refreshToken);
	}

	@Post("logout-all")
	@ApiBearerAuth("JWT-auth")
	@ApiOperation({ summary: "Logout from all devices", description: "Revoke all refresh tokens for the current user" })
	@ApiResponse({ status: 200, description: "Logged out from all devices" })
	logoutAll(@CurrentUser() user: AuthUserDto): Promise<{ message: string }> {
		return this.authService.logoutAll(user.id);
	}

	@Get("me")
	@ApiBearerAuth("JWT-auth")
	@ApiOperation({ summary: "Get current user profile", description: "Returns the authenticated user profile" })
	@ApiResponse({ status: 200, description: "User profile", type: LoginUserDto })
	@ApiResponse({ status: 401, description: "Unauthorized" })
	getProfile(@CurrentUser() user: AuthUserDto): Promise<LoginUserDto> {
		return this.authService.getProfile(user.id);
	}

	@Throttle({ short: { limit: 3, ttl: 60000 } })
	@Post("change-password")
	@ApiBearerAuth("JWT-auth")
	@ApiOperation({ summary: "Change password", description: "Change the current user password" })
	@ApiResponse({ status: 200, description: "Password changed successfully" })
	@ApiResponse({ status: 400, description: "Invalid current password" })
	changePassword(@CurrentUser() user: AuthUserDto, @Body() dto: ChangePasswordDto): Promise<{ message: string }> {
		return this.authService.changePassword(user.id, dto);
	}

	@Throttle({ short: { limit: 3, ttl: 60000 } })
	@Post("reset-password/:userId")
	@Permissions("auth.manage.password")
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
