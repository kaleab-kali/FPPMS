import type { ColumnDef } from "@tanstack/react-table";
import type { TFunction } from "i18next";
import { Plus } from "lucide-react";
import React from "react";
import { DataTable } from "#web/components/common/DataTable.tsx";
import { Button } from "#web/components/ui/button.tsx";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "#web/components/ui/card.tsx";
import { TabsContent } from "#web/components/ui/tabs.tsx";
import type { CommitteeHistory, CommitteeMember } from "#web/types/committee.ts";
import type { ComplaintListItem } from "#web/types/complaint.ts";

interface MembersTabProps {
	t: TFunction;
	members: CommitteeMember[] | undefined;
	membersLoading: boolean;
	memberColumns: ColumnDef<CommitteeMember>[];
	isActive: boolean;
	onAddMember: () => void;
}

export const MembersTab = React.memo(
	({ t, members, membersLoading, memberColumns, isActive, onAddMember }: MembersTabProps) => (
		<TabsContent value="members" className="mt-4">
			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<div>
							<CardTitle>{t("member.title")}</CardTitle>
							<CardDescription>{t("member.description")}</CardDescription>
						</div>
						{isActive && (
							<Button onClick={onAddMember}>
								<Plus className="mr-2 h-4 w-4" />
								{t("member.add")}
							</Button>
						)}
					</div>
				</CardHeader>
				<CardContent>
					<DataTable columns={memberColumns} data={members ?? []} isLoading={membersLoading} />
				</CardContent>
			</Card>
		</TabsContent>
	),
	(prevProps, nextProps) =>
		prevProps.members?.length === nextProps.members?.length &&
		prevProps.membersLoading === nextProps.membersLoading &&
		prevProps.isActive === nextProps.isActive,
);
MembersTab.displayName = "MembersTab";

interface ComplaintsTabProps {
	complaints: ComplaintListItem[] | undefined;
	complaintsLoading: boolean;
	complaintColumns: ColumnDef<ComplaintListItem>[];
	tabValue: string;
	title: string;
	description: string;
	noComplaintsMessage: string;
}

export const ComplaintsTab = React.memo(
	({
		complaints,
		complaintsLoading,
		complaintColumns,
		tabValue,
		title,
		description,
		noComplaintsMessage,
	}: ComplaintsTabProps) => (
		<TabsContent value={tabValue} className="mt-4">
			<Card>
				<CardHeader>
					<CardTitle>{title}</CardTitle>
					<CardDescription>{description}</CardDescription>
				</CardHeader>
				<CardContent>
					{(complaints?.length ?? 0) === 0 && !complaintsLoading ? (
						<p className="text-center text-muted-foreground py-8">{noComplaintsMessage}</p>
					) : (
						<DataTable columns={complaintColumns} data={complaints ?? []} isLoading={complaintsLoading} />
					)}
				</CardContent>
			</Card>
		</TabsContent>
	),
	(prevProps, nextProps) =>
		prevProps.complaints?.length === nextProps.complaints?.length &&
		prevProps.complaintsLoading === nextProps.complaintsLoading,
);
ComplaintsTab.displayName = "ComplaintsTab";

interface HistoryTabProps {
	t: TFunction;
	history: CommitteeHistory[] | undefined;
	historyColumns: ColumnDef<CommitteeHistory>[];
}

export const HistoryTab = React.memo(
	({ t, history, historyColumns }: HistoryTabProps) => (
		<TabsContent value="history" className="mt-4">
			<Card>
				<CardHeader>
					<CardTitle>{t("history.title")}</CardTitle>
					<CardDescription>{t("history.description")}</CardDescription>
				</CardHeader>
				<CardContent>
					<DataTable columns={historyColumns} data={history ?? []} isLoading={false} />
				</CardContent>
			</Card>
		</TabsContent>
	),
	(prevProps, nextProps) => prevProps.history?.length === nextProps.history?.length,
);
HistoryTab.displayName = "HistoryTab";
