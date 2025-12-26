import { ChevronDown, ChevronRight, Network, Search, UserMinus, UserPlus, Users } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useCenters } from "#web/api/centers/centers.queries.ts";
import {
	useAssignSuperior,
	useBulkAssignSuperior,
	useRemoveSuperior,
} from "#web/api/employees/employee-superior.mutations.ts";
import { useOrgChart, useSuperiorAssignmentList } from "#web/api/employees/employee-superior.queries.ts";
import { EmployeeSearch } from "#web/components/common/EmployeeSearch.tsx";
import { Badge } from "#web/components/ui/badge.tsx";
import { Button } from "#web/components/ui/button.tsx";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "#web/components/ui/card.tsx";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "#web/components/ui/dialog.tsx";
import { Input } from "#web/components/ui/input.tsx";
import { Label } from "#web/components/ui/label.tsx";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "#web/components/ui/select.tsx";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "#web/components/ui/tabs.tsx";
import { Textarea } from "#web/components/ui/textarea.tsx";
import type { Employee } from "#web/types/employee.ts";
import type { EmployeeWithSuperior, OrgChartNode } from "#web/types/employee-superior.ts";

interface AssignFormState {
	superiorId: string;
	effectiveDate: string;
	reason: string;
	remarks: string;
}

const INITIAL_FORM: AssignFormState = {
	superiorId: "",
	effectiveDate: new Date().toISOString().split("T")[0],
	reason: "",
	remarks: "",
} as const;

const OrgChartNodeComponent = React.memo(
	({ node, level, isAmharic }: { node: OrgChartNode; level: number; isAmharic: boolean }) => {
		const [expanded, setExpanded] = React.useState(level < 2);
		const hasChildren = node.subordinates && node.subordinates.length > 0;

		const toggleExpand = React.useCallback(() => {
			setExpanded((prev) => !prev);
		}, []);

		return (
			<div className="ml-4">
				<div
					className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 cursor-pointer"
					onClick={toggleExpand}
				>
					{hasChildren ? (
						expanded ? (
							<ChevronDown className="h-4 w-4 text-muted-foreground" />
						) : (
							<ChevronRight className="h-4 w-4 text-muted-foreground" />
						)
					) : (
						<span className="w-4" />
					)}
					<div className="flex-1">
						<p className="font-medium text-sm">{isAmharic && node.fullNameAm ? node.fullNameAm : node.fullName}</p>
						<p className="text-xs text-muted-foreground">
							{node.position ? (isAmharic && node.position.nameAm ? node.position.nameAm : node.position.name) : "-"}
						</p>
					</div>
					{hasChildren && (
						<Badge variant="secondary" className="text-xs">
							{node.subordinates?.length}
						</Badge>
					)}
				</div>
				{expanded && hasChildren && (
					<div className="border-l-2 border-muted ml-2">
						{node.subordinates?.map((child) => (
							<OrgChartNodeComponent key={child.id} node={child} level={level + 1} isAmharic={isAmharic} />
						))}
					</div>
				)}
			</div>
		);
	},
	(prev, next) => prev.node.id === next.node.id && prev.level === next.level && prev.isAmharic === next.isAmharic,
);

OrgChartNodeComponent.displayName = "OrgChartNodeComponent";

