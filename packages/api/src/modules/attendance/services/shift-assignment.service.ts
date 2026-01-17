import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "#api/database/prisma.service";
import { BulkAssignmentResponseDto, BulkShiftAssignmentDto, CreateShiftAssignmentDto, SwapShiftDto } from "../dto";

const ASSIGNMENT_INCLUDE = {
	employee: {
		select: {
			id: true,
			employeeId: true,
			fullName: true,
			fullNameAm: true,
		},
	},
	shift: {
		select: {
			id: true,
			code: true,
			name: true,
			startTime: true,
			endTime: true,
			color: true,
		},
	},
} as const;

@Injectable()
export class ShiftAssignmentService {
	constructor(private readonly prisma: PrismaService) {}

	async create(tenantId: string, dto: CreateShiftAssignmentDto) {
		const employee = await this.prisma.employee.findFirst({
			where: { id: dto.employeeId, tenantId, deletedAt: null },
		});

		if (!employee) {
			throw new NotFoundException("Employee not found");
		}

		const shift = await this.prisma.shiftDefinition.findFirst({
			where: { id: dto.shiftId, tenantId, isActive: true },
		});

		if (!shift) {
			throw new NotFoundException("Shift not found or inactive");
		}

		const existing = await this.prisma.shiftAssignment.findUnique({
			where: {
				employeeId_shiftDate: {
					employeeId: dto.employeeId,
					shiftDate: new Date(dto.shiftDate),
				},
			},
		});

		if (existing) {
			throw new BadRequestException("Employee already has a shift assigned for this date");
		}

		const assignment = await this.prisma.shiftAssignment.create({
			data: {
				tenantId,
				employeeId: dto.employeeId,
				shiftId: dto.shiftId,
				shiftDate: new Date(dto.shiftDate),
				status: "SCHEDULED",
			},
			include: ASSIGNMENT_INCLUDE,
		});

		return this.mapToResponse(assignment);
	}

	async createBulk(tenantId: string, dto: BulkShiftAssignmentDto): Promise<BulkAssignmentResponseDto> {
		const result: BulkAssignmentResponseDto = {
			created: 0,
			skipped: 0,
			failed: 0,
			errors: [],
		};

		const shift = await this.prisma.shiftDefinition.findFirst({
			where: { id: dto.shiftId, tenantId, isActive: true },
		});

		if (!shift) {
			result.errors.push("Shift not found or inactive");
			result.failed = dto.employeeIds.length;
			return result;
		}

		const employees = await this.prisma.employee.findMany({
			where: { id: { in: dto.employeeIds }, tenantId, deletedAt: null },
			select: { id: true },
		});

		const validEmployeeIds = new Set(employees.map((e) => e.id));
		const invalidEmployeeIds = dto.employeeIds.filter((id) => !validEmployeeIds.has(id));

		for (const id of invalidEmployeeIds) {
			result.errors.push(`Employee ${id} not found`);
			result.failed++;
		}

		const holidays = dto.skipHolidays
			? await this.prisma.holiday.findMany({
					where: {
						tenantId,
						holidayDate: {
							gte: new Date(dto.startDate),
							lte: new Date(dto.endDate),
						},
					},
					select: { holidayDate: true },
				})
			: [];

		const holidayDates = new Set(holidays.map((h) => h.holidayDate.toISOString().split("T")[0]));

		const startDate = new Date(dto.startDate);
		const endDate = new Date(dto.endDate);
		const daysOfWeek = dto.daysOfWeek ?? [1, 2, 3, 4, 5];

		const datesToAssign: Date[] = [];
		const current = new Date(startDate);

		while (current <= endDate) {
			const dayOfWeek = current.getDay();
			const dateStr = current.toISOString().split("T")[0];

			if (daysOfWeek.includes(dayOfWeek) && !holidayDates.has(dateStr)) {
				datesToAssign.push(new Date(current));
			}
			current.setDate(current.getDate() + 1);
		}

		for (const employeeId of [...validEmployeeIds]) {
			for (const date of datesToAssign) {
				const existing = await this.prisma.shiftAssignment.findUnique({
					where: {
						employeeId_shiftDate: {
							employeeId,
							shiftDate: date,
						},
					},
				});

				if (existing) {
					result.skipped++;
					continue;
				}

				await this.prisma.shiftAssignment.create({
					data: {
						tenantId,
						employeeId,
						shiftId: dto.shiftId,
						shiftDate: date,
						status: "SCHEDULED",
					},
				});
				result.created++;
			}
		}

		return result;
	}

