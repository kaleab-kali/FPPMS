import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { BloodType, EmployeeType, Gender, MaritalStatus, WorkScheduleType } from "@prisma/client";
import { Type } from "class-transformer";
import {
	IsBoolean,
	IsDate,
	IsEmail,
	IsEnum,
	IsNumber,
	IsOptional,
	IsString,
	MaxLength,
	MinLength,
	ValidateNested,
} from "class-validator";

export class CreateAddressDto {
	@ApiProperty({ description: "Address type (CURRENT or PERMANENT)" })
	@IsString()
	addressType: string;

	@ApiProperty({ description: "Region ID" })
	@IsString()
	regionId: string;

	@ApiProperty({ description: "Sub-city ID" })
	@IsString()
	subCityId: string;

	@ApiProperty({ description: "Woreda ID" })
	@IsString()
	woredaId: string;

	@ApiPropertyOptional({ description: "House number" })
	@IsOptional()
	@IsString()
	@MaxLength(50)
	houseNumber?: string;

	@ApiPropertyOptional({ description: "Unique area/neighborhood name" })
	@IsOptional()
	@IsString()
	@MaxLength(100)
	uniqueAreaName?: string;
}

export class CreateMotherInfoDto {
	@ApiProperty({ description: "Mother's full name in English" })
	@IsString()
	@MinLength(2)
	@MaxLength(100)
	fullName: string;

	@ApiProperty({ description: "Mother's full name in Amharic" })
	@IsString()
	@MinLength(2)
	@MaxLength(100)
	fullNameAm: string;

	@ApiPropertyOptional({ description: "Mother's phone number" })
	@IsOptional()
	@IsString()
	@MaxLength(15)
	phone?: string;

	@ApiPropertyOptional({ description: "Is mother alive?" })
	@IsOptional()
	@IsBoolean()
	isAlive?: boolean;

	@ApiPropertyOptional({ description: "Mother's address" })
	@IsOptional()
	@IsString()
	@MaxLength(200)
	address?: string;
}

export class CreateEmergencyContactDto {
	@ApiProperty({ description: "Emergency contact full name in English" })
	@IsString()
	@MinLength(2)
	@MaxLength(100)
	fullName: string;

	@ApiProperty({ description: "Emergency contact full name in Amharic" })
	@IsString()
	@MinLength(2)
	@MaxLength(100)
	fullNameAm: string;

	@ApiProperty({ description: "Relationship to employee" })
	@IsString()
	@MaxLength(50)
	relationship: string;

	@ApiProperty({ description: "Emergency contact phone" })
	@IsString()
	@MinLength(9)
	@MaxLength(15)
	phone: string;

	@ApiPropertyOptional({ description: "Alternative phone" })
	@IsOptional()
	@IsString()
	@MaxLength(15)
	alternativePhone?: string;

	@ApiPropertyOptional({ description: "Emergency contact email" })
	@IsOptional()
	@IsEmail()
	email?: string;

	@ApiPropertyOptional({ description: "Region ID" })
	@IsOptional()
	@IsString()
	regionId?: string;

	@ApiPropertyOptional({ description: "Sub-city ID" })
	@IsOptional()
	@IsString()
	subCityId?: string;

	@ApiPropertyOptional({ description: "Woreda ID" })
	@IsOptional()
	@IsString()
	woredaId?: string;

	@ApiPropertyOptional({ description: "House number" })
	@IsOptional()
	@IsString()
	@MaxLength(50)
	houseNumber?: string;

	@ApiPropertyOptional({ description: "Unique area/neighborhood name" })
	@IsOptional()
	@IsString()
	@MaxLength(100)
	uniqueAreaName?: string;
}

export class CreateEmployeeBaseDto {
	@ApiProperty({ description: "First name in English" })
	@IsString()
	@MinLength(2)
	@MaxLength(50)
	firstName: string;

	@ApiProperty({ description: "First name in Amharic" })
	@IsString()
	@MinLength(2)
	@MaxLength(50)
	firstNameAm: string;

	@ApiProperty({ description: "Middle name (father name) in English" })
	@IsString()
	@MinLength(2)
	@MaxLength(50)
	middleName: string;

	@ApiProperty({ description: "Middle name in Amharic" })
	@IsString()
	@MinLength(2)
	@MaxLength(50)
	middleNameAm: string;

	@ApiProperty({ description: "Last name (grandfather name) in English" })
	@IsString()
	@MinLength(2)
	@MaxLength(50)
	lastName: string;

	@ApiProperty({ description: "Last name in Amharic" })
	@IsString()
	@MinLength(2)
	@MaxLength(50)
	lastNameAm: string;

	@ApiProperty({ enum: Gender, description: "Gender" })
	@IsEnum(Gender)
	gender: Gender;

	@ApiProperty({ description: "Date of birth" })
	@IsDate()
	@Type(() => Date)
	dateOfBirth: Date;

	@ApiPropertyOptional({ description: "Birth place in English" })
	@IsOptional()
	@IsString()
	@MaxLength(100)
	birthPlace?: string;

	@ApiPropertyOptional({ description: "Birth place in Amharic" })
	@IsOptional()
	@IsString()
	@MaxLength(100)
	birthPlaceAm?: string;

	@ApiPropertyOptional({ description: "Height in cm" })
	@IsOptional()
	@IsNumber()
	height?: number;

	@ApiPropertyOptional({ description: "Weight in kg" })
	@IsOptional()
	@IsNumber()
	weight?: number;

	@ApiPropertyOptional({ enum: BloodType, description: "Blood type" })
	@IsOptional()
	@IsEnum(BloodType)
	bloodType?: BloodType;

