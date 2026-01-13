import { DollarSign, ExternalLink, TrendingUp } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useActiveSalaryScale, useRankSalary } from "#web/api/salary-scale/salary-scale.queries.ts";
import { Badge } from "#web/components/ui/badge.tsx";
import { Button } from "#web/components/ui/button.tsx";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "#web/components/ui/card.tsx";
import { Progress } from "#web/components/ui/progress.tsx";
import { Skeleton } from "#web/components/ui/skeleton.tsx";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "#web/components/ui/table.tsx";
import type { Employee } from "#web/types/employee.ts";

interface EmployeeSalaryTabProps {
	employee: Employee;
	isAmharic: boolean;
}

export const EmployeeSalaryTab = React.memo(
	({ employee, isAmharic }: EmployeeSalaryTabProps) => {
		const { t } = useTranslation("salary-scale");
		const { t: tEmployees } = useTranslation("employees");
		const navigate = useNavigate();

		const { data: activeSalaryScale, isLoading: isLoadingScale } = useActiveSalaryScale();
		const { data: rankSalary, isLoading: isLoadingRankSalary } = useRankSalary(
			activeSalaryScale?.id ?? "",
			employee.rankCode ?? "",
		);

		const formatCurrency = React.useCallback((amount: string | number | undefined) => {
			if (!amount) return "-";
			return Number(amount).toLocaleString("en-ET", {
				style: "currency",
				currency: "ETB",
				minimumFractionDigits: 2,
			});
		}, []);

		const handleViewSalaryScale = React.useCallback(() => {
			if (activeSalaryScale) {
				navigate(`/salary/scale/${activeSalaryScale.id}`);
			}
		}, [activeSalaryScale, navigate]);

		const currentStep = employee.currentSalaryStep ?? 0;
		const totalSteps = rankSalary?.salarySteps?.length ?? 9;
		const progressPercentage = totalSteps > 0 ? (currentStep / totalSteps) * 100 : 0;

		const currentStepSalary = React.useMemo(() => {
			if (!rankSalary?.salarySteps) return null;
			const step = rankSalary.salarySteps.find((s) => s.stepNumber === currentStep);
			return step?.salaryAmount;
		}, [rankSalary, currentStep]);

		const nextStepSalary = React.useMemo(() => {
			if (!rankSalary?.salarySteps) return null;
			const nextStep = rankSalary.salarySteps.find((s) => s.stepNumber === currentStep + 1);
			return nextStep?.salaryAmount;
		}, [rankSalary, currentStep]);

		const yearsToNextStep = React.useMemo(() => {
			if (!rankSalary?.salarySteps) return null;
			const nextStep = rankSalary.salarySteps.find((s) => s.stepNumber === currentStep + 1);
			if (!nextStep) return null;
			const currentStepData = rankSalary.salarySteps.find((s) => s.stepNumber === currentStep);
			if (!currentStepData) return nextStep.yearsRequired;
			return nextStep.yearsRequired - currentStepData.yearsRequired;
		}, [rankSalary, currentStep]);

		if (isLoadingScale || isLoadingRankSalary) {
			return (
				<div className="space-y-4">
					<Skeleton className="h-32" />
					<Skeleton className="h-48" />
				</div>
			);
		}

		if (!activeSalaryScale) {
			return (
				<div className="flex flex-col items-center justify-center py-16 text-center">
					<DollarSign className="h-12 w-12 text-muted-foreground mb-4" />
					<h3 className="text-lg font-semibold mb-2">{t("noActiveScale")}</h3>
					<p className="text-muted-foreground text-sm max-w-md mb-4">{t("noActiveScaleDescription")}</p>
					<Button variant="outline" onClick={() => navigate("/salary/scale")}>
						<ExternalLink className="mr-2 h-4 w-4" />
						{t("viewSalaryScales")}
					</Button>
				</div>
			);
		}

		if (!employee.rankCode) {
			return (
				<div className="flex flex-col items-center justify-center py-16 text-center">
					<TrendingUp className="h-12 w-12 text-muted-foreground mb-4" />
					<h3 className="text-lg font-semibold mb-2">{tEmployees("noRankAssigned")}</h3>
					<p className="text-muted-foreground text-sm max-w-md">{tEmployees("noRankAssignedDescription")}</p>
				</div>
			);
		}

		if (!rankSalary) {
			return (
				<div className="flex flex-col items-center justify-center py-16 text-center">
					<DollarSign className="h-12 w-12 text-muted-foreground mb-4" />
					<h3 className="text-lg font-semibold mb-2">{t("rankNotInScale")}</h3>
					<p className="text-muted-foreground text-sm max-w-md mb-4">
						{t("rankNotInScaleDescription", { rankCode: employee.rankCode })}
					</p>
					<Button variant="outline" onClick={handleViewSalaryScale}>
						<ExternalLink className="mr-2 h-4 w-4" />
						{t("viewSalaryScale")}
					</Button>
				</div>
			);
		}

		const scaleDisplayName = isAmharic && activeSalaryScale.nameAm ? activeSalaryScale.nameAm : activeSalaryScale.name;
		const rankDisplayName = isAmharic && rankSalary.rankNameAm ? rankSalary.rankNameAm : rankSalary.rankName;

		return (
			<div className="space-y-6">
				<div className="grid gap-4 md:grid-cols-3">
					<Card>
						<CardHeader className="pb-2">
							<CardDescription>{t("currentSalary")}</CardDescription>
							<CardTitle className="text-2xl">{formatCurrency(currentStepSalary ?? employee.currentSalary)}</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="flex items-center gap-2">
								<Badge variant="outline">
									{t("stepNumber")} {currentStep}
								</Badge>
								<span className="text-sm text-muted-foreground">
									of {totalSteps} {t("salarySteps").toLowerCase()}
								</span>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="pb-2">
							<CardDescription>{t("salaryRange")}</CardDescription>
							<CardTitle className="text-lg">
								{formatCurrency(rankSalary.baseSalary)} - {formatCurrency(rankSalary.ceilingSalary)}
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="space-y-2">
								<Progress value={progressPercentage} className="h-2" />
								<p className="text-xs text-muted-foreground">
									{progressPercentage.toFixed(0)}% {t("ofMaxSalary")}
								</p>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="pb-2">
							<CardDescription>{t("nextStepSalary")}</CardDescription>
							<CardTitle className="text-2xl">
								{nextStepSalary ? formatCurrency(nextStepSalary) : t("atMaxStep")}
							</CardTitle>
						</CardHeader>
						<CardContent>
							{yearsToNextStep ? (
								<p className="text-sm text-muted-foreground">{t("yearsToNextStep", { years: yearsToNextStep })}</p>
							) : (
								<p className="text-sm text-muted-foreground">{t("noNextStep")}</p>
							)}
						</CardContent>
					</Card>
				</div>

				<div className="grid gap-4 md:grid-cols-2">
					<Card>
						<CardHeader>
							<div className="flex items-center justify-between">
								<div>
									<CardTitle>{t("rankSalaryConfig")}</CardTitle>
									<CardDescription>{rankDisplayName}</CardDescription>
								</div>
								<Badge>{rankSalary.category}</Badge>
							</div>
						</CardHeader>
						<CardContent>
							<div className="grid grid-cols-2 gap-4 text-sm">
								<div>
									<p className="text-muted-foreground">{t("rankCode")}</p>
									<p className="font-medium">{rankSalary.rankCode}</p>
								</div>
								<div>
									<p className="text-muted-foreground">{t("level")}</p>
									<p className="font-medium">{rankSalary.level}</p>
								</div>
								<div>
									<p className="text-muted-foreground">{t("baseSalary")}</p>
									<p className="font-medium">{formatCurrency(rankSalary.baseSalary)}</p>
								</div>
								<div>
									<p className="text-muted-foreground">{t("ceilingSalary")}</p>
									<p className="font-medium">{formatCurrency(rankSalary.ceilingSalary)}</p>
								</div>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<div className="flex items-center justify-between">
								<div>
									<CardTitle>{t("activeSalaryScale")}</CardTitle>
									<CardDescription>{scaleDisplayName}</CardDescription>
								</div>
								<Button variant="outline" size="sm" onClick={handleViewSalaryScale}>
									<ExternalLink className="mr-2 h-4 w-4" />
									{t("viewDetails")}
								</Button>
							</div>
						</CardHeader>
						<CardContent>
							<div className="grid grid-cols-2 gap-4 text-sm">
								<div>
									<p className="text-muted-foreground">{t("code")}</p>
									<p className="font-medium">{activeSalaryScale.code}</p>
								</div>
								<div>
									<p className="text-muted-foreground">{t("effectiveDate")}</p>
									<p className="font-medium">{new Date(activeSalaryScale.effectiveDate).toLocaleDateString()}</p>
								</div>
								<div>
									<p className="text-muted-foreground">{t("stepCount")}</p>
									<p className="font-medium">{activeSalaryScale.stepCount}</p>
								</div>
								<div>
									<p className="text-muted-foreground">{t("stepPeriodYears")}</p>
									<p className="font-medium">{activeSalaryScale.stepPeriodYears} years</p>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>

				{rankSalary.salarySteps && rankSalary.salarySteps.length > 0 && (
					<Card>
						<CardHeader>
							<CardTitle>{t("salarySteps")}</CardTitle>
							<CardDescription>{t("salaryProgressionForRank")}</CardDescription>
						</CardHeader>
						<CardContent>
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>{t("stepNumber")}</TableHead>
										<TableHead className="text-right">{t("salaryAmount")}</TableHead>
										<TableHead className="text-right">{t("yearsRequired")}</TableHead>
										<TableHead>{t("status")}</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{rankSalary.salarySteps.map((step) => {
										const isCurrent = step.stepNumber === currentStep;
										const isPast = step.stepNumber < currentStep;
										const isFuture = step.stepNumber > currentStep;

										return (
											<TableRow key={step.id} className={isCurrent ? "bg-primary/5" : ""}>
												<TableCell>
													<div className="flex items-center gap-2">
														{t("stepNumber")} {step.stepNumber}
														{isCurrent && <Badge variant="default">{t("current")}</Badge>}
													</div>
												</TableCell>
												<TableCell className="text-right font-medium">{formatCurrency(step.salaryAmount)}</TableCell>
												<TableCell className="text-right">{step.yearsRequired} years</TableCell>
												<TableCell>
													{isPast && <Badge variant="secondary">{t("completed")}</Badge>}
													{isCurrent && <Badge variant="default">{t("current")}</Badge>}
													{isFuture && <Badge variant="outline">{t("upcoming")}</Badge>}
												</TableCell>
											</TableRow>
										);
									})}
								</TableBody>
							</Table>
						</CardContent>
					</Card>
				)}
			</div>
		);
	},
	(prev, next) => prev.employee.id === next.employee.id && prev.isAmharic === next.isAmharic,
);

EmployeeSalaryTab.displayName = "EmployeeSalaryTab";
