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
import type { CreateTenantRequest, Tenant, UpdateTenantRequest } from "#web/types/tenant.ts";

const tenantSchema = z.object({
	name: z.string().min(1, "Name is required"),
	code: z.string().min(1, "Code is required"),
	nameAm: z.string().optional(),
	type: z.string().optional(),
	isActive: z.boolean(),
});

type TenantFormData = z.infer<typeof tenantSchema>;

interface TenantFormDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSubmit: (data: CreateTenantRequest | UpdateTenantRequest) => void;
	tenant?: Tenant;
	isLoading?: boolean;
}

export const TenantFormDialog = React.memo(
	({ open, onOpenChange, onSubmit, tenant, isLoading = false }: TenantFormDialogProps) => {
		const { t } = useTranslation("organization");
		const { t: tCommon } = useTranslation("common");
		const isEditing = !!tenant;

		const {
			register,
			handleSubmit,
			reset,
			setValue,
			watch,
			formState: { errors },
		} = useForm<TenantFormData>({
			resolver: zodResolver(tenantSchema),
			defaultValues: {
				name: "",
				code: "",
				nameAm: "",
				type: "",
				isActive: true,
			},
		});

		const isActive = watch("isActive");

		useEffect(() => {
			if (tenant) {
				reset({
					name: tenant.name,
					code: tenant.code,
					nameAm: tenant.nameAm ?? "",
					type: tenant.type ?? "",
					isActive: tenant.isActive,
				});
			} else {
				reset({
					name: "",
					code: "",
					nameAm: "",
					type: "",
					isActive: true,
				});
			}
		}, [tenant, reset]);

		const handleFormSubmit = React.useCallback(
			(formData: TenantFormData) => {
				if (isEditing) {
					const updatePayload: UpdateTenantRequest = {
						name: formData.name,
						nameAm: formData.nameAm || undefined,
						type: formData.type || undefined,
						isActive: formData.isActive,
					};
					onSubmit(updatePayload);
				} else {
					const createPayload: CreateTenantRequest = {
						name: formData.name,
						code: formData.code,
						nameAm: formData.nameAm || undefined,
						type: formData.type || undefined,
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
						<DialogTitle>{isEditing ? t("tenant.edit") : t("tenant.create")}</DialogTitle>
						<DialogDescription>
							{isEditing ? tCommon("edit") : tCommon("create")} {t("tenant.title").toLowerCase()}
						</DialogDescription>
					</DialogHeader>
					<form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="name">{t("tenant.name")}</Label>
							<Input id="name" {...register("name")} aria-invalid={!!errors.name} />
							{errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
						</div>

						<div className="space-y-2">
							<Label htmlFor="nameAm">{t("tenant.nameAm")}</Label>
							<Input id="nameAm" {...register("nameAm")} />
						</div>

						<div className="space-y-2">
							<Label htmlFor="code">{t("tenant.code")}</Label>
							<Input id="code" {...register("code")} disabled={isEditing} aria-invalid={!!errors.code} />
							{errors.code && <p className="text-sm text-destructive">{errors.code.message}</p>}
						</div>

						<div className="space-y-2">
							<Label htmlFor="type">{t("tenant.type")}</Label>
							<Input id="type" {...register("type")} />
						</div>

						<div className="flex items-center space-x-2">
							<Checkbox id="isActive" checked={isActive} onCheckedChange={handleCheckedChange} />
							<Label htmlFor="isActive" className="cursor-pointer">
								{t("tenant.isActive")}
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
		prevProps.tenant?.id === nextProps.tenant?.id &&
		prevProps.isLoading === nextProps.isLoading,
);

TenantFormDialog.displayName = "TenantFormDialog";
