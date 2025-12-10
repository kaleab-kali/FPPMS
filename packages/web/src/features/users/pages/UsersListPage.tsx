import type { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useCreateUser, useDeleteUser, useUpdateUser } from "#web/api/users/users.mutations.ts";
import { useUsers } from "#web/api/users/users.queries.ts";
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
import { UserFormDialog } from "#web/features/users/components/UserFormDialog.tsx";
import type { CreateUserRequest, UpdateUserRequest, User } from "#web/types/user.ts";

const STATUS_VARIANTS = {
	ACTIVE: "default",
	INACTIVE: "secondary",
	SUSPENDED: "destructive",
	PENDING: "outline",
} as const;

export const UsersListPage = React.memo(
	() => {
		const { t } = useTranslation("users");
		const { t: tCommon } = useTranslation("common");

		const [formOpen, setFormOpen] = React.useState(false);
		const [deleteOpen, setDeleteOpen] = React.useState(false);
		const [selectedUser, setSelectedUser] = React.useState<User | undefined>();

		const { data, isLoading } = useUsers();
		const createMutation = useCreateUser();
		const updateMutation = useUpdateUser();
		const deleteMutation = useDeleteUser();

		const users = data ?? [];

		const handleCreate = React.useCallback(() => {
			setSelectedUser(undefined);
			setFormOpen(true);
		}, []);

		const handleEdit = React.useCallback((user: User) => {
			setSelectedUser(user);
			setFormOpen(true);
		}, []);

		const handleDeleteClick = React.useCallback((user: User) => {
			setSelectedUser(user);
			setDeleteOpen(true);
		}, []);

		const handleFormSubmit = React.useCallback(
			(data: CreateUserRequest | UpdateUserRequest) => {
				if (selectedUser) {
					updateMutation.mutate(
						{ id: selectedUser.id, data },
						{
							onSuccess: () => {
								toast.success(tCommon("success"));
								setFormOpen(false);
								setSelectedUser(undefined);
							},
							onError: () => {
								toast.error(tCommon("error"));
							},
						},
					);
				} else {
					createMutation.mutate(data as CreateUserRequest, {
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
			[selectedUser, createMutation, updateMutation, tCommon],
		);

		const handleDeleteConfirm = React.useCallback(() => {
			if (selectedUser) {
				deleteMutation.mutate(selectedUser.id, {
					onSuccess: () => {
						toast.success(tCommon("success"));
						setDeleteOpen(false);
						setSelectedUser(undefined);
					},
					onError: () => {
						toast.error(tCommon("error"));
					},
				});
			}
		}, [selectedUser, deleteMutation, tCommon]);

		const columns = React.useMemo<ColumnDef<User>[]>(
			() => [
				{
					accessorKey: "username",
					header: t("username"),
					cell: ({ row }) => <span className="font-medium">{row.getValue("username")}</span>,
				},
				{
					accessorKey: "email",
					header: t("email"),
					cell: ({ row }) => row.original.email ?? "-",
				},
				{
					accessorKey: "roles",
					header: t("roles"),
					cell: ({ row }) => {
						const roles = row.original.roles;
						if (!roles || roles.length === 0) return "-";
						return roles.map((r) => r.name).join(", ");
					},
				},
				{
					accessorKey: "status",
					header: tCommon("status"),
					cell: ({ row }) => {
						const status = row.original.status;
						const variant = STATUS_VARIANTS[status] ?? "secondary";
						return <Badge variant={variant}>{t(`status.${status.toLowerCase()}`)}</Badge>;
					},
				},
				{
					id: "actions",
					header: tCommon("actions"),
					cell: ({ row }) => {
						const user = row.original;
						return (
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button variant="ghost" size="icon" className="h-8 w-8">
										<MoreHorizontal className="h-4 w-4" />
										<span className="sr-only">{tCommon("actions")}</span>
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align="end">
									<DropdownMenuItem onClick={() => handleEdit(user)}>
										<Pencil className="mr-2 h-4 w-4" />
										{tCommon("edit")}
									</DropdownMenuItem>
									<DropdownMenuItem onClick={() => handleDeleteClick(user)} className="text-destructive">
										<Trash2 className="mr-2 h-4 w-4" />
										{tCommon("delete")}
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						);
					},
				},
			],
			[t, tCommon, handleEdit, handleDeleteClick],
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
						<DataTable columns={columns} data={users} isLoading={isLoading} searchColumn="username" />
					</CardContent>
				</Card>

				<UserFormDialog
					open={formOpen}
					onOpenChange={setFormOpen}
					onSubmit={handleFormSubmit}
					user={selectedUser}
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

UsersListPage.displayName = "UsersListPage";
