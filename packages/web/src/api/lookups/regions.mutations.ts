import { useMutation, useQueryClient } from "@tanstack/react-query";
import { regionsApi } from "#web/api/lookups/regions.api.ts";
import { regionKeys } from "#web/api/lookups/regions.queries.ts";
import type { CreateRegionRequest, UpdateRegionRequest } from "#web/types/lookup.ts";

export const useCreateRegion = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: CreateRegionRequest) => regionsApi.create(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: regionKeys.all });
		},
	});
};

export const useUpdateRegion = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, data }: { id: string; data: UpdateRegionRequest }) => regionsApi.update(id, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: regionKeys.all });
		},
	});
};

export const useDeleteRegion = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: string) => regionsApi.delete(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: regionKeys.all });
		},
	});
};
