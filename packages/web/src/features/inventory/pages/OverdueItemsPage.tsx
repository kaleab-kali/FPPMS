import { createColumnHelper, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { differenceInDays, format } from "date-fns";
import { AlertTriangle, Clock, Eye } from "lucide-react";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { useOverdueInventoryAssignments } from "#web/api/inventory/inventory.queries";
import { Pagination } from "#web/components/common/Pagination";
import { Badge } from "#web/components/ui/badge";
import { Button } from "#web/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "#web/components/ui/table";
import type { InventoryAssignment, InventoryAssignmentFilter } from "#web/types/inventory";

const columnHelper = createColumnHelper<InventoryAssignment>();

const OverdueItemsPageComponent = (): React.ReactElement => {
	const { t } = useTranslation(["inventory", "common"]);
	const { i18n } = useTranslation();
	const isAmharic = i18n.language === "am";

	const [filter, setFilter] = React.useState<InventoryAssignmentFilter>({
		page: 1,
		limit: 10,
	});

	const { data, isLoading } = useOverdueInventoryAssignments(filter);

	const handlePageChange = React.useCallback((page: number) => {
		setFilter((prev) => ({ ...prev, page }));
	}, []);

	const columns = React.useMemo(
		() => [
			columnHelper.accessor("employeeName", {
				header: () => t("common:employee"),
				cell: (info) => (
					<div>
						<div className="font-medium">{info.getValue() ?? "-"}</div>
						<div className="text-xs text-muted-foreground font-mono">{info.row.original.employeeCode}</div>
					</div>
				),
			}),
			columnHelper.accessor("itemTypeName", {
				header: () => t("inventory:itemType"),
				cell: (info) => (
					<div>
						<div>
							{isAmharic && info.row.original.itemTypeNameAm ? info.row.original.itemTypeNameAm : info.getValue()}
						</div>
						<div className="text-xs text-muted-foreground">{info.row.original.categoryName}</div>
					</div>
				),
			}),
			columnHelper.accessor("quantity", {
				header: () => t("inventory:quantity"),
				cell: (info) => info.getValue(),
			}),
			columnHelper.accessor("serialNumber", {
				header: () => t("inventory:serialNumber"),
				cell: (info) => <span className="font-mono text-sm">{info.getValue() ?? "-"}</span>,
			}),
			columnHelper.accessor("assignedDate", {
				header: () => t("inventory:assignedDate"),
				cell: (info) => format(new Date(info.getValue()), "MMM dd, yyyy"),
			}),
			columnHelper.accessor("expectedReturnDate", {
				header: () => t("inventory:expectedReturnDate"),
				cell: (info) => {
					const value = info.getValue();
					if (!value) return "-";
					return <span className="text-destructive font-medium">{format(new Date(value), "MMM dd, yyyy")}</span>;
				},
			}),
			columnHelper.display({
				id: "daysOverdue",
				header: () => t("inventory:overdue"),
				cell: (info) => {
					const expected = info.row.original.expectedReturnDate;
					if (!expected) return "-";
					const days = differenceInDays(new Date(), new Date(expected));
					return (
						<Badge variant="destructive" className="gap-1">
							<Clock className="h-3 w-3" />
							{days} {t("common:days")}
						</Badge>
					);
				},
			}),
			columnHelper.display({
				id: "actions",
				header: () => t("common:actions"),
				cell: () => (
					<Button variant="ghost" size="icon" title={t("common:view")}>
						<Eye className="h-4 w-4" />
					</Button>
				),
			}),
		],
		[t, isAmharic],
	);

	const table = useReactTable({
		data: data?.data ?? [],
		columns,
		getCoreRowModel: getCoreRowModel(),
	});

	return (
		<div className="container mx-auto py-6 space-y-6">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-3">
					<AlertTriangle className="h-8 w-8 text-destructive" />
					<div>
						<h1 className="text-2xl font-bold">{t("inventory:overdue")}</h1>
						<p className="text-muted-foreground">{t("inventory:message.lowStockWarning")}</p>
					</div>
				</div>
			</div>

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
						{isLoading ? (
							<TableRow>
								<TableCell colSpan={columns.length} className="h-24 text-center">
									{t("common:loading")}
								</TableCell>
							</TableRow>
						) : table.getRowModel().rows.length > 0 ? (
							table.getRowModel().rows.map((row) => (
								<TableRow key={row.id}>
									{row.getVisibleCells().map((cell) => (
										<TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
									))}
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell colSpan={columns.length} className="h-24 text-center text-green-600">
									{t("common:noResults")}
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>

			{data?.meta && (
				<Pagination currentPage={data.meta.page} totalPages={data.meta.totalPages} onPageChange={handlePageChange} />
			)}
		</div>
	);
};

OverdueItemsPageComponent.displayName = "OverdueItemsPage";

export const OverdueItemsPage = React.memo(OverdueItemsPageComponent);
