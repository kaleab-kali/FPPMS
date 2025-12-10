import { useQuery } from "@tanstack/react-query";
import { usersApi } from "#web/api/users/users.api.ts";

export const userKeys = {
	all: ["users"] as const,
	lists: () => [...userKeys.all, "list"] as const,
	list: () => [...userKeys.lists()] as const,
	details: () => [...userKeys.all, "detail"] as const,
	detail: (id: string) => [...userKeys.details(), id] as const,
} as const;

export const useUsers = () =>
	useQuery({
		queryKey: userKeys.list(),
		queryFn: () => usersApi.getAll(),
	});

export const useUser = (id: string) =>
	useQuery({
		queryKey: userKeys.detail(id),
		queryFn: () => usersApi.getById(id),
		enabled: !!id,
	});
