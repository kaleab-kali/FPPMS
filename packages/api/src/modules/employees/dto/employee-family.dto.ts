import { Gender } from "@prisma/client";
import { Type } from "class-transformer";
import { IsBoolean, IsDate, IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateFamilyMemberDto {
	@IsString()
	@IsNotEmpty()
	employeeId: string;

	@IsString()
	@IsNotEmpty()
	relationship: string;

	@IsString()
	@IsNotEmpty()
	fullName: string;

	@IsString()
	@IsOptional()
	fullNameAm?: string;

	@IsEnum(Gender)
	@IsOptional()
	gender?: Gender;

	@Type(() => Date)
	@IsDate()
	@IsOptional()
	dateOfBirth?: Date;

	@IsString()
	@IsOptional()
	nationalId?: string;

	@IsString()
	@IsOptional()
	phone?: string;

	@IsString()
	@IsOptional()
	occupation?: string;

	@Type(() => Date)
	@IsDate()
	@IsOptional()
	marriageDate?: Date;

	@IsString()
	@IsOptional()
	schoolName?: string;

	@IsBoolean()
	@IsOptional()
	isAlive?: boolean;
}

export class UpdateFamilyMemberDto {
	@IsString()
	@IsOptional()
	relationship?: string;

	@IsString()
	@IsOptional()
	fullName?: string;

	@IsString()
	@IsOptional()
	fullNameAm?: string;

	@IsEnum(Gender)
	@IsOptional()
	gender?: Gender;

	@Type(() => Date)
	@IsDate()
	@IsOptional()
	dateOfBirth?: Date;

	@IsString()
	@IsOptional()
	nationalId?: string;

	@IsString()
	@IsOptional()
	phone?: string;

	@IsString()
	@IsOptional()
	occupation?: string;

	@Type(() => Date)
	@IsDate()
	@IsOptional()
	marriageDate?: Date;

	@IsString()
	@IsOptional()
	schoolName?: string;

	@IsBoolean()
	@IsOptional()
	isAlive?: boolean;
}

export class FamilyMemberResponseDto {
	id: string;
	employeeId: string;
	relationship: string;
	fullName: string;
	fullNameAm: string | null;
	gender: Gender | null;
	dateOfBirth: Date | null;
	nationalId: string | null;
	phone: string | null;
	occupation: string | null;
	marriageDate: Date | null;
	schoolName: string | null;
	isAlive: boolean;
	createdAt: Date;
	updatedAt: Date;
}
