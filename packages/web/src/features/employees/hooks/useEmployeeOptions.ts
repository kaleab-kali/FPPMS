import React from "react";
import { useTranslation } from "react-i18next";
import { useCenters } from "#web/api/centers/centers.queries.ts";
import { useDepartments } from "#web/api/departments/departments.queries.ts";
import { usePositions } from "#web/api/positions/positions.queries.ts";
import { useRanks } from "#web/api/ranks/ranks.queries.ts";
import {
	BLOOD_TYPE_OPTIONS,
	ETHNICITY_OPTIONS,
	GENDER_OPTIONS,
	MARITAL_STATUS_OPTIONS,
	REGION_OPTIONS,
	SUB_CITY_OPTIONS,
	WOREDA_OPTIONS,
	WORK_SCHEDULE_OPTIONS,
} from "#web/features/employees/constants/form-options.ts";

export const useEmployeeOptions = (
	addressRegionId?: string,
	addressSubCityId?: string,
	emergencyRegionId?: string,
	emergencySubCityId?: string,
) => {
	const { t } = useTranslation("employees");

	const { data: centersData } = useCenters();
	const { data: departmentsData } = useDepartments();
	const { data: positionsData } = usePositions();
	const { data: ranksData } = useRanks();

	const centers = centersData ?? [];
	const departments = departmentsData ?? [];
	const positions = positionsData ?? [];
	const ranks = ranksData ?? [];

	const subCityOptions = React.useMemo(
		() => (addressRegionId ? (SUB_CITY_OPTIONS[addressRegionId] ?? []) : []),
		[addressRegionId],
	);

	const woredaOptions = React.useMemo(
		() => (addressSubCityId ? (WOREDA_OPTIONS[addressSubCityId] ?? []) : []),
		[addressSubCityId],
	);

	const emergencySubCityOptions = React.useMemo(
		() => (emergencyRegionId ? (SUB_CITY_OPTIONS[emergencyRegionId] ?? []) : []),
		[emergencyRegionId],
	);

	const emergencyWoredaOptions = React.useMemo(
		() => (emergencySubCityId ? (WOREDA_OPTIONS[emergencySubCityId] ?? []) : []),
		[emergencySubCityId],
	);

	return React.useMemo(
		() => ({
			genderOptions: GENDER_OPTIONS.map((g) => ({ value: g.value, label: t(`genders.${g.value}`) })),
			maritalStatusOptions: MARITAL_STATUS_OPTIONS.map((m) => ({
				value: m.value,
				label: t(`maritalStatuses.${m.value}`),
			})),
			bloodTypeOptions: BLOOD_TYPE_OPTIONS.map((bt) => ({ value: bt.value, label: t(`bloodTypes.${bt.value}`) })),
			workScheduleOptions: WORK_SCHEDULE_OPTIONS.map((ws) => ({
				value: ws.value,
				label: t(`workScheduleTypes.${ws.value}`),
			})),
			ethnicityOptions: ETHNICITY_OPTIONS.map((e) => ({ value: e.value, label: e.label })),
			centerOptions: centers.map((c) => ({ value: c.id, label: c.name })),
			departmentOptions: departments.map((d) => ({ value: d.id, label: d.name })),
			positionOptions: positions.map((p) => ({ value: p.id, label: p.name })),
			rankOptions: ranks.map((r) => ({ value: r.id, label: r.name })),
			regionOptions: REGION_OPTIONS.map((r) => ({ value: r.value, label: r.label })),
			subCityOptions,
			woredaOptions,
			emergencySubCityOptions,
			emergencyWoredaOptions,
		}),
		[
			centers,
			departments,
			positions,
			ranks,
			subCityOptions,
			woredaOptions,
			emergencySubCityOptions,
			emergencyWoredaOptions,
			t,
		],
	);
};
