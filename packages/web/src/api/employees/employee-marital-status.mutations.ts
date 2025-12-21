import { useMutation, useQueryClient } from "@tanstack/react-query";
import { employeeMaritalStatusApi } from "#web/api/employees/employee-marital-status.api.ts";
import { employeeMaritalStatusKeys } from "#web/api/employees/employee-marital-status.queries.ts";
import type { CreateMaritalStatusRequest, UpdateMaritalStatusRequest } from "#web/types/employee-marital-status.ts";

export const useCreateMaritalStatus = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: CreateMaritalStatusRequest) => employeeMaritalStatusApi.create(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: employeeMaritalStatusKeys.all });
		},
	});
};

export const useUpdateMaritalStatus = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, data }: { id: string; data: UpdateMaritalStatusRequest }) =>
			employeeMaritalStatusApi.update(id, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: employeeMaritalStatusKeys.all });
		},
	});
};

export const useDeleteMaritalStatus = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: string) => employeeMaritalStatusApi.delete(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: employeeMaritalStatusKeys.all });
		},
	});
};
