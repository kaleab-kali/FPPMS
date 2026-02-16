import React from "react";
import type { UseFormSetValue } from "react-hook-form";
import type { UnifiedEmployeeFormData } from "#web/features/employees/schemas/unified-employee-schema.ts";
import type { Gender, MaritalStatus, WorkScheduleType } from "#web/types/employee.ts";

export const useEmployeeFormHandlers = (setValue: UseFormSetValue<UnifiedEmployeeFormData>) => {
	const handleGenderChange = React.useCallback((value: string) => setValue("gender", value as Gender), [setValue]);

	const handleMaritalStatusChange = React.useCallback(
		(value: string) => setValue("maritalStatus", value as MaritalStatus),
		[setValue],
	);

	const handleBloodTypeChange = React.useCallback((value: string) => setValue("bloodType", value), [setValue]);

	const handleEthnicityChange = React.useCallback((value: string) => setValue("ethnicity", value), [setValue]);

	const handleCenterChange = React.useCallback((value: string) => setValue("centerId", value), [setValue]);

	const handleDepartmentChange = React.useCallback((value: string) => setValue("departmentId", value), [setValue]);

	const handlePositionChange = React.useCallback((value: string) => setValue("positionId", value), [setValue]);

	const handleWorkScheduleChange = React.useCallback(
		(value: string) => setValue("workScheduleType", value as WorkScheduleType),
		[setValue],
	);

	const handleRankChange = React.useCallback((value: string) => setValue("rankId", value), [setValue]);

	const handleSalaryStepChange = React.useCallback(
		(value: string) => setValue("currentSalaryStep", Number(value)),
		[setValue],
	);

	const handleTransferChange = React.useCallback((checked: boolean) => setValue("isTransfer", checked), [setValue]);

	const handleMotherAliveChange = React.useCallback(
		(checked: boolean) => setValue("motherIsAlive", checked),
		[setValue],
	);

	const handleRegionChange = React.useCallback(
		(value: string) => {
			setValue("addressRegionId", value);
			setValue("addressSubCityId", "");
			setValue("addressWoredaId", "");
		},
		[setValue],
	);

	const handleSubCityChange = React.useCallback(
		(value: string) => {
			setValue("addressSubCityId", value);
			setValue("addressWoredaId", "");
		},
		[setValue],
	);

	const handleWoredaChange = React.useCallback((value: string) => setValue("addressWoredaId", value), [setValue]);

	const handleEmergencyRegionChange = React.useCallback(
		(value: string) => {
			setValue("emergencyRegionId", value);
			setValue("emergencySubCityId", "");
			setValue("emergencyWoredaId", "");
		},
		[setValue],
	);

	const handleEmergencySubCityChange = React.useCallback(
		(value: string) => {
			setValue("emergencySubCityId", value);
			setValue("emergencyWoredaId", "");
		},
		[setValue],
	);

	const handleEmergencyWoredaChange = React.useCallback(
		(value: string) => setValue("emergencyWoredaId", value),
		[setValue],
	);

	const handleRelationshipChange = React.useCallback(
		(value: string) => setValue("emergencyRelationship", value),
		[setValue],
	);

	return React.useMemo(
		() => ({
			handleGenderChange,
			handleMaritalStatusChange,
			handleBloodTypeChange,
			handleEthnicityChange,
			handleCenterChange,
			handleDepartmentChange,
			handlePositionChange,
			handleWorkScheduleChange,
			handleRankChange,
			handleSalaryStepChange,
			handleTransferChange,
			handleMotherAliveChange,
			handleRegionChange,
			handleSubCityChange,
			handleWoredaChange,
			handleEmergencyRegionChange,
			handleEmergencySubCityChange,
			handleEmergencyWoredaChange,
			handleRelationshipChange,
		}),
		[
			handleGenderChange,
			handleMaritalStatusChange,
			handleBloodTypeChange,
			handleEthnicityChange,
			handleCenterChange,
			handleDepartmentChange,
			handlePositionChange,
			handleWorkScheduleChange,
			handleRankChange,
			handleSalaryStepChange,
			handleTransferChange,
			handleMotherAliveChange,
			handleRegionChange,
			handleSubCityChange,
			handleWoredaChange,
			handleEmergencyRegionChange,
			handleEmergencySubCityChange,
			handleEmergencyWoredaChange,
			handleRelationshipChange,
		],
	);
};
