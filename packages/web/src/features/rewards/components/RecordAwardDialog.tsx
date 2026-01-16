import { zodResolver } from "@hookform/resolvers/zod";
import * as React from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { z } from "zod";
import { useRecordAward } from "#web/api/rewards/rewards.mutations";
import { Button } from "#web/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "#web/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "#web/components/ui/form";
import { Input } from "#web/components/ui/input";
import { Textarea } from "#web/components/ui/textarea";

const recordAwardSchema = z.object({
	awardDate: z.string().min(1, "validation.awardDateRequired"),
	ceremonyDetails: z.string().optional(),
	certificateNumber: z.string().optional(),
	notes: z.string().optional(),
});

type RecordAwardFormValues = z.infer<typeof recordAwardSchema>;

interface RecordAwardDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	rewardId: string;
}

const RecordAwardDialogComponent = ({ open, onOpenChange, rewardId }: RecordAwardDialogProps): React.ReactElement => {
	const { t } = useTranslation("rewards");
	const recordMutation = useRecordAward();

	const form = useForm<RecordAwardFormValues>({
		resolver: zodResolver(recordAwardSchema),
		defaultValues: {
			awardDate: new Date().toISOString().split("T")[0],
			ceremonyDetails: "",
			certificateNumber: "",
			notes: "",
		},
	});

	React.useEffect(() => {
		if (open) {
			form.reset({
				awardDate: new Date().toISOString().split("T")[0],
				ceremonyDetails: "",
				certificateNumber: "",
				notes: "",
			});
		}
	}, [open, form]);

	const handleSubmit = React.useCallback(
		async (values: RecordAwardFormValues) => {
			await recordMutation.mutateAsync({
				id: rewardId,
				dto: {
					awardDate: values.awardDate,
					ceremonyDetails: values.ceremonyDetails || undefined,
					certificateNumber: values.certificateNumber || undefined,
					notes: values.notes || undefined,
				},
			});
			toast.success(t("messages.awardRecorded"));
			onOpenChange(false);
		},
		[rewardId, recordMutation, onOpenChange, t],
	);

	const isSubmitting = recordMutation.isPending;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-2xl">
				<DialogHeader>
					<DialogTitle>{t("serviceRewards.recordAward")}</DialogTitle>
				</DialogHeader>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
						<FormField
							control={form.control}
							name="awardDate"
							render={({ field }) => (
								<FormItem>
									<FormLabel>{t("serviceRewards.awardDate")}</FormLabel>
									<FormControl>
										<Input type="date" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="certificateNumber"
							render={({ field }) => (
								<FormItem>
									<FormLabel>{t("serviceRewards.certificateNumber")}</FormLabel>
									<FormControl>
										<Input {...field} placeholder="CERT-2025-0001" />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="ceremonyDetails"
							render={({ field }) => (
								<FormItem>
									<FormLabel>{t("serviceRewards.ceremonyDetails")}</FormLabel>
									<FormControl>
										<Textarea {...field} rows={3} placeholder="Details about the award ceremony..." />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="notes"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Additional Notes</FormLabel>
									<FormControl>
										<Textarea {...field} rows={2} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<DialogFooter>
							<Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
								{t("actions.cancel")}
							</Button>
							<Button type="submit" disabled={isSubmitting}>
								{isSubmitting ? "Recording..." : t("actions.save")}
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
};

RecordAwardDialogComponent.displayName = "RecordAwardDialog";

export const RecordAwardDialog = React.memo(
	RecordAwardDialogComponent,
	(prevProps, nextProps) => prevProps.open === nextProps.open && prevProps.rewardId === nextProps.rewardId,
);
