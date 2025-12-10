import { api } from "#web/lib/api-client.ts";
import type { CreateDepartmentRequest, Department, UpdateDepartmentRequest } from "#web/types/department.ts";

const BASE_URL = "/departments";

export const departmentsApi = {
	getAll: (centerId?: string) => {
		const params = centerId ? `?centerId=${centerId}` : "";
		return api.get<Department[]>(`${BASE_URL}${params}`);
	},
	getById: (id: string) => api.get<Department>(`${BASE_URL}/${id}`),
	create: (data: CreateDepartmentRequest) => api.post<Department>(BASE_URL, data),
	update: (id: string, data: UpdateDepartmentRequest) => api.patch<Department>(`${BASE_URL}/${id}`, data),
	delete: (id: string) => api.delete<void>(`${BASE_URL}/${id}`),
} as const;
