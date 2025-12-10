import { zodResolver } from "@hookform/resolvers/zod";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import { useDepartments } from "#web/api/departments/departments.queries.ts";
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
import { Textarea } from "#web/components/ui/textarea.tsx";
import type { CreatePositionRequest, Position, UpdatePositionRequest } from "#web/types/position.ts";

const NONE_VALUE = "__none__";

const positionSchema = z.object({
	code: z.string().min(1, "Code is required"),
	name: z.string().min(1, "Name is required"),
	nameAm: z.string().optional(),
	description: z.string().optional(),
	departmentId: z.string().optional(),
	sortOrder: z.number().int().min(0).optional(),
	isActive: z.boolean(),
});

type PositionFormData = z.infer<typeof positionSchema>;

interface PositionFormDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSubmit: (data: CreatePositionRequest | UpdatePositionRequest) => void;
	position?: Position;
	isLoading?: boolean;
}

export const PositionFormDialog = React.memo(
	({ open, onOpenChange, onSubmit, position, isLoading = false }: PositionFormDialogProps) => {
		const { t } = useTranslation("organization");
		const { t: tCommon } = useTranslation("common");
		const isEditing = !!position;

		const { data: departmentsData } = useDepartments();
		const departments = departmentsData ?? [];

		const {
			register,
			handleSubmit,
			reset,
			setValue,
			watch,
			formState: { errors },
		} = useForm<PositionFormData>({
			resolver: zodResolver(positionSchema),
			defaultValues: {
				code: "",
				name: "",
				nameAm: "",
				description: "",
				departmentId: "",
				sortOrder: 0,
				isActive: true,
			},
		});

		const isActive = watch("isActive");
		const departmentId = watch("departmentId");

		useEffect(() => {
			if (position) {
				reset({
					code: position.code,
					name: position.name,
					nameAm: position.nameAm ?? "",
					description: position.description ?? "",
					departmentId: position.departmentId ?? "",
					sortOrder: position.sortOrder ?? 0,
					isActive: position.isActive,
				});
			} else {
				reset({
					code: "",
					name: "",
					nameAm: "",
					description: "",
					departmentId: "",
					sortOrder: 0,
					isActive: true,
				});
			}
		}, [position, reset]);

		const handleFormSubmit = React.useCallback(
			(formData: PositionFormData) => {
				if (isEditing) {
					const updatePayload: UpdatePositionRequest = {
						name: formData.name,
						nameAm: formData.nameAm || undefined,
						description: formData.description || undefined,
						departmentId:
							formData.departmentId === NONE_VALUE || formData.departmentId === "" ? undefined : formData.departmentId,
						sortOrder: formData.sortOrder,
						isActive: formData.isActive,
					};
					onSubmit(updatePayload);
				} else {
					const createPayload: CreatePositionRequest = {
						code: formData.code,
						name: formData.name,
						nameAm: formData.nameAm || undefined,
						description: formData.description || undefined,
						departmentId:
							formData.departmentId === NONE_VALUE || formData.departmentId === "" ? undefined : formData.departmentId,
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

		const handleDepartmentChange = React.useCallback(
			(value: string) => {
				setValue("departmentId", value === NONE_VALUE ? "" : value);
			},
			[setValue],
		);

		return (
			<Dialog open={open} onOpenChange={onOpenChange}>
				<DialogContent className="max-w-[90vw] sm:max-w-lg max-h-[90vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle>{isEditing ? t("position.edit") : t("position.create")}</DialogTitle>
						<DialogDescription>
							{isEditing ? tCommon("edit") : tCommon("create")} {t("position.title").toLowerCase()}
						</DialogDescription>
					</DialogHeader>
					<form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
							<div className="space-y-2">
								<Label htmlFor="name">{t("position.name")}</Label>
								<Input id="name" {...register("name")} aria-invalid={!!errors.name} />
								{errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
							</div>

							<div className="space-y-2">
								<Label htmlFor="nameAm">{t("position.nameAm")}</Label>
								<Input id="nameAm" {...register("nameAm")} />
							</div>
						</div>

						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
							<div className="space-y-2">
								<Label htmlFor="code">{t("position.code")}</Label>
								<Input id="code" {...register("code")} disabled={isEditing} aria-invalid={!!errors.code} />
								{errors.code && <p className="text-sm text-destructive">{errors.code.message}</p>}
							</div>

							<div className="space-y-2">
								<Label htmlFor="sortOrder">{t("position.sortOrder")}</Label>
								<Input id="sortOrder" type="number" min={0} {...register("sortOrder", { valueAsNumber: true })} />
							</div>
						</div>

						<div className="space-y-2">
							<Label htmlFor="departmentId">{t("position.department")}</Label>
							<Select value={departmentId || NONE_VALUE} onValueChange={handleDepartmentChange}>
								<SelectTrigger>
									<SelectValue placeholder={t("position.selectDepartment")} />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value={NONE_VALUE}>{tCommon("none")}</SelectItem>
									{departments.map((dept) => (
										<SelectItem key={dept.id} value={dept.id}>
											{dept.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						<div className="space-y-2">
							<Label htmlFor="description">{t("position.description")}</Label>
							<Textarea id="description" {...register("description")} rows={2} />
						</div>

						<div className="flex items-center space-x-2">
							<Checkbox id="isActive" checked={isActive} onCheckedChange={handleCheckedChange} />
							<Label htmlFor="isActive" className="cursor-pointer">
								{t("position.isActive")}
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
		prevProps.position?.id === nextProps.position?.id &&
		prevProps.isLoading === nextProps.isLoading,
);

PositionFormDialog.displayName = "PositionFormDialog";
