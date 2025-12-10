import { useQuery } from "@tanstack/react-query";
import { rolesApi } from "#web/api/roles/roles.api.ts";

export const roleKeys = {
	all: ["roles"] as const,
	lists: () => [...roleKeys.all, "list"] as const,
	list: () => [...roleKeys.lists()] as const,
	details: () => [...roleKeys.all, "detail"] as const,
	detail: (id: string) => [...roleKeys.details(), id] as const,
	permissions: () => [...roleKeys.all, "permissions"] as const,
} as const;

export const useRoles = () =>
	useQuery({
		queryKey: roleKeys.list(),
		queryFn: () => rolesApi.getAll(),
	});

export const useRole = (id: string) =>
	useQuery({
		queryKey: roleKeys.detail(id),
		queryFn: () => rolesApi.getById(id),
		enabled: !!id,
	});

export const usePermissions = () =>
	useQuery({
		queryKey: roleKeys.permissions(),
		queryFn: () => rolesApi.getPermissions(),
	});
