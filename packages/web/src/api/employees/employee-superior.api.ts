import { api } from "#web/lib/api-client.ts";
import type {
	AssignSuperiorDto,
	BulkAssignSuperiorDto,
	EmployeeBasicInfo,
	EmployeeWithSuperior,
	OrgChartNode,
	RemoveSuperiorDto,
	SuperiorAssignmentHistory,
} from "#web/types/employee-superior.ts";

const BASE_URL = "/employee-superior";

export const employeeSuperiorApi = {
	getAssignmentList: (centerId?: string) =>
		api.get<EmployeeWithSuperior[]>(`${BASE_URL}/assignments`, {
			params: centerId ? { centerId } : undefined,
		}),

	getOrgChart: (centerId?: string, rootEmployeeId?: string) =>
		api.get<OrgChartNode[]>(`${BASE_URL}/org-chart`, {
			params: { ...(centerId && { centerId }), ...(rootEmployeeId && { rootEmployeeId }) },
		}),

	bulkAssignSuperior: (data: BulkAssignSuperiorDto) =>
		api.post<{ updated: number }>(`${BASE_URL}/bulk-assign`, data),

	getDirectSuperior: (employeeId: string) => api.get<EmployeeBasicInfo | null>(`${BASE_URL}/${employeeId}`),

	assignSuperior: (employeeId: string, data: AssignSuperiorDto) =>
		api.patch<{ success: boolean }>(`${BASE_URL}/${employeeId}`, data),

	removeSuperior: (employeeId: string, data: RemoveSuperiorDto) =>
		api.request<{ success: boolean }>({ method: "DELETE", url: `${BASE_URL}/${employeeId}`, data }),

	getSubordinates: (employeeId: string) => api.get<EmployeeBasicInfo[]>(`${BASE_URL}/${employeeId}/subordinates`),

	getSuperiorChain: (employeeId: string) => api.get<EmployeeBasicInfo[]>(`${BASE_URL}/${employeeId}/chain`),

	getAssignmentHistory: (employeeId: string) =>
		api.get<SuperiorAssignmentHistory[]>(`${BASE_URL}/${employeeId}/history`),
} as const;
