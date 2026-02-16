import type { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useCreatePosition, useDeletePosition, useUpdatePosition } from "#web/api/positions/positions.mutations.ts";
import { usePositions } from "#web/api/positions/positions.queries.ts";
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
import { PositionFormDialog } from "#web/features/organization/components/PositionFormDialog.tsx";
import type { CreatePositionRequest, Position, UpdatePositionRequest } from "#web/types/position.ts";

export const PositionsListPage = React.memo(() => {
	const { t } = useTranslation("organization");
	const { t: tCommon } = useTranslation("common");

	const [formOpen, setFormOpen] = React.useState(false);
	const [deleteOpen, setDeleteOpen] = React.useState(false);
	const [selectedPosition, setSelectedPosition] = React.useState<Position | undefined>();

	const { data, isLoading } = usePositions();
	const createMutation = useCreatePosition();
	const updateMutation = useUpdatePosition();
	const deleteMutation = useDeletePosition();

	const positions = data ?? [];

	const handleCreate = React.useCallback(() => {
		setSelectedPosition(undefined);
		setFormOpen(true);
	}, []);

	const handleEdit = React.useCallback((position: Position) => {
		setSelectedPosition(position);
		setFormOpen(true);
	}, []);

	const handleDeleteClick = React.useCallback((position: Position) => {
		setSelectedPosition(position);
		setDeleteOpen(true);
	}, []);

	const handleFormSubmit = React.useCallback(
		(data: CreatePositionRequest | UpdatePositionRequest) => {
			if (selectedPosition) {
				updateMutation.mutate(
					{ id: selectedPosition.id, data },
					{
						onSuccess: () => {
							toast.success(tCommon("success"));
							setFormOpen(false);
							setSelectedPosition(undefined);
						},
						onError: () => {
							toast.error(tCommon("error"));
						},
					},
				);
			} else {
				createMutation.mutate(data as CreatePositionRequest, {
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
		[selectedPosition, createMutation, updateMutation, tCommon],
	);

	const handleDeleteConfirm = React.useCallback(() => {
		if (selectedPosition) {
			deleteMutation.mutate(selectedPosition.id, {
				onSuccess: () => {
					toast.success(tCommon("success"));
					setDeleteOpen(false);
					setSelectedPosition(undefined);
				},
				onError: () => {
					toast.error(tCommon("error"));
				},
			});
		}
	}, [selectedPosition, deleteMutation, tCommon]);

	const { i18n } = useTranslation();
	const isAmharic = i18n.language === "am";

	const columns = React.useMemo<ColumnDef<Position>[]>(
		() => [
			{
				accessorKey: "name",
				header: t("position.name"),
				cell: ({ row }) => {
					const position = row.original;
					const displayName = isAmharic && position.nameAm ? position.nameAm : position.name;
					return <span className="font-medium">{displayName}</span>;
				},
			},
			{
				accessorKey: "code",
				header: t("position.code"),
			},
			{
				id: "department",
				header: t("position.department"),
				cell: ({ row }) => {
					const position = row.original;
					if (!position.department) return "-";
					const displayName =
						isAmharic && position.department.nameAm ? position.department.nameAm : position.department.name;
					return <span>{displayName}</span>;
				},
			},
			{
				accessorKey: "description",
				header: t("position.description"),
				cell: ({ row }) => <span className="max-w-[200px] truncate">{row.getValue("description") || "-"}</span>,
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
					const position = row.original;
					return (
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button variant="ghost" size="icon" className="h-8 w-8">
									<MoreHorizontal className="h-4 w-4" />
									<span className="sr-only">{tCommon("actions")}</span>
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end">
								<DropdownMenuItem onClick={() => handleEdit(position)}>
									<Pencil className="mr-2 h-4 w-4" />
									{tCommon("edit")}
								</DropdownMenuItem>
								<DropdownMenuItem onClick={() => handleDeleteClick(position)} className="text-destructive">
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
					<h1 className="text-2xl font-bold">{t("position.title")}</h1>
				</div>
				<Button onClick={handleCreate} className="w-full sm:w-auto">
					<Plus className="mr-2 h-4 w-4" />
					{t("position.create")}
				</Button>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>{t("position.title")}</CardTitle>
				</CardHeader>
				<CardContent>
					<DataTable columns={columns} data={positions} isLoading={isLoading} searchColumn="name" />
				</CardContent>
			</Card>

			<PositionFormDialog
				open={formOpen}
				onOpenChange={setFormOpen}
				onSubmit={handleFormSubmit}
				position={selectedPosition}
				isLoading={createMutation.isPending || updateMutation.isPending}
			/>

			<ConfirmDialog
				open={deleteOpen}
				onOpenChange={setDeleteOpen}
				title={tCommon("confirm")}
				description={t("position.deleteConfirm")}
				onConfirm={handleDeleteConfirm}
				isLoading={deleteMutation.isPending}
				variant="destructive"
			/>
		</div>
	);
});

PositionsListPage.displayName = "PositionsListPage";
