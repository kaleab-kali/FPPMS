import React from "react";
import { useTranslation } from "react-i18next";
import { Badge } from "#web/components/ui/badge.tsx";
import { getStatusConfig } from "#web/features/attendance/constants/attendance-status.ts";
import type { AttendanceStatus } from "#web/types/attendance.ts";

interface AttendanceStatusBadgeProps {
	status: AttendanceStatus;
}

export const AttendanceStatusBadge = React.memo(
	({ status }: AttendanceStatusBadgeProps) => {
		const { t } = useTranslation("attendance");
		const config = React.useMemo(() => getStatusConfig(status), [status]);

		return <Badge variant={config.variant}>{t(config.label)}</Badge>;
	},
	(prev, next) => prev.status === next.status,
);

AttendanceStatusBadge.displayName = "AttendanceStatusBadge";
