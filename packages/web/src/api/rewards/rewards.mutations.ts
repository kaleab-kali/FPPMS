import { useMutation, useQueryClient } from "@tanstack/react-query";
import { eligibilityApi, rewardMilestonesApi, serviceRewardsApi } from "./rewards.api";
import { rewardKeys } from "./rewards.queries";

export const useCreateMilestone = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: rewardMilestonesApi.create,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: rewardKeys.milestones() });
		},
	});
};

export const useUpdateMilestone = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, dto }: { id: string; dto: Parameters<typeof rewardMilestonesApi.update>[1] }) =>
			rewardMilestonesApi.update(id, dto),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({ queryKey: rewardKeys.milestones() });
			queryClient.invalidateQueries({ queryKey: rewardKeys.milestone(variables.id) });
		},
	});
};

export const useDeleteMilestone = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: rewardMilestonesApi.delete,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: rewardKeys.milestones() });
		},
	});
};

export const useCreateServiceReward = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: serviceRewardsApi.create,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: rewardKeys.rewards() });
			queryClient.invalidateQueries({ queryKey: rewardKeys.eligibility() });
		},
	});
};

export const useSubmitForApproval = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, dto }: { id: string; dto?: Parameters<typeof serviceRewardsApi.submitForApproval>[1] }) =>
			serviceRewardsApi.submitForApproval(id, dto),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({ queryKey: rewardKeys.rewards() });
			queryClient.invalidateQueries({ queryKey: rewardKeys.reward(variables.id) });
		},
	});
};

export const useApproveReward = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, dto }: { id: string; dto?: Parameters<typeof serviceRewardsApi.approve>[1] }) =>
			serviceRewardsApi.approve(id, dto),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({ queryKey: rewardKeys.rewards() });
			queryClient.invalidateQueries({ queryKey: rewardKeys.reward(variables.id) });
		},
	});
};

export const useRejectReward = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, dto }: { id: string; dto: Parameters<typeof serviceRewardsApi.reject>[1] }) =>
			serviceRewardsApi.reject(id, dto),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({ queryKey: rewardKeys.rewards() });
			queryClient.invalidateQueries({ queryKey: rewardKeys.reward(variables.id) });
		},
	});
};

export const useRecordAward = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, dto }: { id: string; dto: Parameters<typeof serviceRewardsApi.recordAward>[1] }) =>
			serviceRewardsApi.recordAward(id, dto),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({ queryKey: rewardKeys.rewards() });
			queryClient.invalidateQueries({ queryKey: rewardKeys.reward(variables.id) });
			queryClient.invalidateQueries({ queryKey: rewardKeys.reports() });
		},
	});
};

export const useRecheckEligibility = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: serviceRewardsApi.recheckEligibility,
		onSuccess: (_, id) => {
			queryClient.invalidateQueries({ queryKey: rewardKeys.rewards() });
			queryClient.invalidateQueries({ queryKey: rewardKeys.reward(id) });
			queryClient.invalidateQueries({ queryKey: rewardKeys.eligibility() });
		},
	});
};

export const useBatchCheckEligibility = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: eligibilityApi.batchCheck,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: rewardKeys.eligibility() });
			queryClient.invalidateQueries({ queryKey: rewardKeys.rewards() });
		},
	});
};
