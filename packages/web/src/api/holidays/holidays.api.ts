import { api } from "#web/lib/api-client";
import type {
	CreateHolidayDto,
	GenerateHolidaysResult,
	Holiday,
	HolidayQueryParams,
	UpdateHolidayDto,
	WorkingDaysResult,
} from "#web/types/holiday";

const BASE_URL = "/holidays";

export const holidaysApi = {
	getAll: async (params?: HolidayQueryParams): Promise<Holiday[]> => {
		return api.get<Holiday[]>(BASE_URL, { params });
	},

	getById: async (id: string): Promise<Holiday> => {
		return api.get<Holiday>(`${BASE_URL}/${id}`);
	},

	checkDate: async (date: string): Promise<Holiday | null> => {
		return api.get<Holiday | null>(`${BASE_URL}/check/${date}`);
	},

	countWorkingDays: async (
		startDate: string,
		endDate: string,
		excludeWeekends = true,
		appliesTo?: string,
	): Promise<WorkingDaysResult> => {
		return api.get<WorkingDaysResult>(`${BASE_URL}/working-days`, {
			params: { startDate, endDate, excludeWeekends, appliesTo },
		});
	},

	generateRecurring: async (year: number): Promise<GenerateHolidaysResult> => {
		return api.post<GenerateHolidaysResult>(`${BASE_URL}/generate/${year}`);
	},

	create: async (data: CreateHolidayDto): Promise<Holiday> => {
		return api.post<Holiday>(BASE_URL, data);
	},

	update: async (id: string, data: UpdateHolidayDto): Promise<Holiday> => {
		return api.patch<Holiday>(`${BASE_URL}/${id}`, data);
	},

	delete: async (id: string): Promise<void> => {
		await api.delete(`${BASE_URL}/${id}`);
	},
};
