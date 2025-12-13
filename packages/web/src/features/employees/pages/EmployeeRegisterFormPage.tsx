import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Briefcase, Calendar, Loader2, Save, Shield } from "lucide-react";
import React from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import {
	useCreateCivilianEmployee,
	useCreateMilitaryEmployee,
	useCreateTemporaryEmployee,
} from "#web/api/employees/employees.mutations.ts";
import { Button } from "#web/components/ui/button.tsx";
import { BoardingPassSection } from "#web/features/employees/components/BoardingPassSection.tsx";
import { AddressSection } from "#web/features/employees/components/form-sections/AddressSection.tsx";
import { CivilianSpecificSection } from "#web/features/employees/components/form-sections/CivilianSpecificSection.tsx";
import { ContactInfoSection } from "#web/features/employees/components/form-sections/ContactInfoSection.tsx";
import { EmergencyContactSection } from "#web/features/employees/components/form-sections/EmergencyContactSection.tsx";
import { EmploymentInfoSection } from "#web/features/employees/components/form-sections/EmploymentInfoSection.tsx";
import { IdentificationSection } from "#web/features/employees/components/form-sections/IdentificationSection.tsx";
import { MilitarySpecificSection } from "#web/features/employees/components/form-sections/MilitarySpecificSection.tsx";
import { MotherInfoSection } from "#web/features/employees/components/form-sections/MotherInfoSection.tsx";
import { PersonalInfoSection } from "#web/features/employees/components/form-sections/PersonalInfoSection.tsx";
import { PhysicalInfoSection } from "#web/features/employees/components/form-sections/PhysicalInfoSection.tsx";
import { TemporarySpecificSection } from "#web/features/employees/components/form-sections/TemporarySpecificSection.tsx";
import { useEmployeeFormHandlers } from "#web/features/employees/hooks/useEmployeeFormHandlers.ts";
import { useEmployeeOptions } from "#web/features/employees/hooks/useEmployeeOptions.ts";
import {
	civilianFormSchema,
	militaryFormSchema,
	temporaryFormSchema,
	type UnifiedEmployeeFormData,
} from "#web/features/employees/schemas/unified-employee-schema.ts";
import {
	buildCivilianPayload,
	buildMilitaryPayload,
	buildTemporaryPayload,
} from "#web/features/employees/utils/payload-builders.ts";
import type { EmployeeType } from "#web/types/employee.ts";

interface ApiErrorResponse {
	response?: {
		data?: {
			message?: string | string[];
		};
	};
}

const isApiError = (error: unknown): error is ApiErrorResponse =>
	typeof error === "object" && error !== null && "response" in error;

const getErrorMessage = (error: unknown, fallback: string): string => {
	if (!isApiError(error)) return fallback;
	const message = error.response?.data?.message;
	if (Array.isArray(message)) return message.join(", ");
	return message ?? fallback;
};

const EMPLOYEE_TYPE_CONFIG = {
	MILITARY: {
		schema: militaryFormSchema,
		icon: Shield,
		titleKey: "registerMilitary",
	},
	CIVILIAN: {
		schema: civilianFormSchema,
		icon: Briefcase,
		titleKey: "registerCivilian",
	},
	TEMPORARY: {
		schema: temporaryFormSchema,
		icon: Calendar,
		titleKey: "registerTemporary",
	},
} as const;

const DEFAULT_FORM_VALUES: Partial<UnifiedEmployeeFormData> = {
	gender: "MALE",
	maritalStatus: "SINGLE",
	nationality: "Ethiopian",
	employmentDate: new Date().toISOString().split("T")[0],
	workScheduleType: "REGULAR",
	isTransfer: false,
	motherIsAlive: true,
} as const;

