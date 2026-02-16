import { Filter } from "lucide-react";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useMilestones, useServiceRewards } from "#web/api/rewards/rewards.queries";
import { Button } from "#web/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "#web/components/ui/card";
import { Input } from "#web/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "#web/components/ui/select";
import { ServiceRewardsTable } from "#web/features/rewards/components/ServiceRewardsTable";
import { REWARD_ELIGIBILITY, SERVICE_REWARD_STATUS, type ServiceRewardFilter } from "#web/types/rewards";

const ServiceRewardsListPageComponent = (): React.ReactElement => {
	const { t } = useTranslation("rewards");
	const navigate = useNavigate();

	const [filters, setFilters] = React.useState<ServiceRewardFilter>({
		page: 1,
		limit: 20,
	});

	const { data: rewardsData, isLoading } = useServiceRewards(filters);
	const { data: milestones } = useMilestones(false);

	const handleFilterChange = React.useCallback((key: keyof ServiceRewardFilter, value: string | undefined) => {
		setFilters((prev) => ({
			...prev,
			[key]: value || undefined,
			page: 1,
		}));
	}, []);

	const handleSearch = React.useCallback((search: string) => {
		setFilters((prev) => ({
			...prev,
			search: search || undefined,
			page: 1,
		}));
	}, []);

	const handleView = React.useCallback(
		(reward: { id: string }) => {
			navigate(`/rewards/service-rewards/${reward.id}`);
		},
		[navigate],
	);

	return (
		<div className="container mx-auto py-6 space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold">{t("serviceRewards.title")}</h1>
					<p className="text-muted-foreground">{t("serviceRewards.subtitle")}</p>
				</div>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>
						<Filter className="h-5 w-5 inline mr-2" />
						Filters
					</CardTitle>
					<CardDescription>Filter service rewards by status, eligibility, and milestone</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
						<Input
							placeholder={t("filters.search")}
							value={filters.search ?? ""}
							onChange={(e) => handleSearch(e.target.value)}
						/>

						<Select
							value={filters.status ?? "all"}
							onValueChange={(v) => handleFilterChange("status", v === "all" ? undefined : v)}
						>
							<SelectTrigger>
								<SelectValue placeholder={t("filters.status")} />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All Status</SelectItem>
								{Object.keys(SERVICE_REWARD_STATUS).map((status) => (
									<SelectItem key={status} value={status}>
										{t(`status.${status}`)}
									</SelectItem>
								))}
							</SelectContent>
						</Select>

						<Select
							value={filters.eligibilityStatus ?? "all"}
							onValueChange={(v) => handleFilterChange("eligibilityStatus", v === "all" ? undefined : v)}
						>
							<SelectTrigger>
								<SelectValue placeholder={t("filters.eligibility")} />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All Eligibility</SelectItem>
								{Object.keys(REWARD_ELIGIBILITY).map((status) => (
									<SelectItem key={status} value={status}>
										{t(`eligibilityStatus.${status}`)}
									</SelectItem>
								))}
							</SelectContent>
						</Select>

						<Select
							value={filters.milestoneId ?? "all"}
							onValueChange={(v) => handleFilterChange("milestoneId", v === "all" ? undefined : v)}
						>
							<SelectTrigger>
								<SelectValue placeholder={t("filters.milestone")} />
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
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>{t("serviceRewards.list")}</CardTitle>
					<CardDescription>
						Showing {rewardsData?.data.length ?? 0} of {rewardsData?.meta.total ?? 0} rewards
					</CardDescription>
				</CardHeader>
				<CardContent>
					<ServiceRewardsTable data={rewardsData?.data ?? []} isLoading={isLoading} onView={handleView} />
				</CardContent>
			</Card>

			{rewardsData && rewardsData.meta.totalPages > 1 && (
				<div className="flex items-center justify-center gap-2">
					<Button
						variant="outline"
						disabled={filters.page === 1}
						onClick={() => setFilters((prev) => ({ ...prev, page: (prev.page ?? 1) - 1 }))}
					>
						Previous
					</Button>
					<span className="text-sm text-muted-foreground">
						Page {filters.page} of {rewardsData.meta.totalPages}
					</span>
					<Button
						variant="outline"
						disabled={filters.page === rewardsData.meta.totalPages}
						onClick={() => setFilters((prev) => ({ ...prev, page: (prev.page ?? 1) + 1 }))}
					>
						Next
					</Button>
				</div>
			)}
		</div>
	);
};

ServiceRewardsListPageComponent.displayName = "ServiceRewardsListPage";

export const ServiceRewardsListPage = React.memo(ServiceRewardsListPageComponent);
