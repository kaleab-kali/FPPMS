import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "#api/database/prisma.service";
import { CreateRoleDto } from "#api/modules/roles/dto/create-role.dto";
import { RolePermissionDto, RoleResponseDto } from "#api/modules/roles/dto/role-response.dto";
import { UpdateRoleDto } from "#api/modules/roles/dto/update-role.dto";

const DEFAULT_ACCESS_SCOPE = "OWN_CENTER";
const DEFAULT_LEVEL = 0;

@Injectable()
export class RolesService {
	constructor(private prisma: PrismaService) {}

	async create(tenantId: string, dto: CreateRoleDto): Promise<RoleResponseDto> {
		const existing = await this.prisma.role.findFirst({
			where: { tenantId, code: dto.code },
		});

		if (existing) {
			throw new BadRequestException(`Role with code "${dto.code}" already exists`);
		}

		const role = await this.prisma.role.create({
			data: {
				tenantId,
				code: dto.code,
				name: dto.name,
				nameAm: dto.nameAm,
				description: dto.description,
				isSystemRole: false,
				level: dto.level ?? DEFAULT_LEVEL,
				accessScope: dto.accessScope || DEFAULT_ACCESS_SCOPE,
				isActive: dto.isActive ?? true,
			},
			include: {
				rolePermissions: {
					include: { permission: true },
				},
			},
		});

		if (dto.permissionIds && dto.permissionIds.length > 0) {
			await this.assignPermissions(role.id, dto.permissionIds);
			return this.findOne(tenantId, role.id);
		}

		return this.mapToResponse(role);
	}

	async findAll(tenantId: string): Promise<RoleResponseDto[]> {
		const roles = await this.prisma.role.findMany({
			where: {
				OR: [{ tenantId }, { tenantId: null }],
			},
			include: {
				rolePermissions: {
					include: { permission: true },
				},
			},
			orderBy: [{ level: "desc" }, { name: "asc" }],
		});

		return roles.map((r) => this.mapToResponse(r));
	}

	async findOne(tenantId: string, id: string): Promise<RoleResponseDto> {
		const role = await this.prisma.role.findFirst({
			where: {
				id,
				OR: [{ tenantId }, { tenantId: null }],
			},
			include: {
				rolePermissions: {
					include: { permission: true },
				},
			},
		});

		if (!role) {
			throw new NotFoundException(`Role with ID "${id}" not found`);
		}

		return this.mapToResponse(role);
	}

	async findByCode(tenantId: string, code: string): Promise<RoleResponseDto> {
		const role = await this.prisma.role.findFirst({
			where: {
				code,
				OR: [{ tenantId }, { tenantId: null }],
			},
			include: {
				rolePermissions: {
					include: { permission: true },
				},
			},
		});

		if (!role) {
			throw new NotFoundException(`Role with code "${code}" not found`);
		}

		return this.mapToResponse(role);
	}

	async update(tenantId: string, id: string, dto: UpdateRoleDto): Promise<RoleResponseDto> {
		const existing = await this.prisma.role.findFirst({
			where: {
				id,
				OR: [{ tenantId }, { tenantId: null }],
			},
		});

		if (!existing) {
			throw new NotFoundException(`Role with ID "${id}" not found`);
		}

		if (existing.isSystemRole) {
			await this.prisma.role.update({
				where: { id },
				data: {
					nameAm: dto.nameAm,
					description: dto.description,
					isActive: dto.isActive,
				},
			});
		} else {
			await this.prisma.role.update({
				where: { id },
				data: {
					name: dto.name,
					nameAm: dto.nameAm,
					description: dto.description,
					level: dto.level,
					accessScope: dto.accessScope,
					isActive: dto.isActive,
				},
			});
		}

		if (dto.permissionIds !== undefined) {
			await this.prisma.rolePermission.deleteMany({ where: { roleId: id } });
			if (dto.permissionIds.length > 0) {
				await this.assignPermissions(id, dto.permissionIds);
			}
			await this.incrementPermissionVersionForRole(id);
		}

		return this.findOne(tenantId, id);
	}

	async remove(tenantId: string, id: string): Promise<{ message: string }> {
		const existing = await this.prisma.role.findFirst({
			where: { id, tenantId },
		});

		if (!existing) {
			throw new NotFoundException(`Role with ID "${id}" not found or not deletable`);
		}

		if (existing.isSystemRole) {
			throw new BadRequestException("System roles cannot be deleted");
		}

		const userRoles = await this.prisma.userRole.findMany({
			where: { roleId: id },
		});

		if (userRoles.length > 0) {
			throw new BadRequestException("Cannot delete role assigned to users");
		}

		await this.prisma.role.delete({ where: { id } });

		return { message: "Role deleted successfully" };
	}

	private async assignPermissions(roleId: string, permissionIds: string[]): Promise<void> {
		const permissions = await this.prisma.permission.findMany({
			where: { id: { in: permissionIds } },
		});

		if (permissions.length !== permissionIds.length) {
			throw new BadRequestException("One or more permissions not found");
		}

		const rolePermissionData = permissionIds.map((permissionId) => ({
			roleId,
			permissionId,
		}));

		await this.prisma.rolePermission.createMany({ data: rolePermissionData });
	}

	private async incrementPermissionVersionForRole(roleId: string): Promise<void> {
		const userRoles = await this.prisma.userRole.findMany({
			where: { roleId },
			select: { userId: true },
		});

		if (userRoles.length === 0) {
			return;
		}

		const userIds = userRoles.map((ur) => ur.userId);
		await this.prisma.user.updateMany({
			where: { id: { in: userIds } },
			data: { permissionVersion: { increment: 1 } },
		});
	}

	private mapToResponse(role: {
		id: string;
		tenantId: string | null;
		code: string;
		name: string;
		nameAm: string | null;
		description: string | null;
		isSystemRole: boolean;
		level: number;
		accessScope: string;
		isActive: boolean;
		createdAt: Date;
		updatedAt: Date;
		rolePermissions: Array<{
			permission: {
				id: string;
				module: string;
				action: string;
				resource: string;
				description: string | null;
			};
		}>;
	}): RoleResponseDto {
		const permissions: RolePermissionDto[] = role.rolePermissions.map((rp) => ({
			id: rp.permission.id,
			module: rp.permission.module,
			action: rp.permission.action,
			resource: rp.permission.resource,
			description: rp.permission.description || undefined,
		}));

		return {
			id: role.id,
			tenantId: role.tenantId || undefined,
			code: role.code,
			name: role.name,
			nameAm: role.nameAm || undefined,
			description: role.description || undefined,
			isSystemRole: role.isSystemRole,
			level: role.level,
			accessScope: role.accessScope,
			isActive: role.isActive,
			permissions,
			createdAt: role.createdAt,
			updatedAt: role.updatedAt,
		};
	}
}
