import { useMutation, useQueryClient } from "@tanstack/react-query";
import { centersApi } from "#web/api/centers/centers.api.ts";
import { centerKeys } from "#web/api/centers/centers.queries.ts";
import type { CreateCenterRequest, UpdateCenterRequest } from "#web/types/center.ts";

export const useCreateCenter = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: CreateCenterRequest) => centersApi.create(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: centerKeys.all });
		},
	});
};

export const useUpdateCenter = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, data }: { id: string; data: UpdateCenterRequest }) => centersApi.update(id, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: centerKeys.all });
		},
	});
};

export const useDeleteCenter = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: string) => centersApi.delete(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: centerKeys.all });
		},
	});
};
