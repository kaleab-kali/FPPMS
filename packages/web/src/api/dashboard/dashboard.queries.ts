import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "./dashboard.api.ts";

export const dashboardKeys = {
	all: ["dashboard"] as const,
	hqOverview: () => [...dashboardKeys.all, "hq-overview"] as const,
};

export const useHqDashboard = () =>
	useQuery({
		queryKey: dashboardKeys.hqOverview(),
		queryFn: () => dashboardApi.getHqOverview(),
	});
