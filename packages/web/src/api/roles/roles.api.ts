import { api } from "#web/lib/api-client.ts";
import type { CreateRoleRequest, Role, UpdateRoleRequest } from "#web/types/role.ts";

const BASE_URL = "/roles";

export const rolesApi = {
	getAll: () => api.get<Role[]>(BASE_URL),
	getById: (id: string) => api.get<Role>(`${BASE_URL}/${id}`),
	create: (data: CreateRoleRequest) => api.post<Role>(BASE_URL, data),
	update: (id: string, data: UpdateRoleRequest) => api.patch<Role>(`${BASE_URL}/${id}`, data),
	delete: (id: string) => api.delete<void>(`${BASE_URL}/${id}`),
	getPermissions: () => api.get<string[]>(`${BASE_URL}/permissions`),
} as const;
