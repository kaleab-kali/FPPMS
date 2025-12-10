import { zodResolver } from "@hookform/resolvers/zod";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import { useSubCities } from "#web/api/lookups/sub-cities.queries.ts";
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
import type { CreateWoredaRequest, UpdateWoredaRequest, Woreda } from "#web/types/lookup.ts";

const woredaSchema = z.object({
	subCityId: z.string().min(1, "Sub-city is required"),
	code: z.string().min(1, "Code is required"),
	name: z.string().min(1, "Name is required"),
	nameAm: z.string().min(1, "Amharic name is required"),
	sortOrder: z.number().int().min(0).optional(),
	isActive: z.boolean(),
});

type WoredaFormData = z.infer<typeof woredaSchema>;

interface WoredaFormDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSubmit: (data: CreateWoredaRequest | UpdateWoredaRequest) => void;
	woreda?: Woreda;
	isLoading?: boolean;
}

export const WoredaFormDialog = React.memo(
	({ open, onOpenChange, onSubmit, woreda, isLoading = false }: WoredaFormDialogProps) => {
		const { t } = useTranslation("lookups");
		const { t: tCommon } = useTranslation("common");
		const isEditing = !!woreda;

		const { data: subCitiesData } = useSubCities();
		const subCities = subCitiesData ?? [];

		const {
			register,
			handleSubmit,
			reset,
			setValue,
			watch,
			formState: { errors },
		} = useForm<WoredaFormData>({
			resolver: zodResolver(woredaSchema),
			defaultValues: {
				code: "",
				name: "",
				nameAm: "",
				subCityId: "",
				sortOrder: 0,
				isActive: true,
			},
		});

		const isActive = watch("isActive");
		const subCityId = watch("subCityId");

		useEffect(() => {
			if (woreda) {
				reset({
					code: woreda.code,
					name: woreda.name,
					nameAm: woreda.nameAm ?? "",
					subCityId: woreda.subCityId,
					sortOrder: woreda.sortOrder ?? 0,
					isActive: woreda.isActive,
				});
			} else {
				reset({
					code: "",
					name: "",
					nameAm: "",
					subCityId: "",
					sortOrder: 0,
					isActive: true,
				});
			}
		}, [woreda, reset]);

		const handleFormSubmit = React.useCallback(
			(formData: WoredaFormData) => {
				if (isEditing) {
					const updatePayload: UpdateWoredaRequest = {
						name: formData.name,
						nameAm: formData.nameAm,
						sortOrder: formData.sortOrder,
						isActive: formData.isActive,
					};
					onSubmit(updatePayload);
				} else {
					const createPayload: CreateWoredaRequest = {
						subCityId: formData.subCityId,
						code: formData.code,
						name: formData.name,
						nameAm: formData.nameAm,
						sortOrder: formData.sortOrder,
						isActive: formData.isActive,
					};
					onSubmit(createPayload);
				}
			},
			[onSubmit, isEditing],
		);

		const handleCheckedChange = React.useCallback(
			(checked: boolean) => {
				setValue("isActive", checked);
			},
			[setValue],
		);

		const handleSubCityChange = React.useCallback(
			(value: string) => {
				setValue("subCityId", value);
			},
			[setValue],
		);

		return (
			<Dialog open={open} onOpenChange={onOpenChange}>
				<DialogContent className="max-w-[90vw] sm:max-w-lg">
					<DialogHeader>
						<DialogTitle>{isEditing ? t("woreda.edit") : t("woreda.create")}</DialogTitle>
						<DialogDescription>
							{isEditing ? tCommon("edit") : tCommon("create")} {t("woreda.title").toLowerCase()}
						</DialogDescription>
					</DialogHeader>
					<form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="subCityId">{t("woreda.subCity")}</Label>
							<Select value={subCityId} onValueChange={handleSubCityChange}>
								<SelectTrigger aria-invalid={!!errors.subCityId}>
									<SelectValue placeholder={t("woreda.selectSubCity")} />
								</SelectTrigger>
								<SelectContent>
									{subCities.map((subCity) => (
										<SelectItem key={subCity.id} value={subCity.id}>
											{subCity.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							{errors.subCityId && <p className="text-sm text-destructive">{errors.subCityId.message}</p>}
						</div>

						<div className="space-y-2">
							<Label htmlFor="code">{t("woreda.code")}</Label>
							<Input id="code" {...register("code")} disabled={isEditing} aria-invalid={!!errors.code} />
							{errors.code && <p className="text-sm text-destructive">{errors.code.message}</p>}
						</div>

						<div className="space-y-2">
							<Label htmlFor="name">{t("woreda.name")}</Label>
							<Input id="name" {...register("name")} aria-invalid={!!errors.name} />
							{errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
						</div>

						<div className="space-y-2">
							<Label htmlFor="nameAm">{t("woreda.nameAm")}</Label>
							<Input id="nameAm" {...register("nameAm")} aria-invalid={!!errors.nameAm} />
							{errors.nameAm && <p className="text-sm text-destructive">{errors.nameAm.message}</p>}
						</div>

						<div className="space-y-2">
							<Label htmlFor="sortOrder">{t("woreda.sortOrder")}</Label>
							<Input
								id="sortOrder"
								type="number"
								{...register("sortOrder", { valueAsNumber: true })}
								aria-invalid={!!errors.sortOrder}
							/>
							{errors.sortOrder && <p className="text-sm text-destructive">{errors.sortOrder.message}</p>}
						</div>

						<div className="flex items-center space-x-2">
							<Checkbox id="isActive" checked={isActive} onCheckedChange={handleCheckedChange} />
							<Label htmlFor="isActive" className="cursor-pointer">
								{t("woreda.isActive")}
							</Label>
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
		prevProps.woreda?.id === nextProps.woreda?.id &&
		prevProps.isLoading === nextProps.isLoading,
);

WoredaFormDialog.displayName = "WoredaFormDialog";
