export const REWARD_ELIGIBILITY = {
	ELIGIBLE: "ELIGIBLE",
	DISQUALIFIED_ARTICLE_31: "DISQUALIFIED_ARTICLE_31",
	POSTPONED_INVESTIGATION: "POSTPONED_INVESTIGATION",
	PENDING_REVIEW: "PENDING_REVIEW",
} as const;

export type RewardEligibility = (typeof REWARD_ELIGIBILITY)[keyof typeof REWARD_ELIGIBILITY];

export const SERVICE_REWARD_STATUS = {
	PENDING: "PENDING",
	ELIGIBLE: "ELIGIBLE",
	INELIGIBLE: "INELIGIBLE",
	POSTPONED: "POSTPONED",
	AWAITING_APPROVAL: "AWAITING_APPROVAL",
	APPROVED: "APPROVED",
	REJECTED: "REJECTED",
	AWARDED: "AWARDED",
} as const;

export type ServiceRewardStatus = (typeof SERVICE_REWARD_STATUS)[keyof typeof SERVICE_REWARD_STATUS];

export interface RewardMilestone {
	id: string;
	tenantId: string;
	yearsOfService: number;
	name: string;
	nameAm?: string;
	description?: string;
	rewardType: string;
	monetaryValue?: number;
	isActive: boolean;
	createdAt: string;
	updatedAt: string;
}

export interface CreateRewardMilestoneRequest {
	yearsOfService: number;
	name: string;
	nameAm?: string;
	description?: string;
	rewardType: string;
	monetaryValue?: number;
	isActive?: boolean;
}

export interface UpdateRewardMilestoneRequest {
	yearsOfService?: number;
	name?: string;
	nameAm?: string;
	description?: string;
	rewardType?: string;
	monetaryValue?: number;
	isActive?: boolean;
}

export interface EmployeeMinimal {
	id: string;
	employeeId: string;
	fullName: string;
	fullNameAm?: string;
}

export interface MilestoneMinimal {
	id: string;
	yearsOfService: number;
	name: string;
	nameAm?: string;
	rewardType: string;
}

export interface ServiceRewardTimeline {
	id: string;
	action: string;
	fromStatus?: ServiceRewardStatus;
	toStatus?: ServiceRewardStatus;
	performedBy: string;
	performedAt: string;
	notes?: string;
}

export interface ServiceReward {
	id: string;
	tenantId: string;
	employeeId: string;
	employee?: EmployeeMinimal;
	milestoneId: string;
	milestone?: MilestoneMinimal;
	eligibilityStatus: RewardEligibility;
	eligibilityCheckDate: string;
	ineligibilityReason?: string;
	postponedUntil?: string;
	postponementReason?: string;
	originalEligibleDate?: string;
	awardDate?: string;
	awardedBy?: string;
	ceremonyDetails?: string;
	certificateNumber?: string;
	certificatePath?: string;
	photoPath?: string;
	status: ServiceRewardStatus;
	submittedForApprovalAt?: string;
	submittedForApprovalBy?: string;
	approvedAt?: string;
	approvedBy?: string;
	rejectionReason?: string;
	createdBy?: string;
	createdAt: string;
	updatedAt: string;
	timeline?: ServiceRewardTimeline[];
}

export interface ServiceRewardListItem {
	id: string;
	employee?: EmployeeMinimal;
	milestone?: MilestoneMinimal;
	eligibilityStatus: RewardEligibility;
	status: ServiceRewardStatus;
	awardDate?: string;
	eligibilityCheckDate: string;
	createdAt: string;
}

export interface ServiceRewardFilter {
	status?: ServiceRewardStatus;
	eligibilityStatus?: RewardEligibility;
	milestoneId?: string;
	centerId?: string;
	employeeId?: string;
	fromDate?: string;
	toDate?: string;
	search?: string;
	page?: number;
	limit?: number;
}

export interface EligibilityFilter {
	milestoneId?: string;
	centerId?: string;
	monthsAhead?: number;
	page?: number;
	limit?: number;
}

export interface CheckEligibilityResponse {
	employeeId: string;
	employeeName: string;
	milestoneId: string;
	milestoneName: string;
	yearsOfService: number;
	eligibilityStatus: RewardEligibility;
	reason?: string;
	postponedUntil?: string;
}

export interface EligibilitySummary {
	total: number;
	eligible: number;
	disqualified: number;
	postponed: number;
	pendingReview: number;
}

export interface ApproachingMilestone {
	employeeId: string;
	employee: EmployeeMinimal;
	milestone: MilestoneMinimal;
	currentYearsOfService: number;
	expectedEligibilityDate: string;
	monthsUntilEligible: number;
}

export interface CreateServiceRewardRequest {
	employeeId: string;
	milestoneId: string;
	notes?: string;
}

export interface ApproveRewardRequest {
	notes?: string;
}

export interface RejectRewardRequest {
	rejectionReason: string;
	notes?: string;
}

export interface RecordAwardRequest {
	awardDate: string;
	ceremonyDetails?: string;
	certificateNumber?: string;
	certificatePath?: string;
	photoPath?: string;
	notes?: string;
}

export interface SubmitForApprovalRequest {
	notes?: string;
}

export interface BatchCheckEligibilityRequest {
	milestoneId: string;
	centerId?: string;
	employeeIds?: string[];
}

export interface BatchCheckEligibilityResponse {
	milestoneId: string;
	milestoneName: string;
	totalChecked: number;
	eligible: number;
	ineligible: number;
	results: CheckEligibilityResponse[];
}

export interface MilestoneStats {
	milestoneId: string;
	milestoneName: string;
	yearsOfService: number;
	totalRewards: number;
	awarded: number;
	pending: number;
	eligible: number;
}
