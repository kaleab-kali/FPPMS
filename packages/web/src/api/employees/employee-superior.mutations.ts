import { useMutation, useQueryClient } from "@tanstack/react-query";
import { employeeSuperiorApi } from "#web/api/employees/employee-superior.api.ts";
import { employeeSuperiorKeys } from "#web/api/employees/employee-superior.queries.ts";
import type { AssignSuperiorDto, BulkAssignSuperiorDto, RemoveSuperiorDto } from "#web/types/employee-superior.ts";

export const useAssignSuperior = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ employeeId, data }: { employeeId: string; data: AssignSuperiorDto }) =>
			employeeSuperiorApi.assignSuperior(employeeId, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: employeeSuperiorKeys.all });
		},
	});
};

export const useBulkAssignSuperior = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: BulkAssignSuperiorDto) => employeeSuperiorApi.bulkAssignSuperior(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: employeeSuperiorKeys.all });
		},
	});
};

export const useRemoveSuperior = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ employeeId, data }: { employeeId: string; data: RemoveSuperiorDto }) =>
			employeeSuperiorApi.removeSuperior(employeeId, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: employeeSuperiorKeys.all });
		},
	});
};
