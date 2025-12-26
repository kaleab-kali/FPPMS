import { useMutation, useQueryClient } from "@tanstack/react-query";
import { committeesApi } from "#web/api/committees/committees.api.ts";
import { committeeKeys } from "#web/api/committees/committees.queries.ts";
import type {
	AddCommitteeMemberRequest,
	BulkAddMembersRequest,
	CreateCommitteeRequest,
	CreateCommitteeTypeRequest,
	DissolveCommitteeRequest,
	ReactivateCommitteeRequest,
	RemoveCommitteeMemberRequest,
	SuspendCommitteeRequest,
	UpdateCommitteeMemberRequest,
	UpdateCommitteeRequest,
	UpdateCommitteeTypeRequest,
} from "#web/types/committee.ts";

// Committee Type Mutations
export const useCreateCommitteeType = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (data: CreateCommitteeTypeRequest) => committeesApi.createType(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: committeeKeys.types() });
		},
	});
};

export const useUpdateCommitteeType = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, data }: { id: string; data: UpdateCommitteeTypeRequest }) => committeesApi.updateType(id, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: committeeKeys.types() });
		},
	});
};

export const useDeleteCommitteeType = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (id: string) => committeesApi.deleteType(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: committeeKeys.types() });
		},
	});
};

// Committee Mutations
export const useCreateCommittee = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (data: CreateCommitteeRequest) => committeesApi.create(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: committeeKeys.all });
		},
	});
};

export const useUpdateCommittee = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, data }: { id: string; data: UpdateCommitteeRequest }) => committeesApi.update(id, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: committeeKeys.all });
		},
	});
};

export const useSuspendCommittee = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, data }: { id: string; data: SuspendCommitteeRequest }) => committeesApi.suspend(id, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: committeeKeys.all });
		},
	});
};

export const useReactivateCommittee = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, data }: { id: string; data: ReactivateCommitteeRequest }) => committeesApi.reactivate(id, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: committeeKeys.all });
		},
	});
};

export const useDissolveCommittee = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, data }: { id: string; data: DissolveCommitteeRequest }) => committeesApi.dissolve(id, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: committeeKeys.all });
		},
	});
};

// Member Mutations
export const useAddCommitteeMember = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ committeeId, data }: { committeeId: string; data: AddCommitteeMemberRequest }) =>
			committeesApi.addMember(committeeId, data),
		onSuccess: (_data, variables) => {
			queryClient.invalidateQueries({ queryKey: committeeKeys.members(variables.committeeId) });
			queryClient.invalidateQueries({ queryKey: committeeKeys.details() });
		},
	});
};

export const useBulkAddCommitteeMembers = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ committeeId, data }: { committeeId: string; data: BulkAddMembersRequest }) =>
			committeesApi.bulkAddMembers(committeeId, data),
		onSuccess: (_data, variables) => {
			queryClient.invalidateQueries({ queryKey: committeeKeys.members(variables.committeeId) });
			queryClient.invalidateQueries({ queryKey: committeeKeys.details() });
		},
	});
};

export const useUpdateCommitteeMember = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({
			committeeId,
			memberId,
			data,
		}: {
			committeeId: string;
			memberId: string;
			data: UpdateCommitteeMemberRequest;
		}) => committeesApi.updateMember(committeeId, memberId, data),
		onSuccess: (_data, variables) => {
			queryClient.invalidateQueries({ queryKey: committeeKeys.members(variables.committeeId) });
			queryClient.invalidateQueries({ queryKey: committeeKeys.details() });
		},
	});
};

export const useRemoveCommitteeMember = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({
			committeeId,
			memberId,
			data,
		}: {
			committeeId: string;
			memberId: string;
			data: RemoveCommitteeMemberRequest;
		}) => committeesApi.removeMember(committeeId, memberId, data),
		onSuccess: (_data, variables) => {
			queryClient.invalidateQueries({ queryKey: committeeKeys.members(variables.committeeId) });
			queryClient.invalidateQueries({ queryKey: committeeKeys.details() });
		},
	});
};
