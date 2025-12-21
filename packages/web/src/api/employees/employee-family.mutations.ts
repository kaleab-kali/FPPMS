import { useMutation, useQueryClient } from "@tanstack/react-query";
import { employeeFamilyApi } from "#web/api/employees/employee-family.api.ts";
import { employeeFamilyKeys } from "#web/api/employees/employee-family.queries.ts";
import type { CreateFamilyMemberRequest, UpdateFamilyMemberRequest } from "#web/types/employee-family.ts";

export const useCreateFamilyMember = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: CreateFamilyMemberRequest) => employeeFamilyApi.create(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: employeeFamilyKeys.all });
		},
	});
};

export const useUpdateFamilyMember = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, data }: { id: string; data: UpdateFamilyMemberRequest }) => employeeFamilyApi.update(id, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: employeeFamilyKeys.all });
		},
	});
};

export const useDeleteFamilyMember = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: string) => employeeFamilyApi.delete(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: employeeFamilyKeys.all });
		},
	});
};
