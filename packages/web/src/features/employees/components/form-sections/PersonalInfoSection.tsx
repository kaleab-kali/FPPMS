import { User } from "lucide-react";
import React from "react";
import { BoardingPassSection } from "#web/features/employees/components/BoardingPassSection.tsx";
import { FormInputField, FormSelectField } from "#web/features/employees/components/FormField.tsx";
import { GENDER_OPTIONS, MARITAL_STATUS_OPTIONS } from "#web/features/employees/constants/form-options.ts";
import type { PersonalInfoSectionProps } from "#web/features/employees/types/form-types.ts";

export const PersonalInfoSection = React.memo(
	({
		register,
		errors,
		gender,
		maritalStatus,
		onGenderChange,
		onMaritalStatusChange,
		t,
		isFirst = false,
	}: PersonalInfoSectionProps) => {
		const genderOptions = React.useMemo(
			() => GENDER_OPTIONS.map((g) => ({ value: g.value, label: t(`genders.${g.value}`) })),
			[t],
		);

		const maritalOptions = React.useMemo(
			() => MARITAL_STATUS_OPTIONS.map((m) => ({ value: m.value, label: t(`maritalStatuses.${m.value}`) })),
			[t],
		);

		return (
			<BoardingPassSection title={t("personalInfo")} icon={<User className="h-5 w-5" />} isFirst={isFirst}>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<FormInputField
						label={t("firstName")}
						name="firstName"
						register={register}
						error={errors.firstName}
						required
						className="w-full"
					/>
					<FormInputField
						label={t("firstNameAm")}
						name="firstNameAm"
						register={register}
						error={errors.firstNameAm}
						required
						className="w-full"
					/>
				</div>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<FormInputField
						label={t("middleName")}
						name="middleName"
						register={register}
						error={errors.middleName}
						required
						className="w-full"
					/>
					<FormInputField
						label={t("middleNameAm")}
						name="middleNameAm"
						register={register}
						error={errors.middleNameAm}
						required
						className="w-full"
					/>
				</div>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<FormInputField
						label={t("lastName")}
						name="lastName"
						register={register}
						error={errors.lastName}
						required
						className="w-full"
					/>
					<FormInputField
						label={t("lastNameAm")}
						name="lastNameAm"
						register={register}
						error={errors.lastNameAm}
						required
						className="w-full"
					/>
				</div>
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
					<FormSelectField
						label={t("gender")}
						value={gender}
						onValueChange={onGenderChange}
						options={genderOptions}
						required
						className="w-full"
					/>
					<FormInputField
						label={t("dateOfBirth")}
						name="dateOfBirth"
						type="date"
						register={register}
						error={errors.dateOfBirth}
						required
						className="w-full"
					/>
					<FormSelectField
						label={t("maritalStatus")}
						value={maritalStatus ?? ""}
						onValueChange={onMaritalStatusChange}
						options={maritalOptions}
						className="w-full"
					/>
					<FormInputField
						label={t("marriageDate")}
						name="marriageDate"
						type="date"
						register={register}
						className="w-full"
					/>
				</div>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<FormInputField label={t("birthPlace")} name="birthPlace" register={register} className="w-full" />
					<FormInputField label={t("birthPlaceAm")} name="birthPlaceAm" register={register} className="w-full" />
				</div>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<FormInputField label={t("nationality")} name="nationality" register={register} className="w-full" />
					<FormInputField label={t("ethnicity")} name="ethnicity" register={register} className="w-full" />
				</div>
			</BoardingPassSection>
		);
	},
	(prev, next) => prev.gender === next.gender && prev.maritalStatus === next.maritalStatus,
);

PersonalInfoSection.displayName = "PersonalInfoSection";
