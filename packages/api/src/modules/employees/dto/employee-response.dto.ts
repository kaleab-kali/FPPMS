import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { BloodType, EmployeeStatus, EmployeeType, Gender, MaritalStatus, WorkScheduleType } from "@prisma/client";

export class EmployeeResponseDto {
	@ApiProperty({ description: "Employee ID (UUID)" })
	id: string;

	@ApiProperty({ description: "Tenant ID" })
	tenantId: string;

	@ApiProperty({ description: "Employee ID (FPC-0000/YY format)" })
	employeeId: string;

	@ApiProperty({ enum: EmployeeType, description: "Employee type" })
	employeeType: EmployeeType;

	@ApiProperty({ description: "First name in English" })
	firstName: string;

	@ApiProperty({ description: "First name in Amharic" })
	firstNameAm: string;

	@ApiProperty({ description: "Middle name in English" })
	middleName: string;

	@ApiProperty({ description: "Middle name in Amharic" })
	middleNameAm: string;

	@ApiProperty({ description: "Last name in English" })
	lastName: string;

	@ApiProperty({ description: "Last name in Amharic" })
	lastNameAm: string;

	@ApiProperty({ description: "Full name in English" })
	fullName: string;

	@ApiProperty({ description: "Full name in Amharic" })
	fullNameAm: string;

	@ApiProperty({ enum: Gender, description: "Gender" })
	gender: Gender;

	@ApiProperty({ description: "Date of birth" })
	dateOfBirth: Date;

	@ApiPropertyOptional({ description: "Birth place" })
	birthPlace?: string;

	@ApiPropertyOptional({ description: "Birth place in Amharic" })
	birthPlaceAm?: string;

	@ApiPropertyOptional({ description: "Height in cm" })
	height?: number;

	@ApiPropertyOptional({ description: "Weight in kg" })
	weight?: number;

	@ApiPropertyOptional({ enum: BloodType, description: "Blood type" })
	bloodType?: BloodType;

	@ApiPropertyOptional({ description: "Eye color" })
	eyeColor?: string;

	@ApiPropertyOptional({ description: "Hair color" })
	hairColor?: string;

	@ApiPropertyOptional({ description: "Distinguishing marks" })
	distinguishingMarks?: string;

	@ApiProperty({ description: "Nationality" })
	nationality: string;

	@ApiPropertyOptional({ description: "Ethnicity" })
	ethnicity?: string;

	@ApiPropertyOptional({ description: "Fayda National ID" })
	faydaId?: string;

	@ApiProperty({ description: "Fayda verification status" })
	faydaVerified: boolean;

	@ApiPropertyOptional({ description: "Passport number" })
	passportNumber?: string;

	@ApiPropertyOptional({ description: "Driving license" })
	drivingLicense?: string;

	@ApiProperty({ description: "Primary phone" })
	primaryPhone: string;

	@ApiPropertyOptional({ description: "Secondary phone" })
	secondaryPhone?: string;

	@ApiPropertyOptional({ description: "Email" })
	email?: string;

	@ApiPropertyOptional({ description: "Center ID" })
	centerId?: string;

	@ApiPropertyOptional({ description: "Center name" })
	centerName?: string;

	@ApiPropertyOptional({ description: "Department ID" })
	departmentId?: string;

	@ApiPropertyOptional({ description: "Department name" })
	departmentName?: string;

	@ApiPropertyOptional({ description: "Position ID" })
	positionId?: string;

	@ApiPropertyOptional({ description: "Position name" })
	positionName?: string;

	@ApiPropertyOptional({ description: "Rank ID (military only)" })
	rankId?: string;

	@ApiPropertyOptional({ description: "Rank name (military only)" })
	rankName?: string;

	@ApiPropertyOptional({ description: "Rank code (military only)" })
	rankCode?: string;

	@ApiProperty({ description: "Employment date" })
	employmentDate: Date;

	@ApiPropertyOptional({ description: "Original employment date if transferred" })
	originalEmploymentDate?: Date;

	@ApiProperty({ description: "Is transfer from another organization" })
	isTransfer: boolean;

	@ApiPropertyOptional({ description: "Source organization if transferred" })
	sourceOrganization?: string;

	@ApiProperty({ enum: WorkScheduleType, description: "Work schedule type" })
	workScheduleType: WorkScheduleType;

	@ApiProperty({ enum: MaritalStatus, description: "Marital status" })
	maritalStatus: MaritalStatus;

	@ApiPropertyOptional({ description: "Marriage date" })
	marriageDate?: Date;

	@ApiProperty({ description: "Current salary step" })
	currentSalaryStep: number;

	@ApiPropertyOptional({ description: "Current salary" })
	currentSalary?: string;

	@ApiPropertyOptional({ description: "Salary effective date" })
	salaryEffectiveDate?: Date;

	@ApiPropertyOptional({ description: "Contract start date (temporary)" })
	contractStartDate?: Date;

