export type SalaryEligibilityStatus = "PENDING" | "APPROVED" | "REJECTED" | "EXPIRED";
export type SalaryChangeType = "STEP_INCREMENT" | "MANUAL_JUMP" | "MASS_RAISE" | "PROMOTION" | "INITIAL";
export type MassRaiseType = "INCREMENT_BY_STEPS" | "JUMP_TO_STEP";

interface RankMinimal {
	id: string;
	code: string;
	name: string;
	nameAm: string | null;
	category?: string;
}

interface CenterMinimal {
	id: string;
	code: string;
	name: string;
	nameAm: string | null;
}

interface DepartmentMinimal {
	id: string;
	code: string;
	name: string;
	nameAm: string | null;
}

interface EmployeeForEligibility {
	id: string;
	employeeId: string;
	fullName: string;
	fullNameAm: string | null;
	employmentDate: string;
	center?: CenterMinimal | null;
	department?: DepartmentMinimal | null;
}

export interface SalaryEligibility {
	id: string;
	tenantId: string;
	employeeId: string;
	rankId: string;
	currentStep: number;
	nextStepNumber: number;
	currentSalary: string;
	nextSalary: string;
	salaryIncrease: string;
	eligibilityDate: string;
	status: SalaryEligibilityStatus;
	processedAt: string | null;
	processedBy: string | null;
	rejectionReason: string | null;
	salaryHistoryId: string | null;
	notifiedAt: string | null;
	createdAt: string;
	updatedAt: string;
	employee?: EmployeeForEligibility;
	rank?: RankMinimal;
}

export interface SalaryEligibilityListResponse {
	data: SalaryEligibility[];
	meta: {
		total: number;
		page: number;
		limit: number;
		totalPages: number;
		hasNextPage: boolean;
		hasPreviousPage: boolean;
	};
}

export interface TodayEligibilityResponse {
	data: SalaryEligibility[];
	count: number;
	date: string;
}

export interface SalaryEligibilitySummary {
	pending: number;
	approvedThisMonth: number;
	rejectedThisMonth: number;
	upcomingNext30Days: number;
	byRank: Array<{
		rankId: string;
		rankName: string;
		count: number;
	}>;
}

export interface SalaryEligibilityQuery {
	rankId?: string;
	centerId?: string;
	departmentId?: string;
	status?: SalaryEligibilityStatus;
	eligibilityDateFrom?: string;
	eligibilityDateTo?: string;
	currentStep?: number;
	search?: string;
	page?: number;
	limit?: number;
	sortBy?: string;
	sortOrder?: "asc" | "desc";
}

export interface ProcessSingleIncrementRequest {
	eligibilityId: string;
	effectiveDate?: string;
	notes?: string;
}

export interface ProcessBatchIncrementRequest {
	eligibilityIds: string[];
	effectiveDate?: string;
	notes?: string;
}

export interface RejectEligibilityRequest {
	eligibilityId: string;
	rejectionReason: string;
}

export interface IncrementResult {
	success: boolean;
	employeeId: string;
	employeeName: string;
	fromStep: number;
	toStep: number;
	fromSalary: string;
	toSalary: string;
	historyId?: string;
	error?: string;
}

export interface BatchIncrementResult {
	processed: number;
	failed: number;
	results: IncrementResult[];
}

export interface ManualStepJumpRequest {
	employeeId: string;
	toStep: number;
	orderReference: string;
	reason: string;
	effectiveDate: string;
	documentPath?: string;
	notes?: string;
}

export interface MassRaisePreviewRequest {
	rankId: string;
	raiseType: MassRaiseType;
	incrementSteps?: number;
	targetStep?: number;
	centerId?: string;
}

export interface MassRaiseRequest extends MassRaisePreviewRequest {
	orderReference: string;
	reason: string;
	effectiveDate: string;
	documentPath?: string;
	notes?: string;
}

export interface MassRaisePreviewItem {
	employeeId: string;
	employeeName: string;
	currentStep: number;
	newStep: number;
	currentSalary: string;
	newSalary: string;
	willBeSkipped: boolean;
	skipReason?: string;
}

export interface MassRaisePreviewResponse {
	totalEmployees: number;
	affectedEmployees: number;
	skippedEmployees: number;
	totalSalaryIncrease: string;
	preview: MassRaisePreviewItem[];
}

export interface MassRaiseResult {
	totalProcessed: number;
	successCount: number;
	failureCount: number;
	skippedCount: number;
	results: IncrementResult[];
}

interface EmployeeMinimalForHistory {
	id: string;
	employeeId: string;
	fullName: string;
	fullNameAm: string | null;
}

export interface SalaryHistory {
	id: string;
	tenantId: string;
	employeeId: string;
	rankId: string;
	changeType: SalaryChangeType;
	fromStep: number | null;
	toStep: number;
	fromSalary: string | null;
	toSalary: string;
	effectiveDate: string;
	reason: string | null;
	orderReference: string | null;
	documentPath: string | null;
	previousRankId: string | null;
	isAutomatic: boolean;
	processedBy: string | null;
	processedAt: string;
	approvedBy: string | null;
	approvedAt: string | null;
	notes: string | null;
	createdAt: string;
	employee?: EmployeeMinimalForHistory;
	rank?: RankMinimal;
	previousRank?: RankMinimal | null;
}

export interface SalaryHistoryListResponse {
	data: SalaryHistory[];
	meta: {
		total: number;
		page: number;
		limit: number;
		totalPages: number;
		hasNextPage: boolean;
		hasPreviousPage: boolean;
	};
}

export interface SalaryHistoryQuery {
	changeType?: SalaryChangeType;
	dateFrom?: string;
	dateTo?: string;
	rankId?: string;
	page?: number;
	limit?: number;
}

export interface SalaryProjection {
	employeeId: string;
	employeeName: string;
	currentRank: RankMinimal;
	currentStep: number;
	currentSalary: string;
	projections: Array<{
		step: number;
		salary: string;
		eligibilityDate: string;
		yearsFromNow: number;
	}>;
	maxStep: number;
	maxSalary: string;
	yearsToMaxStep: number;
}

export interface StepDistributionReport {
	generatedAt: string;
	centerId?: string;
	centerName?: string;
	ranks: Array<{
		rankId: string;
		rankCode: string;
		rankName: string;
		rankNameAm: string | null;
		category: string;
		totalEmployees: number;
		stepDistribution: Array<{
			step: number;
			count: number;
			percentage: number;
		}>;
	}>;
}

export interface RankSalarySteps {
	rankId: string;
	rankCode: string;
	rankName: string;
	rankNameAm: string | null;
	category: string;
	baseSalary: string;
	ceilingSalary: string;
	stepCount: number;
	stepPeriodYears: number;
	steps: Array<{
		stepNumber: number;
		salaryAmount: string;
		yearsRequired: number;
	}>;
}

export interface PromotionSalaryPreviewRequest {
	employeeId: string;
	newRankId: string;
}

export interface PromotionSalaryPreview {
	employeeId: string;
	employeeName: string;
	currentRank: RankMinimal;
	newRank: RankMinimal;
	currentStep: number;
	currentSalary: string;
	newStep: number;
	newSalary: string;
	salaryIncrease: string;
	percentageIncrease: string;
	calculationExplanation: string;
}

export interface ProcessPromotionRequest {
	employeeId: string;
	newRankId: string;
	effectiveDate: string;
	orderReference?: string;
	reason?: string;
	documentPath?: string;
}
