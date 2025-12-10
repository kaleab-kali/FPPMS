import * as crypto from "node:crypto";
import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { UserStatus } from "@prisma/client";
import { PrismaService } from "#api/database/prisma.service";
import { CreateUserDto } from "#api/modules/users/dto/create-user.dto";
import { UpdateUserDto } from "#api/modules/users/dto/update-user.dto";
import { UserResponseDto } from "#api/modules/users/dto/user-response.dto";

const SALT_BYTES = 32;
const HASH_ITERATIONS = 100000;
const HASH_KEY_LENGTH = 64;
const HASH_ALGORITHM = "sha512";

@Injectable()
export class UsersService {
	constructor(private prisma: PrismaService) {}

	async create(tenantId: string, dto: CreateUserDto, createdBy: string): Promise<UserResponseDto> {
		const existingUser = await this.prisma.user.findFirst({
			where: { tenantId, username: dto.username },
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

		if (dto.employeeId) {
			const employee = await this.prisma.employee.findFirst({
				where: { id: dto.employeeId, tenantId },
			});
			if (!employee) {
				throw new BadRequestException("Employee not found in this tenant");
			}
		}

		const salt = crypto.randomBytes(SALT_BYTES).toString("hex");
		const hash = crypto
			.pbkdf2Sync(dto.password, salt, HASH_ITERATIONS, HASH_KEY_LENGTH, HASH_ALGORITHM)
			.toString("hex");

		const user = await this.prisma.user.create({
			data: {
				tenantId,
				username: dto.username,
				email: dto.email,
				passwordHash: hash,
				passwordSalt: salt,
				centerId: dto.centerId,
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
			},
		});

		return { message: "User unlocked successfully" };
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
