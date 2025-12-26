import { ArrowRight, Building2, Check, Clock, LogOut, MapPin, Send, X } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useCenters } from "#web/api/centers/centers.queries.ts";
import { useDepartments } from "#web/api/departments/departments.queries.ts";
import {
	useAcceptTransfer,
	useCancelTransfer,
	useCreateDeparture,
	useCreateTransferRequest,
	useRejectTransfer,
} from "#web/api/employees/employee-transfer.mutations.ts";
import {
	useAllDepartures,
	useAllTransfers,
	useOutgoingTransfersForCenter,
	usePendingTransfersForCenter,
} from "#web/api/employees/employee-transfer.queries.ts";
import { usePositions } from "#web/api/positions/positions.queries.ts";
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
import { useAuth } from "#web/context/AuthContext.tsx";
import type { Employee } from "#web/types/employee.ts";
import type { TransferRequest, TransferStatus } from "#web/types/employee-transfer.ts";

interface TransferFormState {
	toCenterId: string;
	toDepartmentId: string;
	toPositionId: string;
	effectiveDate: string;
	transferReason: string;
	remarks: string;
	orderNumber: string;
}

interface DepartureFormState {
	departureDate: string;
	departureReason: string;
	destinationOrganization: string;
	remarks: string;
}

const INITIAL_TRANSFER_FORM: TransferFormState = {
	toCenterId: "",
	toDepartmentId: "",
	toPositionId: "",
	effectiveDate: "",
	transferReason: "",
	remarks: "",
	orderNumber: "",
};

const INITIAL_DEPARTURE_FORM: DepartureFormState = {
	departureDate: "",
	departureReason: "",
	destinationOrganization: "",
	remarks: "",
};

const STATUS_COLORS: Record<TransferStatus, string> = {
	PENDING: "bg-yellow-100 text-yellow-800",
	ACCEPTED: "bg-green-100 text-green-800",
	REJECTED: "bg-red-100 text-red-800",
	CANCELLED: "bg-gray-100 text-gray-800",
} as const;

