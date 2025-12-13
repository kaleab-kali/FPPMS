import { UserCheck } from "lucide-react";
import React from "react";
import { BoardingPassSection } from "#web/features/employees/components/BoardingPassSection.tsx";
import { FormInputField, FormSelectField } from "#web/features/employees/components/FormField.tsx";
import { RELATIONSHIP_OPTIONS } from "#web/features/employees/constants/form-options.ts";
import type { EmergencyContactSectionProps } from "#web/features/employees/types/form-types.ts";

export const EmergencyContactSection = React.memo(
	({
		register,
		emergencyRelationship,
		emergencyRegionId,
		emergencySubCityId,
		emergencyWoredaId,
		regionOptions,
		emergencySubCityOptions,
		emergencyWoredaOptions,
		onRelationshipChange,
		onEmergencyRegionChange,
		onEmergencySubCityChange,
		onEmergencyWoredaChange,
		t,
	}: EmergencyContactSectionProps) => {
		const relationshipOptions = React.useMemo(
			() => RELATIONSHIP_OPTIONS.map((r) => ({ value: r.value, label: t(`relationships.${r.value}`) })),
			[t],
		);

		return (
			<BoardingPassSection title={t("emergencyContact")} icon={<UserCheck className="h-5 w-5" />}>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<FormInputField
						label={t("emergencyFullName")}
						name="emergencyFullName"
						register={register}
						className="w-full"
					/>
					<FormInputField
						label={t("emergencyFullNameAm")}
						name="emergencyFullNameAm"
						register={register}
						className="w-full"
					/>
					<FormSelectField
						label={t("emergencyRelationship")}
						value={emergencyRelationship ?? ""}
						onValueChange={onRelationshipChange}
						options={relationshipOptions}
						placeholder={t("selectRelationship")}
						className="w-full"
					/>
					<FormInputField label={t("emergencyPhone")} name="emergencyPhone" register={register} className="w-full" />
					<FormInputField
						label={t("emergencyAltPhone")}
						name="emergencyAltPhone"
						register={register}
						className="w-full"
					/>
					<FormInputField
						label={t("emergencyEmail")}
						name="emergencyEmail"
						type="email"
						register={register}
						className="w-full"
					/>
				</div>
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
					<FormSelectField
						label={t("region")}
						value={emergencyRegionId ?? ""}
						onValueChange={onEmergencyRegionChange}
						options={regionOptions}
						placeholder={t("selectRegion")}
						className="w-full"
					/>
					<FormSelectField
						label={t("subCity")}
						value={emergencySubCityId ?? ""}
						onValueChange={onEmergencySubCityChange}
						options={emergencySubCityOptions}
						placeholder={t("selectSubCity")}
						disabled={!emergencyRegionId}
						className="w-full"
					/>
					<FormSelectField
						label={t("woreda")}
						value={emergencyWoredaId ?? ""}
						onValueChange={onEmergencyWoredaChange}
						options={emergencyWoredaOptions}
						placeholder={t("selectWoreda")}
						disabled={!emergencySubCityId}
						className="w-full"
					/>
				</div>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<FormInputField label={t("houseNumber")} name="emergencyHouseNumber" register={register} className="w-full" />
					<FormInputField
						label={t("uniqueAreaName")}
						name="emergencyUniqueAreaName"
						register={register}
						className="w-full"
					/>
				</div>
			</BoardingPassSection>
		);
	},
	(prev, next) =>
		prev.emergencyRelationship === next.emergencyRelationship &&
		prev.emergencyRegionId === next.emergencyRegionId &&
		prev.emergencySubCityId === next.emergencySubCityId &&
		prev.emergencyWoredaId === next.emergencyWoredaId,
);

EmergencyContactSection.displayName = "EmergencyContactSection";
