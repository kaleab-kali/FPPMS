import { api } from "#web/lib/api-client.ts";
import type {
	CreateSalaryScaleRequest,
	SalaryScaleListItem,
	SalaryScaleRank,
	SalaryScaleStatus,
	SalaryScaleVersion,
	UpdateSalaryScaleRequest,
} from "#web/types/salary-scale.ts";

const BASE_URL = "/salary-scales";

export const salaryScaleApi = {
	getAll: (status?: SalaryScaleStatus) => {
		const params = status ? `?status=${status}` : "";
		return api.get<SalaryScaleListItem[]>(`${BASE_URL}${params}`);
	},
	getById: (id: string) => api.get<SalaryScaleVersion>(`${BASE_URL}/${id}`),
	getActive: () => api.get<SalaryScaleVersion | null>(`${BASE_URL}/active`),
	getRankSalary: (scaleId: string, rankCode: string) =>
		api.get<SalaryScaleRank | null>(`${BASE_URL}/${scaleId}/ranks/${rankCode}`),
	create: (data: CreateSalaryScaleRequest) => api.post<SalaryScaleVersion>(BASE_URL, data),
	update: (id: string, data: UpdateSalaryScaleRequest) => api.patch<SalaryScaleVersion>(`${BASE_URL}/${id}`, data),
	activate: (id: string) => api.post<SalaryScaleVersion>(`${BASE_URL}/${id}/activate`),
	archive: (id: string) => api.post<SalaryScaleVersion>(`${BASE_URL}/${id}/archive`),
	duplicate: (id: string, newCode: string) =>
		api.post<SalaryScaleVersion>(`${BASE_URL}/${id}/duplicate?newCode=${encodeURIComponent(newCode)}`),
	delete: (id: string) => api.delete<{ message: string }>(`${BASE_URL}/${id}`),
} as const;
