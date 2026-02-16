import {
	type ColumnDef,
	type ColumnFiltersState,
	flexRender,
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	type SortingState,
	useReactTable,
} from "@tanstack/react-table";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Search } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";
import { Button } from "#web/components/ui/button.tsx";
import { Input } from "#web/components/ui/input.tsx";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "#web/components/ui/select.tsx";
import { Skeleton } from "#web/components/ui/skeleton.tsx";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "#web/components/ui/table.tsx";
import { PAGINATION_CONFIG } from "#web/config/constants.ts";

interface DataTableProps<TData, TValue> {
	columns: ColumnDef<TData, TValue>[];
	data: TData[];
	isLoading?: boolean;
	searchPlaceholder?: string;
	searchColumn?: string;
}

const DataTableInner = <TData, TValue>({
	columns,
	data,
	isLoading = false,
	searchPlaceholder,
	searchColumn,
}: DataTableProps<TData, TValue>) => {
	const { t } = useTranslation("common");
	const [sorting, setSorting] = React.useState<SortingState>([]);
	const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
	const [globalFilter, setGlobalFilter] = React.useState("");

	const table = useReactTable({
		data,
		columns,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		onSortingChange: setSorting,
		onColumnFiltersChange: setColumnFilters,
		onGlobalFilterChange: setGlobalFilter,
		state: {
			sorting,
			columnFilters,
			globalFilter,
		},
		initialState: {
			pagination: {
				pageSize: PAGINATION_CONFIG.defaultPageSize,
			},
		},
	});

	const handleSearchChange = React.useCallback(
		(event: React.ChangeEvent<HTMLInputElement>) => {
			const value = event.target.value;
			if (searchColumn) {
				table.getColumn(searchColumn)?.setFilterValue(value);
			} else {
				setGlobalFilter(value);
			}
		},
		[searchColumn, table],
	);

	const handlePageSizeChange = React.useCallback(
		(value: string) => {
			table.setPageSize(Number(value));
		},
		[table],
	);

	const goToFirstPage = React.useCallback(() => table.setPageIndex(0), [table]);
	const goToPreviousPage = React.useCallback(() => table.previousPage(), [table]);
	const goToNextPage = React.useCallback(() => table.nextPage(), [table]);
	const goToLastPage = React.useCallback(() => table.setPageIndex(table.getPageCount() - 1), [table]);

	if (isLoading) {
		return (
			<div className="space-y-4">
				<Skeleton className="h-10 w-full max-w-sm" />
				<div className="rounded-md border">
					<div className="space-y-2 p-4">
						{[1, 2, 3, 4, 5].map((i) => (
							<Skeleton key={i} className="h-12 w-full" />
						))}
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-4">
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div className="relative w-full max-w-sm">
					<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
					<Input
						placeholder={searchPlaceholder ?? t("search")}
						value={searchColumn ? ((table.getColumn(searchColumn)?.getFilterValue() as string) ?? "") : globalFilter}
						onChange={handleSearchChange}
						className="pl-9"
					/>
				</div>
			</div>

			<div className="rounded-md border overflow-x-auto">
				<Table>
					<TableHeader>
						{table.getHeaderGroups().map((headerGroup) => (
							<TableRow key={headerGroup.id}>
								{headerGroup.headers.map((header) => (
									<TableHead key={header.id} className="whitespace-nowrap">
										{header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
									</TableHead>
								))}
							</TableRow>
						))}
					</TableHeader>
					<TableBody>
						{table.getRowModel().rows?.length ? (
							table.getRowModel().rows.map((row) => (
								<TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
									{row.getVisibleCells().map((cell) => (
										<TableCell key={cell.id} className="whitespace-nowrap">
											{flexRender(cell.column.columnDef.cell, cell.getContext())}
										</TableCell>
									))}
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell colSpan={columns.length} className="h-24 text-center">
									{t("noData")}
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>

			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div className="flex items-center gap-2 text-sm text-muted-foreground">
					<span className="hidden sm:inline">Rows per page:</span>
					<Select value={String(table.getState().pagination.pageSize)} onValueChange={handlePageSizeChange}>
						<SelectTrigger className="h-8 w-[70px]">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							{PAGINATION_CONFIG.pageSizeOptions.map((size) => (
								<SelectItem key={size} value={String(size)}>
									{size}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				<div className="flex items-center justify-between gap-2 sm:justify-end">
					<span className="text-sm text-muted-foreground">
						Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount() || 1}
					</span>
					<div className="flex items-center gap-1">
						<Button
							variant="outline"
							size="icon"
							className="h-8 w-8"
							onClick={goToFirstPage}
							disabled={!table.getCanPreviousPage()}
						>
							<ChevronsLeft className="h-4 w-4" />
						</Button>
						<Button
							variant="outline"
							size="icon"
							className="h-8 w-8"
							onClick={goToPreviousPage}
							disabled={!table.getCanPreviousPage()}
						>
							<ChevronLeft className="h-4 w-4" />
						</Button>
						<Button
							variant="outline"
							size="icon"
							className="h-8 w-8"
							onClick={goToNextPage}
							disabled={!table.getCanNextPage()}
						>
							<ChevronRight className="h-4 w-4" />
						</Button>
						<Button
							variant="outline"
							size="icon"
							className="h-8 w-8"
							onClick={goToLastPage}
							disabled={!table.getCanNextPage()}
						>
							<ChevronsRight className="h-4 w-4" />
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
};

const MemoizedDataTable = React.memo(DataTableInner) as typeof DataTableInner & { displayName?: string };
MemoizedDataTable.displayName = "DataTable";
export const DataTable = MemoizedDataTable;
