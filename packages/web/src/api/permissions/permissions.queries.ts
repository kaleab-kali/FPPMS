import { useQuery } from "@tanstack/react-query";
import { apiClient } from "#web/lib/api-client.ts";
import type { Permission } from "#web/types/permission.ts";

const PERMISSIONS_QUERY_KEY = "permissions";

export const usePermissions = () =>
	useQuery({
		queryKey: [PERMISSIONS_QUERY_KEY],
		queryFn: async () => {
			const response = await apiClient.get<Permission[]>("/permissions");
			return response.data;
		},
	});

export const usePermissionModules = () =>
	useQuery({
		queryKey: [PERMISSIONS_QUERY_KEY, "modules"],
		queryFn: async () => {
			const response = await apiClient.get<string[]>("/permissions/modules");
			return response.data;
		},
	});
