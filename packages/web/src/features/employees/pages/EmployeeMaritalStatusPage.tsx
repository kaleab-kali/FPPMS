import type { ColumnDef } from "@tanstack/react-table";
import { Heart, History, MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
	useCreateMaritalStatus,
	useDeleteMaritalStatus,
	useUpdateMaritalStatus,
} from "#web/api/employees/employee-marital-status.mutations.ts";
import {
	useCurrentMaritalStatus,
	useMaritalStatusHistory,
} from "#web/api/employees/employee-marital-status.queries.ts";
import { DataTable } from "#web/components/common/DataTable.tsx";
import { EmployeeSearch } from "#web/components/common/EmployeeSearch.tsx";
import { Badge } from "#web/components/ui/badge.tsx";
import { Button } from "#web/components/ui/button.tsx";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "#web/components/ui/card.tsx";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "#web/components/ui/dialog.tsx";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "#web/components/ui/dropdown-menu.tsx";
import { Input } from "#web/components/ui/input.tsx";
import { Label } from "#web/components/ui/label.tsx";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "#web/components/ui/select.tsx";
import { Textarea } from "#web/components/ui/textarea.tsx";
import { formatDate } from "#web/lib/date-utils.ts";
import type { Employee } from "#web/types/employee.ts";
import type {
	CreateMaritalStatusRequest,
	MaritalStatusRecord,
	UpdateMaritalStatusRequest,
} from "#web/types/employee-marital-status.ts";
import { MARITAL_STATUSES } from "#web/types/employee-marital-status.ts";

const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
	const statusUpper = status.toUpperCase();
	if (statusUpper === "MARRIED") return "default";
	if (statusUpper === "SINGLE") return "secondary";
	if (statusUpper === "DIVORCED" || statusUpper === "SEPARATED") return "destructive";
	return "outline";
};

interface FormState {
	status: string;
	effectiveDate: string;
	remarks: string;
}

const INITIAL_FORM_STATE: FormState = {
	status: MARITAL_STATUSES.SINGLE,
	effectiveDate: "",
	remarks: "",
};

