import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { WeaponCondition } from "@prisma/client";
import { IsDateString, IsEnum, IsInt, IsOptional, IsString, Min } from "class-validator";

export class ReturnWeaponDto {
	@ApiPropertyOptional({
		description: "Return date (YYYY-MM-DD). Defaults to today.",
		example: "2025-02-15",
	})
	@IsDateString()
	@IsOptional()
	returnedDate?: string;

	@ApiProperty({
		description: "Condition of the weapon at return",
		enum: WeaponCondition,
		enumName: "WeaponCondition",
		example: WeaponCondition.GOOD,
	})
	@IsEnum(WeaponCondition)
	conditionAtReturn: WeaponCondition;

	@ApiPropertyOptional({
		description: "Number of ammunition rounds returned",
		example: 25,
		minimum: 0,
	})
	@IsInt()
	@Min(0)
	@IsOptional()
	returnedRounds?: number;

	@ApiPropertyOptional({
		description: "Additional remarks about the return",
		example: "Weapon returned in good condition, 5 rounds consumed during duty",
	})
	@IsString()
	@IsOptional()
	remarks?: string;
}
