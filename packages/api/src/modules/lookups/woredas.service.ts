import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "#api/database/prisma.service";
import { CreateWoredaDto } from "#api/modules/lookups/dto/create-woreda.dto";
import { UpdateWoredaDto } from "#api/modules/lookups/dto/update-woreda.dto";
import { WoredaResponseDto } from "#api/modules/lookups/dto/woreda-response.dto";

const DEFAULT_SORT_ORDER = 0;

@Injectable()
export class WoredasService {
	constructor(private prisma: PrismaService) {}

	async create(tenantId: string, dto: CreateWoredaDto): Promise<WoredaResponseDto> {
		const subCity = await this.prisma.subCity.findFirst({
			where: { id: dto.subCityId, tenantId },
		});

		if (!subCity) {
			throw new BadRequestException("Sub-city not found in this tenant");
		}

		const existing = await this.prisma.woreda.findFirst({
			where: { tenantId, code: dto.code },
		});

		if (existing) {
			throw new BadRequestException(`Woreda with code "${dto.code}" already exists`);
		}

		const woreda = await this.prisma.woreda.create({
			data: {
				tenantId,
				subCityId: dto.subCityId,
				code: dto.code,
				name: dto.name,
				nameAm: dto.nameAm,
				sortOrder: dto.sortOrder ?? DEFAULT_SORT_ORDER,
				isActive: dto.isActive ?? true,
			},
		});

		return this.mapToResponse(woreda);
	}

	async findAll(tenantId: string): Promise<WoredaResponseDto[]> {
		const woredas = await this.prisma.woreda.findMany({
			where: { tenantId },
			orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
		});

		return woredas.map((w) => this.mapToResponse(w));
	}

	async findBySubCity(tenantId: string, subCityId: string): Promise<WoredaResponseDto[]> {
		const woredas = await this.prisma.woreda.findMany({
			where: { tenantId, subCityId },
			orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
		});

		return woredas.map((w) => this.mapToResponse(w));
	}

	async findOne(tenantId: string, id: string): Promise<WoredaResponseDto> {
		const woreda = await this.prisma.woreda.findFirst({
			where: { id, tenantId },
		});

		if (!woreda) {
			throw new NotFoundException(`Woreda with ID "${id}" not found`);
		}

		return this.mapToResponse(woreda);
	}

	async update(tenantId: string, id: string, dto: UpdateWoredaDto): Promise<WoredaResponseDto> {
		const existing = await this.prisma.woreda.findFirst({
			where: { id, tenantId },
		});

		if (!existing) {
			throw new NotFoundException(`Woreda with ID "${id}" not found`);
		}

		const woreda = await this.prisma.woreda.update({
			where: { id },
			data: {
				name: dto.name,
				nameAm: dto.nameAm,
				sortOrder: dto.sortOrder,
				isActive: dto.isActive,
			},
		});

		return this.mapToResponse(woreda);
	}

	async remove(tenantId: string, id: string): Promise<{ message: string }> {
		const existing = await this.prisma.woreda.findFirst({
			where: { id, tenantId },
		});

		if (!existing) {
			throw new NotFoundException(`Woreda with ID "${id}" not found`);
		}

		await this.prisma.woreda.delete({ where: { id } });

		return { message: "Woreda deleted successfully" };
	}

	private mapToResponse(woreda: {
		id: string;
		tenantId: string;
		subCityId: string;
		code: string;
		name: string;
		nameAm: string;
		sortOrder: number;
		isActive: boolean;
		createdAt: Date;
		updatedAt: Date;
	}): WoredaResponseDto {
		return {
			id: woreda.id,
			tenantId: woreda.tenantId,
			subCityId: woreda.subCityId,
			code: woreda.code,
			name: woreda.name,
			nameAm: woreda.nameAm,
			sortOrder: woreda.sortOrder,
			isActive: woreda.isActive,
			createdAt: woreda.createdAt,
			updatedAt: woreda.updatedAt,
		};
	}
}
