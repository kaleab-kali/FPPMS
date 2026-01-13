import type { ColumnDef } from "@tanstack/react-table";
import { Eye } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";
import { DataTable } from "#web/components/common/DataTable.tsx";
import { Badge } from "#web/components/ui/badge.tsx";
import { Button } from "#web/components/ui/button.tsx";
import type { AuditLog } from "#web/types/audit-log.ts";

interface AuditLogTableProps {
	data: AuditLog[];
	isLoading?: boolean;
	onView: (auditLog: AuditLog) => void;
}

const getActionVariant = (action: string): "default" | "secondary" | "destructive" | "outline" => {
	const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
		CREATE: "default",
		UPDATE: "secondary",
		DELETE: "destructive",
		VIEW: "outline",
		LOGIN: "default",
		LOGOUT: "secondary",
		APPROVE: "default",
		REJECT: "destructive",
		EXPORT: "secondary",
		IMPORT: "secondary",
	} as const;
	return variants[action] ?? "secondary";
};

const formatDateTime = (date: Date | string): string => {
	const d = typeof date === "string" ? new Date(date) : date;
	return new Intl.DateTimeFormat("en-US", {
		year: "numeric",
		month: "short",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	}).format(d);
};

const TableRow = React.memo(
	({ auditLog, onView }: { auditLog: AuditLog; onView: (log: AuditLog) => void }) => {
		const handleViewClick = React.useCallback(() => {
			onView(auditLog);
		}, [auditLog, onView]);

		return (
			<Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleViewClick}>
				<Eye className="h-4 w-4" />
			</Button>
		);
	},
	(prev, next) => prev.auditLog.id === next.auditLog.id,
);
TableRow.displayName = "TableRow";

const AuditLogTableInner = ({ data, isLoading = false, onView }: AuditLogTableProps) => {
	const { t } = useTranslation("auditLog");
	const { t: tCommon } = useTranslation("common");

	const columns = React.useMemo<ColumnDef<AuditLog>[]>(
		() => [
			{
				accessorKey: "timestamp",
				header: t("timestamp"),
				cell: ({ row }) => (
					<span className="whitespace-nowrap text-sm">{formatDateTime(row.getValue("timestamp"))}</span>
				),
			},
			{
				accessorKey: "username",
				header: t("user"),
				cell: ({ row }) => {
					const username = row.getValue("username") as string | null;
					return <span className="font-medium">{username ?? "-"}</span>;
				},
			},
			{
				accessorKey: "action",
				header: t("action"),
				cell: ({ row }) => {
					const action = row.getValue("action") as string;
					return <Badge variant={getActionVariant(action)}>{t(`actions.${action}`)}</Badge>;
				},
			},
			{
				accessorKey: "module",
				header: t("module"),
				cell: ({ row }) => <span className="capitalize">{row.getValue("module")}</span>,
			},
			{
				accessorKey: "resource",
				header: t("resource"),
				cell: ({ row }) => <span className="capitalize">{row.getValue("resource")}</span>,
			},
			{
				accessorKey: "ipAddress",
				header: t("ipAddress"),
				cell: ({ row }) => <span className="font-mono text-sm">{row.getValue("ipAddress")}</span>,
			},
			{
				accessorKey: "description",
				header: t("description"),
				cell: ({ row }) => {
					const description = row.getValue("description") as string | null;
					return <span className="max-w-xs truncate text-sm text-muted-foreground">{description ?? "-"}</span>;
				},
			},
			{
				id: "actions",
				header: tCommon("actions"),
				cell: ({ row }) => {
					const auditLog = row.original;
					return <TableRow auditLog={auditLog} onView={onView} />;
				},
			},
		],
		[t, tCommon, onView],
	);

	return <DataTable columns={columns} data={data} isLoading={isLoading} searchColumn="username" />;
};

export const AuditLogTable = React.memo(
	AuditLogTableInner,
	(prev, next) => prev.data === next.data && prev.isLoading === next.isLoading && prev.onView === next.onView,
);
AuditLogTable.displayName = "AuditLogTable";
