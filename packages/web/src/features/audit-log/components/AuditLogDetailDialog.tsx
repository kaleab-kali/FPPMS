import { Calendar, Globe, Monitor, Server, Shield, User } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";
import { Badge } from "#web/components/ui/badge.tsx";
import { Button } from "#web/components/ui/button.tsx";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "#web/components/ui/dialog.tsx";
import { ScrollArea } from "#web/components/ui/scroll-area.tsx";
import type { AuditLog } from "#web/types/audit-log.ts";

interface AuditLogDetailDialogProps {
	auditLog: AuditLog | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

const ACTION_VARIANTS = {
	CREATE: "default",
	UPDATE: "secondary",
	DELETE: "destructive",
	VIEW: "outline",
	LOGIN: "default",
	LOGOUT: "secondary",
	APPROVE: "default",
	REJECT: "destructive",
	EXPORT: "secondary",
	IMPORT: "secondary",
} as const;

const getActionVariant = (action: string): "default" | "secondary" | "destructive" | "outline" =>
	ACTION_VARIANTS[action as keyof typeof ACTION_VARIANTS] ?? "secondary";

const formatDateTime = (date: Date | string): string => {
	const d = typeof date === "string" ? new Date(date) : date;
	return new Intl.DateTimeFormat("en-US", {
		year: "numeric",
		month: "short",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit",
		second: "2-digit",
	}).format(d);
};

const InfoItem = React.memo(
	({
		icon: Icon,
		label,
		value,
		mono = false,
	}: {
		icon: React.ElementType;
		label: string;
		value: string | null | undefined;
		mono?: boolean;
	}) => {
		if (!value) return null;
		return (
			<div className="rounded border bg-muted/40 p-2">
				<div className="mb-1 flex items-center gap-1.5">
					<Icon className="h-3.5 w-3.5 text-muted-foreground" />
					<span className="text-xs text-muted-foreground">{label}</span>
				</div>
				<p className={`break-all text-sm ${mono ? "font-mono" : ""}`}>{value}</p>
			</div>
		);
	},
	(prev, next) => prev.value === next.value && prev.label === next.label,
);
InfoItem.displayName = "InfoItem";

const AuditLogDetailDialogInner = ({ auditLog, open, onOpenChange }: AuditLogDetailDialogProps) => {
	const { t } = useTranslation("auditLog");
	const { t: tCommon } = useTranslation("common");

	if (!auditLog) return null;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="flex max-h-[85vh] max-w-3xl flex-col">
				<DialogHeader className="shrink-0">
					<div className="flex items-center justify-between gap-4">
						<DialogTitle>{t("auditLogDetails")}</DialogTitle>
						<Badge variant={getActionVariant(auditLog.action)}>{t(`actions.${auditLog.action}`)}</Badge>
					</div>
					<p className="text-sm text-muted-foreground">
						{auditLog.module} / {auditLog.resource}
						{auditLog.description && ` - ${auditLog.description}`}
					</p>
				</DialogHeader>

				<ScrollArea className="flex-1 pr-4">
					<div className="space-y-4 pb-4">
						<div className="grid grid-cols-2 gap-2 lg:grid-cols-3">
							<InfoItem icon={Calendar} label={t("timestamp")} value={formatDateTime(auditLog.timestamp)} />
							<InfoItem icon={User} label={t("username")} value={auditLog.username} />
							<InfoItem icon={Shield} label={t("userRole")} value={auditLog.userRole} />
							<InfoItem icon={Globe} label={t("ipAddress")} value={auditLog.ipAddress} mono />
							<InfoItem icon={Monitor} label={t("device")} value={auditLog.deviceType} />
							<InfoItem icon={Server} label={t("os")} value={auditLog.os} />
						</div>

						{auditLog.userCenter && (
							<div className="rounded border bg-muted/40 p-2">
								<p className="mb-1 text-xs text-muted-foreground">{t("userCenter")}</p>
								<p className="text-sm">{auditLog.userCenter}</p>
							</div>
						)}

						{auditLog.changedFields && auditLog.changedFields.length > 0 && (
							<div className="rounded border bg-muted/40 p-3">
								<p className="mb-2 text-xs font-medium text-muted-foreground">{t("changedFields")}</p>
								<div className="flex flex-wrap gap-1.5">
									{auditLog.changedFields.map((field) => (
										<Badge key={field} variant="secondary" className="text-xs">
											{field}
										</Badge>
									))}
								</div>
							</div>
						)}

						{auditLog.newValue && Object.keys(auditLog.newValue).length > 0 && (
							<div className="rounded border bg-muted/40 p-3">
								<p className="mb-2 text-xs font-medium text-muted-foreground">{t("newValue")}</p>
								<pre className="whitespace-pre-wrap break-all text-xs">
									{JSON.stringify(auditLog.newValue, null, 2)}
								</pre>
							</div>
						)}

						{auditLog.previousValue && Object.keys(auditLog.previousValue).length > 0 && (
							<div className="rounded border bg-muted/40 p-3">
								<p className="mb-2 text-xs font-medium text-muted-foreground">{t("previousValue")}</p>
								<pre className="whitespace-pre-wrap break-all text-xs">
									{JSON.stringify(auditLog.previousValue, null, 2)}
								</pre>
							</div>
						)}

						{auditLog.reason && (
							<div className="rounded border bg-muted/40 p-3">
								<p className="mb-1 text-xs font-medium text-muted-foreground">{t("reason")}</p>
								<p className="text-sm">{auditLog.reason}</p>
							</div>
						)}

						{(auditLog.resourceId || auditLog.sessionId || auditLog.requestId) && (
							<div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
								{auditLog.resourceId && (
									<div className="rounded border bg-muted/40 p-2">
										<p className="mb-1 text-xs text-muted-foreground">{t("resourceId")}</p>
										<p className="break-all font-mono text-xs">{auditLog.resourceId}</p>
									</div>
								)}
								{auditLog.sessionId && (
									<div className="rounded border bg-muted/40 p-2">
										<p className="mb-1 text-xs text-muted-foreground">{t("sessionId")}</p>
										<p className="break-all font-mono text-xs">{auditLog.sessionId}</p>
									</div>
								)}
								{auditLog.requestId && (
									<div className="rounded border bg-muted/40 p-2">
										<p className="mb-1 text-xs text-muted-foreground">{t("requestId")}</p>
										<p className="break-all font-mono text-xs">{auditLog.requestId}</p>
									</div>
								)}
							</div>
						)}

						{auditLog.userAgent && (
							<div className="rounded border bg-muted/40 p-3">
								<p className="mb-1 text-xs font-medium text-muted-foreground">{t("userAgent")}</p>
								<p className="break-all text-xs">{auditLog.userAgent}</p>
							</div>
						)}
					</div>
				</ScrollArea>

				<div className="shrink-0 flex justify-end border-t pt-4">
					<Button variant="outline" onClick={() => onOpenChange(false)}>
						{tCommon("close")}
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
};

export const AuditLogDetailDialog = React.memo(
	AuditLogDetailDialogInner,
	(prev, next) => prev.auditLog?.id === next.auditLog?.id && prev.open === next.open,
);
AuditLogDetailDialog.displayName = "AuditLogDetailDialog";
