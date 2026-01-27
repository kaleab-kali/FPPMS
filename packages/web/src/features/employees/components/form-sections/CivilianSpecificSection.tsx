import { Briefcase } from "lucide-react";
import React from "react";
import { BoardingPassSection } from "#web/features/employees/components/BoardingPassSection.tsx";
import { FormInputField } from "#web/features/employees/components/FormField.tsx";
import type { CivilianSpecificSectionProps } from "#web/features/employees/types/form-types.ts";

export const CivilianSpecificSection = React.memo(({ register, t }: CivilianSpecificSectionProps) => (
	<BoardingPassSection title={t("salaryInfo")} icon={<Briefcase className="h-5 w-5" />}>
		<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
			<FormInputField
				label={t("salary")}
				name="currentSalary"
				type="number"
				register={register}
				placeholder="0.00"
				className="w-full"
			/>
		</div>
	</BoardingPassSection>
));

CivilianSpecificSection.displayName = "CivilianSpecificSection";
