import { api } from "#web/lib/api-client.ts";
import type { Center, CreateCenterRequest, UpdateCenterRequest } from "#web/types/center.ts";

const BASE_URL = "/centers";

export const centersApi = {
	getAll: () => api.get<Center[]>(BASE_URL),
	getById: (id: string) => api.get<Center>(`${BASE_URL}/${id}`),
	create: (data: CreateCenterRequest) => api.post<Center>(BASE_URL, data),
	update: (id: string, data: UpdateCenterRequest) => api.patch<Center>(`${BASE_URL}/${id}`, data),
	delete: (id: string) => api.delete<void>(`${BASE_URL}/${id}`),
};
