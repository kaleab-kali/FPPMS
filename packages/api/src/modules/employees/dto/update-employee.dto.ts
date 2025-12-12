import { ApiPropertyOptional } from "@nestjs/swagger";
import { BloodType, EmployeeStatus, Gender, MaritalStatus, WorkScheduleType } from "@prisma/client";
import { Type } from "class-transformer";
import { IsBoolean, IsDate, IsEmail, IsEnum, IsNumber, IsOptional, IsString, MaxLength } from "class-validator";

export class UpdateEmployeeDto {
	@ApiPropertyOptional({ description: "First name in English" })
	@IsOptional()
	@IsString()
	@MaxLength(50)
	firstName?: string;

	@ApiPropertyOptional({ description: "First name in Amharic" })
	@IsOptional()
	@IsString()
	@MaxLength(50)
	firstNameAm?: string;

	@ApiPropertyOptional({ description: "Middle name in English" })
	@IsOptional()
	@IsString()
	@MaxLength(50)
	middleName?: string;

	@ApiPropertyOptional({ description: "Middle name in Amharic" })
	@IsOptional()
	@IsString()
	@MaxLength(50)
	middleNameAm?: string;

	@ApiPropertyOptional({ description: "Last name in English" })
	@IsOptional()
	@IsString()
	@MaxLength(50)
	lastName?: string;

	@ApiPropertyOptional({ description: "Last name in Amharic" })
	@IsOptional()
	@IsString()
	@MaxLength(50)
	lastNameAm?: string;

	@ApiPropertyOptional({ enum: Gender, description: "Gender" })
	@IsOptional()
	@IsEnum(Gender)
	gender?: Gender;

	@ApiPropertyOptional({ description: "Date of birth" })
	@IsOptional()
	@IsDate()
	@Type(() => Date)
	dateOfBirth?: Date;

	@ApiPropertyOptional({ description: "Birth place" })
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

	@ApiPropertyOptional({ description: "Distinguishing marks" })
	@IsOptional()
	@IsString()
	@MaxLength(500)
	distinguishingMarks?: string;

	@ApiPropertyOptional({ description: "Ethnicity" })
	@IsOptional()
	@IsString()
	@MaxLength(50)
	ethnicity?: string;

	@ApiPropertyOptional({ description: "Fayda ID" })
	@IsOptional()
	@IsString()
	@MaxLength(20)
	faydaId?: string;

	@ApiPropertyOptional({ description: "Fayda verified status" })
	@IsOptional()
	@IsBoolean()
	faydaVerified?: boolean;

	@ApiPropertyOptional({ description: "Passport number" })
	@IsOptional()
	@IsString()
	@MaxLength(20)
	passportNumber?: string;

	@ApiPropertyOptional({ description: "Driving license" })
	@IsOptional()
	@IsString()
	@MaxLength(20)
	drivingLicense?: string;

	@ApiPropertyOptional({ description: "Primary phone" })
	@IsOptional()
	@IsString()
	@MaxLength(15)
	primaryPhone?: string;

	@ApiPropertyOptional({ description: "Secondary phone" })
	@IsOptional()
	@IsString()
	@MaxLength(15)
	secondaryPhone?: string;

	@ApiPropertyOptional({ description: "Email" })
	@IsOptional()
	@IsEmail()
	email?: string;

	@ApiPropertyOptional({ description: "Center ID" })
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

	@ApiPropertyOptional({ description: "Rank ID (military only)" })
	@IsOptional()
	@IsString()
	rankId?: string;

	@ApiPropertyOptional({ enum: WorkScheduleType, description: "Work schedule type" })
	@IsOptional()
	@IsEnum(WorkScheduleType)
	workScheduleType?: WorkScheduleType;

	@ApiPropertyOptional({ enum: MaritalStatus, description: "Marital status" })
	@IsOptional()
	@IsEnum(MaritalStatus)
	maritalStatus?: MaritalStatus;

	@ApiPropertyOptional({ description: "Marriage date" })
	@IsOptional()
	@IsDate()
	@Type(() => Date)
	marriageDate?: Date;

	@ApiPropertyOptional({ description: "Current salary step" })
	@IsOptional()
	@IsNumber()
	currentSalaryStep?: number;

	@ApiPropertyOptional({ description: "Current salary" })
	@IsOptional()
	@IsNumber()
	currentSalary?: number;

	@ApiPropertyOptional({ description: "Contract start date (temporary only)" })
	@IsOptional()
	@IsDate()
	@Type(() => Date)
	contractStartDate?: Date;

	@ApiPropertyOptional({ description: "Contract end date (temporary only)" })
	@IsOptional()
	@IsDate()
	@Type(() => Date)
	contractEndDate?: Date;

	@ApiPropertyOptional({ description: "Contract amount (temporary only)" })
	@IsOptional()
	@IsNumber()
	contractAmount?: number;

	@ApiPropertyOptional({ enum: EmployeeStatus, description: "Employee status" })
	@IsOptional()
	@IsEnum(EmployeeStatus)
	status?: EmployeeStatus;

	@ApiPropertyOptional({ description: "Status change reason" })
	@IsOptional()
	@IsString()
	@MaxLength(500)
	statusReason?: string;
}
