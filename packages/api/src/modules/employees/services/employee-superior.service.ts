import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "#api/database/prisma.service";
import { AssignSuperiorDto, BulkAssignSuperiorDto, RemoveSuperiorDto } from "#api/modules/employees/dto/employee-superior.dto";

const EMPLOYEE_BASIC_SELECT = {
	id: true,
	employeeId: true,
	fullName: true,
	fullNameAm: true,
	currentPhotoId: true,
	position: { select: { id: true, name: true, nameAm: true } },
	department: { select: { id: true, name: true, nameAm: true } },
	rank: { select: { id: true, name: true, nameAm: true } },
} as const;

@Injectable()
export class EmployeeSuperiorService {
	constructor(private readonly prisma: PrismaService) {}

	async getAssignmentList(tenantId: string, centerId?: string) {
		const employees = await this.prisma.employee.findMany({
			where: { tenantId, deletedAt: null, ...(centerId && { centerId }) },
			select: {
				...EMPLOYEE_BASIC_SELECT,
				directSuperiorId: true,
				directSuperior: { select: EMPLOYEE_BASIC_SELECT },
				_count: { select: { subordinates: true } },
			},
			orderBy: { fullName: "asc" },
		});

		return employees.map((e) => ({
			id: e.id,
			employeeId: e.employeeId,
			fullName: e.fullName,
			fullNameAm: e.fullNameAm,
			currentPhotoId: e.currentPhotoId,
			position: e.position,
			department: e.department,
			rank: e.rank,
			directSuperior: e.directSuperior,
			subordinateCount: e._count.subordinates,
		}));
	}

	async getDirectSuperior(tenantId: string, employeeId: string) {
		const employee = await this.prisma.employee.findFirst({
			where: { id: employeeId, tenantId, deletedAt: null },
			select: { directSuperior: { select: EMPLOYEE_BASIC_SELECT } },
		});

		if (!employee) throw new NotFoundException("Employee not found");
		return employee.directSuperior;
	}

	async getSubordinates(tenantId: string, superiorId: string) {
		const superior = await this.prisma.employee.findFirst({
			where: { id: superiorId, tenantId, deletedAt: null },
		});

		if (!superior) throw new NotFoundException("Employee not found");

		return this.prisma.employee.findMany({
			where: { directSuperiorId: superiorId, tenantId, deletedAt: null },
			select: { ...EMPLOYEE_BASIC_SELECT, _count: { select: { subordinates: true } } },
			orderBy: { fullName: "asc" },
		});
	}

	async getSuperiorChain(tenantId: string, employeeId: string) {
		const chain = [];
		let currentId = employeeId;
		const maxDepth = 20;

		for (let i = 0; i < maxDepth && currentId; i++) {
			const emp = await this.prisma.employee.findFirst({
				where: { id: currentId, tenantId, deletedAt: null },
				select: { ...EMPLOYEE_BASIC_SELECT, directSuperiorId: true },
			});

			if (!emp || !emp.directSuperiorId) break;

			const superior = await this.prisma.employee.findFirst({
				where: { id: emp.directSuperiorId, tenantId, deletedAt: null },
				select: EMPLOYEE_BASIC_SELECT,
			});

			if (superior) chain.push(superior);
			currentId = emp.directSuperiorId;
		}

		return chain;
	}

	async assignSuperior(tenantId: string, employeeUuid: string, dto: AssignSuperiorDto, assignedBy: string) {
		const [employee, superior] = await Promise.all([
			this.prisma.employee.findFirst({ where: { id: employeeUuid, tenantId, deletedAt: null } }),
			this.prisma.employee.findFirst({ where: { employeeId: dto.superiorId, tenantId, deletedAt: null } }),
		]);

		if (!employee) throw new NotFoundException("Employee not found");
		if (!superior) throw new NotFoundException("Superior not found");

		if (employee.id === superior.id) {
			throw new BadRequestException("Employee cannot be their own superior");
		}

		const isCircular = await this.hasCircularReference(tenantId, superior.id, employee.id);
		if (isCircular) throw new BadRequestException("Circular reference detected");

		const previousSuperiorId = employee.directSuperiorId;

		await this.prisma.$transaction([
			this.prisma.employee.update({
				where: { id: employee.id },
				data: { directSuperiorId: superior.id },
			}),
			this.prisma.superiorAssignmentHistory.create({
				data: {
					tenantId,
					employeeId: employee.id,
					previousSuperiorId,
					newSuperiorId: superior.id,
					assignedDate: new Date(dto.effectiveDate),
					reason: dto.reason,
					remarks: dto.remarks,
					assignedBy,
				},
			}),
		]);

		return { success: true };
	}