	@ApiPropertyOptional({ description: "Eye color" })
	@IsOptional()
	@IsString()
	@MaxLength(30)
	eyeColor?: string;

	@ApiPropertyOptional({ description: "Hair color" })
	@IsOptional()
	@IsString()
	@MaxLength(30)
	hairColor?: string;

	@ApiPropertyOptional({ description: "Distinguishing marks or features" })
	@IsOptional()
	@IsString()
	@MaxLength(500)
	distinguishingMarks?: string;

	@ApiPropertyOptional({ description: "Ethnicity" })
	@IsOptional()
	@IsString()
	@MaxLength(50)
	ethnicity?: string;

	@ApiPropertyOptional({ description: "Fayda National ID" })
	@IsOptional()
	@IsString()
	@MaxLength(20)
	faydaId?: string;

	@ApiPropertyOptional({ description: "Passport number" })
	@IsOptional()
	@IsString()
	@MaxLength(20)
	passportNumber?: string;

	@ApiPropertyOptional({ description: "Driving license number" })
	@IsOptional()
	@IsString()
	@MaxLength(20)
	drivingLicense?: string;

	@ApiProperty({ description: "Primary phone number" })
	@IsString()
	@MinLength(9)
	@MaxLength(15)
	primaryPhone: string;

	@ApiPropertyOptional({ description: "Secondary phone number" })
	@IsOptional()
	@IsString()
	@MaxLength(15)
	secondaryPhone?: string;

	@ApiPropertyOptional({ description: "Email address" })
	@IsOptional()
	@IsEmail()
	email?: string;

	@ApiPropertyOptional({ description: "Center ID where employee works" })
	@IsOptional()
	@IsString()
	centerId?: string;

	@ApiPropertyOptional({ description: "Department ID" })
	@IsOptional()
	@IsString()
	departmentId?: string;

	@ApiPropertyOptional({ description: "Position ID" })
	@IsOptional()
	@IsString()
	positionId?: string;

	@ApiProperty({ description: "Employment/hire date" })
	@IsDate()
	@Type(() => Date)
	employmentDate: Date;

	@ApiPropertyOptional({ description: "Original employment date if transferred from another organization" })
	@IsOptional()
	@IsDate()
	@Type(() => Date)
	originalEmploymentDate?: Date;

	@ApiPropertyOptional({ description: "Is this a transfer from another organization?" })
	@IsOptional()
	@IsBoolean()
	isTransfer?: boolean;

	@ApiPropertyOptional({ description: "Source organization if transferred" })
	@IsOptional()
	@IsString()
	@MaxLength(200)
	sourceOrganization?: string;

	@ApiPropertyOptional({ enum: WorkScheduleType, description: "Work schedule type" })
	@IsOptional()
	@IsEnum(WorkScheduleType)
	workScheduleType?: WorkScheduleType;

	@ApiPropertyOptional({ enum: MaritalStatus, description: "Marital status" })
	@IsOptional()
	@IsEnum(MaritalStatus)
	maritalStatus?: MaritalStatus;

	@ApiPropertyOptional({ description: "Marriage date if married" })
	@IsOptional()
	@IsDate()
	@Type(() => Date)
	marriageDate?: Date;

	@ApiPropertyOptional({ description: "Address information", type: CreateAddressDto })
	@IsOptional()
	@ValidateNested()
	@Type(() => CreateAddressDto)
	address?: CreateAddressDto;

	@ApiPropertyOptional({ description: "Mother information", type: CreateMotherInfoDto })
	@IsOptional()
	@ValidateNested()
	@Type(() => CreateMotherInfoDto)
	motherInfo?: CreateMotherInfoDto;

	@ApiPropertyOptional({ description: "Emergency contact information", type: CreateEmergencyContactDto })
	@IsOptional()
	@ValidateNested()
	@Type(() => CreateEmergencyContactDto)
	emergencyContact?: CreateEmergencyContactDto;
}

export class CreateMilitaryEmployeeDto extends CreateEmployeeBaseDto {
	@ApiProperty({ enum: [EmployeeType.MILITARY], default: EmployeeType.MILITARY })
	@IsEnum(EmployeeType)
	employeeType: EmployeeType = EmployeeType.MILITARY;

	@ApiProperty({ description: "Military rank ID" })
	@IsString()
	rankId: string;

	@ApiPropertyOptional({ description: "Current salary step (0-9)" })
	@IsOptional()
	@IsNumber()
	currentSalaryStep?: number;
}

export class CreateCivilianEmployeeDto extends CreateEmployeeBaseDto {
	@ApiProperty({ enum: [EmployeeType.CIVILIAN], default: EmployeeType.CIVILIAN })
	@IsEnum(EmployeeType)
	employeeType: EmployeeType = EmployeeType.CIVILIAN;

	@ApiPropertyOptional({ description: "Current salary amount" })
	@IsOptional()
	@IsNumber()
	currentSalary?: number;
}

export class CreateTemporaryEmployeeDto extends CreateEmployeeBaseDto {
	@ApiProperty({ enum: [EmployeeType.TEMPORARY], default: EmployeeType.TEMPORARY })
	@IsEnum(EmployeeType)
	employeeType: EmployeeType = EmployeeType.TEMPORARY;

	@ApiProperty({ description: "Contract start date" })
	@IsDate()
	@Type(() => Date)
	contractStartDate: Date;

	@ApiProperty({ description: "Contract end date" })
	@IsDate()
	@Type(() => Date)
	contractEndDate: Date;

	@ApiPropertyOptional({ description: "Contract amount" })
	@IsOptional()
	@IsNumber()
	contractAmount?: number;
}
