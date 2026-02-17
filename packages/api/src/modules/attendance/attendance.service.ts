import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { canAccessAllCenters, validateCenterAccess } from "#api/common/utils/access-scope.util";
import { PrismaService } from "#api/database/prisma.service";

export interface AttendanceAccessContext {
	centerId?: string;
	effectiveAccessScope: string;
}

import {
	AttendanceQueryDto,
	BulkAttendanceDto,
	BulkAttendanceResponseDto,
	CLOCK_METHOD,
	CreateAttendanceRecordDto,
	UpdateAttendanceRecordDto,
} from "./dto";
import { AttendanceCalculationService } from "./services/attendance-calculation.service";

const ATTENDANCE_INCLUDE = {
	employee: {
		select: {
			id: true,
			employeeId: true,
			fullName: true,
			fullNameAm: true,
			centerId: true,
			departmentId: true,
		},
	},
	shift: {
		select: {
			id: true,
			code: true,
			name: true,
			startTime: true,
			endTime: true,
			breakMinutes: true,
			isOvernight: true,
		},
	},
} as const;

@Injectable()
export class AttendanceService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly calculationService: AttendanceCalculationService,
	) {}

	async create(tenantId: string, dto: CreateAttendanceRecordDto, recordedBy: string) {
		const employee = await this.prisma.employee.findFirst({
			where: { id: dto.employeeId, tenantId, deletedAt: null },
		});

		if (!employee) {
			throw new NotFoundException("Employee not found");
		}

		const existingRecord = await this.prisma.attendanceRecord.findUnique({
			where: {
				employeeId_attendanceDate: {
					employeeId: dto.employeeId,
					attendanceDate: new Date(dto.attendanceDate),
				},
			},
		});

		if (existingRecord) {
			throw new BadRequestException("Attendance record already exists for this employee on this date");
		}

		if (dto.shiftId) {
			const shift = await this.prisma.shiftDefinition.findFirst({
				where: { id: dto.shiftId, tenantId },
			});
			if (!shift) {
				throw new NotFoundException("Shift not found");
			}
		}

		const clockIn = dto.clockIn ? new Date(dto.clockIn) : null;
		const clockOut = dto.clockOut ? new Date(dto.clockOut) : null;

		let shift = null;
		if (dto.shiftId) {
			shift = await this.prisma.shiftDefinition.findFirst({
				where: { id: dto.shiftId, tenantId },
			});
		}

		const hoursWorked = this.calculationService.calculateHoursWorked(clockIn, clockOut, shift?.breakMinutes ?? 0);
		const overtimeHours = this.calculationService.calculateOvertimeHours(hoursWorked, 8);
		const lateMinutes =
			dto.lateMinutes ?? this.calculationService.calculateLateMinutes(clockIn, shift?.startTime ?? null);

		const record = await this.prisma.attendanceRecord.create({
			data: {
				tenantId,
				employeeId: dto.employeeId,
				attendanceDate: new Date(dto.attendanceDate),
				shiftId: dto.shiftId,
				clockIn,
				clockOut,
				clockInMethod: dto.clockInMethod ?? CLOCK_METHOD.MANUAL,
				clockOutMethod: dto.clockOutMethod ?? CLOCK_METHOD.MANUAL,
				status: dto.status,
				hoursWorked,
				overtimeHours,
				lateMinutes,
				remarks: dto.remarks,
				recordedBy,
			},
			include: ATTENDANCE_INCLUDE,
		});

		return this.mapToResponse(record);
	}

	async createBulk(tenantId: string, dto: BulkAttendanceDto, recordedBy: string): Promise<BulkAttendanceResponseDto> {
		const result: BulkAttendanceResponseDto = {
			created: 0,
			failed: 0,
			errors: [],
		};

		for (const recordDto of dto.records) {
			const createResult = await this.createSingle(tenantId, recordDto, recordedBy);
			if (createResult.success) {
				result.created++;
			} else {
				result.failed++;
				result.errors.push(createResult.error ?? "Unknown error");
			}
		}

		return result;
	}

	private async createSingle(
		tenantId: string,
		dto: CreateAttendanceRecordDto,
		recordedBy: string,
	): Promise<{ success: boolean; error?: string }> {
		const employee = await this.prisma.employee.findFirst({
			where: { id: dto.employeeId, tenantId, deletedAt: null },
		});

		if (!employee) {
			return { success: false, error: `Employee ${dto.employeeId} not found` };
		}

		const existingRecord = await this.prisma.attendanceRecord.findUnique({
			where: {
				employeeId_attendanceDate: {
					employeeId: dto.employeeId,
					attendanceDate: new Date(dto.attendanceDate),
				},
			},
		});

		if (existingRecord) {
			return { success: false, error: `Record already exists for ${dto.employeeId} on ${dto.attendanceDate}` };
		}

		const clockIn = dto.clockIn ? new Date(dto.clockIn) : null;
		const clockOut = dto.clockOut ? new Date(dto.clockOut) : null;

		let shift = null;
		if (dto.shiftId) {
			shift = await this.prisma.shiftDefinition.findFirst({
				where: { id: dto.shiftId, tenantId },
			});
		}

		const hoursWorked = this.calculationService.calculateHoursWorked(clockIn, clockOut, shift?.breakMinutes ?? 0);
		const overtimeHours = this.calculationService.calculateOvertimeHours(hoursWorked, 8);
		const lateMinutes =
			dto.lateMinutes ?? this.calculationService.calculateLateMinutes(clockIn, shift?.startTime ?? null);

		await this.prisma.attendanceRecord.create({
			data: {
				tenantId,
				employeeId: dto.employeeId,
				attendanceDate: new Date(dto.attendanceDate),
				shiftId: dto.shiftId,
				clockIn,
				clockOut,
				clockInMethod: dto.clockInMethod ?? CLOCK_METHOD.MANUAL,
				clockOutMethod: dto.clockOutMethod ?? CLOCK_METHOD.MANUAL,
				status: dto.status,
				hoursWorked,
				overtimeHours,
				lateMinutes,
				remarks: dto.remarks,
				recordedBy,
			},
		});

		return { success: true };
	}

	async findAll(tenantId: string, query: AttendanceQueryDto, accessContext: AttendanceAccessContext) {
		const page = query.page ?? 1;
		const pageSize = query.pageSize ?? 20;
		const skip = (page - 1) * pageSize;

		const where: Prisma.AttendanceRecordWhereInput = {
			tenantId,
		};

		if (query.employeeId) {
			where.employeeId = query.employeeId;
		}

		if (query.shiftId) {
			where.shiftId = query.shiftId;
		}

		if (query.status) {
			where.status = query.status;
		}

		if (query.attendanceDate) {
			where.attendanceDate = new Date(query.attendanceDate);
		} else if (query.startDate || query.endDate) {
			where.attendanceDate = {};
			if (query.startDate) {
				where.attendanceDate.gte = new Date(query.startDate);
			}
			if (query.endDate) {
				where.attendanceDate.lte = new Date(query.endDate);
			}
		}

		const employeeFilter: Prisma.EmployeeWhereInput = {};
		if (!canAccessAllCenters(accessContext.effectiveAccessScope)) {
			employeeFilter.centerId = accessContext.centerId;
		}
		if (query.centerId) {
			validateCenterAccess(accessContext.centerId, query.centerId, accessContext.effectiveAccessScope);
			employeeFilter.centerId = query.centerId;
		}
		if (query.departmentId) {
			employeeFilter.departmentId = query.departmentId;
		}
		if (query.search) {
			employeeFilter.OR = [
				{ fullName: { contains: query.search, mode: "insensitive" } },
				{ employeeId: { contains: query.search, mode: "insensitive" } },
			];
		}
		if (Object.keys(employeeFilter).length > 0) {
			where.employee = employeeFilter;
		}

		const orderBy: Prisma.AttendanceRecordOrderByWithRelationInput = {};
		const sortBy = query.sortBy ?? "attendanceDate";
		const sortOrder = query.sortOrder ?? "desc";

		if (sortBy === "attendanceDate") {
			orderBy.attendanceDate = sortOrder;
		} else if (sortBy === "clockIn") {
			orderBy.clockIn = sortOrder;
		} else if (sortBy === "status") {
			orderBy.status = sortOrder;
		} else {
			orderBy.createdAt = sortOrder;
		}

		const [records, total] = await Promise.all([
			this.prisma.attendanceRecord.findMany({
				where,
				include: ATTENDANCE_INCLUDE,
				orderBy,
				skip,
				take: pageSize,
			}),
			this.prisma.attendanceRecord.count({ where }),
		]);

		return {
			data: records.map((r) => this.mapToResponse(r)),
			meta: {
				total,
				page,
				limit: pageSize,
				totalPages: Math.ceil(total / pageSize),
				hasNextPage: page * pageSize < total,
				hasPreviousPage: page > 1,
			},
		};
	}

	async findByDate(
		tenantId: string,
		date: string,
		accessContext: AttendanceAccessContext,
		centerId?: string,
		departmentId?: string,
	) {
		const where: Prisma.AttendanceRecordWhereInput = {
			tenantId,
			attendanceDate: new Date(date),
		};

		const employeeFilter: Prisma.EmployeeWhereInput = {};
		if (!canAccessAllCenters(accessContext.effectiveAccessScope)) {
			employeeFilter.centerId = accessContext.centerId;
		}
		if (centerId) {
			validateCenterAccess(accessContext.centerId, centerId, accessContext.effectiveAccessScope);
			employeeFilter.centerId = centerId;
		}
		if (departmentId) {
			employeeFilter.departmentId = departmentId;
		}
		if (Object.keys(employeeFilter).length > 0) {
			where.employee = employeeFilter;
		}

		const records = await this.prisma.attendanceRecord.findMany({
			where,
			include: ATTENDANCE_INCLUDE,
			orderBy: { employee: { fullName: "asc" } },
		});

		return records.map((r) => this.mapToResponse(r));
	}

	async findByEmployee(tenantId: string, employeeId: string, startDate?: string, endDate?: string) {
		const employee = await this.prisma.employee.findFirst({
			where: { id: employeeId, tenantId, deletedAt: null },
		});

		if (!employee) {
			throw new NotFoundException("Employee not found");
		}

		const where: Prisma.AttendanceRecordWhereInput = {
			tenantId,
			employeeId,
		};

		if (startDate || endDate) {
			where.attendanceDate = {};
			if (startDate) {
				where.attendanceDate.gte = new Date(startDate);
			}
			if (endDate) {
				where.attendanceDate.lte = new Date(endDate);
			}
		}

		const records = await this.prisma.attendanceRecord.findMany({
			where,
			include: ATTENDANCE_INCLUDE,
			orderBy: { attendanceDate: "desc" },
		});

		return records.map((r) => this.mapToResponse(r));
	}

	async findOne(tenantId: string, id: string) {
		const record = await this.prisma.attendanceRecord.findFirst({
			where: { id, tenantId },
			include: ATTENDANCE_INCLUDE,
		});

		if (!record) {
			throw new NotFoundException("Attendance record not found");
		}

		return this.mapToResponse(record);
	}

	async update(tenantId: string, id: string, dto: UpdateAttendanceRecordDto) {
		const record = await this.prisma.attendanceRecord.findFirst({
			where: { id, tenantId },
			include: { shift: true },
		});

		if (!record) {
			throw new NotFoundException("Attendance record not found");
		}

		const clockIn = dto.clockIn ? new Date(dto.clockIn) : record.clockIn;
		const clockOut = dto.clockOut ? new Date(dto.clockOut) : record.clockOut;

		let shift = record.shift;
		if (dto.shiftId) {
			shift = await this.prisma.shiftDefinition.findFirst({
				where: { id: dto.shiftId, tenantId },
			});
			if (!shift) {
				throw new NotFoundException("Shift not found");
			}
		}

		const hoursWorked = this.calculationService.calculateHoursWorked(clockIn, clockOut, shift?.breakMinutes ?? 0);
		const overtimeHours = this.calculationService.calculateOvertimeHours(hoursWorked, 8);
		const lateMinutes =
			dto.lateMinutes ?? this.calculationService.calculateLateMinutes(clockIn, shift?.startTime ?? null);

		const updated = await this.prisma.attendanceRecord.update({
			where: { id },
			data: {
				shiftId: dto.shiftId,
				clockIn,
				clockOut,
				clockInMethod: dto.clockInMethod,
				clockOutMethod: dto.clockOutMethod,
				status: dto.status,
				hoursWorked,
				overtimeHours,
				lateMinutes,
				remarks: dto.remarks,
			},
			include: ATTENDANCE_INCLUDE,
		});

		return this.mapToResponse(updated);
	}

	async delete(tenantId: string, id: string) {
		const record = await this.prisma.attendanceRecord.findFirst({
			where: { id, tenantId },
		});

		if (!record) {
			throw new NotFoundException("Attendance record not found");
		}

		await this.prisma.attendanceRecord.delete({
			where: { id },
		});

		return { message: "Attendance record deleted successfully" };
	}

	private mapToResponse(record: Prisma.AttendanceRecordGetPayload<{ include: typeof ATTENDANCE_INCLUDE }>) {
		return {
			id: record.id,
			tenantId: record.tenantId,
			employeeId: record.employeeId,
			attendanceDate: record.attendanceDate,
			shiftId: record.shiftId ?? undefined,
			clockIn: record.clockIn ?? undefined,
			clockOut: record.clockOut ?? undefined,
			clockInMethod: record.clockInMethod ?? undefined,
			clockOutMethod: record.clockOutMethod ?? undefined,
			clockInDeviceId: record.clockInDeviceId ?? undefined,
			clockOutDeviceId: record.clockOutDeviceId ?? undefined,
			status: record.status,
			hoursWorked: record.hoursWorked?.toNumber() ?? undefined,
			overtimeHours: record.overtimeHours?.toNumber() ?? undefined,
			lateMinutes: record.lateMinutes ?? undefined,
			remarks: record.remarks ?? undefined,
			recordedBy: record.recordedBy ?? undefined,
			createdAt: record.createdAt,
			updatedAt: record.updatedAt,
			employee: record.employee
				? {
						id: record.employee.id,
						employeeId: record.employee.employeeId,
						fullName: record.employee.fullName,
						fullNameAm: record.employee.fullNameAm ?? undefined,
					}
				: undefined,
			shift: record.shift
				? {
						id: record.shift.id,
						code: record.shift.code,
						name: record.shift.name,
						startTime: record.shift.startTime,
						endTime: record.shift.endTime,
					}
				: undefined,
		};
	}
}
