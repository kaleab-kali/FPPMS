import { IsArray, IsBoolean, IsEmail, IsEnum, IsOptional, IsString, MaxLength } from "class-validator";

const USER_STATUS_VALUES = ["ACTIVE", "INACTIVE", "SUSPENDED", "PENDING"] as const;

export class UpdateUserDto {
	@IsEmail()
	@IsOptional()
	@MaxLength(100)
	email?: string;

	@IsString()
	@IsOptional()
	centerId?: string;

	@IsEnum(USER_STATUS_VALUES)
	@IsOptional()
	status?: (typeof USER_STATUS_VALUES)[number];

	@IsBoolean()
	@IsOptional()
	mustChangePassword?: boolean;

	@IsArray()
	@IsString({ each: true })
	@IsOptional()
	roleIds?: string[];
}
