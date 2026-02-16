import { Phone } from "lucide-react";
import React from "react";
import { BoardingPassSection } from "#web/features/employees/components/BoardingPassSection.tsx";
import { FormInputField } from "#web/features/employees/components/FormField.tsx";
import type { ContactInfoSectionProps } from "#web/features/employees/types/form-types.ts";

export const ContactInfoSection = React.memo(({ register, errors, t }: ContactInfoSectionProps) => (
	<BoardingPassSection title={t("contactInfo")} icon={<Phone className="h-5 w-5" />}>
		<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
			<FormInputField
				label={t("primaryPhone")}
				name="primaryPhone"
				register={register}
				error={errors.primaryPhone}
				required
				className="w-full"
			/>
			<FormInputField label={t("secondaryPhone")} name="secondaryPhone" register={register} className="w-full" />
			<FormInputField label={t("email")} name="email" type="email" register={register} className="w-full" />
		</div>
	</BoardingPassSection>
));

ContactInfoSection.displayName = "ContactInfoSection";
