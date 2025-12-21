import axios, { type AxiosError, type AxiosRequestConfig, type InternalAxiosRequestConfig } from "axios";
import { APP_CONFIG, HTTP_STATUS, STORAGE_KEYS } from "#web/config/constants.ts";
import type { RefreshTokenResponse } from "#web/types/auth.ts";

export const apiClient = axios.create({
	baseURL: APP_CONFIG.apiBaseUrl,
	headers: {
		"Content-Type": "application/json",
	},
});

const getAccessToken = () => globalThis.localStorage.getItem(STORAGE_KEYS.accessToken);
const getRefreshToken = () => globalThis.localStorage.getItem(STORAGE_KEYS.refreshToken);

const setTokens = (accessToken: string, refreshToken: string) => {
	globalThis.localStorage.setItem(STORAGE_KEYS.accessToken, accessToken);
	globalThis.localStorage.setItem(STORAGE_KEYS.refreshToken, refreshToken);
};

const clearTokens = () => {
	globalThis.localStorage.removeItem(STORAGE_KEYS.accessToken);
	globalThis.localStorage.removeItem(STORAGE_KEYS.refreshToken);
	globalThis.localStorage.removeItem(STORAGE_KEYS.authStore);
};

export const ACCOUNT_DEACTIVATED_KEY = "accountDeactivated";

let isRefreshing = false;
let failedQueue: Array<{
	resolve: (token: string) => void;
	reject: (error: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
	for (const prom of failedQueue) {
		if (error) {
			prom.reject(error);
		} else {
			prom.resolve(token as string);
		}
	}
	failedQueue = [];
};

const handleRequestInterceptor = (config: InternalAxiosRequestConfig) => {
	const token = getAccessToken();
	if (token) {
		config.headers.Authorization = `Bearer ${token}`;
	}
	return config;
};

const isAccountDeactivatedError = (errorData: unknown): boolean => {
	const data = errorData as { message?: string };
	const message = data?.message?.toLowerCase() ?? "";
	return (
		message.includes("not active") ||
		message.includes("inactive") ||
		message.includes("locked") ||
		message.includes("transferred") ||
		message.includes("terminated")
	);
};

const handleResponseError = async (error: AxiosError) => {
	const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

	if (error.response?.status === HTTP_STATUS.unauthorized && !originalRequest._retry) {
		const errorData = error.response?.data as { message?: string } | undefined;

		if (isAccountDeactivatedError(errorData)) {
			clearTokens();
			globalThis.localStorage.setItem(ACCOUNT_DEACTIVATED_KEY, errorData?.message ?? "Account is not active");
			globalThis.location.href = "/login";
			return Promise.reject(error);
		}

		const refreshToken = getRefreshToken();

		if (!refreshToken) {
			clearTokens();
			globalThis.location.href = "/login";
			return Promise.reject(error);
		}

		if (isRefreshing) {
			return new Promise((resolve, reject) => {
				failedQueue.push({ resolve, reject });
			})
				.then((token) => {
					originalRequest.headers.Authorization = `Bearer ${token}`;
					return apiClient(originalRequest);
				})
				.catch((err) => Promise.reject(err));
		}

		originalRequest._retry = true;
		isRefreshing = true;

		return new Promise((resolve, reject) => {
			axios
				.post<RefreshTokenResponse>(`${APP_CONFIG.apiBaseUrl}/auth/refresh`, { refreshToken })
				.then(({ data }) => {
					setTokens(data.accessToken, data.refreshToken);
					originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
					processQueue(null, data.accessToken);
					resolve(apiClient(originalRequest));
				})
				.catch((err) => {
					const refreshErrorData = (err as AxiosError)?.response?.data;
					processQueue(err, null);
					clearTokens();
					if (isAccountDeactivatedError(refreshErrorData)) {
						const errorMsg = (refreshErrorData as { message?: string })?.message ?? "Account is not active";
						globalThis.localStorage.setItem(ACCOUNT_DEACTIVATED_KEY, errorMsg);
					}
					globalThis.location.href = "/login";
					reject(err);
				})
				.finally(() => {
					isRefreshing = false;
				});
		});
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
