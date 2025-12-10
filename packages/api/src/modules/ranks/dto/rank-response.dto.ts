export class RankResponseDto {
	id: string;
	tenantId: string | undefined;
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
	minYearsForPromotion: number | undefined;
	minAppraisalScore: number | undefined;
	badgePath: string | undefined;
	sortOrder: number;
	isActive: boolean;
	createdAt: Date;
	updatedAt: Date;
}
