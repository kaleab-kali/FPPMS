import { useQuery } from "@tanstack/react-query";
import { employeeMaritalStatusApi } from "#web/api/employees/employee-marital-status.api.ts";

export const employeeMaritalStatusKeys = {
	all: ["employee-marital-status"] as const,
	byEmployee: (employeeId: string) => [...employeeMaritalStatusKeys.all, "employee", employeeId] as const,
	current: (employeeId: string) => [...employeeMaritalStatusKeys.all, "current", employeeId] as const,
	detail: (id: string) => [...employeeMaritalStatusKeys.all, "detail", id] as const,
} as const;

export const useMaritalStatusHistory = (employeeId: string) =>
	useQuery({
		queryKey: employeeMaritalStatusKeys.byEmployee(employeeId),
		queryFn: () => employeeMaritalStatusApi.getByEmployee(employeeId),
		enabled: !!employeeId,
	});

export const useCurrentMaritalStatus = (employeeId: string) =>
	useQuery({
		queryKey: employeeMaritalStatusKeys.current(employeeId),
		queryFn: () => employeeMaritalStatusApi.getCurrentStatus(employeeId),
		enabled: !!employeeId,
	});

export const useMaritalStatusRecord = (id: string) =>
	useQuery({
		queryKey: employeeMaritalStatusKeys.detail(id),
		queryFn: () => employeeMaritalStatusApi.getById(id),
		enabled: !!id,
	});
