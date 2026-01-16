import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsBoolean, IsOptional, IsString, IsUUID, MaxLength, MinLength } from "class-validator";

export class UpdateWeaponTypeDto {
	@ApiPropertyOptional({
		description: "ID of the weapon category this type belongs to",
		example: "clx1234567890",
	})
	@IsUUID()
	@IsOptional()
	categoryId?: string;

	@ApiPropertyOptional({
		description: "Name of the weapon type",
		example: "Glock 19",
		minLength: 2,
		maxLength: 100,
	})
	@IsString()
	@MinLength(2)
	@MaxLength(100)
	@IsOptional()
	name?: string;

	@ApiPropertyOptional({
		description: "Name of the weapon type in Amharic",
		example: "ግሎክ 19",
	})
	@IsString()
	@IsOptional()
	nameAm?: string;

	@ApiPropertyOptional({
		description: "Manufacturer of the weapon",
		example: "Glock Ges.m.b.H.",
	})
	@IsString()
	@IsOptional()
	manufacturer?: string;

	@ApiPropertyOptional({
		description: "Model designation",
		example: "Gen 5",
	})
	@IsString()
	@IsOptional()
	model?: string;

	@ApiPropertyOptional({
		description: "Caliber of the weapon",
		example: "9mm Parabellum",
	})
	@IsString()
	@IsOptional()
	caliber?: string;

	@ApiPropertyOptional({
		description: "Description of the weapon type",
		example: "Compact semi-automatic pistol suitable for duty and concealed carry",
	})
	@IsString()
	@IsOptional()
	description?: string;

	@ApiPropertyOptional({
		description: "Whether the weapon type is active",
		example: true,
	})
	@IsBoolean()
	@IsOptional()
	isActive?: boolean;
}
