import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { AmmunitionTransactionType, Prisma, PrismaClient } from "@prisma/client";
import { PaginatedResult } from "#api/common/interfaces/paginated-result.interface";
import { calculateSkip, paginate } from "#api/common/utils/pagination.util";
import { PrismaService } from "#api/database/prisma.service";
import {
	AdjustCenterAmmunitionStockDto,
	AmmunitionTransactionFilterDto,
	AmmunitionTransactionResponseDto,
	AmmunitionTypeFilterDto,
	AmmunitionTypeResponseDto,
	CenterAmmunitionStockFilterDto,
	CenterAmmunitionStockResponseDto,
	CreateAmmunitionTransactionDto,
	CreateAmmunitionTypeDto,
	CreateCenterAmmunitionStockDto,
	UpdateAmmunitionTypeDto,
	UpdateCenterAmmunitionStockDto,
} from "./dto";

type TransactionClient = Omit<PrismaClient, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">;

@Injectable()
export class AmmunitionService {
	constructor(private readonly prisma: PrismaService) {}

	async findAllTypes(
		tenantId: string,
		filter: AmmunitionTypeFilterDto,
	): Promise<PaginatedResult<AmmunitionTypeResponseDto>> {
		const { page = 1, limit = 10, search, weaponTypeId, isActive } = filter;

		const where: Prisma.AmmunitionTypeWhereInput = {
			tenantId,
			...(weaponTypeId && { weaponTypeId }),
			...(typeof isActive === "boolean" && { isActive }),
			...(search && {
				OR: [
					{ code: { contains: search, mode: "insensitive" } },
					{ name: { contains: search, mode: "insensitive" } },
					{ nameAm: { contains: search, mode: "insensitive" } },
					{ caliber: { contains: search, mode: "insensitive" } },
				],
			}),
		};

		const [types, total] = await Promise.all([
			this.prisma.ammunitionType.findMany({
				where,
				include: {
					weaponType: {
						select: { id: true, name: true },
					},
					centerStock: {
						select: { totalQuantity: true },
					},
				},
				orderBy: { name: "asc" },
				skip: calculateSkip(page, limit),
				take: limit,
			}),
			this.prisma.ammunitionType.count({ where }),
		]);

		const data = types.map((t) => this.mapTypeToResponse(t));
		return paginate(data, total, page, limit);
	}

	async findOneType(tenantId: string, id: string): Promise<AmmunitionTypeResponseDto> {
		const ammunitionType = await this.prisma.ammunitionType.findFirst({
			where: { id, tenantId },
			include: {
				weaponType: {
					select: { id: true, name: true },
				},
				centerStock: {
					select: { totalQuantity: true },
				},
			},
		});

		if (!ammunitionType) {
			throw new NotFoundException("Ammunition type not found");
		}

		return this.mapTypeToResponse(ammunitionType);
	}

	async createType(tenantId: string, dto: CreateAmmunitionTypeDto): Promise<AmmunitionTypeResponseDto> {
		if (dto.weaponTypeId) {
			const weaponType = await this.prisma.weaponType.findFirst({
				where: { id: dto.weaponTypeId, tenantId },
			});

			if (!weaponType) {
				throw new NotFoundException("Weapon type not found");
			}
		}

		const existing = await this.prisma.ammunitionType.findFirst({
			where: { tenantId, code: dto.code },
		});

		if (existing) {
			throw new BadRequestException("Ammunition type with this code already exists");
		}

		const ammunitionType = await this.prisma.ammunitionType.create({
			data: {
				tenantId,
				weaponTypeId: dto.weaponTypeId,
				code: dto.code,
				name: dto.name,
				nameAm: dto.nameAm,
				caliber: dto.caliber,
				manufacturer: dto.manufacturer,
				description: dto.description,
				isActive: dto.isActive ?? true,
			},
			include: {
				weaponType: {
					select: { id: true, name: true },
				},
				centerStock: {
					select: { totalQuantity: true },
				},
			},
		});

		return this.mapTypeToResponse(ammunitionType);
	}

