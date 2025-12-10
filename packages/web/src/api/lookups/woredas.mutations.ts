import { useMutation, useQueryClient } from "@tanstack/react-query";
import { woredasApi } from "#web/api/lookups/woredas.api.ts";
import { woredaKeys } from "#web/api/lookups/woredas.queries.ts";
import type { CreateWoredaRequest, UpdateWoredaRequest } from "#web/types/lookup.ts";

export const useCreateWoreda = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: CreateWoredaRequest) => woredasApi.create(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: woredaKeys.all });
		},
	});
};

export const useUpdateWoreda = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, data }: { id: string; data: UpdateWoredaRequest }) => woredasApi.update(id, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: woredaKeys.all });
		},
	});
};

export const useDeleteWoreda = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: string) => woredasApi.delete(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: woredaKeys.all });
		},
	});
};
