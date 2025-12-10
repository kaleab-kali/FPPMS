export interface Rank {
	id: string;
	tenantId?: string;
	code: string;
	name: string;
	nameAm: string;
	level: number;
	category: string;
	baseSalary: string;
	ceilingSalary: string;
	stepCount: number;
	stepPeriodYears: number;
	retirementAge: number;
	minYearsForPromotion?: number;
	minAppraisalScore?: number;
	badgePath?: string;
	sortOrder: number;
	isActive: boolean;
	createdAt: string;
	updatedAt: string;
}

export type MilitaryRank = Rank;

export interface CreateRankRequest {
	code: string;
	name: string;
	nameAm: string;
	level: number;
	category: string;
	baseSalary: number;
	ceilingSalary: number;
	stepCount?: number;
	stepPeriodYears?: number;
	retirementAge: number;
	minYearsForPromotion?: number;
	minAppraisalScore?: number;
	badgePath?: string;
	sortOrder?: number;
	isActive?: boolean;
}

export interface UpdateRankRequest {
	name?: string;
	nameAm?: string;
	level?: number;
	category?: string;
	baseSalary?: number;
	ceilingSalary?: number;
	stepCount?: number;
	stepPeriodYears?: number;
	retirementAge?: number;
	minYearsForPromotion?: number;
	minAppraisalScore?: number;
	badgePath?: string;
	sortOrder?: number;
	isActive?: boolean;
}