	async updateType(tenantId: string, id: string, dto: UpdateAmmunitionTypeDto): Promise<AmmunitionTypeResponseDto> {
		const existing = await this.prisma.ammunitionType.findFirst({
			where: { id, tenantId },
		});

		if (!existing) {
			throw new NotFoundException("Ammunition type not found");
		}

		if (dto.weaponTypeId) {
			const weaponType = await this.prisma.weaponType.findFirst({
				where: { id: dto.weaponTypeId, tenantId },
			});

			if (!weaponType) {
				throw new NotFoundException("Weapon type not found");
			}
		}

		const ammunitionType = await this.prisma.ammunitionType.update({
			where: { id },
			data: {
				weaponTypeId: dto.weaponTypeId,
				name: dto.name,
				nameAm: dto.nameAm,
				caliber: dto.caliber,
				manufacturer: dto.manufacturer,
				description: dto.description,
				isActive: dto.isActive,
			},
			include: {
				weaponType: {
					select: { id: true, name: true },
				},
				centerStock: {
					select: { totalQuantity: true },
				},
			},
		});

		return this.mapTypeToResponse(ammunitionType);
	}

	async deleteType(tenantId: string, id: string): Promise<void> {
		const ammunitionType = await this.prisma.ammunitionType.findFirst({
			where: { id, tenantId },
			include: {
				_count: {
					select: { centerStock: true, transactions: true },
				},
			},
		});

		if (!ammunitionType) {
			throw new NotFoundException("Ammunition type not found");
		}

		if (ammunitionType._count.centerStock > 0 || ammunitionType._count.transactions > 0) {
			throw new BadRequestException("Cannot delete ammunition type with existing stock or transactions");
		}

		await this.prisma.ammunitionType.delete({ where: { id } });
	}

	async findAllStock(
		tenantId: string,
		filter: CenterAmmunitionStockFilterDto,
	): Promise<PaginatedResult<CenterAmmunitionStockResponseDto>> {
		const { page = 1, limit = 10, search, centerId, ammunitionTypeId, lowStock } = filter;

		const where: Prisma.CenterAmmunitionStockWhereInput = {
			tenantId,
			...(centerId && { centerId }),
			...(ammunitionTypeId && { ammunitionTypeId }),
			...(search && {
				ammunitionType: {
					OR: [
						{ name: { contains: search, mode: "insensitive" } },
						{ nameAm: { contains: search, mode: "insensitive" } },
						{ caliber: { contains: search, mode: "insensitive" } },
					],
				},
			}),
		};

		const [stock, total] = await Promise.all([
			this.prisma.centerAmmunitionStock.findMany({
				where,
				include: {
					center: {
						select: { id: true, name: true },
					},
					ammunitionType: {
						select: {
							id: true,
							name: true,
							nameAm: true,
							caliber: true,
						},
					},
				},
				orderBy: { createdAt: "desc" },
				skip: calculateSkip(page, limit),
				take: limit,
			}),
			this.prisma.centerAmmunitionStock.count({ where }),
		]);

		let data = stock.map((s) => this.mapStockToResponse(s));

		if (lowStock) {
			data = data.filter((s) => s.isBelowMinStock);
		}

		return paginate(data, total, page, limit);
	}

	async findStockByCenter(
		tenantId: string,
		centerId: string,
		filter: CenterAmmunitionStockFilterDto,
	): Promise<PaginatedResult<CenterAmmunitionStockResponseDto>> {
		return this.findAllStock(tenantId, { ...filter, centerId });
	}

	async findOneStock(tenantId: string, id: string): Promise<CenterAmmunitionStockResponseDto> {
		const stock = await this.prisma.centerAmmunitionStock.findFirst({
			where: { id, tenantId },
			include: {
				center: {
					select: { id: true, name: true },
				},
				ammunitionType: {
					select: {
						id: true,
						name: true,
						nameAm: true,
						caliber: true,
					},
				},
			},
		});

		if (!stock) {
			throw new NotFoundException("Ammunition stock record not found");
		}

		return this.mapStockToResponse(stock);
	}

	async createStock(tenantId: string, dto: CreateCenterAmmunitionStockDto): Promise<CenterAmmunitionStockResponseDto> {
		const center = await this.prisma.center.findFirst({
			where: { id: dto.centerId, tenantId },
		});

		if (!center) {
			throw new NotFoundException("Center not found");
		}

		const ammunitionType = await this.prisma.ammunitionType.findFirst({
			where: { id: dto.ammunitionTypeId, tenantId },
		});

		if (!ammunitionType) {
			throw new NotFoundException("Ammunition type not found");
		}

		const existing = await this.prisma.centerAmmunitionStock.findFirst({
			where: {
				centerId: dto.centerId,
				ammunitionTypeId: dto.ammunitionTypeId,
			},
		});

		if (existing) {
			throw new BadRequestException("Stock record already exists for this center and ammunition type");
		}

		const stock = await this.prisma.centerAmmunitionStock.create({
			data: {
				tenantId,
				centerId: dto.centerId,
				ammunitionTypeId: dto.ammunitionTypeId,
				totalQuantity: dto.totalQuantity,
				issuedQuantity: 0,
				availableQuantity: dto.totalQuantity,
				minStockLevel: dto.minStockLevel,
				remarks: dto.remarks,
			},
			include: {
				center: {
					select: { id: true, name: true },
				},
				ammunitionType: {
					select: {
						id: true,
						name: true,
						nameAm: true,
						caliber: true,
					},
				},
			},
		});

		return this.mapStockToResponse(stock);
	}

