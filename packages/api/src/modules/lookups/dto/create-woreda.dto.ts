import { IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, Min } from "class-validator";

export class CreateWoredaDto {
	@IsString()
	@IsNotEmpty()
	subCityId: string;

	@IsString()
	@IsNotEmpty()
	@MaxLength(20)
	code: string;

	@IsString()
	@IsNotEmpty()
	@MaxLength(100)
	name: string;

	@IsString()
	@IsNotEmpty()
	@MaxLength(100)
	nameAm: string;

	@IsInt()
	@Min(0)
	@IsOptional()
	sortOrder?: number;

	@IsBoolean()
	@IsOptional()
	isActive?: boolean;
}
