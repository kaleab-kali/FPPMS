import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "#api/database/prisma.service";
import { CreatePositionDto } from "#api/modules/positions/dto/create-position.dto";
import { PositionResponseDto } from "#api/modules/positions/dto/position-response.dto";
import { UpdatePositionDto } from "#api/modules/positions/dto/update-position.dto";

const DEFAULT_SORT_ORDER = 0;

@Injectable()
export class PositionsService {
	constructor(private prisma: PrismaService) {}

	async create(tenantId: string, dto: CreatePositionDto): Promise<PositionResponseDto> {
		const existing = await this.prisma.position.findFirst({
			where: { tenantId, code: dto.code },
		});

		if (existing) {
			throw new BadRequestException(`Position with code "${dto.code}" already exists`);
		}

		if (dto.departmentId) {
			const department = await this.prisma.department.findFirst({
				where: { id: dto.departmentId, tenantId },
			});
			if (!department) {
				throw new BadRequestException("Department not found in this tenant");
			}
		}

		const position = await this.prisma.position.create({
			data: {
				tenantId,
				code: dto.code,
				name: dto.name,
				nameAm: dto.nameAm,
				description: dto.description,
				departmentId: dto.departmentId,
				sortOrder: dto.sortOrder ?? DEFAULT_SORT_ORDER,
				isActive: dto.isActive ?? true,
			},
		});

		return this.mapToResponse(position);
	}

	async findAll(tenantId: string): Promise<PositionResponseDto[]> {
		const positions = await this.prisma.position.findMany({
			where: { tenantId },
			orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
		});

		return positions.map((p) => this.mapToResponse(p));
	}

	async findByDepartment(tenantId: string, departmentId: string): Promise<PositionResponseDto[]> {
		const positions = await this.prisma.position.findMany({
			where: { tenantId, departmentId },
			orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
		});

		return positions.map((p) => this.mapToResponse(p));
	}

	async findOne(tenantId: string, id: string): Promise<PositionResponseDto> {
		const position = await this.prisma.position.findFirst({
			where: { id, tenantId },
		});

		if (!position) {
			throw new NotFoundException(`Position with ID "${id}" not found`);
		}

		return this.mapToResponse(position);
	}

	async update(tenantId: string, id: string, dto: UpdatePositionDto): Promise<PositionResponseDto> {
		const existing = await this.prisma.position.findFirst({
			where: { id, tenantId },
		});

		if (!existing) {
			throw new NotFoundException(`Position with ID "${id}" not found`);
		}

		if (dto.departmentId) {
			const department = await this.prisma.department.findFirst({
				where: { id: dto.departmentId, tenantId },
			});
			if (!department) {
				throw new BadRequestException("Department not found in this tenant");
			}
		}

		const position = await this.prisma.position.update({
			where: { id },
			data: {
				name: dto.name,
				nameAm: dto.nameAm,
				description: dto.description,
				departmentId: dto.departmentId,
				sortOrder: dto.sortOrder,
				isActive: dto.isActive,
			},
		});

		return this.mapToResponse(position);
	}

	async remove(tenantId: string, id: string): Promise<{ message: string }> {
		const existing = await this.prisma.position.findFirst({
			where: { id, tenantId },
		});

		if (!existing) {
			throw new NotFoundException(`Position with ID "${id}" not found`);
		}

		await this.prisma.position.delete({ where: { id } });

		return { message: "Position deleted successfully" };
	}

	private mapToResponse(position: {
		id: string;
		tenantId: string;
		departmentId: string | null;
		code: string;
		name: string;
		nameAm: string | null;
		description: string | null;
		sortOrder: number;
		isActive: boolean;
		createdAt: Date;
		updatedAt: Date;
	}): PositionResponseDto {
		return {
			id: position.id,
			tenantId: position.tenantId,
			departmentId: position.departmentId || undefined,
			code: position.code,
			name: position.name,
			nameAm: position.nameAm || undefined,
			description: position.description || undefined,
			sortOrder: position.sortOrder,
			isActive: position.isActive,
			createdAt: position.createdAt,
			updatedAt: position.updatedAt,
		};
	}
}
