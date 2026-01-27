import { ArrowLeft, FileText, Users } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { useCommittee, useCommitteeHistory, useCommitteeMembers } from "#web/api/committees/committees.queries.ts";
import { useCommitteeComplaints } from "#web/api/complaints/complaints.queries.ts";
import { ConfirmDialog } from "#web/components/common/ConfirmDialog.tsx";
import { Badge } from "#web/components/ui/badge.tsx";
import { Button } from "#web/components/ui/button.tsx";
import { Card, CardContent, CardHeader, CardTitle } from "#web/components/ui/card.tsx";
import { Tabs, TabsList, TabsTrigger } from "#web/components/ui/tabs.tsx";
import { AddMemberDialog } from "#web/features/committees/components/AddMemberDialog.tsx";
import { ComplaintsTab, HistoryTab, MembersTab } from "#web/features/committees/components/CommitteeTabs.tsx";
import {
	useComplaintColumns,
	useHistoryColumns,
	useMemberColumns,
} from "#web/features/committees/hooks/useCommitteeColumns.tsx";
import { useCommitteeDisplayNames } from "#web/features/committees/hooks/useCommitteeDisplayNames.ts";
import { useCommitteePageHandlers } from "#web/features/committees/hooks/useCommitteePageHandlers.ts";
import type { CommitteeStatus } from "#web/types/committee.ts";

const STATUS_COLORS: Record<CommitteeStatus, "default" | "secondary" | "destructive"> = {
	ACTIVE: "default",
	SUSPENDED: "secondary",
	DISSOLVED: "destructive",
} as const;

export const CommitteeDetailPage = React.memo(() => {
	const { id } = useParams<{ id: string }>();
	const { t } = useTranslation("committees");
	const { t: tCommon } = useTranslation("common");
	const { i18n } = useTranslation();
	const isAmharic = i18n.language === "am";

	const { data: committee, isLoading: committeeLoading } = useCommittee(id ?? "", false);
	const { data: members, isLoading: membersLoading } = useCommitteeMembers(id ?? "", false);
	const { data: history } = useCommitteeHistory(id ?? "");
	const { data: assignedComplaints, isLoading: assignedComplaintsLoading } = useCommitteeComplaints(
		id ?? "",
		"assigned",
	);
	const { data: hqComplaints, isLoading: hqComplaintsLoading } = useCommitteeComplaints(id ?? "", "hq");

	const {
		addMemberMutation,
		removeMemberMutation,
		addMemberOpen,
		removeOpen,
		setAddMemberOpen,
		setRemoveOpen,
		handleBack,
		handleAddMember,
		handleRemoveClick,
		handleAddMemberSubmit,
		handleRoleChange,
		handleRemoveConfirm,
		handleViewComplaint,
	} = useCommitteePageHandlers({ committeeId: id, tCommon });

	const memberColumns = useMemberColumns({
		t,
		tCommon,
		isAmharic,
		committeeStatus: committee?.status,
		onRoleChange: handleRoleChange,
		onRemoveClick: handleRemoveClick,
	});
	const historyColumns = useHistoryColumns({ t });
	const complaintColumns = useComplaintColumns({ t, isAmharic, onViewComplaint: handleViewComplaint });

	const { displayName, typeName, centerName } = useCommitteeDisplayNames({ committee, isAmharic, t });

	if (committeeLoading) {
		return <div className="flex items-center justify-center p-8">{tCommon("loading")}</div>;
	}

	if (!committee) {
		return <div className="flex items-center justify-center p-8">{t("committee.notFound")}</div>;
	}

	return (
		<div className="space-y-6">
			<div className="flex items-center gap-4">
				<Button variant="ghost" size="icon" onClick={handleBack}>
					<ArrowLeft className="h-4 w-4" />
				</Button>
				<div className="flex-1">
					<h1 className="text-2xl font-bold">{displayName}</h1>
					<p className="text-muted-foreground">
						{typeName} - {centerName}
					</p>
				</div>
				<Badge variant={STATUS_COLORS[committee.status]} className="text-sm">
					{t(`status.${committee.status.toLowerCase()}`)}
				</Badge>
			</div>

			<div className="grid gap-6 md:grid-cols-3">
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-medium">{t("committee.code")}</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-2xl font-bold font-mono">{committee.code}</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-medium">{t("committee.memberCount")}</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-2xl font-bold">{members?.length ?? 0}</p>
						{committee.committeeType && (
							<p className="text-sm text-muted-foreground">
								{t("type.minMax", {
									min: committee.committeeType.minMembers,
									max: committee.committeeType.maxMembers ?? t("type.unlimited"),
								})}
							</p>
						)}
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-medium">{t("committee.establishedDate")}</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-2xl font-bold">{new Date(committee.establishedDate).toLocaleDateString()}</p>
					</CardContent>
				</Card>
			</div>

			<Tabs defaultValue="members" className="w-full">
				<TabsList>
					<TabsTrigger value="members">
						<Users className="mr-2 h-4 w-4" />
						{t("member.title")} ({members?.length ?? 0})
					</TabsTrigger>
					<TabsTrigger value="complaints">
						<FileText className="mr-2 h-4 w-4" />
						{t("complaints.title")} ({assignedComplaints?.length ?? 0})
					</TabsTrigger>
					<TabsTrigger value="hqComplaints">
						<FileText className="mr-2 h-4 w-4" />
						{t("complaints.hqTitle")} ({hqComplaints?.length ?? 0})
					</TabsTrigger>
					<TabsTrigger value="history">{t("history.title")}</TabsTrigger>
				</TabsList>

				<MembersTab
					t={t}
					members={members}
					membersLoading={membersLoading}
					memberColumns={memberColumns}
					isActive={committee.status === "ACTIVE"}
					onAddMember={handleAddMember}
				/>

				<ComplaintsTab
					complaints={assignedComplaints}
					complaintsLoading={assignedComplaintsLoading}
					complaintColumns={complaintColumns}
					tabValue="complaints"
					title={t("complaints.title")}
					description={t("complaints.description")}
					noComplaintsMessage={t("complaints.noComplaints")}
				/>

				<ComplaintsTab
					complaints={hqComplaints}
					complaintsLoading={hqComplaintsLoading}
					complaintColumns={complaintColumns}
					tabValue="hqComplaints"
					title={t("complaints.hqTitle")}
					description={t("complaints.hqDescription")}
					noComplaintsMessage={t("complaints.noHqComplaints")}
				/>

				<HistoryTab t={t} history={history} historyColumns={historyColumns} />
			</Tabs>

			<AddMemberDialog
				open={addMemberOpen}
				onOpenChange={setAddMemberOpen}
				onSubmit={handleAddMemberSubmit}
				committeeId={id ?? ""}
				isLoading={addMemberMutation.isPending}
			/>

			<ConfirmDialog
				open={removeOpen}
				onOpenChange={setRemoveOpen}
				title={t("action.removeMemberTitle")}
				description={t("action.removeMemberDescription")}
				onConfirm={handleRemoveConfirm}
				isLoading={removeMemberMutation.isPending}
				variant="destructive"
			/>
		</div>
	);
});

CommitteeDetailPage.displayName = "CommitteeDetailPage";