	async findAll(
		tenantId: string,
		query: { employeeId?: string; shiftId?: string; startDate?: string; endDate?: string },
	) {
		const where: Prisma.ShiftAssignmentWhereInput = { tenantId };

		if (query.employeeId) {
			where.employeeId = query.employeeId;
		}

		if (query.shiftId) {
			where.shiftId = query.shiftId;
		}

		if (query.startDate || query.endDate) {
			where.shiftDate = {};
			if (query.startDate) {
				where.shiftDate.gte = new Date(query.startDate);
			}
			if (query.endDate) {
				where.shiftDate.lte = new Date(query.endDate);
			}
		}

		const assignments = await this.prisma.shiftAssignment.findMany({
			where,
			include: ASSIGNMENT_INCLUDE,
			orderBy: [{ shiftDate: "asc" }, { employee: { fullName: "asc" } }],
		});

		return assignments.map((a) => this.mapToResponse(a));
	}

	async findByEmployee(tenantId: string, employeeId: string, startDate?: string, endDate?: string) {
		const employee = await this.prisma.employee.findFirst({
			where: { id: employeeId, tenantId, deletedAt: null },
		});

		if (!employee) {
			throw new NotFoundException("Employee not found");
		}

		const where: Prisma.ShiftAssignmentWhereInput = {
			tenantId,
			employeeId,
		};

		if (startDate || endDate) {
			where.shiftDate = {};
			if (startDate) {
				where.shiftDate.gte = new Date(startDate);
			}
			if (endDate) {
				where.shiftDate.lte = new Date(endDate);
			}
		}

		const assignments = await this.prisma.shiftAssignment.findMany({
			where,
			include: ASSIGNMENT_INCLUDE,
			orderBy: { shiftDate: "asc" },
		});

		return assignments.map((a) => this.mapToResponse(a));
	}

	async findByDate(tenantId: string, date: string, centerId?: string) {
		const where: Prisma.ShiftAssignmentWhereInput = {
			tenantId,
			shiftDate: new Date(date),
		};

		if (centerId) {
			where.employee = { centerId };
		}

		const assignments = await this.prisma.shiftAssignment.findMany({
			where,
			include: ASSIGNMENT_INCLUDE,
			orderBy: { employee: { fullName: "asc" } },
		});

		return assignments.map((a) => this.mapToResponse(a));
	}

	async swapShift(tenantId: string, dto: SwapShiftDto, approvedBy: string) {
		const assignment = await this.prisma.shiftAssignment.findFirst({
			where: { id: dto.assignmentId, tenantId },
		});

		if (!assignment) {
			throw new NotFoundException("Shift assignment not found");
		}

		const swapEmployee = await this.prisma.employee.findFirst({
			where: { id: dto.swapWithEmployeeId, tenantId, deletedAt: null },
		});

		if (!swapEmployee) {
			throw new NotFoundException("Swap employee not found");
		}

		if (assignment.employeeId === dto.swapWithEmployeeId) {
			throw new BadRequestException("Cannot swap shift with the same employee");
		}

		const updated = await this.prisma.shiftAssignment.update({
			where: { id: dto.assignmentId },
			data: {
				swappedWithEmployeeId: dto.swapWithEmployeeId,
				swapApprovedBy: approvedBy,
				status: "SWAPPED",
			},
			include: ASSIGNMENT_INCLUDE,
		});

		return this.mapToResponse(updated);
	}

	async delete(tenantId: string, id: string) {
		const assignment = await this.prisma.shiftAssignment.findFirst({
			where: { id, tenantId },
		});

		if (!assignment) {
			throw new NotFoundException("Shift assignment not found");
		}

		await this.prisma.shiftAssignment.delete({
			where: { id },
		});

		return { message: "Shift assignment deleted successfully" };
	}

	async deleteByDateRange(tenantId: string, employeeId: string, startDate: string, endDate: string) {
		const result = await this.prisma.shiftAssignment.deleteMany({
			where: {
				tenantId,
				employeeId,
				shiftDate: {
					gte: new Date(startDate),
					lte: new Date(endDate),
				},
			},
		});

		return { message: `${result.count} shift assignments deleted` };
	}

	private mapToResponse(assignment: Prisma.ShiftAssignmentGetPayload<{ include: typeof ASSIGNMENT_INCLUDE }>) {
		return {
			id: assignment.id,
			tenantId: assignment.tenantId,
			employeeId: assignment.employeeId,
			shiftId: assignment.shiftId,
			shiftDate: assignment.shiftDate,
			status: assignment.status,
			swappedWithEmployeeId: assignment.swappedWithEmployeeId ?? undefined,
			swapApprovedBy: assignment.swapApprovedBy ?? undefined,
			createdAt: assignment.createdAt,
			updatedAt: assignment.updatedAt,
			employee: assignment.employee
				? {
						id: assignment.employee.id,
						employeeId: assignment.employee.employeeId,
						fullName: assignment.employee.fullName,
						fullNameAm: assignment.employee.fullNameAm ?? undefined,
					}
				: undefined,
			shift: assignment.shift
				? {
						id: assignment.shift.id,
						code: assignment.shift.code,
						name: assignment.shift.name,
						startTime: assignment.shift.startTime,
						endTime: assignment.shift.endTime,
						color: assignment.shift.color ?? undefined,
					}
				: undefined,
		};
	}
}
