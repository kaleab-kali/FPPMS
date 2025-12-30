import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { EmployeeStatus, Prisma, TransferSource, TransferStatus } from "@prisma/client";
import { canAccessAllCenters, validateCenterAccess } from "#api/common/utils/access-scope.util";
import { PrismaService } from "#api/database/prisma.service";
import {
	AcceptTransferDto,
	CancelTransferDto,
	CreateDepartureDto,
	CreateTransferRequestDto,
	RejectTransferDto,
	UpdateDepartureDto,
} from "#api/modules/employees/dto";

export interface AccessContext {
	centerId?: string;
	effectiveAccessScope: string;
}

const TRANSFER_INCLUDE = {
	employee: {
		select: {
			id: true,
			employeeId: true,
			fullName: true,
			fullNameAm: true,
		},
	},
	fromCenter: {
		select: { id: true, name: true, nameAm: true },
	},
	toCenter: {
		select: { id: true, name: true, nameAm: true },
	},
	fromDepartment: {
		select: { id: true, name: true, nameAm: true },
	},
	toDepartment: {
		select: { id: true, name: true, nameAm: true },
	},
	fromPosition: {
		select: { id: true, name: true, nameAm: true },
	},
	toPosition: {
		select: { id: true, name: true, nameAm: true },
	},
} as const;

@Injectable()
export class EmployeeTransferService {
	constructor(private readonly prisma: PrismaService) {}

	async createTransferRequest(
		tenantId: string,
		dto: CreateTransferRequestDto,
		initiatedBy: string,
		accessContext: AccessContext,
	) {
		const employee = await this.prisma.employee.findFirst({
			where: { id: dto.employeeId, tenantId, deletedAt: null },
		});

		if (!employee) {
			throw new NotFoundException("Employee not found");
		}

		validateCenterAccess(accessContext.centerId, employee.centerId ?? undefined, accessContext.effectiveAccessScope);

		if (employee.status !== EmployeeStatus.ACTIVE) {
			throw new BadRequestException("Only active employees can be transferred");
		}

		if (!employee.centerId) {
			throw new BadRequestException("Employee must be assigned to a center before transfer");
		}

		if (employee.centerId === dto.toCenterId) {
			throw new BadRequestException("Employee is already in the target center");
		}

		const toCenter = await this.prisma.center.findFirst({
			where: { id: dto.toCenterId, tenantId, deletedAt: null },
		});

		if (!toCenter) {
			throw new NotFoundException("Target center not found");
		}

		if (dto.toDepartmentId) {
			const department = await this.prisma.department.findFirst({
				where: { id: dto.toDepartmentId, tenantId },
			});
			if (!department) {
				throw new NotFoundException("Target department not found");
			}
		}

		if (dto.toPositionId) {
			const position = await this.prisma.position.findFirst({
				where: { id: dto.toPositionId, tenantId },
			});
			if (!position) {
				throw new NotFoundException("Target position not found");
			}
		}

		const existingPending = await this.prisma.employeeTransferRequest.findFirst({
			where: {
				employeeId: dto.employeeId,
				status: TransferStatus.PENDING,
			},
		});

		if (existingPending) {
			throw new BadRequestException("Employee already has a pending transfer request");
		}

		return this.prisma.employeeTransferRequest.create({
			data: {
				tenantId,
				employeeId: dto.employeeId,
				transferSource: TransferSource.MANUAL,
				status: TransferStatus.PENDING,
				fromCenterId: employee.centerId,
				fromDepartmentId: employee.departmentId,
				fromPositionId: employee.positionId,
				toCenterId: dto.toCenterId,
				toDepartmentId: dto.toDepartmentId,
				toPositionId: dto.toPositionId,
				effectiveDate: dto.effectiveDate,
				transferReason: dto.transferReason,
				remarks: dto.remarks,
				orderNumber: dto.orderNumber,
				initiatedBy,
			},
			include: TRANSFER_INCLUDE,
		});
	}

