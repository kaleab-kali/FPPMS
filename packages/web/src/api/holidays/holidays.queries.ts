import { useQuery } from "@tanstack/react-query";
import type { HolidayQueryParams } from "#web/types/holiday";
import { holidaysApi } from "./holidays.api";

export const holidayKeys = {
	all: ["holidays"] as const,
	lists: () => [...holidayKeys.all, "list"] as const,
	list: (params?: HolidayQueryParams) => [...holidayKeys.lists(), params] as const,
	details: () => [...holidayKeys.all, "detail"] as const,
	detail: (id: string) => [...holidayKeys.details(), id] as const,
	check: (date: string) => [...holidayKeys.all, "check", date] as const,
	workingDays: (startDate: string, endDate: string) =>
		[...holidayKeys.all, "working-days", startDate, endDate] as const,
};

export const useHolidays = (params?: HolidayQueryParams) =>
	useQuery({
		queryKey: holidayKeys.list(params),
		queryFn: () => holidaysApi.getAll(params),
	});

export const useHoliday = (id: string) =>
	useQuery({
		queryKey: holidayKeys.detail(id),
		queryFn: () => holidaysApi.getById(id),
		enabled: !!id,
	});

export const useCheckHoliday = (date: string) =>
	useQuery({
		queryKey: holidayKeys.check(date),
		queryFn: () => holidaysApi.checkDate(date),
		enabled: !!date,
	});

export const useWorkingDays = (startDate: string, endDate: string, excludeWeekends = true, appliesTo?: string) =>
	useQuery({
		queryKey: holidayKeys.workingDays(startDate, endDate),
		queryFn: () => holidaysApi.countWorkingDays(startDate, endDate, excludeWeekends, appliesTo),
		enabled: !!startDate && !!endDate,
	});
