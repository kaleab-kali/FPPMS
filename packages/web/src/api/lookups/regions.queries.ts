import { useQuery } from "@tanstack/react-query";
import { regionsApi } from "#web/api/lookups/regions.api.ts";

export const regionKeys = {
	all: ["regions"] as const,
	lists: () => [...regionKeys.all, "list"] as const,
	list: () => [...regionKeys.lists()] as const,
	details: () => [...regionKeys.all, "detail"] as const,
	detail: (id: string) => [...regionKeys.details(), id] as const,
} as const;

export const useRegions = () =>
	useQuery({
		queryKey: regionKeys.list(),
		queryFn: () => regionsApi.getAll(),
	});

export const useRegion = (id: string) =>
	useQuery({
		queryKey: regionKeys.detail(id),
		queryFn: () => regionsApi.getById(id),
		enabled: !!id,
	});
