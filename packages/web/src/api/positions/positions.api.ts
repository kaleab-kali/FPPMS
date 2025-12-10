import { api } from "#web/lib/api-client.ts";
import type { CreatePositionRequest, Position, UpdatePositionRequest } from "#web/types/position.ts";

const BASE_URL = "/positions";

export const positionsApi = {
	getAll: (departmentId?: string) => {
		const params = departmentId ? `?departmentId=${departmentId}` : "";
		return api.get<Position[]>(`${BASE_URL}${params}`);
	},
	getById: (id: string) => api.get<Position>(`${BASE_URL}/${id}`),
	create: (data: CreatePositionRequest) => api.post<Position>(BASE_URL, data),
	update: (id: string, data: UpdatePositionRequest) => api.patch<Position>(`${BASE_URL}/${id}`, data),
	delete: (id: string) => api.delete<void>(`${BASE_URL}/${id}`),
} as const;
