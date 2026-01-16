import { createColumnHelper, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { AlertTriangle, Box, Search } from "lucide-react";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { useAmmunitionStock, useAmmunitionTypes } from "#web/api/weapons/weapons.queries";
import { Pagination } from "#web/components/common/Pagination";
import { Badge } from "#web/components/ui/badge";
import { Button } from "#web/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "#web/components/ui/card";
import { Input } from "#web/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "#web/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "#web/components/ui/table";
import type { AmmunitionFilter, CenterAmmunitionStock } from "#web/types/weapons";

const columnHelper = createColumnHelper<CenterAmmunitionStock>();

const AmmunitionStockPageComponent = (): React.ReactElement => {
	const { t } = useTranslation(["weapons", "common"]);
	const { i18n } = useTranslation();
	const isAmharic = i18n.language === "am";

	const [filter, setFilter] = React.useState<AmmunitionFilter>({
		page: 1,
		limit: 10,
	});
	const [searchTerm, setSearchTerm] = React.useState("");

	const { data, isLoading } = useAmmunitionStock(filter);
	const { data: ammoTypes } = useAmmunitionTypes({ isActive: true });

	const handleSearch = React.useCallback(() => {
		setFilter((prev) => ({ ...prev, search: searchTerm, page: 1 }));
	}, [searchTerm]);

	const handleFilterChange = React.useCallback((key: keyof AmmunitionFilter, value: string | undefined) => {
		setFilter((prev) => ({
			...prev,
			[key]: value === "all" ? undefined : value,
			page: 1,
		}));
	}, []);

	const handlePageChange = React.useCallback((page: number) => {
		setFilter((prev) => ({ ...prev, page }));
	}, []);

	const isLowStock = React.useCallback((stock: CenterAmmunitionStock): boolean => {
		if (!stock.minStockLevel) return false;
		return stock.availableQuantity < stock.minStockLevel;
	}, []);

	const columns = React.useMemo(
		() => [
			columnHelper.accessor("centerName", {
				header: () => t("weapons:center"),
				cell: (info) =>
					isAmharic && info.row.original.centerNameAm ? info.row.original.centerNameAm : info.getValue(),
			}),
			columnHelper.accessor("ammunitionTypeName", {
				header: () => t("weapons:ammunitionType"),
				cell: (info) => (
					<div>
						<div>
							{isAmharic && info.row.original.ammunitionTypeNameAm
								? info.row.original.ammunitionTypeNameAm
								: info.getValue()}
						</div>
						<div className="text-xs text-muted-foreground">{info.row.original.caliber}</div>
					</div>
				),
			}),
			columnHelper.accessor("totalQuantity", {
				header: () => t("weapons:totalQuantity"),
				cell: (info) => <span className="font-mono">{info.getValue().toLocaleString()}</span>,
			}),
			columnHelper.accessor("issuedQuantity", {
				header: () => t("weapons:issuedQuantity"),
				cell: (info) => <span className="font-mono">{info.getValue().toLocaleString()}</span>,
			}),
			columnHelper.accessor("availableQuantity", {
				header: () => t("weapons:availableQuantity"),
				cell: (info) => {
					const stock = info.row.original;
					const lowStock = isLowStock(stock);
					return (
						<div className="flex items-center gap-2">
							<span className={`font-mono ${lowStock ? "text-destructive font-bold" : ""}`}>
								{info.getValue().toLocaleString()}
							</span>
							{lowStock && <AlertTriangle className="h-4 w-4 text-destructive" />}
						</div>
					);
				},
			}),
			columnHelper.accessor("minStockLevel", {
				header: () => t("weapons:minStock"),
				cell: (info) =>
					info.getValue() ? <span className="font-mono">{info.getValue()?.toLocaleString()}</span> : "-",
			}),
			columnHelper.display({
				id: "status",
				header: () => t("common:status"),
				cell: (info) => {
					const stock = info.row.original;
					if (isLowStock(stock)) {
						return <Badge variant="destructive">{t("weapons:lowStock")}</Badge>;
					}
					return <Badge variant="default">{t("weapons:adequate")}</Badge>;
				},
			}),
		],
		[t, isAmharic, isLowStock],
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
					<Box className="h-8 w-8 text-primary" />
					<div>
						<h1 className="text-2xl font-bold">{t("weapons:ammunitionStock")}</h1>
						<p className="text-muted-foreground">{t("weapons:ammunitionStockDescription")}</p>
					</div>
				</div>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>{t("common:filters")}</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						<div className="flex gap-2">
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
							value={filter.ammunitionTypeId ?? "all"}
							onValueChange={(value) => handleFilterChange("ammunitionTypeId", value)}
						>
							<SelectTrigger>
								<SelectValue placeholder={t("weapons:ammunitionType")} />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">{t("common:all")}</SelectItem>
								{ammoTypes?.map((type) => (
									<SelectItem key={type.id} value={type.id}>
										{isAmharic && type.nameAm ? type.nameAm : type.name} ({type.caliber})
									</SelectItem>
								))}
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
									{t("weapons:noAmmunitionStock")}
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

AmmunitionStockPageComponent.displayName = "AmmunitionStockPage";

export const AmmunitionStockPage = React.memo(AmmunitionStockPageComponent);
