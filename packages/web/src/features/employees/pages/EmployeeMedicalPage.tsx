import type { ColumnDef } from "@tanstack/react-table";
import { Activity, DollarSign, MoreHorizontal, Pencil, Plus, Trash2, User, Users } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
	useCreateMedicalRecord,
	useDeleteMedicalRecord,
	useUpdateMedicalRecord,
} from "#web/api/employees/employee-medical.mutations.ts";
import {
	useEligibleFamilyMembers,
	useMedicalRecords,
	useMedicalStats,
} from "#web/api/employees/employee-medical.queries.ts";
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
	CreateMedicalRecordRequest,
	MedicalRecord,
	UpdateMedicalRecordRequest,
} from "#web/types/employee-medical.ts";
import { VISIT_TYPES } from "#web/types/employee-medical.ts";

const SELF_VALUE = "SELF";

const formatCurrency = (amount: number | null): string => {
	if (amount === null || amount === undefined) return "-";
	return new Intl.NumberFormat("en-US", { style: "currency", currency: "ETB" }).format(amount);
};

interface FormState {
	beneficiaryType: string;
	familyMemberId: string;
	visitDate: string;
	institutionName: string;
	institutionNameAm: string;
	institutionAddress: string;
	institutionCity: string;
	visitType: string;
	diagnosis: string;
	diagnosisAm: string;
	treatment: string;
	treatmentAm: string;
	prescribedMedication: string;
	doctorName: string;
	totalBillAmount: string;
	amountCovered: string;
	amountPaidByEmployee: string;
	insuranceProvider: string;
	insuranceClaimNumber: string;
	followUpDate: string;
	notes: string;
}

const INITIAL_FORM_STATE: FormState = {
	beneficiaryType: SELF_VALUE,
	familyMemberId: "",
	visitDate: "",
	institutionName: "",
	institutionNameAm: "",
	institutionAddress: "",
	institutionCity: "",
	visitType: VISIT_TYPES.CHECKUP,
	diagnosis: "",
	diagnosisAm: "",
	treatment: "",
	treatmentAm: "",
	prescribedMedication: "",
	doctorName: "",
	totalBillAmount: "",
	amountCovered: "",
	amountPaidByEmployee: "",
	insuranceProvider: "",
	insuranceClaimNumber: "",
	followUpDate: "",
	notes: "",
};

const buildCommonFields = (formState: FormState) => ({
	visitDate: formState.visitDate,
	institutionName: formState.institutionName,
	institutionNameAm: formState.institutionNameAm || undefined,
	institutionAddress: formState.institutionAddress || undefined,
	institutionCity: formState.institutionCity || undefined,
	visitType: formState.visitType || undefined,
	diagnosis: formState.diagnosis || undefined,
	diagnosisAm: formState.diagnosisAm || undefined,
	treatment: formState.treatment || undefined,
	treatmentAm: formState.treatmentAm || undefined,
	prescribedMedication: formState.prescribedMedication || undefined,
	doctorName: formState.doctorName || undefined,
	totalBillAmount: formState.totalBillAmount ? Number.parseFloat(formState.totalBillAmount) : undefined,
	amountCovered: formState.amountCovered ? Number.parseFloat(formState.amountCovered) : undefined,
	amountPaidByEmployee: formState.amountPaidByEmployee ? Number.parseFloat(formState.amountPaidByEmployee) : undefined,
	insuranceProvider: formState.insuranceProvider || undefined,
	insuranceClaimNumber: formState.insuranceClaimNumber || undefined,
	followUpDate: formState.followUpDate || undefined,
	notes: formState.notes || undefined,
});

const buildCreateData = (formState: FormState, employeeId: string): CreateMedicalRecordRequest => ({
	employeeId,
	familyMemberId: formState.beneficiaryType === SELF_VALUE ? undefined : formState.familyMemberId || undefined,
	...buildCommonFields(formState),
});

const buildUpdateData = (formState: FormState): UpdateMedicalRecordRequest => buildCommonFields(formState);