export const EmployeeTransferPage = React.memo(
	() => {
		const { t } = useTranslation("employees");
		const { t: tCommon } = useTranslation("common");
		const { i18n } = useTranslation();
		const isAmharic = i18n.language === "am";
		const { user } = useAuth();

		const [activeTab, setActiveTab] = React.useState("create");
		const [selectedEmployee, setSelectedEmployee] = React.useState<Employee | null>(null);
		const [transferDialogOpen, setTransferDialogOpen] = React.useState(false);
		const [departureDialogOpen, setDepartureDialogOpen] = React.useState(false);
		const [acceptDialogOpen, setAcceptDialogOpen] = React.useState(false);
		const [rejectDialogOpen, setRejectDialogOpen] = React.useState(false);
		const [selectedTransfer, setSelectedTransfer] = React.useState<TransferRequest | null>(null);
		const [transferForm, setTransferForm] = React.useState<TransferFormState>(INITIAL_TRANSFER_FORM);
		const [departureForm, setDepartureForm] = React.useState<DepartureFormState>(INITIAL_DEPARTURE_FORM);
		const [rejectionReason, setRejectionReason] = React.useState("");
		const [acceptDeptId, setAcceptDeptId] = React.useState("");
		const [acceptPosId, setAcceptPosId] = React.useState("");

		const userCenterId = user?.centerId ?? "";

		const { data: centersData } = useCenters();
		const { data: departmentsData } = useDepartments(transferForm.toCenterId || selectedTransfer?.toCenterId);
		const { data: positionsData } = usePositions(transferForm.toDepartmentId || acceptDeptId);
		const { data: pendingTransfers } = usePendingTransfersForCenter(userCenterId, !!userCenterId);
		const { data: outgoingTransfers } = useOutgoingTransfersForCenter(userCenterId, !!userCenterId);
		const { data: allTransfers } = useAllTransfers();
		const { data: departures } = useAllDepartures();

		const createTransferMutation = useCreateTransferRequest();
		const acceptTransferMutation = useAcceptTransfer();
		const rejectTransferMutation = useRejectTransfer();
		const cancelTransferMutation = useCancelTransfer();
		const createDepartureMutation = useCreateDeparture();

		const centers = React.useMemo(() => centersData ?? [], [centersData]);
		const departments = React.useMemo(() => departmentsData ?? [], [departmentsData]);
		const positions = React.useMemo(() => positionsData ?? [], [positionsData]);

		const handleEmployeeFound = React.useCallback((employee: Employee) => {
			setSelectedEmployee(employee);
		}, []);

		const handleEmployeeClear = React.useCallback(() => {
			setSelectedEmployee(null);
		}, []);

		const handleTransferFormChange = React.useCallback((field: keyof TransferFormState, value: string) => {
			setTransferForm((prev) => {
				const newState = { ...prev, [field]: value };
				if (field === "toCenterId") {
					newState.toDepartmentId = "";
					newState.toPositionId = "";
				}
				if (field === "toDepartmentId") {
					newState.toPositionId = "";
				}
				return newState;
			});
		}, []);

		const handleOpenTransferDialog = React.useCallback(() => {
			setTransferForm(INITIAL_TRANSFER_FORM);
			setTransferDialogOpen(true);
		}, []);

		const handleOpenDepartureDialog = React.useCallback(() => {
			setDepartureForm(INITIAL_DEPARTURE_FORM);
			setDepartureDialogOpen(true);
		}, []);

		const handleCreateTransfer = React.useCallback(() => {
			if (
				!selectedEmployee ||
				!transferForm.toCenterId ||
				!transferForm.effectiveDate ||
				!transferForm.transferReason
			) {
				toast.error(tCommon("fillRequired"));
				return;
			}

			createTransferMutation.mutate(
				{
					employeeId: selectedEmployee.id,
					toCenterId: transferForm.toCenterId,
					toDepartmentId: transferForm.toDepartmentId || undefined,
					toPositionId: transferForm.toPositionId || undefined,
					effectiveDate: transferForm.effectiveDate,
					transferReason: transferForm.transferReason,
					remarks: transferForm.remarks || undefined,
					orderNumber: transferForm.orderNumber || undefined,
				},
				{
					onSuccess: () => {
						toast.success(t("transfer.requestCreated"));
						setTransferDialogOpen(false);
						setSelectedEmployee(null);
					},
					onError: (error: Error) => {
						toast.error(error.message || tCommon("error"));
					},
				},
			);
		}, [selectedEmployee, transferForm, createTransferMutation, t, tCommon]);

		const handleCreateDeparture = React.useCallback(() => {
			if (!selectedEmployee || !departureForm.departureDate || !departureForm.departureReason) {
				toast.error(tCommon("fillRequired"));
				return;
			}

			createDepartureMutation.mutate(
				{
					employeeId: selectedEmployee.id,
					departureDate: departureForm.departureDate,
					departureReason: departureForm.departureReason,
					destinationOrganization: departureForm.destinationOrganization || undefined,
					remarks: departureForm.remarks || undefined,
				},
				{
					onSuccess: () => {
						toast.success(t("transfer.departureRecorded"));
						setDepartureDialogOpen(false);
						setSelectedEmployee(null);
					},
					onError: (error: Error) => {
						toast.error(error.message || tCommon("error"));
					},
				},
			);
		}, [selectedEmployee, departureForm, createDepartureMutation, t, tCommon]);

		const handleAcceptTransfer = React.useCallback(() => {
			if (!selectedTransfer) return;

			acceptTransferMutation.mutate(
				{
					transferId: selectedTransfer.id,
					data: {
						departmentId: acceptDeptId || undefined,
						positionId: acceptPosId || undefined,
					},
				},
				{
					onSuccess: () => {
						toast.success(t("transfer.accepted"));
						setAcceptDialogOpen(false);
						setSelectedTransfer(null);
						setAcceptDeptId("");
						setAcceptPosId("");
					},
					onError: (error: Error) => {
						toast.error(error.message || tCommon("error"));
					},
				},
			);
		}, [selectedTransfer, acceptDeptId, acceptPosId, acceptTransferMutation, t, tCommon]);

		const handleRejectTransfer = React.useCallback(() => {
			if (!selectedTransfer || !rejectionReason) {
				toast.error(tCommon("fillRequired"));
				return;
			}

			rejectTransferMutation.mutate(
				{
					transferId: selectedTransfer.id,
					data: { rejectionReason },
				},
				{
					onSuccess: () => {
						toast.success(t("transfer.rejected"));
						setRejectDialogOpen(false);
						setSelectedTransfer(null);
						setRejectionReason("");
					},
					onError: (error: Error) => {
						toast.error(error.message || tCommon("error"));
					},
				},
			);
		}, [selectedTransfer, rejectionReason, rejectTransferMutation, t, tCommon]);

		const handleCancelTransfer = React.useCallback(
			(transfer: TransferRequest) => {
				cancelTransferMutation.mutate(
					{
						transferId: transfer.id,
						data: { cancellationReason: "Cancelled by user" },
					},
					{
						onSuccess: () => {
							toast.success(t("transfer.cancelled"));
						},
						onError: (error: Error) => {
							toast.error(error.message || tCommon("error"));
						},
					},
				);
			},
			[cancelTransferMutation, t, tCommon],
		);

		const openAcceptDialog = React.useCallback((transfer: TransferRequest) => {
			setSelectedTransfer(transfer);
			setAcceptDeptId(transfer.toDepartmentId ?? "");
			setAcceptPosId(transfer.toPositionId ?? "");
			setAcceptDialogOpen(true);
		}, []);

		const openRejectDialog = React.useCallback((transfer: TransferRequest) => {
			setSelectedTransfer(transfer);
			setRejectionReason("");
			setRejectDialogOpen(true);
		}, []);

		const renderTransferCard = React.useCallback(
			(transfer: TransferRequest, showActions: "accept" | "cancel" | "none") => (
				<Card key={transfer.id} className="mb-3">
					<CardContent className="pt-4">
						<div className="flex justify-between items-start mb-2">
							<div>
								<p className="font-medium">{transfer.employee.fullName}</p>
								<p className="text-sm text-muted-foreground">{transfer.employee.employeeId}</p>
							</div>
							<Badge className={STATUS_COLORS[transfer.status]}>{transfer.status}</Badge>
						</div>
						<div className="text-sm space-y-1">
							<div className="flex items-center gap-2">
								<Building2 className="h-3 w-3" />
								<span>{transfer.fromCenter.name}</span>
								<ArrowRight className="h-3 w-3" />
								<span>{transfer.toCenter.name}</span>
							</div>
							<p>
								<strong>{t("transfer.effectiveDate")}:</strong> {new Date(transfer.effectiveDate).toLocaleDateString()}
							</p>
							<p>
								<strong>{t("transfer.transferReason")}:</strong> {transfer.transferReason}
							</p>
							{transfer.rejectionReason && (
								<p className="text-red-600">
									<strong>{t("transfer.rejectionReason")}:</strong> {transfer.rejectionReason}
								</p>
							)}
						</div>
						{showActions === "accept" && transfer.status === "PENDING" && (
							<div className="flex gap-2 mt-3">
								<Button size="sm" onClick={() => openAcceptDialog(transfer)}>
									<Check className="h-3 w-3 mr-1" />
									{t("transfer.accept")}
								</Button>
								<Button size="sm" variant="destructive" onClick={() => openRejectDialog(transfer)}>
									<X className="h-3 w-3 mr-1" />
									{t("transfer.reject")}
								</Button>
							</div>
						)}
						{showActions === "cancel" && transfer.status === "PENDING" && (
							<div className="mt-3">
								<Button
									size="sm"
									variant="outline"
									onClick={() => handleCancelTransfer(transfer)}
									disabled={cancelTransferMutation.isPending}
								>
									<X className="h-3 w-3 mr-1" />
									{t("transfer.cancel")}
								</Button>
							</div>
						)}
					</CardContent>
				</Card>
			),
			[t, openAcceptDialog, openRejectDialog, handleCancelTransfer, cancelTransferMutation.isPending],
		);

		return (
			<div className="space-y-6">
				<div>
					<h1 className="text-2xl font-bold">{t("transfer.title")}</h1>
					<p className="text-muted-foreground">{t("transfer.subtitle")}</p>
				</div>

				<Tabs value={activeTab} onValueChange={setActiveTab}>
					<TabsList className="grid w-full grid-cols-5">
						<TabsTrigger value="create">
							<Send className="h-4 w-4 mr-2" />
							{t("transfer.createRequest")}
						</TabsTrigger>
						<TabsTrigger value="pending">
							<Clock className="h-4 w-4 mr-2" />
							{t("transfer.pendingIncoming")}
							{pendingTransfers && pendingTransfers.length > 0 && (
								<Badge className="ml-2" variant="secondary">
									{pendingTransfers.length}
								</Badge>
							)}
						</TabsTrigger>
						<TabsTrigger value="outgoing">
							<ArrowRight className="h-4 w-4 mr-2" />
							{t("transfer.outgoing")}
						</TabsTrigger>
						<TabsTrigger value="all">
							<Building2 className="h-4 w-4 mr-2" />
							{t("transfer.allTransfers")}
						</TabsTrigger>
						<TabsTrigger value="departures">
							<LogOut className="h-4 w-4 mr-2" />
							{t("transfer.departures")}
						</TabsTrigger>
					</TabsList>

					<TabsContent value="create" className="space-y-4">
						<Card>
							<CardHeader>
								<CardTitle>{tCommon("search")}</CardTitle>
								<CardDescription>{t("transfer.searchEmployee")}</CardDescription>
							</CardHeader>
							<CardContent>
								<EmployeeSearch
									onEmployeeFound={handleEmployeeFound}
									onClear={handleEmployeeClear}
									selectedEmployee={selectedEmployee}
								/>
							</CardContent>
						</Card>

						{selectedEmployee && (
							<>
								<Card>
									<CardHeader className="pb-2">
										<CardTitle className="text-sm">{t("transfer.currentAssignment")}</CardTitle>
									</CardHeader>
									<CardContent>
										<div className="grid gap-2 text-sm">
											<div className="flex justify-between">
												<span className="text-muted-foreground">{t("center")}:</span>
												<span className="font-medium">{selectedEmployee.centerName ?? "-"}</span>
											</div>
											<div className="flex justify-between">
												<span className="text-muted-foreground">{t("department")}:</span>
												<span className="font-medium">{selectedEmployee.departmentName ?? "-"}</span>
											</div>
											<div className="flex justify-between">
												<span className="text-muted-foreground">{t("position")}:</span>
												<span className="font-medium">{selectedEmployee.positionName ?? "-"}</span>
											</div>
										</div>
									</CardContent>
								</Card>

								<div className="flex gap-3">
									<Button onClick={handleOpenTransferDialog}>
										<Send className="mr-2 h-4 w-4" />
										{t("transfer.initiateTransfer")}
									</Button>
									<Button variant="outline" onClick={handleOpenDepartureDialog}>
										<LogOut className="mr-2 h-4 w-4" />
										{t("transfer.recordDeparture")}
									</Button>
								</div>
							</>
						)}
					</TabsContent>

					<TabsContent value="pending">
						<Card>
							<CardHeader>
								<CardTitle>{t("transfer.pendingIncoming")}</CardTitle>
								<CardDescription>{t("transfer.pendingIncomingDesc")}</CardDescription>
							</CardHeader>
							<CardContent>
								{pendingTransfers && pendingTransfers.length > 0 ? (
									pendingTransfers.map((tr) => renderTransferCard(tr, "accept"))
								) : (
									<p className="text-muted-foreground text-center py-8">{t("transfer.noPending")}</p>
								)}
							</CardContent>
						</Card>
					</TabsContent>

					<TabsContent value="outgoing">
						<Card>
							<CardHeader>
								<CardTitle>{t("transfer.outgoing")}</CardTitle>
								<CardDescription>{t("transfer.outgoingDesc")}</CardDescription>
							</CardHeader>
							<CardContent>
								{outgoingTransfers && outgoingTransfers.length > 0 ? (
									outgoingTransfers.map((tr) => renderTransferCard(tr, "cancel"))
								) : (
									<p className="text-muted-foreground text-center py-8">{t("transfer.noOutgoing")}</p>
								)}
							</CardContent>
						</Card>
					</TabsContent>

					<TabsContent value="all">
						<Card>
							<CardHeader>
								<CardTitle>{t("transfer.allTransfers")}</CardTitle>
							</CardHeader>
							<CardContent>
								{allTransfers && allTransfers.length > 0 ? (
									allTransfers.map((tr) => renderTransferCard(tr, "none"))
								) : (
									<p className="text-muted-foreground text-center py-8">{t("transfer.noTransfers")}</p>
								)}
							</CardContent>
						</Card>
					</TabsContent>

					<TabsContent value="departures">
						<Card>
							<CardHeader>
								<CardTitle>{t("transfer.departures")}</CardTitle>
							</CardHeader>
							<CardContent>
								{departures && departures.length > 0 ? (
									departures.map((dep) => (
										<Card key={dep.id} className="mb-3">
											<CardContent className="pt-4">
												<div className="flex justify-between items-start mb-2">
													<div>
														<p className="font-medium">{dep.employee.fullName}</p>
														<p className="text-sm text-muted-foreground">{dep.employee.employeeId}</p>
													</div>
													<Badge variant="destructive">{t("transfer.departed")}</Badge>
												</div>
												<div className="text-sm space-y-1">
													<p>
														<strong>{t("transfer.departureDate")}:</strong>{" "}
														{new Date(dep.departureDate).toLocaleDateString()}
													</p>
													<p>
														<strong>{t("transfer.departureReason")}:</strong> {dep.departureReason}
													</p>
													{dep.destinationOrganization && (
														<p>
															<strong>{t("transfer.destination")}:</strong> {dep.destinationOrganization}
														</p>
													)}
												</div>
											</CardContent>
										</Card>
									))
								) : (
									<p className="text-muted-foreground text-center py-8">{t("transfer.noDepartures")}</p>
								)}
							</CardContent>
						</Card>
					</TabsContent>
				</Tabs>

				<Dialog open={transferDialogOpen} onOpenChange={setTransferDialogOpen}>
					<DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
						<DialogHeader>
							<DialogTitle>{t("transfer.initiateTransfer")}</DialogTitle>
							<DialogDescription>{t("transfer.initiateTransferDesc")}</DialogDescription>
						</DialogHeader>
						<div className="space-y-4">
							<div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
								<Building2 className="h-4 w-4 text-muted-foreground" />
								<span className="text-sm">{selectedEmployee?.centerName ?? "-"}</span>
								<ArrowRight className="h-4 w-4 text-muted-foreground" />
								<MapPin className="h-4 w-4 text-muted-foreground" />
								<span className="text-sm">?</span>
							</div>
							<div className="space-y-2">
								<Label>{t("transfer.targetCenter")} *</Label>
								<Select
									value={transferForm.toCenterId}
									onValueChange={(v) => handleTransferFormChange("toCenterId", v)}
								>
									<SelectTrigger>
										<SelectValue placeholder={t("selectCenter")} />
									</SelectTrigger>
									<SelectContent>
										{centers
											.filter((c) => c.id !== selectedEmployee?.centerId)
											.map((center) => (
												<SelectItem key={center.id} value={center.id}>
													{isAmharic && center.nameAm ? center.nameAm : center.name}
												</SelectItem>
											))}
									</SelectContent>
								</Select>
							</div>
							{transferForm.toCenterId && (
								<div className="space-y-2">
									<Label>{t("transfer.targetDepartment")}</Label>
									<Select
										value={transferForm.toDepartmentId}
										onValueChange={(v) => handleTransferFormChange("toDepartmentId", v)}
									>
										<SelectTrigger>
											<SelectValue placeholder={t("selectDepartment")} />
										</SelectTrigger>
										<SelectContent>
											{departments.map((dept) => (
												<SelectItem key={dept.id} value={dept.id}>
													{isAmharic && dept.nameAm ? dept.nameAm : dept.name}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
							)}
							{transferForm.toDepartmentId && (
								<div className="space-y-2">
									<Label>{t("transfer.targetPosition")}</Label>
									<Select
										value={transferForm.toPositionId}
										onValueChange={(v) => handleTransferFormChange("toPositionId", v)}
									>
										<SelectTrigger>
											<SelectValue placeholder={t("selectPosition")} />
										</SelectTrigger>
										<SelectContent>
											{positions.map((pos) => (
												<SelectItem key={pos.id} value={pos.id}>
													{isAmharic && pos.nameAm ? pos.nameAm : pos.name}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
							)}
							<div className="space-y-2">
								<Label>{t("transfer.effectiveDate")} *</Label>
								<Input
									type="date"
									value={transferForm.effectiveDate}
									onChange={(e) => handleTransferFormChange("effectiveDate", e.target.value)}
								/>
							</div>
							<div className="space-y-2">
								<Label>{t("transfer.orderNumber")}</Label>
								<Input
									value={transferForm.orderNumber}
									onChange={(e) => handleTransferFormChange("orderNumber", e.target.value)}
									placeholder={t("transfer.orderNumber")}
								/>
							</div>
							<div className="space-y-2">
								<Label>{t("transfer.transferReason")} *</Label>
								<Textarea
									value={transferForm.transferReason}
									onChange={(e) => handleTransferFormChange("transferReason", e.target.value)}
									rows={2}
								/>
							</div>
							<div className="space-y-2">
								<Label>{t("transfer.remarks")}</Label>
								<Textarea
									value={transferForm.remarks}
									onChange={(e) => handleTransferFormChange("remarks", e.target.value)}
									rows={2}
								/>
							</div>
						</div>
						<DialogFooter>
							<Button variant="outline" onClick={() => setTransferDialogOpen(false)}>
								{tCommon("cancel")}
							</Button>
							<Button onClick={handleCreateTransfer} disabled={createTransferMutation.isPending}>
								{createTransferMutation.isPending ? tCommon("saving") : t("transfer.submitRequest")}
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>

				<Dialog open={departureDialogOpen} onOpenChange={setDepartureDialogOpen}>
					<DialogContent className="sm:max-w-lg">
						<DialogHeader>
							<DialogTitle>{t("transfer.recordDeparture")}</DialogTitle>
							<DialogDescription>{t("transfer.recordDepartureDesc")}</DialogDescription>
						</DialogHeader>
						<div className="space-y-4">
							<div className="space-y-2">
								<Label>{t("transfer.departureDate")} *</Label>
								<Input
									type="date"
									value={departureForm.departureDate}
									onChange={(e) => setDepartureForm((p) => ({ ...p, departureDate: e.target.value }))}
								/>
							</div>
							<div className="space-y-2">
								<Label>{t("transfer.departureReason")} *</Label>
								<Textarea
									value={departureForm.departureReason}
									onChange={(e) => setDepartureForm((p) => ({ ...p, departureReason: e.target.value }))}
									rows={2}
								/>
							</div>
							<div className="space-y-2">
								<Label>{t("transfer.destination")}</Label>
								<Input
									value={departureForm.destinationOrganization}
									onChange={(e) => setDepartureForm((p) => ({ ...p, destinationOrganization: e.target.value }))}
								/>
							</div>
							<div className="space-y-2">
								<Label>{t("transfer.remarks")}</Label>
								<Textarea
									value={departureForm.remarks}
									onChange={(e) => setDepartureForm((p) => ({ ...p, remarks: e.target.value }))}
									rows={2}
								/>
							</div>
						</div>
						<DialogFooter>
							<Button variant="outline" onClick={() => setDepartureDialogOpen(false)}>
								{tCommon("cancel")}
							</Button>
							<Button onClick={handleCreateDeparture} disabled={createDepartureMutation.isPending}>
								{createDepartureMutation.isPending ? tCommon("saving") : tCommon("save")}
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>

				<Dialog open={acceptDialogOpen} onOpenChange={setAcceptDialogOpen}>
					<DialogContent className="sm:max-w-lg">
						<DialogHeader>
							<DialogTitle>{t("transfer.acceptTransfer")}</DialogTitle>
							<DialogDescription>{t("transfer.acceptTransferDesc")}</DialogDescription>
						</DialogHeader>
						<div className="space-y-4">
							<div className="space-y-2">
								<Label>{t("transfer.targetDepartment")}</Label>
								<Select value={acceptDeptId} onValueChange={setAcceptDeptId}>
									<SelectTrigger>
										<SelectValue placeholder={t("selectDepartment")} />
									</SelectTrigger>
									<SelectContent>
										{departments.map((dept) => (
											<SelectItem key={dept.id} value={dept.id}>
												{isAmharic && dept.nameAm ? dept.nameAm : dept.name}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
							{acceptDeptId && (
								<div className="space-y-2">
									<Label>{t("transfer.targetPosition")}</Label>
									<Select value={acceptPosId} onValueChange={setAcceptPosId}>
										<SelectTrigger>
											<SelectValue placeholder={t("selectPosition")} />
										</SelectTrigger>
										<SelectContent>
											{positions.map((pos) => (
												<SelectItem key={pos.id} value={pos.id}>
													{isAmharic && pos.nameAm ? pos.nameAm : pos.name}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
							)}
						</div>
						<DialogFooter>
							<Button variant="outline" onClick={() => setAcceptDialogOpen(false)}>
								{tCommon("cancel")}
							</Button>
							<Button onClick={handleAcceptTransfer} disabled={acceptTransferMutation.isPending}>
								{acceptTransferMutation.isPending ? tCommon("saving") : t("transfer.accept")}
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>

				<Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
					<DialogContent className="sm:max-w-lg">
						<DialogHeader>
							<DialogTitle>{t("transfer.rejectTransfer")}</DialogTitle>
							<DialogDescription>{t("transfer.rejectTransferDesc")}</DialogDescription>
						</DialogHeader>
						<div className="space-y-4">
							<div className="space-y-2">
								<Label>{t("transfer.rejectionReason")} *</Label>
								<Textarea value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} rows={3} />
							</div>
						</div>
						<DialogFooter>
							<Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
								{tCommon("cancel")}
							</Button>
							<Button variant="destructive" onClick={handleRejectTransfer} disabled={rejectTransferMutation.isPending}>
								{rejectTransferMutation.isPending ? tCommon("saving") : t("transfer.reject")}
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			</div>
		);
	},
	() => true,
);

EmployeeTransferPage.displayName = "EmployeeTransferPage";
