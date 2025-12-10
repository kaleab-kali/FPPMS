import { zodResolver } from "@hookform/resolvers/zod";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { z } from "zod";
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
import type { CreateRegionRequest, Region, UpdateRegionRequest } from "#web/types/lookup.ts";

const regionSchema = z.object({
	code: z.string().min(1, "Code is required"),
	name: z.string().min(1, "Name is required"),
	nameAm: z.string().min(1, "Amharic name is required"),
	sortOrder: z.number().int().min(0).optional(),
	isActive: z.boolean(),
});

type RegionFormData = z.infer<typeof regionSchema>;

interface RegionFormDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSubmit: (data: CreateRegionRequest | UpdateRegionRequest) => void;
	region?: Region;
	isLoading?: boolean;
}

export const RegionFormDialog = React.memo(
	({ open, onOpenChange, onSubmit, region, isLoading = false }: RegionFormDialogProps) => {
		const { t } = useTranslation("lookups");
		const { t: tCommon } = useTranslation("common");
		const isEditing = !!region;

		const {
			register,
			handleSubmit,
			reset,
			setValue,
			watch,
			formState: { errors },
		} = useForm<RegionFormData>({
			resolver: zodResolver(regionSchema),
			defaultValues: {
				code: "",
				name: "",
				nameAm: "",
				sortOrder: 0,
				isActive: true,
			},
		});

		const isActive = watch("isActive");

		useEffect(() => {
			if (region) {
				reset({
					code: region.code,
					name: region.name,
					nameAm: region.nameAm ?? "",
					sortOrder: region.sortOrder ?? 0,
					isActive: region.isActive,
				});
			} else {
				reset({
					code: "",
					name: "",
					nameAm: "",
					sortOrder: 0,
					isActive: true,
				});
			}
		}, [region, reset]);

		const handleFormSubmit = React.useCallback(
			(formData: RegionFormData) => {
				if (isEditing) {
					const updatePayload: UpdateRegionRequest = {
						name: formData.name,
						nameAm: formData.nameAm,
						sortOrder: formData.sortOrder,
						isActive: formData.isActive,
					};
					onSubmit(updatePayload);
				} else {
					const createPayload: CreateRegionRequest = {
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

		return (
			<Dialog open={open} onOpenChange={onOpenChange}>
				<DialogContent className="max-w-[90vw] sm:max-w-lg">
					<DialogHeader>
						<DialogTitle>{isEditing ? t("region.edit") : t("region.create")}</DialogTitle>
						<DialogDescription>
							{isEditing ? tCommon("edit") : tCommon("create")} {t("region.title").toLowerCase()}
						</DialogDescription>
					</DialogHeader>
					<form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
							<div className="space-y-2">
								<Label htmlFor="name">{t("region.name")}</Label>
								<Input id="name" {...register("name")} aria-invalid={!!errors.name} />
								{errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
							</div>

							<div className="space-y-2">
								<Label htmlFor="nameAm">{t("region.nameAm")}</Label>
								<Input id="nameAm" {...register("nameAm")} aria-invalid={!!errors.nameAm} />
								{errors.nameAm && <p className="text-sm text-destructive">{errors.nameAm.message}</p>}
							</div>
						</div>

						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
							<div className="space-y-2">
								<Label htmlFor="code">{t("region.code")}</Label>
								<Input id="code" {...register("code")} disabled={isEditing} aria-invalid={!!errors.code} />
								{errors.code && <p className="text-sm text-destructive">{errors.code.message}</p>}
							</div>

							<div className="space-y-2">
								<Label htmlFor="sortOrder">{t("region.sortOrder")}</Label>
								<Input id="sortOrder" type="number" min={0} {...register("sortOrder", { valueAsNumber: true })} />
							</div>
						</div>

						<div className="flex items-center space-x-2">
							<Checkbox id="isActive" checked={isActive} onCheckedChange={handleCheckedChange} />
							<Label htmlFor="isActive" className="cursor-pointer">
								{t("region.isActive")}
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
		prevProps.region?.id === nextProps.region?.id &&
		prevProps.isLoading === nextProps.isLoading,
);

RegionFormDialog.displayName = "RegionFormDialog";
