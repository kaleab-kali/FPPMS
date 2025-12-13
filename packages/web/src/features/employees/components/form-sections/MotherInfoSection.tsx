import { Users } from "lucide-react";
import React from "react";
import { Checkbox } from "#web/components/ui/checkbox.tsx";
import { Label } from "#web/components/ui/label.tsx";
import { BoardingPassSection } from "#web/features/employees/components/BoardingPassSection.tsx";
import { FormInputField } from "#web/features/employees/components/FormField.tsx";
import type { MotherInfoSectionProps } from "#web/features/employees/types/form-types.ts";

export const MotherInfoSection = React.memo(
	({ register, motherIsAlive, onMotherIsAliveChange, t }: MotherInfoSectionProps) => (
		<BoardingPassSection title={t("motherInfo")} icon={<Users className="h-5 w-5" />}>
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<FormInputField label={t("motherFullName")} name="motherFullName" register={register} className="w-full" />
				<FormInputField label={t("motherFullNameAm")} name="motherFullNameAm" register={register} className="w-full" />
				<FormInputField label={t("motherPhone")} name="motherPhone" register={register} className="w-full" />
				<div className="flex items-center space-x-2 pt-6">
					<Checkbox
						id="motherIsAlive"
						checked={motherIsAlive ?? true}
						onCheckedChange={(checked) => onMotherIsAliveChange(checked === true)}
					/>
					<Label htmlFor="motherIsAlive" className="cursor-pointer">
						{t("motherIsAlive")}
					</Label>
				</div>
			</div>
			<FormInputField label={t("motherAddress")} name="motherAddress" register={register} className="w-full" />
		</BoardingPassSection>
	),
	(prev, next) => prev.motherIsAlive === next.motherIsAlive,
);

MotherInfoSection.displayName = "MotherInfoSection";
