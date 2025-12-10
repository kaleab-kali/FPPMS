import { useMutation, useQueryClient } from "@tanstack/react-query";
import { rolesApi } from "#web/api/roles/roles.api.ts";
import { roleKeys } from "#web/api/roles/roles.queries.ts";
import type { CreateRoleRequest, UpdateRoleRequest } from "#web/types/role.ts";

export const useCreateRole = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: CreateRoleRequest) => rolesApi.create(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: roleKeys.all });
		},
	});
};

export const useUpdateRole = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, data }: { id: string; data: UpdateRoleRequest }) => rolesApi.update(id, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: roleKeys.all });
		},
	});
};

export const useDeleteRole = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: string) => rolesApi.delete(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: roleKeys.all });
		},
	});
};
