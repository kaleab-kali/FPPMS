/**
 * Centralized error handling utilities
 * Use these instead of duplicating error extraction logic in components
 */

import type { AxiosError } from "axios";

interface ApiErrorResponse {
	message?: string | string[];
	error?: string;
	statusCode?: number;
}

/**
 * Extract a user-friendly error message from an API error
 * @param err - The caught error (usually from axios)
 * @param fallback - Default message if extraction fails
 * @returns User-friendly error message string
 */
export const extractErrorMessage = (err: unknown, fallback = "An error occurred"): string => {
	if (!err) return fallback;

	const axiosError = err as AxiosError<ApiErrorResponse>;

	if (axiosError.response?.data) {
		const { message, error } = axiosError.response.data;

		if (Array.isArray(message)) {
			return message.join(". ");
		}

		if (typeof message === "string" && message.length > 0) {
			return message;
		}

		if (typeof error === "string" && error.length > 0) {
			return error;
		}
	}

	if (axiosError.message && axiosError.message !== "Request failed with status code 500") {
		return axiosError.message;
	}

	return fallback;
};

/**
 * Check if error is a specific HTTP status code
 * @param err - The caught error
 * @param statusCode - HTTP status code to check for
 * @returns True if error has the specified status code
 */
export const isHttpError = (err: unknown, statusCode: number): boolean => {
	const axiosError = err as AxiosError;
	return axiosError.response?.status === statusCode;
};

/**
 * Check if error is an authentication error (401)
 */
export const isAuthError = (err: unknown): boolean => isHttpError(err, 401);

/**
 * Check if error is a forbidden error (403)
 */
export const isForbiddenError = (err: unknown): boolean => isHttpError(err, 403);

/**
 * Check if error is a not found error (404)
 */
export const isNotFoundError = (err: unknown): boolean => isHttpError(err, 404);

/**
 * Check if error is a validation error (400)
 */
export const isValidationError = (err: unknown): boolean => isHttpError(err, 400);

/**
 * Check if error is a network error (no response)
 */
export const isNetworkError = (err: unknown): boolean => {
	const axiosError = err as AxiosError;
	return axiosError.code === "ERR_NETWORK" || !axiosError.response;
};

/**
 * Get HTTP status code from error
 * @param err - The caught error
 * @returns HTTP status code or undefined
 */
export const getErrorStatusCode = (err: unknown): number | undefined => {
	const axiosError = err as AxiosError;
	return axiosError.response?.status;
};
