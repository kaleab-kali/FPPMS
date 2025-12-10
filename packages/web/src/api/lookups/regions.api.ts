import { api } from "#web/lib/api-client.ts";
import type { CreateRegionRequest, Region, UpdateRegionRequest } from "#web/types/lookup.ts";

const BASE_URL = "/lookups/regions";

export const regionsApi = {
	getAll: () => api.get<Region[]>(BASE_URL),
	getById: (id: string) => api.get<Region>(`${BASE_URL}/${id}`),
	create: (data: CreateRegionRequest) => api.post<Region>(BASE_URL, data),
	update: (id: string, data: UpdateRegionRequest) => api.patch<Region>(`${BASE_URL}/${id}`, data),
	delete: (id: string) => api.delete<void>(`${BASE_URL}/${id}`),
} as const;
