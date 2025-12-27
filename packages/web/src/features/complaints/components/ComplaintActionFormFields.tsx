import type { TFunction } from "i18next";
import React from "react";
import { EmployeeSearch } from "#web/components/common/EmployeeSearch.tsx";
import { Input } from "#web/components/ui/input.tsx";
import { Label } from "#web/components/ui/label.tsx";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "#web/components/ui/select.tsx";
import { Textarea } from "#web/components/ui/textarea.tsx";
import type { Committee } from "#web/types/committee.ts";
import { COMPLAINT_FINDING_LABELS } from "#web/types/complaint.ts";

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

const APPEAL_DECISION_LABELS: Record<string, string> = {
	UPHELD: "Upheld (Original decision stands)",
	MODIFIED: "Modified (Punishment changed)",
	OVERTURNED: "Overturned (Decision reversed)",
} as const;

interface CommonFieldsProps {
	formData: Record<string, string>;
	onInputChange: (field: string, value: string) => void;
	tCommon: TFunction;
}

const DateField = React.memo(({ formData, onInputChange, tCommon }: CommonFieldsProps) => (
	<div className="space-y-2">
		<Label>{tCommon("date")}</Label>
		<Input type="date" value={formData.date ?? ""} onChange={(e) => onInputChange("date", e.target.value)} />
	</div>
));
DateField.displayName = "DateField";

const NotesField = React.memo(({ formData, onInputChange, t }: CommonFieldsProps & { t: TFunction }) => (
	<div className="space-y-2">
		<Label>{t("complaint.notes")}</Label>
		<Textarea
			value={formData.notes ?? ""}
			onChange={(e) => onInputChange("notes", e.target.value)}
			placeholder={t("action.optionalNotes")}
		/>
	</div>
));
NotesField.displayName = "NotesField";

interface RebuttalFieldsProps {
	formData: Record<string, string>;
	onInputChange: (field: string, value: string) => void;
	t: TFunction;
}

const RebuttalFields = React.memo(({ formData, onInputChange, t }: RebuttalFieldsProps) => (
	<div className="space-y-2">
		<Label>{t("complaint.rebuttalContent")}</Label>
		<Textarea
			value={formData.content ?? ""}
			onChange={(e) => onInputChange("content", e.target.value)}
			className="min-h-[100px]"
		/>
	</div>
));
RebuttalFields.displayName = "RebuttalFields";

interface FindingFieldsProps {
	formData: Record<string, string>;
	onInputChange: (field: string, value: string) => void;
	t: TFunction;
}

const FindingFields = React.memo(({ formData, onInputChange, t }: FindingFieldsProps) => (
	<>
		<div className="space-y-2">
			<Label>{t("complaint.finding")}</Label>
			<Select value={formData.finding ?? ""} onValueChange={(value) => onInputChange("finding", value)}>
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
		<div className="space-y-2">
			<Label>{t("complaint.reason")}</Label>
			<Textarea
				value={formData.reason ?? ""}
				onChange={(e) => onInputChange("reason", e.target.value)}
				className="min-h-[80px]"
			/>
		</div>
	</>
));
FindingFields.displayName = "FindingFields";

interface CommitteeSelectFieldsProps extends CommonFieldsProps {
	centerDisciplineCommittees: Committee[];
	hqCommittees: Committee[];
	isHqComplaint: boolean;
	fieldName: string;
	t: TFunction;
}

const CommitteeSelectFields = React.memo(
	({
		formData,
		onInputChange,
		centerDisciplineCommittees,
		hqCommittees,
		isHqComplaint,
		fieldName,
		t,
	}: CommitteeSelectFieldsProps) => (
		<div className="space-y-2">
			<Label>{t(`action.${fieldName}`)}</Label>
			<Select value={formData.committeeId ?? ""} onValueChange={(value) => onInputChange("committeeId", value)}>
				<SelectTrigger>
					<SelectValue placeholder={t(`action.${fieldName}`)} />
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
	),
);
CommitteeSelectFields.displayName = "CommitteeSelectFields";

interface HqCommitteeSelectFieldsProps extends CommonFieldsProps {
	hqCommittees: Committee[];
	t: TFunction;
}

