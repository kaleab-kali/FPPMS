import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ranksApi } from "#web/api/ranks/ranks.api.ts";
import { rankKeys } from "#web/api/ranks/ranks.queries.ts";
import type { CreateRankRequest, UpdateRankRequest } from "#web/types/rank.ts";

export const useCreateRank = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: CreateRankRequest) => ranksApi.create(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: rankKeys.all });
		},
	});
};

export const useUpdateRank = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, data }: { id: string; data: UpdateRankRequest }) => ranksApi.update(id, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: rankKeys.all });
		},
	});
};

export const useDeleteRank = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: string) => ranksApi.delete(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: rankKeys.all });
		},
	});
};