	async updateStock(
		tenantId: string,
		id: string,
		dto: UpdateCenterAmmunitionStockDto,
	): Promise<CenterAmmunitionStockResponseDto> {
		const existing = await this.prisma.centerAmmunitionStock.findFirst({
			where: { id, tenantId },
		});

		if (!existing) {
			throw new NotFoundException("Ammunition stock record not found");
		}

		const updateData: Prisma.CenterAmmunitionStockUpdateInput = {};

		if (dto.totalQuantity !== undefined) {
			const newAvailable = dto.totalQuantity - existing.issuedQuantity;
			if (newAvailable < 0) {
				throw new BadRequestException("Total quantity cannot be less than issued quantity");
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

		const stock = await this.prisma.centerAmmunitionStock.update({
			where: { id },
			data: updateData,
			include: {
				center: {
					select: { id: true, name: true },
				},
				ammunitionType: {
					select: {
						id: true,
						name: true,
						nameAm: true,
						caliber: true,
					},
				},
			},
		});

		return this.mapStockToResponse(stock);
	}

	async adjustStock(
		tenantId: string,
		id: string,
		dto: AdjustCenterAmmunitionStockDto,
	): Promise<CenterAmmunitionStockResponseDto> {
		const existing = await this.prisma.centerAmmunitionStock.findFirst({
			where: { id, tenantId },
		});

		if (!existing) {
			throw new NotFoundException("Ammunition stock record not found");
		}

		const newTotal = existing.totalQuantity + dto.adjustment;
		const newAvailable = existing.availableQuantity + dto.adjustment;

		if (newTotal < 0 || newAvailable < 0) {
			throw new BadRequestException("Adjustment would result in negative stock");
		}

		const stock = await this.prisma.centerAmmunitionStock.update({
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
					select: { id: true, name: true },
				},
				ammunitionType: {
					select: {
						id: true,
						name: true,
						nameAm: true,
						caliber: true,
					},
				},
			},
		});

		return this.mapStockToResponse(stock);
	}

	async getLowStockItems(
		tenantId: string,
		filter: CenterAmmunitionStockFilterDto,
	): Promise<PaginatedResult<CenterAmmunitionStockResponseDto>> {
		const { page = 1, limit = 10, centerId } = filter;

		const allStock = await this.prisma.centerAmmunitionStock.findMany({
			where: {
				tenantId,
				...(centerId && { centerId }),
				minStockLevel: { not: null },
			},
			include: {
				center: {
					select: { id: true, name: true },
				},
				ammunitionType: {
					select: {
						id: true,
						name: true,
						nameAm: true,
						caliber: true,
					},
				},
			},
		});

		const lowStockItems = allStock.filter((s) => s.minStockLevel !== null && s.availableQuantity < s.minStockLevel);

		const total = lowStockItems.length;
		const skip = calculateSkip(page, limit);
		const paginatedItems = lowStockItems.slice(skip, skip + limit);

		return paginate(
			paginatedItems.map((s) => this.mapStockToResponse(s)),
			total,
			page,
			limit,
		);
	}

