import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Filter, MoreHorizontal, Pencil, Plus, Trash2, X } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
	useCreateAttendanceRecord,
	useDeleteAttendanceRecord,
	useUpdateAttendanceRecord,
} from "#web/api/attendance/attendance.mutations.ts";
import { useAttendanceRecords } from "#web/api/attendance/attendance.queries.ts";
import { useCenters } from "#web/api/centers/centers.queries.ts";
import { useDepartments } from "#web/api/departments/departments.queries.ts";
import { ConfirmDialog } from "#web/components/common/ConfirmDialog.tsx";
import { DataTable } from "#web/components/common/DataTable.tsx";
import { Badge } from "#web/components/ui/badge.tsx";
import { Button } from "#web/components/ui/button.tsx";
import { Card, CardContent, CardHeader, CardTitle } from "#web/components/ui/card.tsx";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "#web/components/ui/dropdown-menu.tsx";
import { Input } from "#web/components/ui/input.tsx";
import { Label } from "#web/components/ui/label.tsx";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "#web/components/ui/select.tsx";
import { AttendanceFormDialog } from "#web/features/attendance/components/AttendanceFormDialog.tsx";
import { AttendanceStatusBadge } from "#web/features/attendance/components/AttendanceStatusBadge.tsx";
import type {
	AttendanceQuery,
	AttendanceRecord,
	CreateAttendanceRecordRequest,
	UpdateAttendanceRecordRequest,
} from "#web/types/attendance.ts";
import { ATTENDANCE_STATUS } from "#web/types/attendance.ts";

const ALL_VALUE = "__all__";

