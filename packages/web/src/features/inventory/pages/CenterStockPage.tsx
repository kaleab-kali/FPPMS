import { createColumnHelper, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { AlertTriangle, Building2, Search } from "lucide-react";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { useCenterStock } from "#web/api/inventory/inventory.queries";
import { Pagination } from "#web/components/common/Pagination";
import { Badge } from "#web/components/ui/badge";
import { Button } from "#web/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "#web/components/ui/card";
import { Input } from "#web/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "#web/components/ui/table";
import type { CenterInventory, CenterInventoryFilter } from "#web/types/inventory";

const columnHelper = createColumnHelper<CenterInventory>();

const CenterStockPageComponent = (): React.ReactElement => {
	const { t } = useTranslation(["inventory", "common"]);
	const { i18n } = useTranslation();
	const isAmharic = i18n.language === "am";

	const [filter, setFilter] = React.useState<CenterInventoryFilter>({
		page: 1,
		limit: 10,
	});
	const [searchTerm, setSearchTerm] = React.useState("");

	const { data, isLoading } = useCenterStock(filter);

	const handleSearch = React.useCallback(() => {
		setFilter((prev) => ({ ...prev, search: searchTerm, page: 1 }));
	}, [searchTerm]);

	const handlePageChange = React.useCallback((page: number) => {
		setFilter((prev) => ({ ...prev, page }));
	}, []);

	const columns = React.useMemo(
		() => [
			columnHelper.accessor("centerName", {
				header: () => t("inventory:centerStock"),
				cell: (info) => (
					<div className="flex items-center gap-2">
						<Building2 className="h-4 w-4 text-muted-foreground" />
						<span className="font-medium">{info.getValue() ?? "-"}</span>
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
			columnHelper.accessor("totalQuantity", {
				header: () => t("inventory:totalQuantity"),
				cell: (info) => <span className="font-medium">{info.getValue()}</span>,
			}),
			columnHelper.accessor("assignedQuantity", {
				header: () => t("inventory:assignedQuantity"),
				cell: (info) => info.getValue(),
			}),
			columnHelper.accessor("availableQuantity", {
				header: () => t("inventory:availableQuantity"),
				cell: (info) => (
					<span className={info.getValue() === 0 ? "text-destructive font-medium" : ""}>{info.getValue()}</span>
				),
			}),
			columnHelper.accessor("minStockLevel", {
				header: () => t("inventory:minStockLevel"),
				cell: (info) => info.getValue() ?? "-",
			}),
			columnHelper.accessor("isBelowMinStock", {
				header: () => t("common:status"),
				cell: (info) => {
					const isBelowMin = info.getValue();
					return isBelowMin ? (
						<Badge variant="destructive" className="gap-1">
							<AlertTriangle className="h-3 w-3" />
							{t("inventory:lowStock")}
						</Badge>
					) : (
						<Badge variant="default">{t("common:ok")}</Badge>
					);
				},
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
					<Building2 className="h-8 w-8 text-primary" />
					<div>
						<h1 className="text-2xl font-bold">{t("inventory:centerStock")}</h1>
						<p className="text-muted-foreground">{t("inventory:inventory.stock")}</p>
					</div>
				</div>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>{t("common:filters")}</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="flex gap-2 max-w-md">
						<Input
							placeholder={t("common:search")}
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							onKeyDown={(e) => e.key === "Enter" && handleSearch()}
						/>
						<Button variant="outline" onClick={handleSearch}>
							<Search className="h-4 w-4" />
						</Button>
					</div>
				</CardContent>
			</Card>

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
								<TableCell colSpan={columns.length} className="h-24 text-center">
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

CenterStockPageComponent.displayName = "CenterStockPage";

export const CenterStockPage = React.memo(CenterStockPageComponent);
