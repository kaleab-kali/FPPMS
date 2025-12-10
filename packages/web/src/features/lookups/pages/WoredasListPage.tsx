import type { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useCreateWoreda, useDeleteWoreda, useUpdateWoreda } from "#web/api/lookups/woredas.mutations.ts";
import { useWoredas } from "#web/api/lookups/woredas.queries.ts";
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
import { WoredaFormDialog } from "#web/features/lookups/components/WoredaFormDialog.tsx";
import type { CreateWoredaRequest, UpdateWoredaRequest, Woreda } from "#web/types/lookup.ts";

export const WoredasListPage = React.memo(
	() => {
		const { t } = useTranslation("lookups");
		const { t: tCommon } = useTranslation("common");

		const [formOpen, setFormOpen] = React.useState(false);
		const [deleteOpen, setDeleteOpen] = React.useState(false);
		const [selectedWoreda, setSelectedWoreda] = React.useState<Woreda | undefined>();

		const { data, isLoading } = useWoredas();
		const createMutation = useCreateWoreda();
		const updateMutation = useUpdateWoreda();
		const deleteMutation = useDeleteWoreda();

		const woredas = data ?? [];

		const handleCreate = React.useCallback(() => {
			setSelectedWoreda(undefined);
			setFormOpen(true);
		}, []);

		const handleEdit = React.useCallback((woreda: Woreda) => {
			setSelectedWoreda(woreda);
			setFormOpen(true);
		}, []);

		const handleDeleteClick = React.useCallback((woreda: Woreda) => {
			setSelectedWoreda(woreda);
			setDeleteOpen(true);
		}, []);

		const handleFormSubmit = React.useCallback(
			(data: CreateWoredaRequest | UpdateWoredaRequest) => {
				if (selectedWoreda) {
					updateMutation.mutate(
						{ id: selectedWoreda.id, data },
						{
							onSuccess: () => {
								toast.success(tCommon("success"));
								setFormOpen(false);
								setSelectedWoreda(undefined);
							},
							onError: () => {
								toast.error(tCommon("error"));
							},
						},
					);
				} else {
					createMutation.mutate(data as CreateWoredaRequest, {
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
			[selectedWoreda, createMutation, updateMutation, tCommon],
		);

		const handleDeleteConfirm = React.useCallback(() => {
			if (selectedWoreda) {
				deleteMutation.mutate(selectedWoreda.id, {
					onSuccess: () => {
						toast.success(tCommon("success"));
						setDeleteOpen(false);
						setSelectedWoreda(undefined);
					},
					onError: () => {
						toast.error(tCommon("error"));
					},
				});
			}
		}, [selectedWoreda, deleteMutation, tCommon]);

		const { i18n } = useTranslation();
		const isAmharic = i18n.language === "am";

		const columns = React.useMemo<ColumnDef<Woreda>[]>(
			() => [
				{
					accessorKey: "name",
					header: t("woreda.name"),
					cell: ({ row }) => {
						const woreda = row.original;
						const displayName = isAmharic && woreda.nameAm ? woreda.nameAm : woreda.name;
						return <span className="font-medium">{displayName}</span>;
					},
				},
				{
					accessorKey: "code",
					header: t("woreda.code"),
				},
				{
					accessorKey: "subCity",
					header: t("woreda.subCity"),
					cell: ({ row }) => {
						const subCity = row.original.subCity;
						if (!subCity) return "-";
						return isAmharic && subCity.nameAm ? subCity.nameAm : subCity.name;
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
						const woreda = row.original;
						return (
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button variant="ghost" size="icon" className="h-8 w-8">
										<MoreHorizontal className="h-4 w-4" />
										<span className="sr-only">{tCommon("actions")}</span>
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align="end">
									<DropdownMenuItem onClick={() => handleEdit(woreda)}>
										<Pencil className="mr-2 h-4 w-4" />
										{tCommon("edit")}
									</DropdownMenuItem>
									<DropdownMenuItem onClick={() => handleDeleteClick(woreda)} className="text-destructive">
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
						<h1 className="text-2xl font-bold">{t("woreda.title")}</h1>
					</div>
					<Button onClick={handleCreate} className="w-full sm:w-auto">
						<Plus className="mr-2 h-4 w-4" />
						{t("woreda.create")}
					</Button>
				</div>

				<Card>
					<CardHeader>
						<CardTitle>{t("woreda.title")}</CardTitle>
					</CardHeader>
					<CardContent>
						<DataTable columns={columns} data={woredas} isLoading={isLoading} searchColumn="name" />
					</CardContent>
				</Card>

				<WoredaFormDialog
					open={formOpen}
					onOpenChange={setFormOpen}
					onSubmit={handleFormSubmit}
					woreda={selectedWoreda}
					isLoading={createMutation.isPending || updateMutation.isPending}
				/>

				<ConfirmDialog
					open={deleteOpen}
					onOpenChange={setDeleteOpen}
					title={tCommon("confirm")}
					description={t("woreda.deleteConfirm")}
					onConfirm={handleDeleteConfirm}
					isLoading={deleteMutation.isPending}
					variant="destructive"
				/>
			</div>
		);
	},
	() => true,
);

WoredasListPage.displayName = "WoredasListPage";
