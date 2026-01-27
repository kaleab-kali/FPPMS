import type { ColumnDef } from "@tanstack/react-table";
import { Download, LogIn } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";
import { useLoginHistory } from "#web/api/audit-log/audit-log.queries.ts";
import { DataTable } from "#web/components/common/DataTable.tsx";
import { Badge } from "#web/components/ui/badge.tsx";
import { Button } from "#web/components/ui/button.tsx";
import { Card, CardContent, CardHeader, CardTitle } from "#web/components/ui/card.tsx";
import { Input } from "#web/components/ui/input.tsx";
import type { AuditLogFilter, LoginHistory } from "#web/types/audit-log.ts";

const DEBOUNCE_DELAY = 300;

const formatDateTime = (date: Date | string | null): string => {
	if (!date) return "-";
	const d = typeof date === "string" ? new Date(date) : date;
	return new Intl.DateTimeFormat("en-US", {
		year: "numeric",
		month: "short",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	}).format(d);
};

const getInitialFilter = (): AuditLogFilter => {
	return {
		page: 1,
		limit: 50,
		sortBy: "loginAt",
		sortOrder: "desc",
	};
};

export const LoginHistoryPage = React.memo(() => {
	const { t } = useTranslation("auditLog");
	const { t: tCommon } = useTranslation("common");

	const [filter, setFilter] = React.useState<AuditLogFilter>(getInitialFilter());
	const [searchInput, setSearchInput] = React.useState("");
	const searchTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

	const { data: loginHistoryData, isLoading } = useLoginHistory(filter);

	const loginHistory = React.useMemo(() => loginHistoryData?.data ?? [], [loginHistoryData?.data]);

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

	const handleExport = React.useCallback(() => {
		const csv = [
			["Username", "Login At", "Logout At", "IP Address", "Device", "Browser", "Status"].join(","),
			...loginHistory.map((log) =>
				[
					log.username ?? log.userId,
					new Date(log.loginAt).toISOString(),
					log.logoutAt ? new Date(log.logoutAt).toISOString() : "-",
					log.ipAddress,
					log.deviceType ?? "-",
					log.browser ?? "-",
					log.isSuccessful ? "Success" : "Failed",
				].join(","),
			),
		].join("\n");

		const blob = new Blob([csv], { type: "text/csv" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `login-history-${new Date().toISOString()}.csv`;
		a.click();
		URL.revokeObjectURL(url);
	}, [loginHistory]);

	const columns = React.useMemo<ColumnDef<LoginHistory>[]>(
		() => [
			{
				accessorKey: "username",
				header: t("username"),
				cell: ({ row }) => {
					const username = row.getValue("username") as string | null;
					return <span className="font-mono text-sm">{username ?? row.original.userId}</span>;
				},
			},
			{
				accessorKey: "loginAt",
				header: t("loginAt"),
				cell: ({ row }) => <span className="whitespace-nowrap text-sm">{formatDateTime(row.getValue("loginAt"))}</span>,
			},
			{
				accessorKey: "logoutAt",
				header: t("logoutAt"),
				cell: ({ row }) => (
					<span className="whitespace-nowrap text-sm">{formatDateTime(row.getValue("logoutAt"))}</span>
				),
			},
			{
				accessorKey: "ipAddress",
				header: t("ipAddress"),
				cell: ({ row }) => <span className="font-mono text-sm">{row.getValue("ipAddress")}</span>,
			},
			{
				accessorKey: "deviceType",
				header: t("device"),
				cell: ({ row }) => {
					const deviceType = row.getValue("deviceType") as string | null;
					const browser = row.original.browser;
					return (
						<span className="text-sm">
							{deviceType ?? "-"} {browser ? `/ ${browser}` : ""}
						</span>
					);
				},
			},
			{
				accessorKey: "location",
				header: t("location"),
				cell: ({ row }) => {
					const location = row.getValue("location") as string | null;
					return <span className="text-sm">{location ?? "-"}</span>;
				},
			},
			{
				accessorKey: "isSuccessful",
				header: t("status"),
				cell: ({ row }) => {
					const isSuccessful = row.getValue("isSuccessful") as boolean;
					const failureReason = row.original.failureReason;
					return (
						<div className="flex items-center gap-2">
							<Badge variant={isSuccessful ? "default" : "destructive"}>
								{isSuccessful ? t("success") : t("failed")}
							</Badge>
							{!isSuccessful && failureReason && <span className="text-xs text-muted-foreground">{failureReason}</span>}
						</div>
					);
				},
			},
		],
		[t],
	);

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
						<LogIn className="h-6 w-6" />
						{t("loginHistory")}
					</h1>
					<p className="text-muted-foreground">{t("loginHistorySubtitle")}</p>
				</div>
				<Button onClick={handleExport} variant="outline" size="sm" disabled={loginHistory.length === 0}>
					<Download className="mr-2 h-4 w-4" />
					{tCommon("export")}
				</Button>
			</div>

			<Card>
				<CardHeader>
					<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
						<CardTitle>{t("loginHistory")}</CardTitle>
						<Input
							placeholder={t("searchUserPlaceholder")}
							value={searchInput}
							onChange={handleSearchChange}
							className="w-full sm:w-[250px]"
						/>
					</div>
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						{loginHistoryData?.meta && (
							<div className="text-sm text-muted-foreground">
								{t("showing")} {loginHistory.length} {t("of")} {loginHistoryData.meta.total} {t("entries")}
							</div>
						)}
						<DataTable columns={columns} data={loginHistory} isLoading={isLoading} searchColumn="username" />
					</div>
				</CardContent>
			</Card>
		</div>
	);
});

LoginHistoryPage.displayName = "LoginHistoryPage";
