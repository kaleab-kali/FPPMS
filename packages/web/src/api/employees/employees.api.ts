import { api } from "#web/lib/api-client.ts";
import type {
	ChangeStatusRequest,
	CreateCivilianEmployeeRequest,
	CreateMilitaryEmployeeRequest,
	CreateTemporaryEmployeeRequest,
	Employee,
	EmployeeFilter,
	EmployeeListResponse,
	EmployeeStatistics,
	UpdateEmployeeRequest,
} from "#web/types/employee.ts";

const BASE_URL = "/employees";

const buildQueryString = (filter: EmployeeFilter): string => {
	const params = new URLSearchParams();
	if (filter.search) params.append("search", filter.search);
	if (filter.employeeType) params.append("employeeType", filter.employeeType);
	if (filter.status) params.append("status", filter.status);
	if (filter.gender) params.append("gender", filter.gender);
	if (filter.centerId) params.append("centerId", filter.centerId);
	if (filter.departmentId) params.append("departmentId", filter.departmentId);
	if (filter.positionId) params.append("positionId", filter.positionId);
	if (filter.rankId) params.append("rankId", filter.rankId);
	if (filter.page) params.append("page", String(filter.page));
	if (filter.pageSize) params.append("pageSize", String(filter.pageSize));
	const queryString = params.toString();
	return queryString ? `?${queryString}` : "";
};

export const employeesApi = {
	getAll: (filter: EmployeeFilter = {}) => api.get<EmployeeListResponse>(`${BASE_URL}${buildQueryString(filter)}`),

	getById: (id: string) => api.get<Employee>(`${BASE_URL}/${id}`),

	getByEmployeeId: (employeeId: string) =>
		api.get<Employee>(`${BASE_URL}/by-employee-id/${encodeURIComponent(employeeId)}`),

	getStatistics: () => api.get<EmployeeStatistics>(`${BASE_URL}/statistics`),

	createMilitary: (data: CreateMilitaryEmployeeRequest) => api.post<Employee>(`${BASE_URL}/military`, data),

	createCivilian: (data: CreateCivilianEmployeeRequest) => api.post<Employee>(`${BASE_URL}/civilian`, data),

	createTemporary: (data: CreateTemporaryEmployeeRequest) => api.post<Employee>(`${BASE_URL}/temporary`, data),

	update: (id: string, data: UpdateEmployeeRequest) => api.patch<Employee>(`${BASE_URL}/${id}`, data),

	delete: (id: string) => api.delete<{ message: string }>(`${BASE_URL}/${id}`),

	changeStatus: (id: string, data: ChangeStatusRequest) => api.patch<Employee>(`${BASE_URL}/${id}/status`, data),

	returnToActive: (id: string) => api.patch<Employee>(`${BASE_URL}/${id}/return-to-active`, {}),
} as const;
