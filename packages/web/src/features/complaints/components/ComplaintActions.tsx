import { Loader2 } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";
import { useCommittees } from "#web/api/committees/committees.queries.ts";
import { Button } from "#web/components/ui/button.tsx";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "#web/components/ui/card.tsx";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "#web/components/ui/dialog.tsx";
import { ComplaintActionFormFields } from "#web/features/complaints/components/ComplaintActionFormFields.tsx";
import { useAvailableActions, useComplaintActions } from "#web/features/complaints/hooks/useComplaintActions.ts";
import type { Committee } from "#web/types/committee.ts";
import type { Complaint } from "#web/types/complaint.ts";

interface ComplaintActionsProps {
	complaint: Complaint;
}

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

export const ComplaintActions = React.memo(
	({ complaint }: ComplaintActionsProps) => {
		const { t } = useTranslation("complaints");
		const { t: tCommon } = useTranslation("common");

		const [actionType, setActionType] = React.useState<ActionType>(null);
		const [formData, setFormData] = React.useState<Record<string, string>>({});
		const [selectedAppealId, setSelectedAppealId] = React.useState<string | null>(null);
		const [selectedReviewerEmployee, setSelectedReviewerEmployee] = React.useState<{
			id: string;
			fullName: string;
		} | null>(null);

		const { data: committees = [] } = useCommittees({ status: "ACTIVE" });

		const centerDisciplineCommittees = React.useMemo(
			() =>
				committees.filter(
					(c: Committee) =>
						c.committeeType?.code?.toLowerCase().includes("discipline") && c.centerId === complaint.centerId,
				),
			[committees, complaint.centerId],
		);

		const hqCommittees = React.useMemo(
			() =>
				committees.filter((c: Committee) => !c.centerId && c.committeeType?.code?.toLowerCase().includes("discipline")),
			[committees],
		);

		const isHqComplaint = !complaint.centerId;

		const handleCloseAction = React.useCallback(() => {
			setActionType(null);
			setFormData({});
			setSelectedAppealId(null);
			setSelectedReviewerEmployee(null);
		}, []);

		const { isLoading, createHandlers } = useComplaintActions({
			complaint,
			tCommon,
			onActionComplete: handleCloseAction,
		});

		const handleOpenAction = React.useCallback((type: ActionType, appealId?: string) => {
			setActionType(type);
			setSelectedAppealId(appealId ?? null);
			setFormData({ date: new Date().toISOString().split("T")[0] });
		}, []);

		const handleInputChange = React.useCallback((field: string, value: string) => {
			setFormData((prev) => ({ ...prev, [field]: value }));
		}, []);

		const handleSubmitAction = React.useCallback(() => {
			const handler = createHandlers(actionType, formData, selectedAppealId, selectedReviewerEmployee);
			if (handler) {
				handler();
			}
		}, [actionType, formData, selectedAppealId, selectedReviewerEmployee, createHandlers]);

		const availableActions = useAvailableActions(complaint, t);

		const getDialogTitle = React.useCallback((): string => {
			const titles: Record<string, string> = {
				notification: t("action.sendNotification"),
				rebuttal: t("action.recordRebuttal"),
				rebuttalDeadline: t("action.markDeadlinePassed"),
				finding: t("action.recordFinding"),
				decision: t("action.recordDecision"),
				assignCommittee: t("action.assignCommittee"),
				forwardToCommittee: t("action.forwardToCommittee"),
				forwardToHq: t("action.forwardToHq"),
				hqDecision: t("action.recordHqDecision"),
				submitAppeal: t("action.submitAppeal"),
				appealDecision: t("action.recordAppealDecision"),
				close: t("action.closeComplaint"),
			};
			return titles[actionType as string] ?? "";
		}, [actionType, t]);

		if (availableActions.length === 0) {
			return null;
		}

		return (
			<>
				<Card>
					<CardHeader>
						<CardTitle>{t("detail.actions")}</CardTitle>
						<CardDescription>{t("detail.actionsDescription")}</CardDescription>
					</CardHeader>
					<CardContent className="space-y-2">
						{availableActions.map((action) => (
							<Button
								key={`${action.type}-${action.appealId ?? ""}`}
								variant={action.variant ?? "default"}
								className="w-full"
								onClick={() => handleOpenAction(action.type, action.appealId)}
							>
								{action.label}
							</Button>
						))}
					</CardContent>
				</Card>

				<Dialog open={actionType !== null} onOpenChange={(open) => !open && handleCloseAction()}>
					<DialogContent className="max-w-lg">
						<DialogHeader>
							<DialogTitle>{getDialogTitle()}</DialogTitle>
							<DialogDescription>
								{actionType === "rebuttalDeadline" ? t("action.deadlinePassedConfirm") : t("action.fillDetails")}
							</DialogDescription>
						</DialogHeader>

						<ComplaintActionFormFields
							actionType={actionType}
							formData={formData}
							onInputChange={handleInputChange}
							selectedReviewerEmployee={selectedReviewerEmployee}
							setSelectedReviewerEmployee={setSelectedReviewerEmployee}
							centerDisciplineCommittees={centerDisciplineCommittees}
							hqCommittees={hqCommittees}
							isHqComplaint={isHqComplaint}
							t={t}
							tCommon={tCommon}
						/>

						<DialogFooter>
							<Button variant="outline" onClick={handleCloseAction}>
								{tCommon("cancel")}
							</Button>
							<Button onClick={handleSubmitAction} disabled={isLoading}>
								{isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
								{tCommon("confirm")}
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			</>
		);
	},
	(prevProps, nextProps) =>
		prevProps.complaint.id === nextProps.complaint.id &&
		prevProps.complaint.status === nextProps.complaint.status &&
		prevProps.complaint.centerId === nextProps.complaint.centerId &&
		prevProps.complaint.assignedCommitteeId === nextProps.complaint.assignedCommitteeId &&
		prevProps.complaint.appeals?.length === nextProps.complaint.appeals?.length,
);

ComplaintActions.displayName = "ComplaintActions";
