import { IsArray, IsEmail, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from "class-validator";

export class CreateUserDto {
	@IsString()
	@IsNotEmpty()
	@MaxLength(50)
	username: string;

	@IsEmail()
	@IsOptional()
	@MaxLength(100)
	email?: string;

	@IsString()
	@IsNotEmpty()
	@MinLength(8)
	@MaxLength(100)
	password: string;

	@IsString()
	@IsOptional()
	centerId?: string;

	@IsString()
	@IsOptional()
	employeeId?: string;

	@IsArray()
	@IsString({ each: true })
	@IsOptional()
	roleIds?: string[];
}
