import { api } from "#web/lib/api-client.ts";
import type {
	CreateMedicalRecordRequest,
	EligibleFamilyMember,
	MedicalRecord,
	MedicalStats,
	UpdateMedicalRecordRequest,
} from "#web/types/employee-medical.ts";

const BASE_URL = "/employees/medical";

export const employeeMedicalApi = {
	getByEmployee: (employeeId: string) => api.get<MedicalRecord[]>(`${BASE_URL}/employee/${employeeId}`),

	getStats: (employeeId: string) => api.get<MedicalStats>(`${BASE_URL}/employee/${employeeId}/stats`),

	getEligibleFamily: (employeeId: string) =>
		api.get<EligibleFamilyMember[]>(`${BASE_URL}/employee/${employeeId}/eligible-family`),

	getById: (id: string) => api.get<MedicalRecord>(`${BASE_URL}/${id}`),

	create: (data: CreateMedicalRecordRequest) => api.post<MedicalRecord>(BASE_URL, data),

	update: (id: string, data: UpdateMedicalRecordRequest) => api.patch<MedicalRecord>(`${BASE_URL}/${id}`, data),

	delete: (id: string) => api.delete<{ message: string }>(`${BASE_URL}/${id}`),
} as const;
