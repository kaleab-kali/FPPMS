import type { ColumnDef } from "@tanstack/react-table";
import { Eye, MoreHorizontal, Pencil, Plus, UserMinus, Users } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useChangeEmployeeStatus, useReturnToActive } from "#web/api/employees/employees.mutations.ts";
import { useEmployeeStatistics, useEmployees } from "#web/api/employees/employees.queries.ts";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "#web/components/ui/select.tsx";
import type { StatusChangeData } from "#web/features/employees/components/StatusChangeDialog.tsx";
import { StatusChangeDialog } from "#web/features/employees/components/StatusChangeDialog.tsx";
import type { EmployeeFilter, EmployeeListItem, EmployeeStatus, EmployeeType } from "#web/types/employee.ts";

const EMPLOYEE_TYPE_ALL = "__all__";
const EMPLOYEE_STATUS_ALL = "__all__";
const ACTIVE_STATUSES: EmployeeStatus[] = ["ACTIVE", "ON_LEAVE", "SUSPENDED"];

const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
	const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
		ACTIVE: "default",
		INACTIVE: "secondary",
		ON_LEAVE: "outline",
		SUSPENDED: "destructive",
		RETIRED: "secondary",
		TERMINATED: "destructive",
		DECEASED: "secondary",
	} as const;
	return variants[status] ?? "secondary";
};

const getTypeVariant = (type: string): "default" | "secondary" | "outline" => {
	const variants: Record<string, "default" | "secondary" | "outline"> = {
		MILITARY: "default",
		CIVILIAN: "secondary",
		TEMPORARY: "outline",
	} as const;
	return variants[type] ?? "secondary";
};

