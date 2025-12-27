import { Loader2 } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useCommittees } from "#web/api/committees/committees.queries.ts";
import {
	useAssignCommittee,
	useCloseComplaint,
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
import { EmployeeSearch } from "#web/components/common/EmployeeSearch.tsx";
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
import { Input } from "#web/components/ui/input.tsx";
import { Label } from "#web/components/ui/label.tsx";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "#web/components/ui/select.tsx";
import { Textarea } from "#web/components/ui/textarea.tsx";
import type { AppealDecision, Complaint, ComplaintFinding } from "#web/types/complaint.ts";
import { COMPLAINT_FINDING_LABELS } from "#web/types/complaint.ts";
import type { Committee } from "#web/types/committee.ts";

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
	| "forwardToHq"
	| "hqDecision"
	| "submitAppeal"
	| "appealDecision"
	| "close"
	| null;

const APPEAL_DECISION_LABELS: Record<AppealDecision, string> = {
	UPHELD: "Upheld (Original decision stands)",
	MODIFIED: "Modified (Punishment changed)",
	OVERTURNED: "Overturned (Decision reversed)",
} as const;

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
				committees.filter(
					(c: Committee) => !c.centerId && c.committeeType?.code?.toLowerCase().includes("discipline"),
				),
			[committees],
		);

		const isHqComplaint = !complaint.centerId;
		const canForwardToHq = complaint.assignedCommitteeId && !isHqComplaint;

		const notificationMutation = useRecordNotification();
		const rebuttalMutation = useRecordRebuttal();
		const deadlineMutation = useMarkRebuttalDeadlinePassed();
		const findingMutation = useRecordFinding();
		const decisionMutation = useRecordDecision();
		const assignCommitteeMutation = useAssignCommittee();
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
			forwardToHqMutation.isPending ||
			hqDecisionMutation.isPending ||
			submitAppealMutation.isPending ||
			appealDecisionMutation.isPending ||
			closeMutation.isPending;

		const handleOpenAction = React.useCallback((type: ActionType, appealId?: string) => {
			setActionType(type);
			setSelectedAppealId(appealId ?? null);
			setFormData({
				date: new Date().toISOString().split("T")[0],
			});
		}, []);

		const handleCloseAction = React.useCallback(() => {
			setActionType(null);
			setFormData({});
			setSelectedAppealId(null);
			setSelectedReviewerEmployee(null);
		}, []);

		const handleInputChange = React.useCallback((field: string, value: string) => {
			setFormData((prev) => ({ ...prev, [field]: value }));
		}, []);

		const handleSubmitAction = React.useCallback(() => {
			const onSuccess = () => {
				toast.success(tCommon("success"));
				handleCloseAction();
			};
			const onError = () => {
				toast.error(tCommon("error"));
			};

			switch (actionType) {
				case "notification":
					notificationMutation.mutate(
						{
							id: complaint.id,
							data: { notificationDate: formData.date, notes: formData.notes },
						},
						{ onSuccess, onError },
					);
					break;
				case "rebuttal":
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
					);
					break;
				case "rebuttalDeadline":
					deadlineMutation.mutate(complaint.id, { onSuccess, onError });
					break;
				case "finding":
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
					);
					break;
				case "decision":
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
					);
					break;
				case "assignCommittee":
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
					);
					break;
				case "forwardToHq":
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
					);
					break;
				case "hqDecision":
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
					);
					break;
				case "submitAppeal":
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
					break;
				case "appealDecision":
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
					break;
				case "close":
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
					);
					break;
			}
		}, [
			actionType,
			complaint.id,
			formData,
			selectedAppealId,
			selectedReviewerEmployee,
			notificationMutation,
			rebuttalMutation,
			deadlineMutation,
			findingMutation,
			decisionMutation,
			assignCommitteeMutation,
			forwardToHqMutation,
			hqDecisionMutation,
			submitAppealMutation,
			appealDecisionMutation,
			closeMutation,
			tCommon,
			handleCloseAction,
		]);

		const pendingAppeals = React.useMemo(
			() => complaint.appeals?.filter((a) => !a.decision) ?? [],
			[complaint.appeals],
		);

		const canSubmitAppeal = React.useMemo(() => {
			const hasNoPendingAppeals = !complaint.appeals?.some((a) => !a.decision);
			return hasNoPendingAppeals;
		}, [complaint.appeals]);

		const availableActions = React.useMemo(() => {
			const actions: { type: ActionType; label: string; variant?: "default" | "destructive"; appealId?: string }[] = [];

			switch (complaint.status) {
				case "UNDER_HR_REVIEW":
					actions.push({ type: "notification", label: t("action.sendNotification") });
					break;
				case "WITH_DISCIPLINE_COMMITTEE":
					actions.push({ type: "notification", label: t("action.sendNotification") });
					break;
				case "WAITING_FOR_REBUTTAL":
				case "COMMITTEE_WAITING_REBUTTAL":
					actions.push({ type: "rebuttal", label: t("action.recordRebuttal") });
					actions.push({ type: "rebuttalDeadline", label: t("action.markDeadlinePassed"), variant: "destructive" });
					break;
				case "UNDER_HR_ANALYSIS":
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
		}, [complaint.status, complaint.article, pendingAppeals, canSubmitAppeal, canForwardToHq, t]);

		const getDialogTitle = React.useCallback(() => {
			switch (actionType) {
				case "notification":
					return t("action.sendNotification");
				case "rebuttal":
					return t("action.recordRebuttal");
				case "rebuttalDeadline":
					return t("action.markDeadlinePassed");
				case "finding":
					return t("action.recordFinding");
				case "decision":
					return t("action.recordDecision");
				case "assignCommittee":
					return t("action.assignCommittee");
				case "forwardToHq":
					return t("action.forwardToHq");
				case "hqDecision":
					return t("action.recordHqDecision");
				case "submitAppeal":
					return t("action.submitAppeal");
				case "appealDecision":
					return t("action.recordAppealDecision");
				case "close":
					return t("action.closeComplaint");
				default:
					return "";
			}
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

						{actionType !== "rebuttalDeadline" && (
							<div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
								{actionType !== "submitAppeal" && actionType !== "appealDecision" && (
									<div className="space-y-2">
										<Label>{tCommon("date")}</Label>
										<Input
											type="date"
											value={formData.date ?? ""}
											onChange={(e) => handleInputChange("date", e.target.value)}
										/>
									</div>
								)}

								{actionType === "rebuttal" && (
									<div className="space-y-2">
										<Label>{t("complaint.rebuttalContent")}</Label>
										<Textarea
											value={formData.content ?? ""}
											onChange={(e) => handleInputChange("content", e.target.value)}
											className="min-h-[100px]"
										/>
									</div>
								)}

								{actionType === "finding" && (
									<div className="space-y-2">
										<Label>{t("complaint.finding")}</Label>
										<Select
											value={formData.finding ?? ""}
											onValueChange={(value) => handleInputChange("finding", value)}
										>
											<SelectTrigger>
												<SelectValue placeholder={t("action.selectFinding")} />
											</SelectTrigger>
											<SelectContent>
												{Object.entries(COMPLAINT_FINDING_LABELS)
													.filter(([key]) => key !== "PENDING")
													.map(([value, label]) => (
														<SelectItem key={value} value={value}>
															{label}
														</SelectItem>
													))}
											</SelectContent>
										</Select>
									</div>
								)}

								{actionType === "assignCommittee" && (
									<div className="space-y-2">
										<Label>{t("action.selectCommittee")}</Label>
										<Select
											value={formData.committeeId ?? ""}
											onValueChange={(value) => handleInputChange("committeeId", value)}
										>
											<SelectTrigger>
												<SelectValue placeholder={t("action.selectCommittee")} />
											</SelectTrigger>
											<SelectContent>
												{isHqComplaint ? (
													hqCommittees.map((committee) => (
														<SelectItem key={committee.id} value={committee.id}>
															{committee.name}
														</SelectItem>
													))
												) : centerDisciplineCommittees.length > 0 ? (
													centerDisciplineCommittees.map((committee) => (
														<SelectItem key={committee.id} value={committee.id}>
															{committee.name}
														</SelectItem>
													))
												) : (
													<SelectItem value="none" disabled>
														{t("action.noCenterCommittees")}
													</SelectItem>
												)}
											</SelectContent>
										</Select>
									</div>
								)}

								{actionType === "forwardToHq" && (
									<div className="space-y-2">
										<Label>{t("action.selectHqCommittee")}</Label>
										<Select
											value={formData.hqCommitteeId ?? ""}
											onValueChange={(value) => handleInputChange("hqCommitteeId", value)}
										>
											<SelectTrigger>
												<SelectValue placeholder={t("action.selectHqCommittee")} />
											</SelectTrigger>
											<SelectContent>
												{hqCommittees.length > 0 ? (
													hqCommittees.map((committee) => (
														<SelectItem key={committee.id} value={committee.id}>
															{committee.name}
														</SelectItem>
													))
												) : (
													<SelectItem value="none" disabled>
														{t("action.noHqCommittees")}
													</SelectItem>
												)}
											</SelectContent>
										</Select>
									</div>
								)}

								{(actionType === "finding" || actionType === "close") && (
									<div className="space-y-2">
										<Label>{t("complaint.reason")}</Label>
										<Textarea
											value={formData.reason ?? ""}
											onChange={(e) => handleInputChange("reason", e.target.value)}
											className="min-h-[80px]"
										/>
									</div>
								)}

								{actionType === "decision" && (
									<>
										<div className="space-y-2">
											<Label>{t("complaint.punishmentPercentage")}</Label>
											<Input
												type="number"
												min="0"
												max="100"
												value={formData.percentage ?? ""}
												onChange={(e) => handleInputChange("percentage", e.target.value)}
											/>
										</div>
										<div className="space-y-2">
											<Label>{t("complaint.punishmentDescription")}</Label>
											<Textarea
												value={formData.description ?? ""}
												onChange={(e) => handleInputChange("description", e.target.value)}
												className="min-h-[80px]"
											/>
										</div>
									</>
								)}

								{actionType === "hqDecision" && (
									<div className="space-y-2">
										<Label>{t("complaint.punishmentDescription")}</Label>
										<Textarea
											value={formData.description ?? ""}
											onChange={(e) => handleInputChange("description", e.target.value)}
											className="min-h-[80px]"
										/>
									</div>
								)}

								{actionType === "submitAppeal" && (
									<>
										<div className="space-y-2">
											<Label>{t("appeal.appealDate")}</Label>
											<Input
												type="date"
												value={formData.date ?? ""}
												onChange={(e) => handleInputChange("date", e.target.value)}
											/>
										</div>
										<div className="space-y-2">
											<Label>{t("appeal.reviewerEmployee")}</Label>
											<EmployeeSearch
												onEmployeeFound={(emp) =>
													setSelectedReviewerEmployee({ id: emp.id, fullName: emp.fullName })
												}
												onClear={() => setSelectedReviewerEmployee(null)}
												selectedEmployee={selectedReviewerEmployee as never}
											/>
											{selectedReviewerEmployee && (
												<p className="text-sm text-green-600">
													{t("appeal.selectedReviewer")}: {selectedReviewerEmployee.fullName}
												</p>
											)}
											<p className="text-xs text-muted-foreground">
												{t("appeal.reviewerEmployeeHint")}
											</p>
										</div>
										<div className="space-y-2">
											<Label>{t("appeal.appealReason")}</Label>
											<Textarea
												value={formData.reason ?? ""}
												onChange={(e) => handleInputChange("reason", e.target.value)}
												className="min-h-[100px]"
												placeholder={t("appeal.enterAppealReason")}
											/>
										</div>
									</>
								)}

								{actionType === "appealDecision" && (
									<>
										<div className="space-y-2">
											<Label>{t("appeal.decisionDate")}</Label>
											<Input
												type="date"
												value={formData.date ?? ""}
												onChange={(e) => handleInputChange("date", e.target.value)}
											/>
										</div>
										<div className="space-y-2">
											<Label>{t("appeal.decision")}</Label>
											<Select
												value={formData.decision ?? ""}
												onValueChange={(value) => handleInputChange("decision", value)}
											>
												<SelectTrigger>
													<SelectValue placeholder={t("appeal.selectDecision")} />
												</SelectTrigger>
												<SelectContent>
													{Object.entries(APPEAL_DECISION_LABELS).map(([value, label]) => (
														<SelectItem key={value} value={value}>
															{label}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
										</div>
										<div className="space-y-2">
											<Label>{t("appeal.decisionReason")}</Label>
											<Textarea
												value={formData.reason ?? ""}
												onChange={(e) => handleInputChange("reason", e.target.value)}
												className="min-h-[80px]"
											/>
										</div>
										{formData.decision === "MODIFIED" && (
											<div className="space-y-2">
												<Label>{t("appeal.newPunishment")}</Label>
												<Textarea
													value={formData.newPunishment ?? ""}
													onChange={(e) => handleInputChange("newPunishment", e.target.value)}
													className="min-h-[60px]"
													placeholder={t("appeal.enterNewPunishment")}
												/>
											</div>
										)}
									</>
								)}

								<div className="space-y-2">
									<Label>{t("complaint.notes")}</Label>
									<Textarea
										value={formData.notes ?? ""}
										onChange={(e) => handleInputChange("notes", e.target.value)}
										placeholder={t("action.optionalNotes")}
									/>
								</div>
							</div>
						)}

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
		prevProps.complaint.appeals?.length === nextProps.complaint.appeals?.length,
);

ComplaintActions.displayName = "ComplaintActions";
