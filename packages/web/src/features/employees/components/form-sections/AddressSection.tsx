import { MapPin } from "lucide-react";
import React from "react";
import { BoardingPassSection } from "#web/features/employees/components/BoardingPassSection.tsx";
import { FormInputField, FormSelectField } from "#web/features/employees/components/FormField.tsx";
import type { AddressSectionProps } from "#web/features/employees/types/form-types.ts";

export const AddressSection = React.memo(
	({
		register,
		addressRegionId,
		addressSubCityId,
		addressWoredaId,
		regionOptions,
		subCityOptions,
		woredaOptions,
		onRegionChange,
		onSubCityChange,
		onWoredaChange,
		t,
	}: AddressSectionProps) => (
		<BoardingPassSection title={t("addressInfo")} icon={<MapPin className="h-5 w-5" />}>
			<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
				<FormSelectField
					label={t("region")}
					value={addressRegionId ?? ""}
					onValueChange={onRegionChange}
					options={regionOptions}
					placeholder={t("selectRegion")}
					className="w-full"
				/>
				<FormSelectField
					label={t("subCity")}
					value={addressSubCityId ?? ""}
					onValueChange={onSubCityChange}
					options={subCityOptions}
					placeholder={t("selectSubCity")}
					disabled={!addressRegionId}
					className="w-full"
				/>
				<FormSelectField
					label={t("woreda")}
					value={addressWoredaId ?? ""}
					onValueChange={onWoredaChange}
					options={woredaOptions}
					placeholder={t("selectWoreda")}
					disabled={!addressSubCityId}
					className="w-full"
				/>
			</div>
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<FormInputField label={t("houseNumber")} name="addressHouseNumber" register={register} className="w-full" />
				<FormInputField
					label={t("uniqueAreaName")}
					name="addressUniqueAreaName"
					register={register}
					className="w-full"
				/>
			</div>
		</BoardingPassSection>
	),
	(prev, next) =>
		prev.addressRegionId === next.addressRegionId &&
		prev.addressSubCityId === next.addressSubCityId &&
		prev.addressWoredaId === next.addressWoredaId,
);

AddressSection.displayName = "AddressSection";
