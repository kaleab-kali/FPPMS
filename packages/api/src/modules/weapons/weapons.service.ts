import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { Prisma, WeaponStatus } from "@prisma/client";
import { PaginatedResult } from "#api/common/interfaces/paginated-result.interface";
import { calculateSkip, paginate } from "#api/common/utils/pagination.util";
import { PrismaService } from "#api/database/prisma.service";
import {
	CreateWeaponAssignmentDto,
	CreateWeaponCategoryDto,
	CreateWeaponDto,
	CreateWeaponTypeDto,
	ReturnWeaponDto,
	UpdateWeaponCategoryDto,
	UpdateWeaponDto,
	UpdateWeaponTypeDto,
	WeaponAssignmentResponseDto,
	WeaponCategoryFilterDto,
	WeaponCategoryResponseDto,
	WeaponFilterDto,
	WeaponResponseDto,
	WeaponTypeFilterDto,
	WeaponTypeResponseDto,
} from "./dto";

@Injectable()
export class WeaponsService {
	constructor(private readonly prisma: PrismaService) {}

	async findAllCategories(
		tenantId: string,
		filter: WeaponCategoryFilterDto,
	): Promise<PaginatedResult<WeaponCategoryResponseDto>> {
		const { page = 1, limit = 10, search, isActive } = filter;

		const where: Prisma.WeaponCategoryWhereInput = {
			tenantId,
			...(typeof isActive === "boolean" && { isActive }),
			...(search && {
				OR: [
					{ code: { contains: search, mode: "insensitive" } },
					{ name: { contains: search, mode: "insensitive" } },
					{ nameAm: { contains: search, mode: "insensitive" } },
				],
			}),
		};

		const [categories, total] = await Promise.all([
			this.prisma.weaponCategory.findMany({
				where,
				include: {
					_count: {
						select: { weaponTypes: true },
					},
				},
				orderBy: { name: "asc" },
				skip: calculateSkip(page, limit),
				take: limit,
			}),
			this.prisma.weaponCategory.count({ where }),
		]);

		const data = categories.map((c) => this.mapCategoryToResponse(c));
		return paginate(data, total, page, limit);
	}

	async findOneCategory(tenantId: string, id: string): Promise<WeaponCategoryResponseDto> {
		const category = await this.prisma.weaponCategory.findFirst({
			where: { id, tenantId },
			include: {
				_count: {
					select: { weaponTypes: true },
				},
			},
		});

		if (!category) {
			throw new NotFoundException("Weapon category not found");
		}

		return this.mapCategoryToResponse(category);
	}

	async createCategory(tenantId: string, dto: CreateWeaponCategoryDto): Promise<WeaponCategoryResponseDto> {
		const existing = await this.prisma.weaponCategory.findFirst({
			where: { tenantId, code: dto.code },
		});

		if (existing) {
			throw new BadRequestException("Weapon category with this code already exists");
		}

		const category = await this.prisma.weaponCategory.create({
			data: {
				tenantId,
				code: dto.code,
				name: dto.name,
				nameAm: dto.nameAm,
				description: dto.description,
				isActive: dto.isActive ?? true,
			},
			include: {
				_count: {
					select: { weaponTypes: true },
				},
			},
		});

		return this.mapCategoryToResponse(category);
	}

	async updateCategory(tenantId: string, id: string, dto: UpdateWeaponCategoryDto): Promise<WeaponCategoryResponseDto> {
		const existing = await this.prisma.weaponCategory.findFirst({
			where: { id, tenantId },
		});

		if (!existing) {
			throw new NotFoundException("Weapon category not found");
		}

		const category = await this.prisma.weaponCategory.update({
			where: { id },
			data: {
				name: dto.name,
				nameAm: dto.nameAm,
				description: dto.description,
				isActive: dto.isActive,
			},
			include: {
				_count: {
					select: { weaponTypes: true },
				},
			},
		});

		return this.mapCategoryToResponse(category);
	}

