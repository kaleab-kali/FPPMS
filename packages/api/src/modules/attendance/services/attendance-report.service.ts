import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "#api/database/prisma.service";
import {
	AttendanceOverviewDto,
	AttendanceReportQueryDto,
	AttendanceTrendDto,
	DepartmentAttendanceSummaryDto,
	EmployeeAttendanceSummaryDto,
	LateArrivalReportDto,
} from "../dto/attendance-report.dto";
import { ATTENDANCE_STATUS } from "../dto/create-attendance-record.dto";
import { AttendanceCalculationService } from "./attendance-calculation.service";

@Injectable()
export class AttendanceReportService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly calculationService: AttendanceCalculationService,
	) {}

	async getOverview(tenantId: string, date?: string): Promise<AttendanceOverviewDto> {
		const targetDate = date ? new Date(date) : new Date();
		targetDate.setHours(0, 0, 0, 0);

		const totalEmployees = await this.prisma.employee.count({
			where: { tenantId, deletedAt: null, status: "ACTIVE" },
		});

		const todayRecords = await this.prisma.attendanceRecord.groupBy({
			by: ["status"],
			where: {
				tenantId,
				attendanceDate: targetDate,
			},
			_count: { status: true },
		});

		const statusCounts = todayRecords.reduce(
			(acc, r) => {
				acc[r.status] = r._count.status;
				return acc;
			},
			{} as Record<string, number>,
		);

		const presentToday = statusCounts[ATTENDANCE_STATUS.PRESENT] ?? 0;
		const absentToday = statusCounts[ATTENDANCE_STATUS.ABSENT] ?? 0;
		const lateToday = statusCounts[ATTENDANCE_STATUS.LATE] ?? 0;
		const onLeaveToday = statusCounts[ATTENDANCE_STATUS.ON_LEAVE] ?? 0;
		const halfDayToday = statusCounts[ATTENDANCE_STATUS.HALF_DAY] ?? 0;

		const recordedCount = presentToday + absentToday + lateToday + onLeaveToday + halfDayToday;
		const notClockedIn = totalEmployees - recordedCount;

		const attendingCount = presentToday + lateToday + halfDayToday;
		const attendanceRate = totalEmployees > 0 ? Math.round((attendingCount / totalEmployees) * 100 * 100) / 100 : 0;

		return {
			totalEmployees,
			presentToday,
			absentToday,
			lateToday,
			onLeaveToday,
			attendanceRate,
			notClockedIn: Math.max(0, notClockedIn),
		};
	}

	async getEmployeeMonthlySummary(
		tenantId: string,
		employeeId: string,
		month: number,
		year: number,
	): Promise<EmployeeAttendanceSummaryDto> {
		const employee = await this.prisma.employee.findFirst({
			where: { id: employeeId, tenantId, deletedAt: null },
			select: { id: true, employeeId: true, fullName: true },
		});

		if (!employee) {
			throw new Error("Employee not found");
		}

		const startDate = new Date(year, month - 1, 1);
		const endDate = new Date(year, month, 0);

		const records = await this.prisma.attendanceRecord.findMany({
			where: {
				tenantId,
				employeeId,
				attendanceDate: {
					gte: startDate,
					lte: endDate,
				},
			},
		});

		const totalWorkingDays = this.calculationService.getWorkingDaysInRange(startDate, endDate);

		const statusCounts = records.reduce(
			(acc, r) => {
				acc[r.status] = (acc[r.status] ?? 0) + 1;
				return acc;
			},
			{} as Record<string, number>,
		);

		const daysPresent = statusCounts[ATTENDANCE_STATUS.PRESENT] ?? 0;
		const daysLate = statusCounts[ATTENDANCE_STATUS.LATE] ?? 0;
		const daysAbsent = statusCounts[ATTENDANCE_STATUS.ABSENT] ?? 0;
		const daysOnLeave = statusCounts[ATTENDANCE_STATUS.ON_LEAVE] ?? 0;
		const halfDays = statusCounts[ATTENDANCE_STATUS.HALF_DAY] ?? 0;

		const totalHoursWorked = records.reduce((sum, r) => sum + (r.hoursWorked?.toNumber() ?? 0), 0);
		const totalOvertimeHours = records.reduce((sum, r) => sum + (r.overtimeHours?.toNumber() ?? 0), 0);
		const totalLateMinutes = records.reduce((sum, r) => sum + (r.lateMinutes ?? 0), 0);

		const attendingDays = daysPresent + daysLate + halfDays * 0.5;
		const attendancePercentage =
			totalWorkingDays > 0 ? Math.round((attendingDays / totalWorkingDays) * 100 * 100) / 100 : 0;

		return {
			employeeId: employee.id,
			employeeCode: employee.employeeId,
			employeeName: employee.fullName,
			totalWorkingDays,
			daysPresent,
			daysAbsent,
			daysLate,
			daysOnLeave,
			halfDays,
			totalHoursWorked: Math.round(totalHoursWorked * 100) / 100,
			totalOvertimeHours: Math.round(totalOvertimeHours * 100) / 100,
			totalLateMinutes,
			attendancePercentage,
		};
	}

	async getDepartmentSummary(
		tenantId: string,
		departmentId: string,
		date?: string,
	): Promise<DepartmentAttendanceSummaryDto> {
		const department = await this.prisma.department.findFirst({
			where: { id: departmentId, tenantId },
			select: { id: true, name: true },
		});

		if (!department) {
			throw new Error("Department not found");
		}

		const targetDate = date ? new Date(date) : new Date();
		targetDate.setHours(0, 0, 0, 0);

		const employees = await this.prisma.employee.findMany({
			where: { tenantId, departmentId, deletedAt: null, status: "ACTIVE" },
			select: { id: true },
		});

		const employeeIds = employees.map((e) => e.id);

		const records = await this.prisma.attendanceRecord.findMany({
			where: {
				tenantId,
				employeeId: { in: employeeIds },
				attendanceDate: targetDate,
			},
		});

		const statusCounts = records.reduce(
			(acc, r) => {
				acc[r.status] = (acc[r.status] ?? 0) + 1;
				return acc;
			},
			{} as Record<string, number>,
		);

		const presentToday = statusCounts[ATTENDANCE_STATUS.PRESENT] ?? 0;
		const lateToday = statusCounts[ATTENDANCE_STATUS.LATE] ?? 0;
		const absentToday = statusCounts[ATTENDANCE_STATUS.ABSENT] ?? 0;
		const onLeaveToday = statusCounts[ATTENDANCE_STATUS.ON_LEAVE] ?? 0;

		const totalEmployees = employees.length;
		const attendingCount = presentToday + lateToday;
		const avgAttendancePercentage =
			totalEmployees > 0 ? Math.round((attendingCount / totalEmployees) * 100 * 100) / 100 : 0;

		return {
			departmentId: department.id,
			departmentName: department.name,
			totalEmployees,
			avgAttendancePercentage,
			presentToday,
			absentToday,
			lateToday,
			onLeaveToday,
		};
	}

	async getAttendanceTrends(tenantId: string, query: AttendanceReportQueryDto): Promise<AttendanceTrendDto[]> {
		const { startDate, endDate, month, year, centerId, departmentId, groupBy = "day" } = query;

		let rangeStart: Date;
		let rangeEnd: Date;

		if (startDate && endDate) {
			rangeStart = new Date(startDate);
			rangeEnd = new Date(endDate);
		} else if (month && year) {
			rangeStart = new Date(year, month - 1, 1);
			rangeEnd = new Date(year, month, 0);
		} else {
			rangeEnd = new Date();
			rangeStart = new Date();
			rangeStart.setDate(rangeStart.getDate() - 30);
		}

		const employeeWhere: Prisma.EmployeeWhereInput = {
			tenantId,
			deletedAt: null,
			status: "ACTIVE",
		};

		if (centerId) {
			employeeWhere.centerId = centerId;
		}
		if (departmentId) {
			employeeWhere.departmentId = departmentId;
		}

		const totalEmployees = await this.prisma.employee.count({ where: employeeWhere });

		const records = await this.prisma.attendanceRecord.findMany({
			where: {
				tenantId,
				attendanceDate: {
					gte: rangeStart,
					lte: rangeEnd,
				},
				...(centerId || departmentId
					? {
							employee: {
								...(centerId ? { centerId } : {}),
								...(departmentId ? { departmentId } : {}),
							},
						}
					: {}),
			},
			orderBy: { attendanceDate: "asc" },
		});

		const groupedData: Map<string, { date: Date; records: typeof records }> = new Map();

		for (const record of records) {
			let key: string;
			const date = new Date(record.attendanceDate);

			if (groupBy === "week") {
				const weekStart = new Date(date);
				weekStart.setDate(date.getDate() - date.getDay());
				key = weekStart.toISOString().split("T")[0];
			} else if (groupBy === "month") {
				key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
			} else {
				key = date.toISOString().split("T")[0];
			}

			if (!groupedData.has(key)) {
				groupedData.set(key, { date, records: [] });
			}
			groupedData.get(key)?.records.push(record);
		}

		const trends: AttendanceTrendDto[] = [];

		for (const [period, data] of groupedData) {
			const statusCounts = data.records.reduce(
				(acc, r) => {
					acc[r.status] = (acc[r.status] ?? 0) + 1;
					return acc;
				},
				{} as Record<string, number>,
			);

			const present = statusCounts[ATTENDANCE_STATUS.PRESENT] ?? 0;
			const late = statusCounts[ATTENDANCE_STATUS.LATE] ?? 0;
			const absent = statusCounts[ATTENDANCE_STATUS.ABSENT] ?? 0;
			const onLeave = statusCounts[ATTENDANCE_STATUS.ON_LEAVE] ?? 0;

			const attendingCount = present + late;
			const attendanceRate = totalEmployees > 0 ? Math.round((attendingCount / totalEmployees) * 100 * 100) / 100 : 0;

			trends.push({
				period,
				date: data.date,
				present,
				absent,
				late,
				onLeave,
				total: totalEmployees,
				attendanceRate,
			});
		}

		return trends.sort((a, b) => a.date.getTime() - b.date.getTime());
	}

	async getLateArrivalsReport(
		tenantId: string,
		query: AttendanceReportQueryDto,
		lateThreshold = 0,
	): Promise<LateArrivalReportDto[]> {
		const { startDate, endDate, month, year, centerId, departmentId } = query;

		let rangeStart: Date;
		let rangeEnd: Date;

		if (startDate && endDate) {
			rangeStart = new Date(startDate);
			rangeEnd = new Date(endDate);
		} else if (month && year) {
			rangeStart = new Date(year, month - 1, 1);
			rangeEnd = new Date(year, month, 0);
		} else {
			rangeEnd = new Date();
			rangeStart = new Date();
			rangeStart.setDate(rangeStart.getDate() - 30);
		}

		const where: Prisma.AttendanceRecordWhereInput = {
			tenantId,
			attendanceDate: {
				gte: rangeStart,
				lte: rangeEnd,
			},
			lateMinutes: { gt: lateThreshold },
		};

		if (centerId || departmentId) {
			where.employee = {};
			if (centerId) {
				where.employee.centerId = centerId;
			}
			if (departmentId) {
				where.employee.departmentId = departmentId;
			}
		}

		const records = await this.prisma.attendanceRecord.findMany({
			where,
			include: {
				employee: {
					select: {
						id: true,
						employeeId: true,
						fullName: true,
						department: { select: { name: true } },
					},
				},
				shift: {
					select: { startTime: true },
				},
			},
			orderBy: [{ attendanceDate: "desc" }, { lateMinutes: "desc" }],
		});

		return records.map((r) => ({
			employeeId: r.employee.id,
			employeeCode: r.employee.employeeId,
			employeeName: r.employee.fullName,
			departmentName: r.employee.department?.name ?? "N/A",
			date: r.attendanceDate,
			expectedTime: r.shift?.startTime ?? "08:00",
			actualTime: r.clockIn ?? r.attendanceDate,
			lateMinutes: r.lateMinutes ?? 0,
		}));
	}

	async getAbsenteeismReport(tenantId: string, query: AttendanceReportQueryDto) {
		const { startDate, endDate, month, year, centerId, departmentId } = query;

		let rangeStart: Date;
		let rangeEnd: Date;

		if (startDate && endDate) {
			rangeStart = new Date(startDate);
			rangeEnd = new Date(endDate);
		} else if (month && year) {
			rangeStart = new Date(year, month - 1, 1);
			rangeEnd = new Date(year, month, 0);
		} else {
			rangeEnd = new Date();
			rangeStart = new Date();
			rangeStart.setDate(rangeStart.getDate() - 30);
		}

		const where: Prisma.AttendanceRecordWhereInput = {
			tenantId,
			attendanceDate: {
				gte: rangeStart,
				lte: rangeEnd,
			},
			status: ATTENDANCE_STATUS.ABSENT,
		};

		if (centerId || departmentId) {
			where.employee = {};
			if (centerId) {
				where.employee.centerId = centerId;
			}
			if (departmentId) {
				where.employee.departmentId = departmentId;
			}
		}

		const records = await this.prisma.attendanceRecord.findMany({
			where,
			include: {
				employee: {
					select: {
						id: true,
						employeeId: true,
						fullName: true,
						department: { select: { name: true } },
					},
				},
			},
			orderBy: { attendanceDate: "desc" },
		});

		const grouped = records.reduce(
			(acc, r) => {
				if (!acc[r.employeeId]) {
					acc[r.employeeId] = {
						employeeId: r.employee.id,
						employeeCode: r.employee.employeeId,
						employeeName: r.employee.fullName,
						departmentName: r.employee.department?.name ?? "N/A",
						absentDays: 0,
						dates: [],
					};
				}
				acc[r.employeeId].absentDays++;
				acc[r.employeeId].dates.push(r.attendanceDate);
				return acc;
			},
			{} as Record<
				string,
				{
					employeeId: string;
					employeeCode: string;
					employeeName: string;
					departmentName: string;
					absentDays: number;
					dates: Date[];
				}
			>,
		);

		return Object.values(grouped).sort((a, b) => b.absentDays - a.absentDays);
	}
}