	async bulkAssignSuperior(tenantId: string, dto: BulkAssignSuperiorDto, assignedBy: string) {
		if (dto.employeeIds.includes(dto.superiorId)) {
			throw new BadRequestException("Superior cannot be in employee list");
		}

		const superior = await this.prisma.employee.findFirst({
			where: { employeeId: dto.superiorId, tenantId, deletedAt: null },
		});
		if (!superior) throw new NotFoundException("Superior not found");

		const employees = await this.prisma.employee.findMany({
			where: { employeeId: { in: dto.employeeIds }, tenantId, deletedAt: null },
		});
		if (employees.length !== dto.employeeIds.length) {
			throw new BadRequestException("Some employees not found");
		}

		const employeeUuids = employees.map((e) => e.id);

		const historyData = employees.map((emp) => ({
			tenantId,
			employeeId: emp.id,
			previousSuperiorId: emp.directSuperiorId,
			newSuperiorId: superior.id,
			assignedDate: new Date(dto.effectiveDate),
			reason: dto.reason,
			remarks: dto.remarks,
			assignedBy,
		}));

		await this.prisma.$transaction([
			this.prisma.employee.updateMany({
				where: { id: { in: employeeUuids } },
				data: { directSuperiorId: superior.id },
			}),
			this.prisma.superiorAssignmentHistory.createMany({ data: historyData }),
		]);

		return { updated: employees.length };
	}

	async removeSuperior(tenantId: string, employeeId: string, dto: RemoveSuperiorDto, assignedBy: string) {
		const employee = await this.prisma.employee.findFirst({
			where: { id: employeeId, tenantId, deletedAt: null },
		});

		if (!employee) throw new NotFoundException("Employee not found");
		if (!employee.directSuperiorId) throw new BadRequestException("No superior assigned");

		await this.prisma.$transaction([
			this.prisma.employee.update({
				where: { id: employeeId },
				data: { directSuperiorId: null },
			}),
			this.prisma.superiorAssignmentHistory.create({
				data: {
					tenantId,
					employeeId,
					previousSuperiorId: employee.directSuperiorId,
					newSuperiorId: null,
					assignedDate: new Date(dto.effectiveDate),
					reason: dto.reason,
					remarks: dto.remarks,
					assignedBy,
				},
			}),
		]);

		return { success: true };
	}

	async getAssignmentHistory(tenantId: string, employeeId: string) {
		return this.prisma.superiorAssignmentHistory.findMany({
			where: { employeeId, tenantId },
			include: {
				previousSuperior: { select: EMPLOYEE_BASIC_SELECT },
			},
			orderBy: { createdAt: "desc" },
		});
	}

	async getOrgChart(tenantId: string, centerId?: string, rootEmployeeId?: string) {
		const where = {
			tenantId,
			deletedAt: null,
			...(centerId && { centerId }),
			...(rootEmployeeId ? { id: rootEmployeeId } : { directSuperiorId: null }),
		};

		const roots = await this.prisma.employee.findMany({
			where,
			select: {
				...EMPLOYEE_BASIC_SELECT,
				subordinates: {
					where: { deletedAt: null },
					select: {
						...EMPLOYEE_BASIC_SELECT,
						subordinates: {
							where: { deletedAt: null },
							select: {
								...EMPLOYEE_BASIC_SELECT,
								subordinates: {
									where: { deletedAt: null },
									select: EMPLOYEE_BASIC_SELECT,
								},
							},
						},
					},
				},
			},
			orderBy: { fullName: "asc" },
		});

		return roots;
	}

	private async hasCircularReference(tenantId: string, superiorId: string, employeeId: string): Promise<boolean> {
		const visited = new Set<string>();
		const idsToCheck = [superiorId];

		for (let i = 0; i < 20 && idsToCheck.length > 0; i++) {
			const checkId = idsToCheck.shift()!;
			if (checkId === employeeId) return true;
			if (visited.has(checkId)) continue;
			visited.add(checkId);

			const emp = await this.prisma.employee.findFirst({
				where: { id: checkId, tenantId, deletedAt: null },
				select: { directSuperiorId: true },
			});

			if (emp?.directSuperiorId) {
				idsToCheck.push(emp.directSuperiorId);
			}
		}

		return false;
	}
}
