import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { Prisma, PrismaClient } from "@prisma/client";
import { PaginatedResult } from "#api/common/interfaces/paginated-result.interface";
import { calculateSkip, paginate } from "#api/common/utils/pagination.util";
import { PrismaService } from "#api/database/prisma.service";
import {
	AdjustCenterInventoryDto,
	CenterInventoryFilterDto,
	CenterInventoryResponseDto,
	CreateCenterInventoryDto,
	UpdateCenterInventoryDto,
} from "./dto";

type TransactionClient = Omit<PrismaClient, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">;

@Injectable()
export class CenterInventoryService {
	constructor(private readonly prisma: PrismaService) {}

	async findAll(
		tenantId: string,
		filter: CenterInventoryFilterDto,
	): Promise<PaginatedResult<CenterInventoryResponseDto>> {
		const { page = 1, limit = 10, centerId, itemTypeId, categoryId, lowStock, search } = filter;

		const where: Prisma.CenterInventoryWhereInput = {
			tenantId,
			...(centerId && { centerId }),
			...(itemTypeId && { itemTypeId }),
			...(categoryId && { itemType: { categoryId } }),
			...(search && {
				itemType: {
					OR: [
						{ name: { contains: search, mode: "insensitive" } },
						{ nameAm: { contains: search, mode: "insensitive" } },
					],
				},
			}),
		};

		const [inventory, total] = await Promise.all([
			this.prisma.centerInventory.findMany({
				where,
				include: {
					center: {
						select: {
							id: true,
							name: true,
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
				},
				orderBy: { createdAt: "desc" },
				skip: calculateSkip(page, limit),
				take: limit,
			}),
			this.prisma.centerInventory.count({ where }),
		]);

		let data = inventory.map((i) => this.mapToResponse(i));

		if (lowStock) {
			data = data.filter((i) => i.isBelowMinStock);
		}

		return paginate(data, total, page, limit);
	}

	async findByCenter(
		tenantId: string,
		centerId: string,
		filter: CenterInventoryFilterDto,
	): Promise<PaginatedResult<CenterInventoryResponseDto>> {
		return this.findAll(tenantId, { ...filter, centerId });
	}

	async findOne(tenantId: string, id: string): Promise<CenterInventoryResponseDto> {
		const inventory = await this.prisma.centerInventory.findFirst({
			where: { id, tenantId },
			include: {
				center: {
					select: {
						id: true,
						name: true,
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
			},
		});

		if (!inventory) {
			throw new NotFoundException("Center inventory not found");
		}

		return this.mapToResponse(inventory);
	}

	async create(tenantId: string, dto: CreateCenterInventoryDto): Promise<CenterInventoryResponseDto> {
		const center = await this.prisma.center.findFirst({
			where: { id: dto.centerId, tenantId },
		});

		if (!center) {
			throw new NotFoundException("Center not found");
		}

		const itemType = await this.prisma.inventoryItemType.findFirst({
			where: { id: dto.itemTypeId, tenantId },
		});

		if (!itemType) {
			throw new NotFoundException("Item type not found");
		}

		const existing = await this.prisma.centerInventory.findFirst({
			where: {
				centerId: dto.centerId,
				itemTypeId: dto.itemTypeId,
			},
		});

		if (existing) {
			throw new BadRequestException("Inventory record already exists for this center and item type");
		}

		const inventory = await this.prisma.centerInventory.create({
			data: {
				tenantId,
				centerId: dto.centerId,
				itemTypeId: dto.itemTypeId,
				totalQuantity: dto.totalQuantity,
				assignedQuantity: 0,
				availableQuantity: dto.totalQuantity,
				minStockLevel: dto.minStockLevel,
				remarks: dto.remarks,
			},
			include: {
				center: {
					select: {
						id: true,
						name: true,
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
			},
		});

		return this.mapToResponse(inventory);
	}

	async update(tenantId: string, id: string, dto: UpdateCenterInventoryDto): Promise<CenterInventoryResponseDto> {
		const existing = await this.prisma.centerInventory.findFirst({
			where: { id, tenantId },
		});

		if (!existing) {
			throw new NotFoundException("Center inventory not found");
		}

		const updateData: Prisma.CenterInventoryUpdateInput = {};

		if (dto.totalQuantity !== undefined) {
			const newAvailable = dto.totalQuantity - existing.assignedQuantity;
			if (newAvailable < 0) {
				throw new BadRequestException("Total quantity cannot be less than assigned quantity");
			}
			updateData.totalQuantity = dto.totalQuantity;
			updateData.availableQuantity = newAvailable;
		}

		if (dto.minStockLevel !== undefined) {
			updateData.minStockLevel = dto.minStockLevel;
		}

		if (dto.remarks !== undefined) {
			updateData.remarks = dto.remarks;
		}

		const inventory = await this.prisma.centerInventory.update({
			where: { id },
			data: updateData,
			include: {
				center: {
					select: {
						id: true,
						name: true,
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
			},
		});

		return this.mapToResponse(inventory);
	}

	async adjust(tenantId: string, id: string, dto: AdjustCenterInventoryDto): Promise<CenterInventoryResponseDto> {
		const existing = await this.prisma.centerInventory.findFirst({
			where: { id, tenantId },
		});

		if (!existing) {
			throw new NotFoundException("Center inventory not found");
		}

		const newTotal = existing.totalQuantity + dto.adjustment;
		const newAvailable = existing.availableQuantity + dto.adjustment;

		if (newTotal < 0 || newAvailable < 0) {
			throw new BadRequestException("Adjustment would result in negative inventory");
		}

		const inventory = await this.prisma.centerInventory.update({
			where: { id },
			data: {
				totalQuantity: newTotal,
				availableQuantity: newAvailable,
				remarks: dto.reason
					? `${existing.remarks ?? ""}\nAdjustment: ${dto.adjustment} - ${dto.reason}`.trim()
					: existing.remarks,
			},
			include: {
				center: {
					select: {
						id: true,
						name: true,
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
			},
		});

		return this.mapToResponse(inventory);
	}

	async checkAvailability(tenantId: string, centerId: string, itemTypeId: string, quantity: number): Promise<boolean> {
		const inventory = await this.prisma.centerInventory.findFirst({
			where: {
				tenantId,
				centerId,
				itemTypeId,
			},
		});

		if (!inventory) {
			return false;
		}

		return inventory.availableQuantity >= quantity;
	}

	async adjustAssignedQuantity(
		tx: TransactionClient,
		tenantId: string,
		centerId: string,
		itemTypeId: string,
		quantityChange: number,
	): Promise<void> {
		const inventory = await tx.centerInventory.findFirst({
			where: {
				tenantId,
				centerId,
				itemTypeId,
			},
		});

		if (!inventory) {
			return;
		}

		const newAssigned = inventory.assignedQuantity + quantityChange;
		const newAvailable = inventory.totalQuantity - newAssigned;

		if (newAssigned < 0 || newAvailable < 0) {
			throw new BadRequestException("Invalid inventory adjustment");
		}

		await tx.centerInventory.update({
			where: { id: inventory.id },
			data: {
				assignedQuantity: newAssigned,
				availableQuantity: newAvailable,
			},
		});
	}

	async getLowStockItems(
		tenantId: string,
		filter: CenterInventoryFilterDto,
	): Promise<PaginatedResult<CenterInventoryResponseDto>> {
		const { page = 1, limit = 10, centerId } = filter;

		const allInventory = await this.prisma.centerInventory.findMany({
			where: {
				tenantId,
				...(centerId && { centerId }),
				minStockLevel: { not: null },
			},
			include: {
				center: {
					select: {
						id: true,
						name: true,
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
			},
		});

		const lowStockItems = allInventory.filter((i) => i.minStockLevel !== null && i.availableQuantity < i.minStockLevel);

		const total = lowStockItems.length;
		const skip = calculateSkip(page, limit);
		const paginatedItems = lowStockItems.slice(skip, skip + limit);

		return paginate(
			paginatedItems.map((i) => this.mapToResponse(i)),
			total,
			page,
			limit,
		);
	}

	private mapToResponse(inventory: {
		id: string;
		tenantId: string;
		centerId: string;
		itemTypeId: string;
		totalQuantity: number;
		assignedQuantity: number;
		availableQuantity: number;
		minStockLevel: number | null;
		remarks: string | null;
		createdAt: Date;
		updatedAt: Date;
		center?: { id: string; name: string };
		itemType?: { id: string; name: string; nameAm: string | null; category: { name: string } };
	}): CenterInventoryResponseDto {
		const isBelowMinStock = inventory.minStockLevel !== null && inventory.availableQuantity < inventory.minStockLevel;

		return {
			id: inventory.id,
			tenantId: inventory.tenantId,
			centerId: inventory.centerId,
			centerName: inventory.center?.name,
			itemTypeId: inventory.itemTypeId,
			itemTypeName: inventory.itemType?.name,
			itemTypeNameAm: inventory.itemType?.nameAm ?? undefined,
			categoryName: inventory.itemType?.category.name,
			totalQuantity: inventory.totalQuantity,
			assignedQuantity: inventory.assignedQuantity,
			availableQuantity: inventory.availableQuantity,
			minStockLevel: inventory.minStockLevel ?? undefined,
			isBelowMinStock,
			remarks: inventory.remarks ?? undefined,
			createdAt: inventory.createdAt,
			updatedAt: inventory.updatedAt,
		};
	}
}
