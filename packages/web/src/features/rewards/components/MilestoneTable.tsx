import { type ColumnDef, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { Check, Pencil, Trash2, X } from "lucide-react";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { Badge } from "#web/components/ui/badge";
import { Button } from "#web/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "#web/components/ui/table";
import type { RewardMilestone } from "#web/types/rewards";

interface MilestoneTableProps {
	data: RewardMilestone[];
	onEdit?: (milestone: RewardMilestone) => void;
	onDelete?: (milestone: RewardMilestone) => void;
	isLoading?: boolean;
}

const MilestoneTableComponent = ({ data, onEdit, onDelete, isLoading }: MilestoneTableProps): React.ReactElement => {
	const { t } = useTranslation("rewards");

	const columns = React.useMemo(
		(): ColumnDef<RewardMilestone>[] => [
			{
				accessorKey: "yearsOfService",
				header: () => t("milestones.yearsOfService"),
				cell: ({ row }) => <span className="font-medium">{row.getValue("yearsOfService")} years</span>,
			},
			{
				accessorKey: "name",
				header: () => t("milestones.name"),
				cell: ({ row }) => <div className="max-w-[300px]">{row.getValue("name")}</div>,
			},
			{
				accessorKey: "rewardType",
				header: () => t("milestones.rewardType"),
				cell: ({ row }) => {
					const type = row.getValue("rewardType") as string;
					return <Badge variant="outline">{t(`rewardType.${type}`)}</Badge>;
				},
			},
			{
				accessorKey: "monetaryValue",
				header: () => t("milestones.monetaryValue"),
				cell: ({ row }) => {
					const value = row.getValue("monetaryValue") as number | undefined;
					return value ? `${value.toLocaleString()} ETB` : "-";
				},
			},
			{
				accessorKey: "isActive",
				header: () => t("milestones.isActive"),
				cell: ({ row }) => {
					const isActive = row.getValue("isActive") as boolean;
					return isActive ? (
						<Check className="h-5 w-5 text-green-600" />
					) : (
						<X className="h-5 w-5 text-muted-foreground" />
					);
				},
			},
			{
				id: "actions",
				header: () => "Actions",
				cell: ({ row }) => (
					<div className="flex gap-2">
						{onEdit && (
							<Button
								variant="ghost"
								size="icon"
								onClick={() => onEdit(row.original)}
								aria-label={`Edit ${row.original.name}`}
							>
								<Pencil className="h-4 w-4" aria-hidden="true" />
							</Button>
						)}
						{onDelete && (
							<Button
								variant="ghost"
								size="icon"
								onClick={() => onDelete(row.original)}
								aria-label={`Delete ${row.original.name}`}
								className="text-destructive hover:text-destructive"
							>
								<Trash2 className="h-4 w-4" aria-hidden="true" />
							</Button>
						)}
					</div>
				),
			},
		],
		[t, onEdit, onDelete],
	);

	const table = useReactTable({
		data,
		columns,
		getCoreRowModel: getCoreRowModel(),
	});

	if (isLoading) {
		return (
			<div className="flex items-center justify-center py-10">
				<div className="text-muted-foreground">Loading...</div>
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
								No milestones found
							</TableCell>
						</TableRow>
					)}
				</TableBody>
			</Table>
		</div>
	);
};

MilestoneTableComponent.displayName = "MilestoneTable";

export const MilestoneTable = React.memo(
	MilestoneTableComponent,
	(prevProps, nextProps) =>
		prevProps.data === nextProps.data &&
		prevProps.isLoading === nextProps.isLoading &&
		prevProps.onEdit === nextProps.onEdit &&
		prevProps.onDelete === nextProps.onDelete,
);
