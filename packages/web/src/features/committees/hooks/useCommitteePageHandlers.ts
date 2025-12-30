import type { TFunction } from "i18next";
import React from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
	useAddCommitteeMember,
	useRemoveCommitteeMember,
	useUpdateCommitteeMember,
} from "#web/api/committees/committees.mutations.ts";
import type {
	AddCommitteeMemberRequest,
	CommitteeMember,
	CommitteeMemberRole,
	UpdateCommitteeMemberRequest,
} from "#web/types/committee.ts";

interface UseCommitteePageHandlersParams {
	committeeId: string | undefined;
	tCommon: TFunction;
}

export const useCommitteePageHandlers = ({ committeeId, tCommon }: UseCommitteePageHandlersParams) => {
	const navigate = useNavigate();
	const addMemberMutation = useAddCommitteeMember();
	const updateMemberMutation = useUpdateCommitteeMember();
	const removeMemberMutation = useRemoveCommitteeMember();

	const [addMemberOpen, setAddMemberOpen] = React.useState(false);
	const [removeOpen, setRemoveOpen] = React.useState(false);
	const [selectedMember, setSelectedMember] = React.useState<CommitteeMember | undefined>();

	const handleBack = React.useCallback(() => navigate("/committees"), [navigate]);

	const handleAddMember = React.useCallback(() => {
		setSelectedMember(undefined);
		setAddMemberOpen(true);
	}, []);

	const handleRemoveClick = React.useCallback((member: CommitteeMember) => {
		setSelectedMember(member);
		setRemoveOpen(true);
	}, []);

	const handleAddMemberSubmit = React.useCallback(
		(data: AddCommitteeMemberRequest) => {
			if (!committeeId) return;
			addMemberMutation.mutate(
				{ committeeId, data },
				{
					onSuccess: () => {
						toast.success(tCommon("success"));
						setAddMemberOpen(false);
					},
					onError: () => toast.error(tCommon("error")),
				},
			);
		},
		[committeeId, addMemberMutation, tCommon],
	);

	const handleRoleChange = React.useCallback(
		(memberId: string, role: CommitteeMemberRole) => {
			if (!committeeId) return;
			const data: UpdateCommitteeMemberRequest = { role };
			updateMemberMutation.mutate(
				{ committeeId, memberId, data },
				{
					onSuccess: () => toast.success(tCommon("success")),
					onError: () => toast.error(tCommon("error")),
				},
			);
		},
		[committeeId, updateMemberMutation, tCommon],
	);

	const handleRemoveConfirm = React.useCallback(() => {
		if (!committeeId || !selectedMember) return;
		removeMemberMutation.mutate(
			{
				committeeId,
				memberId: selectedMember.id,
				data: {
					endDate: new Date().toISOString().split("T")[0],
					removalReason: "Removed by administrator",
				},
			},
			{
				onSuccess: () => {
					toast.success(tCommon("success"));
					setRemoveOpen(false);
					setSelectedMember(undefined);
				},
				onError: () => toast.error(tCommon("error")),
			},
		);
	}, [committeeId, selectedMember, removeMemberMutation, tCommon]);

	const handleViewComplaint = React.useCallback(
		(complaintId: string) => navigate(`/complaints/${complaintId}`),
		[navigate],
	);

	return {
		addMemberMutation,
		removeMemberMutation,
		addMemberOpen,
		removeOpen,
		selectedMember,
		setAddMemberOpen,
		setRemoveOpen,
		handleBack,
		handleAddMember,
		handleRemoveClick,
		handleAddMemberSubmit,
		handleRoleChange,
		handleRemoveConfirm,
		handleViewComplaint,
	};
};
