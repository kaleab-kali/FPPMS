import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { CreateHolidayDto, UpdateHolidayDto } from "#web/types/holiday";
import { holidaysApi } from "./holidays.api";
import { holidayKeys } from "./holidays.queries";

export const useCreateHoliday = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: CreateHolidayDto) => holidaysApi.create(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: holidayKeys.all });
		},
	});
};

export const useUpdateHoliday = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, data }: { id: string; data: UpdateHolidayDto }) => holidaysApi.update(id, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: holidayKeys.all });
		},
	});
};

export const useDeleteHoliday = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: string) => holidaysApi.delete(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: holidayKeys.all });
		},
	});
};

export const useGenerateHolidays = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (year: number) => holidaysApi.generateRecurring(year),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: holidayKeys.all });
		},
	});
};
