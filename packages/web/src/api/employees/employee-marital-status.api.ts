import { api } from "#web/lib/api-client.ts";
import type {
	CreateMaritalStatusRequest,
	CurrentMaritalStatus,
	MaritalStatusRecord,
	UpdateMaritalStatusRequest,
} from "#web/types/employee-marital-status.ts";

const BASE_URL = "/employees/marital-status";

export const employeeMaritalStatusApi = {
	getByEmployee: (employeeId: string) => api.get<MaritalStatusRecord[]>(`${BASE_URL}/employee/${employeeId}`),

	getCurrentStatus: (employeeId: string) => api.get<CurrentMaritalStatus>(`${BASE_URL}/employee/${employeeId}/current`),

	getById: (id: string) => api.get<MaritalStatusRecord>(`${BASE_URL}/${id}`),

	create: (data: CreateMaritalStatusRequest) => api.post<MaritalStatusRecord>(BASE_URL, data),

	update: (id: string, data: UpdateMaritalStatusRequest) => api.patch<MaritalStatusRecord>(`${BASE_URL}/${id}`, data),

	delete: (id: string) => api.delete<{ message: string }>(`${BASE_URL}/${id}`),
} as const;
