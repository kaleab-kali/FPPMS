import { IsBoolean, IsObject, IsOptional, IsString, MaxLength } from "class-validator";

export class UpdateTenantDto {
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

	@IsBoolean()
	@IsOptional()
	isActive?: boolean;

	@IsObject()
	@IsOptional()
	settings?: Record<string, unknown>;
}
