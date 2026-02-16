import type { ColumnDef } from "@tanstack/react-table";
import { KeyRound, LockOpen, MoreHorizontal, Pencil, Plus, UserX } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
	useChangeUserStatus,
	useCreateUserFromEmployee,
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
import { UserStatusChangeDialog } from "#web/features/users/components/UserStatusChangeDialog.tsx";
import type { CreateUserFromEmployeeRequest, UpdateUserRequest, User, UserStatus } from "#web/types/user.ts";

const STATUS_VARIANTS = {
	ACTIVE: "default",
	INACTIVE: "secondary",
	LOCKED: "destructive",
	PENDING: "outline",
	TRANSFERRED: "secondary",
	TERMINATED: "destructive",
} as const;

export const UsersListPage = React.memo(() => {
	const { t } = useTranslation("users");
	const { t: tCommon } = useTranslation("common");

	const [formOpen, setFormOpen] = React.useState(false);
	const [statusChangeOpen, setStatusChangeOpen] = React.useState(false);
	const [resetPasswordOpen, setResetPasswordOpen] = React.useState(false);
	const [selectedUser, setSelectedUser] = React.useState<User | undefined>();
	const [createdCredentials, setCreatedCredentials] = React.useState<
		{ username: string; password: string } | undefined
	>();

	const { data, isLoading } = useUsers();
	const createMutation = useCreateUserFromEmployee();
	const updateMutation = useUpdateUser();
	const changeStatusMutation = useChangeUserStatus();
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

	const handleStatusChangeClick = React.useCallback((user: User) => {
		setSelectedUser(user);
		setStatusChangeOpen(true);
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

	const handleReactivate = React.useCallback(
		(user: User) => {
			changeStatusMutation.mutate(
				{ id: user.id, data: { status: "ACTIVE", reason: "Reactivated by administrator" } },
				{
					onSuccess: () => {
						toast.success(t("statusChange.reactivated"));
					},
					onError: () => {
						toast.error(tCommon("error"));
					},
				},
			);
		},
		[changeStatusMutation, t, tCommon],
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

	const handleStatusChangeConfirm = React.useCallback(
		(status: UserStatus, reason: string) => {
			if (selectedUser) {
				changeStatusMutation.mutate(
					{ id: selectedUser.id, data: { status, reason } },
					{
						onSuccess: () => {
							toast.success(t("statusChange.success"));
							setStatusChangeOpen(false);
							setSelectedUser(undefined);
						},
						onError: () => {
							toast.error(tCommon("error"));
						},
					},
				);
			}
		},
		[selectedUser, changeStatusMutation, t, tCommon],
	);

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
				accessorKey: "statusChangeReason",
				header: t("statusReason"),
				cell: ({ row }) => {
					const reason = row.original.statusChangeReason;
					if (!reason) return "-";
					return (
						<span className="max-w-[200px] truncate text-muted-foreground text-sm" title={reason}>
							{reason}
						</span>
					);
				},
			},
			{
				id: "actions",
				header: tCommon("actions"),
				cell: ({ row }) => {
					const user = row.original;
					const isActive = user.status === "ACTIVE";
					const isLocked = user.status === "LOCKED";
					const isInactiveOrTerminated = ["INACTIVE", "TRANSFERRED", "TERMINATED"].includes(user.status);

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
								{isLocked && (
									<DropdownMenuItem onClick={() => handleUnlock(user)}>
										<LockOpen className="mr-2 h-4 w-4" />
										{t("unlock")}
									</DropdownMenuItem>
								)}
								{isInactiveOrTerminated && (
									<DropdownMenuItem onClick={() => handleReactivate(user)}>
										<LockOpen className="mr-2 h-4 w-4" />
										{t("statusChange.reactivate")}
									</DropdownMenuItem>
								)}
								{isActive && (
									<>
										<DropdownMenuSeparator />
										<DropdownMenuItem onClick={() => handleStatusChangeClick(user)} className="text-destructive">
											<UserX className="mr-2 h-4 w-4" />
											{t("statusChange.deactivate")}
										</DropdownMenuItem>
									</>
								)}
							</DropdownMenuContent>
						</DropdownMenu>
					);
				},
			},
		],
		[t, tCommon, handleEdit, handleStatusChangeClick, handleResetPasswordClick, handleUnlock, handleReactivate],
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

			<UserStatusChangeDialog
				open={statusChangeOpen}
				onOpenChange={setStatusChangeOpen}
				onConfirm={handleStatusChangeConfirm}
				user={selectedUser}
				isLoading={changeStatusMutation.isPending}
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
});

UsersListPage.displayName = "UsersListPage";
