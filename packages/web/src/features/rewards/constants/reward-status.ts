import type { RewardEligibility, ServiceRewardStatus } from "#web/types/rewards";

export const SERVICE_REWARD_STATUS_CONFIG = {
	PENDING: {
		label: "status.PENDING",
		variant: "secondary" as const,
	},
	ELIGIBLE: {
		label: "status.ELIGIBLE",
		variant: "default" as const,
	},
	INELIGIBLE: {
		label: "status.INELIGIBLE",
		variant: "destructive" as const,
	},
	POSTPONED: {
		label: "status.POSTPONED",
		variant: "secondary" as const,
	},
	AWAITING_APPROVAL: {
		label: "status.AWAITING_APPROVAL",
		variant: "outline" as const,
	},
	APPROVED: {
		label: "status.APPROVED",
		variant: "default" as const,
	},
	REJECTED: {
		label: "status.REJECTED",
		variant: "destructive" as const,
	},
	AWARDED: {
		label: "status.AWARDED",
		variant: "default" as const,
	},
} as const;

export const ELIGIBILITY_STATUS_CONFIG = {
	ELIGIBLE: {
		label: "eligibilityStatus.ELIGIBLE",
		variant: "default" as const,
	},
	DISQUALIFIED_ARTICLE_31: {
		label: "eligibilityStatus.DISQUALIFIED_ARTICLE_31",
		variant: "destructive" as const,
	},
	POSTPONED_INVESTIGATION: {
		label: "eligibilityStatus.POSTPONED_INVESTIGATION",
		variant: "secondary" as const,
	},
	PENDING_REVIEW: {
		label: "eligibilityStatus.PENDING_REVIEW",
		variant: "outline" as const,
	},
} as const;

export const getServiceRewardStatusConfig = (status: ServiceRewardStatus) => SERVICE_REWARD_STATUS_CONFIG[status];

export const getEligibilityStatusConfig = (status: RewardEligibility) => ELIGIBILITY_STATUS_CONFIG[status];