	async deleteCategory(tenantId: string, id: string): Promise<void> {
		const category = await this.prisma.weaponCategory.findFirst({
			where: { id, tenantId },
			include: {
				_count: {
					select: { weaponTypes: true },
				},
			},
		});

		if (!category) {
			throw new NotFoundException("Weapon category not found");
		}

		if (category._count.weaponTypes > 0) {
			throw new BadRequestException("Cannot delete category with existing weapon types");
		}

		await this.prisma.weaponCategory.delete({ where: { id } });
	}

	async findAllTypes(tenantId: string, filter: WeaponTypeFilterDto): Promise<PaginatedResult<WeaponTypeResponseDto>> {
		const { page = 1, limit = 10, search, categoryId, isActive } = filter;

		const where: Prisma.WeaponTypeWhereInput = {
			tenantId,
			...(categoryId && { categoryId }),
			...(typeof isActive === "boolean" && { isActive }),
			...(search && {
				OR: [
					{ code: { contains: search, mode: "insensitive" } },
					{ name: { contains: search, mode: "insensitive" } },
					{ nameAm: { contains: search, mode: "insensitive" } },
					{ manufacturer: { contains: search, mode: "insensitive" } },
				],
			}),
		};

		const [types, total] = await Promise.all([
			this.prisma.weaponType.findMany({
				where,
				include: {
					category: {
						select: { id: true, name: true },
					},
					_count: {
						select: { weapons: true },
					},
				},
				orderBy: { name: "asc" },
				skip: calculateSkip(page, limit),
				take: limit,
			}),
			this.prisma.weaponType.count({ where }),
		]);

		const data = types.map((t) => this.mapTypeToResponse(t));
		return paginate(data, total, page, limit);
	}

	async findOneType(tenantId: string, id: string): Promise<WeaponTypeResponseDto> {
		const weaponType = await this.prisma.weaponType.findFirst({
			where: { id, tenantId },
			include: {
				category: {
					select: { id: true, name: true },
				},
				_count: {
					select: { weapons: true },
				},
			},
		});

		if (!weaponType) {
			throw new NotFoundException("Weapon type not found");
		}

		return this.mapTypeToResponse(weaponType);
	}

	async createType(tenantId: string, dto: CreateWeaponTypeDto): Promise<WeaponTypeResponseDto> {
		const category = await this.prisma.weaponCategory.findFirst({
			where: { id: dto.categoryId, tenantId },
		});

		if (!category) {
			throw new NotFoundException("Weapon category not found");
		}

		const existing = await this.prisma.weaponType.findFirst({
			where: { tenantId, code: dto.code },
		});

		if (existing) {
			throw new BadRequestException("Weapon type with this code already exists");
		}

		const weaponType = await this.prisma.weaponType.create({
			data: {
				tenantId,
				categoryId: dto.categoryId,
				code: dto.code,
				name: dto.name,
				nameAm: dto.nameAm,
				manufacturer: dto.manufacturer,
				model: dto.model,
				caliber: dto.caliber,
				description: dto.description,
				isActive: dto.isActive ?? true,
			},
			include: {
				category: {
					select: { id: true, name: true },
				},
				_count: {
					select: { weapons: true },
				},
			},
		});

		return this.mapTypeToResponse(weaponType);
	}

	async updateType(tenantId: string, id: string, dto: UpdateWeaponTypeDto): Promise<WeaponTypeResponseDto> {
		const existing = await this.prisma.weaponType.findFirst({
			where: { id, tenantId },
		});

		if (!existing) {
			throw new NotFoundException("Weapon type not found");
		}

		if (dto.categoryId) {
			const category = await this.prisma.weaponCategory.findFirst({
				where: { id: dto.categoryId, tenantId },
			});

			if (!category) {
				throw new NotFoundException("Weapon category not found");
			}
		}

		const weaponType = await this.prisma.weaponType.update({
			where: { id },
			data: {
				categoryId: dto.categoryId,
				name: dto.name,
				nameAm: dto.nameAm,
				manufacturer: dto.manufacturer,
				model: dto.model,
				caliber: dto.caliber,
				description: dto.description,
				isActive: dto.isActive,
			},
			include: {
				category: {
					select: { id: true, name: true },
				},
				_count: {
					select: { weapons: true },
				},
			},
		});

		return this.mapTypeToResponse(weaponType);
	}

