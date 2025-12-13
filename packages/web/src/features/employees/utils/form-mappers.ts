import type { UnifiedEmployeeFormData } from "#web/features/employees/schemas/unified-employee-schema.ts";
import type { Employee, UpdateEmployeeRequest } from "#web/types/employee.ts";

const extractDatePart = (dateString: string | undefined): string => dateString?.split("T")[0] ?? "";

const toEmptyString = (value: string | undefined | null): string => value ?? "";

const mapPersonalInfo = (employee: Employee) => ({
	firstName: employee.firstName,
	firstNameAm: toEmptyString(employee.firstNameAm),
	middleName: employee.middleName,
	middleNameAm: toEmptyString(employee.middleNameAm),
	lastName: employee.lastName,
	lastNameAm: toEmptyString(employee.lastNameAm),
	gender: employee.gender ?? "MALE",
	dateOfBirth: extractDatePart(employee.dateOfBirth),
	birthPlace: toEmptyString(employee.birthPlace),
	birthPlaceAm: toEmptyString(employee.birthPlaceAm),
	nationality: toEmptyString(employee.nationality),
	ethnicity: toEmptyString(employee.ethnicity),
	maritalStatus: employee.maritalStatus ?? "SINGLE",
	marriageDate: extractDatePart(employee.marriageDate),
});

const mapPhysicalInfo = (employee: Employee) => ({
	height: employee.height,
	weight: employee.weight,
	bloodType: toEmptyString(employee.bloodType),
	eyeColor: toEmptyString(employee.eyeColor),
	hairColor: toEmptyString(employee.hairColor),
	distinguishingMarks: toEmptyString(employee.distinguishingMarks),
});

const mapIdentificationInfo = (employee: Employee) => ({
	faydaId: toEmptyString(employee.faydaId),
	passportNumber: toEmptyString(employee.passportNumber),
	drivingLicense: toEmptyString(employee.drivingLicense),
});

const mapContactInfo = (employee: Employee) => ({
	primaryPhone: employee.primaryPhone,
	secondaryPhone: toEmptyString(employee.secondaryPhone),
	email: toEmptyString(employee.email),
});

const mapEmploymentInfo = (employee: Employee) => ({
	centerId: toEmptyString(employee.centerId),
	departmentId: toEmptyString(employee.departmentId),
	positionId: toEmptyString(employee.positionId),
	workScheduleType: employee.workScheduleType ?? "REGULAR",
	employmentDate: extractDatePart(employee.employmentDate),
	isTransfer: employee.isTransfer ?? false,
	originalEmploymentDate: extractDatePart(employee.originalEmploymentDate),
	sourceOrganization: toEmptyString(employee.sourceOrganization),
});

const mapTypeSpecificInfo = (employee: Employee) => ({
	rankId: toEmptyString(employee.rankId),
	currentSalaryStep: employee.currentSalaryStep,
	currentSalary: employee.currentSalary ? Number(employee.currentSalary) : undefined,
	contractStartDate: extractDatePart(employee.contractStartDate),
	contractEndDate: extractDatePart(employee.contractEndDate),
	contractAmount: employee.contractAmount ? Number(employee.contractAmount) : undefined,
});

const mapMotherInfo = (employee: Employee) => ({
	motherFullName: toEmptyString(employee.motherFullName),
	motherFullNameAm: toEmptyString(employee.motherFullNameAm),
	motherPhone: toEmptyString(employee.motherPhone),
	motherIsAlive: employee.motherIsAlive ?? true,
	motherAddress: toEmptyString(employee.motherAddress),
});

const mapEmergencyContactInfo = (employee: Employee) => ({
	emergencyFullName: toEmptyString(employee.emergencyFullName),
	emergencyFullNameAm: toEmptyString(employee.emergencyFullNameAm),
	emergencyRelationship: toEmptyString(employee.emergencyRelationship),
	emergencyPhone: toEmptyString(employee.emergencyPhone),
	emergencyAltPhone: toEmptyString(employee.emergencyAltPhone),
	emergencyEmail: toEmptyString(employee.emergencyEmail),
	emergencyRegionId: toEmptyString(employee.emergencyRegionId),
	emergencySubCityId: toEmptyString(employee.emergencySubCityId),
	emergencyWoredaId: toEmptyString(employee.emergencyWoredaId),
	emergencyHouseNumber: toEmptyString(employee.emergencyHouseNumber),
	emergencyUniqueAreaName: toEmptyString(employee.emergencyUniqueAreaName),
});

const mapAddressInfo = (employee: Employee) => ({
	addressRegionId: toEmptyString(employee.addressRegionId),
	addressSubCityId: toEmptyString(employee.addressSubCityId),
	addressWoredaId: toEmptyString(employee.addressWoredaId),
	addressHouseNumber: toEmptyString(employee.addressHouseNumber),
	addressUniqueAreaName: toEmptyString(employee.addressUniqueAreaName),
});

export const mapEmployeeToFormData = (employee: Employee): UnifiedEmployeeFormData => ({
	...mapPersonalInfo(employee),
	...mapPhysicalInfo(employee),
	...mapIdentificationInfo(employee),
	...mapContactInfo(employee),
	...mapEmploymentInfo(employee),
	...mapTypeSpecificInfo(employee),
	...mapMotherInfo(employee),
	...mapEmergencyContactInfo(employee),
	...mapAddressInfo(employee),
});

const emptyToUndefined = (value: string | undefined): string | undefined => value || undefined;

export const buildUpdatePayload = (data: UnifiedEmployeeFormData): UpdateEmployeeRequest => ({
	firstName: data.firstName,
	firstNameAm: emptyToUndefined(data.firstNameAm),
	middleName: data.middleName,
	middleNameAm: emptyToUndefined(data.middleNameAm),
	lastName: data.lastName,
	lastNameAm: emptyToUndefined(data.lastNameAm),
	gender: data.gender,
	dateOfBirth: data.dateOfBirth,
	birthPlace: emptyToUndefined(data.birthPlace),
	birthPlaceAm: emptyToUndefined(data.birthPlaceAm),
	nationality: emptyToUndefined(data.nationality),
	ethnicity: emptyToUndefined(data.ethnicity),
	maritalStatus: data.maritalStatus,
	marriageDate: emptyToUndefined(data.marriageDate),
	height: data.height,
	weight: data.weight,
	bloodType: emptyToUndefined(data.bloodType),
	eyeColor: emptyToUndefined(data.eyeColor),
	hairColor: emptyToUndefined(data.hairColor),
	distinguishingMarks: emptyToUndefined(data.distinguishingMarks),
	faydaId: emptyToUndefined(data.faydaId),
	passportNumber: emptyToUndefined(data.passportNumber),
	drivingLicense: emptyToUndefined(data.drivingLicense),
	primaryPhone: data.primaryPhone,
	secondaryPhone: emptyToUndefined(data.secondaryPhone),
	email: emptyToUndefined(data.email),
	centerId: emptyToUndefined(data.centerId),
	departmentId: emptyToUndefined(data.departmentId),
	positionId: emptyToUndefined(data.positionId),
	workScheduleType: data.workScheduleType,
	rankId: emptyToUndefined(data.rankId),
	currentSalaryStep: data.currentSalaryStep,
	currentSalary: data.currentSalary,
	contractStartDate: emptyToUndefined(data.contractStartDate),
	contractEndDate: emptyToUndefined(data.contractEndDate),
	contractAmount: data.contractAmount,
});
