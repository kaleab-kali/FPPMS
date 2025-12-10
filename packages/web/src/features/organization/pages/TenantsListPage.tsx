import type { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
	useCreateTenantMutation,
	useDeleteTenantMutation,
	useUpdateTenantMutation,
} from "#web/api/tenants/tenants.mutations.ts";
import { useTenantsQuery } from "#web/api/tenants/tenants.queries.ts";
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
import { TenantFormDialog } from "#web/features/organization/components/TenantFormDialog.tsx";
import type { CreateTenantRequest, Tenant, UpdateTenantRequest } from "#web/types/tenant.ts";

export const TenantsListPage = React.memo(
	() => {
		const { t } = useTranslation("organization");
		const { t: tCommon } = useTranslation("common");

		const [formOpen, setFormOpen] = React.useState(false);
		const [deleteOpen, setDeleteOpen] = React.useState(false);
		const [selectedTenant, setSelectedTenant] = React.useState<Tenant | undefined>();

		const { data, isLoading } = useTenantsQuery();
		const createMutation = useCreateTenantMutation();
		const updateMutation = useUpdateTenantMutation();
		const deleteMutation = useDeleteTenantMutation();

		const tenants = data ?? [];

		const handleCreate = React.useCallback(() => {
			setSelectedTenant(undefined);
			setFormOpen(true);
		}, []);

		const handleEdit = React.useCallback((tenant: Tenant) => {
			setSelectedTenant(tenant);
			setFormOpen(true);
		}, []);

		const handleDeleteClick = React.useCallback((tenant: Tenant) => {
			setSelectedTenant(tenant);
			setDeleteOpen(true);
		}, []);

		const handleFormSubmit = React.useCallback(
			(data: CreateTenantRequest | UpdateTenantRequest) => {
				if (selectedTenant) {
					updateMutation.mutate(
						{ id: selectedTenant.id, data },
						{
							onSuccess: () => {
								toast.success(tCommon("success"));
								setFormOpen(false);
								setSelectedTenant(undefined);
							},
							onError: () => {
								toast.error(tCommon("error"));
							},
						},
					);
				} else {
					createMutation.mutate(data as CreateTenantRequest, {
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
			[selectedTenant, createMutation, updateMutation, tCommon],
		);

		const handleDeleteConfirm = React.useCallback(() => {
			if (selectedTenant) {
				deleteMutation.mutate(selectedTenant.id, {
					onSuccess: () => {
						toast.success(tCommon("success"));
						setDeleteOpen(false);
						setSelectedTenant(undefined);
					},
					onError: () => {
						toast.error(tCommon("error"));
					},
				});
			}
		}, [selectedTenant, deleteMutation, tCommon]);

		const { i18n } = useTranslation();
		const isAmharic = i18n.language === "am";

		const columns = React.useMemo<ColumnDef<Tenant>[]>(
			() => [
				{
					accessorKey: "name",
					header: t("tenant.name"),
					cell: ({ row }) => {
						const tenant = row.original;
						const displayName = isAmharic && tenant.nameAm ? tenant.nameAm : tenant.name;
						return <span className="font-medium">{displayName}</span>;
					},
				},
				{
					accessorKey: "code",
					header: t("tenant.code"),
				},
				{
					accessorKey: "type",
					header: t("tenant.type"),
					cell: ({ row }) => row.getValue("type") || "-",
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
						const tenant = row.original;
						return (
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button variant="ghost" size="icon" className="h-8 w-8">
										<MoreHorizontal className="h-4 w-4" />
										<span className="sr-only">{tCommon("actions")}</span>
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align="end">
									<DropdownMenuItem onClick={() => handleEdit(tenant)}>
										<Pencil className="mr-2 h-4 w-4" />
										{tCommon("edit")}
									</DropdownMenuItem>
									<DropdownMenuItem onClick={() => handleDeleteClick(tenant)} className="text-destructive">
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
						<h1 className="text-2xl font-bold">{t("tenant.title")}</h1>
					</div>
					<Button onClick={handleCreate} className="w-full sm:w-auto">
						<Plus className="mr-2 h-4 w-4" />
						{t("tenant.create")}
					</Button>
				</div>

				<Card>
					<CardHeader>
						<CardTitle>{t("tenant.title")}</CardTitle>
					</CardHeader>
					<CardContent>
						<DataTable columns={columns} data={tenants} isLoading={isLoading} searchColumn="name" />
					</CardContent>
				</Card>

				<TenantFormDialog
					open={formOpen}
					onOpenChange={setFormOpen}
					onSubmit={handleFormSubmit}
					tenant={selectedTenant}
					isLoading={createMutation.isPending || updateMutation.isPending}
				/>

				<ConfirmDialog
					open={deleteOpen}
					onOpenChange={setDeleteOpen}
					title={tCommon("confirm")}
					description={t("tenant.deleteConfirm")}
					onConfirm={handleDeleteConfirm}
					isLoading={deleteMutation.isPending}
					variant="destructive"
				/>
			</div>
		);
	},
	() => true,
);

TenantsListPage.displayName = "TenantsListPage";
