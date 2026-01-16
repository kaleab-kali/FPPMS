import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import * as React from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import { useAssignWeapon } from "#web/api/weapons/weapons.mutations";
import { useWeapons } from "#web/api/weapons/weapons.queries";
import { EmployeeSearch } from "#web/components/common/EmployeeSearch";
import { Button } from "#web/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "#web/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "#web/components/ui/form";
import { Input } from "#web/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "#web/components/ui/select";
import { Textarea } from "#web/components/ui/textarea";
import type { WeaponCondition } from "#web/types/weapons";

const assignmentSchema = z.object({
	weaponId: z.string().min(1, "Weapon is required"),
	employeeId: z.string().min(1, "Employee is required"),
	assignedDate: z.string().min(1, "Assigned date is required"),
	conditionAtAssignment: z.enum(["EXCELLENT", "GOOD", "FAIR", "POOR", "UNSERVICEABLE"]),
	issuedRounds: z.coerce.number().optional(),
	purpose: z.string().optional(),
	remarks: z.string().optional(),
});

type AssignmentFormData = z.infer<typeof assignmentSchema>;

interface WeaponAssignmentDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSuccess?: () => void;
}

const WeaponAssignmentDialogComponent = ({
	open,
	onOpenChange,
	onSuccess,
}: WeaponAssignmentDialogProps): React.ReactElement => {
	const { t } = useTranslation(["weapons", "common"]);
	const { i18n } = useTranslation();
	const isAmharic = i18n.language === "am";

	const { data: availableWeapons } = useWeapons({ status: "IN_SERVICE", limit: 100 });
	const assignWeapon = useAssignWeapon();

	const form = useForm<AssignmentFormData>({
		resolver: zodResolver(assignmentSchema),
		defaultValues: {
			weaponId: "",
			employeeId: "",
			assignedDate: format(new Date(), "yyyy-MM-dd"),
			conditionAtAssignment: "GOOD",
			issuedRounds: undefined,
			purpose: "",
			remarks: "",
		},
	});

	const handleSubmit = React.useCallback(
		async (data: AssignmentFormData) => {
			await assignWeapon.mutateAsync({
				weaponId: data.weaponId,
				employeeId: data.employeeId,
				assignedDate: data.assignedDate,
				conditionAtAssignment: data.conditionAtAssignment as WeaponCondition,
				issuedRounds: data.issuedRounds || undefined,
				purpose: data.purpose || undefined,
				remarks: data.remarks || undefined,
			});
			form.reset();
			onOpenChange(false);
			onSuccess?.();
		},
		[assignWeapon, form, onOpenChange, onSuccess],
	);

	const handleClose = React.useCallback(() => {
		form.reset();
		onOpenChange(false);
	}, [form, onOpenChange]);

	const handleEmployeeSelect = React.useCallback(
		(employee: { id: string } | null) => {
			form.setValue("employeeId", employee?.id ?? "");
		},
		[form],
	);

	const conditions: WeaponCondition[] = ["EXCELLENT", "GOOD", "FAIR", "POOR", "UNSERVICEABLE"];

	return (
		<Dialog open={open} onOpenChange={handleClose}>
			<DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>{t("weapons:assignWeapon")}</DialogTitle>
					<DialogDescription>{t("weapons:assignmentsDescription")}</DialogDescription>
				</DialogHeader>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
						<div className="grid grid-cols-3 gap-4">
							<FormField
								control={form.control}
								name="weaponId"
								render={({ field }) => (
									<FormItem>
										<FormLabel>{t("weapons:selectWeapon")}</FormLabel>
										<Select onValueChange={field.onChange} value={field.value}>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder={t("weapons:selectWeapon")} />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												{availableWeapons?.data?.map((weapon) => (
													<SelectItem key={weapon.id} value={weapon.id}>
														{weapon.serialNumber} -{" "}
														{isAmharic && weapon.weaponTypeNameAm ? weapon.weaponTypeNameAm : weapon.weaponTypeName}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="assignedDate"
								render={({ field }) => (
									<FormItem>
										<FormLabel>{t("weapons:assignedDate")}</FormLabel>
										<FormControl>
											<Input type="date" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="conditionAtAssignment"
								render={({ field }) => (
									<FormItem>
										<FormLabel>{t("weapons:condition")}</FormLabel>
										<Select onValueChange={field.onChange} value={field.value}>
											<FormControl>
												<SelectTrigger>
													<SelectValue />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												{conditions.map((cond) => (
													<SelectItem key={cond} value={cond}>
														{t(`weapons:conditions.${cond}`)}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="employeeId"
								render={() => (
									<FormItem>
										<FormLabel>{t("weapons:assignedTo")}</FormLabel>
										<FormControl>
											<EmployeeSearch onSelect={handleEmployeeSelect} placeholder={t("weapons:searchEmployee")} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="issuedRounds"
								render={({ field }) => (
									<FormItem>
										<FormLabel>{t("weapons:issuedRounds")}</FormLabel>
										<FormControl>
											<Input type="number" {...field} placeholder="0" />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="purpose"
								render={({ field }) => (
									<FormItem>
										<FormLabel>{t("weapons:purpose")}</FormLabel>
										<FormControl>
											<Input {...field} placeholder={t("weapons:purposePlaceholder")} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						<FormField
							control={form.control}
							name="remarks"
							render={({ field }) => (
								<FormItem>
									<FormLabel>{t("weapons:remarks")}</FormLabel>
									<FormControl>
										<Textarea {...field} rows={2} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<DialogFooter>
							<Button type="button" variant="outline" onClick={handleClose}>
								{t("common:cancel")}
							</Button>
							<Button type="submit" disabled={assignWeapon.isPending}>
								{assignWeapon.isPending ? t("common:saving") : t("common:save")}
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
};

WeaponAssignmentDialogComponent.displayName = "WeaponAssignmentDialog";

export const WeaponAssignmentDialog = React.memo(
	WeaponAssignmentDialogComponent,
	(prevProps, nextProps) => prevProps.open === nextProps.open,
);
