import type { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useCreateSubCity, useDeleteSubCity, useUpdateSubCity } from "#web/api/lookups/sub-cities.mutations.ts";
import { useSubCities } from "#web/api/lookups/sub-cities.queries.ts";
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
import { SubCityFormDialog } from "#web/features/lookups/components/SubCityFormDialog.tsx";
import type { CreateSubCityRequest, SubCity, UpdateSubCityRequest } from "#web/types/lookup.ts";

export const SubCitiesListPage = React.memo(
	() => {
		const { t } = useTranslation("lookups");
		const { t: tCommon } = useTranslation("common");

		const [formOpen, setFormOpen] = React.useState(false);
		const [deleteOpen, setDeleteOpen] = React.useState(false);
		const [selectedSubCity, setSelectedSubCity] = React.useState<SubCity | undefined>();

		const { data, isLoading } = useSubCities();
		const createMutation = useCreateSubCity();
		const updateMutation = useUpdateSubCity();
		const deleteMutation = useDeleteSubCity();

		const subCities = data ?? [];

		const handleCreate = React.useCallback(() => {
			setSelectedSubCity(undefined);
			setFormOpen(true);
		}, []);

		const handleEdit = React.useCallback((subCity: SubCity) => {
			setSelectedSubCity(subCity);
			setFormOpen(true);
		}, []);

		const handleDeleteClick = React.useCallback((subCity: SubCity) => {
			setSelectedSubCity(subCity);
			setDeleteOpen(true);
		}, []);

		const handleFormSubmit = React.useCallback(
			(data: CreateSubCityRequest | UpdateSubCityRequest) => {
				if (selectedSubCity) {
					updateMutation.mutate(
						{ id: selectedSubCity.id, data },
						{
							onSuccess: () => {
								toast.success(tCommon("success"));
								setFormOpen(false);
								setSelectedSubCity(undefined);
							},
							onError: () => {
								toast.error(tCommon("error"));
							},
						},
					);
				} else {
					createMutation.mutate(data as CreateSubCityRequest, {
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
			[selectedSubCity, createMutation, updateMutation, tCommon],
		);

		const handleDeleteConfirm = React.useCallback(() => {
			if (selectedSubCity) {
				deleteMutation.mutate(selectedSubCity.id, {
					onSuccess: () => {
						toast.success(tCommon("success"));
						setDeleteOpen(false);
						setSelectedSubCity(undefined);
					},
					onError: () => {
						toast.error(tCommon("error"));
					},
				});
			}
		}, [selectedSubCity, deleteMutation, tCommon]);

		const { i18n } = useTranslation();
		const isAmharic = i18n.language === "am";

		const columns = React.useMemo<ColumnDef<SubCity>[]>(
			() => [
				{
					accessorKey: "name",
					header: t("subCity.name"),
					cell: ({ row }) => {
						const subCity = row.original;
						const displayName = isAmharic && subCity.nameAm ? subCity.nameAm : subCity.name;
						return <span className="font-medium">{displayName}</span>;
					},
				},
				{
					accessorKey: "code",
					header: t("subCity.code"),
				},
				{
					accessorKey: "region",
					header: t("subCity.region"),
					cell: ({ row }) => {
						const region = row.original.region;
						if (!region) return "-";
						return isAmharic && region.nameAm ? region.nameAm : region.name;
					},
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
						const subCity = row.original;
						return (
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button variant="ghost" size="icon" className="h-8 w-8">
										<MoreHorizontal className="h-4 w-4" />
										<span className="sr-only">{tCommon("actions")}</span>
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align="end">
									<DropdownMenuItem onClick={() => handleEdit(subCity)}>
										<Pencil className="mr-2 h-4 w-4" />
										{tCommon("edit")}
									</DropdownMenuItem>
									<DropdownMenuItem onClick={() => handleDeleteClick(subCity)} className="text-destructive">
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
						<h1 className="text-2xl font-bold">{t("subCity.title")}</h1>
					</div>
					<Button onClick={handleCreate} className="w-full sm:w-auto">
						<Plus className="mr-2 h-4 w-4" />
						{t("subCity.create")}
					</Button>
				</div>

				<Card>
					<CardHeader>
						<CardTitle>{t("subCity.title")}</CardTitle>
					</CardHeader>
					<CardContent>
						<DataTable columns={columns} data={subCities} isLoading={isLoading} searchColumn="name" />
					</CardContent>
				</Card>

				<SubCityFormDialog
					open={formOpen}
					onOpenChange={setFormOpen}
					onSubmit={handleFormSubmit}
					subCity={selectedSubCity}
					isLoading={createMutation.isPending || updateMutation.isPending}
				/>

				<ConfirmDialog
					open={deleteOpen}
					onOpenChange={setDeleteOpen}
					title={tCommon("confirm")}
					description={t("subCity.deleteConfirm")}
					onConfirm={handleDeleteConfirm}
					isLoading={deleteMutation.isPending}
					variant="destructive"
				/>
			</div>
		);
	},
	() => true,
);

SubCitiesListPage.displayName = "SubCitiesListPage";
