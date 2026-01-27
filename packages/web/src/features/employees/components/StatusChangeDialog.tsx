import { AlertTriangle, Calendar, FileText, UserCheck, UserMinus, UserX } from "lucide-react";
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
import { Input } from "#web/components/ui/input.tsx";
import { Label } from "#web/components/ui/label.tsx";
import { RadioGroup, RadioGroupItem } from "#web/components/ui/radio-group.tsx";
import { Textarea } from "#web/components/ui/textarea.tsx";
import type { EmployeeStatus } from "#web/types/employee.ts";

type ArchiveStatus = "TERMINATED" | "RETIRED" | "SUSPENDED" | "DECEASED";
type StatusChangeType = ArchiveStatus | "ACTIVE";

interface StatusChangeData {
	status: ArchiveStatus;
	reason: string;
	effectiveDate: string;
	endDate?: string;
	notes?: string;
}

interface StatusChangeDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	employeeName: string;
	currentStatus?: EmployeeStatus;
	onConfirm: (data: StatusChangeData) => void;
	onReturnToActive?: () => void;
	isLoading?: boolean;
}

interface StatusOption {
	value: StatusChangeType;
	label: string;
	description: string;
	icon: React.ReactNode;
	requiresEndDate?: boolean;
	dateLabel: string;
}

const getTodayDate = (): string => new Date().toISOString().split("T")[0];
const NON_ACTIVE_STATUSES: EmployeeStatus[] = ["SUSPENDED", "ON_LEAVE", "TERMINATED", "RETIRED", "INACTIVE"];