const HqCommitteeSelectFields = React.memo(
	({ formData, onInputChange, hqCommittees, t }: HqCommitteeSelectFieldsProps) => (
		<div className="space-y-2">
			<Label>{t("action.selectHqCommittee")}</Label>
			<Select value={formData.hqCommitteeId ?? ""} onValueChange={(value) => onInputChange("hqCommitteeId", value)}>
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
	),
);
HqCommitteeSelectFields.displayName = "HqCommitteeSelectFields";

interface DecisionFieldsProps extends CommonFieldsProps {
	t: TFunction;
}

const DecisionFields = React.memo(({ formData, onInputChange, t }: DecisionFieldsProps) => (
	<>
		<div className="space-y-2">
			<Label>{t("complaint.punishmentPercentage")}</Label>
			<Input
				type="number"
				min="0"
				max="100"
				value={formData.percentage ?? ""}
				onChange={(e) => onInputChange("percentage", e.target.value)}
			/>
		</div>
		<div className="space-y-2">
			<Label>{t("complaint.punishmentDescription")}</Label>
			<Textarea
				value={formData.description ?? ""}
				onChange={(e) => onInputChange("description", e.target.value)}
				className="min-h-[80px]"
			/>
		</div>
	</>
));
DecisionFields.displayName = "DecisionFields";

interface AppealSubmitFieldsProps extends CommonFieldsProps {
	selectedReviewerEmployee: { id: string; fullName: string } | null;
	setSelectedReviewerEmployee: (employee: { id: string; fullName: string } | null) => void;
	t: TFunction;
}

const AppealSubmitFields = React.memo(
	({ formData, onInputChange, selectedReviewerEmployee, setSelectedReviewerEmployee, t }: AppealSubmitFieldsProps) => (
		<>
			<div className="space-y-2">
				<Label>{t("appeal.appealDate")}</Label>
				<Input type="date" value={formData.date ?? ""} onChange={(e) => onInputChange("date", e.target.value)} />
			</div>
			<div className="space-y-2">
				<Label>{t("appeal.reviewerEmployee")}</Label>
				<EmployeeSearch
					onEmployeeFound={(emp) => setSelectedReviewerEmployee({ id: emp.id, fullName: emp.fullName })}
					onClear={() => setSelectedReviewerEmployee(null)}
					selectedEmployee={selectedReviewerEmployee as never}
				/>
				{selectedReviewerEmployee && (
					<p className="text-sm text-green-600">
						{t("appeal.selectedReviewer")}: {selectedReviewerEmployee.fullName}
					</p>
				)}
				<p className="text-xs text-muted-foreground">{t("appeal.reviewerEmployeeHint")}</p>
			</div>
			<div className="space-y-2">
				<Label>{t("appeal.appealReason")}</Label>
				<Textarea
					value={formData.reason ?? ""}
					onChange={(e) => onInputChange("reason", e.target.value)}
					className="min-h-[100px]"
					placeholder={t("appeal.enterAppealReason")}
				/>
			</div>
		</>
	),
);
AppealSubmitFields.displayName = "AppealSubmitFields";

interface AppealDecisionFieldsProps extends CommonFieldsProps {
	t: TFunction;
}

const AppealDecisionFields = React.memo(({ formData, onInputChange, t }: AppealDecisionFieldsProps) => (
	<>
		<div className="space-y-2">
			<Label>{t("appeal.decisionDate")}</Label>
			<Input type="date" value={formData.date ?? ""} onChange={(e) => onInputChange("date", e.target.value)} />
		</div>
		<div className="space-y-2">
			<Label>{t("appeal.decision")}</Label>
			<Select value={formData.decision ?? ""} onValueChange={(value) => onInputChange("decision", value)}>
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
				onChange={(e) => onInputChange("reason", e.target.value)}
				className="min-h-[80px]"
			/>
		</div>
		{formData.decision === "MODIFIED" && (
			<div className="space-y-2">
				<Label>{t("appeal.newPunishment")}</Label>
				<Textarea
					value={formData.newPunishment ?? ""}
					onChange={(e) => onInputChange("newPunishment", e.target.value)}
					className="min-h-[60px]"
					placeholder={t("appeal.enterNewPunishment")}
				/>
			</div>
		)}
	</>
));
AppealDecisionFields.displayName = "AppealDecisionFields";

