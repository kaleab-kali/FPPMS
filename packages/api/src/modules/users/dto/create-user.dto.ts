import { IsArray, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateUserFromEmployeeDto {
	@IsString()
	@IsNotEmpty()
	employeeId: string;

	@IsString()
	@IsOptional()
	centerId?: string;

	@IsArray()
	@IsString({ each: true })
	@IsOptional()
	roleIds?: string[];

	@IsString()
	@IsOptional()
	newDepartmentId?: string;

	@IsString()
	@IsOptional()
	newPositionId?: string;
}

export class CreateUserDto {
	@IsString()
	@IsNotEmpty()
	employeeId: string;

	@IsString()
	@IsNotEmpty()
	username: string;

	@IsString()
	@IsNotEmpty()
	password: string;

	@IsString()
	@IsOptional()
	centerId?: string;

	@IsArray()
	@IsString({ each: true })
	@IsOptional()
	roleIds?: string[];
}
