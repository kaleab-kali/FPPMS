import type { ColumnDef } from "@tanstack/react-table";
import { format, subDays } from "date-fns";
import { Calendar, TrendingUp, Users, UserX } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";
import {
	useAbsenteeismReport,
	useAttendanceOverview,
	useAttendanceTrends,
	useLateArrivalsReport,
} from "#web/api/attendance/reports.queries.ts";
import { DataTable } from "#web/components/common/DataTable.tsx";
import { Badge } from "#web/components/ui/badge.tsx";
import { Card, CardContent, CardHeader, CardTitle } from "#web/components/ui/card.tsx";
import { Input } from "#web/components/ui/input.tsx";
import { Label } from "#web/components/ui/label.tsx";
import { Skeleton } from "#web/components/ui/skeleton.tsx";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "#web/components/ui/table.tsx";
import type { AbsenteeismReport, AttendanceTrend, LateArrivalReport } from "#web/types/attendance.ts";

export const AttendanceReportsPage = React.memo(() => {
	const { t } = useTranslation("attendance");

	const today = new Date().toISOString().split("T")[0];
	const thirtyDaysAgo = subDays(new Date(), 30).toISOString().split("T")[0];

	const [dateRange, setDateRange] = React.useState({
		startDate: thirtyDaysAgo,
		endDate: today,
	});

	const overviewQuery = useAttendanceOverview(today);
	const trendsQuery = useAttendanceTrends({
		startDate: dateRange.startDate,
		endDate: dateRange.endDate,
		groupBy: "day",
	});
	const lateArrivalsQuery = useLateArrivalsReport({
		startDate: dateRange.startDate,
		endDate: dateRange.endDate,
	});
	const absenteeismQuery = useAbsenteeismReport({
		startDate: dateRange.startDate,
		endDate: dateRange.endDate,
	});

	const overview = overviewQuery.data;
	const trends = trendsQuery.data ?? [];
	const lateArrivals = lateArrivalsQuery.data ?? [];
	const absenteeism = absenteeismQuery.data ?? [];

	const handleStartDateChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
		setDateRange((prev) => ({ ...prev, startDate: e.target.value }));
	}, []);

	const handleEndDateChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
		setDateRange((prev) => ({ ...prev, endDate: e.target.value }));
	}, []);

	const lateArrivalsColumns = React.useMemo<ColumnDef<LateArrivalReport>[]>(
		() => [
			{
				accessorKey: "employeeName",
				header: t("employee"),
				cell: ({ row }) => (
					<div>
						<p className="font-medium">{row.getValue("employeeName")}</p>
						<p className="text-sm text-muted-foreground">{row.original.employeeCode}</p>
					</div>
				),
			},
			{
				accessorKey: "departmentName",
				header: t("department"),
			},
			{
				accessorKey: "date",
				header: t("date"),
				cell: ({ row }) => format(new Date(row.getValue("date")), "MMM dd, yyyy"),
			},
			{
				accessorKey: "expectedTime",
				header: t("expectedTime"),
			},
			{
				accessorKey: "actualTime",
				header: t("actualTime"),
			},
			{
				accessorKey: "lateMinutes",
				header: t("lateMinutes"),
				cell: ({ row }) => <Badge variant="secondary">{row.getValue("lateMinutes")}m</Badge>,
			},
		],
		[t],
	);

	const absenteeismColumns = React.useMemo<ColumnDef<AbsenteeismReport>[]>(
		() => [
			{
				accessorKey: "employeeName",
				header: t("employee"),
				cell: ({ row }) => (
					<div>
						<p className="font-medium">{row.getValue("employeeName")}</p>
						<p className="text-sm text-muted-foreground">{row.original.employeeCode}</p>
					</div>
				),
			},
			{
				accessorKey: "departmentName",
				header: t("department"),
			},
			{
				accessorKey: "absentDays",
				header: t("absentDays"),
				cell: ({ row }) => <Badge variant="destructive">{row.getValue("absentDays")}</Badge>,
			},
		],
		[t],
	);

	return (
		<div className="space-y-6">
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h1 className="text-2xl font-bold">{t("reports")}</h1>
					<p className="text-muted-foreground">{t("attendanceAnalytics")}</p>
				</div>
			</div>

			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				{overviewQuery.isLoading ? (
					[1, 2, 3, 4].map((i) => (
						<Card key={i}>
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<Skeleton className="h-4 w-24" />
							</CardHeader>
							<CardContent>
								<Skeleton className="h-8 w-16" />
							</CardContent>
						</Card>
					))
				) : overview ? (
					<>
						<Card>
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="text-sm font-medium">{t("totalEmployees")}</CardTitle>
								<Users className="h-4 w-4 text-muted-foreground" />
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">{overview.totalEmployees}</div>
							</CardContent>
						</Card>
						<Card>
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="text-sm font-medium">{t("presentToday")}</CardTitle>
								<TrendingUp className="h-4 w-4 text-green-500" />
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold text-green-600">{overview.presentToday}</div>
								<p className="text-xs text-muted-foreground">
									{overview.attendanceRate.toFixed(1)}% {t("attendanceRate")}
								</p>
							</CardContent>
						</Card>
						<Card>
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="text-sm font-medium">{t("absentToday")}</CardTitle>
								<UserX className="h-4 w-4 text-red-500" />
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold text-red-600">{overview.absentToday}</div>
							</CardContent>
						</Card>
						<Card>
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="text-sm font-medium">{t("lateToday")}</CardTitle>
								<Calendar className="h-4 w-4 text-yellow-500" />
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold text-yellow-600">{overview.lateToday}</div>
							</CardContent>
						</Card>
					</>
				) : null}
			</div>

			<Card>
				<CardHeader>
					<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
						<CardTitle>{t("attendanceTrends")}</CardTitle>
						<div className="flex gap-2">
							<div className="space-y-1">
								<Label htmlFor="startDate" className="text-xs">
									{t("startDate")}
								</Label>
								<Input
									id="startDate"
									type="date"
									value={dateRange.startDate}
									onChange={handleStartDateChange}
									className="h-8"
								/>
							</div>
							<div className="space-y-1">
								<Label htmlFor="endDate" className="text-xs">
									{t("endDate")}
								</Label>
								<Input
									id="endDate"
									type="date"
									value={dateRange.endDate}
									onChange={handleEndDateChange}
									className="h-8"
								/>
							</div>
						</div>
					</div>
				</CardHeader>
				<CardContent>
					{trendsQuery.isLoading ? (
						<Skeleton className="h-[200px] w-full" />
					) : trends.length > 0 ? (
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>{t("date")}</TableHead>
									<TableHead className="text-right">{t("present")}</TableHead>
									<TableHead className="text-right">{t("absent")}</TableHead>
									<TableHead className="text-right">{t("late")}</TableHead>
									<TableHead className="text-right">{t("attendanceRate")}</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{trends.slice(0, 10).map((trend: AttendanceTrend) => (
									<TableRow key={trend.date}>
										<TableCell>{format(new Date(trend.date), "MMM dd, yyyy")}</TableCell>
										<TableCell className="text-right text-green-600">{trend.present}</TableCell>
										<TableCell className="text-right text-red-600">{trend.absent}</TableCell>
										<TableCell className="text-right text-yellow-600">{trend.late}</TableCell>
										<TableCell className="text-right">{trend.attendanceRate.toFixed(1)}%</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					) : (
						<div className="h-[200px] flex items-center justify-center text-muted-foreground">
							{t("noDataAvailable")}
						</div>
					)}
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>{t("lateArrivals")}</CardTitle>
				</CardHeader>
				<CardContent>
					<DataTable
						columns={lateArrivalsColumns}
						data={lateArrivals}
						isLoading={lateArrivalsQuery.isLoading}
						searchColumn="employeeName"
					/>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>{t("absenteeismReport")}</CardTitle>
				</CardHeader>
				<CardContent>
					<DataTable
						columns={absenteeismColumns}
						data={absenteeism}
						isLoading={absenteeismQuery.isLoading}
						searchColumn="employeeName"
					/>
				</CardContent>
			</Card>
		</div>
	);
});

AttendanceReportsPage.displayName = "AttendanceReportsPage";
