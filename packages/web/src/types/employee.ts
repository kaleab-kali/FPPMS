export type EmployeeType = "MILITARY" | "CIVILIAN" | "TEMPORARY";
export type EmployeeStatus = "ACTIVE" | "INACTIVE" | "ON_LEAVE" | "SUSPENDED" | "RETIRED" | "TERMINATED" | "DECEASED";
export type Gender = "MALE" | "FEMALE";
export type MaritalStatus = "SINGLE" | "MARRIED" | "DIVORCED" | "WIDOWED";
export type WorkScheduleType = "REGULAR" | "SHIFT_24";

export interface Employee {
	id: string;
	tenantId: string;
	employeeId: string;
	employeeType: EmployeeType;
	firstName: string;
	firstNameAm?: string;
	middleName: string;
	middleNameAm?: string;
	lastName: string;
	lastNameAm?: string;
	fullName: string;
	fullNameAm?: string;
	gender: Gender;
	dateOfBirth: string;
	birthPlace?: string;
	birthPlaceAm?: string;
	nationality: string;
	height?: number;
	weight?: number;
	bloodType?: string;
	eyeColor?: string;
	hairColor?: string;
	distinguishingMarks?: string;
	ethnicity?: string;
	faydaId?: string;
	faydaVerified: boolean;
	passportNumber?: string;
	drivingLicense?: string;
	primaryPhone: string;
	secondaryPhone?: string;
	email?: string;
	centerId?: string;
	centerName?: string;
	departmentId?: string;
	departmentName?: string;
	positionId?: string;
	positionName?: string;
	rankId?: string;
	rankName?: string;
	employmentDate: string;
	originalEmploymentDate?: string;
	isTransfer: boolean;
	sourceOrganization?: string;
	workScheduleType: WorkScheduleType;
	maritalStatus: MaritalStatus;
	marriageDate?: string;
	currentSalaryStep: number;
	currentSalary?: string;
	salaryEffectiveDate?: string;
	contractStartDate?: string;
	contractEndDate?: string;
	contractAmount?: string;
	retirementDate?: string;
	status: EmployeeStatus;
	terminationDate?: string;
	terminationReason?: string;
	addressRegionId?: string;
	addressRegionName?: string;
	addressSubCityId?: string;
	addressSubCityName?: string;
	addressWoredaId?: string;
	addressWoredaName?: string;
	addressHouseNumber?: string;
	addressUniqueAreaName?: string;
	motherFullName?: string;
	motherFullNameAm?: string;
	motherPhone?: string;
	motherIsAlive?: boolean;
	motherAddress?: string;
	emergencyFullName?: string;
	emergencyFullNameAm?: string;
	emergencyRelationship?: string;
	emergencyPhone?: string;
	emergencyAltPhone?: string;
	emergencyEmail?: string;
	emergencyRegionId?: string;
	emergencyRegionName?: string;
	emergencySubCityId?: string;
	emergencySubCityName?: string;
	emergencyWoredaId?: string;
	emergencyWoredaName?: string;
	emergencyHouseNumber?: string;
	emergencyUniqueAreaName?: string;
	createdAt: string;
	updatedAt: string;
}

export interface EmployeeListItem {
	id: string;
	employeeId: string;
	employeeType: EmployeeType;
	fullName: string;
	fullNameAm?: string;
	gender: Gender;
	primaryPhone: string;
	departmentName?: string;
	positionName?: string;
	rankName?: string;
	status: EmployeeStatus;
}

export interface EmployeeStatistics {
	total: number;
	byType: Record<string, number>;
	byStatus: Record<string, number>;
	byGender: Record<string, number>;
}

export interface EmployeeListResponse {
	data: EmployeeListItem[];
	total: number;
	page: number;
	pageSize: number;
}

export interface EmployeeFilter {
	search?: string;
	employeeType?: EmployeeType;
	status?: EmployeeStatus;
	gender?: Gender;
	centerId?: string;
	departmentId?: string;
	positionId?: string;
	rankId?: string;
	page?: number;
	pageSize?: number;
}

