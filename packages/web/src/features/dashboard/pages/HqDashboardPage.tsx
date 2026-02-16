import { AlertTriangle, Building2, Clock, FileText, Gavel, Users } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";
import { useHqDashboard } from "#web/api/dashboard/dashboard.queries.ts";
import { Badge } from "#web/components/ui/badge.tsx";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "#web/components/ui/card.tsx";
import { Skeleton } from "#web/components/ui/skeleton.tsx";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "#web/components/ui/table.tsx";
import { COMPLAINT_STATUS_LABELS } from "#web/types/complaint.ts";
import type { CenterStatistics, ComplaintStatusCount } from "#web/types/dashboard.ts";

const STAT_CARD_ICONS = {
	employees: Users,
	centers: Building2,
	committees: Gavel,
	complaints: FileText,
	hqDecision: AlertTriangle,
	appeals: Clock,
	expiringTerms: Clock,
} as const;

interface StatCardProps {
	title: string;
	value: number;
	icon: React.ReactNode;
	description?: string;
	variant?: "default" | "warning" | "danger";
}

const StatCard = React.memo(
	({ title, value, icon, description, variant = "default" }: StatCardProps) => {
		const variantClasses = {
			default: "",
			warning: "border-yellow-500 bg-yellow-50 dark:bg-yellow-950",
			danger: "border-red-500 bg-red-50 dark:bg-red-950",
		} as const;

		return (
			<Card className={variantClasses[variant]}>
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle className="text-sm font-medium">{title}</CardTitle>
					{icon}
				</CardHeader>
				<CardContent>
					<div className="text-2xl font-bold">{value}</div>
					{description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
				</CardContent>
			</Card>
		);
	},
	(prevProps, nextProps) => prevProps.value === nextProps.value && prevProps.title === nextProps.title,
);
StatCard.displayName = "StatCard";

interface ComplaintStatusTableProps {
	data: ComplaintStatusCount[];
	t: (key: string) => string;
}

const ComplaintStatusTable = React.memo(
	({ data, t }: ComplaintStatusTableProps) => (
		<Card>
			<CardHeader>
				<CardTitle>{t("complaintsByStatus")}</CardTitle>
				<CardDescription>{t("complaintsByStatusDescription")}</CardDescription>
			</CardHeader>
			<CardContent>
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>{t("status")}</TableHead>
							<TableHead className="text-right">{t("count")}</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{data.map((item) => (
							<TableRow key={item.status}>
								<TableCell>
									<Badge variant="outline">
										{COMPLAINT_STATUS_LABELS[item.status as keyof typeof COMPLAINT_STATUS_LABELS] ?? item.status}
									</Badge>
								</TableCell>
								<TableCell className="text-right font-medium">{item.count}</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</CardContent>
		</Card>
	),
	(prevProps, nextProps) => prevProps.data.length === nextProps.data.length,
);
ComplaintStatusTable.displayName = "ComplaintStatusTable";

interface CenterStatisticsTableProps {
	data: CenterStatistics[];
	t: (key: string) => string;
}

const CenterStatisticsTable = React.memo(
	({ data, t }: CenterStatisticsTableProps) => (
		<Card>
			<CardHeader>
				<CardTitle>{t("centerStatistics")}</CardTitle>
				<CardDescription>{t("centerStatisticsDescription")}</CardDescription>
			</CardHeader>
			<CardContent>
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>{t("centerName")}</TableHead>
							<TableHead className="text-right">{t("employees")}</TableHead>
							<TableHead className="text-right">{t("activeComplaints")}</TableHead>
							<TableHead className="text-right">{t("committees")}</TableHead>
							<TableHead className="text-right">{t("pendingAppeals")}</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{data.map((center) => (
							<TableRow key={center.centerId}>
								<TableCell className="font-medium">{center.centerName}</TableCell>
								<TableCell className="text-right">{center.totalEmployees}</TableCell>
								<TableCell className="text-right">
									{center.activeComplaints > 0 ? (
										<Badge variant="secondary">{center.activeComplaints}</Badge>
									) : (
										center.activeComplaints
									)}
								</TableCell>
								<TableCell className="text-right">{center.activeCommittees}</TableCell>
								<TableCell className="text-right">
									{center.pendingAppeals > 0 ? (
										<Badge variant="destructive">{center.pendingAppeals}</Badge>
									) : (
										center.pendingAppeals
									)}
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</CardContent>
		</Card>
	),
	(prevProps, nextProps) => prevProps.data.length === nextProps.data.length,
);
CenterStatisticsTable.displayName = "CenterStatisticsTable";

const SKELETON_CARD_IDS = ["skeleton-1", "skeleton-2", "skeleton-3", "skeleton-4"] as const;

const LoadingSkeleton = React.memo(() => (
	<div className="space-y-6">
		<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
			{SKELETON_CARD_IDS.map((id) => (
				<Card key={id}>
					<CardHeader className="pb-2">
						<Skeleton className="h-4 w-24" />
					</CardHeader>
					<CardContent>
						<Skeleton className="h-8 w-16" />
					</CardContent>
				</Card>
			))}
		</div>
		<div className="grid gap-6 lg:grid-cols-2">
			<Card>
				<CardHeader>
					<Skeleton className="h-6 w-40" />
				</CardHeader>
				<CardContent>
					<Skeleton className="h-48 w-full" />
				</CardContent>
			</Card>
			<Card>
				<CardHeader>
					<Skeleton className="h-6 w-40" />
				</CardHeader>
				<CardContent>
					<Skeleton className="h-48 w-full" />
				</CardContent>
			</Card>
		</div>
	</div>
));
LoadingSkeleton.displayName = "LoadingSkeleton";

export const HqDashboardPage = React.memo(() => {
	const { t } = useTranslation("dashboard");
	const { data, isLoading } = useHqDashboard();

	if (isLoading) {
		return (
			<div className="space-y-6">
				<div>
					<h1 className="text-2xl font-bold">{t("hqDashboard")}</h1>
					<p className="text-muted-foreground">{t("hqDashboardDescription")}</p>
				</div>
				<LoadingSkeleton />
			</div>
		);
	}

	if (!data) {
		return (
			<div className="flex items-center justify-center p-8">
				<p className="text-muted-foreground">{t("noData")}</p>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-2xl font-bold">{t("hqDashboard")}</h1>
				<p className="text-muted-foreground">{t("hqDashboardDescription")}</p>
			</div>

			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				<StatCard
					title={t("totalEmployees")}
					value={data.totalEmployees}
					icon={<STAT_CARD_ICONS.employees className="h-5 w-5 text-muted-foreground" />}
				/>
				<StatCard
					title={t("totalCenters")}
					value={data.totalCenters}
					icon={<STAT_CARD_ICONS.centers className="h-5 w-5 text-muted-foreground" />}
				/>
				<StatCard
					title={t("totalCommittees")}
					value={data.totalCommittees}
					icon={<STAT_CARD_ICONS.committees className="h-5 w-5 text-muted-foreground" />}
				/>
				<StatCard
					title={t("totalComplaints")}
					value={data.totalComplaints}
					icon={<STAT_CARD_ICONS.complaints className="h-5 w-5 text-muted-foreground" />}
				/>
			</div>

			<div className="grid gap-4 md:grid-cols-3">
				<StatCard
					title={t("awaitingHqDecision")}
					value={data.complaintsAwaitingHqDecision}
					icon={<STAT_CARD_ICONS.hqDecision className="h-5 w-5 text-yellow-500" />}
					description={t("awaitingHqDecisionDescription")}
					variant={data.complaintsAwaitingHqDecision > 0 ? "warning" : "default"}
				/>
				<StatCard
					title={t("pendingAppeals")}
					value={data.pendingAppeals}
					icon={<STAT_CARD_ICONS.appeals className="h-5 w-5 text-red-500" />}
					description={t("pendingAppealsDescription")}
					variant={data.pendingAppeals > 0 ? "danger" : "default"}
				/>
				<StatCard
					title={t("expiringTerms")}
					value={data.expiringTerms}
					icon={<STAT_CARD_ICONS.expiringTerms className="h-5 w-5 text-orange-500" />}
					description={t("expiringTermsDescription")}
					variant={data.expiringTerms > 0 ? "warning" : "default"}
				/>
			</div>

			<div className="grid gap-6 lg:grid-cols-2">
				<ComplaintStatusTable data={data.complaintsByStatus} t={t} />
				<CenterStatisticsTable data={data.centerStatistics} t={t} />
			</div>
		</div>
	);
});

HqDashboardPage.displayName = "HqDashboardPage";