export const AttendanceRecordsPage = React.memo(
	() => {
		const { t } = useTranslation("attendance");
		const { t: tCommon } = useTranslation("common");
		const { i18n } = useTranslation();
		const isAmharic = i18n.language === "am";

		const [formOpen, setFormOpen] = React.useState(false);
		const [deleteOpen, setDeleteOpen] = React.useState(false);
		const [selectedRecord, setSelectedRecord] = React.useState<AttendanceRecord | undefined>();
		const [showFilters, setShowFilters] = React.useState(false);

		const [filters, setFilters] = React.useState<AttendanceQuery>({
			page: 1,
			pageSize: 20,
			startDate: "",
			endDate: "",
			status: undefined,
			centerId: "",
			departmentId: "",
			search: "",
		});

		const { data: attendanceData, isLoading } = useAttendanceRecords(filters);
		const { data: centersData } = useCenters();
		const { data: departmentsData } = useDepartments();

		const createMutation = useCreateAttendanceRecord();
		const updateMutation = useUpdateAttendanceRecord();
		const deleteMutation = useDeleteAttendanceRecord();

		const records = attendanceData?.data ?? [];
		const centers = centersData ?? [];
		const departments = departmentsData ?? [];

		const handleCreate = React.useCallback(() => {
			setSelectedRecord(undefined);
			setFormOpen(true);
		}, []);

		const handleEdit = React.useCallback((record: AttendanceRecord) => {
			setSelectedRecord(record);
			setFormOpen(true);
		}, []);

		const handleDeleteClick = React.useCallback((record: AttendanceRecord) => {
			setSelectedRecord(record);
			setDeleteOpen(true);
		}, []);

		const handleFormSubmit = React.useCallback(
			(data: CreateAttendanceRecordRequest | UpdateAttendanceRecordRequest) => {
				if (selectedRecord) {
					updateMutation.mutate(
						{ id: selectedRecord.id, data: data as UpdateAttendanceRecordRequest },
						{
							onSuccess: () => {
								toast.success(tCommon("success"));
								setFormOpen(false);
								setSelectedRecord(undefined);
							},
							onError: () => {
								toast.error(tCommon("error"));
							},
						},
					);
				} else {
					createMutation.mutate(data as CreateAttendanceRecordRequest, {
						onSuccess: () => {
							toast.success(tCommon("success"));
							setFormOpen(false);
						},
						onError: () => {
							toast.error(tCommon("error"));
						},
					});
				}
			},
			[selectedRecord, createMutation, updateMutation, tCommon],
		);

		const handleDeleteConfirm = React.useCallback(() => {
			if (selectedRecord) {
				deleteMutation.mutate(selectedRecord.id, {
					onSuccess: () => {
						toast.success(tCommon("success"));
						setDeleteOpen(false);
						setSelectedRecord(undefined);
					},
					onError: () => {
						toast.error(tCommon("error"));
					},
				});
			}
		}, [selectedRecord, deleteMutation, tCommon]);

		const handleFilterChange = React.useCallback((key: keyof AttendanceQuery, value: string) => {
			setFilters((prev) => ({
				...prev,
				[key]: value === ALL_VALUE ? undefined : value,
			}));
		}, []);

		const handleClearFilters = React.useCallback(() => {
			setFilters({
				page: 1,
				pageSize: 20,
				startDate: "",
				endDate: "",
				status: undefined,
				centerId: "",
				departmentId: "",
				search: "",
			});
		}, []);

		const toggleFilters = React.useCallback(() => {
			setShowFilters((prev) => !prev);
		}, []);

		const columns = React.useMemo<ColumnDef<AttendanceRecord>[]>(
			() => [
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
					accessorKey: "attendanceDate",
					header: t("date"),
					cell: ({ row }) => {
						const dateStr = row.getValue("attendanceDate") as string;
						return format(new Date(dateStr), "MMM dd, yyyy");
					},
				},
				{
					accessorKey: "shift",
					header: t("shift"),
					cell: ({ row }) => {
						const shift = row.original.shift;
						return shift ? `${shift.name} (${shift.code})` : "-";
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
					accessorKey: "hoursWorked",
					header: t("hoursWorked"),
					cell: ({ row }) => {
						const hours = row.getValue("hoursWorked") as number | undefined;
						return hours ? `${hours.toFixed(1)}h` : "-";
					},
				},
				{
					accessorKey: "status",
					header: t("status.label"),
					cell: ({ row }) => <AttendanceStatusBadge status={row.getValue("status")} />,
				},
				{
					accessorKey: "lateMinutes",
					header: t("lateMinutes"),
					cell: ({ row }) => {
						const minutes = row.getValue("lateMinutes") as number | undefined;
						return minutes && minutes > 0 ? <Badge variant="secondary">{minutes}m</Badge> : "-";
					},
				},
				{
					id: "actions",
					header: tCommon("actions"),
					cell: ({ row }) => {
						const record = row.original;
						return (
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button variant="ghost" size="icon" className="h-8 w-8">
										<MoreHorizontal className="h-4 w-4" />
										<span className="sr-only">{tCommon("actions")}</span>
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align="end">
									<DropdownMenuItem onClick={() => handleEdit(record)}>
										<Pencil className="mr-2 h-4 w-4" />
										{tCommon("edit")}
									</DropdownMenuItem>
									<DropdownMenuItem onClick={() => handleDeleteClick(record)} className="text-destructive">
										<Trash2 className="mr-2 h-4 w-4" />
										{tCommon("delete")}
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						);
					},
				},
			],
			[t, tCommon, handleEdit, handleDeleteClick, isAmharic],
		);

		return (
			<div className="space-y-6">
				<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
					<div>
						<h1 className="text-2xl font-bold">{t("attendanceRecords")}</h1>
					</div>
					<div className="flex gap-2">
						<Button onClick={toggleFilters} variant="outline" className="w-full sm:w-auto">
							<Filter className="mr-2 h-4 w-4" />
							{t("filters")}
						</Button>
						<Button onClick={handleCreate} className="w-full sm:w-auto">
							<Plus className="mr-2 h-4 w-4" />
							{t("createRecord")}
						</Button>
					</div>
				</div>

				{showFilters && (
					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
							<CardTitle className="text-base">{t("filters")}</CardTitle>
							<Button variant="ghost" size="sm" onClick={handleClearFilters}>
								<X className="mr-2 h-4 w-4" />
								{tCommon("clear")}
							</Button>
						</CardHeader>
						<CardContent>
							<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
								<div className="space-y-2">
									<Label htmlFor="startDate">{t("startDate")}</Label>
									<Input
										id="startDate"
										type="date"
										value={filters.startDate}
										onChange={(e) => handleFilterChange("startDate", e.target.value)}
									/>
								</div>

								<div className="space-y-2">
									<Label htmlFor="endDate">{t("endDate")}</Label>
									<Input
										id="endDate"
										type="date"
										value={filters.endDate}
										onChange={(e) => handleFilterChange("endDate", e.target.value)}
									/>
								</div>

								<div className="space-y-2">
									<Label htmlFor="status">{t("status.label")}</Label>
									<Select value={filters.status || ALL_VALUE} onValueChange={(v) => handleFilterChange("status", v)}>
										<SelectTrigger>
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value={ALL_VALUE}>{tCommon("all")}</SelectItem>
											{Object.values(ATTENDANCE_STATUS).map((status) => (
												<SelectItem key={status} value={status}>
													{t(`status.${status.toLowerCase()}`)}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>

								<div className="space-y-2">
									<Label htmlFor="centerId">{t("center")}</Label>
									<Select
										value={filters.centerId || ALL_VALUE}
										onValueChange={(v) => handleFilterChange("centerId", v)}
									>
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
									<Label htmlFor="departmentId">{t("department")}</Label>
									<Select
										value={filters.departmentId || ALL_VALUE}
										onValueChange={(v) => handleFilterChange("departmentId", v)}
									>
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

								<div className="space-y-2">
									<Label htmlFor="search">{tCommon("search")}</Label>
									<Input
										id="search"
										value={filters.search}
										onChange={(e) => handleFilterChange("search", e.target.value)}
										placeholder={t("searchPlaceholder")}
									/>
								</div>
							</div>
						</CardContent>
					</Card>
				)}

				<Card>
					<CardHeader>
						<CardTitle>{t("attendanceRecords")}</CardTitle>
					</CardHeader>
					<CardContent>
						<DataTable columns={columns} data={records} isLoading={isLoading} />
					</CardContent>
				</Card>

				<AttendanceFormDialog
					open={formOpen}
					onOpenChange={setFormOpen}
					onSubmit={handleFormSubmit}
					attendance={selectedRecord}
					isLoading={createMutation.isPending || updateMutation.isPending}
				/>

				<ConfirmDialog
					open={deleteOpen}
					onOpenChange={setDeleteOpen}
					title={tCommon("confirm")}
					description={t("deleteConfirm")}
					onConfirm={handleDeleteConfirm}
					isLoading={deleteMutation.isPending}
					variant="destructive"
				/>
			</div>
		);
	},
	() => true,
);

AttendanceRecordsPage.displayName = "AttendanceRecordsPage";
