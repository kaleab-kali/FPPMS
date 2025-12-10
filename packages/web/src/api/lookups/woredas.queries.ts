import { useQuery } from "@tanstack/react-query";
import { woredasApi } from "#web/api/lookups/woredas.api.ts";

export const woredaKeys = {
	all: ["woredas"] as const,
	lists: () => [...woredaKeys.all, "list"] as const,
	list: (subCityId?: string) => [...woredaKeys.lists(), subCityId] as const,
	details: () => [...woredaKeys.all, "detail"] as const,
	detail: (id: string) => [...woredaKeys.details(), id] as const,
} as const;

export const useWoredas = (subCityId?: string) =>
	useQuery({
		queryKey: woredaKeys.list(subCityId),
		queryFn: () => woredasApi.getAll(subCityId),
	});

export const useWoreda = (id: string) =>
	useQuery({
		queryKey: woredaKeys.detail(id),
		queryFn: () => woredasApi.getById(id),
		enabled: !!id,
	});
