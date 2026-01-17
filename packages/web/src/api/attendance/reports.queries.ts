import { useQuery } from "@tanstack/react-query";
import { attendanceReportsApi } from "#web/api/attendance/reports.api.ts";
import type { AttendanceReportQuery } from "#web/types/attendance.ts";

export const attendanceReportKeys = {
	all: ["attendanceReports"] as const,
	overview: (date?: string) => [...attendanceReportKeys.all, "overview", date] as const,
	employeeMonthly: (employeeId: string, month: number, year: number) =>
		[...attendanceReportKeys.all, "employeeMonthly", employeeId, month, year] as const,
	departmentSummary: (departmentId: string, date?: string) =>
		[...attendanceReportKeys.all, "departmentSummary", departmentId, date] as const,
	trends: (query: AttendanceReportQuery) => [...attendanceReportKeys.all, "trends", query] as const,
	lateArrivals: (query: AttendanceReportQuery, lateThreshold?: number) =>
		[...attendanceReportKeys.all, "lateArrivals", query, lateThreshold] as const,
	absenteeism: (query: AttendanceReportQuery) => [...attendanceReportKeys.all, "absenteeism", query] as const,
} as const;

export const useAttendanceOverview = (date?: string) =>
	useQuery({
		queryKey: attendanceReportKeys.overview(date),
		queryFn: () => attendanceReportsApi.getOverview(date),
	});

export const useEmployeeMonthlySummary = (employeeId: string, month: number, year: number) =>
	useQuery({
		queryKey: attendanceReportKeys.employeeMonthly(employeeId, month, year),
		queryFn: () => attendanceReportsApi.getEmployeeMonthlySummary(employeeId, month, year),
		enabled: !!employeeId && !!month && !!year,
	});

export const useDepartmentAttendanceSummary = (departmentId: string, date?: string) =>
	useQuery({
		queryKey: attendanceReportKeys.departmentSummary(departmentId, date),
		queryFn: () => attendanceReportsApi.getDepartmentSummary(departmentId, date),
		enabled: !!departmentId,
	});

export const useAttendanceTrends = (query: AttendanceReportQuery) =>
	useQuery({
		queryKey: attendanceReportKeys.trends(query),
		queryFn: () => attendanceReportsApi.getAttendanceTrends(query),
	});

export const useLateArrivalsReport = (query: AttendanceReportQuery, lateThreshold?: number) =>
	useQuery({
		queryKey: attendanceReportKeys.lateArrivals(query, lateThreshold),
		queryFn: () => attendanceReportsApi.getLateArrivalsReport(query, lateThreshold),
	});

export const useAbsenteeismReport = (query: AttendanceReportQuery) =>
	useQuery({
		queryKey: attendanceReportKeys.absenteeism(query),
		queryFn: () => attendanceReportsApi.getAbsenteeismReport(query),
	});