export const EmployeeMedicalPage = React.memo(() => {
	const { t } = useTranslation("employees");
	const { t: tCommon } = useTranslation("common");

	const [selectedEmployee, setSelectedEmployee] = React.useState<Employee | null>(null);
	const [dialogOpen, setDialogOpen] = React.useState(false);
	const [editingRecord, setEditingRecord] = React.useState<MedicalRecord | null>(null);
	const [formState, setFormState] = React.useState<FormState>(INITIAL_FORM_STATE);

	const { data: records, isLoading } = useMedicalRecords(selectedEmployee?.id ?? "");
	const { data: stats } = useMedicalStats(selectedEmployee?.id ?? "");
	const { data: eligibleFamily } = useEligibleFamilyMembers(selectedEmployee?.id ?? "");

	const createMutation = useCreateMedicalRecord();
	const updateMutation = useUpdateMedicalRecord();
	const deleteMutation = useDeleteMedicalRecord();

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

	const handleEditClick = React.useCallback((record: MedicalRecord) => {
		setEditingRecord(record);
		setFormState({
			beneficiaryType: record.isForSelf ? SELF_VALUE : "FAMILY",
			familyMemberId: record.familyMemberId ?? "",
			visitDate: record.visitDate ? record.visitDate.split("T")[0] : "",
			institutionName: record.institutionName ?? "",
			institutionNameAm: record.institutionNameAm ?? "",
			institutionAddress: record.institutionAddress ?? "",
			institutionCity: record.institutionCity ?? "",
			visitType: record.visitType ?? VISIT_TYPES.CHECKUP,
			diagnosis: record.diagnosis ?? "",
			diagnosisAm: record.diagnosisAm ?? "",
			treatment: record.treatment ?? "",
			treatmentAm: record.treatmentAm ?? "",
			prescribedMedication: record.prescribedMedication ?? "",
			doctorName: record.doctorName ?? "",
			totalBillAmount: record.totalBillAmount?.toString() ?? "",
			amountCovered: record.amountCovered?.toString() ?? "",
			amountPaidByEmployee: record.amountPaidByEmployee?.toString() ?? "",
			insuranceProvider: record.insuranceProvider ?? "",
			insuranceClaimNumber: record.insuranceClaimNumber ?? "",
			followUpDate: record.followUpDate ? record.followUpDate.split("T")[0] : "",
			notes: record.notes ?? "",
		});
		setDialogOpen(true);
	}, []);

	const handleDelete = React.useCallback(
		(record: MedicalRecord) => {
			if (!globalThis.confirm(t("medical.deleteConfirm"))) return;

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
		if (!formState.visitDate || !formState.institutionName.trim() || !selectedEmployee) {
			toast.error(tCommon("fillRequired"));
			return;
		}

		const mutationCallbacks = {
			onSuccess: () => {
				toast.success(tCommon("success"));
				setDialogOpen(false);
			},
			onError: () => {
				toast.error(tCommon("error"));
			},
		};

		if (editingRecord) {
			updateMutation.mutate({ id: editingRecord.id, data: buildUpdateData(formState) }, mutationCallbacks);
		} else {
			createMutation.mutate(buildCreateData(formState, selectedEmployee.id), mutationCallbacks);
		}
	}, [formState, editingRecord, selectedEmployee, createMutation, updateMutation, tCommon]);

	const columns = React.useMemo<ColumnDef<MedicalRecord>[]>(
		() => [
			{
				accessorKey: "visitDate",
				header: t("medical.visitDate"),
				cell: ({ row }) => formatDate(row.getValue("visitDate")),
			},
			{
				id: "beneficiary",
				header: t("medical.beneficiary"),
				cell: ({ row }) => {
					const record = row.original;
					if (record.isForSelf) {
						return (
							<Badge variant="outline">
								<User className="mr-1 h-3 w-3" />
								{t("medical.self")}
							</Badge>
						);
					}
					return (
						<Badge variant="secondary">
							<Users className="mr-1 h-3 w-3" />
							{record.familyMember?.fullName ?? "-"}
						</Badge>
					);
				},
			},
			{
				accessorKey: "institutionName",
				header: t("medical.institution"),
				cell: ({ row }) => <span className="font-medium">{row.getValue("institutionName")}</span>,
			},
			{
				accessorKey: "visitType",
				header: t("medical.visitType"),
				cell: ({ row }) => {
					const type = row.getValue("visitType") as string | null;
					return type ? <Badge variant="outline">{t(`medical.visitTypes.${type}`, type)}</Badge> : "-";
				},
			},
			{
				accessorKey: "totalBillAmount",
				header: t("medical.totalBill"),
				cell: ({ row }) => formatCurrency(row.getValue("totalBillAmount")),
			},
			{
				accessorKey: "amountCovered",
				header: t("medical.amountCovered"),
				cell: ({ row }) => {
					const amount = row.getValue("amountCovered") as number | null;
					return amount ? <span className="text-green-600 font-medium">{formatCurrency(amount)}</span> : "-";
				},
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
					<h1 className="text-2xl font-bold">{t("medical.title")}</h1>
					<p className="text-muted-foreground">{t("medical.subtitle")}</p>
				</div>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>{tCommon("search")}</CardTitle>
					<CardDescription>{t("medical.searchEmployee")}</CardDescription>
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
							{t("medical.addRecord")}
						</Button>
					</div>

					<div className="grid gap-4 grid-cols-2 md:grid-cols-4">
						<Card>
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="text-sm font-medium">{t("medical.totalRecords")}</CardTitle>
								<Activity className="h-4 w-4 text-muted-foreground" />
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">{stats?.totalRecords ?? 0}</div>
							</CardContent>
						</Card>
						<Card>
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="text-sm font-medium">{t("medical.selfRecords")}</CardTitle>
								<User className="h-4 w-4 text-blue-500" />
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">{stats?.selfRecords ?? 0}</div>
							</CardContent>
						</Card>
						<Card>
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="text-sm font-medium">{t("medical.familyRecords")}</CardTitle>
								<Users className="h-4 w-4 text-purple-500" />
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">{stats?.familyRecords ?? 0}</div>
							</CardContent>
						</Card>
						<Card>
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="text-sm font-medium">{t("medical.totalCovered")}</CardTitle>
								<DollarSign className="h-4 w-4 text-green-500" />
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold text-green-600">
									{formatCurrency(stats?.totalAmountCovered ?? 0)}
								</div>
							</CardContent>
						</Card>
					</div>

					<Card className="border-blue-500/20 bg-blue-500/5">
						<CardContent className="pt-4">
							<p className="text-sm text-muted-foreground">
								{t("medical.eligibilityNote", {
									eligible: stats?.eligibleMembers ?? 0,
									total: stats?.totalFamilyMembers ?? 0,
								})}
							</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>{t("medical.records")}</CardTitle>
						</CardHeader>
						<CardContent>
							{!records?.length && !isLoading ? (
								<p className="text-center text-muted-foreground py-8">{t("medical.noRecords")}</p>
							) : (
								<DataTable
									columns={columns}
									data={records ?? []}
									isLoading={isLoading}
									searchColumn="institutionName"
								/>
							)}
						</CardContent>
					</Card>
				</>
			)}

			<Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
				<DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle>{editingRecord ? t("medical.editRecord") : t("medical.addRecord")}</DialogTitle>
						<DialogDescription>{t("medical.recordDescription")}</DialogDescription>
					</DialogHeader>
					<div className="space-y-6">
						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label>{t("medical.beneficiary")} *</Label>
								<Select
									value={formState.beneficiaryType}
									onValueChange={(v) => {
										handleFormChange("beneficiaryType", v);
										if (v === SELF_VALUE) {
											handleFormChange("familyMemberId", "");
										}
									}}
									disabled={!!editingRecord}
								>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value={SELF_VALUE}>{t("medical.self")}</SelectItem>
										<SelectItem value="FAMILY">{t("medical.familyMember")}</SelectItem>
									</SelectContent>
								</Select>
							</div>
							{formState.beneficiaryType !== SELF_VALUE && (
								<div className="space-y-2">
									<Label>{t("medical.selectFamily")} *</Label>
									<Select
										value={formState.familyMemberId}
										onValueChange={(v) => handleFormChange("familyMemberId", v)}
										disabled={!!editingRecord}
									>
										<SelectTrigger>
											<SelectValue placeholder={t("medical.selectFamilyPlaceholder")} />
										</SelectTrigger>
										<SelectContent>
											{eligibleFamily?.map((member) => (
												<SelectItem key={member.id} value={member.id}>
													{member.fullName} ({t(`family.relationships.${member.relationship}`, member.relationship)})
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
							)}
						</div>

						<div className="border-t pt-4">
							<h4 className="font-medium mb-4">{t("medical.visitInfo")}</h4>
							<div className="grid grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label>{t("medical.visitDate")} *</Label>
									<Input
										type="date"
										value={formState.visitDate}
										onChange={(e) => handleFormChange("visitDate", e.target.value)}
									/>
								</div>
								<div className="space-y-2">
									<Label>{t("medical.visitType")}</Label>
									<Select value={formState.visitType} onValueChange={(v) => handleFormChange("visitType", v)}>
										<SelectTrigger>
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											{Object.values(VISIT_TYPES).map((type) => (
												<SelectItem key={type} value={type}>
													{t(`medical.visitTypes.${type}`, type)}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
							</div>
						</div>

						<div className="border-t pt-4">
							<h4 className="font-medium mb-4">{t("medical.institutionInfo")}</h4>
							<div className="grid grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label>{t("medical.institutionName")} *</Label>
									<Input
										value={formState.institutionName}
										onChange={(e) => handleFormChange("institutionName", e.target.value)}
										placeholder={t("medical.institutionNamePlaceholder")}
									/>
								</div>
								<div className="space-y-2">
									<Label>{t("medical.institutionNameAm")}</Label>
									<Input
										value={formState.institutionNameAm}
										onChange={(e) => handleFormChange("institutionNameAm", e.target.value)}
									/>
								</div>
								<div className="space-y-2">
									<Label>{t("medical.institutionCity")}</Label>
									<Input
										value={formState.institutionCity}
										onChange={(e) => handleFormChange("institutionCity", e.target.value)}
									/>
								</div>
								<div className="space-y-2">
									<Label>{t("medical.doctorName")}</Label>
									<Input
										value={formState.doctorName}
										onChange={(e) => handleFormChange("doctorName", e.target.value)}
									/>
								</div>
							</div>
							<div className="mt-4 space-y-2">
								<Label>{t("medical.institutionAddress")}</Label>
								<Input
									value={formState.institutionAddress}
									onChange={(e) => handleFormChange("institutionAddress", e.target.value)}
								/>
							</div>
						</div>

						<div className="border-t pt-4">
							<h4 className="font-medium mb-4">{t("medical.medicalDetails")}</h4>
							<div className="grid grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label>{t("medical.diagnosis")}</Label>
									<Textarea
										value={formState.diagnosis}
										onChange={(e) => handleFormChange("diagnosis", e.target.value)}
										rows={2}
									/>
								</div>
								<div className="space-y-2">
									<Label>{t("medical.diagnosisAm")}</Label>
									<Textarea
										value={formState.diagnosisAm}
										onChange={(e) => handleFormChange("diagnosisAm", e.target.value)}
										rows={2}
									/>
								</div>
								<div className="space-y-2">
									<Label>{t("medical.treatment")}</Label>
									<Textarea
										value={formState.treatment}
										onChange={(e) => handleFormChange("treatment", e.target.value)}
										rows={2}
									/>
								</div>
								<div className="space-y-2">
									<Label>{t("medical.prescribedMedication")}</Label>
									<Textarea
										value={formState.prescribedMedication}
										onChange={(e) => handleFormChange("prescribedMedication", e.target.value)}
										rows={2}
									/>
								</div>
							</div>
						</div>

						<div className="border-t pt-4">
							<h4 className="font-medium mb-4">{t("medical.insuranceInfo")}</h4>
							<div className="grid grid-cols-3 gap-4">
								<div className="space-y-2">
									<Label>{t("medical.totalBillAmount")}</Label>
									<Input
										type="number"
										value={formState.totalBillAmount}
										onChange={(e) => handleFormChange("totalBillAmount", e.target.value)}
										placeholder="0.00"
									/>
								</div>
								<div className="space-y-2">
									<Label>{t("medical.amountCovered")}</Label>
									<Input
										type="number"
										value={formState.amountCovered}
										onChange={(e) => handleFormChange("amountCovered", e.target.value)}
										placeholder="0.00"
									/>
								</div>
								<div className="space-y-2">
									<Label>{t("medical.amountPaidByEmployee")}</Label>
									<Input
										type="number"
										value={formState.amountPaidByEmployee}
										onChange={(e) => handleFormChange("amountPaidByEmployee", e.target.value)}
										placeholder="0.00"
									/>
								</div>
							</div>
							<div className="grid grid-cols-2 gap-4 mt-4">
								<div className="space-y-2">
									<Label>{t("medical.insuranceProvider")}</Label>
									<Input
										value={formState.insuranceProvider}
										onChange={(e) => handleFormChange("insuranceProvider", e.target.value)}
									/>
								</div>
								<div className="space-y-2">
									<Label>{t("medical.insuranceClaimNumber")}</Label>
									<Input
										value={formState.insuranceClaimNumber}
										onChange={(e) => handleFormChange("insuranceClaimNumber", e.target.value)}
									/>
								</div>
							</div>
						</div>

						<div className="border-t pt-4">
							<div className="grid grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label>{t("medical.followUpDate")}</Label>
									<Input
										type="date"
										value={formState.followUpDate}
										onChange={(e) => handleFormChange("followUpDate", e.target.value)}
									/>
								</div>
							</div>
							<div className="mt-4 space-y-2">
								<Label>{t("medical.notes")}</Label>
								<Textarea
									value={formState.notes}
									onChange={(e) => handleFormChange("notes", e.target.value)}
									rows={3}
								/>
							</div>
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

EmployeeMedicalPage.displayName = "EmployeeMedicalPage";
