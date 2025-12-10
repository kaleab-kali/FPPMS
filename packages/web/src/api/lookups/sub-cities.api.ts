import { api } from "#web/lib/api-client.ts";
import type { CreateSubCityRequest, SubCity, UpdateSubCityRequest } from "#web/types/lookup.ts";

const BASE_URL = "/lookups/sub-cities";

export const subCitiesApi = {
	getAll: (regionId?: string) => {
		const params = regionId ? `?regionId=${regionId}` : "";
		return api.get<SubCity[]>(`${BASE_URL}${params}`);
	},
	getById: (id: string) => api.get<SubCity>(`${BASE_URL}/${id}`),
	create: (data: CreateSubCityRequest) => api.post<SubCity>(BASE_URL, data),
	update: (id: string, data: UpdateSubCityRequest) => api.patch<SubCity>(`${BASE_URL}/${id}`, data),
	delete: (id: string) => api.delete<void>(`${BASE_URL}/${id}`),
} as const;
