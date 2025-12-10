import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "#api/database/prisma.service";
import { CenterResponseDto } from "#api/modules/centers/dto/center-response.dto";
import { CreateCenterDto } from "#api/modules/centers/dto/create-center.dto";
import { UpdateCenterDto } from "#api/modules/centers/dto/update-center.dto";

const DEFAULT_CENTER_TYPE = "CENTER";

@Injectable()
export class CentersService {
	constructor(private prisma: PrismaService) {}

	async create(tenantId: string, dto: CreateCenterDto): Promise<CenterResponseDto> {
		const existingCenter = await this.prisma.center.findFirst({
			where: { tenantId, code: dto.code },
		});

		if (existingCenter) {
			throw new BadRequestException(`Center with code "${dto.code}" already exists in this tenant`);
		}

		if (dto.parentCenterId) {
			const parentCenter = await this.prisma.center.findFirst({
				where: { id: dto.parentCenterId, tenantId },
			});
			if (!parentCenter) {
				throw new BadRequestException("Parent center not found in this tenant");
			}
		}

		const center = await this.prisma.center.create({
			data: {
				tenantId,
				code: dto.code,
				name: dto.name,
				nameAm: dto.nameAm,
				type: dto.type || DEFAULT_CENTER_TYPE,
				regionId: dto.regionId,
				subCityId: dto.subCityId,
				woredaId: dto.woredaId,
				address: dto.address,
				phone: dto.phone,
				email: dto.email,
				parentCenterId: dto.parentCenterId,
				commanderId: dto.commanderId,
				isActive: dto.isActive ?? true,
			},
		});

		return this.mapToResponse(center);
	}

	async findAll(tenantId: string): Promise<CenterResponseDto[]> {
		const centers = await this.prisma.center.findMany({
			where: { tenantId, deletedAt: null },
			orderBy: { name: "asc" },
		});

		return centers.map((center) => this.mapToResponse(center));
	}

	async findOne(tenantId: string, id: string): Promise<CenterResponseDto> {
		const center = await this.prisma.center.findFirst({
			where: { id, tenantId, deletedAt: null },
		});

		if (!center) {
			throw new NotFoundException(`Center with ID "${id}" not found`);
		}

		return this.mapToResponse(center);
	}

	async findByCode(tenantId: string, code: string): Promise<CenterResponseDto> {
		const center = await this.prisma.center.findFirst({
			where: { code, tenantId, deletedAt: null },
		});

		if (!center) {
			throw new NotFoundException(`Center with code "${code}" not found`);
		}

		return this.mapToResponse(center);
	}

	async findHierarchy(tenantId: string, parentId?: string): Promise<CenterResponseDto[]> {
		const centers = await this.prisma.center.findMany({
			where: {
				tenantId,
				parentCenterId: parentId || null,
				deletedAt: null,
			},
			orderBy: { name: "asc" },
		});

		return centers.map((center) => this.mapToResponse(center));
	}

	async update(tenantId: string, id: string, dto: UpdateCenterDto): Promise<CenterResponseDto> {
		const existingCenter = await this.prisma.center.findFirst({
			where: { id, tenantId, deletedAt: null },
		});

		if (!existingCenter) {
			throw new NotFoundException(`Center with ID "${id}" not found`);
		}

		if (dto.parentCenterId) {
			if (dto.parentCenterId === id) {
				throw new BadRequestException("A center cannot be its own parent");
			}
			const parentCenter = await this.prisma.center.findFirst({
				where: { id: dto.parentCenterId, tenantId },
			});
			if (!parentCenter) {
				throw new BadRequestException("Parent center not found in this tenant");
			}
		}

		const center = await this.prisma.center.update({
			where: { id },
			data: {
				name: dto.name,
				nameAm: dto.nameAm,
				type: dto.type,
				regionId: dto.regionId,
				subCityId: dto.subCityId,
				woredaId: dto.woredaId,
				address: dto.address,
				phone: dto.phone,
				email: dto.email,
				parentCenterId: dto.parentCenterId,
				commanderId: dto.commanderId,
				isActive: dto.isActive,
			},
		});

		return this.mapToResponse(center);
	}

	async remove(tenantId: string, id: string): Promise<{ message: string }> {
		const existingCenter = await this.prisma.center.findFirst({
			where: { id, tenantId, deletedAt: null },
		});

		if (!existingCenter) {
			throw new NotFoundException(`Center with ID "${id}" not found`);
		}

		const childCenters = await this.prisma.center.findMany({
			where: { parentCenterId: id, deletedAt: null },
		});

		if (childCenters.length > 0) {
			throw new BadRequestException("Cannot delete center with child centers. Remove or reassign children first.");
		}

		await this.prisma.center.update({
			where: { id },
			data: { deletedAt: new Date(), isActive: false },
		});

		return { message: "Center deleted successfully" };
	}

	private mapToResponse(center: {
		id: string;
		tenantId: string;
		code: string;
		name: string;
		nameAm: string | null;
		type: string;
		regionId: string | null;
		subCityId: string | null;
		woredaId: string | null;
		address: string | null;
		phone: string | null;
		email: string | null;
		parentCenterId: string | null;
		commanderId: string | null;
		isActive: boolean;
		createdAt: Date;
		updatedAt: Date;
	}): CenterResponseDto {
		return {
			id: center.id,
			tenantId: center.tenantId,
			code: center.code,
			name: center.name,
			nameAm: center.nameAm || undefined,
			type: center.type,
			regionId: center.regionId || undefined,
			subCityId: center.subCityId || undefined,
			woredaId: center.woredaId || undefined,
			address: center.address || undefined,
			phone: center.phone || undefined,
			email: center.email || undefined,
			parentCenterId: center.parentCenterId || undefined,
			commanderId: center.commanderId || undefined,
			isActive: center.isActive,
			createdAt: center.createdAt,
			updatedAt: center.updatedAt,
		};
	}
}
