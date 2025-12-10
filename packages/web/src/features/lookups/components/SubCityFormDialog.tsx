import { zodResolver } from "@hookform/resolvers/zod";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import { useRegions } from "#web/api/lookups/regions.queries.ts";
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
import type { CreateSubCityRequest, SubCity, UpdateSubCityRequest } from "#web/types/lookup.ts";

const subCitySchema = z.object({
	regionId: z.string().min(1, "Region is required"),
	code: z.string().min(1, "Code is required"),
	name: z.string().min(1, "Name is required"),
	nameAm: z.string().min(1, "Amharic name is required"),
	sortOrder: z.number().int().min(0).optional(),
	isActive: z.boolean(),
});

type SubCityFormData = z.infer<typeof subCitySchema>;

interface SubCityFormDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSubmit: (data: CreateSubCityRequest | UpdateSubCityRequest) => void;
	subCity?: SubCity;
	isLoading?: boolean;
}

export const SubCityFormDialog = React.memo(
	({ open, onOpenChange, onSubmit, subCity, isLoading = false }: SubCityFormDialogProps) => {
		const { t } = useTranslation("lookups");
		const { t: tCommon } = useTranslation("common");
		const isEditing = !!subCity;

		const { data: regionsData } = useRegions();
		const regions = regionsData ?? [];

		const {
			register,
			handleSubmit,
			reset,
			setValue,
			watch,
			formState: { errors },
		} = useForm<SubCityFormData>({
			resolver: zodResolver(subCitySchema),
			defaultValues: {
				code: "",
				name: "",
				nameAm: "",
				regionId: "",
				sortOrder: 0,
				isActive: true,
			},
		});

		const isActive = watch("isActive");
		const regionId = watch("regionId");

		useEffect(() => {
			if (subCity) {
				reset({
					code: subCity.code,
					name: subCity.name,
					nameAm: subCity.nameAm ?? "",
					regionId: subCity.regionId,
					sortOrder: subCity.sortOrder ?? 0,
					isActive: subCity.isActive,
				});
			} else {
				reset({
					code: "",
					name: "",
					nameAm: "",
					regionId: "",
					sortOrder: 0,
					isActive: true,
				});
			}
		}, [subCity, reset]);

		const handleFormSubmit = React.useCallback(
			(formData: SubCityFormData) => {
				if (isEditing) {
					const updatePayload: UpdateSubCityRequest = {
						name: formData.name,
						nameAm: formData.nameAm,
						sortOrder: formData.sortOrder,
						isActive: formData.isActive,
					};
					onSubmit(updatePayload);
				} else {
					const createPayload: CreateSubCityRequest = {
						regionId: formData.regionId,
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

		const handleRegionChange = React.useCallback(
			(value: string) => {
				setValue("regionId", value);
			},
			[setValue],
		);

		return (
			<Dialog open={open} onOpenChange={onOpenChange}>
				<DialogContent className="max-w-[90vw] sm:max-w-lg">
					<DialogHeader>
						<DialogTitle>{isEditing ? t("subCity.edit") : t("subCity.create")}</DialogTitle>
						<DialogDescription>
							{isEditing ? tCommon("edit") : tCommon("create")} {t("subCity.title").toLowerCase()}
						</DialogDescription>
					</DialogHeader>
					<form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="regionId">{t("subCity.region")}</Label>
							<Select value={regionId} onValueChange={handleRegionChange}>
								<SelectTrigger aria-invalid={!!errors.regionId}>
									<SelectValue placeholder={t("subCity.selectRegion")} />
								</SelectTrigger>
								<SelectContent>
									{regions.map((region) => (
										<SelectItem key={region.id} value={region.id}>
											{region.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							{errors.regionId && <p className="text-sm text-destructive">{errors.regionId.message}</p>}
						</div>

						<div className="space-y-2">
							<Label htmlFor="code">{t("subCity.code")}</Label>
							<Input id="code" {...register("code")} disabled={isEditing} aria-invalid={!!errors.code} />
							{errors.code && <p className="text-sm text-destructive">{errors.code.message}</p>}
						</div>

						<div className="space-y-2">
							<Label htmlFor="name">{t("subCity.name")}</Label>
							<Input id="name" {...register("name")} aria-invalid={!!errors.name} />
							{errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
						</div>

						<div className="space-y-2">
							<Label htmlFor="nameAm">{t("subCity.nameAm")}</Label>
							<Input id="nameAm" {...register("nameAm")} aria-invalid={!!errors.nameAm} />
							{errors.nameAm && <p className="text-sm text-destructive">{errors.nameAm.message}</p>}
						</div>

						<div className="space-y-2">
							<Label htmlFor="sortOrder">{t("subCity.sortOrder")}</Label>
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
								{t("subCity.isActive")}
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
		prevProps.subCity?.id === nextProps.subCity?.id &&
		prevProps.isLoading === nextProps.isLoading,
);

SubCityFormDialog.displayName = "SubCityFormDialog";
