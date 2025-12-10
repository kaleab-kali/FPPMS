import type { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useCreateCenter, useDeleteCenter, useUpdateCenter } from "#web/api/centers/centers.mutations.ts";
import { useCenters } from "#web/api/centers/centers.queries.ts";
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
import { CenterFormDialog } from "#web/features/organization/components/CenterFormDialog.tsx";
import type { Center, CreateCenterRequest, UpdateCenterRequest } from "#web/types/center.ts";

export const CentersListPage = React.memo(
	() => {
		const { t } = useTranslation("organization");
		const { t: tCommon } = useTranslation("common");

		const [formOpen, setFormOpen] = React.useState(false);
		const [deleteOpen, setDeleteOpen] = React.useState(false);
		const [selectedCenter, setSelectedCenter] = React.useState<Center | undefined>();

		const { data, isLoading } = useCenters();
		const createMutation = useCreateCenter();
		const updateMutation = useUpdateCenter();
		const deleteMutation = useDeleteCenter();

		const centers = data ?? [];

		const handleCreate = React.useCallback(() => {
			setSelectedCenter(undefined);
			setFormOpen(true);
		}, []);

		const handleEdit = React.useCallback((center: Center) => {
			setSelectedCenter(center);
			setFormOpen(true);
		}, []);

		const handleDeleteClick = React.useCallback((center: Center) => {
			setSelectedCenter(center);
			setDeleteOpen(true);
		}, []);

		const handleFormSubmit = React.useCallback(
			(data: CreateCenterRequest | UpdateCenterRequest) => {
				if (selectedCenter) {
					updateMutation.mutate(
						{ id: selectedCenter.id, data },
						{
							onSuccess: () => {
								toast.success(tCommon("success"));
								setFormOpen(false);
								setSelectedCenter(undefined);
							},
							onError: () => {
								toast.error(tCommon("error"));
							},
						},
					);
				} else {
					createMutation.mutate(data as CreateCenterRequest, {
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
			[selectedCenter, createMutation, updateMutation, tCommon],
		);

		const handleDeleteConfirm = React.useCallback(() => {
			if (selectedCenter) {
				deleteMutation.mutate(selectedCenter.id, {
					onSuccess: () => {
						toast.success(tCommon("success"));
						setDeleteOpen(false);
						setSelectedCenter(undefined);
					},
					onError: () => {
						toast.error(tCommon("error"));
					},
				});
			}
		}, [selectedCenter, deleteMutation, tCommon]);

		const { i18n } = useTranslation();
		const isAmharic = i18n.language === "am";

		const columns = React.useMemo<ColumnDef<Center>[]>(
			() => [
				{
					accessorKey: "name",
					header: t("center.name"),
					cell: ({ row }) => {
						const center = row.original;
						const displayName = isAmharic && center.nameAm ? center.nameAm : center.name;
						return <span className="font-medium">{displayName}</span>;
					},
				},
				{
					accessorKey: "code",
					header: t("center.code"),
				},
				{
					accessorKey: "type",
					header: t("center.type"),
					cell: ({ row }) => row.getValue("type") || "-",
				},
				{
					accessorKey: "phone",
					header: t("center.phone"),
					cell: ({ row }) => row.getValue("phone") || "-",
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
						const center = row.original;
						return (
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button variant="ghost" size="icon" className="h-8 w-8">
										<MoreHorizontal className="h-4 w-4" />
										<span className="sr-only">{tCommon("actions")}</span>
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align="end">
									<DropdownMenuItem onClick={() => handleEdit(center)}>
										<Pencil className="mr-2 h-4 w-4" />
										{tCommon("edit")}
									</DropdownMenuItem>
									<DropdownMenuItem onClick={() => handleDeleteClick(center)} className="text-destructive">
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
						<h1 className="text-2xl font-bold">{t("center.title")}</h1>
					</div>
					<Button onClick={handleCreate} className="w-full sm:w-auto">
						<Plus className="mr-2 h-4 w-4" />
						{t("center.create")}
					</Button>
				</div>

				<Card>
					<CardHeader>
						<CardTitle>{t("center.title")}</CardTitle>
					</CardHeader>
					<CardContent>
						<DataTable columns={columns} data={centers} isLoading={isLoading} searchColumn="name" />
					</CardContent>
				</Card>

				<CenterFormDialog
					open={formOpen}
					onOpenChange={setFormOpen}
					onSubmit={handleFormSubmit}
					center={selectedCenter}
					isLoading={createMutation.isPending || updateMutation.isPending}
				/>

				<ConfirmDialog
					open={deleteOpen}
					onOpenChange={setDeleteOpen}
					title={tCommon("confirm")}
					description={t("center.deleteConfirm")}
					onConfirm={handleDeleteConfirm}
					isLoading={deleteMutation.isPending}
					variant="destructive"
				/>
			</div>
		);
	},
	() => true,
);

CentersListPage.displayName = "CentersListPage";