	async deleteType(tenantId: string, id: string): Promise<void> {
		const weaponType = await this.prisma.weaponType.findFirst({
			where: { id, tenantId },
			include: {
				_count: {
					select: { weapons: true },
				},
			},
		});

		if (!weaponType) {
			throw new NotFoundException("Weapon type not found");
		}

		if (weaponType._count.weapons > 0) {
			throw new BadRequestException("Cannot delete weapon type with existing weapons");
		}

		await this.prisma.weaponType.delete({ where: { id } });
	}

	async findAllWeapons(tenantId: string, filter: WeaponFilterDto): Promise<PaginatedResult<WeaponResponseDto>> {
		const {
			page = 1,
			limit = 10,
			search,
			weaponTypeId,
			categoryId,
			centerId,
			status,
			condition,
			isActive,
			dueForInspection,
			isAssigned,
		} = filter;

		const today = new Date();
		today.setHours(0, 0, 0, 0);

		const where: Prisma.WeaponWhereInput = {
			tenantId,
			...(weaponTypeId && { weaponTypeId }),
			...(categoryId && { weaponType: { categoryId } }),
			...(centerId && { centerId }),
			...(status && { status }),
			...(condition && { condition }),
			...(typeof isActive === "boolean" && { isActive }),
			...(dueForInspection && {
				nextInspectionDate: { lte: today },
			}),
			...(typeof isAssigned === "boolean" && {
				status: isAssigned ? WeaponStatus.ASSIGNED : { not: WeaponStatus.ASSIGNED },
			}),
			...(search && {
				OR: [
					{ serialNumber: { contains: search, mode: "insensitive" } },
					{ registrationNumber: { contains: search, mode: "insensitive" } },
				],
			}),
		};

		const [weapons, total] = await Promise.all([
			this.prisma.weapon.findMany({
				where,
				include: {
					weaponType: {
						select: {
							id: true,
							name: true,
							nameAm: true,
							category: {
								select: { id: true, name: true },
							},
						},
					},
					center: {
						select: { id: true, name: true },
					},
					assignments: {
						where: { isReturned: false },
						include: {
							employee: {
								select: { id: true, employeeId: true, fullName: true },
							},
						},
						take: 1,
					},
				},
				orderBy: { createdAt: "desc" },
				skip: calculateSkip(page, limit),
				take: limit,
			}),
			this.prisma.weapon.count({ where }),
		]);

		const data = weapons.map((w) => this.mapWeaponToResponse(w));
		return paginate(data, total, page, limit);
	}

	async findOneWeapon(tenantId: string, id: string): Promise<WeaponResponseDto> {
		const weapon = await this.prisma.weapon.findFirst({
			where: { id, tenantId },
			include: {
				weaponType: {
					select: {
						id: true,
						name: true,
						nameAm: true,
						category: {
							select: { id: true, name: true },
						},
					},
				},
				center: {
					select: { id: true, name: true },
				},
				assignments: {
					where: { isReturned: false },
					include: {
						employee: {
							select: { id: true, employeeId: true, fullName: true },
						},
					},
					take: 1,
				},
			},
		});

		if (!weapon) {
			throw new NotFoundException("Weapon not found");
		}

		return this.mapWeaponToResponse(weapon);
	}

