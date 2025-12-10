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
import type { Center, CreateCenterRequest, UpdateCenterRequest } from "#web/types/center.ts";

const centerSchema = z.object({
	code: z.string().min(1, "Code is required"),
	name: z.string().min(1, "Name is required"),
	nameAm: z.string().optional(),
	type: z.string().optional(),
	address: z.string().optional(),
	phone: z.string().optional(),
	email: z.string().email().optional().or(z.literal("")),
	isActive: z.boolean(),
});

type CenterFormData = z.infer<typeof centerSchema>;

interface CenterFormDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSubmit: (data: CreateCenterRequest | UpdateCenterRequest) => void;
	center?: Center;
	isLoading?: boolean;
}

export const CenterFormDialog = React.memo(
	({ open, onOpenChange, onSubmit, center, isLoading = false }: CenterFormDialogProps) => {
		const { t } = useTranslation("organization");
		const { t: tCommon } = useTranslation("common");
		const isEditing = !!center;

		const {
			register,
			handleSubmit,
			reset,
			setValue,
			watch,
			formState: { errors },
		} = useForm<CenterFormData>({
			resolver: zodResolver(centerSchema),
			defaultValues: {
				code: "",
				name: "",
				nameAm: "",
				type: "",
				address: "",
				phone: "",
				email: "",
				isActive: true,
			},
		});

		const isActive = watch("isActive");

		useEffect(() => {
			if (center) {
				reset({
					code: center.code,
					name: center.name,
					nameAm: center.nameAm ?? "",
					type: center.type ?? "",
					address: center.address ?? "",
					phone: center.phone ?? "",
					email: center.email ?? "",
					isActive: center.isActive,
				});
			} else {
				reset({
					code: "",
					name: "",
					nameAm: "",
					type: "",
					address: "",
					phone: "",
					email: "",
					isActive: true,
				});
			}
		}, [center, reset]);

		const handleFormSubmit = React.useCallback(
			(formData: CenterFormData) => {
				if (isEditing) {
					const updatePayload: UpdateCenterRequest = {
						name: formData.name,
						nameAm: formData.nameAm || undefined,
						type: formData.type || undefined,
						address: formData.address || undefined,
						phone: formData.phone || undefined,
						email: formData.email || undefined,
						isActive: formData.isActive,
					};
					onSubmit(updatePayload);
				} else {
					const createPayload: CreateCenterRequest = {
						code: formData.code,
						name: formData.name,
						nameAm: formData.nameAm || undefined,
						type: formData.type || undefined,
						address: formData.address || undefined,
						phone: formData.phone || undefined,
						email: formData.email || undefined,
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
				<DialogContent className="max-w-[90vw] sm:max-w-lg max-h-[90vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle>{isEditing ? t("center.edit") : t("center.create")}</DialogTitle>
						<DialogDescription>
							{isEditing ? tCommon("edit") : tCommon("create")} {t("center.title").toLowerCase()}
						</DialogDescription>
					</DialogHeader>
					<form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
							<div className="space-y-2">
								<Label htmlFor="name">{t("center.name")}</Label>
								<Input id="name" {...register("name")} aria-invalid={!!errors.name} />
								{errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
							</div>

							<div className="space-y-2">
								<Label htmlFor="nameAm">{t("center.nameAm")}</Label>
								<Input id="nameAm" {...register("nameAm")} />
							</div>
						</div>

						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
							<div className="space-y-2">
								<Label htmlFor="code">{t("center.code")}</Label>
								<Input id="code" {...register("code")} disabled={isEditing} aria-invalid={!!errors.code} />
								{errors.code && <p className="text-sm text-destructive">{errors.code.message}</p>}
							</div>

							<div className="space-y-2">
								<Label htmlFor="type">{t("center.type")}</Label>
								<Input id="type" {...register("type")} />
							</div>
						</div>

						<div className="space-y-2">
							<Label htmlFor="address">{t("center.address")}</Label>
							<Textarea id="address" {...register("address")} rows={2} />
						</div>

						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
							<div className="space-y-2">
								<Label htmlFor="phone">{t("center.phone")}</Label>
								<Input id="phone" {...register("phone")} />
							</div>

							<div className="space-y-2">
								<Label htmlFor="email">{t("center.email")}</Label>
								<Input id="email" type="email" {...register("email")} aria-invalid={!!errors.email} />
								{errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
							</div>
						</div>

						<div className="flex items-center space-x-2">
							<Checkbox id="isActive" checked={isActive} onCheckedChange={handleCheckedChange} />
							<Label htmlFor="isActive" className="cursor-pointer">
								{t("center.isActive")}
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
		prevProps.center?.id === nextProps.center?.id &&
		prevProps.isLoading === nextProps.isLoading,
);

CenterFormDialog.displayName = "CenterFormDialog";
