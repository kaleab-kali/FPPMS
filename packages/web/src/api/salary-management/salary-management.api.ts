import { api } from "#web/lib/api-client.ts";
import type {
	BatchIncrementResult,
	IncrementResult,
	ManualStepJumpRequest,
	MassRaisePreviewRequest,
	MassRaisePreviewResponse,
	MassRaiseRequest,
	MassRaiseResult,
	ProcessBatchIncrementRequest,
	ProcessPromotionRequest,
	ProcessSingleIncrementRequest,
	PromotionSalaryPreview,
	PromotionSalaryPreviewRequest,
	RankSalarySteps,
	RejectEligibilityRequest,
	SalaryEligibilityListResponse,
	SalaryEligibilityQuery,
	SalaryEligibilitySummary,
	SalaryHistoryListResponse,
	SalaryHistoryQuery,
	SalaryProjection,
	StepDistributionReport,
	TodayEligibilityResponse,
} from "#web/types/salary-management.ts";

const BASE_URL = "/salary";

const buildQueryString = (params: object): string => {
	const searchParams = new URLSearchParams();
	for (const [key, value] of Object.entries(params)) {
		if (value !== undefined && value !== null && value !== "") {
			searchParams.append(key, String(value));
		}
	}
	const queryString = searchParams.toString();
	return queryString ? `?${queryString}` : "";
};

export const salaryManagementApi = {
	getEligibilityList: (query: SalaryEligibilityQuery = {}) =>
		api.get<SalaryEligibilityListResponse>(`${BASE_URL}/eligibility${buildQueryString(query)}`),

	getTodayEligibility: () => api.get<TodayEligibilityResponse>(`${BASE_URL}/eligibility/today`),

	getEligibilitySummary: () => api.get<SalaryEligibilitySummary>(`${BASE_URL}/eligibility/summary`),

	processIncrement: (data: ProcessSingleIncrementRequest) =>
		api.post<IncrementResult>(`${BASE_URL}/process-increment`, data),

	processBatchIncrement: (data: ProcessBatchIncrementRequest) =>
		api.post<BatchIncrementResult>(`${BASE_URL}/process-batch`, data),

	rejectEligibility: (data: RejectEligibilityRequest) =>
		api.post<{ message: string }>(`${BASE_URL}/reject-eligibility`, data),

	processManualJump: (data: ManualStepJumpRequest) => api.post<IncrementResult>(`${BASE_URL}/manual-jump`, data),

	getMassRaisePreview: (data: MassRaisePreviewRequest) =>
		api.post<MassRaisePreviewResponse>(`${BASE_URL}/mass-raise/preview`, data),

	processMassRaise: (data: MassRaiseRequest) => api.post<MassRaiseResult>(`${BASE_URL}/mass-raise`, data),

	getEmployeeSalaryHistory: (employeeId: string, query: SalaryHistoryQuery = {}) =>
		api.get<SalaryHistoryListResponse>(`${BASE_URL}/employee/${employeeId}/history${buildQueryString(query)}`),

	getEmployeeSalaryProjection: (employeeId: string) =>
		api.get<SalaryProjection>(`${BASE_URL}/employee/${employeeId}/projection`),

	getStepDistributionReport: (centerId?: string) =>
		api.get<StepDistributionReport>(`${BASE_URL}/reports/step-distribution${centerId ? `?centerId=${centerId}` : ""}`),

	getRankSalarySteps: (rankId: string) => api.get<RankSalarySteps>(`${BASE_URL}/ranks/${rankId}/steps`),

	getPromotionSalaryPreview: (data: PromotionSalaryPreviewRequest) =>
		api.post<PromotionSalaryPreview>(`${BASE_URL}/promotion/preview`, data),

	processPromotion: (data: ProcessPromotionRequest) => api.post<IncrementResult>(`${BASE_URL}/promotion/process`, data),

	triggerDailyEligibilityCheck: () => api.post<{ newlyEligible: number }>(`${BASE_URL}/eligibility/check-daily`, {}),
} as const;
