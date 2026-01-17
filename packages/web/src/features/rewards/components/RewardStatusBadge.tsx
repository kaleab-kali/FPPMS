import React from "react";
import { useTranslation } from "react-i18next";
import { Badge } from "#web/components/ui/badge";
import { getServiceRewardStatusConfig } from "#web/features/rewards/constants/reward-status";
import type { ServiceRewardStatus } from "#web/types/rewards";

interface RewardStatusBadgeProps {
	status: ServiceRewardStatus;
}

export const RewardStatusBadge = React.memo(
	({ status }: RewardStatusBadgeProps) => {
		const { t } = useTranslation("rewards");
		const config = React.useMemo(() => getServiceRewardStatusConfig(status), [status]);

		return <Badge variant={config.variant}>{t(config.label)}</Badge>;
	},
	(prev, next) => prev.status === next.status,
);

RewardStatusBadge.displayName = "RewardStatusBadge";
