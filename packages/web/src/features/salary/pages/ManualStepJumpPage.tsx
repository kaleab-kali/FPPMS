import { ArrowLeft, ArrowRight } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useProcessManualJump } from "#web/api/salary-management/salary-management.mutations.ts";
import { useRankSalarySteps } from "#web/api/salary-management/salary-management.queries.ts";
import { EmployeeSearch } from "#web/components/common/EmployeeSearch.tsx";
import { LoadingSpinner } from "#web/components/common/LoadingSpinner.tsx";
import { Button } from "#web/components/ui/button.tsx";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "#web/components/ui/card.tsx";
import { Input } from "#web/components/ui/input.tsx";
import { Label } from "#web/components/ui/label.tsx";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "#web/components/ui/select.tsx";
import { Textarea } from "#web/components/ui/textarea.tsx";
import type { Employee } from "#web/types/employee.ts";

const formatCurrency = (value: string | number | undefined | null): string => {
	if (value === undefined || value === null) return "-";
	const num = typeof value === "string" ? Number.parseFloat(value) : value;
	return new Intl.NumberFormat("en-ET", { style: "currency", currency: "ETB" }).format(num);
};

export const ManualStepJumpPage = React.memo(() => {
	const { t } = useTranslation("salary-management");
	const { t: tCommon } = useTranslation("common");
	const { i18n } = useTranslation();
	const navigate = useNavigate();
	const isAmharic = i18n.language === "am";

	const [selectedEmployee, setSelectedEmployee] = React.useState<Employee | null>(null);
	const [targetStep, setTargetStep] = React.useState<number | "">("");
	const [orderReference, setOrderReference] = React.useState("");
	const [reason, setReason] = React.useState("");
	const [effectiveDate, setEffectiveDate] = React.useState("");
	const [documentPath, setDocumentPath] = React.useState("");
	const [notes, setNotes] = React.useState("");

	const { data: rankSteps, isLoading: isLoadingSteps } = useRankSalarySteps(
		selectedEmployee?.rankId ?? "",
		!!selectedEmployee?.rankId,
	);

	const processJumpMutation = useProcessManualJump();

	const handleEmployeeFound = React.useCallback((employee: Employee) => {
		setSelectedEmployee(employee);
		setTargetStep("");
	}, []);

	const handleEmployeeClear = React.useCallback(() => {
		setSelectedEmployee(null);
		setTargetStep("");
	}, []);

	const currentStep = selectedEmployee?.currentSalaryStep ?? 0;
	const currentSalary = rankSteps?.steps?.find((s) => s.stepNumber === currentStep)?.salaryAmount;
	const newSalary = rankSteps?.steps?.find((s) => s.stepNumber === targetStep)?.salaryAmount;

	const handleSubmit = React.useCallback(
		(e: React.FormEvent) => {
			e.preventDefault();

			if (!selectedEmployee) {
				toast.error(t("manualJump.validation.employeeRequired"));
				return;
			}
			if (targetStep === "" || targetStep === undefined) {
				toast.error(t("manualJump.validation.stepRequired"));
				return;
			}
			if (!orderReference.trim()) {
				toast.error(t("manualJump.validation.orderRequired"));
				return;
			}
			if (!reason.trim()) {
				toast.error(t("manualJump.validation.reasonRequired"));
				return;
			}
			if (!effectiveDate) {
				toast.error(t("manualJump.validation.dateRequired"));
				return;
			}

			processJumpMutation.mutate(
				{
					employeeId: selectedEmployee.id,
					toStep: Number(targetStep),
					orderReference,
					reason,
					effectiveDate,
					documentPath: documentPath || undefined,
					notes: notes || undefined,
				},
				{
					onSuccess: () => {
						toast.success(t("manualJump.success"));
						navigate("/salary/eligibility");
					},
					onError: () => {
						toast.error(tCommon("error"));
					},
				},
			);
		},
		[
			selectedEmployee,
			targetStep,
			orderReference,
			reason,
			effectiveDate,
			documentPath,
			notes,
			processJumpMutation,
			t,
			tCommon,
			navigate,
		],
	);

	return (
		<div className="container mx-auto p-6 space-y-6">
			<div className="flex items-center gap-4">
				<Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
					<ArrowLeft className="h-4 w-4" />
				</Button>
				<div>
					<h1 className="text-2xl font-bold">{t("manualJump.title")}</h1>
					<p className="text-muted-foreground">{t("manualJump.description")}</p>
				</div>
			</div>

			<form onSubmit={handleSubmit}>
				<div className="grid gap-6 lg:grid-cols-2">
					{/* Employee Selection */}
					<Card>
						<CardHeader>
							<CardTitle>{t("manualJump.selectEmployee")}</CardTitle>
							<CardDescription>{t("manualJump.searchEmployee")}</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<EmployeeSearch
								selectedEmployee={selectedEmployee}
								onEmployeeFound={handleEmployeeFound}
								onClear={handleEmployeeClear}
							/>

							{selectedEmployee && (
								<div className="p-4 border rounded-lg bg-muted/50 space-y-2">
									<div className="font-medium">
										{isAmharic ? selectedEmployee.fullNameAm : selectedEmployee.fullName}
									</div>
									<div className="text-sm text-muted-foreground">{selectedEmployee.employeeId}</div>
									<div className="text-sm">
										<span className="text-muted-foreground">{t("eligibility.rank")}:</span>{" "}
										{isAmharic && selectedEmployee.rankName ? selectedEmployee.rankName : selectedEmployee.rankName}
									</div>
									<div className="text-sm">
										<span className="text-muted-foreground">{t("eligibility.currentStep")}:</span>{" "}
										{selectedEmployee.currentSalaryStep}
									</div>
								</div>
							)}
						</CardContent>
					</Card>

					{/* Step Selection */}
					<Card>
						<CardHeader>
							<CardTitle>{t("manualJump.targetStep")}</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							{isLoadingSteps && selectedEmployee ? (
								<LoadingSpinner />
							) : rankSteps ? (
								<>
									<Select
										value={targetStep === "" ? "" : String(targetStep)}
										onValueChange={(value) => setTargetStep(value ? Number(value) : "")}
									>
										<SelectTrigger>
											<SelectValue placeholder={t("manualJump.targetStep")} />
										</SelectTrigger>
										<SelectContent>
											{rankSteps.steps?.map((step) => (
												<SelectItem
													key={step.stepNumber}
													value={String(step.stepNumber)}
													disabled={step.stepNumber === currentStep}
												>
													{t("common.step", { number: step.stepNumber })} - {formatCurrency(step.salaryAmount)}
												</SelectItem>
											))}
										</SelectContent>
									</Select>

									{/* Comparison */}
									{targetStep !== "" && (
										<div className="grid grid-cols-3 gap-4 p-4 border rounded-lg">
											<div className="text-center">
												<div className="text-sm text-muted-foreground">{t("manualJump.currentInfo")}</div>
												<div className="text-lg font-bold">{t("common.step", { number: currentStep })}</div>
												<div className="text-sm">{formatCurrency(currentSalary)}</div>
											</div>
											<div className="flex items-center justify-center">
												<ArrowRight className="h-6 w-6 text-muted-foreground" />
											</div>
											<div className="text-center">
												<div className="text-sm text-muted-foreground">{t("manualJump.newInfo")}</div>
												<div className="text-lg font-bold text-green-600">
													{t("common.step", { number: targetStep })}
												</div>
												<div className="text-sm text-green-600">{formatCurrency(newSalary)}</div>
											</div>
										</div>
									)}
								</>
							) : (
								<div className="text-center text-muted-foreground py-8">{t("manualJump.selectEmployee")}</div>
							)}
						</CardContent>
					</Card>

					{/* Order Details */}
					<Card className="lg:col-span-2">
						<CardHeader>
							<CardTitle>{t("manualJump.orderReference")}</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="grid gap-4 md:grid-cols-2">
								<div>
									<Label>{t("manualJump.orderReference")} *</Label>
									<Input
										value={orderReference}
										onChange={(e) => setOrderReference(e.target.value)}
										placeholder={t("manualJump.orderReferencePlaceholder")}
										required
									/>
								</div>
								<div>
									<Label>{t("manualJump.effectiveDate")} *</Label>
									<Input
										type="date"
										value={effectiveDate}
										onChange={(e) => setEffectiveDate(e.target.value)}
										required
									/>
								</div>
								<div className="md:col-span-2">
									<Label>{t("manualJump.reason")} *</Label>
									<Textarea
										value={reason}
										onChange={(e) => setReason(e.target.value)}
										placeholder={t("manualJump.reasonPlaceholder")}
										required
									/>
								</div>
								<div>
									<Label>{t("manualJump.documentPath")}</Label>
									<Input
										value={documentPath}
										onChange={(e) => setDocumentPath(e.target.value)}
										placeholder={t("manualJump.documentPathPlaceholder")}
									/>
								</div>
								<div>
									<Label>{t("manualJump.notes")}</Label>
									<Textarea
										value={notes}
										onChange={(e) => setNotes(e.target.value)}
										placeholder={t("manualJump.notesPlaceholder")}
									/>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>

				<div className="flex justify-end gap-4 mt-6">
					<Button type="button" variant="outline" onClick={() => navigate(-1)}>
						{t("common.cancel")}
					</Button>
					<Button type="submit" disabled={processJumpMutation.isPending}>
						{t("manualJump.submit")}
					</Button>
				</div>
			</form>
		</div>
	);
});

ManualStepJumpPage.displayName = "ManualStepJumpPage";
