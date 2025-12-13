import type { UnifiedEmployeeFormData } from "#web/features/employees/schemas/unified-employee-schema.ts";
import type {
	CreateCivilianEmployeeRequest,
	CreateMilitaryEmployeeRequest,
	CreateTemporaryEmployeeRequest,
} from "#web/types/employee.ts";

interface AddressPayload {
	addressType: string;
	regionId: string;
	subCityId: string;
	woredaId: string;
	houseNumber?: string;
	uniqueAreaName?: string;
}

interface MotherInfoPayload {
	fullName: string;
	fullNameAm: string;
	phone?: string;
	isAlive?: boolean;
	address?: string;
}

interface EmergencyContactPayload {
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

const emptyToUndefined = (value: string | undefined): string | undefined => value || undefined;

export const buildAddressPayload = (data: UnifiedEmployeeFormData): AddressPayload | undefined => {
	if (!data.addressRegionId || !data.addressSubCityId || !data.addressWoredaId) {
		return undefined;
	}

	return {
		addressType: "CURRENT",
		regionId: data.addressRegionId,
		subCityId: data.addressSubCityId,
		woredaId: data.addressWoredaId,
		houseNumber: emptyToUndefined(data.addressHouseNumber),
		uniqueAreaName: emptyToUndefined(data.addressUniqueAreaName),
	};
};

export const buildMotherInfoPayload = (data: UnifiedEmployeeFormData): MotherInfoPayload | undefined => {
	if (!data.motherFullName || !data.motherFullNameAm) {
		return undefined;
	}

	return {
		fullName: data.motherFullName,
		fullNameAm: data.motherFullNameAm,
		phone: emptyToUndefined(data.motherPhone),
		isAlive: data.motherIsAlive ?? true,
		address: emptyToUndefined(data.motherAddress),
	};
};

export const buildEmergencyContactPayload = (data: UnifiedEmployeeFormData): EmergencyContactPayload | undefined => {
	if (!data.emergencyFullName || !data.emergencyFullNameAm || !data.emergencyPhone) {
		return undefined;
	}

	return {
		fullName: data.emergencyFullName,
		fullNameAm: data.emergencyFullNameAm,
		relationship: data.emergencyRelationship || "OTHER",
		phone: data.emergencyPhone,
		alternativePhone: emptyToUndefined(data.emergencyAltPhone),
		email: emptyToUndefined(data.emergencyEmail),
		regionId: emptyToUndefined(data.emergencyRegionId),
		subCityId: emptyToUndefined(data.emergencySubCityId),
		woredaId: emptyToUndefined(data.emergencyWoredaId),
		houseNumber: emptyToUndefined(data.emergencyHouseNumber),
		uniqueAreaName: emptyToUndefined(data.emergencyUniqueAreaName),
	};
};

interface BaseEmployeePayload {
	firstName: string;
	firstNameAm: string;
	middleName: string;
	middleNameAm: string;
	lastName: string;
	lastNameAm: string;
	gender: "MALE" | "FEMALE";
	dateOfBirth: string;
	birthPlace?: string;
	birthPlaceAm?: string;
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
	workScheduleType?: "REGULAR" | "SHIFT_24";
	maritalStatus?: "SINGLE" | "MARRIED" | "DIVORCED" | "WIDOWED";
	marriageDate?: string;
	address?: AddressPayload;
	motherInfo?: MotherInfoPayload;
	emergencyContact?: EmergencyContactPayload;
}

export const buildBasePayload = (data: UnifiedEmployeeFormData): BaseEmployeePayload => ({
	firstName: data.firstName,
	firstNameAm: data.firstNameAm,
	middleName: data.middleName,
	middleNameAm: data.middleNameAm,
	lastName: data.lastName,
	lastNameAm: data.lastNameAm,
	gender: data.gender,
	dateOfBirth: data.dateOfBirth,
	birthPlace: emptyToUndefined(data.birthPlace),
	birthPlaceAm: emptyToUndefined(data.birthPlaceAm),
	height: data.height || undefined,
	weight: data.weight || undefined,
	bloodType: emptyToUndefined(data.bloodType),
	eyeColor: emptyToUndefined(data.eyeColor),
	hairColor: emptyToUndefined(data.hairColor),
	distinguishingMarks: emptyToUndefined(data.distinguishingMarks),
	ethnicity: emptyToUndefined(data.ethnicity),
	faydaId: emptyToUndefined(data.faydaId),
	passportNumber: emptyToUndefined(data.passportNumber),
	drivingLicense: emptyToUndefined(data.drivingLicense),
	primaryPhone: data.primaryPhone,
	secondaryPhone: emptyToUndefined(data.secondaryPhone),
	email: emptyToUndefined(data.email),
	centerId: emptyToUndefined(data.centerId),
	departmentId: emptyToUndefined(data.departmentId),
	positionId: emptyToUndefined(data.positionId),
	employmentDate: data.employmentDate,
	originalEmploymentDate: emptyToUndefined(data.originalEmploymentDate),
	isTransfer: data.isTransfer || undefined,
	sourceOrganization: emptyToUndefined(data.sourceOrganization),
	workScheduleType: data.workScheduleType || undefined,
	maritalStatus: data.maritalStatus || undefined,
	marriageDate: emptyToUndefined(data.marriageDate),
	address: buildAddressPayload(data),
	motherInfo: buildMotherInfoPayload(data),
	emergencyContact: buildEmergencyContactPayload(data),
});

export const buildMilitaryPayload = (data: UnifiedEmployeeFormData): CreateMilitaryEmployeeRequest => ({
	...buildBasePayload(data),
	employeeType: "MILITARY",
	rankId: data.rankId ?? "",
	currentSalaryStep: data.currentSalaryStep,
});

export const buildCivilianPayload = (data: UnifiedEmployeeFormData): CreateCivilianEmployeeRequest => ({
	...buildBasePayload(data),
	employeeType: "CIVILIAN",
	currentSalary: data.currentSalary,
});

export const buildTemporaryPayload = (data: UnifiedEmployeeFormData): CreateTemporaryEmployeeRequest => ({
	...buildBasePayload(data),
	employeeType: "TEMPORARY",
	contractStartDate: data.contractStartDate ?? "",
	contractEndDate: data.contractEndDate ?? "",
	contractAmount: data.contractAmount,
});
