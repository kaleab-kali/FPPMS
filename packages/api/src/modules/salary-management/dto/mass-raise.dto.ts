import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsDateString, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Max, MaxLength, Min } from "class-validator";

export enum MassRaiseType {
	INCREMENT_BY_STEPS = "INCREMENT_BY_STEPS",
	JUMP_TO_STEP = "JUMP_TO_STEP",
}

export class MassRaiseDto {
	@ApiProperty({
		description: "The rank ID for which to apply the mass raise",
		example: "clx1234567890",
	})
	@IsString()
	@IsNotEmpty()
	rankId: string;

	@ApiProperty({
		description: "Type of mass raise: increment by N steps or jump all to a specific step",
		enum: MassRaiseType,
		example: MassRaiseType.INCREMENT_BY_STEPS,
	})
	@IsEnum(MassRaiseType)
	@IsNotEmpty()
	raiseType: MassRaiseType;

	@ApiPropertyOptional({
		description: "Number of steps to increment (required when raiseType is INCREMENT_BY_STEPS)",
		example: 1,
		minimum: 1,
		maximum: 9,
	})
	@IsInt()
	@Min(1)
	@Max(9)
	@IsOptional()
	incrementSteps?: number;

	@ApiPropertyOptional({
		description: "Target step number (required when raiseType is JUMP_TO_STEP)",
		example: 5,
		minimum: 0,
		maximum: 9,
	})
	@IsInt()
	@Min(0)
	@Max(9)
	@IsOptional()
	targetStep?: number;

	@ApiProperty({
		description: "Reference number of the order authorizing the mass raise",
		example: "CO/2025/MASS-RAISE/001",
	})
	@IsString()
	@IsNotEmpty()
	@MaxLength(100)
	orderReference: string;

	@ApiProperty({
		description: "Reason for the mass raise",
		example: "Annual salary scale adjustment for all Constables",
	})
	@IsString()
	@IsNotEmpty()
	@MaxLength(500)
	reason: string;

	@ApiProperty({
		description: "Effective date for the mass raise (ISO date string)",
		example: "2025-07-01",
	})
	@IsDateString()
	@IsNotEmpty()
	effectiveDate: string;

	@ApiPropertyOptional({
		description: "Filter by center ID (leave empty for all centers)",
		example: "clx1234567890",
	})
	@IsString()
	@IsOptional()
	centerId?: string;

	@ApiPropertyOptional({
		description: "Path to the uploaded order document",
		example: "/uploads/orders/mass-raise-2025.pdf",
	})
	@IsString()
	@IsOptional()
	documentPath?: string;

	@ApiPropertyOptional({
		description: "Additional notes for the mass raise",
		example: "Approved by Commissioner on June 15, 2025",
	})
	@IsString()
	@MaxLength(500)
	@IsOptional()
	notes?: string;
}

export class MassRaisePreviewDto {
	@ApiProperty({
		description: "The rank ID for which to preview the mass raise",
		example: "clx1234567890",
	})
	@IsString()
	@IsNotEmpty()
	rankId: string;

	@ApiProperty({
		description: "Type of mass raise: increment by N steps or jump all to a specific step",
		enum: MassRaiseType,
		example: MassRaiseType.INCREMENT_BY_STEPS,
	})
	@IsEnum(MassRaiseType)
	@IsNotEmpty()
	raiseType: MassRaiseType;

	@ApiPropertyOptional({
		description: "Number of steps to increment (required when raiseType is INCREMENT_BY_STEPS)",
		example: 1,
	})
	@IsInt()
	@Min(1)
	@Max(9)
	@IsOptional()
	incrementSteps?: number;

	@ApiPropertyOptional({
		description: "Target step number (required when raiseType is JUMP_TO_STEP)",
		example: 5,
	})
	@IsInt()
	@Min(0)
	@Max(9)
	@IsOptional()
	targetStep?: number;

	@ApiPropertyOptional({
		description: "Filter by center ID (leave empty for all centers)",
		example: "clx1234567890",
	})
	@IsString()
	@IsOptional()
	centerId?: string;
}
