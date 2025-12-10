import { BadRequestException, ForbiddenException, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { v4 as uuidv4 } from "uuid";
import { comparePassword, hashPassword } from "#api/common/utils/hash.util";
import { PrismaService } from "#api/database/prisma.service";
import { ChangePasswordDto } from "#api/modules/auth/dto/change-password.dto";
import { LoginResponseDto, LoginUserDto } from "#api/modules/auth/dto/login-response.dto";
import { ResetPasswordDto } from "#api/modules/auth/dto/reset-password.dto";

interface JwtPayloadData {
	sub: string;
	username: string;
	tenantId: string;
	centerId?: string;
	roles: string[];
	permissions: string[];
}

const AUTH_CONFIG = {
	MAX_FAILED_LOGIN_ATTEMPTS: 5,
	LOCK_DURATION_MINUTES: 30,
	MILLISECONDS_PER_MINUTE: 60 * 1000,
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

		const isPasswordValid = await comparePassword(password, user.passwordHash);

		if (!isPasswordValid) {
			await this.incrementFailedAttempts(user.id);
			return undefined;
		}

		await this.resetFailedAttempts(user.id);
		await this.recordLoginHistory(user.id, true);

		const roles = user.userRoles.map((ur) => ur.role.name);
		const permissions = [
			...new Set(
				user.userRoles.flatMap((ur) =>
					ur.role.rolePermissions.map(
						(rp) => `${rp.permission.module}.${rp.permission.action}.${rp.permission.resource}`,
					),
				),
			),
		];

		return {
			id: user.id,
			username: user.username,
			tenantId: user.tenantId,
			centerId: user.centerId || undefined,
			roles,
			permissions,
			requirePasswordChange: user.mustChangePassword,
		};
	}

	async login(user: LoginUserDto): Promise<LoginResponseDto> {
		const payload: JwtPayloadData = {
			sub: user.id,
			username: user.username,
			tenantId: user.tenantId,
			centerId: user.centerId,
			roles: user.roles,
			permissions: user.permissions,
		};

		return {
			accessToken: this.jwtService.sign(payload),
			user,
		};
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

		const roles = user.userRoles.map((ur) => ur.role.name);
		const permissions = [
			...new Set(
				user.userRoles.flatMap((ur) =>
					ur.role.rolePermissions.map(
						(rp) => `${rp.permission.module}.${rp.permission.action}.${rp.permission.resource}`,
					),
				),
			),
		];

		return {
			id: user.id,
			username: user.username,
			tenantId: user.tenantId,
			centerId: user.centerId || undefined,
			roles,
			permissions,
			requirePasswordChange: user.mustChangePassword,
		};
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
