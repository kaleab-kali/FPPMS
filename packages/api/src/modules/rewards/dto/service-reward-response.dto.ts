import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { RewardEligibility, ServiceRewardStatus } from "@prisma/client";

export class EmployeeMinimalDto {
	@ApiProperty({
		description: "Employee ID (database ID)",
		example: "clx1234567890employee",
	})
	id: string;

	@ApiProperty({
		description: "Employee ID code",
		example: "FPC-0001/25",
	})
	employeeId: string;

	@ApiProperty({
		description: "Full name in English",
		example: "John Doe",
	})
	fullName: string;

	@ApiPropertyOptional({
		description: "Full name in Amharic",
	})
	fullNameAm?: string;
}

export class MilestoneMinimalDto {
	@ApiProperty({
		description: "Milestone ID",
		example: "clx1234567890milestone",
	})
	id: string;

	@ApiProperty({
		description: "Years of service",
		example: 10,
	})
	yearsOfService: number;

	@ApiProperty({
		description: "Milestone name",
		example: "10 Years of Service Award",
	})
	name: string;

	@ApiPropertyOptional({
		description: "Milestone name in Amharic",
	})
	nameAm?: string;

	@ApiProperty({
		description: "Reward type",
		example: "MEDAL",
	})
	rewardType: string;
}

export class ServiceRewardTimelineResponseDto {
	@ApiProperty({
		description: "Timeline entry ID",
		example: "clx1234567890timeline",
	})
	id: string;

	@ApiProperty({
		description: "Action performed",
		example: "CREATED",
	})
	action: string;

	@ApiPropertyOptional({
		description: "Status before the action",
		enum: ServiceRewardStatus,
		enumName: "ServiceRewardStatus",
	})
	fromStatus?: string;

	@ApiPropertyOptional({
		description: "Status after the action",
		enum: ServiceRewardStatus,
		enumName: "ServiceRewardStatus",
	})
	toStatus?: string;

	@ApiProperty({
		description: "User ID who performed the action",
		example: "clx1234567890user",
	})
	performedBy: string;

	@ApiProperty({
		description: "When the action was performed",
		example: "2025-01-20T10:30:00Z",
	})
	performedAt: Date;

	@ApiPropertyOptional({
		description: "Additional notes",
		example: "Eligibility verified based on service records",
	})
	notes?: string;
}

export class ServiceRewardResponseDto {
	@ApiProperty({
		description: "Service reward ID",
		example: "clx1234567890reward",
	})
	id: string;

	@ApiProperty({
		description: "Tenant ID",
		example: "clx1234567890tenant",
	})
	tenantId: string;

	@ApiProperty({
		description: "Employee ID (database ID)",
		example: "clx1234567890employee",
	})
	employeeId: string;

	@ApiPropertyOptional({
		description: "Employee details",
		type: EmployeeMinimalDto,
	})
	employee?: EmployeeMinimalDto;

	@ApiProperty({
		description: "Milestone ID",
		example: "clx1234567890milestone",
	})
	milestoneId: string;

	@ApiPropertyOptional({
		description: "Milestone details",
		type: MilestoneMinimalDto,
	})
	milestone?: MilestoneMinimalDto;

	@ApiProperty({
		description: "Eligibility status",
		enum: RewardEligibility,
		enumName: "RewardEligibility",
		example: "ELIGIBLE",
	})
	eligibilityStatus: RewardEligibility;

	@ApiProperty({
		description: "Date when eligibility was checked",
		example: "2025-01-20T10:30:00Z",
	})
	eligibilityCheckDate: Date;

	@ApiPropertyOptional({
		description: "Reason for ineligibility if applicable",
		example: "Active Article 31 violation impacts reward eligibility",
	})
	ineligibilityReason?: string;

	@ApiPropertyOptional({
		description: "Date until which the reward is postponed",
		example: "2027-01-20",
	})
	postponedUntil?: Date;

	@ApiPropertyOptional({
		description: "Reason for postponement",
		example: "Ongoing investigation requires resolution",
	})
	postponementReason?: string;

