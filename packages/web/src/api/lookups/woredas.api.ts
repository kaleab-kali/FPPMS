import { api } from "#web/lib/api-client.ts";
import type { CreateWoredaRequest, UpdateWoredaRequest, Woreda } from "#web/types/lookup.ts";

const BASE_URL = "/lookups/woredas";

export const woredasApi = {
	getAll: (subCityId?: string) => {
		const params = subCityId ? `?subCityId=${subCityId}` : "";
		return api.get<Woreda[]>(`${BASE_URL}${params}`);
	},
	getById: (id: string) => api.get<Woreda>(`${BASE_URL}/${id}`),
	create: (data: CreateWoredaRequest) => api.post<Woreda>(BASE_URL, data),
	update: (id: string, data: UpdateWoredaRequest) => api.patch<Woreda>(`${BASE_URL}/${id}`, data),
	delete: (id: string) => api.delete<void>(`${BASE_URL}/${id}`),
} as const;
