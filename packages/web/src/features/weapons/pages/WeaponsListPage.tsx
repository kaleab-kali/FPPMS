import { createColumnHelper, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { format } from "date-fns";
import { Eye, Plus, Search, Shield } from "lucide-react";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { useWeaponCategories, useWeapons } from "#web/api/weapons/weapons.queries";
import { Pagination } from "#web/components/common/Pagination";
import { Badge } from "#web/components/ui/badge";
import { Button } from "#web/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "#web/components/ui/card";
import { Input } from "#web/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "#web/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "#web/components/ui/table";
import { WeaponFormDialog } from "#web/features/weapons/components/WeaponFormDialog";
import type { Weapon, WeaponFilter, WeaponStatus } from "#web/types/weapons";

const columnHelper = createColumnHelper<Weapon>();

const getStatusVariant = (status: WeaponStatus): "default" | "secondary" | "destructive" | "outline" => {
	const variants: Record<WeaponStatus, "default" | "secondary" | "destructive" | "outline"> = {
		IN_SERVICE: "default",
		ASSIGNED: "secondary",
		IN_MAINTENANCE: "outline",
		DECOMMISSIONED: "secondary",
		LOST: "destructive",
		STOLEN: "destructive",
	} as const;
	return variants[status];
};

const WeaponsListPageComponent = (): React.ReactElement => {
	const { t } = useTranslation(["weapons", "common"]);
	const { i18n } = useTranslation();
	const isAmharic = i18n.language === "am";

	const [filter, setFilter] = React.useState<WeaponFilter>({
		page: 1,
		limit: 10,
	});
	const [searchTerm, setSearchTerm] = React.useState("");
	const [showCreateDialog, setShowCreateDialog] = React.useState(false);

	const { data, isLoading, refetch } = useWeapons(filter);
	const { data: categories } = useWeaponCategories({ isActive: true });

	const handleSearch = React.useCallback(() => {
		setFilter((prev) => ({ ...prev, search: searchTerm, page: 1 }));
	}, [searchTerm]);

	const handleFilterChange = React.useCallback((key: keyof WeaponFilter, value: string | undefined) => {
		setFilter((prev) => ({
			...prev,
			[key]: value === "all" ? undefined : value,
			page: 1,
		}));
	}, []);

	const handlePageChange = React.useCallback((page: number) => {
		setFilter((prev) => ({ ...prev, page }));
	}, []);

	const columns = React.useMemo(
		() => [
			columnHelper.accessor("serialNumber", {
				header: () => t("weapons:serialNumber"),
				cell: (info) => <span className="font-mono font-medium">{info.getValue()}</span>,
			}),
			columnHelper.accessor("weaponTypeName", {
				header: () => t("weapons:type"),
				cell: (info) => (
					<div>
						<div>
							{isAmharic && info.row.original.weaponTypeNameAm ? info.row.original.weaponTypeNameAm : info.getValue()}
						</div>
						<div className="text-xs text-muted-foreground">
							{isAmharic && info.row.original.categoryNameAm
								? info.row.original.categoryNameAm
								: info.row.original.categoryName}
						</div>
					</div>
				),
			}),
			columnHelper.accessor("caliber", {
				header: () => t("weapons:caliber"),
				cell: (info) => info.getValue() ?? "-",
			}),
			columnHelper.accessor("centerName", {
				header: () => t("weapons:center"),
				cell: (info) =>
					(isAmharic && info.row.original.centerNameAm ? info.row.original.centerNameAm : info.getValue()) ?? "-",
			}),
			columnHelper.accessor("condition", {
				header: () => t("weapons:condition"),
				cell: (info) => <Badge variant="outline">{t(`weapons:conditions.${info.getValue()}`)}</Badge>,
			}),
			columnHelper.accessor("status", {
				header: () => t("common:status"),
				cell: (info) => (
					<Badge variant={getStatusVariant(info.getValue())}>{t(`weapons:statuses.${info.getValue()}`)}</Badge>
				),
			}),
			columnHelper.accessor("lastInspectionDate", {
				header: () => t("weapons:lastInspection"),
				cell: (info) => (info.getValue() ? format(new Date(info.getValue() as string), "MMM dd, yyyy") : "-"),
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
					<Shield className="h-8 w-8 text-primary" />
					<div>
						<h1 className="text-2xl font-bold">{t("weapons:title")}</h1>
						<p className="text-muted-foreground">{t("weapons:description")}</p>
					</div>
				</div>
				<Button onClick={() => setShowCreateDialog(true)}>
					<Plus className="h-4 w-4 mr-2" />
					{t("weapons:registerWeapon")}
				</Button>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>{t("common:filters")}</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
						<div className="flex gap-2 md:col-span-2">
							<Input
								placeholder={t("weapons:searchPlaceholder")}
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								onKeyDown={(e) => e.key === "Enter" && handleSearch()}
							/>
							<Button variant="outline" onClick={handleSearch}>
								<Search className="h-4 w-4" />
							</Button>
						</div>

						<Select
							value={filter.categoryId ?? "all"}
							onValueChange={(value) => handleFilterChange("categoryId", value)}
						>
							<SelectTrigger>
								<SelectValue placeholder={t("weapons:category")} />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">{t("common:all")}</SelectItem>
								{categories?.map((cat) => (
									<SelectItem key={cat.id} value={cat.id}>
										{isAmharic && cat.nameAm ? cat.nameAm : cat.name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>

						<Select value={filter.status ?? "all"} onValueChange={(value) => handleFilterChange("status", value)}>
							<SelectTrigger>
								<SelectValue placeholder={t("common:status")} />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">{t("common:all")}</SelectItem>
								<SelectItem value="IN_SERVICE">{t("weapons:statuses.IN_SERVICE")}</SelectItem>
								<SelectItem value="ASSIGNED">{t("weapons:statuses.ASSIGNED")}</SelectItem>
								<SelectItem value="IN_MAINTENANCE">{t("weapons:statuses.IN_MAINTENANCE")}</SelectItem>
								<SelectItem value="DECOMMISSIONED">{t("weapons:statuses.DECOMMISSIONED")}</SelectItem>
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
									{t("weapons:noWeapons")}
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>

			{data?.meta && (
				<Pagination currentPage={data.meta.page} totalPages={data.meta.totalPages} onPageChange={handlePageChange} />
			)}

			<WeaponFormDialog open={showCreateDialog} onOpenChange={setShowCreateDialog} onSuccess={() => refetch()} />
		</div>
	);
};

WeaponsListPageComponent.displayName = "WeaponsListPage";

export const WeaponsListPage = React.memo(WeaponsListPageComponent);
