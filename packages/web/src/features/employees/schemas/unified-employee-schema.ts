import { z } from "zod";

const GENDER_VALUES = ["MALE", "FEMALE"] as const;
const MARITAL_STATUS_VALUES = ["SINGLE", "MARRIED", "DIVORCED", "WIDOWED"] as const;
const WORK_SCHEDULE_VALUES = ["REGULAR", "SHIFT_24"] as const;

const MIN_NAME_LENGTH = 2;
const MIN_PHONE_LENGTH = 9;
const MAX_SALARY_STEP = 9;
const MIN_SALARY_STEP = 0;

export const unifiedEmployeeFormSchema = z.object({
	firstName: z.string().min(MIN_NAME_LENGTH, "First name is required"),
	firstNameAm: z.string().min(MIN_NAME_LENGTH, "Amharic first name is required"),
	middleName: z.string().min(MIN_NAME_LENGTH, "Middle name is required"),
	middleNameAm: z.string().min(MIN_NAME_LENGTH, "Amharic middle name is required"),
	lastName: z.string().min(MIN_NAME_LENGTH, "Last name is required"),
	lastNameAm: z.string().min(MIN_NAME_LENGTH, "Amharic last name is required"),
	gender: z.enum(GENDER_VALUES),
	dateOfBirth: z.string().min(1, "Date of birth is required"),
	birthPlace: z.string().optional(),
	birthPlaceAm: z.string().optional(),
	nationality: z.string().optional(),
	ethnicity: z.string().optional(),
	maritalStatus: z.enum(MARITAL_STATUS_VALUES).optional(),
	marriageDate: z.string().optional(),
	height: z.number().optional(),
	weight: z.number().optional(),
	bloodType: z.string().optional(),
	eyeColor: z.string().optional(),
	hairColor: z.string().optional(),
	distinguishingMarks: z.string().optional(),
	faydaId: z.string().optional(),
	passportNumber: z.string().optional(),
	drivingLicense: z.string().optional(),
	primaryPhone: z.string().min(MIN_PHONE_LENGTH, "Primary phone is required"),
	secondaryPhone: z.string().optional(),
	email: z.string().email().optional().or(z.literal("")),
	centerId: z.string().optional(),
	departmentId: z.string().optional(),
	positionId: z.string().optional(),
	employmentDate: z.string().min(1, "Employment date is required"),
	isTransfer: z.boolean().optional(),
	originalEmploymentDate: z.string().optional(),
	sourceOrganization: z.string().optional(),
	workScheduleType: z.enum(WORK_SCHEDULE_VALUES).optional(),
	motherFullName: z.string().optional(),
	motherFullNameAm: z.string().optional(),
	motherPhone: z.string().optional(),
	motherIsAlive: z.boolean().optional(),
	motherAddress: z.string().optional(),
	emergencyFullName: z.string().optional(),
	emergencyFullNameAm: z.string().optional(),
	emergencyRelationship: z.string().optional(),
	emergencyPhone: z.string().optional(),
	emergencyAltPhone: z.string().optional(),
	emergencyEmail: z.string().optional(),
	emergencyRegionId: z.string().optional(),
	emergencySubCityId: z.string().optional(),
	emergencyWoredaId: z.string().optional(),
	emergencyHouseNumber: z.string().optional(),
	emergencyUniqueAreaName: z.string().optional(),
	addressRegionId: z.string().optional(),
	addressSubCityId: z.string().optional(),
	addressWoredaId: z.string().optional(),
	addressHouseNumber: z.string().optional(),
	addressUniqueAreaName: z.string().optional(),
	rankId: z.string().optional(),
	currentSalaryStep: z.number().min(MIN_SALARY_STEP).max(MAX_SALARY_STEP).optional(),
	currentSalary: z.number().optional(),
	contractStartDate: z.string().optional(),
	contractEndDate: z.string().optional(),
	contractAmount: z.number().optional(),
});

export type UnifiedEmployeeFormData = z.infer<typeof unifiedEmployeeFormSchema>;

export const militaryFormSchema = unifiedEmployeeFormSchema.extend({
	rankId: z.string().min(1, "Rank is required"),
});

export const civilianFormSchema = unifiedEmployeeFormSchema;

export const temporaryFormSchema = unifiedEmployeeFormSchema.extend({
	contractStartDate: z.string().min(1, "Contract start date is required"),
	contractEndDate: z.string().min(1, "Contract end date is required"),
});

export type MilitaryFormData = z.infer<typeof militaryFormSchema>;
export type CivilianFormData = z.infer<typeof civilianFormSchema>;
export type TemporaryFormData = z.infer<typeof temporaryFormSchema>;

export type EmployeeFormData = MilitaryFormData | CivilianFormData | TemporaryFormData;

export type EmployeeFormField = keyof UnifiedEmployeeFormData;
