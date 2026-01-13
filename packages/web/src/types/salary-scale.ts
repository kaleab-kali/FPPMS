export type SalaryScaleStatus = "DRAFT" | "ACTIVE" | "ARCHIVED";

export interface SalaryScaleStep {
	id: string;
	stepNumber: number;
	salaryAmount: string;
	yearsRequired: number;
}

export interface SalaryScaleRank {
	id: string;
	rankCode: string;
	rankName: string;
	rankNameAm?: string;
	category: string;
	level: number;
	baseSalary: string;
	ceilingSalary: string;
	sortOrder: number;
	salarySteps?: SalaryScaleStep[];
}

export interface SalaryScaleVersion {
	id: string;
	tenantId?: string;
	code: string;
	name: string;
	nameAm?: string;
	description?: string;
	effectiveDate: string;
	expiryDate?: string;
	status: SalaryScaleStatus;
	stepCount: number;
	stepPeriodYears: number;
	approvedBy?: string;
	approvedAt?: string;
	createdBy?: string;
	createdAt: string;
	updatedAt: string;
	rankSalaries?: SalaryScaleRank[];
}

export interface SalaryScaleListItem {
	id: string;
	code: string;
	name: string;
	nameAm?: string;
	effectiveDate: string;
	expiryDate?: string;
	status: SalaryScaleStatus;
	rankCount: number;
	createdAt: string;
}

export interface SalaryScaleStepInput {
	stepNumber: number;
	salaryAmount: number;
}

export interface SalaryScaleRankInput {
	rankCode: string;
	rankName: string;
	rankNameAm?: string;
	category: string;
	level: number;
	baseSalary: number;
	ceilingSalary: number;
	sortOrder?: number;
	salarySteps: SalaryScaleStepInput[];
}

export interface CreateSalaryScaleRequest {
	code: string;
	name: string;
	nameAm?: string;
	description?: string;
	effectiveDate: string;
	expiryDate?: string;
	stepCount?: number;
	stepPeriodYears?: number;
	ranks: SalaryScaleRankInput[];
}

export interface UpdateSalaryScaleRequest {
	name?: string;
	nameAm?: string;
	description?: string;
	effectiveDate?: string;
	expiryDate?: string;
	status?: SalaryScaleStatus;
	stepCount?: number;
	stepPeriodYears?: number;
	ranks?: SalaryScaleRankInput[];
}
