import { useMutation, useQueryClient } from "@tanstack/react-query";
import { departmentsApi } from "#web/api/departments/departments.api.ts";
import { departmentKeys } from "#web/api/departments/departments.queries.ts";
import type { CreateDepartmentRequest, UpdateDepartmentRequest } from "#web/types/department.ts";

export const useCreateDepartment = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: CreateDepartmentRequest) => departmentsApi.create(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: departmentKeys.all });
		},
	});
};

export const useUpdateDepartment = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, data }: { id: string; data: UpdateDepartmentRequest }) => departmentsApi.update(id, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: departmentKeys.all });
		},
	});
};

export const useDeleteDepartment = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: string) => departmentsApi.delete(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: departmentKeys.all });
		},
	});
};
