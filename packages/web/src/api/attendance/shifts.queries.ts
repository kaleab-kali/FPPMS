import { useQuery } from "@tanstack/react-query";
import { shiftAssignmentsApi, shiftsApi } from "#web/api/attendance/shifts.api.ts";

export const shiftKeys = {
	all: ["shifts"] as const,
	lists: () => [...shiftKeys.all, "list"] as const,
	list: (includeInactive: boolean) => [...shiftKeys.lists(), includeInactive] as const,
	details: () => [...shiftKeys.all, "detail"] as const,
	detail: (id: string) => [...shiftKeys.details(), id] as const,
	byCode: (code: string) => [...shiftKeys.all, "byCode", code] as const,
} as const;

export const shiftAssignmentKeys = {
	all: ["shiftAssignments"] as const,
	lists: () => [...shiftAssignmentKeys.all, "list"] as const,
	list: (params?: { employeeId?: string; shiftId?: string; startDate?: string; endDate?: string }) =>
		[...shiftAssignmentKeys.lists(), params] as const,
	byEmployee: (employeeId: string, startDate?: string, endDate?: string) =>
		[...shiftAssignmentKeys.all, "byEmployee", employeeId, startDate, endDate] as const,
	byDate: (date: string, centerId?: string) => [...shiftAssignmentKeys.all, "byDate", date, centerId] as const,
} as const;

export const useShifts = (includeInactive = false) =>
	useQuery({
		queryKey: shiftKeys.list(includeInactive),
		queryFn: () => shiftsApi.getAll(includeInactive),
	});

export const useShift = (id: string) =>
	useQuery({
		queryKey: shiftKeys.detail(id),
		queryFn: () => shiftsApi.getById(id),
		enabled: !!id,
	});

export const useShiftByCode = (code: string) =>
	useQuery({
		queryKey: shiftKeys.byCode(code),
		queryFn: () => shiftsApi.getByCode(code),
		enabled: !!code,
	});

export const useShiftAssignments = (params?: {
	employeeId?: string;
	shiftId?: string;
	startDate?: string;
	endDate?: string;
}) =>
	useQuery({
		queryKey: shiftAssignmentKeys.list(params),
		queryFn: () => shiftAssignmentsApi.getAll(params),
	});

export const useShiftAssignmentsByEmployee = (employeeId: string, startDate?: string, endDate?: string) =>
	useQuery({
		queryKey: shiftAssignmentKeys.byEmployee(employeeId, startDate, endDate),
		queryFn: () => shiftAssignmentsApi.getByEmployee(employeeId, startDate, endDate),
		enabled: !!employeeId,
	});

export const useShiftAssignmentsByDate = (date: string, centerId?: string) =>
	useQuery({
		queryKey: shiftAssignmentKeys.byDate(date, centerId),
		queryFn: () => shiftAssignmentsApi.getByDate(date, centerId),
		enabled: !!date,
	});
