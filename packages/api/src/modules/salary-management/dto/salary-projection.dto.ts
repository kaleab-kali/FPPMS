import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

class RankProjectionDto {
	@ApiProperty({ description: "Rank ID" })
	id: string;

	@ApiProperty({ description: "Rank code" })
	code: string;

	@ApiProperty({ description: "Rank name" })
	name: string;

	@ApiPropertyOptional({ description: "Rank name in Amharic" })
	nameAm: string | null;
}

export class SalaryProjectionItemDto {
	@ApiProperty({ description: "Projected year", example: 2025 })
	year: number;

	@ApiProperty({ description: "Projected step number", example: 4 })
	step: number;

	@ApiProperty({ description: "Projected salary amount", example: "13500.00" })
	salary: string;

	@ApiProperty({ description: "Date when this step would become effective", example: "2025-06-01" })
	effectiveDate: string;

	@ApiProperty({
		description: "Type of change",
		example: "STEP_INCREMENT",
	})
	changeType: string;

	@ApiProperty({ description: "Whether this is the ceiling step", example: false })
	isCeiling: boolean;
}

export class SalaryProjectionResponseDto {
	@ApiProperty({ description: "Employee ID (UUID)" })
	employeeId: string;

	@ApiProperty({ description: "Employee ID (format: FPC-XXXX/YY)" })
	employeeCode: string;

	@ApiProperty({ description: "Employee full name" })
	employeeName: string;

	@ApiProperty({ description: "Current rank details", type: RankProjectionDto })
	currentRank: RankProjectionDto;

	@ApiProperty({ description: "Current salary step", example: 3 })
	currentStep: number;

	@ApiProperty({ description: "Current salary amount", example: "12500.00" })
	currentSalary: string;

	@ApiProperty({ description: "Employment date" })
	employmentDate: Date;

	@ApiProperty({ description: "Maximum step for current rank", example: 9 })
	maxStep: number;

	@ApiProperty({ description: "Ceiling salary for current rank", example: "18000.00" })
	ceilingSalary: string;

	@ApiProperty({ description: "Years until reaching ceiling step", example: 12 })
	yearsToReachCeiling: number;

	@ApiProperty({
		description: "Projected salary progression for future years",
		type: [SalaryProjectionItemDto],
	})
	projections: SalaryProjectionItemDto[];

	@ApiProperty({ description: "Projected date to reach ceiling salary", example: "2037-06-01" })
	projectedCeilingDate: string | null;

	@ApiProperty({
		description: "Next eligibility date for step increment",
		example: "2025-06-01",
	})
	nextEligibilityDate: string | null;

	@ApiPropertyOptional({ description: "Days until next eligibility", example: 45 })
	daysUntilNextEligibility: number | null;
}

export class StepDistributionItemDto {
	@ApiProperty({ description: "Step number", example: 3 })
	step: number;

	@ApiProperty({ description: "Number of employees at this step", example: 25 })
	count: number;

	@ApiProperty({ description: "Salary amount for this step", example: "12500.00" })
	salaryAmount: string;

	@ApiProperty({ description: "Percentage of total employees", example: "15.50" })
	percentage: string;
}

export class RankStepDistributionDto {
	@ApiProperty({ description: "Rank ID" })
	rankId: string;

	@ApiProperty({ description: "Rank code" })
	rankCode: string;

	@ApiProperty({ description: "Rank name" })
	rankName: string;

	@ApiPropertyOptional({ description: "Rank name in Amharic" })
	rankNameAm: string | null;

	@ApiProperty({ description: "Total employees in this rank", example: 150 })
	totalEmployees: number;

	@ApiProperty({ description: "Base salary for step 0", example: "10000.00" })
	baseSalary: string;

	@ApiProperty({ description: "Ceiling salary for step 9", example: "18000.00" })
	ceilingSalary: string;

	@ApiProperty({
		description: "Distribution of employees across steps",
		type: [StepDistributionItemDto],
	})
	distribution: StepDistributionItemDto[];
}

export class StepDistributionReportDto {
	@ApiProperty({ description: "Tenant ID" })
	tenantId: string;

	@ApiProperty({ description: "Report generation timestamp" })
	generatedAt: Date;

	@ApiProperty({ description: "Total military employees", example: 500 })
	totalMilitaryEmployees: number;

	@ApiProperty({
		description: "Step distribution by rank",
		type: [RankStepDistributionDto],
	})
	byRank: RankStepDistributionDto[];

	@ApiProperty({
		description: "Overall step distribution across all ranks",
		type: [StepDistributionItemDto],
	})
	overallDistribution: StepDistributionItemDto[];

	@ApiProperty({ description: "Average step across all military employees", example: "4.2" })
	averageStep: string;

	@ApiProperty({ description: "Employees at ceiling (step 9)", example: 45 })
	employeesAtCeiling: number;

	@ApiProperty({ description: "Percentage of employees at ceiling", example: "9.00" })
	ceilingPercentage: string;
}

export class RankSalaryStepsResponseDto {
	@ApiProperty({ description: "Rank ID" })
	rankId: string;

	@ApiProperty({ description: "Rank code" })
	rankCode: string;

	@ApiProperty({ description: "Rank name" })
	rankName: string;

	@ApiPropertyOptional({ description: "Rank name in Amharic" })
	rankNameAm: string | null;

	@ApiProperty({ description: "Rank category", example: "ENLISTED" })
	category: string;

	@ApiProperty({ description: "Base salary (step 0)", example: "10000.00" })
	baseSalary: string;

	@ApiProperty({ description: "Ceiling salary (max step)", example: "18000.00" })
	ceilingSalary: string;

	@ApiProperty({ description: "Number of salary steps", example: 10 })
	stepCount: number;

	@ApiProperty({ description: "Years required between steps", example: 2 })
	stepPeriodYears: number;

	@ApiProperty({
		description: "All salary steps for this rank",
		example: [
			{ stepNumber: 0, salaryAmount: "10000.00", yearsRequired: 0 },
			{ stepNumber: 1, salaryAmount: "11000.00", yearsRequired: 2 },
		],
	})
	steps: Array<{
		stepNumber: number;
		salaryAmount: string;
		yearsRequired: number;
	}>;
}
