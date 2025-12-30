import { useQuery } from "@tanstack/react-query";
import { employeeSuperiorApi } from "#web/api/employees/employee-superior.api.ts";

export const employeeSuperiorKeys = {
	all: ["employee-superior"] as const,
	assignments: () => [...employeeSuperiorKeys.all, "assignments"] as const,
	assignmentList: (centerId?: string) => [...employeeSuperiorKeys.assignments(), { centerId }] as const,
	orgChart: (centerId?: string, rootEmployeeId?: string) =>
		[...employeeSuperiorKeys.all, "org-chart", { centerId, rootEmployeeId }] as const,
	directSuperior: (employeeId: string) => [...employeeSuperiorKeys.all, "direct", employeeId] as const,
	subordinates: (employeeId: string) => [...employeeSuperiorKeys.all, "subordinates", employeeId] as const,
	chain: (employeeId: string) => [...employeeSuperiorKeys.all, "chain", employeeId] as const,
	history: (employeeId: string) => [...employeeSuperiorKeys.all, "history", employeeId] as const,
} as const;

export const useSuperiorAssignmentList = (centerId?: string) =>
	useQuery({
		queryKey: employeeSuperiorKeys.assignmentList(centerId),
		queryFn: () => employeeSuperiorApi.getAssignmentList(centerId),
	});

export const useOrgChart = (centerId?: string, rootEmployeeId?: string, enabled = true) =>
	useQuery({
		queryKey: employeeSuperiorKeys.orgChart(centerId, rootEmployeeId),
		queryFn: () => employeeSuperiorApi.getOrgChart(centerId, rootEmployeeId),
		enabled,
	});

export const useDirectSuperior = (employeeId: string, enabled = true) =>
	useQuery({
		queryKey: employeeSuperiorKeys.directSuperior(employeeId),
		queryFn: () => employeeSuperiorApi.getDirectSuperior(employeeId),
		enabled: enabled && !!employeeId,
	});

export const useSubordinates = (employeeId: string, enabled = true) =>
	useQuery({
		queryKey: employeeSuperiorKeys.subordinates(employeeId),
		queryFn: () => employeeSuperiorApi.getSubordinates(employeeId),
		enabled: enabled && !!employeeId,
	});

export const useSuperiorChain = (employeeId: string, enabled = true) =>
	useQuery({
		queryKey: employeeSuperiorKeys.chain(employeeId),
		queryFn: () => employeeSuperiorApi.getSuperiorChain(employeeId),
		enabled: enabled && !!employeeId,
	});

export const useSuperiorHistory = (employeeId: string, enabled = true) =>
	useQuery({
		queryKey: employeeSuperiorKeys.history(employeeId),
		queryFn: () => employeeSuperiorApi.getAssignmentHistory(employeeId),
		enabled: enabled && !!employeeId,
	});
