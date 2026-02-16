import type { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
	useCreateCommitteeType,
	useDeleteCommitteeType,
	useUpdateCommitteeType,
} from "#web/api/committees/committees.mutations.ts";
import { useCommitteeTypes } from "#web/api/committees/committees.queries.ts";
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
import { CommitteeTypeFormDialog } from "#web/features/committees/components/CommitteeTypeFormDialog.tsx";
import type { CommitteeType, CreateCommitteeTypeRequest, UpdateCommitteeTypeRequest } from "#web/types/committee.ts";

export const CommitteeTypesListPage = React.memo(() => {
	const { t } = useTranslation("committees");
	const { t: tCommon } = useTranslation("common");

	const [formOpen, setFormOpen] = React.useState(false);
	const [deleteOpen, setDeleteOpen] = React.useState(false);
	const [selectedType, setSelectedType] = React.useState<CommitteeType | undefined>();

	const { data, isLoading } = useCommitteeTypes(true);
	const createMutation = useCreateCommitteeType();
	const updateMutation = useUpdateCommitteeType();
	const deleteMutation = useDeleteCommitteeType();

	const types = data ?? [];

	const handleCreate = React.useCallback(() => {
		setSelectedType(undefined);
		setFormOpen(true);
	}, []);

	const handleEdit = React.useCallback((type: CommitteeType) => {
		setSelectedType(type);
		setFormOpen(true);
	}, []);

	const handleDeleteClick = React.useCallback((type: CommitteeType) => {
		setSelectedType(type);
		setDeleteOpen(true);
	}, []);

	const handleFormSubmit = React.useCallback(
		(data: CreateCommitteeTypeRequest | UpdateCommitteeTypeRequest) => {
			if (selectedType) {
				updateMutation.mutate(
					{ id: selectedType.id, data },
					{
						onSuccess: () => {
							toast.success(tCommon("success"));
							setFormOpen(false);
							setSelectedType(undefined);
						},
						onError: () => {
							toast.error(tCommon("error"));
						},
					},
				);
			} else {
				createMutation.mutate(data as CreateCommitteeTypeRequest, {
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
		[selectedType, createMutation, updateMutation, tCommon],
	);

	const handleDeleteConfirm = React.useCallback(() => {
		if (selectedType) {
			deleteMutation.mutate(selectedType.id, {
				onSuccess: () => {
					toast.success(tCommon("success"));
					setDeleteOpen(false);
					setSelectedType(undefined);
				},
				onError: () => {
					toast.error(tCommon("error"));
				},
			});
		}
	}, [selectedType, deleteMutation, tCommon]);

	const { i18n } = useTranslation();
	const isAmharic = i18n.language === "am";

	const columns = React.useMemo<ColumnDef<CommitteeType>[]>(
		() => [
			{
				accessorKey: "code",
				header: t("type.code"),
				cell: ({ row }) => <span className="font-mono text-sm">{row.getValue("code")}</span>,
			},
			{
				accessorKey: "name",
				header: t("type.name"),
				cell: ({ row }) => {
					const type = row.original;
					const displayName = isAmharic && type.nameAm ? type.nameAm : type.name;
					return <span className="font-medium">{displayName}</span>;
				},
			},
			{
				accessorKey: "minMembers",
				header: t("type.minMembers"),
				cell: ({ row }) => <span>{row.getValue("minMembers")}</span>,
			},
			{
				accessorKey: "maxMembers",
				header: t("type.maxMembers"),
				cell: ({ row }) => {
					const max = row.getValue("maxMembers") as number | null | undefined;
					return <span>{max !== null && max !== undefined ? max : t("type.unlimited")}</span>;
				},
			},
			{
				accessorKey: "isPermanent",
				header: t("type.isPermanent"),
				cell: ({ row }) => (
					<Badge variant={row.getValue("isPermanent") ? "default" : "outline"}>
						{row.getValue("isPermanent") ? tCommon("yes") : tCommon("no")}
					</Badge>
				),
			},
			{
				accessorKey: "requiresCenter",
				header: t("type.requiresCenter"),
				cell: ({ row }) => (
					<Badge variant={row.getValue("requiresCenter") ? "default" : "outline"}>
						{row.getValue("requiresCenter") ? tCommon("yes") : tCommon("no")}
					</Badge>
				),
			},
			{
				accessorKey: "_count.committees",
				header: t("type.committeeCount"),
				cell: ({ row }) => <span>{row.original._count?.committees ?? 0}</span>,
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
					const type = row.original;
					return (
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button variant="ghost" size="icon" className="h-8 w-8">
									<MoreHorizontal className="h-4 w-4" />
									<span className="sr-only">{tCommon("actions")}</span>
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end">
								<DropdownMenuItem onClick={() => handleEdit(type)}>
									<Pencil className="mr-2 h-4 w-4" />
									{tCommon("edit")}
								</DropdownMenuItem>
								<DropdownMenuItem
									onClick={() => handleDeleteClick(type)}
									className="text-destructive"
									disabled={type._count?.committees ? type._count.committees > 0 : false}
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
					<h1 className="text-2xl font-bold">{t("type.title")}</h1>
					<p className="text-muted-foreground">{t("type.typeDescription")}</p>
				</div>
				<Button onClick={handleCreate} className="w-full sm:w-auto">
					<Plus className="mr-2 h-4 w-4" />
					{t("type.create")}
				</Button>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>{t("type.list")}</CardTitle>
				</CardHeader>
				<CardContent>
					<DataTable columns={columns} data={types} isLoading={isLoading} searchColumn="name" />
				</CardContent>
			</Card>

			<CommitteeTypeFormDialog
				open={formOpen}
				onOpenChange={setFormOpen}
				onSubmit={handleFormSubmit}
				committeeType={selectedType}
				isLoading={createMutation.isPending || updateMutation.isPending}
			/>

			<ConfirmDialog
				open={deleteOpen}
				onOpenChange={setDeleteOpen}
				title={tCommon("confirm")}
				description={t("type.deleteConfirm")}
				onConfirm={handleDeleteConfirm}
				isLoading={deleteMutation.isPending}
				variant="destructive"
			/>
		</div>
	);
});

CommitteeTypesListPage.displayName = "CommitteeTypesListPage";