	async createTransaction(
		tenantId: string,
		userId: string,
		dto: CreateAmmunitionTransactionDto,
	): Promise<AmmunitionTransactionResponseDto> {
		const ammunitionType = await this.prisma.ammunitionType.findFirst({
			where: { id: dto.ammunitionTypeId, tenantId },
		});

		if (!ammunitionType) {
			throw new NotFoundException("Ammunition type not found");
		}

		const center = await this.prisma.center.findFirst({
			where: { id: dto.centerId, tenantId },
		});

		if (!center) {
			throw new NotFoundException("Center not found");
		}

		if (dto.employeeId) {
			const employee = await this.prisma.employee.findFirst({
				where: { id: dto.employeeId, tenantId },
			});

			if (!employee) {
				throw new NotFoundException("Employee not found");
			}
		}

		const stock = await this.prisma.centerAmmunitionStock.findFirst({
			where: {
				centerId: dto.centerId,
				ammunitionTypeId: dto.ammunitionTypeId,
			},
		});

		if (!stock) {
			throw new BadRequestException("No stock record exists for this center and ammunition type");
		}

		const transaction = await this.prisma.$transaction(async (tx) => {
			const created = await tx.ammunitionTransaction.create({
				data: {
					tenantId,
					ammunitionTypeId: dto.ammunitionTypeId,
					centerId: dto.centerId,
					employeeId: dto.employeeId,
					transactionType: dto.transactionType,
					quantity: dto.quantity,
					transactionDate: new Date(dto.transactionDate),
					processedBy: userId,
					batchNumber: dto.batchNumber,
					expiryDate: dto.expiryDate ? new Date(dto.expiryDate) : undefined,
					purpose: dto.purpose,
					remarks: dto.remarks,
				},
				include: {
					ammunitionType: {
						select: { id: true, name: true, caliber: true },
					},
					center: {
						select: { id: true, name: true },
					},
					employee: {
						select: { id: true, employeeId: true, fullName: true },
					},
				},
			});

			await this.adjustStockForTransaction(tx, stock.id, dto.transactionType, dto.quantity);

			return created;
		});

		return this.mapTransactionToResponse(transaction);
	}

	async findAllTransactions(
		tenantId: string,
		filter: AmmunitionTransactionFilterDto,
	): Promise<PaginatedResult<AmmunitionTransactionResponseDto>> {
		const {
			page = 1,
			limit = 10,
			search,
			ammunitionTypeId,
			centerId,
			employeeId,
			transactionType,
			startDate,
			endDate,
		} = filter;

		const where: Prisma.AmmunitionTransactionWhereInput = {
			tenantId,
			...(ammunitionTypeId && { ammunitionTypeId }),
			...(centerId && { centerId }),
			...(employeeId && { employeeId }),
			...(transactionType && { transactionType }),
			...(startDate && { transactionDate: { gte: new Date(startDate) } }),
			...(endDate && { transactionDate: { lte: new Date(endDate) } }),
			...(search && {
				OR: [
					{ batchNumber: { contains: search, mode: "insensitive" } },
					{ purpose: { contains: search, mode: "insensitive" } },
				],
			}),
		};

		const [transactions, total] = await Promise.all([
			this.prisma.ammunitionTransaction.findMany({
				where,
				include: {
					ammunitionType: {
						select: { id: true, name: true, caliber: true },
					},
					center: {
						select: { id: true, name: true },
					},
					employee: {
						select: { id: true, employeeId: true, fullName: true },
					},
				},
				orderBy: { transactionDate: "desc" },
				skip: calculateSkip(page, limit),
				take: limit,
			}),
			this.prisma.ammunitionTransaction.count({ where }),
		]);

		const data = transactions.map((t) => this.mapTransactionToResponse(t));
		return paginate(data, total, page, limit);
	}

	async findTransactionsByEmployee(
		tenantId: string,
		employeeId: string,
		filter: AmmunitionTransactionFilterDto,
	): Promise<PaginatedResult<AmmunitionTransactionResponseDto>> {
		return this.findAllTransactions(tenantId, { ...filter, employeeId });
	}

	private async adjustStockForTransaction(
		tx: TransactionClient,
		stockId: string,
		transactionType: AmmunitionTransactionType,
		quantity: number,
	): Promise<void> {
		const stock = await tx.centerAmmunitionStock.findUnique({
			where: { id: stockId },
		});

		if (!stock) {
			throw new NotFoundException("Stock record not found");
		}

		let totalAdjustment = 0;
		let issuedAdjustment = 0;

		switch (transactionType) {
			case AmmunitionTransactionType.ISSUED:
				if (stock.availableQuantity < quantity) {
					throw new BadRequestException("Insufficient ammunition available");
				}
				issuedAdjustment = quantity;
				break;

			case AmmunitionTransactionType.RETURNED:
				issuedAdjustment = -quantity;
				break;

			case AmmunitionTransactionType.CONSUMED:
			case AmmunitionTransactionType.DAMAGED:
			case AmmunitionTransactionType.EXPIRED:
				totalAdjustment = -quantity;
				break;

			case AmmunitionTransactionType.TRANSFERRED:
				totalAdjustment = -quantity;
				break;
		}

		const newTotal = stock.totalQuantity + totalAdjustment;
		const newIssued = stock.issuedQuantity + issuedAdjustment;
		const newAvailable = newTotal - newIssued;

		if (newTotal < 0 || newIssued < 0 || newAvailable < 0) {
			throw new BadRequestException("Transaction would result in negative stock");
		}

		await tx.centerAmmunitionStock.update({
			where: { id: stockId },
			data: {
				totalQuantity: newTotal,
				issuedQuantity: newIssued,
				availableQuantity: newAvailable,
			},
		});
	}

