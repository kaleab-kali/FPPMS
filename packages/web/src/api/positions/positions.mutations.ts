import { useMutation, useQueryClient } from "@tanstack/react-query";
import { positionsApi } from "#web/api/positions/positions.api.ts";
import { positionKeys } from "#web/api/positions/positions.queries.ts";
import type { CreatePositionRequest, UpdatePositionRequest } from "#web/types/position.ts";

export const useCreatePosition = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: CreatePositionRequest) => positionsApi.create(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: positionKeys.all });
		},
	});
};

export const useUpdatePosition = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, data }: { id: string; data: UpdatePositionRequest }) => positionsApi.update(id, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: positionKeys.all });
		},
	});
};

export const useDeletePosition = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: string) => positionsApi.delete(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: positionKeys.all });
		},
	});
};
