import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { UserStatus } from "@prisma/client";
import { hashPassword } from "#api/common/utils/hash.util";
import { PrismaService } from "#api/database/prisma.service";
import { CreateUserDto, CreateUserFromEmployeeDto } from "#api/modules/users/dto/create-user.dto";
import { UpdateUserDto } from "#api/modules/users/dto/update-user.dto";
import { UserResponseDto } from "#api/modules/users/dto/user-response.dto";

const DEFAULT_PASSWORD_PREFIX = "Police@";

@Injectable()
export class UsersService {
	constructor(private prisma: PrismaService) {}

	generateUsernameFromEmployeeId(employeeId: string): string {
		return employeeId.replace(/\//g, "-");
	}

	generateDefaultPassword(): string {
		const currentYear = new Date().getFullYear();
		return `${DEFAULT_PASSWORD_PREFIX}${currentYear}`;
	}

	async createFromEmployee(
		tenantId: string,
		dto: CreateUserFromEmployeeDto,
		createdBy: string,
	): Promise<{ user: UserResponseDto; generatedUsername: string; generatedPassword: string }> {
		const employee = await this.prisma.employee.findFirst({
			where: { id: dto.employeeId, tenantId },
		});

		if (!employee) {
			throw new BadRequestException("Employee not found in this tenant");
		}

		const existingUserForEmployee = await this.prisma.user.findFirst({
			where: { employeeId: dto.employeeId, tenantId, deletedAt: null },
		});

		if (existingUserForEmployee) {
			throw new BadRequestException("This employee already has a user account");
		}

		const generatedUsername = this.generateUsernameFromEmployeeId(employee.employeeId);
		const generatedPassword = this.generateDefaultPassword();

		const existingUser = await this.prisma.user.findFirst({
			where: { tenantId, username: generatedUsername, deletedAt: null },
		});

		if (existingUser) {
			throw new BadRequestException(`User with username "${generatedUsername}" already exists`);
		}

		if (dto.centerId) {
			const center = await this.prisma.center.findFirst({
				where: { id: dto.centerId, tenantId },
			});
			if (!center) {
				throw new BadRequestException("Center not found in this tenant");
			}
		}

		const passwordHash = await hashPassword(generatedPassword);

		const user = await this.prisma.user.create({
			data: {
				tenantId,
				username: generatedUsername,
				email: employee.email,
				passwordHash,
				centerId: dto.centerId || employee.centerId,
				employeeId: dto.employeeId,
				status: UserStatus.ACTIVE,
				mustChangePassword: true,
				createdBy,
			},
			include: {
				userRoles: {
					include: { role: true },
				},
			},
		});

		if (dto.roleIds && dto.roleIds.length > 0) {
			await this.assignRoles(tenantId, user.id, dto.roleIds);
		}

		if (dto.newDepartmentId || dto.newPositionId) {
			const employeeUpdateData: Record<string, unknown> = { updatedBy: createdBy };

			if (dto.newDepartmentId) {
				const department = await this.prisma.department.findFirst({
					where: { id: dto.newDepartmentId, tenantId },
				});
				if (!department) {
					throw new BadRequestException("Department not found in this tenant");
				}
				employeeUpdateData.departmentId = dto.newDepartmentId;
			}

			if (dto.newPositionId) {
				const position = await this.prisma.position.findFirst({
					where: { id: dto.newPositionId, tenantId },
				});
				if (!position) {
					throw new BadRequestException("Position not found in this tenant");
				}
				employeeUpdateData.positionId = dto.newPositionId;
			}

			await this.prisma.employee.update({
				where: { id: dto.employeeId },
				data: employeeUpdateData,
			});
		}

		const userWithRoles = await this.findOne(tenantId, user.id);

		return {
			user: userWithRoles,
			generatedUsername,
			generatedPassword,
		};
	}

	async create(tenantId: string, dto: CreateUserDto, createdBy: string): Promise<UserResponseDto> {
		const employee = await this.prisma.employee.findFirst({
			where: { id: dto.employeeId, tenantId },
		});

		if (!employee) {
			throw new BadRequestException("Employee not found in this tenant");
		}

		const existingUserForEmployee = await this.prisma.user.findFirst({
			where: { employeeId: dto.employeeId, tenantId, deletedAt: null },
		});

		if (existingUserForEmployee) {
			throw new BadRequestException("This employee already has a user account");
		}

		const existingUser = await this.prisma.user.findFirst({
			where: { tenantId, username: dto.username, deletedAt: null },
		});

		if (existingUser) {
			throw new BadRequestException(`User with username "${dto.username}" already exists`);
		}

		if (dto.centerId) {
			const center = await this.prisma.center.findFirst({
				where: { id: dto.centerId, tenantId },
			});
			if (!center) {
				throw new BadRequestException("Center not found in this tenant");
			}
		}

		const passwordHash = await hashPassword(dto.password);

		const user = await this.prisma.user.create({
			data: {
				tenantId,
				username: dto.username,
				email: employee.email,
				passwordHash,
				centerId: dto.centerId || employee.centerId,
				employeeId: dto.employeeId,
				status: UserStatus.ACTIVE,
				mustChangePassword: true,
				createdBy,
			},
			include: {
				userRoles: {
					include: { role: true },
				},
			},
		});

		if (dto.roleIds && dto.roleIds.length > 0) {
			await this.assignRoles(tenantId, user.id, dto.roleIds);
		}

		const userWithRoles = await this.findOne(tenantId, user.id);
		return userWithRoles;
	}

	async resetToDefaultPassword(
		tenantId: string,
		userId: string,
		resetBy: string,
	): Promise<{ message: string; newPassword: string }> {
		const user = await this.prisma.user.findFirst({
			where: { id: userId, tenantId, deletedAt: null },
		});

		if (!user) {
			throw new NotFoundException(`User with ID "${userId}" not found`);
		}

		const newPassword = this.generateDefaultPassword();
		const passwordHash = await hashPassword(newPassword);

		await this.prisma.user.update({
			where: { id: userId },
			data: {
				passwordHash,
				mustChangePassword: true,
				failedLoginAttempts: 0,
				status: user.status === UserStatus.LOCKED ? UserStatus.ACTIVE : user.status,
				lockedUntil: null,
				passwordChangedAt: new Date(),
				updatedBy: resetBy,
			},
		});

		await this.prisma.auditLog.create({
			data: {
				userId: resetBy,
				tenantId,
				action: "UPDATE",
				module: "users",
				resource: "user",
				resourceId: userId,
				ipAddress: "0.0.0.0",
				newValue: { action: "password_reset_to_default", resetBy, resetAt: new Date().toISOString() },
			},
		});

		return {
			message: "Password reset to default successfully. User must change password on next login.",
			newPassword,
		};
	}

	async findAll(tenantId: string): Promise<UserResponseDto[]> {
		const users = await this.prisma.user.findMany({
			where: { tenantId, deletedAt: null },
			include: {
				userRoles: {
					include: { role: true },
				},
			},
			orderBy: { username: "asc" },
		});

		return users.map((u) => this.mapToResponse(u));
	}

	async findByCenter(tenantId: string, centerId: string): Promise<UserResponseDto[]> {
		const users = await this.prisma.user.findMany({
			where: { tenantId, centerId, deletedAt: null },
			include: {
				userRoles: {
					include: { role: true },
				},
			},
			orderBy: { username: "asc" },
		});

		return users.map((u) => this.mapToResponse(u));
	}

	async findOne(tenantId: string, id: string): Promise<UserResponseDto> {
		const user = await this.prisma.user.findFirst({
			where: { id, tenantId, deletedAt: null },
			include: {
				userRoles: {
					include: { role: true },
				},
			},
		});

		if (!user) {
			throw new NotFoundException(`User with ID "${id}" not found`);
		}

		return this.mapToResponse(user);
	}

	async findEmployeesWithoutUserAccount(
		tenantId: string,
		search?: string,
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
		const employeesWithActiveUsers = await this.prisma.user.findMany({
			where: {
				tenantId,
				deletedAt: null,
				employeeId: { not: null },
				status: { in: [UserStatus.ACTIVE, UserStatus.INACTIVE, UserStatus.LOCKED, UserStatus.PENDING] },
			},
			select: { employeeId: true },
		});

		const employeeIdsWithUsers = employeesWithActiveUsers
			.map((u) => u.employeeId)
			.filter((id): id is string => id !== null);

		const whereClause: Record<string, unknown> = {
			tenantId,
			status: "ACTIVE",
			id: { notIn: employeeIdsWithUsers },
		};

		if (search) {
			whereClause.OR = [
				{ employeeId: { contains: search, mode: "insensitive" } },
				{ firstName: { contains: search, mode: "insensitive" } },
				{ lastName: { contains: search, mode: "insensitive" } },
				{ middleName: { contains: search, mode: "insensitive" } },
			];
		}

		const employees = await this.prisma.employee.findMany({
			where: whereClause,
			include: {
				department: { select: { name: true } },
				position: { select: { name: true } },
			},
			take: 50,
			orderBy: { employeeId: "asc" },
		});

		return employees.map((emp) => ({
			id: emp.id,
			employeeId: emp.employeeId,
			fullName: `${emp.firstName} ${emp.middleName} ${emp.lastName}`,
			fullNameAm: `${emp.firstNameAm} ${emp.middleNameAm} ${emp.lastNameAm}`,
			departmentName: emp.department?.name,
			positionName: emp.position?.name,
		}));
	}

	async update(tenantId: string, id: string, dto: UpdateUserDto, updatedBy: string): Promise<UserResponseDto> {
		const existingUser = await this.prisma.user.findFirst({
			where: { id, tenantId, deletedAt: null },
		});

		if (!existingUser) {
			throw new NotFoundException(`User with ID "${id}" not found`);
		}

		if (dto.centerId) {
			const center = await this.prisma.center.findFirst({
				where: { id: dto.centerId, tenantId },
			});
			if (!center) {
				throw new BadRequestException("Center not found in this tenant");
			}
		}

		await this.prisma.user.update({
			where: { id },
			data: {
				email: dto.email,
				centerId: dto.centerId,
				status: dto.status as UserStatus,
				mustChangePassword: dto.mustChangePassword,
				updatedBy,
			},
		});

		if (dto.roleIds !== undefined) {
			await this.prisma.userRole.deleteMany({ where: { userId: id } });
			if (dto.roleIds.length > 0) {
				await this.assignRoles(tenantId, id, dto.roleIds);
			}
			await this.prisma.user.update({
				where: { id },
				data: { permissionVersion: { increment: 1 } },
			});
		}

		return this.findOne(tenantId, id);
	}

	async remove(tenantId: string, id: string, deletedBy: string): Promise<{ message: string }> {
		const existingUser = await this.prisma.user.findFirst({
			where: { id, tenantId, deletedAt: null },
		});

		if (!existingUser) {
			throw new NotFoundException(`User with ID "${id}" not found`);
		}

		await this.prisma.user.update({
			where: { id },
			data: {
				deletedAt: new Date(),
				status: UserStatus.INACTIVE,
				updatedBy: deletedBy,
			},
		});

		return { message: "User deleted successfully" };
	}

	async unlockUser(tenantId: string, id: string): Promise<{ message: string }> {
		const existingUser = await this.prisma.user.findFirst({
			where: { id, tenantId, deletedAt: null },
		});

		if (!existingUser) {
			throw new NotFoundException(`User with ID "${id}" not found`);
		}

		await this.prisma.user.update({
			where: { id },
			data: {
				lockedUntil: null,
				failedLoginAttempts: 0,
				status: UserStatus.ACTIVE,
			},
		});

		return { message: "User unlocked successfully" };
	}

	async changeUserStatus(
		tenantId: string,
		id: string,
		status: UserStatus,
		reason: string,
		changedBy: string,
	): Promise<UserResponseDto> {
		const existingUser = await this.prisma.user.findFirst({
			where: { id, tenantId, deletedAt: null },
		});

		if (!existingUser) {
			throw new NotFoundException(`User with ID "${id}" not found`);
		}

		const validTransitions: Record<UserStatus, UserStatus[]> = {
			[UserStatus.ACTIVE]: [UserStatus.INACTIVE, UserStatus.LOCKED, UserStatus.TRANSFERRED, UserStatus.TERMINATED],
			[UserStatus.INACTIVE]: [UserStatus.ACTIVE, UserStatus.TRANSFERRED, UserStatus.TERMINATED],
			[UserStatus.LOCKED]: [UserStatus.ACTIVE, UserStatus.INACTIVE],
			[UserStatus.PENDING]: [UserStatus.ACTIVE, UserStatus.INACTIVE],
			[UserStatus.TRANSFERRED]: [UserStatus.ACTIVE],
			[UserStatus.TERMINATED]: [],
		};

		if (!validTransitions[existingUser.status].includes(status)) {
			throw new BadRequestException(`Cannot change status from ${existingUser.status} to ${status}`);
		}

		await this.prisma.user.update({
			where: { id },
			data: {
				status,
				statusChangedAt: new Date(),
				statusChangeReason: reason,
				updatedBy: changedBy,
			},
		});

		const statusesThatRevokeTokens: UserStatus[] = [
			UserStatus.INACTIVE,
			UserStatus.LOCKED,
			UserStatus.TRANSFERRED,
			UserStatus.TERMINATED,
		];
		if (statusesThatRevokeTokens.includes(status)) {
			await this.prisma.refreshToken.updateMany({
				where: { userId: id, revokedAt: null },
				data: { revokedAt: new Date() },
			});
		}

		await this.prisma.auditLog.create({
			data: {
				userId: changedBy,
				tenantId,
				action: "UPDATE",
				module: "users",
				resource: "user",
				resourceId: id,
				ipAddress: "0.0.0.0",
				previousValue: { status: existingUser.status },
				newValue: { status, reason, changedAt: new Date().toISOString() },
			},
		});

		return this.findOne(tenantId, id);
	}

	private async assignRoles(tenantId: string, userId: string, roleIds: string[]): Promise<void> {
		const roles = await this.prisma.role.findMany({
			where: {
				id: { in: roleIds },
				OR: [{ tenantId }, { tenantId: null }],
			},
		});

		if (roles.length !== roleIds.length) {
			throw new BadRequestException("One or more roles not found");
		}

		const userRoleData = roleIds.map((roleId) => ({
			userId,
			roleId,
		}));

		await this.prisma.userRole.createMany({ data: userRoleData });
	}

	private mapToResponse(user: {
		id: string;
		tenantId: string;
		centerId: string | null;
		employeeId: string | null;
		username: string;
		email: string | null;
		status: UserStatus;
		mustChangePassword: boolean;
		lastLoginAt: Date | null;
		createdAt: Date;
		updatedAt: Date;
		userRoles: Array<{
			role: {
				id: string;
				code: string;
				name: string;
			};
		}>;
	}): UserResponseDto {
		return {
			id: user.id,
			tenantId: user.tenantId,
			centerId: user.centerId || undefined,
			employeeId: user.employeeId || undefined,
			username: user.username,
			email: user.email || undefined,
			status: user.status,
			mustChangePassword: user.mustChangePassword,
			lastLoginAt: user.lastLoginAt || undefined,
			roles: user.userRoles.map((ur) => ({
				id: ur.role.id,
				code: ur.role.code,
				name: ur.role.name,
			})),
			createdAt: user.createdAt,
			updatedAt: user.updatedAt,
		};
	}
}
