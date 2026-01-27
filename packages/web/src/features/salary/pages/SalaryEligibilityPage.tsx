import { AlertCircle, Calendar, CheckCircle, Clock, RefreshCw, TrendingUp, XCircle } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useCenters } from "#web/api/centers/centers.queries.ts";
import { useRanks } from "#web/api/ranks/ranks.queries.ts";
import {
	useProcessBatchIncrement,
	useProcessIncrement,
	useRejectEligibility,
	useTriggerDailyEligibilityCheck,
} from "#web/api/salary-management/salary-management.mutations.ts";
import {
	useEligibilityList,
	useEligibilitySummary,
	useTodayEligibility,
} from "#web/api/salary-management/salary-management.queries.ts";
import { LoadingSpinner } from "#web/components/common/LoadingSpinner.tsx";
import { Badge } from "#web/components/ui/badge.tsx";
import { Button } from "#web/components/ui/button.tsx";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "#web/components/ui/card.tsx";
import { Checkbox } from "#web/components/ui/checkbox.tsx";
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "#web/components/ui/table.tsx";
import { Textarea } from "#web/components/ui/textarea.tsx";
import type {
	SalaryEligibility,
	SalaryEligibilityQuery,
	SalaryEligibilityStatus,
} from "#web/types/salary-management.ts";

const formatCurrency = (value: string | number | undefined | null): string => {
	if (value === undefined || value === null) return "-";
	const num = typeof value === "string" ? Number.parseFloat(value) : value;
	return new Intl.NumberFormat("en-ET", { style: "currency", currency: "ETB" }).format(num);
};

const formatDate = (date: string | undefined | null): string => {
	if (!date) return "-";
	return new Date(date).toLocaleDateString();
};

const getStatusBadge = (status: SalaryEligibilityStatus, t: (key: string) => string): React.ReactNode => {
	const variants: Record<
		SalaryEligibilityStatus,
		{ variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ReactNode }
	> = {
		PENDING: { variant: "default", icon: <Clock className="h-3 w-3" /> },
		APPROVED: { variant: "secondary", icon: <CheckCircle className="h-3 w-3" /> },
		REJECTED: { variant: "destructive", icon: <XCircle className="h-3 w-3" /> },
		EXPIRED: { variant: "outline", icon: <AlertCircle className="h-3 w-3" /> },
	} as const;

	const { variant, icon } = variants[status];
	return (
		<Badge variant={variant} className="gap-1">
			{icon}
			{t(`eligibility.${status.toLowerCase()}`)}
		</Badge>
	);
};

