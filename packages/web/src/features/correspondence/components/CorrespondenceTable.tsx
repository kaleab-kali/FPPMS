import { type ColumnDef, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { format } from "date-fns";
import { AlertCircle, Calendar, Eye, FileText, Pencil, User } from "lucide-react";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { Badge } from "#web/components/ui/badge";
import { Button } from "#web/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "#web/components/ui/table";
import type { CorrespondenceDocument } from "#web/types/correspondence";

type ViewType = "all" | "incoming" | "outgoing";

interface CorrespondenceTableProps {
	data: CorrespondenceDocument[];
	onView?: (doc: CorrespondenceDocument) => void;
	onEdit?: (doc: CorrespondenceDocument) => void;
	isLoading?: boolean;
	viewType?: ViewType;
}

const getPriorityVariant = (priority: string): "default" | "secondary" | "destructive" | "outline" => {
	switch (priority.toUpperCase()) {
		case "URGENT":
			return "destructive";
		case "HIGH":
			return "destructive";
		case "NORMAL":
			return "secondary";
		default:
			return "outline";
	}
};

const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
	switch (status.toUpperCase()) {
		case "COMPLETED":
			return "default";
		case "IN_PROGRESS":
			return "secondary";
		case "PENDING":
			return "outline";
		case "ARCHIVED":
			return "outline";
		default:
			return "secondary";
	}
};

