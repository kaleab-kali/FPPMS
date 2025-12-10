import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "#api/database/prisma.service";
import { CreateTenantDto } from "#api/modules/tenants/dto/create-tenant.dto";
import { TenantResponseDto } from "#api/modules/tenants/dto/tenant-response.dto";
import { UpdateTenantDto } from "#api/modules/tenants/dto/update-tenant.dto";

@Injectable()
export class TenantsService {
	constructor(private prisma: PrismaService) {}

	async create(dto: CreateTenantDto): Promise<TenantResponseDto> {
		const existingTenant = await this.prisma.tenant.findUnique({
			where: { code: dto.code },
		});

		if (existingTenant) {
			throw new BadRequestException(`Tenant with code "${dto.code}" already exists`);
		}

		const tenant = await this.prisma.tenant.create({
			data: {
				name: dto.name,
				code: dto.code,
				nameAm: dto.nameAm,
				type: dto.type || "BRANCH",
				isActive: dto.isActive ?? true,
				settings: (dto.settings || {}) as Prisma.InputJsonValue,
			},
		});

		return this.mapToResponse(tenant);
	}

	async findAll(): Promise<TenantResponseDto[]> {
		const tenants = await this.prisma.tenant.findMany({
			orderBy: { name: "asc" },
		});

		return tenants.map((tenant) => this.mapToResponse(tenant));
	}

	async findOne(id: string): Promise<TenantResponseDto> {
		const tenant = await this.prisma.tenant.findUnique({
			where: { id },
		});

		if (!tenant) {
			throw new NotFoundException(`Tenant with ID "${id}" not found`);
		}

		return this.mapToResponse(tenant);
	}

	async findByCode(code: string): Promise<TenantResponseDto> {
		const tenant = await this.prisma.tenant.findUnique({
			where: { code },
		});

		if (!tenant) {
			throw new NotFoundException(`Tenant with code "${code}" not found`);
		}

		return this.mapToResponse(tenant);
	}

	async update(id: string, dto: UpdateTenantDto): Promise<TenantResponseDto> {
		const existingTenant = await this.prisma.tenant.findUnique({
			where: { id },
		});

		if (!existingTenant) {
			throw new NotFoundException(`Tenant with ID "${id}" not found`);
		}

		const tenant = await this.prisma.tenant.update({
			where: { id },
			data: {
				name: dto.name,
				nameAm: dto.nameAm,
				type: dto.type,
				isActive: dto.isActive,
				settings: dto.settings as Prisma.InputJsonValue,
			},
		});

		return this.mapToResponse(tenant);
	}

	async remove(id: string): Promise<{ message: string }> {
		const existingTenant = await this.prisma.tenant.findUnique({
			where: { id },
		});

		if (!existingTenant) {
			throw new NotFoundException(`Tenant with ID "${id}" not found`);
		}

		await this.prisma.tenant.update({
			where: { id },
			data: { isActive: false },
		});

		return { message: "Tenant deactivated successfully" };
	}

	private mapToResponse(tenant: {
		id: string;
		name: string;
		code: string;
		nameAm: string | null;
		type: string;
		isActive: boolean;
		settings: unknown;
		createdAt: Date;
		updatedAt: Date;
	}): TenantResponseDto {
		return {
			id: tenant.id,
			name: tenant.name,
			code: tenant.code,
			nameAm: tenant.nameAm || undefined,
			type: tenant.type,
			isActive: tenant.isActive,
			settings: (tenant.settings as Record<string, unknown>) || {},
			createdAt: tenant.createdAt,
			updatedAt: tenant.updatedAt,
		};
	}
}
