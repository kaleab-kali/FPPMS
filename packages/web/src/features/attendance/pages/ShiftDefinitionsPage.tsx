import type { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useCreateShift, useDeleteShift, useUpdateShift } from "#web/api/attendance/shifts.mutations.ts";
import { useShifts } from "#web/api/attendance/shifts.queries.ts";
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
import { ShiftFormDialog } from "#web/features/attendance/components/ShiftFormDialog.tsx";
import type {
	CreateShiftDefinitionRequest,
	ShiftDefinition,
	UpdateShiftDefinitionRequest,
} from "#web/types/attendance.ts";

export const ShiftDefinitionsPage = React.memo(() => {
	const { t } = useTranslation("attendance");
	const { t: tCommon } = useTranslation("common");
	const { i18n } = useTranslation();
	const isAmharic = i18n.language === "am";

	const [formOpen, setFormOpen] = React.useState(false);
	const [deleteOpen, setDeleteOpen] = React.useState(false);
	const [selectedShift, setSelectedShift] = React.useState<ShiftDefinition | undefined>();

	const { data: shifts, isLoading } = useShifts();
	const createMutation = useCreateShift();
	const updateMutation = useUpdateShift();
	const deleteMutation = useDeleteShift();

	const shiftsList = shifts ?? [];

	const handleCreate = React.useCallback(() => {
		setSelectedShift(undefined);
		setFormOpen(true);
	}, []);

	const handleEdit = React.useCallback((shift: ShiftDefinition) => {
		setSelectedShift(shift);
		setFormOpen(true);
	}, []);

	const handleDeleteClick = React.useCallback((shift: ShiftDefinition) => {
		setSelectedShift(shift);
		setDeleteOpen(true);
	}, []);

	const handleFormSubmit = React.useCallback(
		(data: CreateShiftDefinitionRequest | UpdateShiftDefinitionRequest) => {
			if (selectedShift) {
				updateMutation.mutate(
					{ id: selectedShift.id, data: data as UpdateShiftDefinitionRequest },
					{
						onSuccess: () => {
							toast.success(tCommon("success"));
							setFormOpen(false);
							setSelectedShift(undefined);
						},
						onError: () => {
							toast.error(tCommon("error"));
						},
					},
				);
			} else {
				createMutation.mutate(data as CreateShiftDefinitionRequest, {
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
		[selectedShift, createMutation, updateMutation, tCommon],
	);

	const handleDeleteConfirm = React.useCallback(() => {
		if (selectedShift) {
			deleteMutation.mutate(selectedShift.id, {
				onSuccess: () => {
					toast.success(tCommon("success"));
					setDeleteOpen(false);
					setSelectedShift(undefined);
				},
				onError: () => {
					toast.error(tCommon("error"));
				},
			});
		}
	}, [selectedShift, deleteMutation, tCommon]);

	const columns = React.useMemo<ColumnDef<ShiftDefinition>[]>(
		() => [
			{
				accessorKey: "code",
				header: t("shiftCode"),
				cell: ({ row }) => <span className="font-medium">{row.getValue("code")}</span>,
			},
			{
				accessorKey: "name",
				header: t("shiftName"),
				cell: ({ row }) => {
					const shift = row.original;
					const displayName = isAmharic && shift.nameAm ? shift.nameAm : shift.name;
					return displayName;
				},
			},
			{
				accessorKey: "scheduleType",
				header: t("scheduleType"),
				cell: ({ row }) => {
					const type = row.getValue("scheduleType") as string;
					return t(`scheduleTypes.${type.toLowerCase()}`);
				},
			},
			{
				accessorKey: "startTime",
				header: t("startTime"),
			},
			{
				accessorKey: "endTime",
				header: t("endTime"),
			},
			{
				accessorKey: "workingHours",
				header: t("workingHours"),
				cell: ({ row }) => {
					const hours = row.getValue("workingHours") as number | undefined;
					return hours ? `${hours.toFixed(1)}h` : "-";
				},
			},
			{
				accessorKey: "breakMinutes",
				header: t("breakMinutes"),
				cell: ({ row }) => `${row.getValue("breakMinutes")}m`,
			},
			{
				accessorKey: "isOvernight",
				header: t("isOvernight"),
				cell: ({ row }) => (
					<Badge variant={row.getValue("isOvernight") ? "default" : "outline"}>
						{row.getValue("isOvernight") ? tCommon("yes") : tCommon("no")}
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
					const shift = row.original;
					return (
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button variant="ghost" size="icon" className="h-8 w-8">
									<MoreHorizontal className="h-4 w-4" />
									<span className="sr-only">{tCommon("actions")}</span>
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end">
								<DropdownMenuItem onClick={() => handleEdit(shift)}>
									<Pencil className="mr-2 h-4 w-4" />
									{tCommon("edit")}
								</DropdownMenuItem>
								<DropdownMenuItem onClick={() => handleDeleteClick(shift)} className="text-destructive">
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
					<h1 className="text-2xl font-bold">{t("shiftDefinitions")}</h1>
					<p className="text-muted-foreground">{t("manageShifts")}</p>
				</div>
				<Button onClick={handleCreate} className="w-full sm:w-auto">
					<Plus className="mr-2 h-4 w-4" />
					{t("createShift")}
				</Button>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>{t("shifts")}</CardTitle>
				</CardHeader>
				<CardContent>
					<DataTable columns={columns} data={shiftsList} isLoading={isLoading} searchColumn="name" />
				</CardContent>
			</Card>

			<ShiftFormDialog
				open={formOpen}
				onOpenChange={setFormOpen}
				onSubmit={handleFormSubmit}
				shift={selectedShift}
				isLoading={createMutation.isPending || updateMutation.isPending}
			/>

			<ConfirmDialog
				open={deleteOpen}
				onOpenChange={setDeleteOpen}
				title={tCommon("confirm")}
				description={t("deleteShiftConfirm")}
				onConfirm={handleDeleteConfirm}
				isLoading={deleteMutation.isPending}
				variant="destructive"
			/>
		</div>
	);
});

ShiftDefinitionsPage.displayName = "ShiftDefinitionsPage";
