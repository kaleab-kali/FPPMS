import { useQuery } from "@tanstack/react-query";
import { ranksApi } from "#web/api/ranks/ranks.api.ts";

export const rankKeys = {
	all: ["ranks"] as const,
	lists: () => [...rankKeys.all, "list"] as const,
	list: (category?: string) => [...rankKeys.lists(), { category }] as const,
	details: () => [...rankKeys.all, "detail"] as const,
	detail: (id: string) => [...rankKeys.details(), id] as const,
} as const;

export const useRanks = (category?: string) =>
	useQuery({
		queryKey: rankKeys.list(category),
		queryFn: () => ranksApi.getAll(category),
	});

export const useRank = (id: string) =>
	useQuery({
		queryKey: rankKeys.detail(id),
		queryFn: () => ranksApi.getById(id),
		enabled: !!id,
	});
