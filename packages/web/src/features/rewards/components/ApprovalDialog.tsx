import { zodResolver } from "@hookform/resolvers/zod";
import * as React from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { z } from "zod";
import { useApproveReward, useRejectReward } from "#web/api/rewards/rewards.mutations";
import { Button } from "#web/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "#web/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "#web/components/ui/form";
import { Textarea } from "#web/components/ui/textarea";

const approveSchema = z.object({
	notes: z.string().optional(),
});

const rejectSchema = z.object({
	rejectionReason: z.string().min(10, "validation.rejectionReasonMin"),
	notes: z.string().optional(),
});

type ApproveFormValues = z.infer<typeof approveSchema>;
type RejectFormValues = z.infer<typeof rejectSchema>;

interface ApprovalDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	rewardId: string;
	mode: "approve" | "reject";
}

const ApprovalDialogComponent = ({ open, onOpenChange, rewardId, mode }: ApprovalDialogProps): React.ReactElement => {
	const { t } = useTranslation("rewards");
	const approveMutation = useApproveReward();
	const rejectMutation = useRejectReward();

	const approveForm = useForm<ApproveFormValues>({
		resolver: zodResolver(approveSchema),
		defaultValues: {
			notes: "",
		},
	});

	const rejectForm = useForm<RejectFormValues>({
		resolver: zodResolver(rejectSchema),
		defaultValues: {
			rejectionReason: "",
			notes: "",
		},
	});

	React.useEffect(() => {
		if (open) {
			if (mode === "approve") {
				approveForm.reset({ notes: "" });
			} else {
				rejectForm.reset({ rejectionReason: "", notes: "" });
			}
		}
	}, [open, mode, approveForm, rejectForm]);

	const handleApprove = React.useCallback(
		async (values: ApproveFormValues) => {
			await approveMutation.mutateAsync({
				id: rewardId,
				dto: { notes: values.notes || undefined },
			});
			toast.success(t("messages.approveSuccess"));
			onOpenChange(false);
		},
		[rewardId, approveMutation, onOpenChange, t],
	);

	const handleReject = React.useCallback(
		async (values: RejectFormValues) => {
			await rejectMutation.mutateAsync({
				id: rewardId,
				dto: {
					rejectionReason: values.rejectionReason,
					notes: values.notes || undefined,
				},
			});
			toast.success(t("messages.rejectSuccess"));
			onOpenChange(false);
		},
		[rewardId, rejectMutation, onOpenChange, t],
	);

	const isSubmitting = approveMutation.isPending || rejectMutation.isPending;

	if (mode === "approve") {
		return (
			<Dialog open={open} onOpenChange={onOpenChange}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>{t("serviceRewards.approve")}</DialogTitle>
					</DialogHeader>
					<Form {...approveForm}>
						<form onSubmit={approveForm.handleSubmit(handleApprove)} className="space-y-4">
							<FormField
								control={approveForm.control}
								name="notes"
								render={({ field }) => (
									<FormItem>
										<FormLabel>{t("serviceRewards.approvalNotes")}</FormLabel>
										<FormControl>
											<Textarea {...field} rows={4} />
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
									{isSubmitting ? "Approving..." : t("actions.approve")}
								</Button>
							</DialogFooter>
						</form>
					</Form>
				</DialogContent>
			</Dialog>
		);
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{t("serviceRewards.reject")}</DialogTitle>
				</DialogHeader>
				<Form {...rejectForm}>
					<form onSubmit={rejectForm.handleSubmit(handleReject)} className="space-y-4">
						<FormField
							control={rejectForm.control}
							name="rejectionReason"
							render={({ field }) => (
								<FormItem>
									<FormLabel>{t("serviceRewards.rejectionReason")}</FormLabel>
									<FormControl>
										<Textarea {...field} rows={3} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={rejectForm.control}
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
							<Button type="submit" variant="destructive" disabled={isSubmitting}>
								{isSubmitting ? "Rejecting..." : t("actions.reject")}
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
};

ApprovalDialogComponent.displayName = "ApprovalDialog";

export const ApprovalDialog = React.memo(
	ApprovalDialogComponent,
	(prevProps, nextProps) =>
		prevProps.open === nextProps.open && prevProps.rewardId === nextProps.rewardId && prevProps.mode === nextProps.mode,
);
