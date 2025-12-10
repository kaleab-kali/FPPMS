import { api } from "#web/lib/api-client.ts";
import type { CreateRankRequest, Rank, UpdateRankRequest } from "#web/types/rank.ts";

const BASE_URL = "/ranks";

export const ranksApi = {
	getAll: (category?: string) => {
		const params = category ? `?category=${category}` : "";
		return api.get<Rank[]>(`${BASE_URL}${params}`);
	},
	getById: (id: string) => api.get<Rank>(`${BASE_URL}/${id}`),
	create: (data: CreateRankRequest) => api.post<Rank>(BASE_URL, data),
	update: (id: string, data: UpdateRankRequest) => api.patch<Rank>(`${BASE_URL}/${id}`, data),
	delete: (id: string) => api.delete<void>(`${BASE_URL}/${id}`),
} as const;
