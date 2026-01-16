import { ApiPropertyOptional } from "@nestjs/swagger";
import { WeaponCondition, WeaponStatus } from "@prisma/client";
import {
	IsBoolean,
	IsDateString,
	IsEnum,
	IsInt,
	IsNumber,
	IsOptional,
	IsString,
	IsUUID,
	Max,
	Min,
} from "class-validator";

export class UpdateWeaponDto {
	@ApiPropertyOptional({
		description: "ID of the weapon type",
		example: "clx1234567890",
	})
	@IsUUID()
	@IsOptional()
	weaponTypeId?: string;

	@ApiPropertyOptional({
		description: "ID of the center where the weapon is stored",
		example: "clx0987654321",
	})
	@IsUUID()
	@IsOptional()
	centerId?: string;

	@ApiPropertyOptional({
		description: "Registration number assigned by authorities",
		example: "REG-2025-00001",
	})
	@IsString()
	@IsOptional()
	registrationNumber?: string;

	@ApiPropertyOptional({
		description: "Year the weapon was manufactured",
		example: 2020,
		minimum: 1900,
		maximum: 2100,
	})
	@IsInt()
	@Min(1900)
	@Max(2100)
	@IsOptional()
	manufactureYear?: number;

	@ApiPropertyOptional({
		description: "Date the weapon was acquired (YYYY-MM-DD)",
		example: "2023-06-15",
	})
	@IsDateString()
	@IsOptional()
	acquisitionDate?: string;

	@ApiPropertyOptional({
		description: "Method of acquisition",
		example: "Purchase",
	})
	@IsString()
	@IsOptional()
	acquisitionMethod?: string;

	@ApiPropertyOptional({
		description: "Purchase price of the weapon",
		example: 15000.0,
	})
	@IsNumber()
	@IsOptional()
	purchasePrice?: number;

	@ApiPropertyOptional({
		description: "Current status of the weapon",
		enum: WeaponStatus,
		enumName: "WeaponStatus",
		example: WeaponStatus.IN_SERVICE,
	})
	@IsEnum(WeaponStatus)
	@IsOptional()
	status?: WeaponStatus;

	@ApiPropertyOptional({
		description: "Current condition of the weapon",
		enum: WeaponCondition,
		enumName: "WeaponCondition",
		example: WeaponCondition.GOOD,
	})
	@IsEnum(WeaponCondition)
	@IsOptional()
	condition?: WeaponCondition;

	@ApiPropertyOptional({
		description: "Date of last inspection (YYYY-MM-DD)",
		example: "2024-12-01",
	})
	@IsDateString()
	@IsOptional()
	lastInspectionDate?: string;

	@ApiPropertyOptional({
		description: "Date of next scheduled inspection (YYYY-MM-DD)",
		example: "2025-06-01",
	})
	@IsDateString()
	@IsOptional()
	nextInspectionDate?: string;

	@ApiPropertyOptional({
		description: "Date of last maintenance (YYYY-MM-DD)",
		example: "2024-11-15",
	})
	@IsDateString()
	@IsOptional()
	lastMaintenanceDate?: string;

	@ApiPropertyOptional({
		description: "Additional remarks about the weapon",
		example: "Includes two spare magazines",
	})
	@IsString()
	@IsOptional()
	remarks?: string;

	@ApiPropertyOptional({
		description: "Whether the weapon record is active",
		example: true,
	})
	@IsBoolean()
	@IsOptional()
	isActive?: boolean;
}
