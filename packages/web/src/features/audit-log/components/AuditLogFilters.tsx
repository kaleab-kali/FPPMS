import { Filter, X } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";
import { Button } from "#web/components/ui/button.tsx";
import { Input } from "#web/components/ui/input.tsx";
import { Label } from "#web/components/ui/label.tsx";
import { Popover, PopoverContent, PopoverTrigger } from "#web/components/ui/popover.tsx";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "#web/components/ui/select.tsx";
import type { AuditAction, AuditLogFilter } from "#web/types/audit-log.ts";

interface AuditLogFiltersProps {
	filter: AuditLogFilter;
	onFilterChange: (filter: AuditLogFilter) => void;
	onReset: () => void;
}

const AUDIT_ACTIONS: AuditAction[] = [
	"CREATE",
	"UPDATE",
	"DELETE",
	"VIEW",
	"LOGIN",
	"LOGOUT",
	"APPROVE",
	"REJECT",
	"EXPORT",
	"IMPORT",
];

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

const AuditLogFiltersInner = ({ filter, onFilterChange, onReset }: AuditLogFiltersProps) => {
	const { t } = useTranslation("auditLog");
	const { t: tCommon } = useTranslation("common");
	const [isOpen, setIsOpen] = React.useState(false);

	const hasActiveFilters = React.useMemo(() => {
		const defaultRange = getDefaultDateRange();
		return (
			filter.action ||
			filter.module ||
			filter.userId ||
			filter.dateFrom !== defaultRange.from ||
			filter.dateTo !== defaultRange.to
		);
	}, [filter]);

	const handleActionChange = React.useCallback(
		(value: string) => {
			onFilterChange({
				...filter,
				action: value === "all" ? undefined : (value as AuditAction),
			});
		},
		[filter, onFilterChange],
	);

	const handleModuleChange = React.useCallback(
		(value: string) => {
			onFilterChange({
				...filter,
				module: value || undefined,
			});
		},
		[filter, onFilterChange],
	);

	const handleUserIdChange = React.useCallback(
		(value: string) => {
			onFilterChange({
				...filter,
				userId: value || undefined,
			});
		},
		[filter, onFilterChange],
	);

	const handleDateFromChange = React.useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			onFilterChange({
				...filter,
				dateFrom: e.target.value || undefined,
			});
		},
		[filter, onFilterChange],
	);

	const handleDateToChange = React.useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			onFilterChange({
				...filter,
				dateTo: e.target.value || undefined,
			});
		},
		[filter, onFilterChange],
	);

	const handleResetClick = React.useCallback(() => {
		onReset();
		setIsOpen(false);
	}, [onReset]);

	return (
		<Popover open={isOpen} onOpenChange={setIsOpen}>
			<PopoverTrigger asChild>
				<Button variant="outline" size="sm" className="relative">
					<Filter className="mr-2 h-4 w-4" />
					{t("filters")}
					{hasActiveFilters && (
						<span className="ml-2 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
							!
						</span>
					)}
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-80" align="start">
				<div className="space-y-4">
					<div className="flex items-center justify-between">
						<h4 className="font-medium">{t("filters")}</h4>
						{hasActiveFilters && (
							<Button variant="ghost" size="sm" onClick={handleResetClick}>
								<X className="mr-2 h-4 w-4" />
								{tCommon("reset")}
							</Button>
						)}
					</div>

					<div className="space-y-2">
						<Label htmlFor="dateFrom">{t("dateRange")}</Label>
						<div className="flex gap-2">
							<div className="flex-1">
								<Input
									id="dateFrom"
									type="date"
									value={filter.dateFrom ?? ""}
									onChange={handleDateFromChange}
									className="w-full"
								/>
							</div>
							<div className="flex-1">
								<Input
									id="dateTo"
									type="date"
									value={filter.dateTo ?? ""}
									onChange={handleDateToChange}
									className="w-full"
								/>
							</div>
						</div>
					</div>

					<div className="space-y-2">
						<Label htmlFor="action">{t("action")}</Label>
						<Select value={filter.action ?? "all"} onValueChange={handleActionChange}>
							<SelectTrigger id="action">
								<SelectValue placeholder={t("selectAction")} />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">{tCommon("all")}</SelectItem>
								{AUDIT_ACTIONS.map((action) => (
									<SelectItem key={action} value={action}>
										{t(`actions.${action}`)}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<div className="space-y-2">
						<Label htmlFor="module">{t("module")}</Label>
						<Input
							id="module"
							placeholder={t("enterModule")}
							value={filter.module ?? ""}
							onChange={(e) => handleModuleChange(e.target.value)}
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="userId">{t("userId")}</Label>
						<Input
							id="userId"
							placeholder={t("enterUserId")}
							value={filter.userId ?? ""}
							onChange={(e) => handleUserIdChange(e.target.value)}
						/>
					</div>
				</div>
			</PopoverContent>
		</Popover>
	);
};

export const AuditLogFilters = React.memo(
	AuditLogFiltersInner,
	(prev, next) => prev.filter === next.filter && prev.onFilterChange === next.onFilterChange,
);
AuditLogFilters.displayName = "AuditLogFilters";
