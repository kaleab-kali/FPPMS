import type { TFunction } from "i18next";
import type { FieldErrors, UseFormRegister } from "react-hook-form";
import type { UnifiedEmployeeFormData } from "#web/features/employees/schemas/unified-employee-schema.ts";

export interface SelectOption {
	value: string;
	label: string;
}

interface BaseFormSectionProps {
	register: UseFormRegister<UnifiedEmployeeFormData>;
	errors: FieldErrors<UnifiedEmployeeFormData>;
	t: TFunction;
}

export interface SimpleSectionProps extends BaseFormSectionProps {}

export interface AddressSectionProps {
	register: UseFormRegister<UnifiedEmployeeFormData>;
	t: TFunction;
	addressRegionId?: string;
	addressSubCityId?: string;
	addressWoredaId?: string;
	regionOptions: SelectOption[];
	subCityOptions: SelectOption[];
	woredaOptions: SelectOption[];
	onRegionChange: (value: string) => void;
	onSubCityChange: (value: string) => void;
	onWoredaChange: (value: string) => void;
}

export interface EmergencyContactSectionProps extends SimpleSectionProps {
	emergencyRelationship: string;
	emergencyRegionId: string;
	emergencySubCityId: string;
	emergencyWoredaId: string;
	regionOptions: SelectOption[];
	emergencySubCityOptions: SelectOption[];
	emergencyWoredaOptions: SelectOption[];
	onRelationshipChange: (value: string) => void;
	onEmergencyRegionChange: (value: string) => void;
	onEmergencySubCityChange: (value: string) => void;
	onEmergencyWoredaChange: (value: string) => void;
}

export interface MotherInfoSectionProps extends SimpleSectionProps {
	motherIsAlive: boolean;
	onMotherIsAliveChange: (checked: boolean) => void;
}

export interface PersonalInfoSectionProps extends SimpleSectionProps {
	gender: string;
	maritalStatus: string;
	onGenderChange: (value: string) => void;
	onMaritalStatusChange: (value: string) => void;
	isFirst?: boolean;
}

export interface EmploymentInfoSectionProps extends SimpleSectionProps {
	centerId: string;
	departmentId: string;
	positionId: string;
	workScheduleType: string;
	isTransfer: boolean;
	centerOptions: SelectOption[];
	departmentOptions: SelectOption[];
	positionOptions: SelectOption[];
	onCenterChange: (value: string) => void;
	onDepartmentChange: (value: string) => void;
	onPositionChange: (value: string) => void;
	onWorkScheduleChange: (value: string) => void;
	onIsTransferChange: (checked: boolean) => void;
}

export interface MilitarySpecificSectionProps {
	register: UseFormRegister<UnifiedEmployeeFormData>;
	errors: FieldErrors<UnifiedEmployeeFormData>;
	t: TFunction;
	rankId: string;
	currentSalaryStep: number;
	rankOptions: SelectOption[];
	onRankChange: (value: string) => void;
	onSalaryStepChange: (value: string) => void;
}

export interface CivilianSpecificSectionProps {
	register: UseFormRegister<UnifiedEmployeeFormData>;
	t: TFunction;
}

export interface TemporarySpecificSectionProps {
	register: UseFormRegister<UnifiedEmployeeFormData>;
	errors: FieldErrors<UnifiedEmployeeFormData>;
	t: TFunction;
}

export interface PhysicalInfoSectionProps {
	register: UseFormRegister<UnifiedEmployeeFormData>;
	t: TFunction;
	bloodType: string;
	onBloodTypeChange: (value: string) => void;
}

export interface ContactInfoSectionProps {
	register: UseFormRegister<UnifiedEmployeeFormData>;
	errors: FieldErrors<UnifiedEmployeeFormData>;
	t: TFunction;
}

export interface IdentificationSectionProps {
	register: UseFormRegister<UnifiedEmployeeFormData>;
	t: TFunction;
}
