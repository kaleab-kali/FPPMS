import { useMutation, useQueryClient } from "@tanstack/react-query";
import { salaryManagementApi } from "#web/api/salary-management/salary-management.api.ts";
import { salaryManagementKeys } from "#web/api/salary-management/salary-management.queries.ts";
import type {
	ManualStepJumpRequest,
	MassRaisePreviewRequest,
	MassRaiseRequest,
	ProcessBatchIncrementRequest,
	ProcessPromotionRequest,
	ProcessSingleIncrementRequest,
	PromotionSalaryPreviewRequest,
	RejectEligibilityRequest,
} from "#web/types/salary-management.ts";

export const useProcessIncrement = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: ProcessSingleIncrementRequest) => salaryManagementApi.processIncrement(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: salaryManagementKeys.eligibility() });
		},
	});
};

export const useProcessBatchIncrement = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: ProcessBatchIncrementRequest) => salaryManagementApi.processBatchIncrement(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: salaryManagementKeys.eligibility() });
		},
	});
};

export const useRejectEligibility = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: RejectEligibilityRequest) => salaryManagementApi.rejectEligibility(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: salaryManagementKeys.eligibility() });
		},
	});
};

export const useProcessManualJump = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: ManualStepJumpRequest) => salaryManagementApi.processManualJump(data),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({ queryKey: salaryManagementKeys.eligibility() });
			queryClient.invalidateQueries({
				queryKey: salaryManagementKeys.employeeHistory(variables.employeeId, {}),
			});
		},
	});
};

export const useMassRaisePreview = () =>
	useMutation({
		mutationFn: (data: MassRaisePreviewRequest) => salaryManagementApi.getMassRaisePreview(data),
	});

export const useProcessMassRaise = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: MassRaiseRequest) => salaryManagementApi.processMassRaise(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: salaryManagementKeys.eligibility() });
			queryClient.invalidateQueries({ queryKey: salaryManagementKeys.all });
		},
	});
};

export const usePromotionSalaryPreview = () =>
	useMutation({
		mutationFn: (data: PromotionSalaryPreviewRequest) => salaryManagementApi.getPromotionSalaryPreview(data),
	});

export const useProcessPromotion = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: ProcessPromotionRequest) => salaryManagementApi.processPromotion(data),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({ queryKey: salaryManagementKeys.eligibility() });
			queryClient.invalidateQueries({
				queryKey: salaryManagementKeys.employeeHistory(variables.employeeId, {}),
			});
		},
	});
};

export const useTriggerDailyEligibilityCheck = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: () => salaryManagementApi.triggerDailyEligibilityCheck(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: salaryManagementKeys.eligibility() });
		},
	});
};
