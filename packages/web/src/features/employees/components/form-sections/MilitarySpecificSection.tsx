import { Shield } from "lucide-react";
import React from "react";
import { BoardingPassSection } from "#web/features/employees/components/BoardingPassSection.tsx";
import { FormSelectField } from "#web/features/employees/components/FormField.tsx";
import { SALARY_STEP_OPTIONS } from "#web/features/employees/constants/form-options.ts";
import type { MilitarySpecificSectionProps } from "#web/features/employees/types/form-types.ts";

export const MilitarySpecificSection = React.memo(
	({
		errors,
		rankId,
		currentSalaryStep,
		rankOptions,
		onRankChange,
		onSalaryStepChange,
		t,
	}: MilitarySpecificSectionProps) => (
		<BoardingPassSection title={t("militaryInfo")} icon={<Shield className="h-5 w-5" />}>
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<FormSelectField
					label={t("rank")}
					value={rankId ?? ""}
					onValueChange={onRankChange}
					options={rankOptions}
					placeholder={t("selectRank")}
					required
					error={errors.rankId}
					className="w-full"
				/>
				<FormSelectField
					label={t("salaryStep")}
					value={String(currentSalaryStep ?? 0)}
					onValueChange={onSalaryStepChange}
					options={SALARY_STEP_OPTIONS}
					className="w-full"
				/>
			</div>
		</BoardingPassSection>
	),
	(prev, next) => prev.rankId === next.rankId && prev.currentSalaryStep === next.currentSalaryStep,
);

MilitarySpecificSection.displayName = "MilitarySpecificSection";
