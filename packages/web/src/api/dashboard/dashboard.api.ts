import { api } from "#web/lib/api-client.ts";
import type { HqDashboardData } from "#web/types/dashboard.ts";

const BASE_URL = "/dashboard";

export const dashboardApi = {
	getHqOverview: () => api.get<HqDashboardData>(`${BASE_URL}/hq-overview`),
};
