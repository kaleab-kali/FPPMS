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
import type { CreateDepartmentRequest, Department, UpdateDepartmentRequest } from "#web/types/department.ts";

const NONE_VALUE = "__none__";

const departmentSchema = z.object({
	code: z.string().min(1, "Code is required"),
	name: z.string().min(1, "Name is required"),
	nameAm: z.string().optional(),
	description: z.string().optional(),
	parentId: z.string().optional(),
	sortOrder: z.number().int().min(0).optional(),
	isActive: z.boolean(),
});

type DepartmentFormData = z.infer<typeof departmentSchema>;

interface DepartmentFormDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSubmit: (data: CreateDepartmentRequest | UpdateDepartmentRequest) => void;
	department?: Department;
	isLoading?: boolean;
}

export const DepartmentFormDialog = React.memo(
	({ open, onOpenChange, onSubmit, department, isLoading = false }: DepartmentFormDialogProps) => {
		const { t } = useTranslation("organization");
		const { t: tCommon } = useTranslation("common");
		const isEditing = !!department;

		const { data: departmentsData } = useDepartments();
		const departments = departmentsData ?? [];

		const {
			register,
			handleSubmit,
			reset,
			setValue,
			watch,
			formState: { errors },
		} = useForm<DepartmentFormData>({
			resolver: zodResolver(departmentSchema),
			defaultValues: {
				code: "",
				name: "",
				nameAm: "",
				description: "",
				parentId: "",
				sortOrder: 0,
				isActive: true,
			},
		});

		const isActive = watch("isActive");
		const parentId = watch("parentId");

		useEffect(() => {
			if (department) {
				reset({
					code: department.code,
					name: department.name,
					nameAm: department.nameAm ?? "",
					description: department.description ?? "",
					parentId: department.parentId ?? "",
					sortOrder: department.sortOrder ?? 0,
					isActive: department.isActive,
				});
			} else {
				reset({
					code: "",
					name: "",
					nameAm: "",
					description: "",
					parentId: "",
					sortOrder: 0,
					isActive: true,
				});
			}
		}, [department, reset]);

		const handleFormSubmit = React.useCallback(
			(formData: DepartmentFormData) => {
				if (isEditing) {
					const updatePayload: UpdateDepartmentRequest = {
						name: formData.name,
						nameAm: formData.nameAm || undefined,
						description: formData.description || undefined,
						parentId: formData.parentId === NONE_VALUE || formData.parentId === "" ? undefined : formData.parentId,
						sortOrder: formData.sortOrder,
						isActive: formData.isActive,
					};
					onSubmit(updatePayload);
				} else {
					const createPayload: CreateDepartmentRequest = {
						code: formData.code,
						name: formData.name,
						nameAm: formData.nameAm || undefined,
						description: formData.description || undefined,
						parentId: formData.parentId === NONE_VALUE || formData.parentId === "" ? undefined : formData.parentId,
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

		const handleParentChange = React.useCallback(
			(value: string) => {
				setValue("parentId", value === NONE_VALUE ? "" : value);
			},
			[setValue],
		);

		const filteredDepartments = React.useMemo(
			() => departments.filter((d) => d.id !== department?.id),
			[departments, department?.id],
		);

		return (
			<Dialog open={open} onOpenChange={onOpenChange}>
				<DialogContent className="max-w-[90vw] sm:max-w-lg max-h-[90vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle>{isEditing ? t("department.edit") : t("department.create")}</DialogTitle>
						<DialogDescription>
							{isEditing ? tCommon("edit") : tCommon("create")} {t("department.title").toLowerCase()}
						</DialogDescription>
					</DialogHeader>
					<form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
							<div className="space-y-2">
								<Label htmlFor="name">{t("department.name")}</Label>
								<Input id="name" {...register("name")} aria-invalid={!!errors.name} />
								{errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
							</div>

							<div className="space-y-2">
								<Label htmlFor="nameAm">{t("department.nameAm")}</Label>
								<Input id="nameAm" {...register("nameAm")} />
							</div>
						</div>

						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
							<div className="space-y-2">
								<Label htmlFor="code">{t("department.code")}</Label>
								<Input id="code" {...register("code")} disabled={isEditing} aria-invalid={!!errors.code} />
								{errors.code && <p className="text-sm text-destructive">{errors.code.message}</p>}
							</div>

							<div className="space-y-2">
								<Label htmlFor="sortOrder">{t("department.sortOrder")}</Label>
								<Input id="sortOrder" type="number" min={0} {...register("sortOrder")} />
							</div>
						</div>

						<div className="space-y-2">
							<Label htmlFor="parentId">{t("department.parent")}</Label>
							<Select value={parentId || NONE_VALUE} onValueChange={handleParentChange}>
								<SelectTrigger>
									<SelectValue placeholder={t("department.selectParent")} />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value={NONE_VALUE}>{tCommon("none")}</SelectItem>
									{filteredDepartments.map((dept) => (
										<SelectItem key={dept.id} value={dept.id}>
											{dept.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						<div className="space-y-2">
							<Label htmlFor="description">{t("department.description")}</Label>
							<Textarea id="description" {...register("description")} rows={2} />
						</div>

						<div className="flex items-center space-x-2">
							<Checkbox id="isActive" checked={isActive} onCheckedChange={handleCheckedChange} />
							<Label htmlFor="isActive" className="cursor-pointer">
								{t("department.isActive")}
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
		prevProps.department?.id === nextProps.department?.id &&
		prevProps.isLoading === nextProps.isLoading,
);

DepartmentFormDialog.displayName = "DepartmentFormDialog";