	async acceptTransfer(
		tenantId: string,
		transferId: string,
		dto: AcceptTransferDto,
		reviewedBy: string,
		accessContext: AccessContext,
	) {
		const transfer = await this.prisma.employeeTransferRequest.findFirst({
			where: { id: transferId, tenantId },
			include: { employee: true },
		});

		if (!transfer) {
			throw new NotFoundException("Transfer request not found");
		}

		validateCenterAccess(accessContext.centerId, transfer.toCenterId ?? undefined, accessContext.effectiveAccessScope);

		if (transfer.status !== TransferStatus.PENDING) {
			throw new BadRequestException(`Transfer request is already ${transfer.status.toLowerCase()}`);
		}

		if (dto.departmentId) {
			const department = await this.prisma.department.findFirst({
				where: { id: dto.departmentId, tenantId },
			});
			if (!department) {
				throw new NotFoundException("Department not found");
			}
		}

		if (dto.positionId) {
			const position = await this.prisma.position.findFirst({
				where: { id: dto.positionId, tenantId },
			});
			if (!position) {
				throw new NotFoundException("Position not found");
			}
		}

		const finalDepartmentId = dto.departmentId ?? transfer.toDepartmentId ?? transfer.fromDepartmentId;
		const finalPositionId = dto.positionId ?? transfer.toPositionId ?? transfer.fromPositionId;

		const [updatedTransfer] = await this.prisma.$transaction([
			this.prisma.employeeTransferRequest.update({
				where: { id: transferId },
				data: {
					status: TransferStatus.ACCEPTED,
					toDepartmentId: finalDepartmentId,
					toPositionId: finalPositionId,
					reviewedBy,
					reviewedAt: new Date(),
					completedAt: new Date(),
					remarks: dto.remarks ? `${transfer.remarks ?? ""}\n\nAcceptance remarks: ${dto.remarks}` : transfer.remarks,
				},
				include: TRANSFER_INCLUDE,
			}),
			this.prisma.employee.update({
				where: { id: transfer.employeeId },
				data: {
					centerId: transfer.toCenterId,
					departmentId: finalDepartmentId,
					positionId: finalPositionId,
					updatedBy: reviewedBy,
				},
			}),
		]);

		return updatedTransfer;
	}

	async rejectTransfer(
		tenantId: string,
		transferId: string,
		dto: RejectTransferDto,
		reviewedBy: string,
		accessContext: AccessContext,
	) {
		const transfer = await this.prisma.employeeTransferRequest.findFirst({
			where: { id: transferId, tenantId },
		});

		if (!transfer) {
			throw new NotFoundException("Transfer request not found");
		}

		validateCenterAccess(accessContext.centerId, transfer.toCenterId ?? undefined, accessContext.effectiveAccessScope);

		if (transfer.status !== TransferStatus.PENDING) {
			throw new BadRequestException(`Transfer request is already ${transfer.status.toLowerCase()}`);
		}

		return this.prisma.employeeTransferRequest.update({
			where: { id: transferId },
			data: {
				status: TransferStatus.REJECTED,
				rejectionReason: dto.rejectionReason,
				reviewedBy,
				reviewedAt: new Date(),
			},
			include: TRANSFER_INCLUDE,
		});
	}

	async cancelTransfer(
		tenantId: string,
		transferId: string,
		dto: CancelTransferDto,
		cancelledBy: string,
		accessContext: AccessContext,
	) {
		const transfer = await this.prisma.employeeTransferRequest.findFirst({
			where: { id: transferId, tenantId },
		});

		if (!transfer) {
			throw new NotFoundException("Transfer request not found");
		}

		validateCenterAccess(
			accessContext.centerId,
			transfer.fromCenterId ?? undefined,
			accessContext.effectiveAccessScope,
		);

		if (transfer.status !== TransferStatus.PENDING) {
			throw new BadRequestException(`Only pending transfers can be cancelled`);
		}

		return this.prisma.employeeTransferRequest.update({
			where: { id: transferId },
			data: {
				status: TransferStatus.CANCELLED,
				rejectionReason: dto.cancellationReason,
				reviewedBy: cancelledBy,
				reviewedAt: new Date(),
			},
			include: TRANSFER_INCLUDE,
		});
	}

