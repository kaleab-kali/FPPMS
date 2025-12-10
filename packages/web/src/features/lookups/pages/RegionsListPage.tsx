import type { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useCreateRegion, useDeleteRegion, useUpdateRegion } from "#web/api/lookups/regions.mutations.ts";
import { useRegions } from "#web/api/lookups/regions.queries.ts";
import { ConfirmDialog } from "#web/components/common/ConfirmDialog.tsx";
import { DataTable } from "#web/components/common/DataTable.tsx";
import { Badge } from "#web/components/ui/badge.tsx";
import { Button } from "#web/components/ui/button.tsx";
import { Card, CardContent, CardHeader, CardTitle } from "#web/components/ui/card.tsx";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "#web/components/ui/dropdown-menu.tsx";
import { RegionFormDialog } from "#web/features/lookups/components/RegionFormDialog.tsx";
import type { CreateRegionRequest, Region, UpdateRegionRequest } from "#web/types/lookup.ts";

export const RegionsListPage = React.memo(
	() => {
		const { t } = useTranslation("lookups");
		const { t: tCommon } = useTranslation("common");

		const [formOpen, setFormOpen] = React.useState(false);
		const [deleteOpen, setDeleteOpen] = React.useState(false);
		const [selectedRegion, setSelectedRegion] = React.useState<Region | undefined>();

		const { data, isLoading } = useRegions();
		const createMutation = useCreateRegion();
		const updateMutation = useUpdateRegion();
		const deleteMutation = useDeleteRegion();

		const regions = data ?? [];

		const handleCreate = React.useCallback(() => {
			setSelectedRegion(undefined);
			setFormOpen(true);
		}, []);

		const handleEdit = React.useCallback((region: Region) => {
			setSelectedRegion(region);
			setFormOpen(true);
		}, []);

		const handleDeleteClick = React.useCallback((region: Region) => {
			setSelectedRegion(region);
			setDeleteOpen(true);
		}, []);

		const handleFormSubmit = React.useCallback(
			(data: CreateRegionRequest | UpdateRegionRequest) => {
				if (selectedRegion) {
					updateMutation.mutate(
						{ id: selectedRegion.id, data },
						{
							onSuccess: () => {
								toast.success(tCommon("success"));
								setFormOpen(false);
								setSelectedRegion(undefined);
							},
							onError: () => {
								toast.error(tCommon("error"));
							},
						},
					);
				} else {
					createMutation.mutate(data as CreateRegionRequest, {
						onSuccess: () => {
							toast.success(tCommon("success"));
							setFormOpen(false);
						},
						onError: () => {
							toast.error(tCommon("error"));
						},
					});
				}
			},
			[selectedRegion, createMutation, updateMutation, tCommon],
		);

		const handleDeleteConfirm = React.useCallback(() => {
			if (selectedRegion) {
				deleteMutation.mutate(selectedRegion.id, {
					onSuccess: () => {
						toast.success(tCommon("success"));
						setDeleteOpen(false);
						setSelectedRegion(undefined);
					},
					onError: () => {
						toast.error(tCommon("error"));
					},
				});
			}
		}, [selectedRegion, deleteMutation, tCommon]);

		const { i18n } = useTranslation();
		const isAmharic = i18n.language === "am";

		const columns = React.useMemo<ColumnDef<Region>[]>(
			() => [
				{
					accessorKey: "name",
					header: t("region.name"),
					cell: ({ row }) => {
						const region = row.original;
						const displayName = isAmharic && region.nameAm ? region.nameAm : region.name;
						return <span className="font-medium">{displayName}</span>;
					},
				},
				{
					accessorKey: "code",
					header: t("region.code"),
				},
				{
					accessorKey: "isActive",
					header: tCommon("status"),
					cell: ({ row }) => (
						<Badge variant={row.getValue("isActive") ? "default" : "secondary"}>
							{row.getValue("isActive") ? tCommon("active") : tCommon("inactive")}
						</Badge>
					),
				},
				{
					id: "actions",
					header: tCommon("actions"),
					cell: ({ row }) => {
						const region = row.original;
						return (
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button variant="ghost" size="icon" className="h-8 w-8">
										<MoreHorizontal className="h-4 w-4" />
										<span className="sr-only">{tCommon("actions")}</span>
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align="end">
									<DropdownMenuItem onClick={() => handleEdit(region)}>
										<Pencil className="mr-2 h-4 w-4" />
										{tCommon("edit")}
									</DropdownMenuItem>
									<DropdownMenuItem onClick={() => handleDeleteClick(region)} className="text-destructive">
										<Trash2 className="mr-2 h-4 w-4" />
										{tCommon("delete")}
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						);
					},
				},
			],
			[t, tCommon, handleEdit, handleDeleteClick, isAmharic],
		);

		return (
			<div className="space-y-6">
				<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
					<div>
						<h1 className="text-2xl font-bold">{t("region.title")}</h1>
					</div>
					<Button onClick={handleCreate} className="w-full sm:w-auto">
						<Plus className="mr-2 h-4 w-4" />
						{t("region.create")}
					</Button>
				</div>

				<Card>
					<CardHeader>
						<CardTitle>{t("region.title")}</CardTitle>
					</CardHeader>
					<CardContent>
						<DataTable columns={columns} data={regions} isLoading={isLoading} searchColumn="name" />
					</CardContent>
				</Card>

				<RegionFormDialog
					open={formOpen}
					onOpenChange={setFormOpen}
					onSubmit={handleFormSubmit}
					region={selectedRegion}
					isLoading={createMutation.isPending || updateMutation.isPending}
				/>

				<ConfirmDialog
					open={deleteOpen}
					onOpenChange={setDeleteOpen}
					title={tCommon("confirm")}
					description={t("region.deleteConfirm")}
					onConfirm={handleDeleteConfirm}
					isLoading={deleteMutation.isPending}
					variant="destructive"
				/>
			</div>
		);
	},
	() => true,
);

RegionsListPage.displayName = "RegionsListPage";
