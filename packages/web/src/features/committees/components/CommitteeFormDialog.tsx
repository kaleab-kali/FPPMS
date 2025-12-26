import { zodResolver } from "@hookform/resolvers/zod";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import { useCenters } from "#web/api/centers/centers.queries.ts";
import { useCommitteeTypes } from "#web/api/committees/committees.queries.ts";
import { Button } from "#web/components/ui/button.tsx";
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
import type { Committee, CreateCommitteeRequest, UpdateCommitteeRequest } from "#web/types/committee.ts";

const committeeSchema = z.object({
	committeeTypeId: z.string().min(1, "Committee type is required"),
	centerId: z.string().optional(),
	code: z.string().min(1, "Code is required").max(50),
	name: z.string().min(1, "Name is required").max(100),
	nameAm: z.string().max(100).optional(),
	description: z.string().max(500).optional(),
	descriptionAm: z.string().max(500).optional(),
	establishedDate: z.string().min(1, "Established date is required"),
});

type CommitteeFormData = z.infer<typeof committeeSchema>;

interface CommitteeFormDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSubmit: (data: CreateCommitteeRequest | UpdateCommitteeRequest) => void;
	committee?: Committee;
	isLoading?: boolean;
}

export const CommitteeFormDialog = React.memo(
	({ open, onOpenChange, onSubmit, committee, isLoading = false }: CommitteeFormDialogProps) => {
		const { t } = useTranslation("committees");
		const { t: tCommon } = useTranslation("common");
		const isEditing = !!committee;

		const { data: committeeTypes } = useCommitteeTypes();
		const { data: centers } = useCenters();

		const {
			register,
			handleSubmit,
			reset,
			setValue,
			watch,
			formState: { errors },
		} = useForm<CommitteeFormData>({
			resolver: zodResolver(committeeSchema),
			defaultValues: {
				committeeTypeId: "",
				centerId: "",
				code: "",
				name: "",
				nameAm: "",
				description: "",
				descriptionAm: "",
				establishedDate: new Date().toISOString().split("T")[0],
			},
		});

		const selectedTypeId = watch("committeeTypeId");
		const selectedType = committeeTypes?.find((ct) => ct.id === selectedTypeId);

		useEffect(() => {
			if (committee) {
				reset({
					committeeTypeId: committee.committeeTypeId,
					centerId: committee.centerId ?? "",
					code: committee.code,
					name: committee.name,
					nameAm: committee.nameAm ?? "",
					description: committee.description ?? "",
					descriptionAm: committee.descriptionAm ?? "",
					establishedDate: committee.establishedDate.split("T")[0],
				});
			} else {
				reset({
					committeeTypeId: "",
					centerId: "",
					code: "",
					name: "",
					nameAm: "",
					description: "",
					descriptionAm: "",
					establishedDate: new Date().toISOString().split("T")[0],
				});
			}
		}, [committee, reset]);

		const handleFormSubmit = React.useCallback(
			(formData: CommitteeFormData) => {
				if (isEditing) {
					const updatePayload: UpdateCommitteeRequest = {
						name: formData.name,
						nameAm: formData.nameAm || undefined,
						description: formData.description || undefined,
						descriptionAm: formData.descriptionAm || undefined,
					};
					onSubmit(updatePayload);
				} else {
					const createPayload: CreateCommitteeRequest = {
						committeeTypeId: formData.committeeTypeId,
						centerId: formData.centerId || undefined,
						code: formData.code,
						name: formData.name,
						nameAm: formData.nameAm || undefined,
						description: formData.description || undefined,
						descriptionAm: formData.descriptionAm || undefined,
						establishedDate: formData.establishedDate,
					};
					onSubmit(createPayload);
				}
			},
			[onSubmit, isEditing],
		);

		const handleTypeChange = React.useCallback(
			(value: string) => {
				setValue("committeeTypeId", value);
			},
			[setValue],
		);

		const handleCenterChange = React.useCallback(
			(value: string) => {
				setValue("centerId", value === "none" ? "" : value);
			},
			[setValue],
		);

		const { i18n } = useTranslation();
		const isAmharic = i18n.language === "am";

		return (
			<Dialog open={open} onOpenChange={onOpenChange}>
				<DialogContent className="max-w-[90vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle>{isEditing ? t("committee.edit") : t("committee.create")}</DialogTitle>
						<DialogDescription>
							{isEditing ? tCommon("edit") : tCommon("create")} {t("committee.title").toLowerCase()}
						</DialogDescription>
					</DialogHeader>
					<form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
						{!isEditing && (
							<>
								<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
									<div className="space-y-2">
										<Label htmlFor="committeeTypeId">{t("committee.type")}</Label>
										<Select value={selectedTypeId} onValueChange={handleTypeChange}>
											<SelectTrigger aria-invalid={!!errors.committeeTypeId}>
												<SelectValue placeholder={t("committee.selectType")} />
											</SelectTrigger>
											<SelectContent>
												{committeeTypes?.map((type) => (
													<SelectItem key={type.id} value={type.id}>
														{isAmharic && type.nameAm ? type.nameAm : type.name}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
										{errors.committeeTypeId && (
											<p className="text-sm text-destructive">{errors.committeeTypeId.message}</p>
										)}
									</div>

									<div className="space-y-2">
										<Label htmlFor="centerId">
											{t("committee.center")}
											{selectedType?.requiresCenter && <span className="text-destructive ml-1">*</span>}
										</Label>
										<Select value={watch("centerId") || "none"} onValueChange={handleCenterChange}>
											<SelectTrigger>
												<SelectValue placeholder={t("committee.selectCenter")} />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="none">{t("committee.hqLevel")}</SelectItem>
												{centers?.map((center) => (
													<SelectItem key={center.id} value={center.id}>
														{isAmharic && center.nameAm ? center.nameAm : center.name}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</div>
								</div>

								<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
									<div className="space-y-2">
										<Label htmlFor="code">{t("committee.code")}</Label>
										<Input id="code" {...register("code")} aria-invalid={!!errors.code} />
										{errors.code && <p className="text-sm text-destructive">{errors.code.message}</p>}
									</div>

									<div className="space-y-2">
										<Label htmlFor="establishedDate">{t("committee.establishedDate")}</Label>
										<Input
											id="establishedDate"
											type="date"
											{...register("establishedDate")}
											aria-invalid={!!errors.establishedDate}
										/>
										{errors.establishedDate && (
											<p className="text-sm text-destructive">{errors.establishedDate.message}</p>
										)}
									</div>
								</div>
							</>
						)}

						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
							<div className="space-y-2">
								<Label htmlFor="name">{t("committee.name")}</Label>
								<Input id="name" {...register("name")} aria-invalid={!!errors.name} />
								{errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
							</div>

							<div className="space-y-2">
								<Label htmlFor="nameAm">{t("committee.nameAm")}</Label>
								<Input id="nameAm" {...register("nameAm")} />
							</div>
						</div>

						<div className="space-y-2">
							<Label htmlFor="description">{t("committee.description")}</Label>
							<Textarea id="description" {...register("description")} rows={2} />
						</div>

						<div className="space-y-2">
							<Label htmlFor="descriptionAm">{t("committee.descriptionAm")}</Label>
							<Textarea id="descriptionAm" {...register("descriptionAm")} rows={2} />
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
		prevProps.committee?.id === nextProps.committee?.id &&
		prevProps.isLoading === nextProps.isLoading,
);

CommitteeFormDialog.displayName = "CommitteeFormDialog";