	async createWeapon(tenantId: string, dto: CreateWeaponDto): Promise<WeaponResponseDto> {
		const weaponType = await this.prisma.weaponType.findFirst({
			where: { id: dto.weaponTypeId, tenantId },
		});

		if (!weaponType) {
			throw new NotFoundException("Weapon type not found");
		}

		if (dto.centerId) {
			const center = await this.prisma.center.findFirst({
				where: { id: dto.centerId, tenantId },
			});

			if (!center) {
				throw new NotFoundException("Center not found");
			}
		}

		const existing = await this.prisma.weapon.findFirst({
			where: { tenantId, serialNumber: dto.serialNumber },
		});

		if (existing) {
			throw new BadRequestException("Weapon with this serial number already exists");
		}

		const weapon = await this.prisma.weapon.create({
			data: {
				tenantId,
				weaponTypeId: dto.weaponTypeId,
				centerId: dto.centerId,
				serialNumber: dto.serialNumber,
				registrationNumber: dto.registrationNumber,
				manufactureYear: dto.manufactureYear,
				acquisitionDate: dto.acquisitionDate ? new Date(dto.acquisitionDate) : undefined,
				acquisitionMethod: dto.acquisitionMethod,
				purchasePrice: dto.purchasePrice ? new Prisma.Decimal(dto.purchasePrice) : undefined,
				status: dto.status ?? WeaponStatus.IN_SERVICE,
				condition: dto.condition,
				lastInspectionDate: dto.lastInspectionDate ? new Date(dto.lastInspectionDate) : undefined,
				nextInspectionDate: dto.nextInspectionDate ? new Date(dto.nextInspectionDate) : undefined,
				lastMaintenanceDate: dto.lastMaintenanceDate ? new Date(dto.lastMaintenanceDate) : undefined,
				remarks: dto.remarks,
			},
			include: {
				weaponType: {
					select: {
						id: true,
						name: true,
						nameAm: true,
						category: {
							select: { id: true, name: true },
						},
					},
				},
				center: {
					select: { id: true, name: true },
				},
				assignments: {
					where: { isReturned: false },
					include: {
						employee: {
							select: { id: true, employeeId: true, fullName: true },
						},
					},
					take: 1,
				},
			},
		});

		return this.mapWeaponToResponse(weapon);
	}

	async updateWeapon(tenantId: string, id: string, dto: UpdateWeaponDto): Promise<WeaponResponseDto> {
		const existing = await this.prisma.weapon.findFirst({
			where: { id, tenantId },
		});

		if (!existing) {
			throw new NotFoundException("Weapon not found");
		}

		if (dto.weaponTypeId) {
			const weaponType = await this.prisma.weaponType.findFirst({
				where: { id: dto.weaponTypeId, tenantId },
			});

			if (!weaponType) {
				throw new NotFoundException("Weapon type not found");
			}
		}

		if (dto.centerId) {
			const center = await this.prisma.center.findFirst({
				where: { id: dto.centerId, tenantId },
			});

			if (!center) {
				throw new NotFoundException("Center not found");
			}
		}

		const weapon = await this.prisma.weapon.update({
			where: { id },
			data: {
				weaponTypeId: dto.weaponTypeId,
				centerId: dto.centerId,
				registrationNumber: dto.registrationNumber,
				manufactureYear: dto.manufactureYear,
				acquisitionDate: dto.acquisitionDate ? new Date(dto.acquisitionDate) : undefined,
				acquisitionMethod: dto.acquisitionMethod,
				purchasePrice: dto.purchasePrice ? new Prisma.Decimal(dto.purchasePrice) : undefined,
				status: dto.status,
				condition: dto.condition,
				lastInspectionDate: dto.lastInspectionDate ? new Date(dto.lastInspectionDate) : undefined,
				nextInspectionDate: dto.nextInspectionDate ? new Date(dto.nextInspectionDate) : undefined,
				lastMaintenanceDate: dto.lastMaintenanceDate ? new Date(dto.lastMaintenanceDate) : undefined,
				remarks: dto.remarks,
				isActive: dto.isActive,
			},
			include: {
				weaponType: {
					select: {
						id: true,
						name: true,
						nameAm: true,
						category: {
							select: { id: true, name: true },
						},
					},
				},
				center: {
					select: { id: true, name: true },
				},
				assignments: {
					where: { isReturned: false },
					include: {
						employee: {
							select: { id: true, employeeId: true, fullName: true },
						},
					},
					take: 1,
				},
			},
		});

		return this.mapWeaponToResponse(weapon);
	}

