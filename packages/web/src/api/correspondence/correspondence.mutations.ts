import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { CreateCorrespondenceDto, UpdateCorrespondenceDto } from "#web/types/correspondence";
import { correspondenceApi } from "./correspondence.api";
import { correspondenceKeys } from "./correspondence.queries";

export const useCreateCorrespondence = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (dto: CreateCorrespondenceDto) => correspondenceApi.create(dto),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: correspondenceKeys.all });
		},
	});
};

export const useUpdateCorrespondence = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, dto }: { id: string; dto: UpdateCorrespondenceDto }) => correspondenceApi.update(id, dto),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({ queryKey: correspondenceKeys.detail(variables.id) });
			queryClient.invalidateQueries({ queryKey: correspondenceKeys.lists() });
		},
	});
};

export const useMarkAsResponded = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, responseDate }: { id: string; responseDate?: string }) =>
			correspondenceApi.markAsResponded(id, responseDate),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({ queryKey: correspondenceKeys.detail(variables.id) });
			queryClient.invalidateQueries({ queryKey: correspondenceKeys.lists() });
		},
	});
};