export const StatusChangeDialog = React.memo(
	({
		open,
		onOpenChange,
		employeeName,
		currentStatus,
		onConfirm,
		onReturnToActive,
		isLoading,
	}: StatusChangeDialogProps) => {
		const { t } = useTranslation("employees");
		const showReturnToActive =
			currentStatus && NON_ACTIVE_STATUSES.includes(currentStatus) && currentStatus !== "DECEASED";
		const [selectedStatus, setSelectedStatus] = React.useState<StatusChangeType>(
			showReturnToActive ? "ACTIVE" : "TERMINATED",
		);
		const [reason, setReason] = React.useState("");
		const [effectiveDate, setEffectiveDate] = React.useState(getTodayDate());
		const [endDate, setEndDate] = React.useState("");
		const [notes, setNotes] = React.useState("");

		const statusOptions: StatusOption[] = React.useMemo(() => {
			const options: StatusOption[] = [];

			if (showReturnToActive) {
				options.push({
					value: "ACTIVE",
					label: t("statuses.ACTIVE"),
					description: t("statusDescriptions.active", { defaultValue: "Return employee to active status" }),
					icon: <UserCheck className="h-5 w-5 text-green-500" />,
					dateLabel: t("effectiveDate", { defaultValue: "Effective Date" }),
				});
			}

			if (currentStatus !== "SUSPENDED") {
				options.push({
					value: "SUSPENDED",
					label: t("statuses.SUSPENDED"),
					description: t("statusDescriptions.suspended"),
					icon: <AlertTriangle className="h-5 w-5 text-yellow-500" />,
					requiresEndDate: true,
					dateLabel: t("suspensionDate"),
				});
			}

			options.push(
				{
					value: "TERMINATED",
					label: t("statuses.TERMINATED"),
					description: t("statusDescriptions.terminated"),
					icon: <UserX className="h-5 w-5 text-red-500" />,
					dateLabel: t("terminationDate"),
				},
				{
					value: "RETIRED",
					label: t("statuses.RETIRED"),
					description: t("statusDescriptions.retired"),
					icon: <Calendar className="h-5 w-5 text-blue-500" />,
					dateLabel: t("retirementDate"),
				},
				{
					value: "DECEASED",
					label: t("statuses.DECEASED"),
					description: t("statusDescriptions.deceased"),
					icon: <UserMinus className="h-5 w-5 text-gray-500" />,
					dateLabel: t("dateOfDeath"),
				},
			);

			return options;
		}, [t, showReturnToActive, currentStatus]);

		const currentOption = React.useMemo(
			() => statusOptions.find((opt) => opt.value === selectedStatus),
			[statusOptions, selectedStatus],
		);

		const handleConfirm = React.useCallback(() => {
			if (selectedStatus === "ACTIVE" && onReturnToActive) {
				onReturnToActive();
			} else {
				onConfirm({
					status: selectedStatus as ArchiveStatus,
					reason,
					effectiveDate,
					endDate: currentOption?.requiresEndDate ? endDate : undefined,
					notes: notes || undefined,
				});
			}
		}, [selectedStatus, reason, effectiveDate, endDate, notes, currentOption, onConfirm, onReturnToActive]);

		const handleOpenChange = React.useCallback(
			(newOpen: boolean) => {
				if (!newOpen) {
					setSelectedStatus(showReturnToActive ? "ACTIVE" : "TERMINATED");
					setReason("");
					setEffectiveDate(getTodayDate());
					setEndDate("");
					setNotes("");
				}
				onOpenChange(newOpen);
			},
			[onOpenChange, showReturnToActive],
		);

		const isValid = React.useMemo(() => {
			if (selectedStatus === "ACTIVE") return true;
			if (!reason.trim()) return false;
			if (!effectiveDate) return false;
			if (currentOption?.requiresEndDate && !endDate) return false;
			return true;
		}, [selectedStatus, reason, effectiveDate, endDate, currentOption]);

		return (
			<Dialog open={open} onOpenChange={handleOpenChange}>
				<DialogContent className="sm:max-w-[500px]">
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2">
							<FileText className="h-5 w-5" />
							{t("changeEmployeeStatus")}
						</DialogTitle>
						<DialogDescription>{t("changeStatusDescription", { name: employeeName })}</DialogDescription>
					</DialogHeader>

					<div className="space-y-6 py-4">
						<div className="space-y-3">
							<Label className="text-sm font-medium">{t("selectStatus")}</Label>
							<RadioGroup
								value={selectedStatus}
								onValueChange={(value: string) => setSelectedStatus(value as ArchiveStatus)}
								className="grid grid-cols-2 gap-3"
							>
								{statusOptions.map((option) => (
									<div key={option.value} className="relative">
										<RadioGroupItem value={option.value} id={option.value} className="peer sr-only" />
										<Label
											htmlFor={option.value}
											className="flex flex-col items-center gap-2 rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
										>
											{option.icon}
											<span className="font-medium">{option.label}</span>
											<span className="text-xs text-muted-foreground text-center">{option.description}</span>
										</Label>
									</div>
								))}
							</RadioGroup>
						</div>

						{selectedStatus !== "ACTIVE" && (
							<>
								<div className="space-y-2">
									<Label htmlFor="reason" className="text-sm font-medium">
										{t("reason")} <span className="text-destructive">*</span>
									</Label>
									<Textarea
										id="reason"
										value={reason}
										onChange={(e) => setReason(e.target.value)}
										placeholder={t("enterReason")}
										className="min-h-20"
									/>
								</div>

								<div className="grid grid-cols-2 gap-4">
									<div className="space-y-2">
										<Label htmlFor="effectiveDate" className="text-sm font-medium">
											{currentOption?.dateLabel} <span className="text-destructive">*</span>
										</Label>
										<Input
											id="effectiveDate"
											type="date"
											value={effectiveDate}
											onChange={(e) => setEffectiveDate(e.target.value)}
										/>
									</div>

									{currentOption?.requiresEndDate && (
										<div className="space-y-2">
											<Label htmlFor="endDate" className="text-sm font-medium">
												{t("suspensionEndDate")} <span className="text-destructive">*</span>
											</Label>
											<Input
												id="endDate"
												type="date"
												value={endDate}
												onChange={(e) => setEndDate(e.target.value)}
												min={effectiveDate}
											/>
										</div>
									)}
								</div>
							</>
						)}

						{selectedStatus === "DECEASED" && (
							<div className="space-y-2">
								<Label htmlFor="notes" className="text-sm font-medium">
									{t("additionalNotes")}
								</Label>
								<Textarea
									id="notes"
									value={notes}
									onChange={(e) => setNotes(e.target.value)}
									placeholder={t("enterNotes")}
									className="min-h-[60px]"
								/>
							</div>
						)}
					</div>

					<DialogFooter>
						<Button variant="outline" onClick={() => handleOpenChange(false)} disabled={isLoading}>
							{t("cancel")}
						</Button>
						<Button variant="destructive" onClick={handleConfirm} disabled={!isValid || isLoading}>
							{isLoading ? t("processing") : t("confirmStatusChange")}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		);
	},
	(prev, next) =>
		prev.open === next.open &&
		prev.employeeName === next.employeeName &&
		prev.currentStatus === next.currentStatus &&
		prev.isLoading === next.isLoading &&
		prev.onConfirm === next.onConfirm &&
		prev.onReturnToActive === next.onReturnToActive,
);

StatusChangeDialog.displayName = "StatusChangeDialog";

export type { StatusChangeData, ArchiveStatus };
