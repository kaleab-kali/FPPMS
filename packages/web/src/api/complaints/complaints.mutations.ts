import { useMutation, useQueryClient } from "@tanstack/react-query";
import { complaintsApi } from "#web/api/complaints/complaints.api.ts";
import { complaintKeys } from "#web/api/complaints/complaints.queries.ts";
import type {
	AssignCommitteeRequest,
	CloseComplaintRequest,
	CreateComplaintRequest,
	ForwardToCommitteeRequest,
	ForwardToHqRequest,
	RecordAppealDecisionRequest,
	RecordDecisionRequest,
	RecordFindingRequest,
	RecordHqDecisionRequest,
	RecordNotificationRequest,
	RecordRebuttalRequest,
	SubmitAppealRequest,
} from "#web/types/complaint.ts";

export const useCreateComplaint = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (data: CreateComplaintRequest) => complaintsApi.create(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: complaintKeys.all });
		},
	});
};

export const useRecordNotification = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, data }: { id: string; data: RecordNotificationRequest }) =>
			complaintsApi.recordNotification(id, data),
		onSuccess: (_data, variables) => {
			queryClient.invalidateQueries({ queryKey: complaintKeys.detail(variables.id) });
			queryClient.invalidateQueries({ queryKey: complaintKeys.lists() });
		},
	});
};

export const useRecordRebuttal = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, data }: { id: string; data: RecordRebuttalRequest }) => complaintsApi.recordRebuttal(id, data),
		onSuccess: (_data, variables) => {
			queryClient.invalidateQueries({ queryKey: complaintKeys.detail(variables.id) });
			queryClient.invalidateQueries({ queryKey: complaintKeys.lists() });
		},
	});
};

export const useMarkRebuttalDeadlinePassed = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (id: string) => complaintsApi.markRebuttalDeadlinePassed(id),
		onSuccess: (_data, id) => {
			queryClient.invalidateQueries({ queryKey: complaintKeys.detail(id) });
			queryClient.invalidateQueries({ queryKey: complaintKeys.lists() });
		},
	});
};

export const useRecordFinding = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, data }: { id: string; data: RecordFindingRequest }) => complaintsApi.recordFinding(id, data),
		onSuccess: (_data, variables) => {
			queryClient.invalidateQueries({ queryKey: complaintKeys.detail(variables.id) });
			queryClient.invalidateQueries({ queryKey: complaintKeys.lists() });
		},
	});
};

export const useRecordDecision = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, data }: { id: string; data: RecordDecisionRequest }) => complaintsApi.recordDecision(id, data),
		onSuccess: (_data, variables) => {
			queryClient.invalidateQueries({ queryKey: complaintKeys.detail(variables.id) });
			queryClient.invalidateQueries({ queryKey: complaintKeys.lists() });
		},
	});
};

export const useAssignCommittee = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, data }: { id: string; data: AssignCommitteeRequest }) => complaintsApi.assignCommittee(id, data),
		onSuccess: (_data, variables) => {
			queryClient.invalidateQueries({ queryKey: complaintKeys.detail(variables.id) });
			queryClient.invalidateQueries({ queryKey: complaintKeys.lists() });
		},
	});
};

export const useForwardToCommittee = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, data }: { id: string; data: ForwardToCommitteeRequest }) =>
			complaintsApi.forwardToCommittee(id, data),
		onSuccess: (_data, variables) => {
			queryClient.invalidateQueries({ queryKey: complaintKeys.detail(variables.id) });
			queryClient.invalidateQueries({ queryKey: complaintKeys.lists() });
		},
	});
};

export const useForwardToHq = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, data }: { id: string; data: ForwardToHqRequest }) => complaintsApi.forwardToHq(id, data),
		onSuccess: (_data, variables) => {
			queryClient.invalidateQueries({ queryKey: complaintKeys.detail(variables.id) });
			queryClient.invalidateQueries({ queryKey: complaintKeys.lists() });
		},
	});
};

export const useRecordHqDecision = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, data }: { id: string; data: RecordHqDecisionRequest }) =>
			complaintsApi.recordHqDecision(id, data),
		onSuccess: (_data, variables) => {
			queryClient.invalidateQueries({ queryKey: complaintKeys.detail(variables.id) });
			queryClient.invalidateQueries({ queryKey: complaintKeys.lists() });
		},
	});
};

export const useSubmitAppeal = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, data }: { id: string; data: SubmitAppealRequest }) => complaintsApi.submitAppeal(id, data),
		onSuccess: (_data, variables) => {
			queryClient.invalidateQueries({ queryKey: complaintKeys.detail(variables.id) });
		},
	});
};

export const useRecordAppealDecision = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, appealId, data }: { id: string; appealId: string; data: RecordAppealDecisionRequest }) =>
			complaintsApi.recordAppealDecision(id, appealId, data),
		onSuccess: (_data, variables) => {
			queryClient.invalidateQueries({ queryKey: complaintKeys.detail(variables.id) });
		},
	});
};

export const useCloseComplaint = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, data }: { id: string; data: CloseComplaintRequest }) => complaintsApi.closeComplaint(id, data),
		onSuccess: (_data, variables) => {
			queryClient.invalidateQueries({ queryKey: complaintKeys.detail(variables.id) });
			queryClient.invalidateQueries({ queryKey: complaintKeys.lists() });
		},
	});
};
