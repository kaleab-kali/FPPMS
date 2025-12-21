import { ArrowRight, Building2, MapPin, Send } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useCenters } from "#web/api/centers/centers.queries.ts";
import { useDepartments } from "#web/api/departments/departments.queries.ts";
import { useInternalTransfer } from "#web/api/employees/employee-transfer.mutations.ts";
import { usePositions } from "#web/api/positions/positions.queries.ts";
import { EmployeeSearch } from "#web/components/common/EmployeeSearch.tsx";
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
import { Input } from "#web/components/ui/input.tsx";
import { Label } from "#web/components/ui/label.tsx";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "#web/components/ui/select.tsx";
import { Textarea } from "#web/components/ui/textarea.tsx";
import type { Employee } from "#web/types/employee.ts";
import type { InternalTransferRequest } from "#web/types/employee-transfer.ts";

interface InternalFormState {
	targetCenterId: string;
	targetDepartmentId: string;
	targetPositionId: string;
	effectiveDate: string;
	transferReason: string;
	remarks: string;
}

const INITIAL_INTERNAL_FORM: InternalFormState = {
	targetCenterId: "",
	targetDepartmentId: "",
	targetPositionId: "",
	effectiveDate: "",
	transferReason: "",
	remarks: "",
};

export const EmployeeTransferPage = React.memo(
	() => {
		const { t } = useTranslation("employees");
		const { t: tCommon } = useTranslation("common");
		const { i18n } = useTranslation();
		const isAmharic = i18n.language === "am";

		const [selectedEmployee, setSelectedEmployee] = React.useState<Employee | null>(null);
		const [internalDialogOpen, setInternalDialogOpen] = React.useState(false);
		const [internalForm, setInternalForm] = React.useState<InternalFormState>(INITIAL_INTERNAL_FORM);

		const { data: centersData } = useCenters();
		const { data: departmentsData } = useDepartments(internalForm.targetCenterId);
		const { data: positionsData } = usePositions(internalForm.targetDepartmentId);

		const internalTransferMutation = useInternalTransfer();

		const centers = React.useMemo(() => centersData ?? [], [centersData]);
		const departments = React.useMemo(() => departmentsData ?? [], [departmentsData]);
		const positions = React.useMemo(() => positionsData ?? [], [positionsData]);

		const handleEmployeeFound = React.useCallback((employee: Employee) => {
			setSelectedEmployee(employee);
		}, []);

		const handleEmployeeClear = React.useCallback(() => {
			setSelectedEmployee(null);
		}, []);

		const handleInternalDialogOpen = React.useCallback(() => {
			setInternalForm(INITIAL_INTERNAL_FORM);
			setInternalDialogOpen(true);
		}, []);

		const handleInternalFormChange = React.useCallback((field: keyof InternalFormState, value: string) => {
			setInternalForm((prev) => {
				const newState = { ...prev, [field]: value };
				if (field === "targetCenterId") {
					newState.targetDepartmentId = "";
					newState.targetPositionId = "";
				}
				if (field === "targetDepartmentId") {
					newState.targetPositionId = "";
				}
				return newState;
			});
		}, []);

		const handleInternalSubmit = React.useCallback(() => {
			if (!selectedEmployee) {
				toast.error(tCommon("fillRequired"));
				return;
			}

			if (!internalForm.targetCenterId || !internalForm.effectiveDate || !internalForm.transferReason) {
				toast.error(tCommon("fillRequired"));
				return;
			}

			const data: InternalTransferRequest = {
				employeeId: selectedEmployee.id,
				targetCenterId: internalForm.targetCenterId,
				targetDepartmentId: internalForm.targetDepartmentId || undefined,
				targetPositionId: internalForm.targetPositionId || undefined,
				effectiveDate: internalForm.effectiveDate,
				transferReason: internalForm.transferReason,
				remarks: internalForm.remarks || undefined,
			};

			internalTransferMutation.mutate(data, {
				onSuccess: () => {
					toast.success(tCommon("success"));
					setInternalDialogOpen(false);
					setSelectedEmployee(null);
				},
				onError: () => {
					toast.error(tCommon("error"));
				},
			});
		}, [internalForm, selectedEmployee, internalTransferMutation, tCommon]);

		const currentAssignmentDisplay = React.useMemo(() => {
			if (!selectedEmployee) return null;

			return (
				<Card className="border-muted">
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-medium">{t("transfer.currentAssignment")}</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="grid gap-2 text-sm">
							<div className="flex justify-between">
								<span className="text-muted-foreground">{t("center")}:</span>
								<span className="font-medium">{selectedEmployee.centerName ?? "-"}</span>
							</div>
							<div className="flex justify-between">
								<span className="text-muted-foreground">{t("department")}:</span>
								<span className="font-medium">{selectedEmployee.departmentName ?? "-"}</span>
							</div>
							<div className="flex justify-between">
								<span className="text-muted-foreground">{t("position")}:</span>
								<span className="font-medium">{selectedEmployee.positionName ?? "-"}</span>
							</div>
						</div>
					</CardContent>
				</Card>
			);
		}, [selectedEmployee, t]);

		return (
			<div className="space-y-6">
				<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
					<div>
						<h1 className="text-2xl font-bold">{t("transfer.title")}</h1>
						<p className="text-muted-foreground">{t("transfer.subtitle")}</p>
					</div>
				</div>

				<Card>
					<CardHeader>
						<CardTitle>{tCommon("search")}</CardTitle>
						<CardDescription>{t("transfer.subtitle")}</CardDescription>
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
						{currentAssignmentDisplay}

						<div className="flex justify-end">
							<Button onClick={handleInternalDialogOpen}>
								<Send className="mr-2 h-4 w-4" />
								{t("transfer.internalTransfer")}
							</Button>
						</div>
					</>
				)}

				<Dialog open={internalDialogOpen} onOpenChange={setInternalDialogOpen}>
					<DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
						<DialogHeader>
							<DialogTitle>{t("transfer.internalTransfer")}</DialogTitle>
							<DialogDescription>{t("transfer.subtitle")}</DialogDescription>
						</DialogHeader>
						<div className="space-y-4">
							<div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
								<Building2 className="h-4 w-4 text-muted-foreground" />
								<ArrowRight className="h-4 w-4 text-muted-foreground" />
								<MapPin className="h-4 w-4 text-muted-foreground" />
								<span className="text-sm text-muted-foreground">
									{selectedEmployee?.centerName ?? "-"} {"->"} ?
								</span>
							</div>
							<div className="space-y-2">
								<Label>{t("transfer.targetCenter")} *</Label>
								<Select
									value={internalForm.targetCenterId}
									onValueChange={(v) => handleInternalFormChange("targetCenterId", v)}
								>
									<SelectTrigger>
										<SelectValue placeholder={t("selectCenter")} />
									</SelectTrigger>
									<SelectContent>
										{centers.map((center) => (
											<SelectItem key={center.id} value={center.id}>
												{isAmharic && center.nameAm ? center.nameAm : center.name}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
							{internalForm.targetCenterId && (
								<div className="space-y-2">
									<Label>{t("transfer.targetDepartment")}</Label>
									<Select
										value={internalForm.targetDepartmentId}
										onValueChange={(v) => handleInternalFormChange("targetDepartmentId", v)}
									>
										<SelectTrigger>
											<SelectValue placeholder={t("selectDepartment")} />
										</SelectTrigger>
										<SelectContent>
											{departments.map((dept) => (
												<SelectItem key={dept.id} value={dept.id}>
													{isAmharic && dept.nameAm ? dept.nameAm : dept.name}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
							)}
							{internalForm.targetDepartmentId && (
								<div className="space-y-2">
									<Label>{t("transfer.targetPosition")}</Label>
									<Select
										value={internalForm.targetPositionId}
										onValueChange={(v) => handleInternalFormChange("targetPositionId", v)}
									>
										<SelectTrigger>
											<SelectValue placeholder={t("selectPosition")} />
										</SelectTrigger>
										<SelectContent>
											{positions.map((pos) => (
												<SelectItem key={pos.id} value={pos.id}>
													{isAmharic && pos.nameAm ? pos.nameAm : pos.name}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
							)}
							<div className="space-y-2">
								<Label>{t("transfer.effectiveDate")} *</Label>
								<Input
									type="date"
									value={internalForm.effectiveDate}
									onChange={(e) => handleInternalFormChange("effectiveDate", e.target.value)}
								/>
							</div>
							<div className="space-y-2">
								<Label>{t("transfer.transferReason")} *</Label>
								<Textarea
									value={internalForm.transferReason}
									onChange={(e) => handleInternalFormChange("transferReason", e.target.value)}
									placeholder={t("transfer.transferReason")}
									rows={2}
								/>
							</div>
							<div className="space-y-2">
								<Label>{t("transfer.remarks")}</Label>
								<Textarea
									value={internalForm.remarks}
									onChange={(e) => handleInternalFormChange("remarks", e.target.value)}
									placeholder={t("transfer.remarks")}
									rows={2}
								/>
							</div>
						</div>
						<DialogFooter>
							<Button variant="outline" onClick={() => setInternalDialogOpen(false)}>
								{tCommon("cancel")}
							</Button>
							<Button onClick={handleInternalSubmit} disabled={internalTransferMutation.isPending}>
								{internalTransferMutation.isPending ? tCommon("saving") : t("transfer.transferEmployee")}
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			</div>
		);
	},
	() => true,
);

EmployeeTransferPage.displayName = "EmployeeTransferPage";
