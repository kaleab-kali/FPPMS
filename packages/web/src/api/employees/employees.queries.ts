import { useQuery } from "@tanstack/react-query";
import { employeesApi } from "#web/api/employees/employees.api.ts";
import type { EmployeeFilter } from "#web/types/employee.ts";

export const employeeKeys = {
	all: ["employees"] as const,
	lists: () => [...employeeKeys.all, "list"] as const,
	list: (filter: EmployeeFilter) => [...employeeKeys.lists(), filter] as const,
	details: () => [...employeeKeys.all, "detail"] as const,
	detail: (id: string) => [...employeeKeys.details(), id] as const,
	byEmployeeId: (employeeId: string) => [...employeeKeys.all, "byEmployeeId", employeeId] as const,
	statistics: () => [...employeeKeys.all, "statistics"] as const,
} as const;

export const useEmployees = (filter: EmployeeFilter = {}) =>
	useQuery({
		queryKey: employeeKeys.list(filter),
		queryFn: () => employeesApi.getAll(filter),
	});

export const useEmployee = (id: string) =>
	useQuery({
		queryKey: employeeKeys.detail(id),
		queryFn: () => employeesApi.getById(id),
		enabled: !!id,
	});

export const useEmployeeByEmployeeId = (employeeId: string) =>
	useQuery({
		queryKey: employeeKeys.byEmployeeId(employeeId),
		queryFn: () => employeesApi.getByEmployeeId(employeeId),
		enabled: !!employeeId,
	});

export const useEmployeeStatistics = () =>
	useQuery({
		queryKey: employeeKeys.statistics(),
		queryFn: () => employeesApi.getStatistics(),
	});