	async assignWeapon(
		tenantId: string,
		userId: string,
		dto: CreateWeaponAssignmentDto,
	): Promise<WeaponAssignmentResponseDto> {
		const weapon = await this.prisma.weapon.findFirst({
			where: { id: dto.weaponId, tenantId },
		});

		if (!weapon) {
			throw new NotFoundException("Weapon not found");
		}

		if (weapon.status === WeaponStatus.ASSIGNED) {
			throw new BadRequestException("Weapon is already assigned");
		}

		if (weapon.status !== WeaponStatus.IN_SERVICE) {
			throw new BadRequestException(`Cannot assign weapon with status ${weapon.status}`);
		}

		const employee = await this.prisma.employee.findFirst({
			where: { id: dto.employeeId, tenantId },
		});

		if (!employee) {
			throw new NotFoundException("Employee not found");
		}

		const assignment = await this.prisma.$transaction(async (tx) => {
			const created = await tx.weaponAssignment.create({
				data: {
					tenantId,
					weaponId: dto.weaponId,
					employeeId: dto.employeeId,
					assignedDate: new Date(dto.assignedDate),
					assignedBy: userId,
					expectedReturnDate: dto.expectedReturnDate ? new Date(dto.expectedReturnDate) : undefined,
					conditionAtAssignment: dto.conditionAtAssignment,
					issuedRounds: dto.issuedRounds,
					purpose: dto.purpose,
					remarks: dto.remarks,
				},
				include: {
					weapon: {
						include: {
							weaponType: {
								select: {
									name: true,
									category: { select: { name: true } },
								},
							},
						},
					},
					employee: {
						select: { id: true, employeeId: true, fullName: true },
					},
				},
			});

			await tx.weapon.update({
				where: { id: dto.weaponId },
				data: { status: WeaponStatus.ASSIGNED },
			});

			return created;
		});

		return this.mapAssignmentToResponse(assignment);
	}

	async returnWeapon(
		tenantId: string,
		assignmentId: string,
		userId: string,
		dto: ReturnWeaponDto,
	): Promise<WeaponAssignmentResponseDto> {
		const existing = await this.prisma.weaponAssignment.findFirst({
			where: { id: assignmentId, tenantId },
		});

		if (!existing) {
			throw new NotFoundException("Weapon assignment not found");
		}

		if (existing.isReturned) {
			throw new BadRequestException("Weapon has already been returned");
		}

		const assignment = await this.prisma.$transaction(async (tx) => {
			const updated = await tx.weaponAssignment.update({
				where: { id: assignmentId },
				data: {
					isReturned: true,
					returnedDate: dto.returnedDate ? new Date(dto.returnedDate) : new Date(),
					returnedTo: userId,
					conditionAtReturn: dto.conditionAtReturn,
					returnedRounds: dto.returnedRounds,
					remarks: dto.remarks ? `${existing.remarks ?? ""}\nReturn: ${dto.remarks}`.trim() : existing.remarks,
				},
				include: {
					weapon: {
						include: {
							weaponType: {
								select: {
									name: true,
									category: { select: { name: true } },
								},
							},
						},
					},
					employee: {
						select: { id: true, employeeId: true, fullName: true },
					},
				},
			});

			await tx.weapon.update({
				where: { id: existing.weaponId },
				data: {
					status: WeaponStatus.IN_SERVICE,
					condition: dto.conditionAtReturn,
				},
			});

			return updated;
		});

		return this.mapAssignmentToResponse(assignment);
	}

