import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsBoolean, IsOptional, IsString, IsUUID, MaxLength, MinLength } from "class-validator";

export class UpdateAmmunitionTypeDto {
	@ApiPropertyOptional({
		description: "ID of the weapon type this ammunition is compatible with",
		example: "clx1234567890",
	})
	@IsUUID()
	@IsOptional()
	weaponTypeId?: string;

	@ApiPropertyOptional({
		description: "Name of the ammunition type",
		example: "9mm Full Metal Jacket",
		minLength: 2,
		maxLength: 100,
	})
	@IsString()
	@MinLength(2)
	@MaxLength(100)
	@IsOptional()
	name?: string;

	@ApiPropertyOptional({
		description: "Name of the ammunition type in Amharic",
		example: "9 ሚሊ ሜትር ጥይት",
	})
	@IsString()
	@IsOptional()
	nameAm?: string;

	@ApiPropertyOptional({
		description: "Caliber of the ammunition",
		example: "9x19mm Parabellum",
	})
	@IsString()
	@IsOptional()
	caliber?: string;

	@ApiPropertyOptional({
		description: "Manufacturer of the ammunition",
		example: "Federal Premium",
	})
	@IsString()
	@IsOptional()
	manufacturer?: string;

	@ApiPropertyOptional({
		description: "Description of the ammunition type",
		example: "Standard duty ammunition for law enforcement use",
	})
	@IsString()
	@IsOptional()
	description?: string;

	@ApiPropertyOptional({
		description: "Whether the ammunition type is active",
		example: true,
	})
	@IsBoolean()
	@IsOptional()
	isActive?: boolean;
}