export const DirectSuperiorPage = React.memo(
	() => {
		const { t } = useTranslation("employees");
		const { t: tCommon } = useTranslation("common");
		const { i18n } = useTranslation();
		const isAmharic = i18n.language === "am";

		const [activeTab, setActiveTab] = React.useState("list");
		const [searchTerm, setSearchTerm] = React.useState("");
		const [selectedCenterId, setSelectedCenterId] = React.useState<string>("");
		const [assignDialogOpen, setAssignDialogOpen] = React.useState(false);
		const [bulkDialogOpen, setBulkDialogOpen] = React.useState(false);
		const [removeDialogOpen, setRemoveDialogOpen] = React.useState(false);
		const [selectedEmployee, setSelectedEmployee] = React.useState<EmployeeWithSuperior | null>(null);
		const [selectedEmployees, setSelectedEmployees] = React.useState<string[]>([]);
		const [assignForm, setAssignForm] = React.useState<AssignFormState>(INITIAL_FORM);
		const [selectedSuperior, setSelectedSuperior] = React.useState<Employee | null>(null);

		const { data: centersData } = useCenters();
		const { data: assignmentList, isLoading } = useSuperiorAssignmentList(selectedCenterId || undefined);
		const { data: orgChartData } = useOrgChart(selectedCenterId || undefined, undefined, activeTab === "orgchart");

		const assignMutation = useAssignSuperior();
		const bulkAssignMutation = useBulkAssignSuperior();
		const removeMutation = useRemoveSuperior();

		const centers = React.useMemo(() => centersData ?? [], [centersData]);
		const employees = React.useMemo(() => assignmentList ?? [], [assignmentList]);
		const orgChart = React.useMemo(() => orgChartData ?? [], [orgChartData]);

		const filteredEmployees = React.useMemo(() => {
			if (!searchTerm) return employees;
			const term = searchTerm.toLowerCase();
			return employees.filter(
				(emp) =>
					emp.fullName.toLowerCase().includes(term) ||
					emp.employeeId.toLowerCase().includes(term) ||
					(emp.fullNameAm && emp.fullNameAm.includes(term)),
			);
		}, [employees, searchTerm]);

		const handleSearchChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
			setSearchTerm(e.target.value);
		}, []);

		const handleCenterChange = React.useCallback((value: string) => {
			setSelectedCenterId(value === "all" ? "" : value);
		}, []);

		const handleOpenAssignDialog = React.useCallback((employee: EmployeeWithSuperior) => {
			setSelectedEmployee(employee);
			setSelectedSuperior(null);
			setAssignForm(INITIAL_FORM);
			setAssignDialogOpen(true);
		}, []);

		const handleOpenBulkDialog = React.useCallback(() => {
			if (selectedEmployees.length === 0) {
				toast.error(t("superior.selectEmployees"));
				return;
			}
			setSelectedSuperior(null);
			setAssignForm(INITIAL_FORM);
			setBulkDialogOpen(true);
		}, [selectedEmployees.length, t]);

		const handleOpenRemoveDialog = React.useCallback((employee: EmployeeWithSuperior) => {
			setSelectedEmployee(employee);
			setAssignForm(INITIAL_FORM);
			setRemoveDialogOpen(true);
		}, []);

		const handleFormChange = React.useCallback((field: keyof AssignFormState, value: string) => {
			setAssignForm((prev) => ({ ...prev, [field]: value }));
		}, []);

		const handleToggleSelect = React.useCallback((employeeId: string) => {
			setSelectedEmployees((prev) =>
				prev.includes(employeeId) ? prev.filter((id) => id !== employeeId) : [...prev, employeeId],
			);
		}, []);

		const handleSelectAll = React.useCallback(() => {
			setSelectedEmployees((prev) =>
				prev.length === filteredEmployees.length ? [] : filteredEmployees.map((e) => e.id),
			);
		}, [filteredEmployees]);

		const handleSuperiorFound = React.useCallback((employee: Employee) => {
			setSelectedSuperior(employee);
			setAssignForm((prev) => ({ ...prev, superiorId: employee.employeeId }));
		}, []);

		const handleClearSuperior = React.useCallback(() => {
			setSelectedSuperior(null);
			setAssignForm((prev) => ({ ...prev, superiorId: "" }));
		}, []);

		const handleAssignSuperior = React.useCallback(() => {
			if (!selectedEmployee || !assignForm.superiorId || !assignForm.effectiveDate) {
				toast.error(tCommon("fillRequired"));
				return;
			}

			if (selectedEmployee.id === assignForm.superiorId) {
				toast.error(t("superior.cannotSelfAssign"));
				return;
			}

			assignMutation.mutate(
				{
					employeeId: selectedEmployee.id,
					data: {
						superiorId: assignForm.superiorId,
						effectiveDate: new Date(assignForm.effectiveDate).toISOString(),
						reason: assignForm.reason || undefined,
						remarks: assignForm.remarks || undefined,
					},
				},
				{
					onSuccess: () => {
						toast.success(t("superior.assigned"));
						setAssignDialogOpen(false);
						setSelectedEmployee(null);
						setSelectedSuperior(null);
					},
					onError: (error: Error) => {
						toast.error(error.message || tCommon("error"));
					},
				},
			);
		}, [selectedEmployee, assignForm, assignMutation, t, tCommon]);

		const handleBulkAssign = React.useCallback(() => {
			if (selectedEmployees.length === 0 || !assignForm.superiorId || !assignForm.effectiveDate) {
				toast.error(tCommon("fillRequired"));
				return;
			}

			if (selectedEmployees.includes(assignForm.superiorId)) {
				toast.error(t("superior.superiorInList"));
				return;
			}

			bulkAssignMutation.mutate(
				{
					employeeIds: selectedEmployees,
					superiorId: assignForm.superiorId,
					effectiveDate: new Date(assignForm.effectiveDate).toISOString(),
					reason: assignForm.reason || undefined,
					remarks: assignForm.remarks || undefined,
				},
				{
					onSuccess: (data) => {
						toast.success(t("superior.bulkAssigned", { count: data.updated }));
						setBulkDialogOpen(false);
						setSelectedEmployees([]);
						setSelectedSuperior(null);
					},
					onError: (error: Error) => {
						toast.error(error.message || tCommon("error"));
					},
				},
			);
		}, [selectedEmployees, assignForm, bulkAssignMutation, t, tCommon]);

		const handleRemoveSuperior = React.useCallback(() => {
			if (!selectedEmployee || !assignForm.effectiveDate) {
				toast.error(tCommon("fillRequired"));
				return;
			}

			removeMutation.mutate(
				{
					employeeId: selectedEmployee.id,
					data: {
						effectiveDate: new Date(assignForm.effectiveDate).toISOString(),
						reason: assignForm.reason || undefined,
						remarks: assignForm.remarks || undefined,
					},
				},
				{
					onSuccess: () => {
						toast.success(t("superior.removed"));
						setRemoveDialogOpen(false);
						setSelectedEmployee(null);
					},
					onError: (error: Error) => {
						toast.error(error.message || tCommon("error"));
					},
				},
			);
		}, [selectedEmployee, assignForm, removeMutation, t, tCommon]);

		const renderEmployeeRow = React.useCallback(
			(emp: EmployeeWithSuperior) => (
				<div
					key={emp.id}
					className="flex items-center gap-4 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
				>
					<input
						type="checkbox"
						checked={selectedEmployees.includes(emp.id)}
						onChange={() => handleToggleSelect(emp.id)}
						className="h-4 w-4 rounded border-gray-300"
					/>
					<div className="flex-1 min-w-0">
						<p className="font-medium truncate">{isAmharic && emp.fullNameAm ? emp.fullNameAm : emp.fullName}</p>
						<p className="text-sm text-muted-foreground">{emp.employeeId}</p>
					</div>
					<div className="hidden md:block flex-1 min-w-0">
						<p className="text-sm">
							{emp.position ? (isAmharic && emp.position.nameAm ? emp.position.nameAm : emp.position.name) : "-"}
						</p>
						<p className="text-xs text-muted-foreground">
							{emp.department
								? isAmharic && emp.department.nameAm
									? emp.department.nameAm
									: emp.department.name
								: "-"}
						</p>
					</div>
					<div className="flex-1 min-w-0">
						{emp.directSuperior ? (
							<div>
								<p className="text-sm font-medium">
									{isAmharic && emp.directSuperior.fullNameAm
										? emp.directSuperior.fullNameAm
										: emp.directSuperior.fullName}
								</p>
								<p className="text-xs text-muted-foreground">{emp.directSuperior.employeeId}</p>
							</div>
						) : (
							<Badge variant="outline">{t("superior.noSuperior")}</Badge>
						)}
					</div>
					<div className="text-center">
						<Badge variant="secondary">{emp.subordinateCount}</Badge>
					</div>
					<div className="flex gap-1">
						<Button size="sm" variant="ghost" onClick={() => handleOpenAssignDialog(emp)} title={t("superior.assign")}>
							<UserPlus className="h-4 w-4" />
						</Button>
						{emp.directSuperior && (
							<Button
								size="sm"
								variant="ghost"
								onClick={() => handleOpenRemoveDialog(emp)}
								title={t("superior.remove")}
							>
								<UserMinus className="h-4 w-4" />
							</Button>
						)}
					</div>
				</div>
			),
			[selectedEmployees, isAmharic, t, handleToggleSelect, handleOpenAssignDialog, handleOpenRemoveDialog],
		);

		return (
			<div className="space-y-6">
				<div>
					<h1 className="text-2xl font-bold">{t("superior.title")}</h1>
					<p className="text-muted-foreground">{t("superior.subtitle")}</p>
				</div>

				<Tabs value={activeTab} onValueChange={setActiveTab}>
					<TabsList>
						<TabsTrigger value="list">
							<Users className="h-4 w-4 mr-2" />
							{t("superior.assignmentList")}
						</TabsTrigger>
						<TabsTrigger value="orgchart">
							<Network className="h-4 w-4 mr-2" />
							{t("superior.orgChart")}
						</TabsTrigger>
					</TabsList>

					<TabsContent value="list" className="space-y-4">
						<Card>
							<CardHeader>
								<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
									<div>
										<CardTitle>{t("superior.employees")}</CardTitle>
										<CardDescription>{t("superior.employeesDesc")}</CardDescription>
									</div>
									<div className="flex gap-2">
										<Select value={selectedCenterId || "all"} onValueChange={handleCenterChange}>
											<SelectTrigger className="w-48">
												<SelectValue placeholder={t("selectCenter")} />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="all">{tCommon("all")}</SelectItem>
												{centers.map((center) => (
													<SelectItem key={center.id} value={center.id}>
														{isAmharic && center.nameAm ? center.nameAm : center.name}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
										<Button onClick={handleOpenBulkDialog} disabled={selectedEmployees.length === 0}>
											<UserPlus className="h-4 w-4 mr-2" />
											{t("superior.bulkAssign")} ({selectedEmployees.length})
										</Button>
									</div>
								</div>
							</CardHeader>
							<CardContent>
								<div className="space-y-4">
									<div className="flex gap-2">
										<div className="relative flex-1">
											<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
											<Input
												placeholder={t("superior.searchPlaceholder")}
												value={searchTerm}
												onChange={handleSearchChange}
												className="pl-10"
											/>
										</div>
										<Button variant="secondary" onClick={() => setSearchTerm("")}>
											{tCommon("clear")}
										</Button>
									</div>

									<div className="flex items-center gap-4 p-2 bg-muted/50 rounded-lg text-sm font-medium">
										<input
											type="checkbox"
											checked={selectedEmployees.length === filteredEmployees.length && filteredEmployees.length > 0}
											onChange={handleSelectAll}
											className="h-4 w-4 rounded border-gray-300"
										/>
										<span className="flex-1">{t("superior.employee")}</span>
										<span className="hidden md:block flex-1">{t("superior.positionDept")}</span>
										<span className="flex-1">{t("superior.directSuperior")}</span>
										<span className="w-16 text-center">{t("superior.subordinates")}</span>
										<span className="w-20">{tCommon("actions")}</span>
									</div>

									{isLoading ? (
										<div className="text-center py-8 text-muted-foreground">{tCommon("loading")}</div>
									) : filteredEmployees.length > 0 ? (
										<div className="space-y-2">{filteredEmployees.map(renderEmployeeRow)}</div>
									) : (
										<div className="text-center py-8 text-muted-foreground">{tCommon("noData")}</div>
									)}
								</div>
							</CardContent>
						</Card>
					</TabsContent>

					<TabsContent value="orgchart">
						<Card>
							<CardHeader>
								<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
									<div>
										<CardTitle>{t("superior.orgChart")}</CardTitle>
										<CardDescription>{t("superior.orgChartDesc")}</CardDescription>
									</div>
									<Select value={selectedCenterId || "all"} onValueChange={handleCenterChange}>
										<SelectTrigger className="w-48">
											<SelectValue placeholder={t("selectCenter")} />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="all">{tCommon("all")}</SelectItem>
											{centers.map((center) => (
												<SelectItem key={center.id} value={center.id}>
													{isAmharic && center.nameAm ? center.nameAm : center.name}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
							</CardHeader>
							<CardContent>
								{orgChart.length > 0 ? (
									<div className="space-y-2">
										{orgChart.map((node) => (
											<OrgChartNodeComponent key={node.id} node={node} level={0} isAmharic={isAmharic} />
										))}
									</div>
								) : (
									<div className="text-center py-8 text-muted-foreground">{tCommon("noData")}</div>
								)}
							</CardContent>
						</Card>
					</TabsContent>
				</Tabs>

				<Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
					<DialogContent className="sm:max-w-lg">
						<DialogHeader>
							<DialogTitle>{t("superior.assignSuperior")}</DialogTitle>
							<DialogDescription>
								{t("superior.assignSuperiorDesc", { name: selectedEmployee?.fullName ?? "" })}
							</DialogDescription>
						</DialogHeader>
						<div className="space-y-4">
							<div className="space-y-2">
								<Label>{t("superior.selectSuperior")} *</Label>
								<EmployeeSearch
									onEmployeeFound={handleSuperiorFound}
									onClear={handleClearSuperior}
									selectedEmployee={selectedSuperior}
								/>
							</div>
							<div className="space-y-2">
								<Label>{t("superior.effectiveDate")} *</Label>
								<Input
									type="date"
									value={assignForm.effectiveDate}
									onChange={(e) => handleFormChange("effectiveDate", e.target.value)}
								/>
							</div>
							<div className="space-y-2">
								<Label>{t("superior.reason")}</Label>
								<Textarea
									value={assignForm.reason}
									onChange={(e) => handleFormChange("reason", e.target.value)}
									rows={2}
								/>
							</div>
							<div className="space-y-2">
								<Label>{t("superior.remarks")}</Label>
								<Textarea
									value={assignForm.remarks}
									onChange={(e) => handleFormChange("remarks", e.target.value)}
									rows={2}
								/>
							</div>
						</div>
						<DialogFooter>
							<Button variant="outline" onClick={() => setAssignDialogOpen(false)}>
								{tCommon("cancel")}
							</Button>
							<Button onClick={handleAssignSuperior} disabled={assignMutation.isPending || !selectedSuperior}>
								{assignMutation.isPending ? tCommon("saving") : tCommon("save")}
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>

				<Dialog open={bulkDialogOpen} onOpenChange={setBulkDialogOpen}>
					<DialogContent className="sm:max-w-lg">
						<DialogHeader>
							<DialogTitle>{t("superior.bulkAssign")}</DialogTitle>
							<DialogDescription>
								{t("superior.bulkAssignDesc", { count: selectedEmployees.length })}
							</DialogDescription>
						</DialogHeader>
						<div className="space-y-4">
							<div className="space-y-2">
								<Label>{t("superior.selectSuperior")} *</Label>
								<EmployeeSearch
									onEmployeeFound={handleSuperiorFound}
									onClear={handleClearSuperior}
									selectedEmployee={selectedSuperior}
								/>
							</div>
							<div className="space-y-2">
								<Label>{t("superior.effectiveDate")} *</Label>
								<Input
									type="date"
									value={assignForm.effectiveDate}
									onChange={(e) => handleFormChange("effectiveDate", e.target.value)}
								/>
							</div>
							<div className="space-y-2">
								<Label>{t("superior.reason")}</Label>
								<Textarea
									value={assignForm.reason}
									onChange={(e) => handleFormChange("reason", e.target.value)}
									rows={2}
								/>
							</div>
						</div>
						<DialogFooter>
							<Button variant="outline" onClick={() => setBulkDialogOpen(false)}>
								{tCommon("cancel")}
							</Button>
							<Button onClick={handleBulkAssign} disabled={bulkAssignMutation.isPending || !selectedSuperior}>
								{bulkAssignMutation.isPending ? tCommon("saving") : t("superior.assignAll")}
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>

				<Dialog open={removeDialogOpen} onOpenChange={setRemoveDialogOpen}>
					<DialogContent className="sm:max-w-lg">
						<DialogHeader>
							<DialogTitle>{t("superior.removeSuperior")}</DialogTitle>
							<DialogDescription>
								{t("superior.removeSuperiorDesc", { name: selectedEmployee?.fullName ?? "" })}
							</DialogDescription>
						</DialogHeader>
						<div className="space-y-4">
							<div className="space-y-2">
								<Label>{t("superior.effectiveDate")} *</Label>
								<Input
									type="date"
									value={assignForm.effectiveDate}
									onChange={(e) => handleFormChange("effectiveDate", e.target.value)}
								/>
							</div>
							<div className="space-y-2">
								<Label>{t("superior.reason")}</Label>
								<Textarea
									value={assignForm.reason}
									onChange={(e) => handleFormChange("reason", e.target.value)}
									rows={2}
								/>
							</div>
						</div>
						<DialogFooter>
							<Button variant="outline" onClick={() => setRemoveDialogOpen(false)}>
								{tCommon("cancel")}
							</Button>
							<Button variant="destructive" onClick={handleRemoveSuperior} disabled={removeMutation.isPending}>
								{removeMutation.isPending ? tCommon("saving") : t("superior.remove")}
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			</div>
		);
	},
	() => true,
);

DirectSuperiorPage.displayName = "DirectSuperiorPage";
