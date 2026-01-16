import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { RewardEligibility } from "@prisma/client";
import { IsArray, IsOptional, IsString } from "class-validator";

export class CheckEligibilityResponseDto {
	@ApiProperty({
		description: "Employee ID (database ID)",
		example: "clx1234567890employee",
	})
	employeeId: string;

	@ApiProperty({
		description: "Employee ID code",
		example: "FPC-0001/25",
	})
	employeeCode: string;

	@ApiProperty({
		description: "Employee full name",
		example: "John Doe",
	})
	employeeName: string;

	@ApiProperty({
		description: "Milestone ID",
		example: "clx1234567890milestone",
	})
	milestoneId: string;

	@ApiProperty({
		description: "Milestone name",
		example: "10 Years of Service Award",
	})
	milestoneName: string;

	@ApiProperty({
		description: "Years of service",
		example: 10,
	})
	yearsOfService: number;

	@ApiProperty({
		description: "Eligibility status determined",
		enum: RewardEligibility,
		enumName: "RewardEligibility",
		example: "ELIGIBLE",
	})
	eligibilityStatus: RewardEligibility;

	@ApiPropertyOptional({
		description: "Reason for ineligibility or postponement",
		example: "Active Article 31 violation",
	})
	reason?: string;

	@ApiPropertyOptional({
		description: "Date until postponed if postponed",
		example: "2027-01-20",
	})
	postponedUntil?: Date;

	@ApiProperty({
		description: "Employment date used for calculation",
		example: "2015-01-15",
	})
	employmentDate: Date;

	@ApiProperty({
		description: "Calculated years of service",
		example: 10.5,
	})
	calculatedYearsOfService: number;

	@ApiProperty({
		description: "Date when employee will reach/reached this milestone",
		example: "2025-01-15",
	})
	milestoneDate: Date;

	@ApiProperty({
		description: "Whether already has a service reward record for this milestone",
		example: false,
	})
	existingRewardRecord: boolean;

	@ApiPropertyOptional({
		description: "Existing service reward ID if any",
		example: "clx1234567890reward",
	})
	existingRewardId?: string;
}

export class BatchCheckEligibilityDto {
	@ApiProperty({
		description: "Milestone ID to check eligibility for",
		example: "clx1234567890milestone",
	})
	@IsString()
	milestoneId: string;

	@ApiPropertyOptional({
		description: "Center ID to filter employees (if not provided, checks all)",
		example: "clx1234567890center",
	})
	@IsString()
	@IsOptional()
	centerId?: string;

	@ApiPropertyOptional({
		description: "Specific employee IDs to check (if not provided, checks all approaching employees)",
		type: [String],
		example: ["clx1234567890emp1", "clx1234567890emp2"],
	})
	@IsArray()
	@IsString({ each: true })
	@IsOptional()
	employeeIds?: string[];
}

export class BatchCheckEligibilityResponseDto {
	@ApiProperty({
		description: "Total employees checked",
		example: 50,
	})
	totalChecked: number;

	@ApiProperty({
		description: "Number of eligible employees",
		example: 40,
	})
	eligible: number;

	@ApiProperty({
		description: "Number of disqualified employees (Article 31)",
		example: 3,
	})
	disqualified: number;

	@ApiProperty({
		description: "Number of postponed employees (ongoing investigation)",
		example: 5,
	})
	postponed: number;

	@ApiProperty({
		description: "Number pending review (Article 30)",
		example: 2,
	})
	pendingReview: number;

	@ApiProperty({
		description: "Detailed results for each employee",
		type: [CheckEligibilityResponseDto],
	})
	results: CheckEligibilityResponseDto[];
}

export class EligibilitySummaryDto {
	@ApiProperty({
		description: "Total employees approaching milestones",
		example: 100,
	})
	totalApproaching: number;

	@ApiProperty({
		description: "Employees by milestone year",
		example: { "10": 30, "15": 25, "20": 20, "25": 15, "30": 10 },
	})
	byMilestone: Record<number, number>;

	@ApiProperty({
		description: "Pending eligibility checks",
		example: 20,
	})
	pendingChecks: number;

	@ApiProperty({
		description: "Awaiting approval",
		example: 15,
	})
	awaitingApproval: number;

	@ApiProperty({
		description: "Ready for award",
		example: 10,
	})
	readyForAward: number;

	@ApiProperty({
		description: "Awarded this year",
		example: 50,
	})
	awardedThisYear: number;

	@ApiProperty({
		description: "Postponed due to investigations",
		example: 5,
	})
	postponed: number;
}

export class ApproachingMilestoneDto {
	@ApiProperty({
		description: "Employee ID (database ID)",
		example: "clx1234567890employee",
	})
	employeeId: string;

	@ApiProperty({
		description: "Employee ID code",
		example: "FPC-0001/25",
	})
	employeeCode: string;

	@ApiProperty({
		description: "Employee full name",
		example: "John Doe",
	})
	employeeName: string;

	@ApiPropertyOptional({
		description: "Employee full name in Amharic",
	})
	employeeNameAm?: string;

	@ApiPropertyOptional({
		description: "Center ID",
		example: "clx1234567890center",
	})
	centerId?: string;

	@ApiPropertyOptional({
		description: "Center name",
		example: "Addis Ababa Center",
	})
	centerName?: string;

	@ApiProperty({
		description: "Employment date",
		example: "2015-01-15",
	})
	employmentDate: Date;

	@ApiProperty({
		description: "Current years of service",
		example: 9.8,
	})
	currentYearsOfService: number;

	@ApiProperty({
		description: "Approaching milestone years",
		example: 10,
	})
	milestoneYears: number;

	@ApiProperty({
		description: "Milestone name",
		example: "10 Years of Service Award",
	})
	milestoneName: string;

	@ApiProperty({
		description: "Milestone ID",
		example: "clx1234567890milestone",
	})
	milestoneId: string;

	@ApiProperty({
		description: "Date when employee will reach milestone",
		example: "2025-01-15",
	})
	milestoneDate: Date;

	@ApiProperty({
		description: "Days until milestone",
		example: 30,
	})
	daysUntilMilestone: number;

	@ApiProperty({
		description: "Whether eligibility has been checked",
		example: false,
	})
	eligibilityChecked: boolean;

	@ApiPropertyOptional({
		description: "Existing reward record status if any",
		example: "PENDING",
	})
	existingRewardStatus?: string;
}
