import { useQuery } from "@tanstack/react-query";
import { attendanceApi } from "#web/api/attendance/attendance.api.ts";
import type { AttendanceQuery } from "#web/types/attendance.ts";

export const attendanceKeys = {
	all: ["attendance"] as const,
	lists: () => [...attendanceKeys.all, "list"] as const,
	list: (query: AttendanceQuery) => [...attendanceKeys.lists(), query] as const,
	details: () => [...attendanceKeys.all, "detail"] as const,
	detail: (id: string) => [...attendanceKeys.details(), id] as const,
	byDate: (date: string, centerId?: string, departmentId?: string) =>
		[...attendanceKeys.all, "byDate", date, centerId, departmentId] as const,
	byEmployee: (employeeId: string, startDate?: string, endDate?: string) =>
		[...attendanceKeys.all, "byEmployee", employeeId, startDate, endDate] as const,
} as const;

export const useAttendanceRecords = (query: AttendanceQuery = {}) =>
	useQuery({
		queryKey: attendanceKeys.list(query),
		queryFn: () => attendanceApi.getAll(query),
	});

export const useAttendanceRecord = (id: string) =>
	useQuery({
		queryKey: attendanceKeys.detail(id),
		queryFn: () => attendanceApi.getById(id),
		enabled: !!id,
	});

export const useAttendanceByDate = (date: string, centerId?: string, departmentId?: string) =>
	useQuery({
		queryKey: attendanceKeys.byDate(date, centerId, departmentId),
		queryFn: () => attendanceApi.getByDate(date, centerId, departmentId),
		enabled: !!date,
	});

export const useAttendanceByEmployee = (employeeId: string, startDate?: string, endDate?: string) =>
	useQuery({
		queryKey: attendanceKeys.byEmployee(employeeId, startDate, endDate),
		queryFn: () => attendanceApi.getByEmployee(employeeId, startDate, endDate),
		enabled: !!employeeId,
	});
