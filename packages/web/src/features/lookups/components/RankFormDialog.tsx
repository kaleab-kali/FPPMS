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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "#web/components/ui/select.tsx";
import type { CreateRankRequest, Rank, UpdateRankRequest } from "#web/types/rank.ts";

const RANK_CATEGORIES = ["OFFICER", "NON_COMMISSIONED_OFFICER", "ENLISTED"] as const;

const rankSchema = z.object({
	code: z.string().min(1, "Code is required"),
	name: z.string().min(1, "Name is required"),
	nameAm: z.string().min(1, "Amharic name is required"),
	level: z.number().int().min(1, "Level must be at least 1"),
	category: z.string().min(1, "Category is required"),
	baseSalary: z.number().min(0, "Base salary must be 0 or more"),
	ceilingSalary: z.number().min(0, "Ceiling salary must be 0 or more"),
	stepCount: z.number().int().min(1).optional(),
	stepPeriodYears: z.number().int().min(1).optional(),
	retirementAge: z.number().int().min(1, "Retirement age is required"),
	minYearsForPromotion: z.number().int().min(0).optional(),
	minAppraisalScore: z.number().int().min(0).optional(),
	sortOrder: z.number().int().min(0).optional(),
	isActive: z.boolean(),
});

type RankFormData = z.infer<typeof rankSchema>;

interface RankFormDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSubmit: (data: CreateRankRequest | UpdateRankRequest) => void;
	rank?: Rank;
	isLoading?: boolean;
}

