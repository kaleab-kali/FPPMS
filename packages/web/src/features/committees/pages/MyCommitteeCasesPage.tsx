import type { ColumnDef } from "@tanstack/react-table";
import { ArrowLeft, ExternalLink, FileText } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { useCommittee, useCommitteeMembers } from "#web/api/committees/committees.queries.ts";
import { useCommitteeComplaints } from "#web/api/complaints/complaints.queries.ts";
import { DataTable } from "#web/components/common/DataTable.tsx";
import { Badge } from "#web/components/ui/badge.tsx";
import { Button } from "#web/components/ui/button.tsx";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "#web/components/ui/card.tsx";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "#web/components/ui/tabs.tsx";
import type { ComplaintListItem, ComplaintStatus as ComplaintStatusType } from "#web/types/complaint.ts";
import { COMPLAINT_STATUS_COLORS, COMPLAINT_STATUS_LABELS } from "#web/types/complaint.ts";

const COMMITTEE_ROLE_LABELS: Record<string, string> = {
	CHAIRMAN: "Chairman",
	VICE_CHAIRMAN: "Vice Chairman",
	SECRETARY: "Secretary",
	MEMBER: "Member",
	ADVISOR: "Advisor",
} as const;

export const MyCommitteeCasesPage = React.memo(
	() => {
		const { committeeId } = useParams<{ committeeId: string }>();
		const { t } = useTranslation("committees");
		const { t: tComplaints } = useTranslation("complaints");
		const { t: tCommon } = useTranslation("common");
		const navigate = useNavigate();
		const { i18n } = useTranslation();
		const isAmharic = i18n.language === "am";

		const { data: committee, isLoading: committeeLoading } = useCommittee(committeeId ?? "", false);
		const { data: members } = useCommitteeMembers(committeeId ?? "", false);
		const { data: assignedComplaints, isLoading: assignedComplaintsLoading } = useCommitteeComplaints(
			committeeId ?? "",
			"assigned",
		);
		const { data: hqComplaints, isLoading: hqComplaintsLoading } = useCommitteeComplaints(committeeId ?? "", "hq");

		const handleBack = React.useCallback(() => {
			navigate("/dashboard");
		}, [navigate]);

		const handleViewComplaint = React.useCallback(
			(complaintId: string) => {
				navigate(`/complaints/${complaintId}`);
			},
			[navigate],
		);

		const complaintColumns = React.useMemo<ColumnDef<ComplaintListItem>[]>(
			() => [
				{
					accessorKey: "complaintNumber",
					header: tComplaints("complaint.complaintNumber"),
					cell: ({ row }) => (
						<span className="font-mono text-sm font-medium">{row.getValue("complaintNumber")}</span>
					),
				},
				{
					accessorKey: "article",
					header: tComplaints("complaint.article"),
					cell: ({ row }) => {
						const article = row.getValue("article") as string;
						return (
							<Badge variant={article === "ARTICLE_30" ? "secondary" : "default"}>
								{article === "ARTICLE_30" ? "Art. 30" : "Art. 31"}
							</Badge>
						);
					},
				},
				{
					accessorKey: "accusedEmployee",
					header: tComplaints("complaint.accused"),
					cell: ({ row }) => {
						const emp = row.original.accusedEmployee;
						if (!emp) return "-";
						const displayName = isAmharic && emp.fullNameAm ? emp.fullNameAm : emp.fullName;
						return (
							<div>
								<span className="font-medium">{displayName}</span>
								<span className="block text-xs text-muted-foreground">{emp.employeeId}</span>
							</div>
						);
					},
				},
				{
					accessorKey: "status",
					header: tComplaints("complaint.status"),
					cell: ({ row }) => {
						const status = row.getValue("status") as ComplaintStatusType;
						return <Badge className={COMPLAINT_STATUS_COLORS[status]}>{COMPLAINT_STATUS_LABELS[status]}</Badge>;
					},
				},
				{
					accessorKey: "registeredDate",
					header: tComplaints("complaint.registeredDate"),
					cell: ({ row }) => {
						const date = row.getValue("registeredDate") as string;
						return <span>{new Date(date).toLocaleDateString()}</span>;
					},
				},
				{
					id: "actions",
					header: "",
					cell: ({ row }) => (
						<Button variant="ghost" size="sm" onClick={() => handleViewComplaint(row.original.id)}>
							<ExternalLink className="mr-1 h-3 w-3" />
							{t("complaints.viewDetails")}
						</Button>
					),
				},
			],
			[tComplaints, t, isAmharic, handleViewComplaint],
		);

		if (committeeLoading) {
			return <div className="flex items-center justify-center p-8">{tCommon("loading")}</div>;
		}

		if (!committee) {
			return <div className="flex items-center justify-center p-8">{t("committee.notFound")}</div>;
		}

		const displayName = isAmharic && committee.nameAm ? committee.nameAm : committee.name;
		const centerName = committee.center
			? isAmharic && committee.center.nameAm
				? committee.center.nameAm
				: committee.center.name
			: t("committee.hqLevel");

		const totalCases = (assignedComplaints?.length ?? 0) + (hqComplaints?.length ?? 0);

		return (
			<div className="space-y-6">
				<div className="flex items-center gap-4">
					<Button variant="ghost" size="icon" onClick={handleBack}>
						<ArrowLeft className="h-4 w-4" />
					</Button>
					<div className="flex-1">
						<h1 className="text-2xl font-bold">{displayName}</h1>
						<p className="text-muted-foreground">{centerName}</p>
					</div>
					<Badge variant="outline" className="text-lg px-4 py-2">
						<FileText className="mr-2 h-4 w-4" />
						{totalCases} {t("complaints.title")}
					</Badge>
				</div>

				<div className="grid gap-4 md:grid-cols-3">
					<Card>
						<CardHeader className="pb-2">
							<CardTitle className="text-sm font-medium">{t("complaints.title")}</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-2xl font-bold">{assignedComplaints?.length ?? 0}</p>
							<p className="text-xs text-muted-foreground">{t("complaints.description")}</p>
						</CardContent>
					</Card>
					<Card>
						<CardHeader className="pb-2">
							<CardTitle className="text-sm font-medium">{t("complaints.hqTitle")}</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-2xl font-bold">{hqComplaints?.length ?? 0}</p>
							<p className="text-xs text-muted-foreground">{t("complaints.hqDescription")}</p>
						</CardContent>
					</Card>
					<Card>
						<CardHeader className="pb-2">
							<CardTitle className="text-sm font-medium">{t("committee.memberCount")}</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-2xl font-bold">{members?.length ?? 0}</p>
							<p className="text-xs text-muted-foreground">
								{members
									?.slice(0, 3)
									.map((m) => COMMITTEE_ROLE_LABELS[m.role])
									.join(", ")}
								{members && members.length > 3 && "..."}
							</p>
						</CardContent>
					</Card>
				</div>

				<Tabs defaultValue="assigned">
					<TabsList>
						<TabsTrigger value="assigned">
							{t("complaints.title")} ({assignedComplaints?.length ?? 0})
						</TabsTrigger>
						<TabsTrigger value="hq">
							{t("complaints.hqTitle")} ({hqComplaints?.length ?? 0})
						</TabsTrigger>
					</TabsList>

					<TabsContent value="assigned" className="mt-4">
						<Card>
							<CardHeader>
								<CardTitle>{t("complaints.title")}</CardTitle>
								<CardDescription>{t("complaints.description")}</CardDescription>
							</CardHeader>
							<CardContent>
								{(assignedComplaints?.length ?? 0) === 0 && !assignedComplaintsLoading ? (
									<p className="text-center text-muted-foreground py-8">{t("complaints.noComplaints")}</p>
								) : (
									<DataTable
										columns={complaintColumns}
										data={assignedComplaints ?? []}
										isLoading={assignedComplaintsLoading}
									/>
								)}
							</CardContent>
						</Card>
					</TabsContent>

					<TabsContent value="hq" className="mt-4">
						<Card>
							<CardHeader>
								<CardTitle>{t("complaints.hqTitle")}</CardTitle>
								<CardDescription>{t("complaints.hqDescription")}</CardDescription>
							</CardHeader>
							<CardContent>
								{(hqComplaints?.length ?? 0) === 0 && !hqComplaintsLoading ? (
									<p className="text-center text-muted-foreground py-8">{t("complaints.noHqComplaints")}</p>
								) : (
									<DataTable columns={complaintColumns} data={hqComplaints ?? []} isLoading={hqComplaintsLoading} />
								)}
							</CardContent>
						</Card>
					</TabsContent>
				</Tabs>
			</div>
		);
	},
	() => true,
);

MyCommitteeCasesPage.displayName = "MyCommitteeCasesPage";
