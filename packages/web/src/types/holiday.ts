export type HolidayType = "NATIONAL" | "RELIGIOUS" | "COMPANY" | "OTHER";

export interface Holiday {
	id: string;
	tenantId: string;
	name: string;
	nameAmharic?: string;
	date: string;
	ethiopianDate?: string;
	type: HolidayType;
	isRecurring: boolean;
	ethiopianMonth?: number;
	ethiopianDay?: number;
	appliesTo?: string;
	description?: string;
	createdById?: string;
	createdAt: string;
	updatedAt: string;
}

export interface CreateHolidayDto {
	name: string;
	nameAmharic?: string;
	date: string;
	ethiopianDate?: string;
	type: HolidayType;
	isRecurring?: boolean;
	ethiopianMonth?: number;
	ethiopianDay?: number;
	appliesTo?: string;
	description?: string;
}

export interface UpdateHolidayDto {
	name?: string;
	nameAmharic?: string;
	date?: string;
	ethiopianDate?: string;
	type?: HolidayType;
	isRecurring?: boolean;
	ethiopianMonth?: number;
	ethiopianDay?: number;
	appliesTo?: string;
	description?: string;
}

export interface HolidayQueryParams {
	startDate?: string;
	endDate?: string;
	type?: HolidayType;
	isRecurring?: boolean;
	ethiopianYear?: number;
	ethiopianMonth?: number;
}

export interface WorkingDaysResult {
	workingDays: number;
	startDate: string;
	endDate: string;
}

export interface GenerateHolidaysResult {
	generated: number;
	year: number;
	holidays: Holiday[];
}

export const HOLIDAY_TYPE_LABELS: Record<HolidayType, string> = {
	NATIONAL: "National Holiday",
	RELIGIOUS: "Religious Holiday",
	COMPANY: "Company Holiday",
	OTHER: "Other",
} as const;

export const HOLIDAY_TYPE_LABELS_AM: Record<HolidayType, string> = {
	NATIONAL: "ብሄራዊ በዓል",
	RELIGIOUS: "ሃይማኖታዊ በዓል",
	COMPANY: "የድርጅት በዓል",
	OTHER: "ሌላ",
} as const;
