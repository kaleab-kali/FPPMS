import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsBoolean, IsInt, IsNumber, IsOptional, IsString, Max, Min } from "class-validator";

export class CreateRewardMilestoneDto {
	@ApiProperty({
		description: "Years of service required for this milestone",
		example: 10,
		minimum: 1,
		maximum: 50,
	})
	@IsInt()
	@Min(1)
	@Max(50)
	yearsOfService: number;

	@ApiProperty({
		description: "Name of the milestone in English",
		example: "10 Years of Service Award",
	})
	@IsString()
	name: string;

	@ApiPropertyOptional({
		description: "Name of the milestone in Amharic",
		example: "10 \u12D3\u1218\u1275 \u12E8\u12A0\u1308\u120D\u130D\u120E\u1275 \u123D\u120D\u121B\u1275",
	})
	@IsString()
	@IsOptional()
	nameAm?: string;

	@ApiPropertyOptional({
		description: "Description of the milestone and reward details",
		example: "Recognition for a decade of dedicated service",
	})
	@IsString()
	@IsOptional()
	description?: string;

	@ApiProperty({
		description: "Type of reward (e.g., MEDAL, CERTIFICATE, MONETARY, PROMOTION)",
		example: "MEDAL",
	})
	@IsString()
	rewardType: string;

	@ApiPropertyOptional({
		description: "Monetary value of the reward if applicable",
		example: 5000.0,
	})
	@IsNumber({ maxDecimalPlaces: 2 })
	@IsOptional()
	@Transform(({ value }) => (value !== undefined ? parseFloat(value) : undefined))
	monetaryValue?: number;

	@ApiPropertyOptional({
		description: "Whether the milestone is active",
		example: true,
		default: true,
	})
	@IsBoolean()
	@IsOptional()
	isActive?: boolean;
}