export const SalaryEligibilityPage = React.memo(() => {
	const { t } = useTranslation("salary-management");
	const { t: tCommon } = useTranslation("common");
	const { i18n } = useTranslation();
	const isAmharic = i18n.language === "am";

	const [filters, setFilters] = React.useState<SalaryEligibilityQuery>({
		page: 1,
		limit: 20,
		status: "PENDING",
	});
	const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());
	const [rejectDialogOpen, setRejectDialogOpen] = React.useState(false);
	const [rejectingId, setRejectingId] = React.useState<string | null>(null);
	const [rejectReason, setRejectReason] = React.useState("");
	const [approveDialogOpen, setApproveDialogOpen] = React.useState(false);
	const [approvingId, setApprovingId] = React.useState<string | null>(null);
	const [effectiveDate, setEffectiveDate] = React.useState("");
	const [notes, setNotes] = React.useState("");

	const { data: eligibilityList, isLoading: isLoadingList } = useEligibilityList(filters);
	const { data: todayEligibility, isLoading: isLoadingToday } = useTodayEligibility();
	const { data: summary, isLoading: isLoadingSummary } = useEligibilitySummary();
	const { data: centers } = useCenters();
	const { data: ranks } = useRanks();

	const processIncrementMutation = useProcessIncrement();
	const processBatchMutation = useProcessBatchIncrement();
	const rejectMutation = useRejectEligibility();
	const triggerCheckMutation = useTriggerDailyEligibilityCheck();

	const handleFilterChange = React.useCallback(
		(key: keyof SalaryEligibilityQuery, value: string | number | undefined) => {
			setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
			setSelectedIds(new Set());
		},
		[],
	);

	const handleSelectAll = React.useCallback(
		(checked: boolean) => {
			if (checked && eligibilityList?.data) {
				setSelectedIds(new Set(eligibilityList.data.filter((e) => e.status === "PENDING").map((e) => e.id)));
			} else {
				setSelectedIds(new Set());
			}
		},
		[eligibilityList?.data],
	);

	const handleSelectOne = React.useCallback((id: string, checked: boolean) => {
		setSelectedIds((prev) => {
			const next = new Set(prev);
			if (checked) {
				next.add(id);
			} else {
				next.delete(id);
			}
			return next;
		});
	}, []);

	const handleApprove = React.useCallback((id: string) => {
		setApprovingId(id);
		setApproveDialogOpen(true);
	}, []);

	const handleApproveConfirm = React.useCallback(() => {
		if (!approvingId) return;

		processIncrementMutation.mutate(
			{
				eligibilityId: approvingId,
				effectiveDate: effectiveDate || undefined,
				notes: notes || undefined,
			},
			{
				onSuccess: () => {
					toast.success(t("eligibility.approveSuccess"));
					setApproveDialogOpen(false);
					setApprovingId(null);
					setEffectiveDate("");
					setNotes("");
				},
				onError: () => {
					toast.error(tCommon("error"));
				},
			},
		);
	}, [approvingId, effectiveDate, notes, processIncrementMutation, t, tCommon]);

	const handleBatchApprove = React.useCallback(() => {
		if (selectedIds.size === 0) return;

		processBatchMutation.mutate(
			{
				eligibilityIds: Array.from(selectedIds),
				effectiveDate: effectiveDate || undefined,
				notes: notes || undefined,
			},
			{
				onSuccess: (result) => {
					toast.success(t("eligibility.batchApproveSuccess", { count: result.processed }));
					setSelectedIds(new Set());
					setEffectiveDate("");
					setNotes("");
				},
				onError: () => {
					toast.error(tCommon("error"));
				},
			},
		);
	}, [selectedIds, effectiveDate, notes, processBatchMutation, t, tCommon]);

	const handleReject = React.useCallback((id: string) => {
		setRejectingId(id);
		setRejectDialogOpen(true);
	}, []);

	const handleRejectConfirm = React.useCallback(() => {
		if (!rejectingId || !rejectReason.trim()) return;

		rejectMutation.mutate(
			{
				eligibilityId: rejectingId,
				rejectionReason: rejectReason,
			},
			{
				onSuccess: () => {
					toast.success(t("eligibility.rejectSuccess"));
					setRejectDialogOpen(false);
					setRejectingId(null);
					setRejectReason("");
				},
				onError: () => {
					toast.error(tCommon("error"));
				},
			},
		);
	}, [rejectingId, rejectReason, rejectMutation, t, tCommon]);

	const handleTriggerCheck = React.useCallback(() => {
		triggerCheckMutation.mutate(undefined, {
			onSuccess: (result) => {
				toast.success(t("eligibility.triggerCheckSuccess", { count: result.newlyEligible }));
			},
			onError: () => {
				toast.error(tCommon("error"));
			},
		});
	}, [triggerCheckMutation, t, tCommon]);

	const pendingCount = eligibilityList?.data?.filter((e) => e.status === "PENDING").length ?? 0;
	const allPendingSelected = pendingCount > 0 && selectedIds.size === pendingCount;

	if (isLoadingList && isLoadingSummary) {
		return (
			<div className="flex items-center justify-center h-96">
				<LoadingSpinner size="lg" />
			</div>
		);
	}

	return (
		<div className="container mx-auto p-6 space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold">{t("eligibility.title")}</h1>
					<p className="text-muted-foreground">{t("title")}</p>
				</div>
				<Button onClick={handleTriggerCheck} disabled={triggerCheckMutation.isPending} variant="outline">
					<RefreshCw className={`h-4 w-4 mr-2 ${triggerCheckMutation.isPending ? "animate-spin" : ""}`} />
					{t("eligibility.triggerCheck")}
				</Button>
			</div>

			{/* Summary Cards */}
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">{t("eligibility.pendingCount")}</CardTitle>
						<Clock className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{isLoadingSummary ? "-" : (summary?.pending ?? 0)}</div>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">{t("eligibility.approvedThisMonth")}</CardTitle>
						<CheckCircle className="h-4 w-4 text-green-500" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{isLoadingSummary ? "-" : (summary?.approvedThisMonth ?? 0)}</div>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">{t("eligibility.rejectedThisMonth")}</CardTitle>
						<XCircle className="h-4 w-4 text-destructive" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{isLoadingSummary ? "-" : (summary?.rejectedThisMonth ?? 0)}</div>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">{t("eligibility.upcomingNext30Days")}</CardTitle>
						<Calendar className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{isLoadingSummary ? "-" : (summary?.upcomingNext30Days ?? 0)}</div>
					</CardContent>
				</Card>
			</div>

			{/* Today's Eligibility */}
			{!isLoadingToday && todayEligibility && todayEligibility.count > 0 && (
				<Card className="border-green-500/50 bg-green-500/5">
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<TrendingUp className="h-5 w-5 text-green-500" />
							{t("eligibility.todayTitle")}
						</CardTitle>
						<CardDescription>
							{todayEligibility.count} {t("eligibility.employee").toLowerCase()}(s) - {todayEligibility.date}
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="flex flex-wrap gap-2">
							{todayEligibility.data.slice(0, 5).map((elig) => (
								<Badge key={elig.id} variant="secondary">
									{elig.employee?.employeeId} - {isAmharic ? elig.employee?.fullNameAm : elig.employee?.fullName}
								</Badge>
							))}
							{todayEligibility.count > 5 && <Badge variant="outline">+{todayEligibility.count - 5} more</Badge>}
						</div>
					</CardContent>
				</Card>
			)}

			{/* Filters */}
			<Card>
				<CardHeader>
					<CardTitle>{t("eligibility.listTitle")}</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5 mb-4">
						<div>
							<Label>{t("eligibility.filterByStatus")}</Label>
							<Select
								value={filters.status ?? "all"}
								onValueChange={(value) =>
									handleFilterChange("status", value === "all" ? undefined : (value as SalaryEligibilityStatus))
								}
							>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">{tCommon("all")}</SelectItem>
									<SelectItem value="PENDING">{t("eligibility.pending")}</SelectItem>
									<SelectItem value="APPROVED">{t("eligibility.approved")}</SelectItem>
									<SelectItem value="REJECTED">{t("eligibility.rejected")}</SelectItem>
									<SelectItem value="EXPIRED">{t("eligibility.expired")}</SelectItem>
								</SelectContent>
							</Select>
						</div>
						<div>
							<Label>{t("eligibility.filterByRank")}</Label>
							<Select
								value={filters.rankId ?? "all"}
								onValueChange={(value) => handleFilterChange("rankId", value === "all" ? undefined : value)}
							>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">{tCommon("all")}</SelectItem>
									{ranks?.map((rank) => (
										<SelectItem key={rank.id} value={rank.id}>
											{isAmharic && rank.nameAm ? rank.nameAm : rank.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<div>
							<Label>{t("eligibility.filterByCenter")}</Label>
							<Select
								value={filters.centerId ?? "all"}
								onValueChange={(value) => handleFilterChange("centerId", value === "all" ? undefined : value)}
							>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">{tCommon("all")}</SelectItem>
									{centers?.map((center) => (
										<SelectItem key={center.id} value={center.id}>
											{isAmharic && center.nameAm ? center.nameAm : center.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<div>
							<Label>{t("eligibility.search")}</Label>
							<Input
								placeholder={t("eligibility.search")}
								value={filters.search ?? ""}
								onChange={(e) => handleFilterChange("search", e.target.value || undefined)}
							/>
						</div>
						<div className="flex items-end">
							{selectedIds.size > 0 && (
								<Button onClick={handleBatchApprove} disabled={processBatchMutation.isPending}>
									{t("eligibility.batchApprove")} ({selectedIds.size})
								</Button>
							)}
						</div>
					</div>

					{/* Eligibility Table */}
					<div className="border rounded-md">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead className="w-12">
										<Checkbox
											checked={allPendingSelected}
											onCheckedChange={handleSelectAll}
											disabled={pendingCount === 0}
										/>
									</TableHead>
									<TableHead>{t("eligibility.employee")}</TableHead>
									<TableHead>{t("eligibility.rank")}</TableHead>
									<TableHead className="text-center">{t("eligibility.currentStep")}</TableHead>
									<TableHead className="text-center">{t("eligibility.nextStep")}</TableHead>
									<TableHead className="text-right">{t("eligibility.currentSalary")}</TableHead>
									<TableHead className="text-right">{t("eligibility.nextSalary")}</TableHead>
									<TableHead className="text-right">{t("eligibility.increase")}</TableHead>
									<TableHead>{t("eligibility.eligibilityDate")}</TableHead>
									<TableHead>{t("eligibility.status")}</TableHead>
									<TableHead>{t("eligibility.actions")}</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{isLoadingList ? (
									<TableRow>
										<TableCell colSpan={11} className="text-center py-8">
											<LoadingSpinner />
										</TableCell>
									</TableRow>
								) : !eligibilityList?.data?.length ? (
									<TableRow>
										<TableCell colSpan={11} className="text-center py-8 text-muted-foreground">
											{t("eligibility.noEligibility")}
										</TableCell>
									</TableRow>
								) : (
									eligibilityList.data.map((elig: SalaryEligibility) => (
										<TableRow key={elig.id}>
											<TableCell>
												<Checkbox
													checked={selectedIds.has(elig.id)}
													onCheckedChange={(checked) => handleSelectOne(elig.id, !!checked)}
													disabled={elig.status !== "PENDING"}
												/>
											</TableCell>
											<TableCell>
												<div className="font-medium">
													{isAmharic ? elig.employee?.fullNameAm : elig.employee?.fullName}
												</div>
												<div className="text-sm text-muted-foreground">{elig.employee?.employeeId}</div>
											</TableCell>
											<TableCell>{isAmharic && elig.rank?.nameAm ? elig.rank.nameAm : elig.rank?.name}</TableCell>
											<TableCell className="text-center">{elig.currentStep}</TableCell>
											<TableCell className="text-center">{elig.nextStepNumber}</TableCell>
											<TableCell className="text-right">{formatCurrency(elig.currentSalary)}</TableCell>
											<TableCell className="text-right">{formatCurrency(elig.nextSalary)}</TableCell>
											<TableCell className="text-right text-green-600">
												+{formatCurrency(elig.salaryIncrease)}
											</TableCell>
											<TableCell>{formatDate(elig.eligibilityDate)}</TableCell>
											<TableCell>{getStatusBadge(elig.status, t)}</TableCell>
											<TableCell>
												{elig.status === "PENDING" && (
													<div className="flex gap-2">
														<Button size="sm" onClick={() => handleApprove(elig.id)}>
															{t("eligibility.approve")}
														</Button>
														<Button size="sm" variant="destructive" onClick={() => handleReject(elig.id)}>
															{t("eligibility.reject")}
														</Button>
													</div>
												)}
											</TableCell>
										</TableRow>
									))
								)}
							</TableBody>
						</Table>
					</div>

					{/* Pagination */}
					{eligibilityList?.meta && (
						<div className="flex items-center justify-between mt-4">
							<div className="text-sm text-muted-foreground">
								{t("common.of")} {eligibilityList.meta.total} {t("eligibility.employee").toLowerCase()}(s)
							</div>
							<div className="flex gap-2">
								<Button
									variant="outline"
									size="sm"
									disabled={!eligibilityList.meta.hasPreviousPage}
									onClick={() => handleFilterChange("page", (filters.page ?? 1) - 1)}
								>
									{t("common.back")}
								</Button>
								<Button
									variant="outline"
									size="sm"
									disabled={!eligibilityList.meta.hasNextPage}
									onClick={() => handleFilterChange("page", (filters.page ?? 1) + 1)}
								>
									{t("common.next")}
								</Button>
							</div>
						</div>
					)}
				</CardContent>
			</Card>

			{/* Approve Dialog */}
			<Dialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>{t("eligibility.approve")}</DialogTitle>
						<DialogDescription>{t("eligibility.batchApproveConfirm", { count: 1 })}</DialogDescription>
					</DialogHeader>
					<div className="space-y-4">
						<div>
							<Label>{t("eligibility.effectiveDate")}</Label>
							<Input type="date" value={effectiveDate} onChange={(e) => setEffectiveDate(e.target.value)} />
						</div>
						<div>
							<Label>{t("eligibility.notes")}</Label>
							<Textarea
								value={notes}
								onChange={(e) => setNotes(e.target.value)}
								placeholder={t("eligibility.notesPlaceholder")}
							/>
						</div>
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={() => setApproveDialogOpen(false)}>
							{t("common.cancel")}
						</Button>
						<Button onClick={handleApproveConfirm} disabled={processIncrementMutation.isPending}>
							{t("common.confirm")}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Reject Dialog */}
			<Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>{t("eligibility.reject")}</DialogTitle>
						<DialogDescription>{t("eligibility.rejectConfirm")}</DialogDescription>
					</DialogHeader>
					<div>
						<Label>{t("eligibility.rejectReason")}</Label>
						<Textarea
							value={rejectReason}
							onChange={(e) => setRejectReason(e.target.value)}
							placeholder={t("eligibility.rejectReasonPlaceholder")}
							required
						/>
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
							{t("common.cancel")}
						</Button>
						<Button
							variant="destructive"
							onClick={handleRejectConfirm}
							disabled={!rejectReason.trim() || rejectMutation.isPending}
						>
							{t("eligibility.reject")}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
});

SalaryEligibilityPage.displayName = "SalaryEligibilityPage";
