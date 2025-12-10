import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "#api/database/prisma.service";
import { CreateRegionDto } from "#api/modules/lookups/dto/create-region.dto";
import { RegionResponseDto } from "#api/modules/lookups/dto/region-response.dto";
import { UpdateRegionDto } from "#api/modules/lookups/dto/update-region.dto";

const DEFAULT_SORT_ORDER = 0;

@Injectable()
export class RegionsService {
	constructor(private prisma: PrismaService) {}

	async create(tenantId: string, dto: CreateRegionDto): Promise<RegionResponseDto> {
		const existing = await this.prisma.region.findFirst({
			where: { tenantId, code: dto.code },
		});

		if (existing) {
			throw new BadRequestException(`Region with code "${dto.code}" already exists`);
		}

		const region = await this.prisma.region.create({
			data: {
				tenantId,
				code: dto.code,
				name: dto.name,
				nameAm: dto.nameAm,
				sortOrder: dto.sortOrder ?? DEFAULT_SORT_ORDER,
				isActive: dto.isActive ?? true,
			},
		});

		return this.mapToResponse(region);
	}

	async findAll(tenantId: string): Promise<RegionResponseDto[]> {
		const regions = await this.prisma.region.findMany({
			where: { tenantId },
			orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
		});

		return regions.map((r) => this.mapToResponse(r));
	}

	async findOne(tenantId: string, id: string): Promise<RegionResponseDto> {
		const region = await this.prisma.region.findFirst({
			where: { id, tenantId },
		});

		if (!region) {
			throw new NotFoundException(`Region with ID "${id}" not found`);
		}

		return this.mapToResponse(region);
	}

	async update(tenantId: string, id: string, dto: UpdateRegionDto): Promise<RegionResponseDto> {
		const existing = await this.prisma.region.findFirst({
			where: { id, tenantId },
		});

		if (!existing) {
			throw new NotFoundException(`Region with ID "${id}" not found`);
		}

		const region = await this.prisma.region.update({
			where: { id },
			data: {
				name: dto.name,
				nameAm: dto.nameAm,
				sortOrder: dto.sortOrder,
				isActive: dto.isActive,
			},
		});

		return this.mapToResponse(region);
	}

	async remove(tenantId: string, id: string): Promise<{ message: string }> {
		const existing = await this.prisma.region.findFirst({
			where: { id, tenantId },
		});

		if (!existing) {
			throw new NotFoundException(`Region with ID "${id}" not found`);
		}

		const subCities = await this.prisma.subCity.findMany({
			where: { regionId: id },
		});

		if (subCities.length > 0) {
			throw new BadRequestException("Cannot delete region with sub-cities. Remove sub-cities first.");
		}

		await this.prisma.region.delete({ where: { id } });

		return { message: "Region deleted successfully" };
	}

	private mapToResponse(region: {
		id: string;
		tenantId: string;
		code: string;
		name: string;
		nameAm: string;
		sortOrder: number;
		isActive: boolean;
		createdAt: Date;
		updatedAt: Date;
	}): RegionResponseDto {
		return {
			id: region.id,
			tenantId: region.tenantId,
			code: region.code,
			name: region.name,
			nameAm: region.nameAm,
			sortOrder: region.sortOrder,
			isActive: region.isActive,
			createdAt: region.createdAt,
			updatedAt: region.updatedAt,
		};
	}
}
