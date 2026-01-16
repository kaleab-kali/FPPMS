import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class RewardMilestoneResponseDto {
	@ApiProperty({
		description: "Milestone ID",
		example: "clx1234567890milestone",
	})
	id: string;

	@ApiProperty({
		description: "Tenant ID",
		example: "clx1234567890tenant",
	})
	tenantId: string;

	@ApiProperty({
		description: "Years of service required for this milestone",
		example: 10,
	})
	yearsOfService: number;

	@ApiProperty({
		description: "Name of the milestone in English",
		example: "10 Years of Service Award",
	})
	name: string;

	@ApiPropertyOptional({
		description: "Name of the milestone in Amharic",
		example: "10 \u12D3\u1218\u1275 \u12E8\u12A0\u1308\u120D\u130D\u120E\u1275 \u123D\u120D\u121B\u1275",
	})
	nameAm?: string;

	@ApiPropertyOptional({
		description: "Description of the milestone and reward details",
		example: "Recognition for a decade of dedicated service",
	})
	description?: string;

	@ApiProperty({
		description: "Type of reward",
		example: "MEDAL",
	})
	rewardType: string;

	@ApiPropertyOptional({
		description: "Monetary value of the reward if applicable",
		example: 5000.0,
	})
	monetaryValue?: number;

	@ApiProperty({
		description: "Whether the milestone is active",
		example: true,
	})
	isActive: boolean;

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
}

export class RewardMilestoneListResponseDto {
	@ApiProperty({
		description: "List of reward milestones",
		type: [RewardMilestoneResponseDto],
	})
	data: RewardMilestoneResponseDto[];
}