	async findAssignmentsByEmployee(
		tenantId: string,
		employeeId: string,
		isReturned?: boolean,
	): Promise<WeaponAssignmentResponseDto[]> {
		const assignments = await this.prisma.weaponAssignment.findMany({
			where: {
				tenantId,
				employeeId,
				...(typeof isReturned === "boolean" && { isReturned }),
			},
			include: {
				weapon: {
					include: {
						weaponType: {
							select: {
								name: true,
								category: { select: { name: true } },
							},
						},
					},
				},
				employee: {
					select: { id: true, employeeId: true, fullName: true },
				},
			},
			orderBy: { assignedDate: "desc" },
		});

		return assignments.map((a) => this.mapAssignmentToResponse(a));
	}

	async findAssignmentsByWeapon(tenantId: string, weaponId: string): Promise<WeaponAssignmentResponseDto[]> {
		const assignments = await this.prisma.weaponAssignment.findMany({
			where: { tenantId, weaponId },
			include: {
				weapon: {
					include: {
						weaponType: {
							select: {
								name: true,
								category: { select: { name: true } },
							},
						},
					},
				},
				employee: {
					select: { id: true, employeeId: true, fullName: true },
				},
			},
			orderBy: { assignedDate: "desc" },
		});

		return assignments.map((a) => this.mapAssignmentToResponse(a));
	}

	private mapCategoryToResponse(category: {
		id: string;
		tenantId: string;
		code: string;
		name: string;
		nameAm: string | null;
		description: string | null;
		isActive: boolean;
		createdAt: Date;
		updatedAt: Date;
		_count?: { weaponTypes: number };
	}): WeaponCategoryResponseDto {
		return {
			id: category.id,
			tenantId: category.tenantId,
			code: category.code,
			name: category.name,
			nameAm: category.nameAm ?? undefined,
			description: category.description ?? undefined,
			isActive: category.isActive,
			weaponTypeCount: category._count?.weaponTypes ?? 0,
			createdAt: category.createdAt,
			updatedAt: category.updatedAt,
		};
	}

	private mapTypeToResponse(weaponType: {
		id: string;
		tenantId: string;
		categoryId: string;
		code: string;
		name: string;
		nameAm: string | null;
		manufacturer: string | null;
		model: string | null;
		caliber: string | null;
		description: string | null;
		isActive: boolean;
		createdAt: Date;
		updatedAt: Date;
		category?: { id: string; name: string };
		_count?: { weapons: number };
	}): WeaponTypeResponseDto {
		return {
			id: weaponType.id,
			tenantId: weaponType.tenantId,
			categoryId: weaponType.categoryId,
			categoryName: weaponType.category?.name,
			code: weaponType.code,
			name: weaponType.name,
			nameAm: weaponType.nameAm ?? undefined,
			manufacturer: weaponType.manufacturer ?? undefined,
			model: weaponType.model ?? undefined,
			caliber: weaponType.caliber ?? undefined,
			description: weaponType.description ?? undefined,
			isActive: weaponType.isActive,
			weaponCount: weaponType._count?.weapons ?? 0,
			createdAt: weaponType.createdAt,
			updatedAt: weaponType.updatedAt,
		};
	}

