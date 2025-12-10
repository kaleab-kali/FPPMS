import { useQuery } from "@tanstack/react-query";
import { centersApi } from "#web/api/centers/centers.api.ts";

export const centerKeys = {
	all: ["centers"] as const,
	lists: () => [...centerKeys.all, "list"] as const,
	list: () => [...centerKeys.lists()] as const,
	details: () => [...centerKeys.all, "detail"] as const,
	detail: (id: string) => [...centerKeys.details(), id] as const,
} as const;

export const useCenters = () =>
	useQuery({
		queryKey: centerKeys.list(),
		queryFn: centersApi.getAll,
	});

export const useCenter = (id: string) =>
	useQuery({
		queryKey: centerKeys.detail(id),
		queryFn: () => centersApi.getById(id),
		enabled: !!id,
	});
