import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class SalaryStepResponseDto {
	@ApiProperty({ description: "Salary step ID", example: "clxyz123" })
	id: string;

	@ApiProperty({ description: "Step number (0 for base, 1-9 for increments)", example: 1 })
	stepNumber: number;

	@ApiProperty({ description: "Salary amount for this step", example: "6591.00" })
	salaryAmount: string;

	@ApiProperty({ description: "Years of service required to reach this step", example: 2 })
	yearsRequired: number;
}

export class RankResponseDto {
	@ApiProperty({ description: "Rank ID", example: "clxyz123" })
	id: string;

	@ApiPropertyOptional({ description: "Tenant ID (null for global ranks)" })
	tenantId: string | undefined;

	@ApiProperty({ description: "Unique rank code", example: "CONST" })
	code: string;

	@ApiProperty({ description: "Rank name in English", example: "Constable" })
	name: string;

	@ApiProperty({ description: "Rank name in Amharic", example: "\u12AE\u1295\u1235\u1273\u1265\u120D" })
	nameAm: string;

	@ApiProperty({ description: "Hierarchical level (1 is lowest)", example: 1 })
	level: number;

	@ApiProperty({ description: "Rank category", example: "ENLISTED" })
	category: string;

	@ApiProperty({ description: "Base salary (Step 0)", example: "6365.00" })
	baseSalary: string;

	@ApiProperty({ description: "Ceiling salary (maximum)", example: "8944.00" })
	ceilingSalary: string;

	@ApiProperty({ description: "Number of salary steps", example: 9 })
	stepCount: number;

	@ApiProperty({ description: "Years between step increments", example: 2 })
	stepPeriodYears: number;

	@ApiProperty({ description: "Retirement age for this rank", example: 50 })
	retirementAge: number;

	@ApiPropertyOptional({ description: "Minimum years for promotion", example: 3 })
	minYearsForPromotion: number | undefined;

	@ApiPropertyOptional({ description: "Minimum appraisal score for promotion", example: 70 })
	minAppraisalScore: number | undefined;

	@ApiPropertyOptional({ description: "Path to rank badge image", example: "/badges/constable.png" })
	badgePath: string | undefined;

	@ApiProperty({ description: "Sort order for display", example: 0 })
	sortOrder: number;

	@ApiProperty({ description: "Whether the rank is active", example: true })
	isActive: boolean;

	@ApiProperty({ description: "Creation timestamp" })
	createdAt: Date;

	@ApiProperty({ description: "Last update timestamp" })
	updatedAt: Date;

	@ApiPropertyOptional({
		description: "Salary steps for this rank",
		type: [SalaryStepResponseDto],
	})
	salarySteps?: SalaryStepResponseDto[];
}
