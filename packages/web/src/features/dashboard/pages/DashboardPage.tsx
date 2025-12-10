import { Briefcase, Building2, Users } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "#web/components/ui/card.tsx";
import { useAuth } from "#web/context/AuthContext.tsx";

export const DashboardPage = React.memo(
	() => {
		const { t } = useTranslation("dashboard");
		const { user } = useAuth();

		const stats = React.useMemo(
			() => [
				{
					title: t("totalEmployees"),
					value: "0",
					icon: <Users className="h-5 w-5 text-muted-foreground" />,
				},
				{
					title: t("totalCenters"),
					value: "0",
					icon: <Building2 className="h-5 w-5 text-muted-foreground" />,
				},
				{
					title: t("totalDepartments"),
					value: "0",
					icon: <Briefcase className="h-5 w-5 text-muted-foreground" />,
				},
			],
			[t],
		);

		return (
			<div className="space-y-6">
				<div>
					<h1 className="text-2xl font-bold">
						{t("welcome")}, {user?.firstName}!
					</h1>
					<p className="text-muted-foreground">{t("overview")}</p>
				</div>

				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
					{stats.map((stat) => (
						<Card key={stat.title}>
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
								{stat.icon}
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">{stat.value}</div>
							</CardContent>
						</Card>
					))}
				</div>

				<Card>
					<CardHeader>
						<CardTitle>{t("recentActivities")}</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-muted-foreground text-sm">No recent activities</p>
					</CardContent>
				</Card>
			</div>
		);
	},
	() => true,
);

DashboardPage.displayName = "DashboardPage";
