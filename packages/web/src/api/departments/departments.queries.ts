import { useQuery } from "@tanstack/react-query";
import { departmentsApi } from "#web/api/departments/departments.api.ts";

export const departmentKeys = {
	all: ["departments"] as const,
	lists: () => [...departmentKeys.all, "list"] as const,
	list: (centerId?: string) => [...departmentKeys.lists(), centerId] as const,
	details: () => [...departmentKeys.all, "detail"] as const,
	detail: (id: string) => [...departmentKeys.details(), id] as const,
} as const;

export const useDepartments = (centerId?: string) =>
	useQuery({
		queryKey: departmentKeys.list(centerId),
		queryFn: () => departmentsApi.getAll(centerId),
	});

export const useDepartment = (id: string) =>
	useQuery({
		queryKey: departmentKeys.detail(id),
		queryFn: () => departmentsApi.getById(id),
		enabled: !!id,
	});
