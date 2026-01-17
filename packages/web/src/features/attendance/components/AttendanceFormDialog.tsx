import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useShifts } from "#web/api/attendance/shifts.queries.ts";
import { EmployeeSearch } from "#web/components/common/EmployeeSearch.tsx";
import { Button } from "#web/components/ui/button.tsx";
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
import { Textarea } from "#web/components/ui/textarea.tsx";
import {
	type AttendanceRecordFormData,
	attendanceRecordSchema,
} from "#web/features/attendance/schemas/attendance.schema.ts";
import type {
	AttendanceRecord,
	CreateAttendanceRecordRequest,
	UpdateAttendanceRecordRequest,
} from "#web/types/attendance.ts";
import { ATTENDANCE_STATUS, CLOCK_METHOD } from "#web/types/attendance.ts";
import type { Employee } from "#web/types/employee.ts";

const NONE_VALUE = "__none__";

interface AttendanceFormDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSubmit: (data: CreateAttendanceRecordRequest | UpdateAttendanceRecordRequest) => void;
	attendance?: AttendanceRecord;
	isLoading?: boolean;
}

export const AttendanceFormDialog = React.memo(
	({ open, onOpenChange, onSubmit, attendance, isLoading = false }: AttendanceFormDialogProps) => {
		const { t } = useTranslation("attendance");
		const { t: tCommon } = useTranslation("common");
		const isEditing = !!attendance;

		const [selectedEmployee, setSelectedEmployee] = React.useState<Employee | null>(null);

		const { data: shiftsData } = useShifts();
		const shifts = shiftsData ?? [];

		const {
			register,
			handleSubmit,
			reset,
			setValue,
			watch,
			formState: { errors },
		} = useForm<AttendanceRecordFormData>({
			resolver: zodResolver(attendanceRecordSchema),
			defaultValues: {
				employeeId: "",
				attendanceDate: new Date().toISOString().split("T")[0],
				shiftId: "",
				clockIn: "",
				clockOut: "",
				status: ATTENDANCE_STATUS.PRESENT,
				lateMinutes: 0,
				remarks: "",
			},
		});

		const status = watch("status");
		const shiftId = watch("shiftId");

		React.useEffect(() => {
			if (attendance) {
				reset({
					employeeId: attendance.employeeId,
					attendanceDate: attendance.attendanceDate,
					shiftId: attendance.shiftId ?? "",
					clockIn: attendance.clockIn ?? "",
					clockOut: attendance.clockOut ?? "",
					clockInMethod: attendance.clockInMethod as (typeof CLOCK_METHOD)[keyof typeof CLOCK_METHOD] | undefined,
					clockOutMethod: attendance.clockOutMethod as (typeof CLOCK_METHOD)[keyof typeof CLOCK_METHOD] | undefined,
					status: attendance.status,
					lateMinutes: attendance.lateMinutes ?? 0,
					remarks: attendance.remarks ?? "",
				});
			} else {
				reset({
					employeeId: "",
					attendanceDate: new Date().toISOString().split("T")[0],
					shiftId: "",
					clockIn: "",
					clockOut: "",
					status: ATTENDANCE_STATUS.PRESENT,
					lateMinutes: 0,
					remarks: "",
				});
				setSelectedEmployee(null);
			}
		}, [attendance, reset]);

		const convertTimeToISO = React.useCallback((date: string, time: string | undefined): string | undefined => {
			if (!time) return undefined;
			return `${date}T${time}:00.000Z`;
		}, []);

		const handleFormSubmit = React.useCallback(
			(formData: AttendanceRecordFormData) => {
				const clockInISO = convertTimeToISO(formData.attendanceDate, formData.clockIn);
				const clockOutISO = convertTimeToISO(formData.attendanceDate, formData.clockOut);

				if (isEditing) {
					const updatePayload: UpdateAttendanceRecordRequest = {
						shiftId: formData.shiftId === NONE_VALUE || formData.shiftId === "" ? undefined : formData.shiftId,
						clockIn: clockInISO,
						clockOut: clockOutISO,
						clockInMethod: formData.clockInMethod,
						clockOutMethod: formData.clockOutMethod,
						status: formData.status,
						lateMinutes: formData.lateMinutes,
						remarks: formData.remarks || undefined,
					};
					onSubmit(updatePayload);
				} else {
					const createPayload: CreateAttendanceRecordRequest = {
						employeeId: formData.employeeId,
						attendanceDate: formData.attendanceDate,
						shiftId: formData.shiftId === NONE_VALUE || formData.shiftId === "" ? undefined : formData.shiftId,
						clockIn: clockInISO,
						clockOut: clockOutISO,
						clockInMethod: formData.clockInMethod,
						clockOutMethod: formData.clockOutMethod,
						status: formData.status,
						lateMinutes: formData.lateMinutes,
						remarks: formData.remarks || undefined,
					};
					onSubmit(createPayload);
				}
			},
			[onSubmit, isEditing, convertTimeToISO],
		);

		const handleEmployeeFound = React.useCallback(
			(employee: Employee) => {
				setSelectedEmployee(employee);
				setValue("employeeId", employee.id);
			},
			[setValue],
		);

		const handleEmployeeClear = React.useCallback(() => {
			setSelectedEmployee(null);
			setValue("employeeId", "");
		}, [setValue]);

		const handleStatusChange = React.useCallback(
			(value: string) => {
				setValue("status", value as (typeof ATTENDANCE_STATUS)[keyof typeof ATTENDANCE_STATUS]);
			},
			[setValue],
		);

		const handleShiftChange = React.useCallback(
			(value: string) => {
				setValue("shiftId", value === NONE_VALUE ? "" : value);
			},
			[setValue],
		);

		const handleClockInMethodChange = React.useCallback(
			(value: string) => {
				setValue(
					"clockInMethod",
					value === NONE_VALUE ? undefined : (value as (typeof CLOCK_METHOD)[keyof typeof CLOCK_METHOD]),
				);
			},
			[setValue],
		);

		const handleClockOutMethodChange = React.useCallback(
			(value: string) => {
				setValue(
					"clockOutMethod",
					value === NONE_VALUE ? undefined : (value as (typeof CLOCK_METHOD)[keyof typeof CLOCK_METHOD]),
				);
			},
			[setValue],
		);

		return (
			<Dialog open={open} onOpenChange={onOpenChange}>
				<DialogContent className="max-w-[90vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle>{isEditing ? t("editRecord") : t("createRecord")}</DialogTitle>
						<DialogDescription>
							{isEditing ? tCommon("edit") : tCommon("create")} {t("attendanceRecord").toLowerCase()}
						</DialogDescription>
					</DialogHeader>
					<form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
						{!isEditing && (
							<EmployeeSearch
								onEmployeeFound={handleEmployeeFound}
								onClear={handleEmployeeClear}
								selectedEmployee={selectedEmployee}
							/>
						)}

						{errors.employeeId && !selectedEmployee && (
							<p className="text-sm text-destructive">{errors.employeeId.message}</p>
						)}

						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
							<div className="space-y-2">
								<Label htmlFor="attendanceDate">{t("date")}</Label>
								<Input
									id="attendanceDate"
									type="date"
									{...register("attendanceDate")}
									disabled={isEditing}
									aria-invalid={!!errors.attendanceDate}
								/>
								{errors.attendanceDate && <p className="text-sm text-destructive">{errors.attendanceDate.message}</p>}
							</div>

							<div className="space-y-2">
								<Label htmlFor="status">{t("status.label")}</Label>
								<Select value={status} onValueChange={handleStatusChange}>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										{Object.values(ATTENDANCE_STATUS).map((statusValue) => (
											<SelectItem key={statusValue} value={statusValue}>
												{t(`status.${statusValue.toLowerCase()}`)}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
						</div>

						<div className="space-y-2">
							<Label htmlFor="shiftId">{t("shift")}</Label>
							<Select value={shiftId || NONE_VALUE} onValueChange={handleShiftChange}>
								<SelectTrigger>
									<SelectValue placeholder={t("selectShift")} />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value={NONE_VALUE}>{tCommon("none")}</SelectItem>
									{shifts.map((shift) => (
										<SelectItem key={shift.id} value={shift.id}>
											{shift.name} ({shift.code})
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
							<div className="space-y-2">
								<Label htmlFor="clockIn">{t("clockIn")}</Label>
								<Input id="clockIn" type="time" {...register("clockIn")} />
							</div>

							<div className="space-y-2">
								<Label htmlFor="clockOut">{t("clockOut")}</Label>
								<Input id="clockOut" type="time" {...register("clockOut")} />
							</div>
						</div>

						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
							<div className="space-y-2">
								<Label htmlFor="clockInMethod">{t("clockInMethod")}</Label>
								<Select onValueChange={handleClockInMethodChange}>
									<SelectTrigger>
										<SelectValue placeholder={tCommon("select")} />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value={NONE_VALUE}>{tCommon("none")}</SelectItem>
										{Object.values(CLOCK_METHOD).map((method) => (
											<SelectItem key={method} value={method}>
												{t(`clockMethod.${method.toLowerCase()}`)}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>

							<div className="space-y-2">
								<Label htmlFor="clockOutMethod">{t("clockOutMethod")}</Label>
								<Select onValueChange={handleClockOutMethodChange}>
									<SelectTrigger>
										<SelectValue placeholder={tCommon("select")} />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value={NONE_VALUE}>{tCommon("none")}</SelectItem>
										{Object.values(CLOCK_METHOD).map((method) => (
											<SelectItem key={method} value={method}>
												{t(`clockMethod.${method.toLowerCase()}`)}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
						</div>

						<div className="space-y-2">
							<Label htmlFor="lateMinutes">{t("lateMinutes")}</Label>
							<Input id="lateMinutes" type="number" min={0} {...register("lateMinutes", { valueAsNumber: true })} />
						</div>

						<div className="space-y-2">
							<Label htmlFor="remarks">{t("remarks")}</Label>
							<Textarea id="remarks" {...register("remarks")} rows={2} />
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
		prevProps.attendance?.id === nextProps.attendance?.id &&
		prevProps.isLoading === nextProps.isLoading,
);

AttendanceFormDialog.displayName = "AttendanceFormDialog";
