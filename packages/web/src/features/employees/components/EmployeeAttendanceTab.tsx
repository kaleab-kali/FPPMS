import { Calendar, Clock, TrendingUp } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";
import { useAttendanceByEmployee } from "#web/api/attendance/attendance.queries";
import { Badge } from "#web/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "#web/components/ui/card";
import { Skeleton } from "#web/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "#web/components/ui/table";
import { gregorianToEthiopian } from "#web/lib/ethiopian-calendar";
import type { AttendanceRecord, AttendanceStatus } from "#web/types/attendance";

const STATUS_COLORS: Record<AttendanceStatus, string> = {
	PRESENT: "bg-green-100 text-green-800",
	ABSENT: "bg-red-100 text-red-800",
	LATE: "bg-yellow-100 text-yellow-800",
	HALF_DAY: "bg-blue-100 text-blue-800",
	ON_LEAVE: "bg-purple-100 text-purple-800",
} as const;

const STATUS_LABELS: Record<AttendanceStatus, string> = {
	PRESENT: "Present",
	ABSENT: "Absent",
	LATE: "Late",
	HALF_DAY: "Half Day",
	ON_LEAVE: "On Leave",
} as const;

interface EmployeeAttendanceTabProps {
	employeeId: string;
}

export const EmployeeAttendanceTab = React.memo(
	({ employeeId }: EmployeeAttendanceTabProps) => {
		const { t } = useTranslation("employees");

		const endDate = new Date().toISOString().split("T")[0];
		const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

		const { data: attendanceData, isLoading } = useAttendanceByEmployee(employeeId, startDate, endDate);

		const stats = React.useMemo(() => {
			if (!attendanceData || attendanceData.length === 0) {
				return { present: 0, absent: 0, late: 0, total: 0 };
			}

			const present = attendanceData.filter((r: AttendanceRecord) => r.status === "PRESENT").length;
			const absent = attendanceData.filter((r: AttendanceRecord) => r.status === "ABSENT").length;
			const late = attendanceData.filter((r: AttendanceRecord) => r.status === "LATE").length;

			return {
				present,
				absent,
				late,
				total: attendanceData.length,
			};
		}, [attendanceData]);

		const formatTime = React.useCallback((time: string | undefined | null) => {
			if (!time) return "-";
			return time;
		}, []);

		const formatDate = React.useCallback((dateStr: string) => {
			const date = new Date(dateStr);
			const gregorian = date.toLocaleDateString("en-US", {
				month: "short",
				day: "numeric",
			});
			const ethiopian = gregorianToEthiopian(date);
			return `${gregorian} (${ethiopian.day} ${ethiopian.monthName.slice(0, 3)})`;
		}, []);

		if (isLoading) {
			return (
				<div className="space-y-4">
					<div className="grid gap-4 md:grid-cols-4">
						<Skeleton className="h-24" />
						<Skeleton className="h-24" />
						<Skeleton className="h-24" />
						<Skeleton className="h-24" />
					</div>
					<Skeleton className="h-64" />
				</div>
			);
		}

		if (!attendanceData || attendanceData.length === 0) {
			return (
				<div className="flex flex-col items-center justify-center py-16 text-center">
					<Clock className="h-12 w-12 text-muted-foreground mb-4" />
					<h3 className="text-lg font-semibold mb-2">{t("attendance.noRecords")}</h3>
					<p className="text-muted-foreground text-sm">{t("attendance.noRecordsDescription")}</p>
				</div>
			);
		}

		return (
			<div className="space-y-6">
				<div className="grid gap-4 md:grid-cols-4">
					<Card>
						<CardHeader className="pb-2">
							<CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
								<Calendar className="h-4 w-4" />
								{t("attendance.totalDays")}
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">{stats.total}</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="pb-2">
							<CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
								<TrendingUp className="h-4 w-4 text-green-600" />
								{t("attendance.presentDays")}
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold text-green-600">{stats.present}</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="pb-2">
							<CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
								<Clock className="h-4 w-4 text-yellow-600" />
								{t("attendance.lateDays")}
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold text-yellow-600">{stats.late}</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="pb-2">
							<CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
								<Calendar className="h-4 w-4 text-red-600" />
								{t("attendance.absentDays")}
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold text-red-600">{stats.absent}</div>
						</CardContent>
					</Card>
				</div>

				<Card>
					<CardHeader>
						<CardTitle className="text-lg">{t("attendance.recentHistory")}</CardTitle>
					</CardHeader>
					<CardContent>
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>{t("attendance.date")}</TableHead>
									<TableHead>{t("attendance.status")}</TableHead>
									<TableHead>{t("attendance.checkIn")}</TableHead>
									<TableHead>{t("attendance.checkOut")}</TableHead>
									<TableHead>{t("attendance.workHours")}</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{attendanceData.slice(0, 15).map((record: AttendanceRecord) => (
									<TableRow key={record.id}>
										<TableCell className="font-medium">{formatDate(record.attendanceDate)}</TableCell>
										<TableCell>
											<Badge className={STATUS_COLORS[record.status]}>{STATUS_LABELS[record.status]}</Badge>
										</TableCell>
										<TableCell>{formatTime(record.clockIn)}</TableCell>
										<TableCell>{formatTime(record.clockOut)}</TableCell>
										<TableCell>
											{record.hoursWorked
												? `${Math.floor(record.hoursWorked)}h ${Math.round((record.hoursWorked % 1) * 60)}m`
												: "-"}
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</CardContent>
				</Card>
			</div>
		);
	},
	(prev, next) => prev.employeeId === next.employeeId,
);

EmployeeAttendanceTab.displayName = "EmployeeAttendanceTab";
