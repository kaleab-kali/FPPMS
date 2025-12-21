import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "#api/database/prisma.service";
import { CreateMaritalStatusDto, UpdateMaritalStatusDto } from "#api/modules/employees/dto";

@Injectable()
export class EmployeeMaritalStatusService {
	constructor(private readonly prisma: PrismaService) {}

	async create(tenantId: string, dto: CreateMaritalStatusDto, recordedBy: string) {
		const employee = await this.prisma.employee.findFirst({
			where: { id: dto.employeeId, tenantId, deletedAt: null },
		});

		if (!employee) {
			throw new NotFoundException("Employee not found");
		}

		const maritalStatus = await this.prisma.employeeMaritalStatus.create({
			data: {
				tenantId,
				employeeId: dto.employeeId,
				status: dto.status,
				effectiveDate: dto.effectiveDate,
				certificatePath: dto.certificatePath,
				courtOrderPath: dto.courtOrderPath,
				remarks: dto.remarks,
				recordedBy,
			},
		});

		const validStatuses = ["SINGLE", "MARRIED", "DIVORCED", "WIDOWED"] as const;
		type ValidStatus = (typeof validStatuses)[number];
		const statusValue = validStatuses.includes(dto.status as ValidStatus) ? (dto.status as ValidStatus) : undefined;

		if (statusValue) {
			await this.prisma.employee.update({
				where: { id: dto.employeeId },
				data: { maritalStatus: statusValue },
			});
		}

		if (dto.status === "DIVORCED") {
			await this.updateSpouseDivorceDate(tenantId, dto.employeeId, dto.effectiveDate);
		}

		return maritalStatus;
	}

	async findAllByEmployee(tenantId: string, employeeId: string) {
		const employee = await this.prisma.employee.findFirst({
			where: { id: employeeId, tenantId, deletedAt: null },
		});

		if (!employee) {
			throw new NotFoundException("Employee not found");
		}

		return this.prisma.employeeMaritalStatus.findMany({
			where: { tenantId, employeeId, deletedAt: null },
			orderBy: { effectiveDate: "desc" },
		});
	}

	async getCurrentStatus(tenantId: string, employeeId: string) {
		const employee = await this.prisma.employee.findFirst({
			where: { id: employeeId, tenantId, deletedAt: null },
			select: {
				id: true,
				maritalStatus: true,
				marriageDate: true,
			},
		});

		if (!employee) {
			throw new NotFoundException("Employee not found");
		}

		const latestChange = await this.prisma.employeeMaritalStatus.findFirst({
			where: { tenantId, employeeId, deletedAt: null },
			orderBy: { effectiveDate: "desc" },
		});

		return {
			currentStatus: employee.maritalStatus,
			marriageDate: employee.marriageDate,
			lastChange: latestChange,
		};
	}

	async findOne(tenantId: string, id: string) {
		const status = await this.prisma.employeeMaritalStatus.findFirst({
			where: { id, tenantId, deletedAt: null },
		});

		if (!status) {
			throw new NotFoundException("Marital status record not found");
		}

		return status;
	}

	async update(tenantId: string, id: string, dto: UpdateMaritalStatusDto) {
		const status = await this.prisma.employeeMaritalStatus.findFirst({
			where: { id, tenantId, deletedAt: null },
		});

		if (!status) {
			throw new NotFoundException("Marital status record not found");
		}

		return this.prisma.employeeMaritalStatus.update({
			where: { id },
			data: {
				status: dto.status,
				effectiveDate: dto.effectiveDate,
				certificatePath: dto.certificatePath,
				courtOrderPath: dto.courtOrderPath,
				remarks: dto.remarks,
			},
		});
	}

	async delete(tenantId: string, id: string) {
		const status = await this.prisma.employeeMaritalStatus.findFirst({
			where: { id, tenantId, deletedAt: null },
		});

		if (!status) {
			throw new NotFoundException("Marital status record not found");
		}

		return this.prisma.employeeMaritalStatus.update({
			where: { id },
			data: { deletedAt: new Date() },
		});
	}

	private async updateSpouseDivorceDate(tenantId: string, employeeId: string, divorceDate: Date) {
		await this.prisma.employeeFamilyMember.updateMany({
			where: {
				tenantId,
				employeeId,
				relationship: { in: ["SPOUSE", "HUSBAND", "WIFE"] },
				deletedAt: null,
				divorceDate: null,
			},
			data: { divorceDate },
		});
	}
}
