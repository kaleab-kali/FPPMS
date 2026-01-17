import { zodResolver } from "@hookform/resolvers/zod";
import * as React from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { z } from "zod";
import { useCreateMilestone, useUpdateMilestone } from "#web/api/rewards/rewards.mutations";
import { Button } from "#web/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "#web/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "#web/components/ui/form";
import { Input } from "#web/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "#web/components/ui/select";
import { Switch } from "#web/components/ui/switch";
import { Textarea } from "#web/components/ui/textarea";
import type { RewardMilestone } from "#web/types/rewards";

const REWARD_TYPES = ["MEDAL", "CERTIFICATE", "MONETARY", "PROMOTION", "OTHER"] as const;

const milestoneSchema = z.object({
	yearsOfService: z.number().min(1, "validation.yearsMin").max(50, "validation.yearsMax"),
	name: z.string().min(1, "validation.nameRequired"),
	nameAm: z.string().optional(),
	description: z.string().optional(),
	rewardType: z.string().min(1, "validation.rewardTypeRequired"),
	monetaryValue: z.number().optional(),
	isActive: z.boolean().optional(),
});

type MilestoneFormValues = z.infer<typeof milestoneSchema>;

interface MilestoneFormDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	milestone?: RewardMilestone | null;
}

const MilestoneFormDialogComponent = ({
	open,
	onOpenChange,
	milestone,
}: MilestoneFormDialogProps): React.ReactElement => {
	const { t } = useTranslation("rewards");
	const createMutation = useCreateMilestone();
	const updateMutation = useUpdateMilestone();

	const isEditing = !!milestone;

	const form = useForm<MilestoneFormValues>({
		resolver: zodResolver(milestoneSchema),
		defaultValues: {
			yearsOfService: milestone?.yearsOfService ?? 10,
			name: milestone?.name ?? "",
			nameAm: milestone?.nameAm ?? "",
			description: milestone?.description ?? "",
			rewardType: milestone?.rewardType ?? "MEDAL",
			monetaryValue: milestone?.monetaryValue ?? undefined,
			isActive: milestone?.isActive ?? true,
		},
	});

	React.useEffect(() => {
		if (open) {
			form.reset({
				yearsOfService: milestone?.yearsOfService ?? 10,
				name: milestone?.name ?? "",
				nameAm: milestone?.nameAm ?? "",
				description: milestone?.description ?? "",
				rewardType: milestone?.rewardType ?? "MEDAL",
				monetaryValue: milestone?.monetaryValue ?? undefined,
				isActive: milestone?.isActive ?? true,
			});
		}
	}, [open, milestone, form]);

	const handleSubmit = React.useCallback(
		async (values: MilestoneFormValues) => {
			if (isEditing && milestone) {
				await updateMutation.mutateAsync({
					id: milestone.id,
					dto: {
						yearsOfService: values.yearsOfService,
						name: values.name,
						nameAm: values.nameAm || undefined,
						description: values.description || undefined,
						rewardType: values.rewardType,
						monetaryValue: values.monetaryValue,
						isActive: values.isActive,
					},
				});
				toast.success(t("messages.updateSuccess"));
			} else {
				await createMutation.mutateAsync({
					yearsOfService: values.yearsOfService,
					name: values.name,
					nameAm: values.nameAm || undefined,
					description: values.description || undefined,
					rewardType: values.rewardType,
					monetaryValue: values.monetaryValue,
					isActive: values.isActive,
				});
				toast.success(t("messages.createSuccess"));
			}
			onOpenChange(false);
		},
		[isEditing, milestone, createMutation, updateMutation, onOpenChange, t],
	);

	const isSubmitting = createMutation.isPending || updateMutation.isPending;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-2xl">
				<DialogHeader>
					<DialogTitle>{isEditing ? t("milestones.edit") : t("milestones.create")}</DialogTitle>
				</DialogHeader>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
						<div className="grid grid-cols-2 gap-4">
							<FormField
								control={form.control}
								name="yearsOfService"
								render={({ field }) => (
									<FormItem>
										<FormLabel>{t("milestones.yearsOfService")}</FormLabel>
										<FormControl>
											<Input
												type="number"
												{...field}
												onChange={(e) => field.onChange(parseInt(e.target.value, 10))}
												min={1}
												max={50}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="rewardType"
								render={({ field }) => (
									<FormItem>
										<FormLabel>{t("milestones.rewardType")}</FormLabel>
										<Select onValueChange={field.onChange} value={field.value}>
											<FormControl>
												<SelectTrigger>
													<SelectValue />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												{REWARD_TYPES.map((type) => (
													<SelectItem key={type} value={type}>
														{t(`rewardType.${type}`)}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						<div className="grid grid-cols-2 gap-4">
							<FormField
								control={form.control}
								name="name"
								render={({ field }) => (
									<FormItem>
										<FormLabel>{t("milestones.name")}</FormLabel>
										<FormControl>
											<Input {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="nameAm"
								render={({ field }) => (
									<FormItem>
										<FormLabel>{t("milestones.nameAm")}</FormLabel>
										<FormControl>
											<Input {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						<FormField
							control={form.control}
							name="description"
							render={({ field }) => (
								<FormItem>
									<FormLabel>{t("milestones.description")}</FormLabel>
									<FormControl>
										<Textarea {...field} rows={3} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<div className="grid grid-cols-2 gap-4">
							<FormField
								control={form.control}
								name="monetaryValue"
								render={({ field }) => (
									<FormItem>
										<FormLabel>{t("milestones.monetaryValue")}</FormLabel>
										<FormControl>
											<Input
												type="number"
												{...field}
												onChange={(e) => {
													const value = e.target.value;
													field.onChange(value ? parseFloat(value) : undefined);
												}}
												value={field.value ?? ""}
												step="0.01"
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="isActive"
								render={({ field }) => (
									<FormItem className="flex items-center gap-3 pt-8">
										<FormControl>
											<Switch checked={field.value} onCheckedChange={field.onChange} />
										</FormControl>
										<FormLabel className="!mt-0">{t("milestones.isActive")}</FormLabel>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						<DialogFooter>
							<Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
								{t("actions.cancel")}
							</Button>
							<Button type="submit" disabled={isSubmitting}>
								{isSubmitting ? "Saving..." : t("actions.save")}
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
};

MilestoneFormDialogComponent.displayName = "MilestoneFormDialog";

export const MilestoneFormDialog = React.memo(
	MilestoneFormDialogComponent,
	(prevProps, nextProps) => prevProps.open === nextProps.open && prevProps.milestone === nextProps.milestone,
);
