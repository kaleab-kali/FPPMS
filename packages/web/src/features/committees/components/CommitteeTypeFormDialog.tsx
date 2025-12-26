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
import { Textarea } from "#web/components/ui/textarea.tsx";
import type { CommitteeType, CreateCommitteeTypeRequest, UpdateCommitteeTypeRequest } from "#web/types/committee.ts";

const committeeTypeSchema = z.object({
	code: z.string().min(1, "Code is required").max(50),
	name: z.string().min(1, "Name is required").max(100),
	nameAm: z.string().max(100).optional(),
	description: z.string().max(500).optional(),
	descriptionAm: z.string().max(500).optional(),
	isPermanent: z.boolean(),
	requiresCenter: z.boolean(),
	minMembers: z.number().int().min(1).max(50),
	maxMembers: z.number().int().min(1).max(100).optional().nullable(),
	isActive: z.boolean(),
});

type CommitteeTypeFormData = z.infer<typeof committeeTypeSchema>;

interface CommitteeTypeFormDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSubmit: (data: CreateCommitteeTypeRequest | UpdateCommitteeTypeRequest) => void;
	committeeType?: CommitteeType;
	isLoading?: boolean;
}

export const CommitteeTypeFormDialog = React.memo(
	({ open, onOpenChange, onSubmit, committeeType, isLoading = false }: CommitteeTypeFormDialogProps) => {
		const { t } = useTranslation("committees");
		const { t: tCommon } = useTranslation("common");
		const isEditing = !!committeeType;

		const {
			register,
			handleSubmit,
			reset,
			setValue,
			watch,
			formState: { errors },
		} = useForm<CommitteeTypeFormData>({
			resolver: zodResolver(committeeTypeSchema),
			defaultValues: {
				code: "",
				name: "",
				nameAm: "",
				description: "",
				descriptionAm: "",
				isPermanent: false,
				requiresCenter: false,
				minMembers: 3,
				maxMembers: null,
				isActive: true,
			},
		});

		const isActive = watch("isActive");
		const isPermanent = watch("isPermanent");
		const requiresCenter = watch("requiresCenter");

		useEffect(() => {
			if (committeeType) {
				reset({
					code: committeeType.code,
					name: committeeType.name,
					nameAm: committeeType.nameAm ?? "",
					description: committeeType.description ?? "",
					descriptionAm: committeeType.descriptionAm ?? "",
					isPermanent: committeeType.isPermanent,
					requiresCenter: committeeType.requiresCenter,
					minMembers: committeeType.minMembers,
					maxMembers: committeeType.maxMembers ?? null,
					isActive: committeeType.isActive,
				});
			} else {
				reset({
					code: "",
					name: "",
					nameAm: "",
					description: "",
					descriptionAm: "",
					isPermanent: false,
					requiresCenter: false,
					minMembers: 3,
					maxMembers: null,
					isActive: true,
				});
			}
		}, [committeeType, reset]);

		const handleFormSubmit = React.useCallback(
			(formData: CommitteeTypeFormData) => {
				if (isEditing) {
					const updatePayload: UpdateCommitteeTypeRequest = {
						name: formData.name,
						nameAm: formData.nameAm || undefined,
						description: formData.description || undefined,
						descriptionAm: formData.descriptionAm || undefined,
						isPermanent: formData.isPermanent,
						requiresCenter: formData.requiresCenter,
						minMembers: formData.minMembers,
						maxMembers: formData.maxMembers ?? undefined,
						isActive: formData.isActive,
					};
					onSubmit(updatePayload);
				} else {
					const createPayload: CreateCommitteeTypeRequest = {
						code: formData.code,
						name: formData.name,
						nameAm: formData.nameAm || undefined,
						description: formData.description || undefined,
						descriptionAm: formData.descriptionAm || undefined,
						isPermanent: formData.isPermanent,
						requiresCenter: formData.requiresCenter,
						minMembers: formData.minMembers,
						maxMembers: formData.maxMembers ?? undefined,
					};
					onSubmit(createPayload);
				}
			},
			[onSubmit, isEditing],
		);

		const handleIsActiveChange = React.useCallback(
			(checked: boolean) => {
				setValue("isActive", checked);
			},
			[setValue],
		);

		const handleIsPermanentChange = React.useCallback(
			(checked: boolean) => {
				setValue("isPermanent", checked);
			},
			[setValue],
		);

		const handleRequiresCenterChange = React.useCallback(
			(checked: boolean) => {
				setValue("requiresCenter", checked);
			},
			[setValue],
		);

		return (
			<Dialog open={open} onOpenChange={onOpenChange}>
				<DialogContent className="max-w-[90vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle>{isEditing ? t("type.edit") : t("type.create")}</DialogTitle>
						<DialogDescription>
							{isEditing ? tCommon("edit") : tCommon("create")} {t("type.title").toLowerCase()}
						</DialogDescription>
					</DialogHeader>
					<form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
							<div className="space-y-2">
								<Label htmlFor="code">{t("type.code")}</Label>
								<Input id="code" {...register("code")} disabled={isEditing} aria-invalid={!!errors.code} />
								{errors.code && <p className="text-sm text-destructive">{errors.code.message}</p>}
							</div>

							<div className="space-y-2">
								<Label htmlFor="name">{t("type.nameEn")}</Label>
								<Input id="name" {...register("name")} aria-invalid={!!errors.name} />
								{errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
							</div>
						</div>

						<div className="space-y-2">
							<Label htmlFor="nameAm">{t("type.nameAm")}</Label>
							<Input id="nameAm" {...register("nameAm")} />
						</div>

						<div className="space-y-2">
							<Label htmlFor="description">{t("type.descriptionEn")}</Label>
							<Textarea id="description" {...register("description")} rows={2} />
						</div>

						<div className="space-y-2">
							<Label htmlFor="descriptionAm">{t("type.descriptionAm")}</Label>
							<Textarea id="descriptionAm" {...register("descriptionAm")} rows={2} />
						</div>

						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
							<div className="space-y-2">
								<Label htmlFor="minMembers">{t("type.minMembers")}</Label>
								<Input
									id="minMembers"
									type="number"
									{...register("minMembers", { valueAsNumber: true })}
									aria-invalid={!!errors.minMembers}
								/>
								{errors.minMembers && <p className="text-sm text-destructive">{errors.minMembers.message}</p>}
							</div>

							<div className="space-y-2">
								<Label htmlFor="maxMembers">{t("type.maxMembers")}</Label>
								<Input
									id="maxMembers"
									type="number"
									{...register("maxMembers", { valueAsNumber: true })}
									placeholder={t("type.unlimited")}
								/>
							</div>
						</div>

						<div className="space-y-4">
							<div className="flex items-center space-x-2">
								<Checkbox id="isPermanent" checked={isPermanent} onCheckedChange={handleIsPermanentChange} />
								<div>
									<Label htmlFor="isPermanent" className="cursor-pointer">
										{t("type.isPermanent")}
									</Label>
									<p className="text-sm text-muted-foreground">{t("type.isPermanentHelp")}</p>
								</div>
							</div>

							<div className="flex items-center space-x-2">
								<Checkbox id="requiresCenter" checked={requiresCenter} onCheckedChange={handleRequiresCenterChange} />
								<div>
									<Label htmlFor="requiresCenter" className="cursor-pointer">
										{t("type.requiresCenter")}
									</Label>
									<p className="text-sm text-muted-foreground">{t("type.requiresCenterHelp")}</p>
								</div>
							</div>

							{isEditing && (
								<div className="flex items-center space-x-2">
									<Checkbox id="isActive" checked={isActive} onCheckedChange={handleIsActiveChange} />
									<Label htmlFor="isActive" className="cursor-pointer">
										{tCommon("active")}
									</Label>
								</div>
							)}
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
		prevProps.committeeType?.id === nextProps.committeeType?.id &&
		prevProps.isLoading === nextProps.isLoading,
);

CommitteeTypeFormDialog.displayName = "CommitteeTypeFormDialog";
