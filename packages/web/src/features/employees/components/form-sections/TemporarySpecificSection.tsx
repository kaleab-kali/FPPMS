import { Calendar } from "lucide-react";
import React from "react";
import { BoardingPassSection } from "#web/features/employees/components/BoardingPassSection.tsx";
import { FormInputField } from "#web/features/employees/components/FormField.tsx";
import type { TemporarySpecificSectionProps } from "#web/features/employees/types/form-types.ts";

export const TemporarySpecificSection = React.memo(
	({ register, errors, t }: TemporarySpecificSectionProps) => (
		<BoardingPassSection title={t("contractInfo")} icon={<Calendar className="h-5 w-5" />}>
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<FormInputField
					label={t("contractStart")}
					name="contractStartDate"
					type="date"
					register={register}
					error={errors.contractStartDate}
					required
					className="w-full"
				/>
				<FormInputField
					label={t("contractEnd")}
					name="contractEndDate"
					type="date"
					register={register}
					error={errors.contractEndDate}
					required
					className="w-full"
				/>
			</div>
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<FormInputField
					label={t("contractAmount")}
					name="contractAmount"
					type="number"
					register={register}
					placeholder="0.00"
					className="w-full"
				/>
			</div>
		</BoardingPassSection>
	),
	() => true,
);

TemporarySpecificSection.displayName = "TemporarySpecificSection";