	private mapTypeToResponse(ammunitionType: {
		id: string;
		tenantId: string;
		weaponTypeId: string | null;
		code: string;
		name: string;
		nameAm: string | null;
		caliber: string;
		manufacturer: string | null;
		description: string | null;
		isActive: boolean;
		createdAt: Date;
		updatedAt: Date;
		weaponType?: { id: string; name: string } | null;
		centerStock?: Array<{ totalQuantity: number }>;
	}): AmmunitionTypeResponseDto {
		const totalStock = ammunitionType.centerStock?.reduce((sum, s) => sum + s.totalQuantity, 0) ?? 0;

		return {
			id: ammunitionType.id,
			tenantId: ammunitionType.tenantId,
			weaponTypeId: ammunitionType.weaponTypeId ?? undefined,
			weaponTypeName: ammunitionType.weaponType?.name,
			code: ammunitionType.code,
			name: ammunitionType.name,
			nameAm: ammunitionType.nameAm ?? undefined,
			caliber: ammunitionType.caliber,
			manufacturer: ammunitionType.manufacturer ?? undefined,
			description: ammunitionType.description ?? undefined,
			isActive: ammunitionType.isActive,
			totalStock,
			createdAt: ammunitionType.createdAt,
			updatedAt: ammunitionType.updatedAt,
		};
	}

	private mapStockToResponse(stock: {
		id: string;
		tenantId: string;
		centerId: string;
		ammunitionTypeId: string;
		totalQuantity: number;
		issuedQuantity: number;
		availableQuantity: number;
		minStockLevel: number | null;
		remarks: string | null;
		createdAt: Date;
		updatedAt: Date;
		center?: { id: string; name: string };
		ammunitionType?: { id: string; name: string; nameAm: string | null; caliber: string };
	}): CenterAmmunitionStockResponseDto {
		const isBelowMinStock = stock.minStockLevel !== null && stock.availableQuantity < stock.minStockLevel;

		return {
			id: stock.id,
			tenantId: stock.tenantId,
			centerId: stock.centerId,
			centerName: stock.center?.name,
			ammunitionTypeId: stock.ammunitionTypeId,
			ammunitionTypeName: stock.ammunitionType?.name,
			ammunitionTypeNameAm: stock.ammunitionType?.nameAm ?? undefined,
			ammunitionCaliber: stock.ammunitionType?.caliber,
			totalQuantity: stock.totalQuantity,
			issuedQuantity: stock.issuedQuantity,
			availableQuantity: stock.availableQuantity,
			minStockLevel: stock.minStockLevel ?? undefined,
			isBelowMinStock,
			remarks: stock.remarks ?? undefined,
			createdAt: stock.createdAt,
			updatedAt: stock.updatedAt,
		};
	}

	private mapTransactionToResponse(transaction: {
		id: string;
		tenantId: string;
		ammunitionTypeId: string;
		centerId: string;
		employeeId: string | null;
		transactionType: AmmunitionTransactionType;
		quantity: number;
		transactionDate: Date;
		processedBy: string;
		batchNumber: string | null;
		expiryDate: Date | null;
		purpose: string | null;
		remarks: string | null;
		createdAt: Date;
		ammunitionType?: { id: string; name: string; caliber: string };
		center?: { id: string; name: string };
		employee?: { id: string; employeeId: string; fullName: string } | null;
	}): AmmunitionTransactionResponseDto {
		return {
			id: transaction.id,
			tenantId: transaction.tenantId,
			ammunitionTypeId: transaction.ammunitionTypeId,
			ammunitionTypeName: transaction.ammunitionType?.name,
			ammunitionCaliber: transaction.ammunitionType?.caliber,
			centerId: transaction.centerId,
			centerName: transaction.center?.name,
			employeeId: transaction.employeeId ?? undefined,
			employeeName: transaction.employee?.fullName,
			employeeCode: transaction.employee?.employeeId,
			transactionType: transaction.transactionType,
			quantity: transaction.quantity,
			transactionDate: transaction.transactionDate,
			processedBy: transaction.processedBy,
			batchNumber: transaction.batchNumber ?? undefined,
			expiryDate: transaction.expiryDate ?? undefined,
			purpose: transaction.purpose ?? undefined,
			remarks: transaction.remarks ?? undefined,
			createdAt: transaction.createdAt,
		};
	}
}
