import { createHash, randomBytes } from "node:crypto";
import { BadRequestException, ForbiddenException, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { v4 as uuidv4 } from "uuid";
import { ACCESS_SCOPES } from "#api/common/constants/roles.constant";
import { comparePassword, hashPassword } from "#api/common/utils/hash.util";
import { PrismaService } from "#api/database/prisma.service";
import { ChangePasswordDto } from "#api/modules/auth/dto/change-password.dto";
import { LoginResponseDto, LoginUserDto, RefreshTokenResponseDto } from "#api/modules/auth/dto/login-response.dto";
import { ResetPasswordDto } from "#api/modules/auth/dto/reset-password.dto";

interface JwtPayloadData {
	sub: string;
	username: string;
	tenantId: string;
	centerId?: string;
	employeeId?: string;
	roles: string[];
	permissions: string[];
	accessScopes: string[];
	effectiveAccessScope: string;
	permissionVersion: number;
}

const ACCESS_SCOPE_PRIORITY = {
	[ACCESS_SCOPES.ALL_CENTERS]: 2,
	[ACCESS_SCOPES.OWN_CENTER]: 1,
} as const;

const computeEffectiveAccessScope = (scopes: string[]): string => {
	if (scopes.length === 0) {
		return ACCESS_SCOPES.OWN_CENTER;
	}
	let highestScope: string = ACCESS_SCOPES.OWN_CENTER;
	let highestPriority = 0;
	for (const scope of scopes) {
		const priority = ACCESS_SCOPE_PRIORITY[scope as keyof typeof ACCESS_SCOPE_PRIORITY] ?? 0;
		if (priority > highestPriority) {
			highestPriority = priority;
			highestScope = scope;
		}
	}
	return highestScope;
};

const AUTH_CONFIG = {
	MAX_FAILED_LOGIN_ATTEMPTS: 5,
	LOCK_DURATION_MINUTES: 30,
	MILLISECONDS_PER_MINUTE: 60 * 1000,
	ACCESS_TOKEN_EXPIRY_MINUTES: 15,
	REFRESH_TOKEN_EXPIRY_DAYS: 7,
} as const;

@Injectable()
export class AuthService {
	constructor(
		private prisma: PrismaService,
		private jwtService: JwtService,
	) {}

	async validateUser(username: string, password: string): Promise<LoginUserDto | undefined> {
		const user = await this.prisma.user.findFirst({
			where: { username, deletedAt: null },
			include: {
				tenant: true,
				center: true,
				userRoles: {
					include: {
						role: {
							include: {
								rolePermissions: {
									include: {
										permission: true,
									},
								},
							},
						},
					},
				},
			},
		});

		if (!user) {
			return undefined;
		}

		if (user.status === "LOCKED") {
			throw new ForbiddenException("Account is locked. Please contact IT Administrator.");
		}

		if (user.status === "INACTIVE") {
			throw new ForbiddenException("Account is inactive. Please contact IT Administrator.");
		}

		if (user.status === "TRANSFERRED") {
			throw new ForbiddenException("Your account has been transferred. Please contact IT Administrator for access.");
		}

		if (user.status === "TERMINATED") {
			throw new ForbiddenException("Your account has been terminated. Access is no longer available.");
		}

		const isPasswordValid = await comparePassword(password, user.passwordHash);

		if (!isPasswordValid) {
			await this.incrementFailedAttempts(user.id);
			return undefined;
		}

		await this.resetFailedAttempts(user.id);
		await this.recordLoginHistory(user.id, true);

		const roles = user.userRoles.map((ur) => ur.role.code);
		const permissions = [
			...new Set(
				user.userRoles.flatMap((ur) =>
					ur.role.rolePermissions.map(
						(rp) => `${rp.permission.module}.${rp.permission.action}.${rp.permission.resource}`,
					),
				),
			),
		];
		const accessScopes = [...new Set(user.userRoles.map((ur) => ur.role.accessScope))];
		const effectiveAccessScope = computeEffectiveAccessScope(accessScopes);

		return {
			id: user.id,
			username: user.username,
			tenantId: user.tenantId,
			centerId: user.centerId || undefined,
			employeeId: user.employeeId || undefined,
			roles,
			permissions,
			accessScopes,
			effectiveAccessScope,
			requirePasswordChange: user.mustChangePassword,
			permissionVersion: user.permissionVersion,
		};
	}

	async login(user: LoginUserDto, ipAddress?: string, deviceInfo?: string): Promise<LoginResponseDto> {
		const payload: JwtPayloadData = {
			sub: user.id,
			username: user.username,
			tenantId: user.tenantId,
			centerId: user.centerId,
			employeeId: user.employeeId,
			roles: user.roles,
			permissions: user.permissions,
			accessScopes: user.accessScopes,
			effectiveAccessScope: user.effectiveAccessScope,
			permissionVersion: user.permissionVersion,
		};

		const accessToken = this.jwtService.sign(payload, {
			expiresIn: `${AUTH_CONFIG.ACCESS_TOKEN_EXPIRY_MINUTES}m`,
		});

		const refreshToken = await this.generateRefreshToken(user.id, ipAddress, deviceInfo);

		return {
			accessToken,
			refreshToken,
			user,
		};
	}

	async refreshTokens(refreshToken: string, ipAddress?: string, deviceInfo?: string): Promise<RefreshTokenResponseDto> {
		const tokenHash = this.hashToken(refreshToken);

		const storedToken = await this.prisma.refreshToken.findUnique({
			where: { tokenHash },
			include: {
				user: {
					include: {
						userRoles: {
							include: {
								role: {
									include: {
										rolePermissions: {
											include: {
												permission: true,
											},
										},
									},
								},
							},
						},
					},
				},
			},
		});

		if (!storedToken) {
			throw new UnauthorizedException("Invalid refresh token");
		}

		if (storedToken.revokedAt) {
			await this.revokeAllUserTokens(storedToken.userId);
			throw new UnauthorizedException("Token has been revoked. Please login again.");
		}

		if (storedToken.expiresAt < new Date()) {
			throw new UnauthorizedException("Refresh token expired. Please login again.");
		}

		const user = storedToken.user;

		if (!user || user.deletedAt || user.status === "LOCKED" || user.status === "INACTIVE") {
			throw new UnauthorizedException("User account is not active");
		}

		await this.prisma.refreshToken.update({
			where: { id: storedToken.id },
			data: { revokedAt: new Date() },
		});

		const roles = user.userRoles.map((ur) => ur.role.code);
		const permissions = [
			...new Set(
				user.userRoles.flatMap((ur) =>
					ur.role.rolePermissions.map(
						(rp) => `${rp.permission.module}.${rp.permission.action}.${rp.permission.resource}`,
					),
				),
			),
		];
		const accessScopes = [...new Set(user.userRoles.map((ur) => ur.role.accessScope))];
		const effectiveAccessScope = computeEffectiveAccessScope(accessScopes);

		const payload: JwtPayloadData = {
			sub: user.id,
			username: user.username,
			tenantId: user.tenantId,
			centerId: user.centerId || undefined,
			employeeId: user.employeeId || undefined,
			roles,
			permissions,
			accessScopes,
			effectiveAccessScope,
			permissionVersion: user.permissionVersion,
		};

		const newAccessToken = this.jwtService.sign(payload, {
			expiresIn: `${AUTH_CONFIG.ACCESS_TOKEN_EXPIRY_MINUTES}m`,
		});

		const newRefreshToken = await this.generateRefreshToken(user.id, ipAddress, deviceInfo, storedToken.id);

		return {
			accessToken: newAccessToken,
			refreshToken: newRefreshToken,
		};
	}

	async logout(refreshToken: string): Promise<{ message: string }> {
		const tokenHash = this.hashToken(refreshToken);

		await this.prisma.refreshToken.updateMany({
			where: { tokenHash, revokedAt: null },
			data: { revokedAt: new Date() },
		});

		return { message: "Logged out successfully" };
	}

	async logoutAll(userId: string): Promise<{ message: string }> {
		await this.revokeAllUserTokens(userId);
		return { message: "Logged out from all devices successfully" };
	}

	async changePassword(userId: string, dto: ChangePasswordDto): Promise<{ message: string }> {
		if (dto.newPassword !== dto.confirmPassword) {
			throw new BadRequestException("New password and confirm password do not match");
		}

		const user = await this.prisma.user.findUnique({
			where: { id: userId },
		});

		if (!user) {
			throw new UnauthorizedException("User not found");
		}

		const isCurrentPasswordValid = await comparePassword(dto.currentPassword, user.passwordHash);

		if (!isCurrentPasswordValid) {
			throw new BadRequestException("Current password is incorrect");
		}

		const newPasswordHash = await hashPassword(dto.newPassword);

		await this.prisma.user.update({
			where: { id: userId },
			data: {
				passwordHash: newPasswordHash,
				mustChangePassword: false,
				passwordChangedAt: new Date(),
			},
		});

		return { message: "Password changed successfully" };
	}

	async resetPassword(userId: string, dto: ResetPasswordDto, resetByUserId: string): Promise<{ message: string }> {
		if (dto.newPassword !== dto.confirmPassword) {
			throw new BadRequestException("New password and confirm password do not match");
		}

		const user = await this.prisma.user.findUnique({
			where: { id: userId },
		});

		if (!user) {
			throw new BadRequestException("User not found");
		}

		const newPasswordHash = await hashPassword(dto.newPassword);

		await this.prisma.user.update({
			where: { id: userId },
			data: {
				passwordHash: newPasswordHash,
				mustChangePassword: true,
				passwordChangedAt: new Date(),
				failedLoginAttempts: 0,
				status: user.status === "LOCKED" ? "ACTIVE" : user.status,
				lockedUntil: null,
			},
		});

		await this.revokeAllUserTokens(userId);

		await this.prisma.auditLog.create({
			data: {
				userId: resetByUserId,
				tenantId: user.tenantId,
				action: "UPDATE",
				module: "auth",
				resource: "user",
				resourceId: userId,
				ipAddress: "0.0.0.0",
				newValue: { resetBy: resetByUserId, resetAt: new Date().toISOString() },
			},
		});

		return { message: "Password reset successfully. User must change password on next login." };
	}

	async getProfile(userId: string): Promise<LoginUserDto> {
		const user = await this.prisma.user.findUnique({
			where: { id: userId },
			include: {
				tenant: true,
				center: true,
				userRoles: {
					include: {
						role: {
							include: {
								rolePermissions: {
									include: {
										permission: true,
									},
								},
							},
						},
					},
				},
			},
		});

		if (!user) {
			throw new UnauthorizedException("User not found");
		}

		const roles = user.userRoles.map((ur) => ur.role.code);
		const permissions = [
			...new Set(
				user.userRoles.flatMap((ur) =>
					ur.role.rolePermissions.map(
						(rp) => `${rp.permission.module}.${rp.permission.action}.${rp.permission.resource}`,
					),
				),
			),
		];
		const accessScopes = [...new Set(user.userRoles.map((ur) => ur.role.accessScope))];
		const effectiveAccessScope = computeEffectiveAccessScope(accessScopes);

		return {
			id: user.id,
			username: user.username,
			tenantId: user.tenantId,
			centerId: user.centerId || undefined,
			employeeId: user.employeeId || undefined,
			roles,
			permissions,
			accessScopes,
			effectiveAccessScope,
			requirePasswordChange: user.mustChangePassword,
			permissionVersion: user.permissionVersion,
		};
	}

	private async generateRefreshToken(
		userId: string,
		ipAddress?: string,
		deviceInfo?: string,
		replacedById?: string,
	): Promise<string> {
		const token = randomBytes(64).toString("hex");
		const tokenHash = this.hashToken(token);
		const expiresAt = new Date(Date.now() + AUTH_CONFIG.REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000);

		await this.prisma.refreshToken.create({
			data: {
				userId,
				tokenHash,
				ipAddress,
				deviceInfo,
				expiresAt,
				replacedBy: replacedById,
			},
		});

		return token;
	}

	private hashToken(token: string): string {
		return createHash("sha256").update(token).digest("hex");
	}

	private async revokeAllUserTokens(userId: string): Promise<void> {
		await this.prisma.refreshToken.updateMany({
			where: { userId, revokedAt: null },
			data: { revokedAt: new Date() },
		});
	}

	private async incrementFailedAttempts(userId: string): Promise<void> {
		const user = await this.prisma.user.findUnique({
			where: { id: userId },
		});

		if (!user) return;

		const newAttempts = user.failedLoginAttempts + 1;
		const shouldLock = newAttempts >= AUTH_CONFIG.MAX_FAILED_LOGIN_ATTEMPTS;
		const lockDurationMs = AUTH_CONFIG.LOCK_DURATION_MINUTES * AUTH_CONFIG.MILLISECONDS_PER_MINUTE;

		await this.prisma.user.update({
			where: { id: userId },
			data: {
				failedLoginAttempts: newAttempts,
				status: shouldLock ? "LOCKED" : user.status,
				lockedUntil: shouldLock ? new Date(Date.now() + lockDurationMs) : user.lockedUntil,
			},
		});

		await this.recordLoginHistory(userId, false);
	}

	private async resetFailedAttempts(userId: string): Promise<void> {
		await this.prisma.user.update({
			where: { id: userId },
			data: {
				failedLoginAttempts: 0,
				lastLoginAt: new Date(),
			},
		});
	}

	private async recordLoginHistory(userId: string, isSuccessful: boolean): Promise<void> {
		await this.prisma.loginHistory.create({
			data: {
				userId,
				ipAddress: "0.0.0.0",
				userAgent: "Unknown",
				sessionId: uuidv4(),
				isSuccessful,
				failureReason: isSuccessful ? undefined : "Invalid credentials",
			},
		});
	}
}