	@ApiPropertyOptional({ description: "Contract end date (temporary)" })
	contractEndDate?: Date;

	@ApiPropertyOptional({ description: "Contract amount (temporary)" })
	contractAmount?: string;

	@ApiPropertyOptional({ description: "Retirement date" })
	retirementDate?: Date;

	@ApiProperty({ enum: EmployeeStatus, description: "Employee status" })
	status: EmployeeStatus;

	@ApiPropertyOptional({ description: "Status changed at" })
	statusChangedAt?: Date;

	@ApiPropertyOptional({ description: "Status change reason" })
	statusReason?: string;

	@ApiPropertyOptional({ description: "Current photo URL" })
	currentPhotoUrl?: string;

	@ApiPropertyOptional({ description: "Address region ID" })
	addressRegionId?: string;

	@ApiPropertyOptional({ description: "Address region name" })
	addressRegionName?: string;

	@ApiPropertyOptional({ description: "Address sub-city ID" })
	addressSubCityId?: string;

	@ApiPropertyOptional({ description: "Address sub-city name" })
	addressSubCityName?: string;

	@ApiPropertyOptional({ description: "Address woreda ID" })
	addressWoredaId?: string;

	@ApiPropertyOptional({ description: "Address woreda name" })
	addressWoredaName?: string;

	@ApiPropertyOptional({ description: "Address house number" })
	addressHouseNumber?: string;

	@ApiPropertyOptional({ description: "Address unique area name" })
	addressUniqueAreaName?: string;

	@ApiPropertyOptional({ description: "Mother's full name" })
	motherFullName?: string;

	@ApiPropertyOptional({ description: "Mother's full name in Amharic" })
	motherFullNameAm?: string;

	@ApiPropertyOptional({ description: "Mother's phone" })
	motherPhone?: string;

	@ApiPropertyOptional({ description: "Mother is alive" })
	motherIsAlive?: boolean;

	@ApiPropertyOptional({ description: "Mother's address" })
	motherAddress?: string;

	@ApiPropertyOptional({ description: "Emergency contact full name" })
	emergencyFullName?: string;

	@ApiPropertyOptional({ description: "Emergency contact full name in Amharic" })
	emergencyFullNameAm?: string;

	@ApiPropertyOptional({ description: "Emergency contact relationship" })
	emergencyRelationship?: string;

	@ApiPropertyOptional({ description: "Emergency contact phone" })
	emergencyPhone?: string;

	@ApiPropertyOptional({ description: "Emergency contact alternative phone" })
	emergencyAltPhone?: string;

	@ApiPropertyOptional({ description: "Emergency contact email" })
	emergencyEmail?: string;

	@ApiPropertyOptional({ description: "Emergency contact region ID" })
	emergencyRegionId?: string;

	@ApiPropertyOptional({ description: "Emergency contact region name" })
	emergencyRegionName?: string;

	@ApiPropertyOptional({ description: "Emergency contact sub-city ID" })
	emergencySubCityId?: string;

	@ApiPropertyOptional({ description: "Emergency contact sub-city name" })
	emergencySubCityName?: string;

	@ApiPropertyOptional({ description: "Emergency contact woreda ID" })
	emergencyWoredaId?: string;

	@ApiPropertyOptional({ description: "Emergency contact woreda name" })
	emergencyWoredaName?: string;

	@ApiPropertyOptional({ description: "Emergency contact house number" })
	emergencyHouseNumber?: string;

	@ApiPropertyOptional({ description: "Emergency contact area name" })
	emergencyUniqueAreaName?: string;

	@ApiProperty({ description: "Created at" })
	createdAt: Date;

	@ApiProperty({ description: "Updated at" })
	updatedAt: Date;
}

export class EmployeeListResponseDto {
	@ApiProperty({ description: "Employee ID (UUID)" })
	id: string;

	@ApiProperty({ description: "Employee ID (FPC-0000/YY format)" })
	employeeId: string;

	@ApiProperty({ enum: EmployeeType, description: "Employee type" })
	employeeType: EmployeeType;

	@ApiProperty({ description: "Full name in English" })
	fullName: string;

	@ApiProperty({ description: "Full name in Amharic" })
	fullNameAm: string;

	@ApiProperty({ enum: Gender, description: "Gender" })
	gender: Gender;

	@ApiProperty({ description: "Primary phone" })
	primaryPhone: string;

	@ApiPropertyOptional({ description: "Department name" })
	departmentName?: string;

	@ApiPropertyOptional({ description: "Position name" })
	positionName?: string;

	@ApiPropertyOptional({ description: "Rank name (military only)" })
	rankName?: string;

	@ApiProperty({ enum: EmployeeStatus, description: "Employee status" })
	status: EmployeeStatus;

	@ApiPropertyOptional({ description: "Photo thumbnail URL" })
	photoThumbnailUrl?: string;
}
