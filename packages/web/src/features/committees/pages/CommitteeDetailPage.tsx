import type { ColumnDef } from "@tanstack/react-table";
import { ArrowLeft, MoreHorizontal, Pencil, Plus, Trash2, Users } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import {
	useAddCommitteeMember,
	useRemoveCommitteeMember,
	useUpdateCommitteeMember,
} from "#web/api/committees/committees.mutations.ts";
import { useCommittee, useCommitteeHistory, useCommitteeMembers } from "#web/api/committees/committees.queries.ts";
import { ConfirmDialog } from "#web/components/common/ConfirmDialog.tsx";
import { DataTable } from "#web/components/common/DataTable.tsx";
import { Badge } from "#web/components/ui/badge.tsx";
import { Button } from "#web/components/ui/button.tsx";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "#web/components/ui/card.tsx";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "#web/components/ui/dropdown-menu.tsx";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "#web/components/ui/tabs.tsx";
import { AddMemberDialog } from "#web/features/committees/components/AddMemberDialog.tsx";
import type {
	AddCommitteeMemberRequest,
	CommitteeHistory,
	CommitteeMember,
	CommitteeMemberRole,
	CommitteeStatus,
	UpdateCommitteeMemberRequest,
} from "#web/types/committee.ts";

const STATUS_COLORS: Record<CommitteeStatus, "default" | "secondary" | "destructive"> = {
	ACTIVE: "default",
	SUSPENDED: "secondary",
	DISSOLVED: "destructive",
} as const;

const ROLE_COLORS: Record<CommitteeMemberRole, "default" | "secondary" | "outline"> = {
	CHAIRMAN: "default",
	VICE_CHAIRMAN: "default",
	SECRETARY: "secondary",
	MEMBER: "outline",
	ADVISOR: "outline",
} as const;