interface ComplaintActionFormFieldsProps {
	actionType: ActionType;
	formData: Record<string, string>;
	onInputChange: (field: string, value: string) => void;
	selectedReviewerEmployee: { id: string; fullName: string } | null;
	setSelectedReviewerEmployee: (employee: { id: string; fullName: string } | null) => void;
	centerDisciplineCommittees: Committee[];
	hqCommittees: Committee[];
	isHqComplaint: boolean;
	t: TFunction;
	tCommon: TFunction;
}

export const ComplaintActionFormFields = React.memo(
	({
		actionType,
		formData,
		onInputChange,
		selectedReviewerEmployee,
		setSelectedReviewerEmployee,
		centerDisciplineCommittees,
		hqCommittees,
		isHqComplaint,
		t,
		tCommon,
	}: ComplaintActionFormFieldsProps) => {
		if (actionType === "rebuttalDeadline" || !actionType) {
			return null;
		}

		return (
			<div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
				{actionType !== "submitAppeal" && actionType !== "appealDecision" && (
					<DateField formData={formData} onInputChange={onInputChange} tCommon={tCommon} />
				)}

				{actionType === "rebuttal" && <RebuttalFields formData={formData} onInputChange={onInputChange} t={t} />}

				{actionType === "finding" && <FindingFields formData={formData} onInputChange={onInputChange} t={t} />}

				{actionType === "assignCommittee" && (
					<CommitteeSelectFields
						formData={formData}
						onInputChange={onInputChange}
						centerDisciplineCommittees={centerDisciplineCommittees}
						hqCommittees={hqCommittees}
						isHqComplaint={isHqComplaint}
						fieldName="selectCommittee"
						t={t}
						tCommon={tCommon}
					/>
				)}

				{actionType === "forwardToCommittee" && (
					<div className="space-y-2">
						<Label>{t("action.selectCommittee")}</Label>
						<Select value={formData.committeeId ?? ""} onValueChange={(value) => onInputChange("committeeId", value)}>
							<SelectTrigger>
								<SelectValue placeholder={t("action.selectCommittee")} />
							</SelectTrigger>
							<SelectContent>
								{centerDisciplineCommittees.length > 0 ? (
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
					<HqCommitteeSelectFields
						formData={formData}
						onInputChange={onInputChange}
						hqCommittees={hqCommittees}
						t={t}
						tCommon={tCommon}
					/>
				)}

				{actionType === "decision" && (
					<DecisionFields formData={formData} onInputChange={onInputChange} t={t} tCommon={tCommon} />
				)}

				{actionType === "hqDecision" && (
					<div className="space-y-2">
						<Label>{t("complaint.punishmentDescription")}</Label>
						<Textarea
							value={formData.description ?? ""}
							onChange={(e) => onInputChange("description", e.target.value)}
							className="min-h-[80px]"
						/>
					</div>
				)}

				{actionType === "submitAppeal" && (
					<AppealSubmitFields
						formData={formData}
						onInputChange={onInputChange}
						selectedReviewerEmployee={selectedReviewerEmployee}
						setSelectedReviewerEmployee={setSelectedReviewerEmployee}
						t={t}
						tCommon={tCommon}
					/>
				)}

				{actionType === "appealDecision" && (
					<AppealDecisionFields formData={formData} onInputChange={onInputChange} t={t} tCommon={tCommon} />
				)}

				{actionType === "close" && (
					<div className="space-y-2">
						<Label>{t("complaint.reason")}</Label>
						<Textarea
							value={formData.reason ?? ""}
							onChange={(e) => onInputChange("reason", e.target.value)}
							className="min-h-[80px]"
						/>
					</div>
				)}

				<NotesField formData={formData} onInputChange={onInputChange} t={t} tCommon={tCommon} />
			</div>
		);
	},
	(prevProps, nextProps) =>
		prevProps.actionType === nextProps.actionType &&
		prevProps.formData === nextProps.formData &&
		prevProps.selectedReviewerEmployee === nextProps.selectedReviewerEmployee,
);

ComplaintActionFormFields.displayName = "ComplaintActionFormFields";
