import type { TFunction } from "i18next";
import React from "react";
import { toast } from "sonner";
import {
	useAssignCommittee,
	useCloseComplaint,
	useForwardToCommittee,
	useForwardToHq,
	useMarkRebuttalDeadlinePassed,
	useRecordAppealDecision,
	useRecordDecision,
	useRecordFinding,
	useRecordHqDecision,
	useRecordNotification,
	useRecordRebuttal,
	useSubmitAppeal,
} from "#web/api/complaints/complaints.mutations.ts";
import type { AppealDecision, Complaint, ComplaintFinding } from "#web/types/complaint.ts";

type ActionType =
	| "notification"
	| "rebuttal"
	| "rebuttalDeadline"
	| "finding"
	| "decision"
	| "assignCommittee"
	| "forwardToCommittee"
	| "forwardToHq"
	| "hqDecision"
	| "submitAppeal"
	| "appealDecision"
	| "close"
	| null;

interface UseComplaintActionsParams {
	complaint: Complaint;
	tCommon: TFunction;
	onActionComplete: () => void;
}

export const useComplaintActions = ({ complaint, tCommon, onActionComplete }: UseComplaintActionsParams) => {
	const notificationMutation = useRecordNotification();
	const rebuttalMutation = useRecordRebuttal();
	const deadlineMutation = useMarkRebuttalDeadlinePassed();
	const findingMutation = useRecordFinding();
	const decisionMutation = useRecordDecision();
	const assignCommitteeMutation = useAssignCommittee();
	const forwardToCommitteeMutation = useForwardToCommittee();
	const forwardToHqMutation = useForwardToHq();
	const hqDecisionMutation = useRecordHqDecision();
	const submitAppealMutation = useSubmitAppeal();
	const appealDecisionMutation = useRecordAppealDecision();
	const closeMutation = useCloseComplaint();

	const isLoading =
		notificationMutation.isPending ||
		rebuttalMutation.isPending ||
		deadlineMutation.isPending ||
		findingMutation.isPending ||
		decisionMutation.isPending ||
		assignCommitteeMutation.isPending ||
		forwardToCommitteeMutation.isPending ||
		forwardToHqMutation.isPending ||
		hqDecisionMutation.isPending ||
		submitAppealMutation.isPending ||
		appealDecisionMutation.isPending ||
		closeMutation.isPending;

	const createHandlers = React.useCallback(
		(
			actionType: ActionType,
			formData: Record<string, string>,
			selectedAppealId: string | null,
			selectedReviewerEmployee: { id: string; fullName: string } | null,
		) => {
			const onSuccess = () => {
				toast.success(tCommon("success"));
				onActionComplete();
			};
			const onError = () => toast.error(tCommon("error"));

			const handlers = {
				notification: () =>
					notificationMutation.mutate(
						{ id: complaint.id, data: { notificationDate: formData.date, notes: formData.notes } },
						{ onSuccess, onError },
					),
				rebuttal: () =>
					rebuttalMutation.mutate(
						{
							id: complaint.id,
							data: {
								rebuttalReceivedDate: formData.date,
								rebuttalContent: formData.content,
								notes: formData.notes,
							},
						},
						{ onSuccess, onError },
					),
				rebuttalDeadline: () => deadlineMutation.mutate(complaint.id, { onSuccess, onError }),
				finding: () =>
					findingMutation.mutate(
						{
							id: complaint.id,
							data: {
								finding: formData.finding as ComplaintFinding,
								findingDate: formData.date,
								findingReason: formData.reason,
								notes: formData.notes,
							},
						},
						{ onSuccess, onError },
					),
				decision: () =>
					decisionMutation.mutate(
						{
							id: complaint.id,
							data: {
								decisionDate: formData.date,
								punishmentPercentage: formData.percentage ? Number(formData.percentage) : undefined,
								punishmentDescription: formData.description,
								notes: formData.notes,
							},
						},
						{ onSuccess, onError },
					),
				assignCommittee: () =>
					assignCommitteeMutation.mutate(
						{
							id: complaint.id,
							data: {
								committeeId: formData.committeeId,
								assignedDate: formData.date,
								notes: formData.notes,
							},
						},
						{ onSuccess, onError },
					),
				forwardToCommittee: () =>
					forwardToCommitteeMutation.mutate(
						{
							id: complaint.id,
							data: {
								committeeId: formData.committeeId,
								forwardedDate: formData.date,
								notes: formData.notes,
							},
						},
						{ onSuccess, onError },
					),
				forwardToHq: () =>
					forwardToHqMutation.mutate(
						{
							id: complaint.id,
							data: {
								hqCommitteeId: formData.hqCommitteeId,
								forwardedDate: formData.date,
								notes: formData.notes,
							},
						},
						{ onSuccess, onError },
					),
				hqDecision: () =>
					hqDecisionMutation.mutate(
						{
							id: complaint.id,
							data: {
								decisionDate: formData.date,
								punishmentDescription: formData.description,
								notes: formData.notes,
							},
						},
						{ onSuccess, onError },
					),
				submitAppeal: () => {
					if (selectedReviewerEmployee) {
						submitAppealMutation.mutate(
							{
								id: complaint.id,
								data: {
									appealDate: formData.date,
									appealReason: formData.reason,
									reviewerEmployeeId: selectedReviewerEmployee.id,
									notes: formData.notes,
								},
							},
							{ onSuccess, onError },
						);
					}
				},
				appealDecision: () => {
					if (selectedAppealId) {
						appealDecisionMutation.mutate(
							{
								id: complaint.id,
								appealId: selectedAppealId,
								data: {
									reviewedAt: formData.date,
									decision: formData.decision as AppealDecision,
									decisionReason: formData.reason,
									newPunishment: formData.newPunishment,
									notes: formData.notes,
								},
							},
							{ onSuccess, onError },
						);
					}
				},
				close: () =>
					closeMutation.mutate(
						{
							id: complaint.id,
							data: {
								closedDate: formData.date,
								closureReason: formData.reason,
								notes: formData.notes,
							},
						},
						{ onSuccess, onError },
					),
			};

			return handlers[actionType as keyof typeof handlers];
		},
		[
			complaint.id,
			notificationMutation,
			rebuttalMutation,
			deadlineMutation,
			findingMutation,
			decisionMutation,
			assignCommitteeMutation,
			forwardToCommitteeMutation,
			forwardToHqMutation,
			hqDecisionMutation,
			submitAppealMutation,
			appealDecisionMutation,
			closeMutation,
			tCommon,
			onActionComplete,
		],
	);

	return { isLoading, createHandlers };
};

