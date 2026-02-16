import { FileText } from "lucide-react";
import React from "react";
import { BoardingPassSection } from "#web/features/employees/components/BoardingPassSection.tsx";
import { FormInputField } from "#web/features/employees/components/FormField.tsx";
import type { IdentificationSectionProps } from "#web/features/employees/types/form-types.ts";

export const IdentificationSection = React.memo(({ register, t }: IdentificationSectionProps) => (
	<BoardingPassSection title={t("identification")} icon={<FileText className="h-5 w-5" />}>
		<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
			<FormInputField label={t("faydaId")} name="faydaId" register={register} className="w-full" />
			<FormInputField label={t("passportNumber")} name="passportNumber" register={register} className="w-full" />
			<FormInputField label={t("drivingLicense")} name="drivingLicense" register={register} className="w-full" />
		</div>
	</BoardingPassSection>
));

IdentificationSection.displayName = "IdentificationSection";
