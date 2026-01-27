/**
 * Centralized date formatting utilities
 * Use these instead of defining formatDate locally in components
 */

/**
 * Format a date string to localized date format
 * @param dateString - ISO date string, Date object, or null/undefined
 * @param fallback - Value to return if date is invalid (default: "-")
 * @returns Formatted date string
 */
export const formatDate = (dateString: string | Date | null | undefined, fallback = "-"): string => {
	if (!dateString) return fallback;
	const date = typeof dateString === "string" ? new Date(dateString) : dateString;
	if (Number.isNaN(date.getTime())) return fallback;
	return date.toLocaleDateString();
};

/**
 * Format a date string with time to localized datetime format
 * @param dateString - ISO date string, Date object, or null/undefined
 * @param fallback - Value to return if date is invalid (default: "-")
 * @returns Formatted datetime string
 */
export const formatDateTime = (dateString: string | Date | null | undefined, fallback = "-"): string => {
	if (!dateString) return fallback;
	const date = typeof dateString === "string" ? new Date(dateString) : dateString;
	if (Number.isNaN(date.getTime())) return fallback;
	return new Intl.DateTimeFormat("en-US", {
		year: "numeric",
		month: "short",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	}).format(date);
};

/**
 * Format a date to YYYY-MM-DD format for HTML date inputs
 * @param date - Date object or ISO string
 * @returns YYYY-MM-DD formatted string
 */
export const formatDateForInput = (date: Date | string | null | undefined): string => {
	if (!date) return "";
	const d = typeof date === "string" ? new Date(date) : date;
	if (Number.isNaN(d.getTime())) return "";
	return d.toISOString().split("T")[0];
};

/**
 * Get today's date as YYYY-MM-DD string
 * @returns Today's date in YYYY-MM-DD format
 */
export const getTodayString = (): string => new Date().toISOString().split("T")[0];

/**
 * Format a date with a custom format using Intl.DateTimeFormat options
 * @param dateString - ISO date string or Date object
 * @param options - Intl.DateTimeFormatOptions
 * @param fallback - Value to return if date is invalid
 * @returns Formatted date string
 */
export const formatDateCustom = (
	dateString: string | Date | null | undefined,
	options: Intl.DateTimeFormatOptions,
	fallback = "-",
): string => {
	if (!dateString) return fallback;
	const date = typeof dateString === "string" ? new Date(dateString) : dateString;
	if (Number.isNaN(date.getTime())) return fallback;
	return new Intl.DateTimeFormat("en-US", options).format(date);
};

/**
 * Format date to long format: "January 1, 2025"
 */
export const formatDateLong = (dateString: string | Date | null | undefined, fallback = "-"): string => {
	return formatDateCustom(dateString, { year: "numeric", month: "long", day: "numeric" }, fallback);
};

/**
 * Format date to short format: "Jan 1, 2025"
 */
export const formatDateShort = (dateString: string | Date | null | undefined, fallback = "-"): string => {
	return formatDateCustom(dateString, { year: "numeric", month: "short", day: "numeric" }, fallback);
};
