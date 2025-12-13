import { Building2 } from "lucide-react";
import React from "react";
import { Checkbox } from "#web/components/ui/checkbox.tsx";
import { Label } from "#web/components/ui/label.tsx";
import { BoardingPassSection } from "#web/features/employees/components/BoardingPassSection.tsx";
import { FormInputField, FormSelectField } from "#web/features/employees/components/FormField.tsx";
import { WORK_SCHEDULE_OPTIONS } from "#web/features/employees/constants/form-options.ts";
import type { EmploymentInfoSectionProps } from "#web/features/employees/types/form-types.ts";

export const EmploymentInfoSection = React.memo(
	({
		register,
		errors,
		centerId,
		departmentId,
		positionId,
		workScheduleType,
		isTransfer,
		centerOptions,
		departmentOptions,
		positionOptions,
		onCenterChange,
		onDepartmentChange,
		onPositionChange,
		onWorkScheduleChange,
		onIsTransferChange,
		t,
	}: EmploymentInfoSectionProps) => {
		const workScheduleOptions = React.useMemo(
			() => WORK_SCHEDULE_OPTIONS.map((ws) => ({ value: ws.value, label: t(`workScheduleTypes.${ws.value}`) })),
			[t],
		);

		return (
			<BoardingPassSection title={t("employmentInfo")} icon={<Building2 className="h-5 w-5" />}>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<FormSelectField
						label={t("center")}
						value={centerId ?? ""}
						onValueChange={onCenterChange}
						options={centerOptions}
						placeholder={t("selectCenter")}
						className="w-full"
					/>
					<FormSelectField
						label={t("department")}
						value={departmentId ?? ""}
						onValueChange={onDepartmentChange}
						options={departmentOptions}
						placeholder={t("selectDepartment")}
						className="w-full"
					/>
					<FormSelectField
						label={t("position")}
						value={positionId ?? ""}
						onValueChange={onPositionChange}
						options={positionOptions}
						placeholder={t("selectPosition")}
						className="w-full"
					/>
					<FormSelectField
						label={t("workSchedule")}
						value={workScheduleType ?? "REGULAR"}
						onValueChange={onWorkScheduleChange}
						options={workScheduleOptions}
						placeholder={t("selectWorkSchedule")}
						className="w-full"
					/>
					<FormInputField
						label={t("employmentDate")}
						name="employmentDate"
						type="date"
						register={register}
						error={errors.employmentDate}
						required
						className="w-full"
					/>
					<div className="flex items-center space-x-2 pt-6">
						<Checkbox
							id="isTransfer"
							checked={isTransfer ?? false}
							onCheckedChange={(checked) => onIsTransferChange(checked === true)}
						/>
						<Label htmlFor="isTransfer" className="cursor-pointer">
							{t("isTransfer")}
						</Label>
					</div>
				</div>
				{isTransfer && (
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<FormInputField
							label={t("originalEmploymentDate")}
							name="originalEmploymentDate"
							type="date"
							register={register}
							className="w-full"
						/>
						<FormInputField
							label={t("sourceOrganization")}
							name="sourceOrganization"
							register={register}
							className="w-full"
						/>
					</div>
				)}
			</BoardingPassSection>
		);
	},
	(prev, next) =>
		prev.centerId === next.centerId &&
		prev.departmentId === next.departmentId &&
		prev.positionId === next.positionId &&
		prev.workScheduleType === next.workScheduleType &&
		prev.isTransfer === next.isTransfer,
);

EmploymentInfoSection.displayName = "EmploymentInfoSection";
