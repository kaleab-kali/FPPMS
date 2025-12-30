import type { ColumnDef } from "@tanstack/react-table";
import type { TFunction } from "i18next";
import { ExternalLink, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import React from "react";
import { Badge } from "#web/components/ui/badge.tsx";
import { Button } from "#web/components/ui/button.tsx";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "#web/components/ui/dropdown-menu.tsx";
import type { CommitteeHistory, CommitteeMember, CommitteeMemberRole, CommitteeStatus } from "#web/types/committee.ts";
import type { ComplaintListItem, ComplaintStatus as ComplaintStatusType } from "#web/types/complaint.ts";
import { COMPLAINT_STATUS_COLORS, COMPLAINT_STATUS_LABELS } from "#web/types/complaint.ts";

const ROLE_COLORS: Record<CommitteeMemberRole, "default" | "secondary" | "outline"> = {
	CHAIRMAN: "default",
	VICE_CHAIRMAN: "default",
	SECRETARY: "secondary",
	MEMBER: "outline",
	ADVISOR: "outline",
} as const;

interface UseMemberColumnsParams {
	t: TFunction;
	tCommon: TFunction;
	isAmharic: boolean;
	committeeStatus: CommitteeStatus | undefined;
	onRoleChange: (memberId: string, role: CommitteeMemberRole) => void;
	onRemoveClick: (member: CommitteeMember) => void;
}

export const useMemberColumns = ({
	t,
	tCommon,
	isAmharic,
	committeeStatus,
	onRoleChange,
	onRemoveClick,
}: UseMemberColumnsParams): ColumnDef<CommitteeMember>[] =>
	React.useMemo(
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
					const isDisabled = committeeStatus !== "ACTIVE";
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
									onClick={() => onRoleChange(member.id, "CHAIRMAN")}
									disabled={member.role === "CHAIRMAN"}
								>
									<Pencil className="mr-2 h-4 w-4" />
									{t("action.makeChairman")}
								</DropdownMenuItem>
								<DropdownMenuItem
									onClick={() => onRoleChange(member.id, "VICE_CHAIRMAN")}
									disabled={member.role === "VICE_CHAIRMAN"}
								>
									<Pencil className="mr-2 h-4 w-4" />
									{t("action.makeViceChairman")}
								</DropdownMenuItem>
								<DropdownMenuItem
									onClick={() => onRoleChange(member.id, "SECRETARY")}
									disabled={member.role === "SECRETARY"}
								>
									<Pencil className="mr-2 h-4 w-4" />
									{t("action.makeSecretary")}
								</DropdownMenuItem>
								<DropdownMenuItem onClick={() => onRoleChange(member.id, "MEMBER")} disabled={member.role === "MEMBER"}>
									<Pencil className="mr-2 h-4 w-4" />
									{t("action.makeMember")}
								</DropdownMenuItem>
								<DropdownMenuItem onClick={() => onRemoveClick(member)} className="text-destructive">
									<Trash2 className="mr-2 h-4 w-4" />
									{t("action.removeMember")}
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					);
				},
			},
		],
		[t, tCommon, committeeStatus, onRoleChange, onRemoveClick, isAmharic],
	);

interface UseHistoryColumnsParams {
	t: TFunction;
}

export const useHistoryColumns = ({ t }: UseHistoryColumnsParams): ColumnDef<CommitteeHistory>[] =>
	React.useMemo(
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

interface UseComplaintColumnsParams {
	t: TFunction;
	isAmharic: boolean;
	onViewComplaint: (complaintId: string) => void;
}

export const useComplaintColumns = ({
	t,
	isAmharic,
	onViewComplaint,
}: UseComplaintColumnsParams): ColumnDef<ComplaintListItem>[] =>
	React.useMemo(
		() => [
			{
				accessorKey: "complaintNumber",
				header: t("complaints.complaintNumber"),
				cell: ({ row }) => <span className="font-mono text-sm font-medium">{row.getValue("complaintNumber")}</span>,
			},
			{
				accessorKey: "article",
				header: t("complaints.article"),
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
				header: t("complaints.accused"),
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
				header: t("complaints.status"),
				cell: ({ row }) => {
					const status = row.getValue("status") as ComplaintStatusType;
					return <Badge className={COMPLAINT_STATUS_COLORS[status]}>{COMPLAINT_STATUS_LABELS[status]}</Badge>;
				},
			},
			{
				accessorKey: "registeredDate",
				header: t("complaints.registeredDate"),
				cell: ({ row }) => {
					const date = row.getValue("registeredDate") as string;
					return <span>{new Date(date).toLocaleDateString()}</span>;
				},
			},
			{
				id: "actions",
				header: "",
				cell: ({ row }) => (
					<Button variant="ghost" size="sm" onClick={() => onViewComplaint(row.original.id)}>
						<ExternalLink className="mr-1 h-3 w-3" />
						{t("complaints.viewDetails")}
					</Button>
				),
			},
		],
		[t, isAmharic, onViewComplaint],
	);
