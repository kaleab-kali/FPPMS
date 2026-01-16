import { zodResolver } from "@hookform/resolvers/zod";
import * as React from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import { useCreateWeapon } from "#web/api/weapons/weapons.mutations";
import { useWeaponCategories, useWeaponTypes } from "#web/api/weapons/weapons.queries";
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

const weaponSchema = z.object({
	weaponTypeId: z.string().min(1, "Weapon type is required"),
	serialNumber: z.string().min(1, "Serial number is required"),
	registrationNumber: z.string().optional(),
	manufactureYear: z.preprocess(
		(val) => (val === "" || val === undefined || val === null ? undefined : Number(val)),
		z.number().optional(),
	),
	condition: z.enum(["EXCELLENT", "GOOD", "FAIR", "POOR", "UNSERVICEABLE"]),
	remarks: z.string().optional(),
});

interface WeaponFormData {
	weaponTypeId: string;
	serialNumber: string;
	registrationNumber?: string;
	manufactureYear?: number;
	condition: "EXCELLENT" | "GOOD" | "FAIR" | "POOR" | "UNSERVICEABLE";
	remarks?: string;
}

interface WeaponFormDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSuccess?: () => void;
}

const WeaponFormDialogComponent = ({ open, onOpenChange, onSuccess }: WeaponFormDialogProps): React.ReactElement => {
	const { t } = useTranslation(["weapons", "common"]);
	const { i18n } = useTranslation();
	const isAmharic = i18n.language === "am";

	const [selectedCategoryId, setSelectedCategoryId] = React.useState<string>("");

	const { data: categories } = useWeaponCategories({ isActive: true });
	const { data: weaponTypes } = useWeaponTypes({ categoryId: selectedCategoryId || undefined, isActive: true });
	const createWeapon = useCreateWeapon();

	const form = useForm<WeaponFormData>({
		resolver: zodResolver(weaponSchema) as never,
		defaultValues: {
			weaponTypeId: "",
			serialNumber: "",
			registrationNumber: "",
			condition: "GOOD",
			remarks: "",
		},
	});

	const handleSubmit = React.useCallback(
		async (data: WeaponFormData) => {
			await createWeapon.mutateAsync({
				weaponTypeId: data.weaponTypeId,
				serialNumber: data.serialNumber,
				registrationNumber: data.registrationNumber || undefined,
				manufactureYear: data.manufactureYear || undefined,
				condition: data.condition as WeaponCondition,
				remarks: data.remarks || undefined,
			});
			form.reset();
			setSelectedCategoryId("");
			onOpenChange(false);
			onSuccess?.();
		},
		[createWeapon, form, onOpenChange, onSuccess],
	);

	const handleClose = React.useCallback(() => {
		form.reset();
		setSelectedCategoryId("");
		onOpenChange(false);
	}, [form, onOpenChange]);

	const conditions: WeaponCondition[] = ["EXCELLENT", "GOOD", "FAIR", "POOR", "UNSERVICEABLE"];

	return (
		<Dialog open={open} onOpenChange={handleClose}>
			<DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>{t("weapons:registerWeapon")}</DialogTitle>
					<DialogDescription>{t("weapons:description")}</DialogDescription>
				</DialogHeader>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
						<div className="grid grid-cols-3 gap-4">
							<div className="space-y-2">
								<FormLabel>{t("weapons:category")}</FormLabel>
								<Select value={selectedCategoryId} onValueChange={setSelectedCategoryId}>
									<SelectTrigger>
										<SelectValue placeholder={t("weapons:category")} />
									</SelectTrigger>
									<SelectContent>
										{categories?.map((cat) => (
											<SelectItem key={cat.id} value={cat.id}>
												{isAmharic && cat.nameAm ? cat.nameAm : cat.name}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>

							<FormField
								control={form.control}
								name="weaponTypeId"
								render={({ field }) => (
									<FormItem>
										<FormLabel>{t("weapons:type")}</FormLabel>
										<Select onValueChange={field.onChange} value={field.value} disabled={!selectedCategoryId}>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder={t("weapons:type")} />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												{weaponTypes?.map((type) => (
													<SelectItem key={type.id} value={type.id}>
														{isAmharic && type.nameAm ? type.nameAm : type.name} ({type.caliber})
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
								name="serialNumber"
								render={({ field }) => (
									<FormItem>
										<FormLabel>{t("weapons:serialNumber")}</FormLabel>
										<FormControl>
											<Input {...field} placeholder="e.g., ABC123456" />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="registrationNumber"
								render={({ field }) => (
									<FormItem>
										<FormLabel>{t("weapons:registrationNumber")}</FormLabel>
										<FormControl>
											<Input {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="manufactureYear"
								render={({ field }) => (
									<FormItem>
										<FormLabel>{t("weapons:manufactureYear")}</FormLabel>
										<FormControl>
											<Input type="number" {...field} placeholder="e.g., 2020" />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="condition"
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
							<Button type="submit" disabled={createWeapon.isPending}>
								{createWeapon.isPending ? t("common:saving") : t("common:save")}
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
};

WeaponFormDialogComponent.displayName = "WeaponFormDialog";

export const WeaponFormDialog = React.memo(
	WeaponFormDialogComponent,
	(prevProps, nextProps) => prevProps.open === nextProps.open,
);
