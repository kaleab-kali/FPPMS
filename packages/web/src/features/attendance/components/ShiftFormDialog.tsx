import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Button } from "#web/components/ui/button.tsx";
import { Checkbox } from "#web/components/ui/checkbox.tsx";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "#web/components/ui/dialog.tsx";
import { Input } from "#web/components/ui/input.tsx";
import { Label } from "#web/components/ui/label.tsx";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "#web/components/ui/select.tsx";
import { type ShiftDefinitionFormData, shiftDefinitionSchema } from "#web/features/attendance/schemas/shift.schema.ts";
import type {
	CreateShiftDefinitionRequest,
	ShiftDefinition,
	UpdateShiftDefinitionRequest,
} from "#web/types/attendance.ts";
import { WORK_SCHEDULE_TYPE } from "#web/types/attendance.ts";

interface ShiftFormDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSubmit: (data: CreateShiftDefinitionRequest | UpdateShiftDefinitionRequest) => void;
	shift?: ShiftDefinition;
	isLoading?: boolean;
}

export const ShiftFormDialog = React.memo(
	({ open, onOpenChange, onSubmit, shift, isLoading = false }: ShiftFormDialogProps) => {
		const { t } = useTranslation("attendance");
		const { t: tCommon } = useTranslation("common");
		const isEditing = !!shift;

		const {
			register,
			handleSubmit,
			reset,
			setValue,
			watch,
			formState: { errors },
		} = useForm<ShiftDefinitionFormData>({
			resolver: zodResolver(shiftDefinitionSchema),
			defaultValues: {
				code: "",
				name: "",
				nameAm: "",
				scheduleType: WORK_SCHEDULE_TYPE.REGULAR,
				startTime: "08:00",
				endTime: "17:00",
				isOvernight: false,
				breakMinutes: 60,
				holidayAware: true,
				color: "#3b82f6",
				isActive: true,
			},
		});

		const isActive = watch("isActive");
		const isOvernight = watch("isOvernight");
		const holidayAware = watch("holidayAware");
		const scheduleType = watch("scheduleType");

		React.useEffect(() => {
			if (shift) {
				reset({
					code: shift.code,
					name: shift.name,
					nameAm: shift.nameAm ?? "",
					scheduleType: shift.scheduleType,
					startTime: shift.startTime,
					endTime: shift.endTime,
					isOvernight: shift.isOvernight,
					breakMinutes: shift.breakMinutes,
					holidayAware: shift.holidayAware,
					color: shift.color ?? "#3b82f6",
					isActive: shift.isActive,
				});
			} else {
				reset({
					code: "",
					name: "",
					nameAm: "",
					scheduleType: WORK_SCHEDULE_TYPE.REGULAR,
					startTime: "08:00",
					endTime: "17:00",
					isOvernight: false,
					breakMinutes: 60,
					holidayAware: true,
					color: "#3b82f6",
					isActive: true,
				});
			}
		}, [shift, reset]);

		const handleFormSubmit = React.useCallback(
			(formData: ShiftDefinitionFormData) => {
				if (isEditing) {
					const updatePayload: UpdateShiftDefinitionRequest = {
						name: formData.name,
						nameAm: formData.nameAm || undefined,
						scheduleType: formData.scheduleType,
						startTime: formData.startTime,
						endTime: formData.endTime,
						isOvernight: formData.isOvernight,
						breakMinutes: formData.breakMinutes,
						holidayAware: formData.holidayAware,
						color: formData.color || undefined,
						isActive: formData.isActive,
					};
					onSubmit(updatePayload);
				} else {
					const createPayload: CreateShiftDefinitionRequest = {
						code: formData.code,
						name: formData.name,
						nameAm: formData.nameAm || undefined,
						scheduleType: formData.scheduleType,
						startTime: formData.startTime,
						endTime: formData.endTime,
						isOvernight: formData.isOvernight,
						breakMinutes: formData.breakMinutes,
						holidayAware: formData.holidayAware,
						color: formData.color || undefined,
						isActive: formData.isActive,
					};
					onSubmit(createPayload);
				}
			},
			[onSubmit, isEditing],
		);

		const handleActiveChange = React.useCallback(
			(checked: boolean) => {
				setValue("isActive", checked);
			},
			[setValue],
		);

		const handleOvernightChange = React.useCallback(
			(checked: boolean) => {
				setValue("isOvernight", checked);
			},
			[setValue],
		);

		const handleHolidayAwareChange = React.useCallback(
			(checked: boolean) => {
				setValue("holidayAware", checked);
			},
			[setValue],
		);

		const handleScheduleTypeChange = React.useCallback(
			(value: string) => {
				setValue("scheduleType", value as (typeof WORK_SCHEDULE_TYPE)[keyof typeof WORK_SCHEDULE_TYPE]);
			},
			[setValue],
		);

		return (
			<Dialog open={open} onOpenChange={onOpenChange}>
				<DialogContent className="max-w-[90vw] sm:max-w-lg max-h-[90vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle>{isEditing ? t("editShift") : t("createShift")}</DialogTitle>
						<DialogDescription>
							{isEditing ? tCommon("edit") : tCommon("create")} {t("shift").toLowerCase()}
						</DialogDescription>
					</DialogHeader>
					<form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
							<div className="space-y-2">
								<Label htmlFor="code">{t("shiftCode")}</Label>
								<Input id="code" {...register("code")} disabled={isEditing} aria-invalid={!!errors.code} />
								{errors.code && <p className="text-sm text-destructive">{errors.code.message}</p>}
							</div>

							<div className="space-y-2">
								<Label htmlFor="name">{t("shiftName")}</Label>
								<Input id="name" {...register("name")} aria-invalid={!!errors.name} />
								{errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
							</div>
						</div>

						<div className="space-y-2">
							<Label htmlFor="nameAm">{t("shiftNameAm")}</Label>
							<Input id="nameAm" {...register("nameAm")} />
						</div>

						<div className="space-y-2">
							<Label htmlFor="scheduleType">{t("scheduleType")}</Label>
							<Select value={scheduleType} onValueChange={handleScheduleTypeChange}>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{Object.values(WORK_SCHEDULE_TYPE).map((type) => (
										<SelectItem key={type} value={type}>
											{t(`scheduleTypes.${type.toLowerCase()}`)}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
							<div className="space-y-2">
								<Label htmlFor="startTime">{t("startTime")}</Label>
								<Input id="startTime" type="time" {...register("startTime")} aria-invalid={!!errors.startTime} />
								{errors.startTime && <p className="text-sm text-destructive">{errors.startTime.message}</p>}
							</div>

							<div className="space-y-2">
								<Label htmlFor="endTime">{t("endTime")}</Label>
								<Input id="endTime" type="time" {...register("endTime")} aria-invalid={!!errors.endTime} />
								{errors.endTime && <p className="text-sm text-destructive">{errors.endTime.message}</p>}
							</div>
						</div>

						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
							<div className="space-y-2">
								<Label htmlFor="breakMinutes">{t("breakMinutes")}</Label>
								<Input id="breakMinutes" type="number" min={0} {...register("breakMinutes", { valueAsNumber: true })} />
							</div>

							<div className="space-y-2">
								<Label htmlFor="color">{t("color")}</Label>
								<Input id="color" type="color" {...register("color")} />
							</div>
						</div>

						<div className="space-y-3">
							<div className="flex items-center space-x-2">
								<Checkbox id="isOvernight" checked={isOvernight} onCheckedChange={handleOvernightChange} />
								<Label htmlFor="isOvernight" className="cursor-pointer">
									{t("isOvernight")}
								</Label>
							</div>

							<div className="flex items-center space-x-2">
								<Checkbox id="holidayAware" checked={holidayAware} onCheckedChange={handleHolidayAwareChange} />
								<Label htmlFor="holidayAware" className="cursor-pointer">
									{t("holidayAware")}
								</Label>
							</div>

							<div className="flex items-center space-x-2">
								<Checkbox id="isActive" checked={isActive} onCheckedChange={handleActiveChange} />
								<Label htmlFor="isActive" className="cursor-pointer">
									{t("isActive")}
								</Label>
							</div>
						</div>

						<DialogFooter className="flex-col gap-2 sm:flex-row">
							<Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
								{tCommon("cancel")}
							</Button>
							<Button type="submit" disabled={isLoading}>
								{isLoading ? tCommon("loading") : tCommon("save")}
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>
		);
	},
	(prevProps, nextProps) =>
		prevProps.open === nextProps.open &&
		prevProps.shift?.id === nextProps.shift?.id &&
		prevProps.isLoading === nextProps.isLoading,
);

ShiftFormDialog.displayName = "ShiftFormDialog";