export const EmployeeMaritalStatusPage = React.memo(() => {
	const { t } = useTranslation("employees");
	const { t: tCommon } = useTranslation("common");

	const [selectedEmployee, setSelectedEmployee] = React.useState<Employee | null>(null);
	const [dialogOpen, setDialogOpen] = React.useState(false);
	const [editingRecord, setEditingRecord] = React.useState<MaritalStatusRecord | null>(null);
	const [formState, setFormState] = React.useState<FormState>(INITIAL_FORM_STATE);

	const { data: history, isLoading } = useMaritalStatusHistory(selectedEmployee?.id ?? "");
	const { data: currentStatus } = useCurrentMaritalStatus(selectedEmployee?.id ?? "");

	const createMutation = useCreateMaritalStatus();
	const updateMutation = useUpdateMaritalStatus();
	const deleteMutation = useDeleteMaritalStatus();

	const handleEmployeeFound = React.useCallback((employee: Employee) => {
		setSelectedEmployee(employee);
	}, []);

	const handleEmployeeClear = React.useCallback(() => {
		setSelectedEmployee(null);
	}, []);

	const handleAddClick = React.useCallback(() => {
		setEditingRecord(null);
		setFormState(INITIAL_FORM_STATE);
		setDialogOpen(true);
	}, []);

	const handleEditClick = React.useCallback((record: MaritalStatusRecord) => {
		setEditingRecord(record);
		setFormState({
			status: record.status,
			effectiveDate: record.effectiveDate ? record.effectiveDate.split("T")[0] : "",
			remarks: record.remarks ?? "",
		});
		setDialogOpen(true);
	}, []);

	const handleDelete = React.useCallback(
		(record: MaritalStatusRecord) => {
			if (!globalThis.confirm(t("maritalStatus.deleteConfirm"))) return;

			deleteMutation.mutate(record.id, {
				onSuccess: () => {
					toast.success(tCommon("success"));
				},
				onError: () => {
					toast.error(tCommon("error"));
				},
			});
		},
		[deleteMutation, t, tCommon],
	);

	const handleFormChange = React.useCallback((field: keyof FormState, value: string) => {
		setFormState((prev) => ({ ...prev, [field]: value }));
	}, []);

	const handleSubmit = React.useCallback(() => {
		if (!formState.status || !formState.effectiveDate) {
			toast.error(tCommon("fillRequired"));
			return;
		}

		if (!selectedEmployee) {
			toast.error(tCommon("fillRequired"));
			return;
		}

		if (editingRecord) {
			const updateData: UpdateMaritalStatusRequest = {
				status: formState.status,
				effectiveDate: formState.effectiveDate,
				remarks: formState.remarks || undefined,
			};

			updateMutation.mutate(
				{ id: editingRecord.id, data: updateData },
				{
					onSuccess: () => {
						toast.success(tCommon("success"));
						setDialogOpen(false);
					},
					onError: () => {
						toast.error(tCommon("error"));
					},
				},
			);
		} else {
			const createData: CreateMaritalStatusRequest = {
				employeeId: selectedEmployee.id,
				status: formState.status,
				effectiveDate: formState.effectiveDate,
				remarks: formState.remarks || undefined,
			};

			createMutation.mutate(createData, {
				onSuccess: () => {
					toast.success(tCommon("success"));
					setDialogOpen(false);
				},
				onError: () => {
					toast.error(tCommon("error"));
				},
			});
		}
	}, [formState, editingRecord, selectedEmployee, createMutation, updateMutation, tCommon]);

	const columns = React.useMemo<ColumnDef<MaritalStatusRecord>[]>(
		() => [
			{
				accessorKey: "effectiveDate",
				header: t("maritalStatus.effectiveDate"),
				cell: ({ row }) => formatDate(row.getValue("effectiveDate")),
			},
			{
				accessorKey: "status",
				header: t("maritalStatus.status"),
				cell: ({ row }) => {
					const status = row.getValue("status") as string;
					return (
						<Badge variant={getStatusVariant(status)}>
							{t(`maritalStatus.statuses.${status.toUpperCase()}`, status)}
						</Badge>
					);
				},
			},
			{
				accessorKey: "remarks",
				header: t("maritalStatus.remarks"),
				cell: ({ row }) => {
					const remarks = row.getValue("remarks") as string | null;
					return remarks ? <span className="text-sm text-muted-foreground">{remarks}</span> : "-";
				},
			},
			{
				accessorKey: "createdAt",
				header: t("maritalStatus.recordedAt"),
				cell: ({ row }) => formatDate(row.getValue("createdAt")),
			},
			{
				id: "actions",
				header: tCommon("actions"),
				cell: ({ row }) => {
					const record = row.original;
					return (
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button variant="ghost" size="icon" className="h-8 w-8">
									<MoreHorizontal className="h-4 w-4" />
									<span className="sr-only">{tCommon("actions")}</span>
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end">
								<DropdownMenuItem onClick={() => handleEditClick(record)}>
									<Pencil className="mr-2 h-4 w-4" />
									{tCommon("edit")}
								</DropdownMenuItem>
								<DropdownMenuItem onClick={() => handleDelete(record)} className="text-destructive">
									<Trash2 className="mr-2 h-4 w-4" />
									{tCommon("delete")}
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					);
				},
			},
		],
		[t, tCommon, handleEditClick, handleDelete],
	);

	return (
		<div className="space-y-6">
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h1 className="text-2xl font-bold">{t("maritalStatus.title")}</h1>
					<p className="text-muted-foreground">{t("maritalStatus.subtitle")}</p>
				</div>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>{tCommon("search")}</CardTitle>
					<CardDescription>{t("maritalStatus.searchEmployee")}</CardDescription>
				</CardHeader>
				<CardContent>
					<EmployeeSearch
						onEmployeeFound={handleEmployeeFound}
						onClear={handleEmployeeClear}
						selectedEmployee={selectedEmployee}
					/>
				</CardContent>
			</Card>

			{selectedEmployee && (
				<>
					<div className="flex justify-end">
						<Button onClick={handleAddClick}>
							<Plus className="mr-2 h-4 w-4" />
							{t("maritalStatus.recordChange")}
						</Button>
					</div>

					<div className="grid gap-4 grid-cols-1 md:grid-cols-2">
						<Card>
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="text-sm font-medium">{t("maritalStatus.currentStatus")}</CardTitle>
								<Heart className="h-4 w-4 text-rose-500" />
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">
									{currentStatus?.currentStatus ? (
										<Badge variant={getStatusVariant(currentStatus.currentStatus)} className="text-lg px-3 py-1">
											{t(
												`maritalStatus.statuses.${currentStatus.currentStatus.toUpperCase()}`,
												currentStatus.currentStatus,
											)}
										</Badge>
									) : (
										<span className="text-muted-foreground">{t("maritalStatus.notSet")}</span>
									)}
								</div>
								{currentStatus?.marriageDate && (
									<p className="text-sm text-muted-foreground mt-2">
										{t("maritalStatus.marriedSince")}: {formatDate(currentStatus.marriageDate)}
									</p>
								)}
							</CardContent>
						</Card>
						<Card>
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="text-sm font-medium">{t("maritalStatus.totalChanges")}</CardTitle>
								<History className="h-4 w-4 text-blue-500" />
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">{history?.length ?? 0}</div>
								{currentStatus?.lastChange && (
									<p className="text-sm text-muted-foreground mt-2">
										{t("maritalStatus.lastChange")}: {formatDate(currentStatus.lastChange.effectiveDate)}
									</p>
								)}
							</CardContent>
						</Card>
					</div>

					<Card className="border-amber-500/20 bg-amber-500/5">
						<CardContent className="pt-4">
							<p className="text-sm text-muted-foreground">{t("maritalStatus.note")}</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>{t("maritalStatus.history")}</CardTitle>
						</CardHeader>
						<CardContent>
							{!history?.length && !isLoading ? (
								<p className="text-center text-muted-foreground py-8">{t("maritalStatus.noHistory")}</p>
							) : (
								<DataTable columns={columns} data={history ?? []} isLoading={isLoading} searchColumn="status" />
							)}
						</CardContent>
					</Card>
				</>
			)}

			<Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
				<DialogContent className="sm:max-w-lg">
					<DialogHeader>
						<DialogTitle>{editingRecord ? t("maritalStatus.editRecord") : t("maritalStatus.recordChange")}</DialogTitle>
						<DialogDescription>{t("maritalStatus.recordDescription")}</DialogDescription>
					</DialogHeader>
					<div className="space-y-4">
						<div className="space-y-2">
							<Label>{t("maritalStatus.status")} *</Label>
							<Select value={formState.status} onValueChange={(v) => handleFormChange("status", v)}>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{Object.values(MARITAL_STATUSES).map((status) => (
										<SelectItem key={status} value={status}>
											{t(`maritalStatus.statuses.${status}`, status)}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<div className="space-y-2">
							<Label>{t("maritalStatus.effectiveDate")} *</Label>
							<Input
								type="date"
								value={formState.effectiveDate}
								onChange={(e) => handleFormChange("effectiveDate", e.target.value)}
							/>
						</div>
						<div className="space-y-2">
							<Label>{t("maritalStatus.remarks")}</Label>
							<Textarea
								value={formState.remarks}
								onChange={(e) => handleFormChange("remarks", e.target.value)}
								placeholder={t("maritalStatus.remarksPlaceholder")}
								rows={3}
							/>
						</div>
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={() => setDialogOpen(false)}>
							{tCommon("cancel")}
						</Button>
						<Button onClick={handleSubmit} disabled={createMutation.isPending || updateMutation.isPending}>
							{createMutation.isPending || updateMutation.isPending ? tCommon("saving") : tCommon("save")}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
});

EmployeeMaritalStatusPage.displayName = "EmployeeMaritalStatusPage";
