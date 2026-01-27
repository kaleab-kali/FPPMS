import { Users } from "lucide-react";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { useApproachingMilestones, useEligibilitySummary, useMilestones } from "#web/api/rewards/rewards.queries";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "#web/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "#web/components/ui/select";
import type { EligibilityFilter } from "#web/types/rewards";

const EligibleEmployeesPageComponent = (): React.ReactElement => {
	const { t } = useTranslation("rewards");

	const [filters, setFilters] = React.useState<EligibilityFilter>({
		monthsAhead: 6,
	});

	const { data: summary } = useEligibilitySummary();
	const { data: approaching, isLoading } = useApproachingMilestones(filters);
	const { data: milestones } = useMilestones(false);

	const handleFilterChange = React.useCallback((key: keyof EligibilityFilter, value: string | number | undefined) => {
		setFilters((prev) => ({
			...prev,
			[key]: value || undefined,
		}));
	}, []);

	return (
		<div className="container mx-auto py-6 space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold">{t("eligibility.title")}</h1>
					<p className="text-muted-foreground">{t("eligibility.subtitle")}</p>
				</div>
			</div>

			{summary && (
				<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
					<Card>
						<CardHeader className="pb-2">
							<CardTitle className="text-sm font-medium">Total</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">{summary.total}</div>
						</CardContent>
					</Card>
					<Card>
						<CardHeader className="pb-2">
							<CardTitle className="text-sm font-medium text-green-600">Eligible</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold text-green-600">{summary.eligible}</div>
						</CardContent>
					</Card>
					<Card>
						<CardHeader className="pb-2">
							<CardTitle className="text-sm font-medium text-red-600">Disqualified</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold text-red-600">{summary.disqualified}</div>
						</CardContent>
					</Card>
					<Card>
						<CardHeader className="pb-2">
							<CardTitle className="text-sm font-medium text-yellow-600">Postponed</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold text-yellow-600">{summary.postponed}</div>
						</CardContent>
					</Card>
				</div>
			)}

			<Card>
				<CardHeader>
					<CardTitle>
						<Users className="h-5 w-5 inline mr-2" />
						{t("eligibility.approaching")}
					</CardTitle>
					<CardDescription>Employees approaching service milestones</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
						<Select
							value={String(filters.monthsAhead ?? 6)}
							onValueChange={(v) => handleFilterChange("monthsAhead", parseInt(v, 10))}
						>
							<SelectTrigger>
								<SelectValue placeholder={t("eligibility.monthsAhead")} />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="3">3 months</SelectItem>
								<SelectItem value="6">6 months</SelectItem>
								<SelectItem value="12">12 months</SelectItem>
								<SelectItem value="24">24 months</SelectItem>
							</SelectContent>
						</Select>

						<Select
							value={filters.milestoneId ?? "all"}
							onValueChange={(v) => handleFilterChange("milestoneId", v === "all" ? undefined : v)}
						>
							<SelectTrigger>
								<SelectValue placeholder={t("eligibility.selectMilestone")} />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All Milestones</SelectItem>
								{milestones?.map((milestone) => (
									<SelectItem key={milestone.id} value={milestone.id}>
										{milestone.name} ({milestone.yearsOfService} years)
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					{isLoading ? (
						<div className="flex items-center justify-center py-10">
							<div className="text-muted-foreground">Loading...</div>
						</div>
					) : approaching && approaching.length > 0 ? (
						<div className="space-y-2">
							{approaching.map((item) => (
								<div
									key={`${item.employeeId}-${item.milestone.id}`}
									className="flex items-center justify-between p-4 border rounded-lg"
								>
									<div>
										<div className="font-medium">{item.employee.fullName}</div>
										<div className="text-sm text-muted-foreground">{item.employee.employeeId}</div>
									</div>
									<div>
										<div className="font-medium">{item.milestone.name}</div>
										<div className="text-sm text-muted-foreground">
											{item.currentYearsOfService} years current, {item.monthsUntilEligible} months until eligible
										</div>
									</div>
									<div className="text-sm text-muted-foreground">{item.expectedEligibilityDate}</div>
								</div>
							))}
						</div>
					) : (
						<div className="text-center py-10 text-muted-foreground">No employees approaching milestones</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
};

EligibleEmployeesPageComponent.displayName = "EligibleEmployeesPage";

export const EligibleEmployeesPage = React.memo(EligibleEmployeesPageComponent);
