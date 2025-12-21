import type { ColumnDef } from "@tanstack/react-table";
import { KeyRound, LockOpen, MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
	useCreateUserFromEmployee,
	useDeleteUser,
	useResetPassword,
	useUnlockUser,
	useUpdateUser,
} from "#web/api/users/users.mutations.ts";
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
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "#web/components/ui/dropdown-menu.tsx";
import { UserFormDialog } from "#web/features/users/components/UserFormDialog.tsx";
import type { CreateUserFromEmployeeRequest, UpdateUserRequest, User } from "#web/types/user.ts";

const STATUS_VARIANTS = {
	ACTIVE: "default",
	INACTIVE: "secondary",
	LOCKED: "destructive",
	PENDING: "outline",
} as const;

export const UsersListPage = React.memo(
	() => {
		const { t } = useTranslation("users");
		const { t: tCommon } = useTranslation("common");

		const [formOpen, setFormOpen] = React.useState(false);
		const [deleteOpen, setDeleteOpen] = React.useState(false);
		const [resetPasswordOpen, setResetPasswordOpen] = React.useState(false);
		const [selectedUser, setSelectedUser] = React.useState<User | undefined>();
		const [createdCredentials, setCreatedCredentials] = React.useState<
			{ username: string; password: string } | undefined
		>();

		const { data, isLoading } = useUsers();
		const createMutation = useCreateUserFromEmployee();
		const updateMutation = useUpdateUser();
		const deleteMutation = useDeleteUser();
		const resetPasswordMutation = useResetPassword();
		const unlockMutation = useUnlockUser();

		const users = data ?? [];

		const handleCreate = React.useCallback(() => {
			setSelectedUser(undefined);
			setCreatedCredentials(undefined);
			setFormOpen(true);
		}, []);

		const handleEdit = React.useCallback((user: User) => {
			setSelectedUser(user);
			setCreatedCredentials(undefined);
			setFormOpen(true);
		}, []);

		const handleDeleteClick = React.useCallback((user: User) => {
			setSelectedUser(user);
			setDeleteOpen(true);
		}, []);

		const handleResetPasswordClick = React.useCallback((user: User) => {
			setSelectedUser(user);
			setResetPasswordOpen(true);
		}, []);

		const handleUnlock = React.useCallback(
			(user: User) => {
				unlockMutation.mutate(user.id, {
					onSuccess: () => {
						toast.success(t("userUnlocked"));
					},
					onError: () => {
						toast.error(tCommon("error"));
					},
				});
			},
			[unlockMutation, t, tCommon],
		);

		const handleFormSubmit = React.useCallback(
			(data: CreateUserFromEmployeeRequest | UpdateUserRequest) => {
				if (selectedUser) {
					updateMutation.mutate(
						{ id: selectedUser.id, data: data as UpdateUserRequest },
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
					createMutation.mutate(data as CreateUserFromEmployeeRequest, {
						onSuccess: (response) => {
							toast.success(tCommon("success"));
							setCreatedCredentials({
								username: response.generatedUsername,
								password: response.generatedPassword,
							});
						},
						onError: () => {
							toast.error(tCommon("error"));
						},
					});
				}
			},
			[selectedUser, createMutation, updateMutation, tCommon],
		);

		const handleFormClose = React.useCallback((open: boolean) => {
			if (!open) {
				setFormOpen(false);
				setSelectedUser(undefined);
				setCreatedCredentials(undefined);
			}
		}, []);

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

		const handleResetPasswordConfirm = React.useCallback(() => {
			if (selectedUser) {
				resetPasswordMutation.mutate(selectedUser.id, {
					onSuccess: (response) => {
						toast.success(`${t("passwordReset")}: ${response.newPassword}`);
						setResetPasswordOpen(false);
						setSelectedUser(undefined);
					},
					onError: () => {
						toast.error(tCommon("error"));
					},
				});
			}
		}, [selectedUser, resetPasswordMutation, t, tCommon]);

		const columns = React.useMemo<ColumnDef<User>[]>(
			() => [
				{
					accessorKey: "username",
					header: t("username"),
					cell: ({ row }) => <span className="font-medium font-mono">{row.getValue("username")}</span>,
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
									<DropdownMenuItem onClick={() => handleResetPasswordClick(user)}>
										<KeyRound className="mr-2 h-4 w-4" />
										{t("resetPassword")}
									</DropdownMenuItem>
									{user.status === "LOCKED" && (
										<DropdownMenuItem onClick={() => handleUnlock(user)}>
											<LockOpen className="mr-2 h-4 w-4" />
											{t("unlock")}
										</DropdownMenuItem>
									)}
									<DropdownMenuSeparator />
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
			[t, tCommon, handleEdit, handleDeleteClick, handleResetPasswordClick, handleUnlock],
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
					onOpenChange={handleFormClose}
					onSubmit={handleFormSubmit}
					user={selectedUser}
					isLoading={createMutation.isPending || updateMutation.isPending}
					createdCredentials={createdCredentials}
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

				<ConfirmDialog
					open={resetPasswordOpen}
					onOpenChange={setResetPasswordOpen}
					title={t("resetPassword")}
					description={t("resetPasswordConfirm")}
					onConfirm={handleResetPasswordConfirm}
					isLoading={resetPasswordMutation.isPending}
				/>
			</div>
		);
	},
	() => true,
);

UsersListPage.displayName = "UsersListPage";
