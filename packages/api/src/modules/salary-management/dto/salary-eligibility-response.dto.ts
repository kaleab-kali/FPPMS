import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { SalaryEligibilityStatus } from "@prisma/client";

class RankForEligibilityDto {
	@ApiProperty({ description: "Rank ID" })
	id: string;

	@ApiProperty({ description: "Rank code", example: "CON" })
	code: string;

	@ApiProperty({ description: "Rank name", example: "Constable" })
	name: string;

	@ApiPropertyOptional({ description: "Rank name in Amharic" })
	nameAm: string | null;

	@ApiProperty({ description: "Rank category", example: "ENLISTED" })
	category: string;
}

class CenterForEligibilityDto {
	@ApiProperty({ description: "Center ID" })
	id: string;

	@ApiProperty({ description: "Center code" })
	code: string;

	@ApiProperty({ description: "Center name" })
	name: string;

	@ApiPropertyOptional({ description: "Center name in Amharic" })
	nameAm: string | null;
}

class DepartmentForEligibilityDto {
	@ApiProperty({ description: "Department ID" })
	id: string;

	@ApiProperty({ description: "Department code" })
	code: string;

	@ApiProperty({ description: "Department name" })
	name: string;

	@ApiPropertyOptional({ description: "Department name in Amharic" })
	nameAm: string | null;
}

class EmployeeForEligibilityDto {
	@ApiProperty({ description: "Employee UUID" })
	id: string;

	@ApiProperty({ description: "Employee ID (e.g., FPC-0001/25)" })
	employeeId: string;

	@ApiProperty({ description: "Full name in English" })
	fullName: string;

	@ApiPropertyOptional({ description: "Full name in Amharic" })
	fullNameAm: string | null;

	@ApiProperty({ description: "Employment date" })
	employmentDate: Date;

	@ApiPropertyOptional({ description: "Center details", type: CenterForEligibilityDto })
	center?: CenterForEligibilityDto | null;

	@ApiPropertyOptional({ description: "Department details", type: DepartmentForEligibilityDto })
	department?: DepartmentForEligibilityDto | null;
}

export class SalaryEligibilityResponseDto {
	@ApiProperty({ description: "Eligibility record ID" })
	id: string;

	@ApiProperty({ description: "Tenant ID" })
	tenantId: string;

	@ApiProperty({ description: "Employee ID" })
	employeeId: string;

	@ApiProperty({ description: "Rank ID" })
	rankId: string;

	@ApiProperty({ description: "Current salary step number", example: 3 })
	currentStep: number;

	@ApiProperty({ description: "Next salary step number", example: 4 })
	nextStepNumber: number;

	@ApiProperty({ description: "Current salary amount", example: "12500.00" })
	currentSalary: string;

	@ApiProperty({ description: "Next salary amount after increment", example: "13000.00" })
	nextSalary: string;

	@ApiProperty({ description: "Salary increase amount", example: "500.00" })
	salaryIncrease: string;

	@ApiProperty({ description: "Date when employee becomes eligible for the step increment" })
	eligibilityDate: Date;

	@ApiProperty({
		description: "Status of the eligibility",
		enum: SalaryEligibilityStatus,
		example: SalaryEligibilityStatus.PENDING,
	})
	status: SalaryEligibilityStatus;

	@ApiPropertyOptional({ description: "Date when the eligibility was processed" })
	processedAt: Date | null;

	@ApiPropertyOptional({ description: "User ID who processed the eligibility" })
	processedBy: string | null;

	@ApiPropertyOptional({ description: "Reason for rejection (if rejected)" })
	rejectionReason: string | null;

	@ApiPropertyOptional({ description: "ID of the salary history record created after processing" })
	salaryHistoryId: string | null;

	@ApiPropertyOptional({ description: "Date when HR was notified" })
	notifiedAt: Date | null;

	@ApiProperty({ description: "Record creation timestamp" })
	createdAt: Date;

	@ApiProperty({ description: "Record last update timestamp" })
	updatedAt: Date;

	@ApiPropertyOptional({ description: "Employee details", type: EmployeeForEligibilityDto })
	employee?: EmployeeForEligibilityDto;

	@ApiPropertyOptional({ description: "Rank details", type: RankForEligibilityDto })
	rank?: RankForEligibilityDto;
}

export class SalaryEligibilityListResponseDto {
	@ApiProperty({ description: "List of salary eligibility records", type: [SalaryEligibilityResponseDto] })
	data: SalaryEligibilityResponseDto[];

	@ApiProperty({
		description: "Pagination metadata",
		example: {
			total: 100,
			page: 1,
			limit: 20,
			totalPages: 5,
			hasNextPage: true,
			hasPreviousPage: false,
		},
	})
	meta: {
		total: number;
		page: number;
		limit: number;
		totalPages: number;
		hasNextPage: boolean;
		hasPreviousPage: boolean;
	};
}

export class TodayEligibilityResponseDto {
	@ApiProperty({ description: "List of employees eligible today", type: [SalaryEligibilityResponseDto] })
	data: SalaryEligibilityResponseDto[];

	@ApiProperty({ description: "Total count of eligible employees today", example: 15 })
	count: number;

	@ApiProperty({ description: "Today's date (ISO string)", example: "2025-06-01" })
	date: string;
}

export class SalaryEligibilitySummaryDto {
	@ApiProperty({ description: "Total pending eligibilities", example: 50 })
	pending: number;

	@ApiProperty({ description: "Total approved this month", example: 25 })
	approvedThisMonth: number;

	@ApiProperty({ description: "Total rejected this month", example: 5 })
	rejectedThisMonth: number;

	@ApiProperty({ description: "Upcoming eligibilities (next 30 days)", example: 30 })
	upcomingNext30Days: number;

	@ApiProperty({
		description: "Breakdown by rank",
		example: [
			{ rankId: "clx1", rankName: "Constable", count: 20 },
			{ rankId: "clx2", rankName: "Sergeant", count: 15 },
		],
	})
	byRank: Array<{
		rankId: string;
		rankName: string;
		count: number;
	}>;
}