const CorrespondenceTableComponent = ({
	data,
	onView,
	onEdit,
	isLoading,
	viewType = "all",
}: CorrespondenceTableProps): React.ReactElement => {
	const { t } = useTranslation(["correspondence", "common"]);

	const columns = React.useMemo((): ColumnDef<CorrespondenceDocument>[] => {
		const cols: ColumnDef<CorrespondenceDocument>[] = [
			{
				accessorKey: "referenceNumber",
				header: () => t("correspondence:table.referenceNumber"),
				cell: ({ row }) => (
					<div className="flex items-center gap-2">
						<FileText className="h-4 w-4 text-muted-foreground" />
						<span className="font-mono text-sm">{row.getValue("referenceNumber")}</span>
					</div>
				),
			},
			{
				accessorKey: "subject",
				header: () => t("correspondence:table.subject"),
				cell: ({ row }) => {
					const subject = row.getValue("subject") as string;
					return (
						<div className="max-w-[200px] truncate" title={subject}>
							{subject}
						</div>
					);
				},
			},
		];

		if (viewType === "all") {
			cols.push({
				accessorKey: "direction",
				header: () => t("correspondence:table.direction"),
				cell: ({ row }) => {
					const direction = row.getValue("direction") as string;
					return (
						<Badge variant={direction === "INCOMING" ? "default" : "secondary"}>
							{t(`correspondence:direction.${direction.toLowerCase()}`)}
						</Badge>
					);
				},
			});
		}

		if (viewType === "incoming") {
			cols.push(
				{
					id: "sender",
					header: () => t("correspondence:table.sender"),
					cell: ({ row }) => (
						<div className="flex items-center gap-2">
							<User className="h-4 w-4 text-muted-foreground" />
							<span>{row.original.sourceOrganization ?? "-"}</span>
						</div>
					),
				},
				{
					accessorKey: "responseDeadline",
					header: () => t("correspondence:table.responseDeadline"),
					cell: ({ row }) => {
						const value = row.getValue("responseDeadline") as string | undefined;
						const doc = row.original;
						if (!value) return "-";
						return (
							<div className="flex items-center gap-1">
								<Calendar className="h-4 w-4 text-muted-foreground" />
								<span className={doc.isResponseOverdue ? "text-destructive font-medium" : ""}>
									{format(new Date(value), "MMM dd, yyyy")}
								</span>
							</div>
						);
					},
				},
			);
		}

		if (viewType === "outgoing") {
			cols.push(
				{
					id: "recipient",
					header: () => t("correspondence:table.recipient"),
					cell: ({ row }) => (
						<div className="flex items-center gap-2">
							<User className="h-4 w-4 text-muted-foreground" />
							<span>{row.original.destinationOrganization ?? "-"}</span>
						</div>
					),
				},
				{
					accessorKey: "sentDate",
					header: () => t("correspondence:table.sentDate"),
					cell: ({ row }) => {
						const value = row.getValue("sentDate") as string | undefined;
						if (!value) return <span className="text-muted-foreground">Not sent</span>;
						return format(new Date(value), "MMM dd, yyyy");
					},
				},
			);
		}

		cols.push(
			{
				accessorKey: "documentDate",
				header: () => t("correspondence:table.documentDate"),
				cell: ({ row }) => format(new Date(row.getValue("documentDate") as string), "MMM dd, yyyy"),
			},
			{
				accessorKey: "documentTypeName",
				header: () => t("correspondence:table.documentType"),
				cell: ({ row }) => <Badge variant="outline">{row.getValue("documentTypeName") ?? "-"}</Badge>,
			},
			{
				accessorKey: "priority",
				header: () => t("correspondence:table.priority"),
				cell: ({ row }) => {
					const priority = row.getValue("priority") as string;
					return (
						<Badge variant={getPriorityVariant(priority)}>
							{t(`correspondence:priority.${priority.toLowerCase()}`)}
						</Badge>
					);
				},
			},
			{
				accessorKey: "status",
				header: () => t("correspondence:table.status"),
				cell: ({ row }) => {
					const status = row.getValue("status") as string;
					return <Badge variant={getStatusVariant(status)}>{t(`correspondence:status.${status.toLowerCase()}`)}</Badge>;
				},
			},
		);

		if (viewType === "all" || viewType === "incoming") {
			cols.push({
				id: "overdue",
				header: () => t("correspondence:table.overdue"),
				cell: ({ row }) => {
					const doc = row.original;
					const hasOverdue = doc.isOverdue || doc.isResponseOverdue;
					return hasOverdue ? (
						<AlertCircle className="h-5 w-5 text-destructive" aria-label={t("correspondence:alerts.overdue")} />
					) : null;
				},
			});
		}

		cols.push({
			id: "actions",
			header: () => t("common:actions"),
			cell: ({ row }) => (
				<div className="flex gap-2">
					{onView && (
						<Button variant="ghost" size="icon" onClick={() => onView(row.original)} title={t("common:view")}>
							<Eye className="h-4 w-4" />
						</Button>
					)}
					{onEdit && (
						<Button variant="ghost" size="icon" onClick={() => onEdit(row.original)} title={t("common:edit")}>
							<Pencil className="h-4 w-4" />
						</Button>
					)}
				</div>
			),
		});

		return cols;
	}, [t, onView, onEdit, viewType]);

	const table = useReactTable({
		data,
		columns,
		getCoreRowModel: getCoreRowModel(),
	});

	if (isLoading) {
		return (
			<div className="flex items-center justify-center py-10">
				<div className="text-muted-foreground">{t("common:loading")}</div>
			</div>
		);
	}

	return (
		<div className="rounded-md border">
			<Table>
				<TableHeader>
					{table.getHeaderGroups().map((headerGroup) => (
						<TableRow key={headerGroup.id}>
							{headerGroup.headers.map((header) => (
								<TableHead key={header.id}>
									{header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
								</TableHead>
							))}
						</TableRow>
					))}
				</TableHeader>
				<TableBody>
					{table.getRowModel().rows.length > 0 ? (
						table.getRowModel().rows.map((row) => (
							<TableRow key={row.id}>
								{row.getVisibleCells().map((cell) => (
									<TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
								))}
							</TableRow>
						))
					) : (
						<TableRow>
							<TableCell colSpan={columns.length} className="h-24 text-center">
								{t("common:noResults")}
							</TableCell>
						</TableRow>
					)}
				</TableBody>
			</Table>
		</div>
	);
};

CorrespondenceTableComponent.displayName = "CorrespondenceTable";

export const CorrespondenceTable = React.memo(
	CorrespondenceTableComponent,
	(prevProps, nextProps) =>
		prevProps.data === nextProps.data &&
		prevProps.isLoading === nextProps.isLoading &&
		prevProps.viewType === nextProps.viewType &&
		prevProps.onView === nextProps.onView &&
		prevProps.onEdit === nextProps.onEdit,
);
