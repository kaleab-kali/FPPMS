import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "#api/database/prisma.service";
import { CreateTransferDto, ExternalTransferDto } from "#api/modules/employees/dto";

@Injectable()
export class EmployeeTransferService {
	constructor(private readonly prisma: PrismaService) {}

	async internalTransfer(tenantId: string, dto: CreateTransferDto, transferredBy: string) {
		const employee = await this.prisma.employee.findFirst({
			where: { id: dto.employeeId, tenantId, deletedAt: null },
		});

		if (!employee) {
			throw new NotFoundException("Employee not found");
		}

		const targetCenter = await this.prisma.center.findFirst({
			where: { id: dto.targetCenterId, tenantId, deletedAt: null },
		});

		if (!targetCenter) {
			throw new NotFoundException("Target center not found");
		}

		if (employee.centerId === dto.targetCenterId) {
			throw new BadRequestException("Employee is already in the target center");
		}

		if (dto.targetDepartmentId) {
			const department = await this.prisma.department.findFirst({
				where: { id: dto.targetDepartmentId, tenantId },
			});
			if (!department) {
				throw new NotFoundException("Target department not found");
			}
		}

		if (dto.targetPositionId) {
			const position = await this.prisma.position.findFirst({
				where: { id: dto.targetPositionId, tenantId },
			});
			if (!position) {
				throw new NotFoundException("Target position not found");
			}
		}

		return this.prisma.employee.update({
			where: { id: dto.employeeId },
			data: {
				centerId: dto.targetCenterId,
				departmentId: dto.targetDepartmentId ?? employee.departmentId,
				positionId: dto.targetPositionId ?? employee.positionId,
				updatedBy: transferredBy,
			},
		});
	}

	async registerExternalTransfer(tenantId: string, dto: ExternalTransferDto, registeredBy: string) {
		const employee = await this.prisma.employee.findFirst({
			where: { id: dto.employeeId, tenantId, deletedAt: null },
		});

		if (!employee) {
			throw new NotFoundException("Employee not found");
		}

		if (employee.isTransfer) {
			throw new BadRequestException("Employee is already marked as a transfer");
		}

		return this.prisma.employee.update({
			where: { id: dto.employeeId },
			data: {
				isTransfer: true,
				sourceOrganization: dto.sourceOrganization,
				originalEmploymentDate: dto.originalEmploymentDate,
				updatedBy: registeredBy,
			},
		});
	}

	async getTransferHistory(tenantId: string, employeeId: string) {
		const employee = await this.prisma.employee.findFirst({
			where: { id: employeeId, tenantId, deletedAt: null },
			select: {
				id: true,
				employeeId: true,
				fullName: true,
				isTransfer: true,
				sourceOrganization: true,
				originalEmploymentDate: true,
				employmentDate: true,
				center: { select: { id: true, name: true, nameAm: true } },
				department: { select: { id: true, name: true, nameAm: true } },
				position: { select: { id: true, name: true, nameAm: true } },
			},
		});

		if (!employee) {
			throw new NotFoundException("Employee not found");
		}

		return employee;
	}

	async getExternalTransfers(tenantId: string) {
		return this.prisma.employee.findMany({
			where: { tenantId, isTransfer: true, deletedAt: null },
			select: {
				id: true,
				employeeId: true,
				fullName: true,
				fullNameAm: true,
				sourceOrganization: true,
				originalEmploymentDate: true,
				employmentDate: true,
				center: { select: { id: true, name: true, nameAm: true } },
			},
			orderBy: { employmentDate: "desc" },
		});
	}
}
