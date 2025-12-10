import { IsBoolean, IsEmail, IsOptional, IsString, MaxLength } from "class-validator";

export class UpdateCenterDto {
	@IsString()
	@IsOptional()
	@MaxLength(100)
	name?: string;

	@IsString()
	@IsOptional()
	@MaxLength(100)
	nameAm?: string;

	@IsString()
	@IsOptional()
	@MaxLength(50)
	type?: string;

	@IsString()
	@IsOptional()
	regionId?: string;

	@IsString()
	@IsOptional()
	subCityId?: string;

	@IsString()
	@IsOptional()
	woredaId?: string;

	@IsString()
	@IsOptional()
	@MaxLength(500)
	address?: string;

	@IsString()
	@IsOptional()
	@MaxLength(20)
	phone?: string;

	@IsEmail()
	@IsOptional()
	@MaxLength(100)
	email?: string;

	@IsString()
	@IsOptional()
	parentCenterId?: string;

	@IsString()
	@IsOptional()
	commanderId?: string;

	@IsBoolean()
	@IsOptional()
	isActive?: boolean;
}