export const EmployeeRegisterFormPage = React.memo(
	() => {
		const { type } = useParams<{ type: string }>();
		const employeeType = (type?.toUpperCase() ?? "MILITARY") as EmployeeType;
		const { t } = useTranslation("employees");
		const { t: tCommon } = useTranslation("common");
		const navigate = useNavigate();

		const config = EMPLOYEE_TYPE_CONFIG[employeeType];
		const IconComponent = config.icon;

		const {
			register,
			handleSubmit,
			setValue,
			watch,
			formState: { errors },
		} = useForm<UnifiedEmployeeFormData>({
			resolver: zodResolver(config.schema),
			defaultValues: DEFAULT_FORM_VALUES,
		});

		const gender = watch("gender");
		const maritalStatus = watch("maritalStatus");
		const centerId = watch("centerId");
		const departmentId = watch("departmentId");
		const positionId = watch("positionId");
		const bloodType = watch("bloodType");
		const workScheduleType = watch("workScheduleType");
		const isTransfer = watch("isTransfer");
		const motherIsAlive = watch("motherIsAlive");
		const addressRegionId = watch("addressRegionId");
		const addressSubCityId = watch("addressSubCityId");
		const addressWoredaId = watch("addressWoredaId");
		const emergencyRegionId = watch("emergencyRegionId");
		const emergencySubCityId = watch("emergencySubCityId");
		const emergencyRelationship = watch("emergencyRelationship");
		const emergencyWoredaId = watch("emergencyWoredaId");
		const rankId = watch("rankId");
		const currentSalaryStep = watch("currentSalaryStep");

		const options = useEmployeeOptions(addressRegionId, addressSubCityId, emergencyRegionId, emergencySubCityId);
		const handlers = useEmployeeFormHandlers(setValue);

		const createMilitaryMutation = useCreateMilitaryEmployee();
		const createCivilianMutation = useCreateCivilianEmployee();
		const createTemporaryMutation = useCreateTemporaryEmployee();

		const isLoading =
			createMilitaryMutation.isPending || createCivilianMutation.isPending || createTemporaryMutation.isPending;

		const handleBack = React.useCallback(() => {
			navigate("/employees/register");
		}, [navigate]);

		const onSubmit = React.useCallback(
			(data: UnifiedEmployeeFormData) => {
				const onSuccess = () => {
					toast.success(tCommon("success"));
					navigate("/employees");
				};

				const onError = (error: unknown) => {
					toast.error(getErrorMessage(error, tCommon("error")));
				};

				if (employeeType === "MILITARY") {
					createMilitaryMutation.mutate(buildMilitaryPayload(data), { onSuccess, onError });
				} else if (employeeType === "CIVILIAN") {
					createCivilianMutation.mutate(buildCivilianPayload(data), { onSuccess, onError });
				} else {
					createTemporaryMutation.mutate(buildTemporaryPayload(data), { onSuccess, onError });
				}
			},
			[employeeType, createMilitaryMutation, createCivilianMutation, createTemporaryMutation, navigate, tCommon],
		);

		return (
			<div className="max-w-4xl mx-auto pb-8">
				<div className="flex items-center gap-4 mb-6">
					<Button variant="ghost" size="icon" onClick={handleBack}>
						<ArrowLeft className="h-5 w-5" />
					</Button>
					<div className="flex items-center gap-3">
						<IconComponent className="h-5 w-5" />
						<h1 className="text-2xl font-bold">{t(config.titleKey)}</h1>
					</div>
				</div>

				<form onSubmit={handleSubmit(onSubmit)}>
					<div className="space-y-0">
						<PersonalInfoSection
							register={register}
							errors={errors}
							gender={gender}
							maritalStatus={maritalStatus ?? ""}
							onGenderChange={handlers.handleGenderChange}
							onMaritalStatusChange={handlers.handleMaritalStatusChange}
							t={t}
							isFirst
						/>
						<PhysicalInfoSection
							register={register}
							bloodType={bloodType ?? ""}
							onBloodTypeChange={handlers.handleBloodTypeChange}
							t={t}
						/>
						<IdentificationSection register={register} t={t} />
						<ContactInfoSection register={register} errors={errors} t={t} />
						<AddressSection
							register={register}
							addressRegionId={addressRegionId}
							addressSubCityId={addressSubCityId}
							addressWoredaId={addressWoredaId}
							regionOptions={options.regionOptions}
							subCityOptions={options.subCityOptions}
							woredaOptions={options.woredaOptions}
							onRegionChange={handlers.handleRegionChange}
							onSubCityChange={handlers.handleSubCityChange}
							onWoredaChange={handlers.handleWoredaChange}
							t={t}
						/>
						<MotherInfoSection
							register={register}
							errors={errors}
							motherIsAlive={motherIsAlive ?? true}
							onMotherIsAliveChange={handlers.handleMotherAliveChange}
							t={t}
						/>
						<EmergencyContactSection
							register={register}
							errors={errors}
							emergencyRelationship={emergencyRelationship ?? ""}
							emergencyRegionId={emergencyRegionId ?? ""}
							emergencySubCityId={emergencySubCityId ?? ""}
							emergencyWoredaId={emergencyWoredaId ?? ""}
							regionOptions={options.regionOptions}
							emergencySubCityOptions={options.emergencySubCityOptions}
							emergencyWoredaOptions={options.emergencyWoredaOptions}
							onRelationshipChange={handlers.handleRelationshipChange}
							onEmergencyRegionChange={handlers.handleEmergencyRegionChange}
							onEmergencySubCityChange={handlers.handleEmergencySubCityChange}
							onEmergencyWoredaChange={handlers.handleEmergencyWoredaChange}
							t={t}
						/>
						<EmploymentInfoSection
							register={register}
							errors={errors}
							centerId={centerId ?? ""}
							departmentId={departmentId ?? ""}
							positionId={positionId ?? ""}
							workScheduleType={workScheduleType ?? "REGULAR"}
							isTransfer={isTransfer ?? false}
							centerOptions={options.centerOptions}
							departmentOptions={options.departmentOptions}
							positionOptions={options.positionOptions}
							onCenterChange={handlers.handleCenterChange}
							onDepartmentChange={handlers.handleDepartmentChange}
							onPositionChange={handlers.handlePositionChange}
							onWorkScheduleChange={handlers.handleWorkScheduleChange}
							onIsTransferChange={handlers.handleTransferChange}
							t={t}
						/>
						{employeeType === "MILITARY" && (
							<MilitarySpecificSection
								register={register}
								errors={errors}
								rankId={rankId ?? ""}
								currentSalaryStep={currentSalaryStep ?? 0}
								rankOptions={options.rankOptions}
								onRankChange={handlers.handleRankChange}
								onSalaryStepChange={handlers.handleSalaryStepChange}
								t={t}
							/>
						)}
						{employeeType === "CIVILIAN" && <CivilianSpecificSection register={register} t={t} />}
						{employeeType === "TEMPORARY" && <TemporarySpecificSection register={register} errors={errors} t={t} />}
						<BoardingPassSection title="" isLast>
							<div className="flex justify-end gap-4 pt-4">
								<Button type="button" variant="outline" onClick={handleBack} disabled={isLoading}>
									{tCommon("cancel")}
								</Button>
								<Button type="submit" disabled={isLoading}>
									{isLoading ? (
										<>
											<Loader2 className="mr-2 h-4 w-4 animate-spin" />
											{t("submitting")}
										</>
									) : (
										<>
											<Save className="mr-2 h-4 w-4" />
											{t("submit")}
										</>
									)}
								</Button>
							</div>
						</BoardingPassSection>
					</div>
				</form>
			</div>
		);
	},
	() => true,
);

EmployeeRegisterFormPage.displayName = "EmployeeRegisterFormPage";
