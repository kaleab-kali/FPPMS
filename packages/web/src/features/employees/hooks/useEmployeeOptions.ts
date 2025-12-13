import React from "react";
import { useTranslation } from "react-i18next";
import { useCenters } from "#web/api/centers/centers.queries.ts";
import { useDepartments } from "#web/api/departments/departments.queries.ts";
import { useRegions } from "#web/api/lookups/regions.queries.ts";
import { useSubCities } from "#web/api/lookups/sub-cities.queries.ts";
import { useWoredas } from "#web/api/lookups/woredas.queries.ts";
import { usePositions } from "#web/api/positions/positions.queries.ts";
import { useRanks } from "#web/api/ranks/ranks.queries.ts";
import {
	BLOOD_TYPE_OPTIONS,
	GENDER_OPTIONS,
	MARITAL_STATUS_OPTIONS,
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
	const { data: regionsData } = useRegions();
	const { data: subCitiesData } = useSubCities(addressRegionId);
	const { data: woredasData } = useWoredas(addressSubCityId);
	const { data: emergencySubCitiesData } = useSubCities(emergencyRegionId);
	const { data: emergencyWoredasData } = useWoredas(emergencySubCityId);

	const centers = centersData ?? [];
	const departments = departmentsData ?? [];
	const positions = positionsData ?? [];
	const ranks = ranksData ?? [];
	const regions = regionsData ?? [];
	const subCities = subCitiesData ?? [];
	const woredas = woredasData ?? [];
	const emergencySubCities = emergencySubCitiesData ?? [];
	const emergencyWoredas = emergencyWoredasData ?? [];

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
			centerOptions: centers.map((c) => ({ value: c.id, label: c.name })),
			departmentOptions: departments.map((d) => ({ value: d.id, label: d.name })),
			positionOptions: positions.map((p) => ({ value: p.id, label: p.name })),
			rankOptions: ranks.map((r) => ({ value: r.id, label: r.name })),
			regionOptions: regions.map((r) => ({ value: r.id, label: r.name })),
			subCityOptions: subCities.map((sc) => ({ value: sc.id, label: sc.name })),
			woredaOptions: woredas.map((w) => ({ value: w.id, label: w.name })),
			emergencySubCityOptions: emergencySubCities.map((sc) => ({ value: sc.id, label: sc.name })),
			emergencyWoredaOptions: emergencyWoredas.map((w) => ({ value: w.id, label: w.name })),
		}),
		[centers, departments, positions, ranks, regions, subCities, woredas, emergencySubCities, emergencyWoredas, t],
	);
};
