import { useMutation, useQueryClient } from "@tanstack/react-query";
import { salaryScaleApi } from "#web/api/salary-scale/salary-scale.api.ts";
import { salaryScaleKeys } from "#web/api/salary-scale/salary-scale.queries.ts";
import type { CreateSalaryScaleRequest, UpdateSalaryScaleRequest } from "#web/types/salary-scale.ts";

export const useCreateSalaryScale = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: CreateSalaryScaleRequest) => salaryScaleApi.create(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: salaryScaleKeys.all });
		},
	});
};

export const useUpdateSalaryScale = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, data }: { id: string; data: UpdateSalaryScaleRequest }) => salaryScaleApi.update(id, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: salaryScaleKeys.all });
		},
	});
};

export const useActivateSalaryScale = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: string) => salaryScaleApi.activate(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: salaryScaleKeys.all });
		},
	});
};

export const useArchiveSalaryScale = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: string) => salaryScaleApi.archive(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: salaryScaleKeys.all });
		},
	});
};

export const useDuplicateSalaryScale = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, newCode }: { id: string; newCode: string }) => salaryScaleApi.duplicate(id, newCode),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: salaryScaleKeys.all });
		},
	});
};

export const useDeleteSalaryScale = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: string) => salaryScaleApi.delete(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: salaryScaleKeys.all });
		},
	});
};
