import { api } from "#web/lib/api-client.ts";
import type { CreateTenantRequest, Tenant, UpdateTenantRequest } from "#web/types/tenant.ts";

const BASE_URL = "/tenants";

export const tenantsApi = {
	getAll: () => api.get<Tenant[]>(BASE_URL),

	getById: (id: string) => api.get<Tenant>(`${BASE_URL}/${id}`),

	create: (data: CreateTenantRequest) => api.post<Tenant>(BASE_URL, data),

	update: (id: string, data: UpdateTenantRequest) => api.patch<Tenant>(`${BASE_URL}/${id}`, data),

	delete: (id: string) => api.delete<void>(`${BASE_URL}/${id}`),
};
