import type { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
	useCreateDepartment,
	useDeleteDepartment,
	useUpdateDepartment,
} from "#web/api/departments/departments.mutations.ts";
import { useDepartments } from "#web/api/departments/departments.queries.ts";
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
import { DepartmentFormDialog } from "#web/features/organization/components/DepartmentFormDialog.tsx";
import type { CreateDepartmentRequest, Department, UpdateDepartmentRequest } from "#web/types/department.ts";

export const DepartmentsListPage = React.memo(
	() => {
		const { t } = useTranslation("organization");
		const { t: tCommon } = useTranslation("common");

		const [formOpen, setFormOpen] = React.useState(false);
		const [deleteOpen, setDeleteOpen] = React.useState(false);
		const [selectedDepartment, setSelectedDepartment] = React.useState<Department | undefined>();

		const { data, isLoading } = useDepartments();
		const createMutation = useCreateDepartment();
		const updateMutation = useUpdateDepartment();
		const deleteMutation = useDeleteDepartment();

		const departments = data ?? [];

		const handleCreate = React.useCallback(() => {
			setSelectedDepartment(undefined);
			setFormOpen(true);
		}, []);

		const handleEdit = React.useCallback((department: Department) => {
			setSelectedDepartment(department);
			setFormOpen(true);
		}, []);

		const handleDeleteClick = React.useCallback((department: Department) => {
			setSelectedDepartment(department);
			setDeleteOpen(true);
		}, []);

		const handleFormSubmit = React.useCallback(
			(data: CreateDepartmentRequest | UpdateDepartmentRequest) => {
				if (selectedDepartment) {
					updateMutation.mutate(
						{ id: selectedDepartment.id, data },
						{
							onSuccess: () => {
								toast.success(tCommon("success"));
								setFormOpen(false);
								setSelectedDepartment(undefined);
							},
							onError: () => {
								toast.error(tCommon("error"));
							},
						},
					);
				} else {
					createMutation.mutate(data as CreateDepartmentRequest, {
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
			[selectedDepartment, createMutation, updateMutation, tCommon],
		);

		const handleDeleteConfirm = React.useCallback(() => {
			if (selectedDepartment) {
				deleteMutation.mutate(selectedDepartment.id, {
					onSuccess: () => {
						toast.success(tCommon("success"));
						setDeleteOpen(false);
						setSelectedDepartment(undefined);
					},
					onError: () => {
						toast.error(tCommon("error"));
					},
				});
			}
		}, [selectedDepartment, deleteMutation, tCommon]);

		const { i18n } = useTranslation();
		const isAmharic = i18n.language === "am";

		const columns = React.useMemo<ColumnDef<Department>[]>(
			() => [
				{
					accessorKey: "name",
					header: t("department.name"),
					cell: ({ row }) => {
						const department = row.original;
						const displayName = isAmharic && department.nameAm ? department.nameAm : department.name;
						return <span className="font-medium">{displayName}</span>;
					},
				},
				{
					accessorKey: "code",
					header: t("department.code"),
				},
				{
					accessorKey: "description",
					header: t("department.description"),
					cell: ({ row }) => row.getValue("description") || "-",
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
						const department = row.original;
						return (
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button variant="ghost" size="icon" className="h-8 w-8">
										<MoreHorizontal className="h-4 w-4" />
										<span className="sr-only">{tCommon("actions")}</span>
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align="end">
									<DropdownMenuItem onClick={() => handleEdit(department)}>
										<Pencil className="mr-2 h-4 w-4" />
										{tCommon("edit")}
									</DropdownMenuItem>
									<DropdownMenuItem onClick={() => handleDeleteClick(department)} className="text-destructive">
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
						<h1 className="text-2xl font-bold">{t("department.title")}</h1>
					</div>
					<Button onClick={handleCreate} className="w-full sm:w-auto">
						<Plus className="mr-2 h-4 w-4" />
						{t("department.create")}
					</Button>
				</div>

				<Card>
					<CardHeader>
						<CardTitle>{t("department.title")}</CardTitle>
					</CardHeader>
					<CardContent>
						<DataTable columns={columns} data={departments} isLoading={isLoading} searchColumn="name" />
					</CardContent>
				</Card>

				<DepartmentFormDialog
					open={formOpen}
					onOpenChange={setFormOpen}
					onSubmit={handleFormSubmit}
					department={selectedDepartment}
					isLoading={createMutation.isPending || updateMutation.isPending}
				/>

				<ConfirmDialog
					open={deleteOpen}
					onOpenChange={setDeleteOpen}
					title={tCommon("confirm")}
					description={t("department.deleteConfirm")}
					onConfirm={handleDeleteConfirm}
					isLoading={deleteMutation.isPending}
					variant="destructive"
				/>
			</div>
		);
	},
	() => true,
);

DepartmentsListPage.displayName = "DepartmentsListPage";