export const RankFormDialog = React.memo(
	({ open, onOpenChange, onSubmit, rank, isLoading = false }: RankFormDialogProps) => {
		const { t } = useTranslation("lookups");
		const { t: tCommon } = useTranslation("common");
		const isEditing = !!rank;

		const {
			register,
			handleSubmit,
			reset,
			setValue,
			watch,
			formState: { errors },
		} = useForm<RankFormData>({
			resolver: zodResolver(rankSchema),
			defaultValues: {
				name: "",
				nameAm: "",
				code: "",
				level: 1,
				category: "",
				baseSalary: 0,
				ceilingSalary: 0,
				stepCount: 10,
				stepPeriodYears: 2,
				retirementAge: 60,
				minYearsForPromotion: 2,
				minAppraisalScore: 70,
				sortOrder: 0,
				isActive: true,
			},
		});

		const isActive = watch("isActive");
		const category = watch("category");

		useEffect(() => {
			if (rank) {
				reset({
					name: rank.name,
					nameAm: rank.nameAm,
					code: rank.code,
					level: rank.level,
					category: rank.category,
					baseSalary: Number(rank.baseSalary),
					ceilingSalary: Number(rank.ceilingSalary),
					stepCount: rank.stepCount,
					stepPeriodYears: rank.stepPeriodYears,
					retirementAge: rank.retirementAge,
					minYearsForPromotion: rank.minYearsForPromotion,
					minAppraisalScore: rank.minAppraisalScore,
					sortOrder: rank.sortOrder,
					isActive: rank.isActive,
				});
			} else {
				reset({
					name: "",
					nameAm: "",
					code: "",
					level: 1,
					category: "",
					baseSalary: 0,
					ceilingSalary: 0,
					stepCount: 10,
					stepPeriodYears: 2,
					retirementAge: 60,
					minYearsForPromotion: 2,
					minAppraisalScore: 70,
					sortOrder: 0,
					isActive: true,
				});
			}
		}, [rank, reset]);

		const handleFormSubmit = React.useCallback(
			(formData: RankFormData) => {
				if (isEditing) {
					const updatePayload: UpdateRankRequest = {
						name: formData.name,
						nameAm: formData.nameAm,
						level: formData.level,
						category: formData.category,
						baseSalary: formData.baseSalary,
						ceilingSalary: formData.ceilingSalary,
						stepCount: formData.stepCount,
						stepPeriodYears: formData.stepPeriodYears,
						retirementAge: formData.retirementAge,
						minYearsForPromotion: formData.minYearsForPromotion,
						minAppraisalScore: formData.minAppraisalScore,
						sortOrder: formData.sortOrder,
						isActive: formData.isActive,
					};
					onSubmit(updatePayload);
				} else {
					const createPayload: CreateRankRequest = {
						code: formData.code,
						name: formData.name,
						nameAm: formData.nameAm,
						level: formData.level,
						category: formData.category,
						baseSalary: formData.baseSalary,
						ceilingSalary: formData.ceilingSalary,
						stepCount: formData.stepCount,
						stepPeriodYears: formData.stepPeriodYears,
						retirementAge: formData.retirementAge,
						minYearsForPromotion: formData.minYearsForPromotion,
						minAppraisalScore: formData.minAppraisalScore,
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

		const handleCategoryChange = React.useCallback(
			(value: string) => {
				setValue("category", value);
			},
			[setValue],
		);

		return (
			<Dialog open={open} onOpenChange={onOpenChange}>
				<DialogContent className="max-w-[90vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle>{isEditing ? t("rank.edit") : t("rank.create")}</DialogTitle>
						<DialogDescription>
							{isEditing ? tCommon("edit") : tCommon("create")} {t("rank.title").toLowerCase()}
						</DialogDescription>
					</DialogHeader>
					<form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
							<div className="space-y-2">
								<Label htmlFor="name">{t("rank.name")}</Label>
								<Input id="name" {...register("name")} aria-invalid={!!errors.name} />
								{errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
							</div>

							<div className="space-y-2">
								<Label htmlFor="nameAm">{t("rank.nameAm")}</Label>
								<Input id="nameAm" {...register("nameAm")} aria-invalid={!!errors.nameAm} />
								{errors.nameAm && <p className="text-sm text-destructive">{errors.nameAm.message}</p>}
							</div>
						</div>

						<div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
							<div className="space-y-2">
								<Label htmlFor="code">{t("rank.code")}</Label>
								<Input id="code" {...register("code")} disabled={isEditing} aria-invalid={!!errors.code} />
								{errors.code && <p className="text-sm text-destructive">{errors.code.message}</p>}
							</div>

							<div className="space-y-2">
								<Label htmlFor="level">{t("rank.level")}</Label>
								<Input
									id="level"
									type="number"
									{...register("level", { valueAsNumber: true })}
									aria-invalid={!!errors.level}
								/>
								{errors.level && <p className="text-sm text-destructive">{errors.level.message}</p>}
							</div>

							<div className="space-y-2">
								<Label htmlFor="category">{t("rank.category")}</Label>
								<Select value={category} onValueChange={handleCategoryChange}>
									<SelectTrigger aria-invalid={!!errors.category}>
										<SelectValue placeholder={t("rank.selectCategory")} />
									</SelectTrigger>
									<SelectContent>
										{RANK_CATEGORIES.map((cat) => (
											<SelectItem key={cat} value={cat}>
												{cat.replace(/_/g, " ")}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								{errors.category && <p className="text-sm text-destructive">{errors.category.message}</p>}
							</div>
						</div>

						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
							<div className="space-y-2">
								<Label htmlFor="baseSalary">{t("rank.baseSalary")}</Label>
								<Input
									id="baseSalary"
									type="number"
									step="0.01"
									{...register("baseSalary", { valueAsNumber: true })}
									aria-invalid={!!errors.baseSalary}
								/>
								{errors.baseSalary && <p className="text-sm text-destructive">{errors.baseSalary.message}</p>}
							</div>

							<div className="space-y-2">
								<Label htmlFor="ceilingSalary">{t("rank.ceilingSalary")}</Label>
								<Input
									id="ceilingSalary"
									type="number"
									step="0.01"
									{...register("ceilingSalary", { valueAsNumber: true })}
									aria-invalid={!!errors.ceilingSalary}
								/>
								{errors.ceilingSalary && <p className="text-sm text-destructive">{errors.ceilingSalary.message}</p>}
							</div>
						</div>

						<div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
							<div className="space-y-2">
								<Label htmlFor="stepCount">{t("rank.stepCount")}</Label>
								<Input id="stepCount" type="number" {...register("stepCount", { valueAsNumber: true })} />
							</div>

							<div className="space-y-2">
								<Label htmlFor="stepPeriodYears">{t("rank.stepPeriodYears")}</Label>
								<Input id="stepPeriodYears" type="number" {...register("stepPeriodYears", { valueAsNumber: true })} />
							</div>

							<div className="space-y-2">
								<Label htmlFor="retirementAge">{t("rank.retirementAge")}</Label>
								<Input
									id="retirementAge"
									type="number"
									{...register("retirementAge", { valueAsNumber: true })}
									aria-invalid={!!errors.retirementAge}
								/>
								{errors.retirementAge && <p className="text-sm text-destructive">{errors.retirementAge.message}</p>}
							</div>
						</div>

						<div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
							<div className="space-y-2">
								<Label htmlFor="minYearsForPromotion">{t("rank.minYearsForPromotion")}</Label>
								<Input
									id="minYearsForPromotion"
									type="number"
									{...register("minYearsForPromotion", { valueAsNumber: true })}
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="minAppraisalScore">{t("rank.minAppraisalScore")}</Label>
								<Input
									id="minAppraisalScore"
									type="number"
									{...register("minAppraisalScore", { valueAsNumber: true })}
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="sortOrder">{t("rank.sortOrder")}</Label>
								<Input id="sortOrder" type="number" {...register("sortOrder", { valueAsNumber: true })} />
							</div>
						</div>

						<div className="flex items-center space-x-2">
							<Checkbox id="isActive" checked={isActive} onCheckedChange={handleCheckedChange} />
							<Label htmlFor="isActive" className="cursor-pointer">
								{t("rank.isActive")}
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
		prevProps.rank?.id === nextProps.rank?.id &&
		prevProps.isLoading === nextProps.isLoading,
);

RankFormDialog.displayName = "RankFormDialog";