	async getTransferById(tenantId: string, transferId: string, accessContext: AccessContext) {
		const transfer = await this.prisma.employeeTransferRequest.findFirst({
			where: { id: transferId, tenantId },
			include: TRANSFER_INCLUDE,
		});

		if (!transfer) {
			throw new NotFoundException("Transfer request not found");
		}

		const hasAccessToFrom =
			canAccessAllCenters(accessContext.effectiveAccessScope) || accessContext.centerId === transfer.fromCenterId;
		const hasAccessToTo =
			canAccessAllCenters(accessContext.effectiveAccessScope) || accessContext.centerId === transfer.toCenterId;

		if (!hasAccessToFrom && !hasAccessToTo) {
			throw new NotFoundException("Transfer request not found");
		}

		return transfer;
	}

	async getTransferHistory(tenantId: string, employeeId: string, accessContext: AccessContext) {
		const employee = await this.prisma.employee.findFirst({
			where: { id: employeeId, tenantId, deletedAt: null },
		});

		if (!employee) {
			throw new NotFoundException("Employee not found");
		}

		validateCenterAccess(accessContext.centerId, employee.centerId ?? undefined, accessContext.effectiveAccessScope);

		return this.prisma.employeeTransferRequest.findMany({
			where: { tenantId, employeeId },
			include: TRANSFER_INCLUDE,
			orderBy: { createdAt: "desc" },
		});
	}

	async getPendingTransfersForCenter(tenantId: string, centerId: string, accessContext: AccessContext) {
		validateCenterAccess(accessContext.centerId, centerId, accessContext.effectiveAccessScope);

		return this.prisma.employeeTransferRequest.findMany({
			where: {
				tenantId,
				toCenterId: centerId,
				status: TransferStatus.PENDING,
			},
			include: TRANSFER_INCLUDE,
			orderBy: { createdAt: "asc" },
		});
	}

	async getOutgoingTransfersForCenter(tenantId: string, centerId: string, accessContext: AccessContext) {
		validateCenterAccess(accessContext.centerId, centerId, accessContext.effectiveAccessScope);

		return this.prisma.employeeTransferRequest.findMany({
			where: {
				tenantId,
				fromCenterId: centerId,
				status: TransferStatus.PENDING,
			},
			include: TRANSFER_INCLUDE,
			orderBy: { createdAt: "desc" },
		});
	}

	async getAllTransfers(tenantId: string, status: TransferStatus | undefined, accessContext: AccessContext) {
		const where: Prisma.EmployeeTransferRequestWhereInput = {
			tenantId,
			...(status && { status }),
		};

		if (!canAccessAllCenters(accessContext.effectiveAccessScope)) {
			where.OR = [{ fromCenterId: accessContext.centerId }, { toCenterId: accessContext.centerId }];
		}

		return this.prisma.employeeTransferRequest.findMany({
			where,
			include: TRANSFER_INCLUDE,
			orderBy: { createdAt: "desc" },
		});
	}

	async createDeparture(tenantId: string, dto: CreateDepartureDto, recordedBy: string, accessContext: AccessContext) {
		const employee = await this.prisma.employee.findFirst({
			where: { id: dto.employeeId, tenantId, deletedAt: null },
		});

		if (!employee) {
			throw new NotFoundException("Employee not found");
		}

		validateCenterAccess(accessContext.centerId, employee.centerId ?? undefined, accessContext.effectiveAccessScope);

		const existingDeparture = await this.prisma.employeeDeparture.findUnique({
			where: { employeeId: dto.employeeId },
		});

		if (existingDeparture) {
			throw new BadRequestException("Departure record already exists for this employee");
		}

		const [departure] = await this.prisma.$transaction([
			this.prisma.employeeDeparture.create({
				data: {
					tenantId,
					employeeId: dto.employeeId,
					departureDate: dto.departureDate,
					departureReason: dto.departureReason,
					destinationOrganization: dto.destinationOrganization,
					remarks: dto.remarks,
					clearanceCompleted: dto.clearanceCompleted ?? false,
					finalSettlementAmount: dto.finalSettlementAmount,
					recordedBy,
				},
				include: {
					employee: {
						select: {
							id: true,
							employeeId: true,
							fullName: true,
							fullNameAm: true,
						},
					},
					attachments: true,
				},
			}),
			this.prisma.employee.update({
				where: { id: dto.employeeId },
				data: {
					status: EmployeeStatus.TERMINATED,
					statusChangedAt: dto.departureDate,
					statusReason: dto.departureReason,
					updatedBy: recordedBy,
				},
			}),
		]);

		return departure;
	}

