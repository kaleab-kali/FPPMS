import axios from "axios";
import { APP_CONFIG, STORAGE_KEYS } from "#web/config/constants.ts";
import { apiClient } from "#web/lib/api-client.ts";
import type { CreateEmployeePhotoRequest, EmployeePhoto } from "#web/types/employee-photo.ts";

const BASE_URL = "/employees/photos";

export const employeePhotoApi = {
	getActiveByEmployee: (employeeId: string) =>
		apiClient.get<EmployeePhoto | null>(`${BASE_URL}/employee/${employeeId}/active`).then((res) => res.data),

	getPhotoHistory: (employeeId: string) =>
		apiClient.get<EmployeePhoto[]>(`${BASE_URL}/employee/${employeeId}/history`).then((res) => res.data),

	getPhotoUrl: (photoId: string) => `${APP_CONFIG.apiBaseUrl}${BASE_URL}/file/${photoId}`,

	upload: (data: CreateEmployeePhotoRequest, file: File) => {
		const formData = new FormData();
		formData.append("file", file);
		formData.append("employeeId", data.employeeId);
		formData.append("captureMethod", data.captureMethod);

		const token = globalThis.localStorage.getItem(STORAGE_KEYS.accessToken);

		return axios
			.post<EmployeePhoto>(`${APP_CONFIG.apiBaseUrl}${BASE_URL}/upload`, formData, {
				headers: {
					Authorization: token ? `Bearer ${token}` : undefined,
				},
			})
			.then((res) => res.data);
	},

	delete: (id: string) => apiClient.delete<{ message: string }>(`${BASE_URL}/${id}`).then((res) => res.data),
} as const;
