import { useQuery } from "@tanstack/react-query";
import { tenantsApi } from "#web/api/tenants/tenants.api.ts";

export const tenantKeys = {
	all: ["tenants"] as const,
	lists: () => [...tenantKeys.all, "list"] as const,
	list: () => [...tenantKeys.lists()] as const,
	details: () => [...tenantKeys.all, "detail"] as const,
	detail: (id: string) => [...tenantKeys.details(), id] as const,
} as const;

export const useTenantsQuery = () =>
	useQuery({
		queryKey: tenantKeys.list(),
		queryFn: () => tenantsApi.getAll(),
	});

export const useTenants = useTenantsQuery;

export const useTenantQuery = (id: string) =>
	useQuery({
		queryKey: tenantKeys.detail(id),
		queryFn: () => tenantsApi.getById(id),
		enabled: !!id,
	});