	async updateDeparture(tenantId: string, departureId: string, dto: UpdateDepartureDto, accessContext: AccessContext) {
		const departure = await this.prisma.employeeDeparture.findFirst({
			where: { id: departureId, tenantId },
			include: { employee: { select: { centerId: true } } },
		});

		if (!departure) {
			throw new NotFoundException("Departure record not found");
		}

		validateCenterAccess(
			accessContext.centerId,
			departure.employee.centerId ?? undefined,
			accessContext.effectiveAccessScope,
		);

		return this.prisma.employeeDeparture.update({
			where: { id: departureId },
			data: {
				departureDate: dto.departureDate,
				departureReason: dto.departureReason,
				destinationOrganization: dto.destinationOrganization,
				remarks: dto.remarks,
				clearanceCompleted: dto.clearanceCompleted,
				finalSettlementAmount: dto.finalSettlementAmount,
			},
			include: {
				employee: {
					select: {
						id: true,
						employeeId: true,
						fullName: true,
						fullNameAm: true,
					},
				},
				attachments: true,
			},
		});
	}

	async getDeparture(tenantId: string, employeeId: string, accessContext: AccessContext) {
		const employee = await this.prisma.employee.findFirst({
			where: { id: employeeId, tenantId, deletedAt: null },
		});

		if (employee) {
			validateCenterAccess(accessContext.centerId, employee.centerId ?? undefined, accessContext.effectiveAccessScope);
		}

		const departure = await this.prisma.employeeDeparture.findFirst({
			where: { employeeId, tenantId },
			include: {
				employee: {
					select: {
						id: true,
						employeeId: true,
						fullName: true,
						fullNameAm: true,
					},
				},
				attachments: true,
			},
		});

		return departure;
	}

	async getDepartureById(tenantId: string, departureId: string, accessContext: AccessContext) {
		const departure = await this.prisma.employeeDeparture.findFirst({
			where: { id: departureId, tenantId },
			include: {
				employee: {
					select: {
						id: true,
						employeeId: true,
						fullName: true,
						fullNameAm: true,
						centerId: true,
					},
				},
				attachments: true,
			},
		});

		if (!departure) {
			throw new NotFoundException("Departure record not found");
		}

		validateCenterAccess(
			accessContext.centerId,
			departure.employee.centerId ?? undefined,
			accessContext.effectiveAccessScope,
		);

		return departure;
	}

	async getAllDepartures(tenantId: string, accessContext: AccessContext) {
		const where: Prisma.EmployeeDepartureWhereInput = { tenantId };

		if (!canAccessAllCenters(accessContext.effectiveAccessScope)) {
			where.employee = { centerId: accessContext.centerId };
		}

		return this.prisma.employeeDeparture.findMany({
			where,
			include: {
				employee: {
					select: {
						id: true,
						employeeId: true,
						fullName: true,
						fullNameAm: true,
					},
				},
				attachments: true,
			},
			orderBy: { departureDate: "desc" },
		});
	}

	async deleteDeparture(tenantId: string, departureId: string, deletedBy: string, accessContext: AccessContext) {
		const departure = await this.prisma.employeeDeparture.findFirst({
			where: { id: departureId, tenantId },
			include: { employee: { select: { centerId: true } } },
		});

		if (!departure) {
			throw new NotFoundException("Departure record not found");
		}

		validateCenterAccess(
			accessContext.centerId,
			departure.employee.centerId ?? undefined,
			accessContext.effectiveAccessScope,
		);

		await this.prisma.$transaction([
			this.prisma.employeeDeparture.delete({
				where: { id: departureId },
			}),
			this.prisma.employee.update({
				where: { id: departure.employeeId },
				data: {
					status: EmployeeStatus.ACTIVE,
					statusChangedAt: new Date(),
					statusReason: "Departure record deleted - returned to active",
					updatedBy: deletedBy,
				},
			}),
		]);

		return { message: "Departure record deleted successfully" };
	}
}
