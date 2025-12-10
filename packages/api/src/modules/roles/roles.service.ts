import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "#api/database/prisma.service";
import { CreateRoleDto } from "#api/modules/roles/dto/create-role.dto";
import { RoleResponseDto } from "#api/modules/roles/dto/role-response.dto";
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
		});

		return this.mapToResponse(role);
	}

	async findAll(tenantId: string): Promise<RoleResponseDto[]> {
		const roles = await this.prisma.role.findMany({
			where: {
				OR: [{ tenantId }, { tenantId: null }],
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
		});

		if (!role) {
			throw new NotFoundException(`Role with code "${code}" not found`);
		}

		return this.mapToResponse(role);
	}

	async update(tenantId: string, id: string, dto: UpdateRoleDto): Promise<RoleResponseDto> {
		const existing = await this.prisma.role.findFirst({
			where: { id, tenantId },
		});

		if (!existing) {
			throw new NotFoundException(`Role with ID "${id}" not found or not editable`);
		}

		if (existing.isSystemRole) {
			throw new BadRequestException("System roles cannot be modified");
		}

		const role = await this.prisma.role.update({
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

		return this.mapToResponse(role);
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
	}): RoleResponseDto {
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
			createdAt: role.createdAt,
			updatedAt: role.updatedAt,
		};
	}
}
