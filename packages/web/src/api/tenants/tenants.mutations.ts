import { useMutation, useQueryClient } from "@tanstack/react-query";
import { tenantsApi } from "#web/api/tenants/tenants.api.ts";
import { tenantKeys } from "#web/api/tenants/tenants.queries.ts";
import type { CreateTenantRequest, UpdateTenantRequest } from "#web/types/tenant.ts";

export const useCreateTenantMutation = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: CreateTenantRequest) => tenantsApi.create(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: tenantKeys.all });
		},
	});
};

export const useUpdateTenantMutation = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, data }: { id: string; data: UpdateTenantRequest }) => tenantsApi.update(id, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: tenantKeys.all });
		},
	});
};

export const useDeleteTenantMutation = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: string) => tenantsApi.delete(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: tenantKeys.all });
		},
	});
};