interface AvailableAction {
	type: ActionType;
	label: string;
	variant?: "default" | "destructive";
	appealId?: string;
}

export const useAvailableActions = (complaint: Complaint, t: TFunction): AvailableAction[] =>
	React.useMemo(() => {
		const actions: AvailableAction[] = [];
		const isArticle30Level5Plus =
			complaint.article === "ARTICLE_30" &&
			complaint.decisionAuthority === "DISCIPLINE_COMMITTEE" &&
			!complaint.assignedCommitteeId;
		const canForwardToHq = complaint.assignedCommitteeId && !complaint.centerId;
		const canSubmitAppeal = !complaint.appeals?.some((a) => !a.decision);
		const pendingAppeals = complaint.appeals?.filter((a) => !a.decision) ?? [];

		switch (complaint.status) {
			case "UNDER_HR_REVIEW":
				actions.push({ type: "notification", label: t("action.sendNotification") });
				if (isArticle30Level5Plus) {
					actions.push({ type: "forwardToCommittee", label: t("action.forwardToCommittee") });
				}
				break;
			case "WITH_DISCIPLINE_COMMITTEE":
				actions.push({ type: "notification", label: t("action.sendNotification") });
				break;
			case "WAITING_FOR_REBUTTAL":
			case "COMMITTEE_WAITING_REBUTTAL":
				actions.push({ type: "rebuttal", label: t("action.recordRebuttal") });
				actions.push({ type: "rebuttalDeadline", label: t("action.markDeadlinePassed"), variant: "destructive" });
				if (isArticle30Level5Plus) {
					actions.push({ type: "forwardToCommittee", label: t("action.forwardToCommittee") });
				}
				break;
			case "UNDER_HR_ANALYSIS":
				actions.push({ type: "finding", label: t("action.recordFinding") });
				if (isArticle30Level5Plus) {
					actions.push({ type: "forwardToCommittee", label: t("action.forwardToCommittee") });
				}
				break;
			case "COMMITTEE_ANALYSIS":
				actions.push({ type: "finding", label: t("action.recordFinding") });
				break;
			case "INVESTIGATION_COMPLETE":
				if (complaint.article === "ARTICLE_31" && canForwardToHq) {
					actions.push({ type: "forwardToHq", label: t("action.forwardToHq") });
				}
				break;
			case "AWAITING_SUPERIOR_DECISION":
				actions.push({ type: "decision", label: t("action.recordDecision") });
				if (isArticle30Level5Plus) {
					actions.push({ type: "forwardToCommittee", label: t("action.forwardToCommittee") });
				}
				break;
			case "AWAITING_HQ_DECISION":
				actions.push({ type: "hqDecision", label: t("action.recordHqDecision") });
				break;
			case "DECIDED":
			case "DECIDED_BY_HQ":
			case "APPEAL_DECIDED":
				if (canSubmitAppeal) {
					actions.push({ type: "submitAppeal", label: t("action.submitAppeal") });
				}
				actions.push({ type: "close", label: t("action.closeComplaint") });
				break;
			case "ON_APPEAL":
				for (const appeal of pendingAppeals) {
					actions.push({
						type: "appealDecision",
						label: t("action.recordAppealDecision"),
						appealId: appeal.id,
					});
				}
				break;
			case "CLOSED_NO_LIABILITY":
				actions.push({ type: "close", label: t("action.closeComplaint") });
				break;
		}

		return actions;
	}, [complaint, t]);
