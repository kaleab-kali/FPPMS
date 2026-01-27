import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Briefcase, Calendar, Loader2, Save, Shield } from "lucide-react";
import React from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { useUpdateEmployee } from "#web/api/employees/employees.mutations.ts";
import { useEmployee } from "#web/api/employees/employees.queries.ts";
import { Button } from "#web/components/ui/button.tsx";
import { Skeleton } from "#web/components/ui/skeleton.tsx";
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
	type UnifiedEmployeeFormData,
	unifiedEmployeeFormSchema,
} from "#web/features/employees/schemas/unified-employee-schema.ts";
import { buildUpdatePayload, mapEmployeeToFormData } from "#web/features/employees/utils/form-mappers.ts";
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

const EMPLOYEE_TYPE_ICONS = {
	MILITARY: Shield,
	CIVILIAN: Briefcase,
	TEMPORARY: Calendar,
} as const;

const LoadingSkeleton = React.memo(() => (
	<div className="max-w-4xl mx-auto pb-8 space-y-6">
		<div className="flex items-center gap-4">
			<Skeleton className="h-10 w-10" />
			<Skeleton className="h-8 w-48" />
		</div>
		<Skeleton className="h-64" />
		<Skeleton className="h-48" />
		<Skeleton className="h-48" />
	</div>
));

LoadingSkeleton.displayName = "LoadingSkeleton";

