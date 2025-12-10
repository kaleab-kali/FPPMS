export const APP_CONFIG = {
	name: "EPPMS",
	description: "Ethiopian Prison Personnel Management System",
	apiBaseUrl: import.meta.env.VITE_API_URL || "http://localhost:3000/api",
	defaultLocale: "en",
	supportedLocales: ["en", "am"],
} as const;

export const STORAGE_KEYS = {
	accessToken: "ppms_access_token",
	refreshToken: "ppms_refresh_token",
	authStore: "ppms_auth",
	uiStore: "ppms_ui",
	locale: "ppms_locale",
} as const;

export const PAGINATION_CONFIG = {
	defaultPageSize: 10,
	pageSizeOptions: [10, 20, 50, 100],
} as const;

export const DATE_FORMATS = {
	display: "MMM dd, yyyy",
	displayWithTime: "MMM dd, yyyy HH:mm",
	iso: "yyyy-MM-dd",
} as const;

export const HTTP_STATUS = {
	unauthorized: 401,
	forbidden: 403,
	notFound: 404,
	serverError: 500,
} as const;
