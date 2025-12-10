import { useQuery } from "@tanstack/react-query";
import { subCitiesApi } from "#web/api/lookups/sub-cities.api.ts";

export const subCityKeys = {
	all: ["subCities"] as const,
	lists: () => [...subCityKeys.all, "list"] as const,
	list: (regionId?: string) => [...subCityKeys.lists(), regionId] as const,
	details: () => [...subCityKeys.all, "detail"] as const,
	detail: (id: string) => [...subCityKeys.details(), id] as const,
} as const;

export const useSubCities = (regionId?: string) =>
	useQuery({
		queryKey: subCityKeys.list(regionId),
		queryFn: () => subCitiesApi.getAll(regionId),
	});

export const useSubCity = (id: string) =>
	useQuery({
		queryKey: subCityKeys.detail(id),
		queryFn: () => subCitiesApi.getById(id),
		enabled: !!id,
	});
