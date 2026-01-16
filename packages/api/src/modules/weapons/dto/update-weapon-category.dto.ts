import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsBoolean, IsOptional, IsString, MaxLength, MinLength } from "class-validator";

export class UpdateWeaponCategoryDto {
	@ApiPropertyOptional({
		description: "Name of the weapon category",
		example: "Handguns",
		minLength: 2,
		maxLength: 100,
	})
	@IsString()
	@MinLength(2)
	@MaxLength(100)
	@IsOptional()
	name?: string;

	@ApiPropertyOptional({
		description: "Name of the weapon category in Amharic",
		example: "የእጅ ሽጉጥ",
	})
	@IsString()
	@IsOptional()
	nameAm?: string;

	@ApiPropertyOptional({
		description: "Description of the weapon category",
		example: "All types of handguns including pistols and revolvers",
	})
	@IsString()
	@IsOptional()
	description?: string;

	@ApiPropertyOptional({
		description: "Whether the category is active",
		example: true,
	})
	@IsBoolean()
	@IsOptional()
	isActive?: boolean;
}
