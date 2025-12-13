import type { ColumnDef } from "@tanstack/react-table";
import { Download, Eye, RotateCcw, UserCheck, Users } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useReturnToActive } from "#web/api/employees/employees.mutations.ts";
import { useEmployees } from "#web/api/employees/employees.queries.ts";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "#web/components/ui/select.tsx";
import type { EmployeeFilter, EmployeeListItem, EmployeeStatus, EmployeeType } from "#web/types/employee.ts";

const EMPLOYEE_TYPE_ALL = "__all__";
const EMPLOYEE_STATUS_ALL = "__all__";
const FORMER_STATUSES: EmployeeStatus[] = ["TERMINATED", "RETIRED", "DECEASED", "INACTIVE"];

const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
	const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
		TERMINATED: "destructive",
		RETIRED: "secondary",
		DECEASED: "outline",
		INACTIVE: "secondary",
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

const exportToCSV = (data: EmployeeListItem[], t: (key: string) => string): void => {
	const headers = [
		t("employeeId"),
		t("fullName"),
		t("employeeType"),
		t("gender"),
		t("department"),
		t("position"),
		t("status"),
	];

	const rows = data.map((emp) => [
		emp.employeeId,
		emp.fullName,
		emp.employeeType,
		emp.gender,
		emp.departmentName ?? "",
		emp.positionName ?? "",
		emp.status,
	]);

	const csvContent = [headers.join(","), ...rows.map((row) => row.map((cell) => `"${cell}"`).join(","))].join("\n");

	const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
	const link = document.createElement("a");
	link.href = URL.createObjectURL(blob);
	link.download = `former-employees-${new Date().toISOString().split("T")[0]}.csv`;
	link.click();
	URL.revokeObjectURL(link.href);
};