export const EmployeesListPage = React.memo(
	() => {
		const { t } = useTranslation("employees");
		const { t: tCommon } = useTranslation("common");
		const navigate = useNavigate();

		const [statusChangeOpen, setStatusChangeOpen] = React.useState(false);
		const [selectedEmployee, setSelectedEmployee] = React.useState<EmployeeListItem | undefined>();
		const [filter, setFilter] = React.useState<EmployeeFilter>({});
		const [statusFilter, setStatusFilter] = React.useState<string>(EMPLOYEE_STATUS_ALL);

		const effectiveFilter = React.useMemo(() => {
			if (statusFilter === EMPLOYEE_STATUS_ALL) {
				return filter;
			}
			return { ...filter, status: statusFilter as EmployeeStatus };
		}, [filter, statusFilter]);

		const { data: employeesData, isLoading } = useEmployees(effectiveFilter);
		const { data: statistics } = useEmployeeStatistics();
		const changeStatusMutation = useChangeEmployeeStatus();
		const returnToActiveMutation = useReturnToActive();

		const employees = React.useMemo(() => {
			const data = employeesData?.data ?? [];
			if (statusFilter === EMPLOYEE_STATUS_ALL) {
				return data.filter((emp) => ACTIVE_STATUSES.includes(emp.status));
			}
			return data;
		}, [employeesData?.data, statusFilter]);

		const handleCreate = React.useCallback(() => {
			navigate("/employees/register");
		}, [navigate]);

		const handleView = React.useCallback(
			(employee: EmployeeListItem) => {
				navigate(`/employees/${employee.id}`);
			},
			[navigate],
		);

		const handleEdit = React.useCallback(
			(employee: EmployeeListItem) => {
				navigate(`/employees/${employee.id}/edit`);
			},
			[navigate],
		);

		const handleStatusChangeClick = React.useCallback((employee: EmployeeListItem) => {
			setSelectedEmployee(employee);
			setStatusChangeOpen(true);
		}, []);

		const handleStatusChangeConfirm = React.useCallback(
			(data: StatusChangeData) => {
				if (selectedEmployee) {
					changeStatusMutation.mutate(
						{
							id: selectedEmployee.id,
							data: {
								status: data.status,
								reason: data.reason,
								effectiveDate: data.effectiveDate,
								endDate: data.endDate,
								notes: data.notes,
							},
						},
						{
							onSuccess: () => {
								toast.success(tCommon("success"));
								setStatusChangeOpen(false);
								setSelectedEmployee(undefined);
							},
							onError: () => {
								toast.error(tCommon("error"));
							},
						},
					);
				}
			},
			[selectedEmployee, changeStatusMutation, tCommon],
		);

		const handleReturnToActive = React.useCallback(() => {
			if (selectedEmployee) {
				returnToActiveMutation.mutate(selectedEmployee.id, {
					onSuccess: () => {
						toast.success(tCommon("success"));
						setStatusChangeOpen(false);
						setSelectedEmployee(undefined);
					},
					onError: () => {
						toast.error(tCommon("error"));
					},
				});
			}
		}, [selectedEmployee, returnToActiveMutation, tCommon]);

		const handleStatusFilterChange = React.useCallback((value: string) => {
			setStatusFilter(value);
		}, []);

		const handleTypeFilterChange = React.useCallback((value: string) => {
			setFilter((prev) => ({
				...prev,
				employeeType: value === EMPLOYEE_TYPE_ALL ? undefined : (value as EmployeeType),
			}));
		}, []);

		const { i18n } = useTranslation();
		const isAmharic = i18n.language === "am";

		const columns = React.useMemo<ColumnDef<EmployeeListItem>[]>(
			() => [
				{
					accessorKey: "employeeId",
					header: t("employeeId"),
					cell: ({ row }) => <span className="font-mono font-medium">{row.getValue("employeeId")}</span>,
				},
				{
					accessorKey: "fullName",
					header: t("fullName"),
					cell: ({ row }) => {
						const employee = row.original;
						const displayName = isAmharic && employee.fullNameAm ? employee.fullNameAm : employee.fullName;
						return <span className="font-medium">{displayName}</span>;
					},
				},
				{
					accessorKey: "employeeType",
					header: t("employeeType"),
					cell: ({ row }) => {
						const type = row.getValue("employeeType") as string;
						return <Badge variant={getTypeVariant(type)}>{t(`types.${type}`)}</Badge>;
					},
				},
				{
					accessorKey: "gender",
					header: t("gender"),
					cell: ({ row }) => t(`genders.${row.getValue("gender")}`),
				},
				{
					accessorKey: "departmentName",
					header: t("department"),
					cell: ({ row }) => row.getValue("departmentName") || "-",
				},
				{
					accessorKey: "positionName",
					header: t("position"),
					cell: ({ row }) => row.getValue("positionName") || "-",
				},
				{
					accessorKey: "rankName",
					header: t("rank"),
					cell: ({ row }) => row.getValue("rankName") || "-",
				},
				{
					accessorKey: "status",
					header: t("status"),
					cell: ({ row }) => {
						const status = row.getValue("status") as string;
						return <Badge variant={getStatusVariant(status)}>{t(`statuses.${status}`)}</Badge>;
					},
				},
				{
					id: "actions",
					header: tCommon("actions"),
					cell: ({ row }) => {
						const employee = row.original;
						return (
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button variant="ghost" size="icon" className="h-8 w-8">
										<MoreHorizontal className="h-4 w-4" />
										<span className="sr-only">{tCommon("actions")}</span>
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align="end">
									<DropdownMenuItem onClick={() => handleView(employee)}>
										<Eye className="mr-2 h-4 w-4" />
										{tCommon("view")}
									</DropdownMenuItem>
									<DropdownMenuItem onClick={() => handleEdit(employee)}>
										<Pencil className="mr-2 h-4 w-4" />
										{tCommon("edit")}
									</DropdownMenuItem>
									<DropdownMenuItem onClick={() => handleStatusChangeClick(employee)} className="text-destructive">
										<UserMinus className="mr-2 h-4 w-4" />
										{t("changeEmployeeStatus")}
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						);
					},
				},
			],
			[t, tCommon, handleView, handleEdit, handleStatusChangeClick, isAmharic],
		);

		return (
			<div className="space-y-6">
				<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
					<div>
						<h1 className="text-2xl font-bold">{t("title")}</h1>
						<p className="text-muted-foreground">{t("subtitle")}</p>
					</div>
					<Button onClick={handleCreate} className="w-full sm:w-auto">
						<Plus className="mr-2 h-4 w-4" />
						{t("create")}
					</Button>
				</div>

				{statistics && (
					<div className="grid gap-4 grid-cols-2 md:grid-cols-4">
						<Card>
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="text-sm font-medium">{t("statistics.total")}</CardTitle>
								<Users className="h-4 w-4 text-muted-foreground" />
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">{statistics.total}</div>
							</CardContent>
						</Card>
						<Card>
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="text-sm font-medium">{t("statistics.military")}</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">{statistics.byType.MILITARY ?? 0}</div>
							</CardContent>
						</Card>
						<Card>
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="text-sm font-medium">{t("statistics.civilian")}</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">{statistics.byType.CIVILIAN ?? 0}</div>
							</CardContent>
						</Card>
						<Card>
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="text-sm font-medium">{t("statistics.temporary")}</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">{statistics.byType.TEMPORARY ?? 0}</div>
							</CardContent>
						</Card>
					</div>
				)}

				<Card>
					<CardHeader>
						<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
							<CardTitle>{t("title")}</CardTitle>
							<div className="flex gap-2">
								<Select value={filter.employeeType ?? EMPLOYEE_TYPE_ALL} onValueChange={handleTypeFilterChange}>
									<SelectTrigger className="w-[150px]">
										<SelectValue placeholder={t("selectType")} />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value={EMPLOYEE_TYPE_ALL}>{tCommon("all")}</SelectItem>
										<SelectItem value="MILITARY">{t("types.MILITARY")}</SelectItem>
										<SelectItem value="CIVILIAN">{t("types.CIVILIAN")}</SelectItem>
										<SelectItem value="TEMPORARY">{t("types.TEMPORARY")}</SelectItem>
									</SelectContent>
								</Select>
								<Select value={statusFilter} onValueChange={handleStatusFilterChange}>
									<SelectTrigger className="w-[150px]">
										<SelectValue placeholder={t("selectStatus")} />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value={EMPLOYEE_STATUS_ALL}>{tCommon("all")}</SelectItem>
										<SelectItem value="ACTIVE">{t("statuses.ACTIVE")}</SelectItem>
										<SelectItem value="ON_LEAVE">{t("statuses.ON_LEAVE")}</SelectItem>
										<SelectItem value="SUSPENDED">{t("statuses.SUSPENDED")}</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</div>
					</CardHeader>
					<CardContent>
						<DataTable columns={columns} data={employees} isLoading={isLoading} searchColumn="fullName" />
					</CardContent>
				</Card>

				<StatusChangeDialog
					open={statusChangeOpen}
					onOpenChange={setStatusChangeOpen}
					employeeName={selectedEmployee?.fullName ?? ""}
					currentStatus={selectedEmployee?.status}
					onConfirm={handleStatusChangeConfirm}
					onReturnToActive={handleReturnToActive}
					isLoading={changeStatusMutation.isPending || returnToActiveMutation.isPending}
				/>
			</div>
		);
	},
	() => true,
);

EmployeesListPage.displayName = "EmployeesListPage";
