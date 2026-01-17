import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Calendar, Check, X } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useCreateBulkAttendance } from "#web/api/attendance/attendance.mutations.ts";
import { useAttendanceByDate } from "#web/api/attendance/attendance.queries.ts";
import { useCenters } from "#web/api/centers/centers.queries.ts";
import { useDepartments } from "#web/api/departments/departments.queries.ts";
import { DataTable } from "#web/components/common/DataTable.tsx";
import { Button } from "#web/components/ui/button.tsx";
import { Card, CardContent, CardHeader, CardTitle } from "#web/components/ui/card.tsx";
import { Input } from "#web/components/ui/input.tsx";
import { Label } from "#web/components/ui/label.tsx";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "#web/components/ui/select.tsx";
import { Skeleton } from "#web/components/ui/skeleton.tsx";
import { AttendanceStatusBadge } from "#web/features/attendance/components/AttendanceStatusBadge.tsx";
import type { AttendanceRecord, BulkAttendanceRequest } from "#web/types/attendance.ts";
import { ATTENDANCE_STATUS } from "#web/types/attendance.ts";

const ALL_VALUE = "__all__";

export const DailyAttendancePage = React.memo(
	() => {
		const { t } = useTranslation("attendance");
		const { t: tCommon } = useTranslation("common");
		const { i18n } = useTranslation();
		const isAmharic = i18n.language === "am";

		const today = new Date().toISOString().split("T")[0];
		const [selectedDate, setSelectedDate] = React.useState(today);
		const [centerId, setCenterId] = React.useState<string>("");
		const [departmentId, setDepartmentId] = React.useState<string>("");
		const [selectedRecords, setSelectedRecords] = React.useState<Set<string>>(new Set());

		const { data: records, isLoading } = useAttendanceByDate(
			selectedDate,
			centerId || undefined,
			departmentId || undefined,
		);
		const { data: centersData } = useCenters();
		const { data: departmentsData } = useDepartments();

		const bulkMutation = useCreateBulkAttendance();

		const centers = centersData ?? [];
		const departments = departmentsData ?? [];
		const attendanceRecords = records ?? [];

		const handleDateChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
			setSelectedDate(e.target.value);
		}, []);

		const handleCenterChange = React.useCallback((value: string) => {
			setCenterId(value === ALL_VALUE ? "" : value);
		}, []);

		const handleDepartmentChange = React.useCallback((value: string) => {
			setDepartmentId(value === ALL_VALUE ? "" : value);
		}, []);

		const handleToggleRecord = React.useCallback((employeeId: string) => {
			setSelectedRecords((prev) => {
				const newSet = new Set(prev);
				if (newSet.has(employeeId)) {
					newSet.delete(employeeId);
				} else {
					newSet.add(employeeId);
				}
				return newSet;
			});
		}, []);

		const handleDeselectAll = React.useCallback(() => {
			setSelectedRecords(new Set());
		}, []);

		const handleBulkMarkStatus = React.useCallback(
			(status: (typeof ATTENDANCE_STATUS)[keyof typeof ATTENDANCE_STATUS]) => {
				const recordsToCreate = Array.from(selectedRecords).map((employeeId) => ({
					employeeId,
					attendanceDate: selectedDate,
					status,
				}));

				const payload: BulkAttendanceRequest = {
					records: recordsToCreate,
				};

				bulkMutation.mutate(payload, {
					onSuccess: () => {
						toast.success(t("bulkMarkSuccess"));
						setSelectedRecords(new Set());
					},
					onError: () => {
						toast.error(tCommon("error"));
					},
				});
			},
			[selectedRecords, selectedDate, bulkMutation, t, tCommon],
		);

		const columns = React.useMemo<ColumnDef<AttendanceRecord>[]>(
			() => [
				{
					id: "select",
					header: ({ table }) => (
						<div className="flex items-center gap-2">
							<input
								type="checkbox"
								checked={table.getIsAllPageRowsSelected()}
								onChange={table.getToggleAllPageRowsSelectedHandler()}
								className="h-4 w-4"
							/>
						</div>
					),
					cell: ({ row }) => {
						const record = row.original;
						const employeeId = record.employee?.id;
						if (!employeeId || record.id) return null;
						return (
							<input
								type="checkbox"
								checked={selectedRecords.has(employeeId)}
								onChange={() => handleToggleRecord(employeeId)}
								className="h-4 w-4"
							/>
						);
					},
				},
				{
					accessorKey: "employee",
					header: t("employee"),
					cell: ({ row }) => {
						const employee = row.original.employee;
						if (!employee) return "-";
						const displayName = isAmharic && employee.fullNameAm ? employee.fullNameAm : employee.fullName;
						return (
							<div>
								<p className="font-medium">{displayName}</p>
								<p className="text-sm text-muted-foreground">{employee.employeeId}</p>
							</div>
						);
					},
				},
				{
					accessorKey: "shift",
					header: t("shift"),
					cell: ({ row }) => {
						const shift = row.original.shift;
						return shift ? `${shift.name}` : "-";
					},
				},
				{
					accessorKey: "clockIn",
					header: t("clockIn"),
					cell: ({ row }) => row.getValue("clockIn") || "-",
				},
				{
					accessorKey: "clockOut",
					header: t("clockOut"),
					cell: ({ row }) => row.getValue("clockOut") || "-",
				},
				{
					accessorKey: "status",
					header: t("status.label"),
					cell: ({ row }) => {
						const record = row.original;
						return record.id ? (
							<AttendanceStatusBadge status={record.status} />
						) : (
							<span className="text-muted-foreground">-</span>
						);
					},
				},
				{
					accessorKey: "lateMinutes",
					header: t("lateMinutes"),
					cell: ({ row }) => {
						const minutes = row.getValue("lateMinutes") as number | undefined;
						return minutes && minutes > 0 ? `${minutes}m` : "-";
					},
				},
			],
			[t, handleToggleRecord, selectedRecords, isAmharic],
		);

		return (
			<div className="space-y-6">
				<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
					<div>
						<h1 className="text-2xl font-bold">{t("dailyAttendance")}</h1>
						<p className="text-muted-foreground">{format(new Date(selectedDate), "EEEE, MMMM dd, yyyy")}</p>
					</div>
				</div>

				<Card>
					<CardHeader>
						<CardTitle>{t("filters")}</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
							<div className="space-y-2">
								<Label htmlFor="date">{t("date")}</Label>
								<div className="relative">
									<Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
									<Input id="date" type="date" value={selectedDate} onChange={handleDateChange} className="pl-9" />
								</div>
							</div>

							<div className="space-y-2">
								<Label htmlFor="center">{t("center")}</Label>
								<Select value={centerId || ALL_VALUE} onValueChange={handleCenterChange}>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value={ALL_VALUE}>{tCommon("all")}</SelectItem>
										{centers.map((center) => (
											<SelectItem key={center.id} value={center.id}>
												{center.name}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>

							<div className="space-y-2">
								<Label htmlFor="department">{t("department")}</Label>
								<Select value={departmentId || ALL_VALUE} onValueChange={handleDepartmentChange}>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value={ALL_VALUE}>{tCommon("all")}</SelectItem>
										{departments.map((dept) => (
											<SelectItem key={dept.id} value={dept.id}>
												{dept.name}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
						</div>
					</CardContent>
				</Card>

				{selectedRecords.size > 0 && (
					<Card>
						<CardContent className="pt-6">
							<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
								<div className="flex items-center gap-2">
									<span className="text-sm font-medium">
										{selectedRecords.size} {t("selected")}
									</span>
									<Button size="sm" variant="ghost" onClick={handleDeselectAll}>
										<X className="mr-2 h-4 w-4" />
										{tCommon("clear")}
									</Button>
								</div>
								<div className="flex flex-wrap gap-2">
									<Button
										size="sm"
										variant="default"
										onClick={() => handleBulkMarkStatus(ATTENDANCE_STATUS.PRESENT)}
										disabled={bulkMutation.isPending}
									>
										<Check className="mr-2 h-4 w-4" />
										{t("markPresent")}
									</Button>
									<Button
										size="sm"
										variant="destructive"
										onClick={() => handleBulkMarkStatus(ATTENDANCE_STATUS.ABSENT)}
										disabled={bulkMutation.isPending}
									>
										<X className="mr-2 h-4 w-4" />
										{t("markAbsent")}
									</Button>
									<Button
										size="sm"
										variant="outline"
										onClick={() => handleBulkMarkStatus(ATTENDANCE_STATUS.LATE)}
										disabled={bulkMutation.isPending}
									>
										{t("markLate")}
									</Button>
								</div>
							</div>
						</CardContent>
					</Card>
				)}

				<Card>
					<CardHeader>
						<CardTitle>{t("employeeList")}</CardTitle>
					</CardHeader>
					<CardContent>
						{isLoading ? (
							<div className="space-y-2">
								{[1, 2, 3, 4, 5].map((i) => (
									<Skeleton key={i} className="h-12 w-full" />
								))}
							</div>
						) : (
							<DataTable columns={columns} data={attendanceRecords} isLoading={false} />
						)}
					</CardContent>
				</Card>
			</div>
		);
	},
	() => true,
);

DailyAttendancePage.displayName = "DailyAttendancePage";