export const FormerEmployeesPage = React.memo(
	() => {
		const { t } = useTranslation("employees");
		const { t: tCommon } = useTranslation("common");
		const navigate = useNavigate();

		const [returnToActiveOpen, setReturnToActiveOpen] = React.useState(false);
		const [selectedEmployee, setSelectedEmployee] = React.useState<EmployeeListItem | undefined>();
		const [filter, setFilter] = React.useState<EmployeeFilter>({});
		const [statusFilter, setStatusFilter] = React.useState<string>(EMPLOYEE_STATUS_ALL);

		const effectiveFilter = React.useMemo(() => {
			if (statusFilter !== EMPLOYEE_STATUS_ALL) {
				return { ...filter, status: statusFilter as EmployeeStatus };
			}
			return filter;
		}, [filter, statusFilter]);

		const { data: employeesData, isLoading } = useEmployees(effectiveFilter);
		const returnToActiveMutation = useReturnToActive();

		const employees = React.useMemo(() => {
			const data = employeesData?.data ?? [];
			if (statusFilter === EMPLOYEE_STATUS_ALL) {
				return data.filter((emp) => FORMER_STATUSES.includes(emp.status));
			}
			return data;
		}, [employeesData?.data, statusFilter]);

		const statistics = React.useMemo(() => {
			const allData = employeesData?.data ?? [];
			const formerEmployees = allData.filter((emp) => FORMER_STATUSES.includes(emp.status));
			return {
				total: formerEmployees.length,
				terminated: formerEmployees.filter((emp) => emp.status === "TERMINATED").length,
				retired: formerEmployees.filter((emp) => emp.status === "RETIRED").length,
				deceased: formerEmployees.filter((emp) => emp.status === "DECEASED").length,
			};
		}, [employeesData?.data]);

		const handleView = React.useCallback(
			(employee: EmployeeListItem) => {
				navigate(`/employees/${employee.id}`);
			},
			[navigate],
		);

		const handleReturnToActiveClick = React.useCallback((employee: EmployeeListItem) => {
			setSelectedEmployee(employee);
			setReturnToActiveOpen(true);
		}, []);

		const handleReturnToActiveConfirm = React.useCallback(() => {
			if (selectedEmployee) {
				returnToActiveMutation.mutate(selectedEmployee.id, {
					onSuccess: () => {
						toast.success(tCommon("success"));
						setReturnToActiveOpen(false);
						setSelectedEmployee(undefined);
					},
					onError: () => {
						toast.error(tCommon("error"));
					},
				});
			}
		}, [selectedEmployee, returnToActiveMutation, tCommon]);

		const handleTypeFilterChange = React.useCallback((value: string) => {
			setFilter((prev) => ({
				...prev,
				employeeType: value === EMPLOYEE_TYPE_ALL ? undefined : (value as EmployeeType),
			}));
		}, []);

		const handleStatusFilterChange = React.useCallback((value: string) => {
			setStatusFilter(value);
		}, []);

		const handleExportCSV = React.useCallback(() => {
			exportToCSV(employees, t);
			toast.success(`${t("export")} CSV`);
		}, [employees, t]);

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
						const canReturnToActive = employee.status === "SUSPENDED" || employee.status === "INACTIVE";

						return (
							<div className="flex gap-1">
								<Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleView(employee)}>
									<Eye className="h-4 w-4" />
									<span className="sr-only">{tCommon("view")}</span>
								</Button>
								{canReturnToActive && (
									<Button
										variant="ghost"
										size="icon"
										className="h-8 w-8 text-green-600 hover:text-green-700"
										onClick={() => handleReturnToActiveClick(employee)}
									>
										<RotateCcw className="h-4 w-4" />
										<span className="sr-only">{t("returnToActive")}</span>
									</Button>
								)}
							</div>
						);
					},
				},
			],
			[t, tCommon, handleView, handleReturnToActiveClick, isAmharic],
		);

		return (
			<div className="space-y-6">
				<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
					<div>
						<h1 className="text-2xl font-bold">{t("formerEmployees")}</h1>
						<p className="text-muted-foreground">{t("formerEmployeesSubtitle")}</p>
					</div>
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="outline">
								<Download className="mr-2 h-4 w-4" />
								{t("export")}
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DropdownMenuItem onClick={handleExportCSV}>{t("exportAs")} CSV</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>

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
							<CardTitle className="text-sm font-medium">{t("statuses.TERMINATED")}</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold text-red-600">{statistics.terminated}</div>
						</CardContent>
					</Card>
					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">{t("statuses.RETIRED")}</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold text-blue-600">{statistics.retired}</div>
						</CardContent>
					</Card>
					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">{t("statuses.DECEASED")}</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold text-gray-600">{statistics.deceased}</div>
						</CardContent>
					</Card>
				</div>

				<Card>
					<CardHeader>
						<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
							<CardTitle>{t("formerEmployees")}</CardTitle>
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
										<SelectValue placeholder={t("filterByStatus")} />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value={EMPLOYEE_STATUS_ALL}>{t("allStatuses")}</SelectItem>
										<SelectItem value="TERMINATED">{t("statuses.TERMINATED")}</SelectItem>
										<SelectItem value="RETIRED">{t("statuses.RETIRED")}</SelectItem>
										<SelectItem value="DECEASED">{t("statuses.DECEASED")}</SelectItem>
										<SelectItem value="INACTIVE">{t("statuses.INACTIVE")}</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</div>
					</CardHeader>
					<CardContent>
						{employees.length === 0 && !isLoading ? (
							<div className="flex flex-col items-center justify-center py-12 text-center">
								<UserCheck className="h-12 w-12 text-muted-foreground mb-4" />
								<p className="text-muted-foreground">{t("noFormerEmployees")}</p>
							</div>
						) : (
							<DataTable columns={columns} data={employees} isLoading={isLoading} searchColumn="fullName" />
						)}
					</CardContent>
				</Card>

				<ConfirmDialog
					open={returnToActiveOpen}
					onOpenChange={setReturnToActiveOpen}
					title={t("returnToActive")}
					description={t("returnToActiveConfirm")}
					onConfirm={handleReturnToActiveConfirm}
					isLoading={returnToActiveMutation.isPending}
				/>
			</div>
		);
	},
	() => true,
);

FormerEmployeesPage.displayName = "FormerEmployeesPage";
