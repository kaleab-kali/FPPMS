import type { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useCreateRole, useDeleteRole, useUpdateRole } from "#web/api/roles/roles.mutations.ts";
import { useRoles } from "#web/api/roles/roles.queries.ts";
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
import { RoleFormDialog } from "#web/features/roles/components/RoleFormDialog.tsx";
import type { CreateRoleRequest, Role, UpdateRoleRequest } from "#web/types/role.ts";

export const RolesListPage = React.memo(
	() => {
		const { t } = useTranslation("roles");
		const { t: tCommon } = useTranslation("common");

		const [formOpen, setFormOpen] = React.useState(false);
		const [deleteOpen, setDeleteOpen] = React.useState(false);
		const [selectedRole, setSelectedRole] = React.useState<Role | undefined>();

		const { data, isLoading } = useRoles();
		const createMutation = useCreateRole();
		const updateMutation = useUpdateRole();
		const deleteMutation = useDeleteRole();

		const roles = data ?? [];

		const handleCreate = React.useCallback(() => {
			setSelectedRole(undefined);
			setFormOpen(true);
		}, []);

		const handleEdit = React.useCallback((role: Role) => {
			setSelectedRole(role);
			setFormOpen(true);
		}, []);

		const handleDeleteClick = React.useCallback((role: Role) => {
			setSelectedRole(role);
			setDeleteOpen(true);
		}, []);

		const handleFormSubmit = React.useCallback(
			(data: CreateRoleRequest | UpdateRoleRequest) => {
				if (selectedRole) {
					updateMutation.mutate(
						{ id: selectedRole.id, data },
						{
							onSuccess: () => {
								toast.success(tCommon("success"));
								setFormOpen(false);
								setSelectedRole(undefined);
							},
							onError: () => {
								toast.error(tCommon("error"));
							},
						},
					);
				} else {
					createMutation.mutate(data as CreateRoleRequest, {
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
			[selectedRole, createMutation, updateMutation, tCommon],
		);

		const handleDeleteConfirm = React.useCallback(() => {
			if (selectedRole) {
				deleteMutation.mutate(selectedRole.id, {
					onSuccess: () => {
						toast.success(tCommon("success"));
						setDeleteOpen(false);
						setSelectedRole(undefined);
					},
					onError: () => {
						toast.error(tCommon("error"));
					},
				});
			}
		}, [selectedRole, deleteMutation, tCommon]);

		const { i18n } = useTranslation();
		const isAmharic = i18n.language === "am";

		const columns = React.useMemo<ColumnDef<Role>[]>(
			() => [
				{
					accessorKey: "name",
					header: t("name"),
					cell: ({ row }) => {
						const role = row.original;
						const displayName = isAmharic && role.nameAm ? role.nameAm : role.name;
						return <span className="font-medium">{displayName}</span>;
					},
				},
				{
					accessorKey: "code",
					header: t("code"),
				},
				{
					accessorKey: "accessScope",
					header: t("accessScope"),
					cell: ({ row }) => {
						const scope = row.original.accessScope;
						const isAllCenters = scope === "ALL_CENTERS";
						return <Badge variant={isAllCenters ? "default" : "outline"}>{t(`scopes.${scope}`)}</Badge>;
					},
				},
				{
					accessorKey: "permissions",
					header: t("permissions"),
					cell: ({ row }) => {
						const count = row.original.permissions?.length ?? 0;
						return (
							<span className="text-sm text-muted-foreground">
								{count} {t("permissionsCount")}
							</span>
						);
					},
				},
				{
					accessorKey: "isSystemRole",
					header: t("isSystemRole"),
					cell: ({ row }) => (
						<Badge variant={row.original.isSystemRole ? "outline" : "secondary"}>
							{row.original.isSystemRole ? t("system") : t("custom")}
						</Badge>
					),
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
						const role = row.original;
						const isSystemRole = role.isSystemRole;
						return (
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button variant="ghost" size="icon" className="h-8 w-8">
										<MoreHorizontal className="h-4 w-4" />
										<span className="sr-only">{tCommon("actions")}</span>
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align="end">
									<DropdownMenuItem onClick={() => handleEdit(role)}>
										<Pencil className="mr-2 h-4 w-4" />
										{tCommon("edit")}
									</DropdownMenuItem>
									<DropdownMenuItem
										onClick={() => handleDeleteClick(role)}
										className="text-destructive"
										disabled={isSystemRole}
									>
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
						<h1 className="text-2xl font-bold">{t("title")}</h1>
					</div>
					<Button onClick={handleCreate} className="w-full sm:w-auto">
						<Plus className="mr-2 h-4 w-4" />
						{t("create")}
					</Button>
				</div>

				<Card>
					<CardHeader>
						<CardTitle>{t("title")}</CardTitle>
					</CardHeader>
					<CardContent>
						<DataTable columns={columns} data={roles} isLoading={isLoading} searchColumn="name" />
					</CardContent>
				</Card>

				<RoleFormDialog
					open={formOpen}
					onOpenChange={setFormOpen}
					onSubmit={handleFormSubmit}
					role={selectedRole}
					isLoading={createMutation.isPending || updateMutation.isPending}
				/>

				<ConfirmDialog
					open={deleteOpen}
					onOpenChange={setDeleteOpen}
					title={tCommon("confirm")}
					description={t("deleteConfirm")}
					onConfirm={handleDeleteConfirm}
					isLoading={deleteMutation.isPending}
					variant="destructive"
				/>
			</div>
		);
	},
	() => true,
);

RolesListPage.displayName = "RolesListPage";
