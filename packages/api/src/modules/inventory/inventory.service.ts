import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PaginatedResult } from "#api/common/interfaces/paginated-result.interface";
import { calculateSkip, paginate } from "#api/common/utils/pagination.util";
import { PrismaService } from "#api/database/prisma.service";
import { CenterInventoryService } from "./center-inventory.service";
import {
	CreateInventoryAssignmentDto,
	InventoryAssignmentFilterDto,
	InventoryAssignmentResponseDto,
	ReturnInventoryDto,
	UpdateInventoryAssignmentDto,
} from "./dto";

@Injectable()
export class InventoryService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly centerInventoryService: CenterInventoryService,
	) {}

	async findAll(
		tenantId: string,
		filter: InventoryAssignmentFilterDto,
	): Promise<PaginatedResult<InventoryAssignmentResponseDto>> {
		const {
			page = 1,
			limit = 10,
			employeeId,
			centerId,
			itemTypeId,
			categoryId,
			isReturned,
			isPermanent,
			isLost,
			isDamaged,
			search,
		} = filter;

		const where: Prisma.InventoryAssignmentWhereInput = {
			tenantId,
			...(employeeId && { employeeId }),
			...(centerId && { centerId }),
			...(itemTypeId && { itemTypeId }),
			...(categoryId && { itemType: { categoryId } }),
			...(typeof isReturned === "boolean" && { isReturned }),
			...(typeof isPermanent === "boolean" && { isPermanent }),
			...(typeof isLost === "boolean" && { isLost }),
			...(typeof isDamaged === "boolean" && { isDamaged }),
			...(search && {
				OR: [
					{ serialNumber: { contains: search, mode: "insensitive" } },
					{ assetTag: { contains: search, mode: "insensitive" } },
				],
			}),
		};

		const [assignments, total] = await Promise.all([
			this.prisma.inventoryAssignment.findMany({
				where,
				include: {
					employee: {
						select: {
							id: true,
							employeeId: true,
							fullName: true,
						},
					},
					itemType: {
						select: {
							id: true,
							name: true,
							nameAm: true,
							category: {
								select: { name: true },
							},
						},
					},
					center: {
						select: {
							id: true,
							name: true,
						},
					},
				},
				orderBy: { createdAt: "desc" },
				skip: calculateSkip(page, limit),
				take: limit,
			}),
			this.prisma.inventoryAssignment.count({ where }),
		]);

		const data = assignments.map((a) => this.mapToResponse(a));

		return paginate(data, total, page, limit);
	}

	async findByEmployee(
		tenantId: string,
		employeeId: string,
		filter: InventoryAssignmentFilterDto,
	): Promise<PaginatedResult<InventoryAssignmentResponseDto>> {
		return this.findAll(tenantId, { ...filter, employeeId });
	}

	async findOne(tenantId: string, id: string): Promise<InventoryAssignmentResponseDto> {
		const assignment = await this.prisma.inventoryAssignment.findFirst({
			where: { id, tenantId },
			include: {
				employee: {
					select: {
						id: true,
						employeeId: true,
						fullName: true,
					},
				},
				itemType: {
					select: {
						id: true,
						name: true,
						nameAm: true,
						category: {
							select: { name: true },
						},
					},
				},
				center: {
					select: {
						id: true,
						name: true,
					},
				},
			},
		});

		if (!assignment) {
			throw new NotFoundException("Inventory assignment not found");
		}

		return this.mapToResponse(assignment);
	}

	async create(
		tenantId: string,
		userId: string,
		dto: CreateInventoryAssignmentDto,
	): Promise<InventoryAssignmentResponseDto> {
		const employee = await this.prisma.employee.findFirst({
			where: { id: dto.employeeId, tenantId },
		});

		if (!employee) {
			throw new NotFoundException("Employee not found");
		}

		const itemType = await this.prisma.inventoryItemType.findFirst({
			where: { id: dto.itemTypeId, tenantId },
		});

		if (!itemType) {
			throw new NotFoundException("Item type not found");
		}

		if (dto.centerId) {
			const center = await this.prisma.center.findFirst({
				where: { id: dto.centerId, tenantId },
			});

			if (!center) {
				throw new NotFoundException("Center not found");
			}

			const canAssign = await this.centerInventoryService.checkAvailability(
				tenantId,
				dto.centerId,
				dto.itemTypeId,
				dto.quantity,
			);

			if (!canAssign) {
				throw new BadRequestException("Insufficient inventory at center");
			}
		}

		const assignment = await this.prisma.$transaction(async (tx) => {
			const created = await tx.inventoryAssignment.create({
				data: {
					tenantId,
					employeeId: dto.employeeId,
					itemTypeId: dto.itemTypeId,
					centerId: dto.centerId,
					serialNumber: dto.serialNumber,
					assetTag: dto.assetTag,
					size: dto.size,
					quantity: dto.quantity,
					isPermanent: dto.isPermanent,
					expectedReturnDate: dto.expectedReturnDate ? new Date(dto.expectedReturnDate) : undefined,
					assignedDate: new Date(dto.assignedDate),
					assignedBy: userId,
					conditionAtAssignment: dto.conditionAtAssignment,
					remarks: dto.remarks,
				},
				include: {
					employee: {
						select: {
							id: true,
							employeeId: true,
							fullName: true,
						},
					},
					itemType: {
						select: {
							id: true,
							name: true,
							nameAm: true,
							category: {
								select: { name: true },
							},
						},
					},
					center: {
						select: {
							id: true,
							name: true,
						},
					},
				},
			});

			if (dto.centerId) {
				await this.centerInventoryService.adjustAssignedQuantity(
					tx,
					tenantId,
					dto.centerId,
					dto.itemTypeId,
					dto.quantity,
				);
			}

			return created;
		});

		return this.mapToResponse(assignment);
	}

	async update(
		tenantId: string,
		id: string,
		dto: UpdateInventoryAssignmentDto,
	): Promise<InventoryAssignmentResponseDto> {
		const existing = await this.prisma.inventoryAssignment.findFirst({
			where: { id, tenantId },
		});

		if (!existing) {
			throw new NotFoundException("Inventory assignment not found");
		}

		if (existing.isReturned) {
			throw new BadRequestException("Cannot update a returned assignment");
		}

		const assignment = await this.prisma.inventoryAssignment.update({
			where: { id },
			data: {
				serialNumber: dto.serialNumber,
				assetTag: dto.assetTag,
				size: dto.size,
				isPermanent: dto.isPermanent,
				expectedReturnDate: dto.expectedReturnDate ? new Date(dto.expectedReturnDate) : undefined,
				remarks: dto.remarks,
			},
			include: {
				employee: {
					select: {
						id: true,
						employeeId: true,
						fullName: true,
					},
				},
				itemType: {
					select: {
						id: true,
						name: true,
						nameAm: true,
						category: {
							select: { name: true },
						},
					},
				},
				center: {
					select: {
						id: true,
						name: true,
					},
				},
			},
		});

		return this.mapToResponse(assignment);
	}

	async returnAssignment(
		tenantId: string,
		id: string,
		userId: string,
		dto: ReturnInventoryDto,
	): Promise<InventoryAssignmentResponseDto> {
		const existing = await this.prisma.inventoryAssignment.findFirst({
			where: { id, tenantId },
		});

		if (!existing) {
			throw new NotFoundException("Inventory assignment not found");
		}

		if (existing.isReturned) {
			throw new BadRequestException("Assignment already returned");
		}

		const assignment = await this.prisma.$transaction(async (tx) => {
			const updated = await tx.inventoryAssignment.update({
				where: { id },
				data: {
					isReturned: true,
					returnedDate: dto.returnedDate ? new Date(dto.returnedDate) : new Date(),
					returnedTo: userId,
					conditionAtReturn: dto.conditionAtReturn,
					isLost: dto.isLost ?? false,
					isDamaged: dto.isDamaged ?? false,
					damageNotes: dto.damageNotes,
					costRecovery: dto.costRecovery ? new Prisma.Decimal(dto.costRecovery) : undefined,
				},
				include: {
					employee: {
						select: {
							id: true,
							employeeId: true,
							fullName: true,
						},
					},
					itemType: {
						select: {
							id: true,
							name: true,
							nameAm: true,
							category: {
								select: { name: true },
							},
						},
					},
					center: {
						select: {
							id: true,
							name: true,
						},
					},
				},
			});

			if (existing.centerId && !dto.isLost) {
				await this.centerInventoryService.adjustAssignedQuantity(
					tx,
					tenantId,
					existing.centerId,
					existing.itemTypeId,
					-existing.quantity,
				);
			}

			return updated;
		});

		return this.mapToResponse(assignment);
	}

	async getOverdueAssignments(
		tenantId: string,
		filter: InventoryAssignmentFilterDto,
	): Promise<PaginatedResult<InventoryAssignmentResponseDto>> {
		const { page = 1, limit = 10 } = filter;
		const today = new Date();
		today.setHours(0, 0, 0, 0);

		const where: Prisma.InventoryAssignmentWhereInput = {
			tenantId,
			isReturned: false,
			isPermanent: false,
			expectedReturnDate: {
				lt: today,
			},
		};

		const [assignments, total] = await Promise.all([
			this.prisma.inventoryAssignment.findMany({
				where,
				include: {
					employee: {
						select: {
							id: true,
							employeeId: true,
							fullName: true,
						},
					},
					itemType: {
						select: {
							id: true,
							name: true,
							nameAm: true,
							category: {
								select: { name: true },
							},
						},
					},
					center: {
						select: {
							id: true,
							name: true,
						},
					},
				},
				orderBy: { expectedReturnDate: "asc" },
				skip: calculateSkip(page, limit),
				take: limit,
			}),
			this.prisma.inventoryAssignment.count({ where }),
		]);

		return paginate(
			assignments.map((a) => this.mapToResponse(a)),
			total,
			page,
			limit,
		);
	}

	private mapToResponse(assignment: {
		id: string;
		tenantId: string;
		employeeId: string;
		itemTypeId: string;
		centerId: string | null;
		serialNumber: string | null;
		assetTag: string | null;
		size: string | null;
		quantity: number;
		isPermanent: boolean;
		expectedReturnDate: Date | null;
		assignedDate: Date;
		assignedBy: string;
		conditionAtAssignment: string;
		isReturned: boolean;
		returnedDate: Date | null;
		returnedTo: string | null;
		conditionAtReturn: string | null;
		isLost: boolean;
		isDamaged: boolean;
		damageNotes: string | null;
		costRecovery: Prisma.Decimal | null;
		remarks: string | null;
		createdAt: Date;
		updatedAt: Date;
		employee?: { id: string; employeeId: string; fullName: string };
		itemType?: { id: string; name: string; nameAm: string | null; category: { name: string } };
		center?: { id: string; name: string } | null;
	}): InventoryAssignmentResponseDto {
		return {
			id: assignment.id,
			tenantId: assignment.tenantId,
			employeeId: assignment.employeeId,
			employeeName: assignment.employee?.fullName,
			employeeCode: assignment.employee?.employeeId,
			itemTypeId: assignment.itemTypeId,
			itemTypeName: assignment.itemType?.name,
			itemTypeNameAm: assignment.itemType?.nameAm ?? undefined,
			categoryName: assignment.itemType?.category.name,
			centerId: assignment.centerId ?? undefined,
			centerName: assignment.center?.name,
			serialNumber: assignment.serialNumber ?? undefined,
			assetTag: assignment.assetTag ?? undefined,
			size: assignment.size ?? undefined,
			quantity: assignment.quantity,
			isPermanent: assignment.isPermanent,
			expectedReturnDate: assignment.expectedReturnDate ?? undefined,
			assignedDate: assignment.assignedDate,
			assignedBy: assignment.assignedBy,
			conditionAtAssignment: assignment.conditionAtAssignment,
			isReturned: assignment.isReturned,
			returnedDate: assignment.returnedDate ?? undefined,
			returnedTo: assignment.returnedTo ?? undefined,
			conditionAtReturn: assignment.conditionAtReturn ?? undefined,
			isLost: assignment.isLost,
			isDamaged: assignment.isDamaged,
			damageNotes: assignment.damageNotes ?? undefined,
			costRecovery: assignment.costRecovery?.toString(),
			remarks: assignment.remarks ?? undefined,
			createdAt: assignment.createdAt,
			updatedAt: assignment.updatedAt,
		};
	}
}