	@ApiPropertyOptional({
		description: "Original date when employee became eligible",
		example: "2025-01-15",
	})
	originalEligibleDate?: Date;

	@ApiPropertyOptional({
		description: "Date when the award was given",
		example: "2025-03-01",
	})
	awardDate?: Date;

	@ApiPropertyOptional({
		description: "User ID who awarded the reward",
		example: "clx1234567890user",
	})
	awardedBy?: string;

	@ApiPropertyOptional({
		description: "Details about the ceremony",
		example: "Annual recognition ceremony at HQ",
	})
	ceremonyDetails?: string;

	@ApiPropertyOptional({
		description: "Certificate number",
		example: "CERT-2025-0001",
	})
	certificateNumber?: string;

	@ApiPropertyOptional({
		description: "Path to the certificate file",
		example: "/uploads/certificates/cert-2025-0001.pdf",
	})
	certificatePath?: string;

	@ApiPropertyOptional({
		description: "Path to the photo from the ceremony",
		example: "/uploads/photos/ceremony-2025-0001.jpg",
	})
	photoPath?: string;

	@ApiProperty({
		description: "Current status of the service reward",
		enum: ServiceRewardStatus,
		enumName: "ServiceRewardStatus",
		example: "PENDING",
	})
	status: ServiceRewardStatus;

	@ApiPropertyOptional({
		description: "Date when submitted for approval",
		example: "2025-01-25T10:30:00Z",
	})
	submittedForApprovalAt?: Date;

	@ApiPropertyOptional({
		description: "User ID who submitted for approval",
		example: "clx1234567890user",
	})
	submittedForApprovalBy?: string;

	@ApiPropertyOptional({
		description: "Date when approved",
		example: "2025-01-30T10:30:00Z",
	})
	approvedAt?: Date;

	@ApiPropertyOptional({
		description: "User ID who approved",
		example: "clx1234567890user",
	})
	approvedBy?: string;

	@ApiPropertyOptional({
		description: "Reason for rejection if rejected",
		example: "Incomplete documentation",
	})
	rejectionReason?: string;

	@ApiPropertyOptional({
		description: "User ID who created the record",
		example: "clx1234567890user",
	})
	createdBy?: string;

	@ApiProperty({
		description: "Created timestamp",
		example: "2025-01-20T10:30:00Z",
	})
	createdAt: Date;

	@ApiProperty({
		description: "Updated timestamp",
		example: "2025-01-20T10:30:00Z",
	})
	updatedAt: Date;

	@ApiPropertyOptional({
		description: "Timeline entries",
		type: [ServiceRewardTimelineResponseDto],
	})
	timeline?: ServiceRewardTimelineResponseDto[];
}

export class ServiceRewardListResponseDto {
	@ApiProperty({
		description: "Service reward ID",
		example: "clx1234567890reward",
	})
	id: string;

	@ApiPropertyOptional({
		description: "Employee details",
		type: EmployeeMinimalDto,
	})
	employee?: EmployeeMinimalDto;

	@ApiPropertyOptional({
		description: "Milestone details",
		type: MilestoneMinimalDto,
	})
	milestone?: MilestoneMinimalDto;

	@ApiProperty({
		description: "Eligibility status",
		enum: RewardEligibility,
		enumName: "RewardEligibility",
		example: "ELIGIBLE",
	})
	eligibilityStatus: RewardEligibility;

	@ApiProperty({
		description: "Current status",
		enum: ServiceRewardStatus,
		enumName: "ServiceRewardStatus",
		example: "PENDING",
	})
	status: ServiceRewardStatus;

	@ApiPropertyOptional({
		description: "Award date if awarded",
		example: "2025-03-01",
	})
	awardDate?: Date;

	@ApiProperty({
		description: "Date when eligibility was checked",
		example: "2025-01-20T10:30:00Z",
	})
	eligibilityCheckDate: Date;

	@ApiProperty({
		description: "Created timestamp",
		example: "2025-01-20T10:30:00Z",
	})
	createdAt: Date;
}