export const EmployeeEditPage = React.memo(() => {
	const { id } = useParams<{ id: string }>();
	const { t } = useTranslation("employees");
	const { t: tCommon } = useTranslation("common");
	const navigate = useNavigate();

	const { data: employee, isLoading: isLoadingEmployee } = useEmployee(id ?? "");
	const updateMutation = useUpdateEmployee();

	const defaultValues = React.useMemo(() => (employee ? mapEmployeeToFormData(employee) : undefined), [employee]);

	const {
		register,
		handleSubmit,
		setValue,
		watch,
		reset,
		formState: { errors },
	} = useForm<UnifiedEmployeeFormData>({
		resolver: zodResolver(unifiedEmployeeFormSchema),
		defaultValues,
	});

	React.useEffect(() => {
		if (employee) {
			reset(mapEmployeeToFormData(employee));
		}
	}, [employee, reset]);

	const gender = watch("gender");
	const maritalStatus = watch("maritalStatus");
	const centerId = watch("centerId");
	const departmentId = watch("departmentId");
	const positionId = watch("positionId");
	const bloodType = watch("bloodType");
	const workScheduleType = watch("workScheduleType");
	const isTransfer = watch("isTransfer");
	const motherIsAlive = watch("motherIsAlive");
	const rankId = watch("rankId");
	const currentSalaryStep = watch("currentSalaryStep");

	const addressRegionId = watch("addressRegionId") || employee?.addressRegionId;
	const addressSubCityId = watch("addressSubCityId") || employee?.addressSubCityId;
	const addressWoredaId = watch("addressWoredaId");
	const emergencyRegionId = watch("emergencyRegionId") || employee?.emergencyRegionId;
	const emergencySubCityId = watch("emergencySubCityId") || employee?.emergencySubCityId;
	const emergencyRelationship = watch("emergencyRelationship");
	const emergencyWoredaId = watch("emergencyWoredaId");

	const options = useEmployeeOptions(addressRegionId, addressSubCityId, emergencyRegionId, emergencySubCityId);
	const handlers = useEmployeeFormHandlers(setValue);

	const handleBack = React.useCallback(() => {
		navigate(`/employees/${id}`);
	}, [navigate, id]);

	const onSubmit = React.useCallback(
		(data: UnifiedEmployeeFormData) => {
			if (!id) return;

			const cleanData = buildUpdatePayload(data);
			updateMutation.mutate(
				{ id, data: cleanData },
				{
					onSuccess: () => {
						toast.success(tCommon("success"));
						navigate(`/employees/${id}`);
					},
					onError: (error) => {
						toast.error(getErrorMessage(error, tCommon("error")));
					},
				},
			);
		},
		[id, updateMutation, navigate, tCommon],
	);

	if (isLoadingEmployee) {
		return <LoadingSkeleton />;
	}

	if (!employee) {
		return (
			<div className="flex flex-col items-center justify-center py-12 space-y-4">
				<p className="text-destructive text-lg">{tCommon("error")}</p>
				<Button variant="outline" onClick={() => navigate("/employees")}>
					<ArrowLeft className="mr-2 h-4 w-4" />
					{tCommon("back")}
				</Button>
			</div>
		);
	}

	const employeeType = employee.employeeType as EmployeeType;
	const IconComponent = EMPLOYEE_TYPE_ICONS[employeeType];

	return (
		<div className="max-w-4xl mx-auto pb-8">
			<div className="flex items-center gap-4 mb-6">
				<Button variant="ghost" size="icon" onClick={handleBack}>
					<ArrowLeft className="h-5 w-5" />
				</Button>
				<div className="flex items-center gap-3">
					<IconComponent className="h-5 w-5" />
					<div>
						<h1 className="text-2xl font-bold">{t("edit")}</h1>
						<p className="text-sm text-muted-foreground font-mono">{employee.employeeId}</p>
					</div>
				</div>
			</div>

			<form onSubmit={handleSubmit(onSubmit)}>
				<div className="space-y-0">
					<PersonalInfoSection
						register={register}
						errors={errors}
						gender={gender ?? employee.gender}
						maritalStatus={maritalStatus ?? employee.maritalStatus ?? ""}
						onGenderChange={handlers.handleGenderChange}
						onMaritalStatusChange={handlers.handleMaritalStatusChange}
						t={t}
						isFirst
					/>
					<PhysicalInfoSection
						register={register}
						bloodType={bloodType ?? employee.bloodType ?? ""}
						onBloodTypeChange={handlers.handleBloodTypeChange}
						t={t}
					/>
					<IdentificationSection register={register} t={t} />
					<ContactInfoSection register={register} errors={errors} t={t} />
					<AddressSection
						register={register}
						addressRegionId={addressRegionId ?? ""}
						addressSubCityId={addressSubCityId ?? ""}
						addressWoredaId={addressWoredaId ?? employee.addressWoredaId ?? ""}
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
						motherIsAlive={motherIsAlive ?? employee.motherIsAlive ?? true}
						onMotherIsAliveChange={handlers.handleMotherAliveChange}
						t={t}
					/>
					<EmergencyContactSection
						register={register}
						errors={errors}
						emergencyRelationship={emergencyRelationship ?? employee.emergencyRelationship ?? ""}
						emergencyRegionId={emergencyRegionId ?? ""}
						emergencySubCityId={emergencySubCityId ?? ""}
						emergencyWoredaId={emergencyWoredaId ?? employee.emergencyWoredaId ?? ""}
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
						centerId={centerId ?? employee.centerId ?? ""}
						departmentId={departmentId ?? employee.departmentId ?? ""}
						positionId={positionId ?? employee.positionId ?? ""}
						workScheduleType={workScheduleType ?? employee.workScheduleType ?? "REGULAR"}
						isTransfer={isTransfer ?? employee.isTransfer ?? false}
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
							rankId={rankId ?? employee.rankId ?? ""}
							currentSalaryStep={currentSalaryStep ?? employee.currentSalaryStep ?? 0}
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
							<Button type="button" variant="outline" onClick={handleBack} disabled={updateMutation.isPending}>
								{tCommon("cancel")}
							</Button>
							<Button type="submit" disabled={updateMutation.isPending}>
								{updateMutation.isPending ? (
									<>
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										{tCommon("loading")}
									</>
								) : (
									<>
										<Save className="mr-2 h-4 w-4" />
										{tCommon("save")}
									</>
								)}
							</Button>
						</div>
					</BoardingPassSection>
				</div>
			</form>
		</div>
	);
});

EmployeeEditPage.displayName = "EmployeeEditPage";