	private mapWeaponToResponse(weapon: {
		id: string;
		tenantId: string;
		weaponTypeId: string;
		centerId: string | null;
		serialNumber: string;
		registrationNumber: string | null;
		manufactureYear: number | null;
		acquisitionDate: Date | null;
		acquisitionMethod: string | null;
		purchasePrice: Prisma.Decimal | null;
		status: WeaponStatus;
		condition: string;
		lastInspectionDate: Date | null;
		nextInspectionDate: Date | null;
		lastMaintenanceDate: Date | null;
		remarks: string | null;
		isActive: boolean;
		createdAt: Date;
		updatedAt: Date;
		weaponType?: {
			id: string;
			name: string;
			nameAm: string | null;
			category: { id: string; name: string };
		};
		center?: { id: string; name: string } | null;
		assignments?: Array<{
			id: string;
			assignedDate: Date;
			employee: { id: string; employeeId: string; fullName: string };
		}>;
	}): WeaponResponseDto {
		const currentAssignment = weapon.assignments?.[0];

		return {
			id: weapon.id,
			tenantId: weapon.tenantId,
			weaponTypeId: weapon.weaponTypeId,
			weaponTypeName: weapon.weaponType?.name,
			weaponTypeNameAm: weapon.weaponType?.nameAm ?? undefined,
			categoryId: weapon.weaponType?.category.id,
			categoryName: weapon.weaponType?.category.name,
			centerId: weapon.centerId ?? undefined,
			centerName: weapon.center?.name,
			serialNumber: weapon.serialNumber,
			registrationNumber: weapon.registrationNumber ?? undefined,
			manufactureYear: weapon.manufactureYear ?? undefined,
			acquisitionDate: weapon.acquisitionDate ?? undefined,
			acquisitionMethod: weapon.acquisitionMethod ?? undefined,
			purchasePrice: weapon.purchasePrice?.toString(),
			status: weapon.status,
			condition: weapon.condition as WeaponResponseDto["condition"],
			lastInspectionDate: weapon.lastInspectionDate ?? undefined,
			nextInspectionDate: weapon.nextInspectionDate ?? undefined,
			lastMaintenanceDate: weapon.lastMaintenanceDate ?? undefined,
			remarks: weapon.remarks ?? undefined,
			isActive: weapon.isActive,
			currentAssignment: currentAssignment
				? {
						id: currentAssignment.id,
						employeeId: currentAssignment.employee.id,
						employeeName: currentAssignment.employee.fullName,
						employeeCode: currentAssignment.employee.employeeId,
						assignedDate: currentAssignment.assignedDate,
					}
				: undefined,
			createdAt: weapon.createdAt,
			updatedAt: weapon.updatedAt,
		};
	}

	private mapAssignmentToResponse(assignment: {
		id: string;
		tenantId: string;
		weaponId: string;
		employeeId: string;
		assignedDate: Date;
		assignedBy: string;
		expectedReturnDate: Date | null;
		conditionAtAssignment: string;
		issuedRounds: number | null;
		isReturned: boolean;
		returnedDate: Date | null;
		returnedTo: string | null;
		conditionAtReturn: string | null;
		returnedRounds: number | null;
		purpose: string | null;
		remarks: string | null;
		createdAt: Date;
		updatedAt: Date;
		weapon?: {
			serialNumber: string;
			weaponType?: {
				name: string;
				category: { name: string };
			};
		};
		employee?: { id: string; employeeId: string; fullName: string };
	}): WeaponAssignmentResponseDto {
		return {
			id: assignment.id,
			tenantId: assignment.tenantId,
			weaponId: assignment.weaponId,
			weaponSerialNumber: assignment.weapon?.serialNumber,
			weaponTypeName: assignment.weapon?.weaponType?.name,
			weaponCategoryName: assignment.weapon?.weaponType?.category.name,
			employeeId: assignment.employeeId,
			employeeName: assignment.employee?.fullName,
			employeeCode: assignment.employee?.employeeId,
			assignedDate: assignment.assignedDate,
			assignedBy: assignment.assignedBy,
			expectedReturnDate: assignment.expectedReturnDate ?? undefined,
			conditionAtAssignment: assignment.conditionAtAssignment as WeaponAssignmentResponseDto["conditionAtAssignment"],
			issuedRounds: assignment.issuedRounds ?? undefined,
			isReturned: assignment.isReturned,
			returnedDate: assignment.returnedDate ?? undefined,
			returnedTo: assignment.returnedTo ?? undefined,
			conditionAtReturn: assignment.conditionAtReturn
				? (assignment.conditionAtReturn as WeaponAssignmentResponseDto["conditionAtReturn"])
				: undefined,
			returnedRounds: assignment.returnedRounds ?? undefined,
			purpose: assignment.purpose ?? undefined,
			remarks: assignment.remarks ?? undefined,
			createdAt: assignment.createdAt,
			updatedAt: assignment.updatedAt,
		};
	}
}
