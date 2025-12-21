import { api } from "#web/lib/api-client.ts";
import type { CreateFamilyMemberRequest, FamilyMember, UpdateFamilyMemberRequest } from "#web/types/employee-family.ts";

const BASE_URL = "/employees/family";

export const employeeFamilyApi = {
	getByEmployee: (employeeId: string) => api.get<FamilyMember[]>(`${BASE_URL}/employee/${employeeId}`),

	getSpouse: (employeeId: string) => api.get<FamilyMember | null>(`${BASE_URL}/employee/${employeeId}/spouse`),

	getChildren: (employeeId: string) => api.get<FamilyMember[]>(`${BASE_URL}/employee/${employeeId}/children`),

	getById: (id: string) => api.get<FamilyMember>(`${BASE_URL}/${id}`),

	create: (data: CreateFamilyMemberRequest) => api.post<FamilyMember>(BASE_URL, data),

	update: (id: string, data: UpdateFamilyMemberRequest) => api.patch<FamilyMember>(`${BASE_URL}/${id}`, data),

	delete: (id: string) => api.delete<{ message: string }>(`${BASE_URL}/${id}`),
} as const;
