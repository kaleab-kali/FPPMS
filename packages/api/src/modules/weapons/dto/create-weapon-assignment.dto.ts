import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { WeaponCondition } from "@prisma/client";
import { IsDateString, IsEnum, IsInt, IsOptional, IsString, IsUUID, Min } from "class-validator";

export class CreateWeaponAssignmentDto {
	@ApiProperty({
		description: "ID of the weapon to assign",
		example: "clx1234567890",
	})
	@IsUUID()
	weaponId: string;

	@ApiProperty({
		description: "ID of the employee to assign the weapon to",
		example: "clx0987654321",
	})
	@IsUUID()
	employeeId: string;

	@ApiProperty({
		description: "Date of assignment (YYYY-MM-DD)",
		example: "2025-01-15",
	})
	@IsDateString()
	assignedDate: string;

	@ApiPropertyOptional({
		description: "Expected return date (YYYY-MM-DD)",
		example: "2025-02-15",
	})
	@IsDateString()
	@IsOptional()
	expectedReturnDate?: string;

	@ApiProperty({
		description: "Condition of the weapon at time of assignment",
		enum: WeaponCondition,
		enumName: "WeaponCondition",
		example: WeaponCondition.GOOD,
	})
	@IsEnum(WeaponCondition)
	conditionAtAssignment: WeaponCondition;

	@ApiPropertyOptional({
		description: "Number of ammunition rounds issued with the weapon",
		example: 30,
		minimum: 0,
	})
	@IsInt()
	@Min(0)
	@IsOptional()
	issuedRounds?: number;

	@ApiPropertyOptional({
		description: "Purpose of the weapon assignment",
		example: "Duty assignment",
	})
	@IsString()
	@IsOptional()
	purpose?: string;

	@ApiPropertyOptional({
		description: "Additional remarks",
		example: "Assigned for patrol duty",
	})
	@IsString()
	@IsOptional()
	remarks?: string;
}
