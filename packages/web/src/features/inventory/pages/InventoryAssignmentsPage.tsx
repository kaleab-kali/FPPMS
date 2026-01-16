import { createColumnHelper, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { format } from "date-fns";
import { Eye, Package, Search } from "lucide-react";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { useInventoryAssignments } from "#web/api/inventory/inventory.queries";
import { Pagination } from "#web/components/common/Pagination";
import { Badge } from "#web/components/ui/badge";
import { Button } from "#web/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "#web/components/ui/card";
import { Input } from "#web/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "#web/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "#web/components/ui/table";
import type { InventoryAssignment, InventoryAssignmentFilter } from "#web/types/inventory";

const columnHelper = createColumnHelper<InventoryAssignment>();

const getStatusBadge = (assignment: InventoryAssignment, t: (key: string) => string): React.ReactElement => {
	if (assignment.isLost) {
		return <Badge variant="destructive">{t("inventory:status.LOST")}</Badge>;
	}
	if (assignment.isDamaged) {
		return <Badge variant="destructive">{t("inventory:status.DAMAGED")}</Badge>;
	}
	if (assignment.isReturned) {
		return <Badge variant="secondary">{t("inventory:status.RETURNED")}</Badge>;
	}
	const today = new Date();
	const expectedReturn = assignment.expectedReturnDate ? new Date(assignment.expectedReturnDate) : null;
	if (expectedReturn && expectedReturn < today) {
		return <Badge variant="destructive">{t("inventory:status.OVERDUE")}</Badge>;
	}
	return <Badge variant="default">{t("inventory:status.ACTIVE")}</Badge>;
};

const InventoryAssignmentsPageComponent = (): React.ReactElement => {
	const { t } = useTranslation(["inventory", "common"]);
	const { i18n } = useTranslation();
	const isAmharic = i18n.language === "am";

	const [filter, setFilter] = React.useState<InventoryAssignmentFilter>({
		page: 1,
		limit: 10,
		isReturned: false,
	});
	const [searchTerm, setSearchTerm] = React.useState("");

	const { data, isLoading } = useInventoryAssignments(filter);

	const handleSearch = React.useCallback(() => {
		setFilter((prev) => ({ ...prev, search: searchTerm, page: 1 }));
	}, [searchTerm]);

	const handleFilterChange = React.useCallback((key: keyof InventoryAssignmentFilter, value: string | undefined) => {
		const newFilter: Partial<InventoryAssignmentFilter> = { page: 1 };
		if (key === "isReturned") {
			newFilter.isReturned = value === "returned" ? true : value === "active" ? false : undefined;
		} else if (key === "isPermanent") {
			newFilter.isPermanent = value === "permanent" ? true : value === "temporary" ? false : undefined;
		}
		setFilter((prev) => ({ ...prev, ...newFilter }));
	}, []);

	const handlePageChange = React.useCallback((page: number) => {
		setFilter((prev) => ({ ...prev, page }));
	}, []);

	const columns = React.useMemo(
		() => [
			columnHelper.accessor("employeeName", {
				header: () => t("inventory:assignedDate"),
				cell: (info) => (
					<div className="flex items-center gap-2">
						<div>
							<div className="font-medium">{info.getValue() ?? "-"}</div>
							<div className="text-xs text-muted-foreground font-mono">{info.row.original.employeeCode}</div>
						</div>
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
			columnHelper.accessor("isPermanent", {
				header: () => t("inventory:type"),
				cell: (info) => (
					<Badge variant={info.getValue() ? "default" : "outline"}>
						{info.getValue() ? t("inventory:permanent") : t("inventory:temporary")}
					</Badge>
				),
			}),
			columnHelper.accessor("conditionAtAssignment", {
				header: () => t("inventory:condition"),
				cell: (info) => <Badge variant="outline">{t(`inventory:status.${info.getValue()}`)}</Badge>,
			}),
			columnHelper.display({
				id: "status",
				header: () => t("common:status"),
				cell: (info) => getStatusBadge(info.row.original, t),
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
					<Package className="h-8 w-8 text-primary" />
					<div>
						<h1 className="text-2xl font-bold">{t("inventory:inventory.assignments")}</h1>
						<p className="text-muted-foreground">{t("inventory:itemsCurrentlyAssigned")}</p>
					</div>
				</div>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>{t("common:filters")}</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
						<div className="flex gap-2 md:col-span-2">
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

						<Select
							value={filter.isReturned === undefined ? "all" : filter.isReturned ? "returned" : "active"}
							onValueChange={(value) => handleFilterChange("isReturned", value)}
						>
							<SelectTrigger>
								<SelectValue placeholder={t("common:status")} />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">{t("common:all")}</SelectItem>
								<SelectItem value="active">{t("inventory:status.ACTIVE")}</SelectItem>
								<SelectItem value="returned">{t("inventory:status.RETURNED")}</SelectItem>
							</SelectContent>
						</Select>

						<Select
							value={filter.isPermanent === undefined ? "all" : filter.isPermanent ? "permanent" : "temporary"}
							onValueChange={(value) => handleFilterChange("isPermanent", value)}
						>
							<SelectTrigger>
								<SelectValue placeholder={t("inventory:type")} />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">{t("common:all")}</SelectItem>
								<SelectItem value="permanent">{t("inventory:permanent")}</SelectItem>
								<SelectItem value="temporary">{t("inventory:temporary")}</SelectItem>
							</SelectContent>
						</Select>
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
									{t("inventory:noActiveAssignments")}
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

InventoryAssignmentsPageComponent.displayName = "InventoryAssignmentsPage";

export const InventoryAssignmentsPage = React.memo(InventoryAssignmentsPageComponent);
