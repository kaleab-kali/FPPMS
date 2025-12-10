import { useMutation, useQueryClient } from "@tanstack/react-query";
import { subCitiesApi } from "#web/api/lookups/sub-cities.api.ts";
import { subCityKeys } from "#web/api/lookups/sub-cities.queries.ts";
import type { CreateSubCityRequest, UpdateSubCityRequest } from "#web/types/lookup.ts";

export const useCreateSubCity = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: CreateSubCityRequest) => subCitiesApi.create(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: subCityKeys.all });
		},
	});
};

export const useUpdateSubCity = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, data }: { id: string; data: UpdateSubCityRequest }) => subCitiesApi.update(id, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: subCityKeys.all });
		},
	});
};

export const useDeleteSubCity = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: string) => subCitiesApi.delete(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: subCityKeys.all });
		},
	});
};