interface CreateAddressRequest {
	addressType: string;
	regionId: string;
	subCityId: string;
	woredaId: string;
	houseNumber?: string;
	uniqueAreaName?: string;
}

interface CreateMotherInfoRequest {
	fullName: string;
	fullNameAm: string;
	phone?: string;
	isAlive?: boolean;
	address?: string;
}

interface CreateEmergencyContactRequest {
	fullName: string;
	fullNameAm: string;
	relationship: string;
	phone: string;
	alternativePhone?: string;
	email?: string;
	regionId?: string;
	subCityId?: string;
	woredaId?: string;
	houseNumber?: string;
	uniqueAreaName?: string;
}

interface CreateEmployeeBase {
	firstName: string;
	firstNameAm?: string;
	middleName: string;
	middleNameAm?: string;
	lastName: string;
	lastNameAm?: string;
	gender: Gender;
	dateOfBirth: string;
	birthPlace?: string;
	birthPlaceAm?: string;
	nationality?: string;
	height?: number;
	weight?: number;
	bloodType?: string;
	eyeColor?: string;
	hairColor?: string;
	distinguishingMarks?: string;
	ethnicity?: string;
	faydaId?: string;
	passportNumber?: string;
	drivingLicense?: string;
	primaryPhone: string;
	secondaryPhone?: string;
	email?: string;
	centerId?: string;
	departmentId?: string;
	positionId?: string;
	employmentDate: string;
	originalEmploymentDate?: string;
	isTransfer?: boolean;
	sourceOrganization?: string;
	workScheduleType?: WorkScheduleType;
	maritalStatus?: MaritalStatus;
	marriageDate?: string;
	address?: CreateAddressRequest;
	motherInfo?: CreateMotherInfoRequest;
	emergencyContact?: CreateEmergencyContactRequest;
}

export interface CreateMilitaryEmployeeRequest extends CreateEmployeeBase {
	employeeType: "MILITARY";
	rankId: string;
	currentSalaryStep?: number;
}

export interface CreateCivilianEmployeeRequest extends CreateEmployeeBase {
	employeeType: "CIVILIAN";
	currentSalary?: number;
}

export interface CreateTemporaryEmployeeRequest extends CreateEmployeeBase {
	employeeType: "TEMPORARY";
	contractStartDate: string;
	contractEndDate: string;
	contractAmount?: number;
}

export type CreateEmployeeRequest =
	| CreateMilitaryEmployeeRequest
	| CreateCivilianEmployeeRequest
	| CreateTemporaryEmployeeRequest;

export interface UpdateEmployeeRequest {
	firstName?: string;
	firstNameAm?: string;
	middleName?: string;
	middleNameAm?: string;
	lastName?: string;
	lastNameAm?: string;
	gender?: Gender;
	dateOfBirth?: string;
	birthPlace?: string;
	birthPlaceAm?: string;
	nationality?: string;
	height?: number;
	weight?: number;
	bloodType?: string;
	eyeColor?: string;
	hairColor?: string;
	distinguishingMarks?: string;
	ethnicity?: string;
	faydaId?: string;
	passportNumber?: string;
	drivingLicense?: string;
	primaryPhone?: string;
	secondaryPhone?: string;
	email?: string;
	centerId?: string;
	departmentId?: string;
	positionId?: string;
	rankId?: string;
	workScheduleType?: WorkScheduleType;
	maritalStatus?: MaritalStatus;
	marriageDate?: string;
	currentSalaryStep?: number;
	currentSalary?: number;
	contractStartDate?: string;
	contractEndDate?: string;
	contractAmount?: number;
	status?: EmployeeStatus;
	terminationDate?: string;
	terminationReason?: string;
}

export type ArchiveStatus = "TERMINATED" | "RETIRED" | "SUSPENDED" | "DECEASED";

export interface ChangeStatusRequest {
	status: ArchiveStatus;
	reason: string;
	effectiveDate: string;
	endDate?: string;
	notes?: string;
}
