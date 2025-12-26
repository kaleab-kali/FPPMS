import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import { useEmployees } from "#web/api/employees/employees.queries.ts";
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
import type { AddCommitteeMemberRequest, CommitteeMemberRole } from "#web/types/committee.ts";

const MEMBER_ROLES: CommitteeMemberRole[] = ["CHAIRMAN", "VICE_CHAIRMAN", "SECRETARY", "MEMBER", "ADVISOR"];

const addMemberSchema = z.object({
	employeeId: z.string().min(1, "Employee is required"),
	role: z.string().min(1, "Role is required"),
	appointedDate: z.string().min(1, "Appointed date is required"),
});

type AddMemberFormData = z.infer<typeof addMemberSchema>;

interface AddMemberDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSubmit: (data: AddCommitteeMemberRequest) => void;
	committeeId: string;
	isLoading?: boolean;
}

export const AddMemberDialog = React.memo(
	({ open, onOpenChange, onSubmit, committeeId: _committeeId, isLoading = false }: AddMemberDialogProps) => {
		const { t } = useTranslation("committees");
		const { t: tCommon } = useTranslation("common");

		const { data: employeesData } = useEmployees({ status: "ACTIVE", page: 1, pageSize: 1000 });
		const employees = employeesData?.data ?? [];

		const {
			register,
			handleSubmit,
			reset,
			setValue,
			watch,
			formState: { errors },
		} = useForm<AddMemberFormData>({
			resolver: zodResolver(addMemberSchema),
			defaultValues: {
				employeeId: "",
				role: "MEMBER",
				appointedDate: new Date().toISOString().split("T")[0],
			},
		});

		const selectedEmployeeId = watch("employeeId");
		const selectedRole = watch("role");

		React.useEffect(() => {
			if (!open) {
				reset({
					employeeId: "",
					role: "MEMBER",
					appointedDate: new Date().toISOString().split("T")[0],
				});
			}
		}, [open, reset]);

		const handleFormSubmit = React.useCallback(
			(formData: AddMemberFormData) => {
				const payload: AddCommitteeMemberRequest = {
					employeeId: formData.employeeId,
					role: formData.role as CommitteeMemberRole,
					appointedDate: formData.appointedDate,
				};
				onSubmit(payload);
			},
			[onSubmit],
		);

		const handleEmployeeChange = React.useCallback(
			(value: string) => {
				setValue("employeeId", value);
			},
			[setValue],
		);

		const handleRoleChange = React.useCallback(
			(value: string) => {
				setValue("role", value);
			},
			[setValue],
		);

		const { i18n } = useTranslation();
		const isAmharic = i18n.language === "am";

		return (
			<Dialog open={open} onOpenChange={onOpenChange}>
				<DialogContent className="max-w-[90vw] sm:max-w-lg">
					<DialogHeader>
						<DialogTitle>{t("member.add")}</DialogTitle>
						<DialogDescription>{t("member.addDescription")}</DialogDescription>
					</DialogHeader>
					<form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="employeeId">{t("member.selectEmployee")}</Label>
							<Select value={selectedEmployeeId} onValueChange={handleEmployeeChange}>
								<SelectTrigger aria-invalid={!!errors.employeeId}>
									<SelectValue placeholder={t("member.selectEmployeePlaceholder")} />
								</SelectTrigger>
								<SelectContent>
									{employees.map((emp) => {
										const displayName = isAmharic && emp.fullNameAm ? emp.fullNameAm : emp.fullName;
										return (
											<SelectItem key={emp.id} value={emp.id}>
												{emp.employeeId} - {displayName}
											</SelectItem>
										);
									})}
								</SelectContent>
							</Select>
							{errors.employeeId && <p className="text-sm text-destructive">{errors.employeeId.message}</p>}
						</div>

						<div className="space-y-2">
							<Label htmlFor="role">{t("member.role")}</Label>
							<Select value={selectedRole} onValueChange={handleRoleChange}>
								<SelectTrigger aria-invalid={!!errors.role}>
									<SelectValue placeholder={t("member.selectRole")} />
								</SelectTrigger>
								<SelectContent>
									{MEMBER_ROLES.map((role) => (
										<SelectItem key={role} value={role}>
											{t(`role.${role.toLowerCase()}`)}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							{errors.role && <p className="text-sm text-destructive">{errors.role.message}</p>}
						</div>

						<div className="space-y-2">
							<Label htmlFor="appointedDate">{t("member.appointedDate")}</Label>
							<Input
								id="appointedDate"
								type="date"
								{...register("appointedDate")}
								aria-invalid={!!errors.appointedDate}
							/>
							{errors.appointedDate && <p className="text-sm text-destructive">{errors.appointedDate.message}</p>}
						</div>

						<DialogFooter className="flex-col gap-2 sm:flex-row">
							<Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
								{tCommon("cancel")}
							</Button>
							<Button type="submit" disabled={isLoading}>
								{isLoading ? tCommon("loading") : tCommon("add")}
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>
		);
	},
	(prevProps, nextProps) =>
		prevProps.open === nextProps.open &&
		prevProps.committeeId === nextProps.committeeId &&
		prevProps.isLoading === nextProps.isLoading,
);

AddMemberDialog.displayName = "AddMemberDialog";
