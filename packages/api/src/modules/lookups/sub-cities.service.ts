import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "#api/database/prisma.service";
import { CreateSubCityDto } from "#api/modules/lookups/dto/create-sub-city.dto";
import { SubCityResponseDto } from "#api/modules/lookups/dto/sub-city-response.dto";
import { UpdateSubCityDto } from "#api/modules/lookups/dto/update-sub-city.dto";

const DEFAULT_SORT_ORDER = 0;

@Injectable()
export class SubCitiesService {
	constructor(private prisma: PrismaService) {}

	async create(tenantId: string, dto: CreateSubCityDto): Promise<SubCityResponseDto> {
		const region = await this.prisma.region.findFirst({
			where: { id: dto.regionId, tenantId },
		});

		if (!region) {
			throw new BadRequestException("Region not found in this tenant");
		}

		const existing = await this.prisma.subCity.findFirst({
			where: { tenantId, code: dto.code },
		});

		if (existing) {
			throw new BadRequestException(`Sub-city with code "${dto.code}" already exists`);
		}

		const subCity = await this.prisma.subCity.create({
			data: {
				tenantId,
				regionId: dto.regionId,
				code: dto.code,
				name: dto.name,
				nameAm: dto.nameAm,
				sortOrder: dto.sortOrder ?? DEFAULT_SORT_ORDER,
				isActive: dto.isActive ?? true,
			},
		});

		return this.mapToResponse(subCity);
	}

	async findAll(tenantId: string): Promise<SubCityResponseDto[]> {
		const subCities = await this.prisma.subCity.findMany({
			where: { tenantId },
			include: { region: true },
			orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
		});

		return subCities.map((s) => this.mapToResponse(s));
	}

	async findByRegion(tenantId: string, regionId: string): Promise<SubCityResponseDto[]> {
		const subCities = await this.prisma.subCity.findMany({
			where: { tenantId, regionId },
			orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
		});

		return subCities.map((s) => this.mapToResponse(s));
	}

	async findOne(tenantId: string, id: string): Promise<SubCityResponseDto> {
		const subCity = await this.prisma.subCity.findFirst({
			where: { id, tenantId },
		});

		if (!subCity) {
			throw new NotFoundException(`Sub-city with ID "${id}" not found`);
		}

		return this.mapToResponse(subCity);
	}

	async update(tenantId: string, id: string, dto: UpdateSubCityDto): Promise<SubCityResponseDto> {
		const existing = await this.prisma.subCity.findFirst({
			where: { id, tenantId },
		});

		if (!existing) {
			throw new NotFoundException(`Sub-city with ID "${id}" not found`);
		}

		const subCity = await this.prisma.subCity.update({
			where: { id },
			data: {
				name: dto.name,
				nameAm: dto.nameAm,
				sortOrder: dto.sortOrder,
				isActive: dto.isActive,
			},
		});

		return this.mapToResponse(subCity);
	}

	async remove(tenantId: string, id: string): Promise<{ message: string }> {
		const existing = await this.prisma.subCity.findFirst({
			where: { id, tenantId },
		});

		if (!existing) {
			throw new NotFoundException(`Sub-city with ID "${id}" not found`);
		}

		const woredas = await this.prisma.woreda.findMany({
			where: { subCityId: id },
		});

		if (woredas.length > 0) {
			throw new BadRequestException("Cannot delete sub-city with woredas. Remove woredas first.");
		}

		await this.prisma.subCity.delete({ where: { id } });

		return { message: "Sub-city deleted successfully" };
	}

	private mapToResponse(subCity: {
		id: string;
		tenantId: string;
		regionId: string;
		code: string;
		name: string;
		nameAm: string;
		sortOrder: number;
		isActive: boolean;
		createdAt: Date;
		updatedAt: Date;
		region?: {
			id: string;
			code: string;
			name: string;
			nameAm: string;
			sortOrder: number;
			isActive: boolean;
		};
	}): SubCityResponseDto {
		return {
			id: subCity.id,
			tenantId: subCity.tenantId,
			regionId: subCity.regionId,
			code: subCity.code,
			name: subCity.name,
			nameAm: subCity.nameAm,
			sortOrder: subCity.sortOrder,
			isActive: subCity.isActive,
			createdAt: subCity.createdAt,
			updatedAt: subCity.updatedAt,
			region: subCity.region
				? {
						id: subCity.region.id,
						code: subCity.region.code,
						name: subCity.region.name,
						nameAm: subCity.region.nameAm,
					}
				: undefined,
		};
	}
}
