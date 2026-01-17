import React from "react";
import { useTranslation } from "react-i18next";
import { Badge } from "#web/components/ui/badge";
import { getEligibilityStatusConfig } from "#web/features/rewards/constants/reward-status";
import type { RewardEligibility } from "#web/types/rewards";

interface EligibilityStatusBadgeProps {
	status: RewardEligibility;
}

export const EligibilityStatusBadge = React.memo(
	({ status }: EligibilityStatusBadgeProps) => {
		const { t } = useTranslation("rewards");
		const config = React.useMemo(() => getEligibilityStatusConfig(status), [status]);

		return <Badge variant={config.variant}>{t(config.label)}</Badge>;
	},
	(prev, next) => prev.status === next.status,
);

EligibilityStatusBadge.displayName = "EligibilityStatusBadge";
