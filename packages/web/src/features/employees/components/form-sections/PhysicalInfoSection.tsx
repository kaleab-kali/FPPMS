import { Heart } from "lucide-react";
import React from "react";
import { BoardingPassSection } from "#web/features/employees/components/BoardingPassSection.tsx";
import { FormInputField, FormSelectField } from "#web/features/employees/components/FormField.tsx";
import { BLOOD_TYPE_OPTIONS } from "#web/features/employees/constants/form-options.ts";
import type { PhysicalInfoSectionProps } from "#web/features/employees/types/form-types.ts";

export const PhysicalInfoSection = React.memo(
	({ register, bloodType, onBloodTypeChange, t }: PhysicalInfoSectionProps) => {
		const bloodTypeOptions = React.useMemo(
			() => BLOOD_TYPE_OPTIONS.map((bt) => ({ value: bt.value, label: t(`bloodTypes.${bt.value}`) })),
			[t],
		);

		return (
			<BoardingPassSection title={t("physicalInfo")} icon={<Heart className="h-5 w-5" />}>
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
					<FormInputField
						label={t("height")}
						name="height"
						type="number"
						register={register}
						placeholder="cm"
						className="w-full"
					/>
					<FormInputField
						label={t("weight")}
						name="weight"
						type="number"
						register={register}
						placeholder="kg"
						className="w-full"
					/>
					<FormSelectField
						label={t("bloodType")}
						value={bloodType ?? ""}
						onValueChange={onBloodTypeChange}
						options={bloodTypeOptions}
						className="w-full"
					/>
					<FormInputField label={t("eyeColor")} name="eyeColor" register={register} className="w-full" />
				</div>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<FormInputField label={t("hairColor")} name="hairColor" register={register} className="w-full" />
					<FormInputField
						label={t("distinguishingMarks")}
						name="distinguishingMarks"
						register={register}
						className="w-full"
					/>
				</div>
			</BoardingPassSection>
		);
	},
	(prev, next) => prev.bloodType === next.bloodType,
);

PhysicalInfoSection.displayName = "PhysicalInfoSection";
