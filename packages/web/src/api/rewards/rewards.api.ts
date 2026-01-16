import { api } from "#web/lib/api-client";
import type { PaginatedResponse } from "#web/types/api";
import type {
	ApproachingMilestone,
	ApproveRewardRequest,
	BatchCheckEligibilityRequest,
	BatchCheckEligibilityResponse,
	CheckEligibilityResponse,
	CreateRewardMilestoneRequest,
	CreateServiceRewardRequest,
	EligibilityFilter,
	EligibilitySummary,
	MilestoneStats,
	RecordAwardRequest,
	RejectRewardRequest,
	RewardMilestone,
	ServiceReward,
	ServiceRewardFilter,
	ServiceRewardListItem,
	ServiceRewardTimeline,
	SubmitForApprovalRequest,
	UpdateRewardMilestoneRequest,
} from "#web/types/rewards";

const BASE_URL = "/rewards";
const MILESTONES_URL = "/reward-milestones";

export const rewardMilestonesApi = {
	getAll: (includeInactive = false): Promise<RewardMilestone[]> =>
		api.get(MILESTONES_URL, { params: { includeInactive } }),

	getById: (id: string): Promise<RewardMilestone> => api.get(`${MILESTONES_URL}/${id}`),

	getStats: (): Promise<MilestoneStats[]> => api.get(`${MILESTONES_URL}/stats`),

	create: (dto: CreateRewardMilestoneRequest): Promise<RewardMilestone> => api.post(MILESTONES_URL, dto),

	update: (id: string, dto: UpdateRewardMilestoneRequest): Promise<RewardMilestone> =>
		api.patch(`${MILESTONES_URL}/${id}`, dto),

	delete: (id: string): Promise<RewardMilestone> => api.delete(`${MILESTONES_URL}/${id}`),
} as const;

export const serviceRewardsApi = {
	getAll: (filter?: ServiceRewardFilter): Promise<PaginatedResponse<ServiceRewardListItem>> =>
		api.get(BASE_URL, { params: filter }),

	getById: (id: string): Promise<ServiceReward> => api.get(`${BASE_URL}/${id}`),

	getByEmployee: (employeeId: string): Promise<ServiceReward[]> => api.get(`${BASE_URL}/employee/${employeeId}`),

	getTimeline: (id: string): Promise<ServiceRewardTimeline[]> => api.get(`${BASE_URL}/${id}/timeline`),

	create: (dto: CreateServiceRewardRequest): Promise<ServiceReward> => api.post(BASE_URL, dto),

	submitForApproval: (id: string, dto?: SubmitForApprovalRequest): Promise<ServiceReward> =>
		api.patch(`${BASE_URL}/${id}/submit-for-approval`, dto ?? {}),

	approve: (id: string, dto?: ApproveRewardRequest): Promise<ServiceReward> =>
		api.patch(`${BASE_URL}/${id}/approve`, dto ?? {}),

	reject: (id: string, dto: RejectRewardRequest): Promise<ServiceReward> => api.patch(`${BASE_URL}/${id}/reject`, dto),

	recordAward: (id: string, dto: RecordAwardRequest): Promise<ServiceReward> =>
		api.patch(`${BASE_URL}/${id}/award`, dto),

	recheckEligibility: (id: string): Promise<ServiceReward> => api.patch(`${BASE_URL}/${id}/recheck-eligibility`, {}),
} as const;

export const eligibilityApi = {
	getApproachingMilestones: (filter?: EligibilityFilter): Promise<ApproachingMilestone[]> =>
		api.get(`${BASE_URL}/eligibility`, { params: filter }),

	getSummary: (): Promise<EligibilitySummary> => api.get(`${BASE_URL}/eligibility/summary`),

	checkEligibility: (employeeId: string, milestoneId: string): Promise<CheckEligibilityResponse> =>
		api.get(`${BASE_URL}/eligibility/check/${employeeId}/${milestoneId}`),

	batchCheck: (dto: BatchCheckEligibilityRequest): Promise<BatchCheckEligibilityResponse> =>
		api.post(`${BASE_URL}/eligibility/batch-check`, dto),
} as const;

export const rewardReportsApi = {
	getUpcoming: (monthsAhead?: number, centerId?: string): Promise<ApproachingMilestone[]> =>
		api.get(`${BASE_URL}/reports/upcoming`, { params: { monthsAhead, centerId } }),

	getAwarded: (year?: number): Promise<ServiceReward[]> => api.get(`${BASE_URL}/reports/awarded`, { params: { year } }),

	getByMilestone: (): Promise<MilestoneStats[]> => api.get(`${BASE_URL}/reports/by-milestone`),
} as const;
