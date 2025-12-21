import { useQuery } from "@tanstack/react-query";
import { employeeFamilyApi } from "#web/api/employees/employee-family.api.ts";

export const employeeFamilyKeys = {
	all: ["employee-family"] as const,
	byEmployee: (employeeId: string) => [...employeeFamilyKeys.all, "employee", employeeId] as const,
	spouse: (employeeId: string) => [...employeeFamilyKeys.all, "spouse", employeeId] as const,
	children: (employeeId: string) => [...employeeFamilyKeys.all, "children", employeeId] as const,
	detail: (id: string) => [...employeeFamilyKeys.all, "detail", id] as const,
} as const;

export const useFamilyMembers = (employeeId: string) =>
	useQuery({
		queryKey: employeeFamilyKeys.byEmployee(employeeId),
		queryFn: () => employeeFamilyApi.getByEmployee(employeeId),
		enabled: !!employeeId,
	});

export const useSpouse = (employeeId: string) =>
	useQuery({
		queryKey: employeeFamilyKeys.spouse(employeeId),
		queryFn: () => employeeFamilyApi.getSpouse(employeeId),
		enabled: !!employeeId,
	});

export const useChildren = (employeeId: string) =>
	useQuery({
		queryKey: employeeFamilyKeys.children(employeeId),
		queryFn: () => employeeFamilyApi.getChildren(employeeId),
		enabled: !!employeeId,
	});

export const useFamilyMember = (id: string) =>
	useQuery({
		queryKey: employeeFamilyKeys.detail(id),
		queryFn: () => employeeFamilyApi.getById(id),
		enabled: !!id,
	});
