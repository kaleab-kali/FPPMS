import axios, { type AxiosError, type AxiosRequestConfig, type InternalAxiosRequestConfig } from "axios";
import { APP_CONFIG, HTTP_STATUS, STORAGE_KEYS } from "#web/config/constants.ts";

export const apiClient = axios.create({
	baseURL: APP_CONFIG.apiBaseUrl,
	headers: {
		"Content-Type": "application/json",
	},
});

const getAccessToken = () => globalThis.localStorage.getItem(STORAGE_KEYS.accessToken);

const handleRequestInterceptor = (config: InternalAxiosRequestConfig) => {
	const token = getAccessToken();
	if (token) {
		config.headers.Authorization = `Bearer ${token}`;
	}
	return config;
};

const handleResponseError = async (error: AxiosError) => {
	if (error.response?.status === HTTP_STATUS.unauthorized) {
		globalThis.localStorage.removeItem(STORAGE_KEYS.accessToken);
		globalThis.localStorage.removeItem(STORAGE_KEYS.refreshToken);
		globalThis.location.href = "/login";
	}
	return Promise.reject(error);
};

apiClient.interceptors.request.use(handleRequestInterceptor);
apiClient.interceptors.response.use((response) => response, handleResponseError);

export interface ApiResponse<T> {
	data: T;
	message?: string;
}

export interface PaginatedResponse<T> {
	data: T[];
	meta: {
		total: number;
		page: number;
		pageSize: number;
		totalPages: number;
	};
}

export interface ApiError {
	message: string;
	statusCode: number;
	error?: string;
}

export const api = {
	get: <T>(url: string, config?: AxiosRequestConfig) => apiClient.get<T>(url, config).then((res) => res.data),

	post: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
		apiClient.post<T>(url, data, config).then((res) => res.data),

	put: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
		apiClient.put<T>(url, data, config).then((res) => res.data),

	patch: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
		apiClient.patch<T>(url, data, config).then((res) => res.data),

	delete: <T>(url: string, config?: AxiosRequestConfig) => apiClient.delete<T>(url, config).then((res) => res.data),
};
