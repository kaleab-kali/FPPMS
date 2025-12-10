import { api } from "#web/lib/api-client.ts";
import type { CreateUserRequest, ResetPasswordRequest, UpdateUserRequest, User } from "#web/types/user.ts";

const BASE_URL = "/users";

export const usersApi = {
	getAll: () => api.get<User[]>(BASE_URL),
	getById: (id: string) => api.get<User>(`${BASE_URL}/${id}`),
	create: (data: CreateUserRequest) => api.post<User>(BASE_URL, data),
	update: (id: string, data: UpdateUserRequest) => api.patch<User>(`${BASE_URL}/${id}`, data),
	delete: (id: string) => api.delete<void>(`${BASE_URL}/${id}`),
	resetPassword: (id: string, data: ResetPasswordRequest) => api.patch<void>(`${BASE_URL}/${id}/reset-password`, data),
} as const;
