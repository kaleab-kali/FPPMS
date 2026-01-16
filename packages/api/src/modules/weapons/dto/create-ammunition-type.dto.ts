import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsBoolean, IsOptional, IsString, IsUUID, MaxLength, MinLength } from "class-validator";

export class CreateAmmunitionTypeDto {
	@ApiPropertyOptional({
		description: "ID of the weapon type this ammunition is compatible with",
		example: "clx1234567890",
	})
	@IsUUID()
	@IsOptional()
	weaponTypeId?: string;

	@ApiProperty({
		description: "Unique code for the ammunition type",
		example: "9MM-FMJ",
		minLength: 2,
		maxLength: 30,
	})
	@IsString()
	@MinLength(2)
	@MaxLength(30)
	code: string;

	@ApiProperty({
		description: "Name of the ammunition type",
		example: "9mm Full Metal Jacket",
		minLength: 2,
		maxLength: 100,
	})
	@IsString()
	@MinLength(2)
	@MaxLength(100)
	name: string;

	@ApiPropertyOptional({
		description: "Name of the ammunition type in Amharic",
		example: "9 ሚሊ ሜትር ጥይት",
	})
	@IsString()
	@IsOptional()
	nameAm?: string;

	@ApiProperty({
		description: "Caliber of the ammunition",
		example: "9x19mm Parabellum",
	})
	@IsString()
	caliber: string;

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
		default: true,
	})
	@IsBoolean()
	@IsOptional()
	isActive?: boolean;
}
