import { api } from "#web/lib/api-client.ts";
import type {
	AvailableEmployee,
	ChangeUserStatusRequest,
	CreateUserFromEmployeeRequest,
	CreateUserFromEmployeeResponse,
	CreateUserRequest,
	ResetPasswordResponse,
	UpdateUserRequest,
	User,
} from "#web/types/user.ts";

const BASE_URL = "/users";

export const usersApi = {
	getAll: () => api.get<User[]>(BASE_URL),
	getById: (id: string) => api.get<User>(`${BASE_URL}/${id}`),
	getAvailableEmployees: (search?: string) =>
		api.get<AvailableEmployee[]>(`${BASE_URL}/available-employees`, { params: { search } }),
	create: (data: CreateUserRequest) => api.post<User>(BASE_URL, data),
	createFromEmployee: (data: CreateUserFromEmployeeRequest) =>
		api.post<CreateUserFromEmployeeResponse>(`${BASE_URL}/from-employee`, data),
	update: (id: string, data: UpdateUserRequest) => api.patch<User>(`${BASE_URL}/${id}`, data),
	delete: (id: string) => api.delete<void>(`${BASE_URL}/${id}`),
	unlock: (id: string) => api.post<{ message: string }>(`${BASE_URL}/${id}/unlock`),
	resetPassword: (id: string) => api.post<ResetPasswordResponse>(`${BASE_URL}/${id}/reset-password`),
	changeStatus: (id: string, data: ChangeUserStatusRequest) => api.post<User>(`${BASE_URL}/${id}/change-status`, data),
} as const;
