import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "#api/database/prisma.service";
import { CreateDepartmentDto } from "#api/modules/departments/dto/create-department.dto";
import { DepartmentResponseDto } from "#api/modules/departments/dto/department-response.dto";
import { UpdateDepartmentDto } from "#api/modules/departments/dto/update-department.dto";

const DEFAULT_SORT_ORDER = 0;

@Injectable()
export class DepartmentsService {
	constructor(private prisma: PrismaService) {}

	async create(tenantId: string, dto: CreateDepartmentDto): Promise<DepartmentResponseDto> {
		const existing = await this.prisma.department.findFirst({
			where: { tenantId, code: dto.code },
		});

		if (existing) {
			throw new BadRequestException(`Department with code "${dto.code}" already exists`);
		}

		if (dto.parentId) {
			const parent = await this.prisma.department.findFirst({
				where: { id: dto.parentId, tenantId },
			});
			if (!parent) {
				throw new BadRequestException("Parent department not found in this tenant");
			}
		}

		const department = await this.prisma.department.create({
			data: {
				tenantId,
				code: dto.code,
				name: dto.name,
				nameAm: dto.nameAm,
				description: dto.description,
				parentId: dto.parentId,
				headEmployeeId: dto.headEmployeeId,
				sortOrder: dto.sortOrder ?? DEFAULT_SORT_ORDER,
				isActive: dto.isActive ?? true,
			},
		});

		return this.mapToResponse(department);
	}

	async findAll(tenantId: string): Promise<DepartmentResponseDto[]> {
		const departments = await this.prisma.department.findMany({
			where: { tenantId },
			orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
		});

		return departments.map((d) => this.mapToResponse(d));
	}

	async findHierarchy(tenantId: string, parentId?: string): Promise<DepartmentResponseDto[]> {
		const departments = await this.prisma.department.findMany({
			where: {
				tenantId,
				parentId: parentId || null,
			},
			orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
		});

		return departments.map((d) => this.mapToResponse(d));
	}

	async findOne(tenantId: string, id: string): Promise<DepartmentResponseDto> {
		const department = await this.prisma.department.findFirst({
			where: { id, tenantId },
		});

		if (!department) {
			throw new NotFoundException(`Department with ID "${id}" not found`);
		}

		return this.mapToResponse(department);
	}

	async update(tenantId: string, id: string, dto: UpdateDepartmentDto): Promise<DepartmentResponseDto> {
		const existing = await this.prisma.department.findFirst({
			where: { id, tenantId },
		});

		if (!existing) {
			throw new NotFoundException(`Department with ID "${id}" not found`);
		}

		if (dto.parentId) {
			if (dto.parentId === id) {
				throw new BadRequestException("A department cannot be its own parent");
			}
			const parent = await this.prisma.department.findFirst({
				where: { id: dto.parentId, tenantId },
			});
			if (!parent) {
				throw new BadRequestException("Parent department not found in this tenant");
			}
		}

		const department = await this.prisma.department.update({
			where: { id },
			data: {
				name: dto.name,
				nameAm: dto.nameAm,
				description: dto.description,
				parentId: dto.parentId,
				headEmployeeId: dto.headEmployeeId,
				sortOrder: dto.sortOrder,
				isActive: dto.isActive,
			},
		});

		return this.mapToResponse(department);
	}

	async remove(tenantId: string, id: string): Promise<{ message: string }> {
		const existing = await this.prisma.department.findFirst({
			where: { id, tenantId },
		});

		if (!existing) {
			throw new NotFoundException(`Department with ID "${id}" not found`);
		}

		const children = await this.prisma.department.findMany({
			where: { parentId: id },
		});

		if (children.length > 0) {
			throw new BadRequestException("Cannot delete department with child departments");
		}

		const positions = await this.prisma.position.findMany({
			where: { departmentId: id },
		});

		if (positions.length > 0) {
			throw new BadRequestException("Cannot delete department with positions");
		}

		await this.prisma.department.delete({ where: { id } });

		return { message: "Department deleted successfully" };
	}

	private mapToResponse(department: {
		id: string;
		tenantId: string;
		code: string;
		name: string;
		nameAm: string | null;
		description: string | null;
		parentId: string | null;
		headEmployeeId: string | null;
		sortOrder: number;
		isActive: boolean;
		createdAt: Date;
		updatedAt: Date;
	}): DepartmentResponseDto {
		return {
			id: department.id,
			tenantId: department.tenantId,
			code: department.code,
			name: department.name,
			nameAm: department.nameAm || undefined,
			description: department.description || undefined,
			parentId: department.parentId || undefined,
			headEmployeeId: department.headEmployeeId || undefined,
			sortOrder: department.sortOrder,
			isActive: department.isActive,
			createdAt: department.createdAt,
			updatedAt: department.updatedAt,
		};
	}
}
