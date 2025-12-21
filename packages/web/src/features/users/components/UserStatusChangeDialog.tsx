import { AlertTriangle, ArrowRightLeft, Ban, Power } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";
import { Button } from "#web/components/ui/button.tsx";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "#web/components/ui/dialog.tsx";
import { Label } from "#web/components/ui/label.tsx";
import { RadioGroup, RadioGroupItem } from "#web/components/ui/radio-group.tsx";
import { Textarea } from "#web/components/ui/textarea.tsx";
import type { User, UserStatus } from "#web/types/user.ts";

interface UserStatusChangeDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onConfirm: (status: UserStatus, reason: string) => void;
	user: User | undefined;
	isLoading: boolean;
}

const STATUS_OPTIONS = [
	{
		value: "INACTIVE" as const,
		labelKey: "statusChange.inactive",
		descriptionKey: "statusChange.inactiveDescription",
		icon: Power,
	},
	{
		value: "TRANSFERRED" as const,
		labelKey: "statusChange.transferred",
		descriptionKey: "statusChange.transferredDescription",
		icon: ArrowRightLeft,
	},
	{
		value: "TERMINATED" as const,
		labelKey: "statusChange.terminated",
		descriptionKey: "statusChange.terminatedDescription",
		icon: Ban,
	},
] as const;

export const UserStatusChangeDialog = React.memo(
	({ open, onOpenChange, onConfirm, user, isLoading }: UserStatusChangeDialogProps) => {
		const { t } = useTranslation("users");
		const { t: tCommon } = useTranslation("common");

		const [selectedStatus, setSelectedStatus] = React.useState<UserStatus>("INACTIVE");
		const [reason, setReason] = React.useState("");
		const [error, setError] = React.useState("");

		React.useEffect(() => {
			if (open) {
				setSelectedStatus("INACTIVE");
				setReason("");
				setError("");
			}
		}, [open]);

		const handleSubmit = React.useCallback(
			(e: React.FormEvent) => {
				e.preventDefault();
				setError("");

				if (!reason.trim()) {
					setError(t("statusChange.reasonRequired"));
					return;
				}

				if (reason.trim().length < 10) {
					setError(t("statusChange.reasonTooShort"));
					return;
				}

				onConfirm(selectedStatus, reason.trim());
			},
			[selectedStatus, reason, onConfirm, t],
		);

		const handleStatusChange = React.useCallback((value: string) => {
			setSelectedStatus(value as UserStatus);
		}, []);

		const handleReasonChange = React.useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
			setReason(e.target.value);
		}, []);

		return (
			<Dialog open={open} onOpenChange={onOpenChange}>
				<DialogContent className="sm:max-w-lg">
					<form onSubmit={handleSubmit}>
						<DialogHeader>
							<DialogTitle className="flex items-center gap-2">
								<AlertTriangle className="h-5 w-5 text-amber-500" />
								{t("statusChange.title")}
							</DialogTitle>
							<DialogDescription>{t("statusChange.description", { username: user?.username })}</DialogDescription>
						</DialogHeader>

						<div className="space-y-6 py-4">
							{error && <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}

							<div className="space-y-3">
								<Label>{t("statusChange.selectStatus")}</Label>
								<RadioGroup value={selectedStatus} onValueChange={handleStatusChange} className="space-y-3">
									{STATUS_OPTIONS.map((option) => {
										const Icon = option.icon;
										return (
											<div
												key={option.value}
												className="flex items-start space-x-3 rounded-lg border p-4 hover:bg-muted/50"
											>
												<RadioGroupItem value={option.value} id={option.value} className="mt-1" />
												<div className="flex-1 space-y-1">
													<Label htmlFor={option.value} className="flex items-center gap-2 cursor-pointer">
														<Icon className="h-4 w-4" />
														{t(option.labelKey)}
													</Label>
													<p className="text-sm text-muted-foreground">{t(option.descriptionKey)}</p>
												</div>
											</div>
										);
									})}
								</RadioGroup>
							</div>

							<div className="space-y-2">
								<Label htmlFor="reason">{t("statusChange.reason")}</Label>
								<Textarea
									id="reason"
									value={reason}
									onChange={handleReasonChange}
									placeholder={t("statusChange.reasonPlaceholder")}
									rows={3}
									disabled={isLoading}
								/>
								<p className="text-xs text-muted-foreground">{t("statusChange.reasonHint")}</p>
							</div>
						</div>

						<DialogFooter className="gap-2">
							<Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
								{tCommon("cancel")}
							</Button>
							<Button type="submit" variant="destructive" disabled={isLoading}>
								{isLoading ? tCommon("loading") : t("statusChange.confirm")}
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>
		);
	},
	(prevProps, nextProps) =>
		prevProps.open === nextProps.open &&
		prevProps.isLoading === nextProps.isLoading &&
		prevProps.user?.id === nextProps.user?.id,
);

UserStatusChangeDialog.displayName = "UserStatusChangeDialog";
