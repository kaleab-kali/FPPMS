import { Download, FileText } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";
import { useAuditLogs } from "#web/api/audit-log/audit-log.queries.ts";
import { Button } from "#web/components/ui/button.tsx";
import { Card, CardContent, CardHeader, CardTitle } from "#web/components/ui/card.tsx";
import { Input } from "#web/components/ui/input.tsx";
import { AuditLogDetailDialog } from "#web/features/audit-log/components/AuditLogDetailDialog.tsx";
import { AuditLogFilters } from "#web/features/audit-log/components/AuditLogFilters.tsx";
import { AuditLogTable } from "#web/features/audit-log/components/AuditLogTable.tsx";
import type { AuditLog, AuditLogFilter } from "#web/types/audit-log.ts";

const DEBOUNCE_DELAY = 300;

const formatDateForInput = (date: Date): string => {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");
	return `${year}-${month}-${day}`;
};

const getDefaultDateRange = () => {
	const now = new Date();
	const sevenDaysAgo = new Date(now);
	sevenDaysAgo.setDate(now.getDate() - 7);
	return {
		from: formatDateForInput(sevenDaysAgo),
		to: formatDateForInput(now),
	};
};

const getInitialFilter = (): AuditLogFilter => {
	const range = getDefaultDateRange();
	return {
		page: 1,
		limit: 50,
		dateFrom: range.from,
		dateTo: range.to,
		sortBy: "timestamp",
		sortOrder: "desc",
	};
};

export const AuditLogListPage = React.memo(() => {
	const { t } = useTranslation("auditLog");
	const { t: tCommon } = useTranslation("common");

	const [filter, setFilter] = React.useState<AuditLogFilter>(getInitialFilter());
	const [searchInput, setSearchInput] = React.useState("");
	const [selectedLog, setSelectedLog] = React.useState<AuditLog | null>(null);
	const [detailDialogOpen, setDetailDialogOpen] = React.useState(false);
	const searchTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

	const { data: auditLogsData, isLoading } = useAuditLogs(filter);

	const auditLogs = React.useMemo(() => auditLogsData?.data ?? [], [auditLogsData?.data]);

	const handleSearchChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		setSearchInput(value);

		if (searchTimeoutRef.current) {
			clearTimeout(searchTimeoutRef.current);
		}

		searchTimeoutRef.current = setTimeout(() => {
			setFilter((prev) => ({
				...prev,
				search: value || undefined,
				page: 1,
			}));
		}, DEBOUNCE_DELAY);
	}, []);

	const handleFilterChange = React.useCallback((newFilter: AuditLogFilter) => {
		setFilter((prev) => ({
			...prev,
			...newFilter,
			page: 1,
		}));
	}, []);

	const handleResetFilters = React.useCallback(() => {
		setFilter(getInitialFilter());
		setSearchInput("");
	}, []);

	const handleViewLog = React.useCallback((log: AuditLog) => {
		setSelectedLog(log);
		setDetailDialogOpen(true);
	}, []);

	const handleExport = React.useCallback(() => {
		const csv = [
			["Timestamp", "User", "Action", "Module", "Resource", "IP Address", "Description"].join(","),
			...auditLogs.map((log) =>
				[
					new Date(log.timestamp).toISOString(),
					log.username ?? "-",
					log.action,
					log.module,
					log.resource,
					log.ipAddress,
					log.description ?? "-",
				].join(","),
			),
		].join("\n");

		const blob = new Blob([csv], { type: "text/csv" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `audit-logs-${new Date().toISOString()}.csv`;
		a.click();
		URL.revokeObjectURL(url);
	}, [auditLogs]);

	React.useEffect(() => {
		return () => {
			if (searchTimeoutRef.current) {
				clearTimeout(searchTimeoutRef.current);
			}
		};
	}, []);

	return (
		<div className="space-y-6">
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h1 className="flex items-center gap-2 text-2xl font-bold">
						<FileText className="h-6 w-6" />
						{t("title")}
					</h1>
					<p className="text-muted-foreground">{t("subtitle")}</p>
				</div>
				<Button onClick={handleExport} variant="outline" size="sm" disabled={auditLogs.length === 0}>
					<Download className="mr-2 h-4 w-4" />
					{tCommon("export")}
				</Button>
			</div>

			<Card>
				<CardHeader>
					<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
						<CardTitle>{t("auditLogs")}</CardTitle>
						<div className="flex flex-wrap gap-2">
							<Input
								placeholder={t("searchPlaceholder")}
								value={searchInput}
								onChange={handleSearchChange}
								className="w-full sm:w-[250px]"
							/>
							<AuditLogFilters filter={filter} onFilterChange={handleFilterChange} onReset={handleResetFilters} />
						</div>
					</div>
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						{auditLogsData?.meta && (
							<div className="text-sm text-muted-foreground">
								{t("showing")} {auditLogs.length} {t("of")} {auditLogsData.meta.total} {t("entries")}
							</div>
						)}
						<AuditLogTable data={auditLogs} isLoading={isLoading} onView={handleViewLog} />
					</div>
				</CardContent>
			</Card>

			<AuditLogDetailDialog auditLog={selectedLog} open={detailDialogOpen} onOpenChange={setDetailDialogOpen} />
		</div>
	);
});

AuditLogListPage.displayName = "AuditLogListPage";