export const CommitteeDetailPage = React.memo(
	() => {
		const { id } = useParams<{ id: string }>();
		const { t } = useTranslation("committees");
		const { t: tCommon } = useTranslation("common");
		const navigate = useNavigate();

		const [addMemberOpen, setAddMemberOpen] = React.useState(false);
		const [removeOpen, setRemoveOpen] = React.useState(false);
		const [selectedMember, setSelectedMember] = React.useState<CommitteeMember | undefined>();

		const { data: committee, isLoading: committeeLoading } = useCommittee(id ?? "", false);
		const { data: members, isLoading: membersLoading } = useCommitteeMembers(id ?? "", false);
		const { data: history } = useCommitteeHistory(id ?? "");

		const addMemberMutation = useAddCommitteeMember();
		const updateMemberMutation = useUpdateCommitteeMember();
		const removeMemberMutation = useRemoveCommitteeMember();

		const handleBack = React.useCallback(() => {
			navigate("/committees");
		}, [navigate]);

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
				if (!id) return;
				addMemberMutation.mutate(
					{ committeeId: id, data },
					{
						onSuccess: () => {
							toast.success(tCommon("success"));
							setAddMemberOpen(false);
						},
						onError: () => {
							toast.error(tCommon("error"));
						},
					},
				);
			},
			[id, addMemberMutation, tCommon],
		);

		const handleRoleChange = React.useCallback(
			(memberId: string, role: CommitteeMemberRole) => {
				if (!id) return;
				const data: UpdateCommitteeMemberRequest = { role };
				updateMemberMutation.mutate(
					{ committeeId: id, memberId, data },
					{
						onSuccess: () => {
							toast.success(tCommon("success"));
						},
						onError: () => {
							toast.error(tCommon("error"));
						},
					},
				);
			},
			[id, updateMemberMutation, tCommon],
		);

		const handleRemoveConfirm = React.useCallback(() => {
			if (!id || !selectedMember) return;
			removeMemberMutation.mutate(
				{
					committeeId: id,
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
					onError: () => {
						toast.error(tCommon("error"));
					},
				},
			);
		}, [id, selectedMember, removeMemberMutation, tCommon]);

		const { i18n } = useTranslation();
		const isAmharic = i18n.language === "am";

		const memberColumns = React.useMemo<ColumnDef<CommitteeMember>[]>(
			() => [
				{
					accessorKey: "employee.employeeId",
					header: t("member.employeeId"),
					cell: ({ row }) => <span className="font-mono text-sm">{row.original.employee?.employeeId ?? "-"}</span>,
				},
				{
					accessorKey: "employee.fullName",
					header: t("member.name"),
					cell: ({ row }) => {
						const emp = row.original.employee;
						if (!emp) return "-";
						const displayName = isAmharic && emp.fullNameAm ? emp.fullNameAm : emp.fullName;
						return <span className="font-medium">{displayName}</span>;
					},
				},
				{
					accessorKey: "employee.position",
					header: t("member.position"),
					cell: ({ row }) => {
						const pos = row.original.employee?.position;
						if (!pos) return "-";
						const displayName = isAmharic && pos.nameAm ? pos.nameAm : pos.name;
						return <span>{displayName}</span>;
					},
				},
				{
					accessorKey: "role",
					header: t("member.role"),
					cell: ({ row }) => {
						const role = row.getValue("role") as CommitteeMemberRole;
						return <Badge variant={ROLE_COLORS[role]}>{t(`role.${role.toLowerCase()}`)}</Badge>;
					},
				},
				{
					accessorKey: "appointedDate",
					header: t("member.appointedDate"),
					cell: ({ row }) => {
						const date = row.getValue("appointedDate") as string;
						return <span>{new Date(date).toLocaleDateString()}</span>;
					},
				},
				{
					id: "actions",
					header: tCommon("actions"),
					cell: ({ row }) => {
						const member = row.original;
						const isDisabled = committee?.status !== "ACTIVE";
						return (
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button variant="ghost" size="icon" className="h-8 w-8" disabled={isDisabled}>
										<MoreHorizontal className="h-4 w-4" />
										<span className="sr-only">{tCommon("actions")}</span>
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align="end">
									<DropdownMenuItem
										onClick={() => handleRoleChange(member.id, "CHAIRMAN")}
										disabled={member.role === "CHAIRMAN"}
									>
										<Pencil className="mr-2 h-4 w-4" />
										{t("action.makeChairman")}
									</DropdownMenuItem>
									<DropdownMenuItem
										onClick={() => handleRoleChange(member.id, "VICE_CHAIRMAN")}
										disabled={member.role === "VICE_CHAIRMAN"}
									>
										<Pencil className="mr-2 h-4 w-4" />
										{t("action.makeViceChairman")}
									</DropdownMenuItem>
									<DropdownMenuItem
										onClick={() => handleRoleChange(member.id, "SECRETARY")}
										disabled={member.role === "SECRETARY"}
									>
										<Pencil className="mr-2 h-4 w-4" />
										{t("action.makeSecretary")}
									</DropdownMenuItem>
									<DropdownMenuItem
										onClick={() => handleRoleChange(member.id, "MEMBER")}
										disabled={member.role === "MEMBER"}
									>
										<Pencil className="mr-2 h-4 w-4" />
										{t("action.makeMember")}
									</DropdownMenuItem>
									<DropdownMenuItem onClick={() => handleRemoveClick(member)} className="text-destructive">
										<Trash2 className="mr-2 h-4 w-4" />
										{t("action.removeMember")}
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						);
					},
				},
			],
			[t, tCommon, committee?.status, handleRoleChange, handleRemoveClick, isAmharic],
		);

		const historyColumns = React.useMemo<ColumnDef<CommitteeHistory>[]>(
			() => [
				{
					accessorKey: "performedAt",
					header: t("history.date"),
					cell: ({ row }) => {
						const date = row.getValue("performedAt") as string;
						return <span>{new Date(date).toLocaleString()}</span>;
					},
				},
				{
					accessorKey: "action",
					header: t("history.action"),
					cell: ({ row }) => <Badge variant="outline">{row.getValue("action")}</Badge>,
				},
				{
					accessorKey: "notes",
					header: t("history.notes"),
					cell: ({ row }) => <span className="text-sm">{row.getValue("notes") ?? "-"}</span>,
				},
			],
			[t],
		);

		if (committeeLoading) {
			return <div className="flex items-center justify-center p-8">{tCommon("loading")}</div>;
		}

		if (!committee) {
			return <div className="flex items-center justify-center p-8">{t("committee.notFound")}</div>;
		}

		const displayName = isAmharic && committee.nameAm ? committee.nameAm : committee.name;
		const typeName =
			isAmharic && committee.committeeType?.nameAm ? committee.committeeType.nameAm : committee.committeeType?.name;
		const centerName = committee.center
			? isAmharic && committee.center.nameAm
				? committee.center.nameAm
				: committee.center.name
			: t("committee.hqLevel");

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
						<TabsTrigger value="history">{t("history.title")}</TabsTrigger>
					</TabsList>

					<TabsContent value="members" className="mt-4">
						<Card>
							<CardHeader>
								<div className="flex items-center justify-between">
									<div>
										<CardTitle>{t("member.title")}</CardTitle>
										<CardDescription>{t("member.description")}</CardDescription>
									</div>
									{committee.status === "ACTIVE" && (
										<Button onClick={handleAddMember}>
											<Plus className="mr-2 h-4 w-4" />
											{t("member.add")}
										</Button>
									)}
								</div>
							</CardHeader>
							<CardContent>
								<DataTable
									columns={memberColumns}
									data={members ?? []}
									isLoading={membersLoading}
									searchColumn="employee.fullName"
								/>
							</CardContent>
						</Card>
					</TabsContent>

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
	},
	() => true,
);

CommitteeDetailPage.displayName = "CommitteeDetailPage";
