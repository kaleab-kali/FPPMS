import React from "react";
import { useTranslation } from "react-i18next";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "#web/components/ui/alert-dialog.tsx";

interface ConfirmDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	title: string;
	description: string;
	onConfirm: () => void;
	isLoading?: boolean;
	variant?: "default" | "destructive";
}

export const ConfirmDialog = React.memo(
	({
		open,
		onOpenChange,
		title,
		description,
		onConfirm,
		isLoading = false,
		variant = "default",
	}: ConfirmDialogProps) => {
		const { t } = useTranslation("common");

		const handleConfirm = React.useCallback(() => {
			if (isLoading) return;
			onConfirm();
		}, [onConfirm, isLoading]);

		return (
			<AlertDialog open={open} onOpenChange={onOpenChange}>
				<AlertDialogContent className="max-w-[90vw] sm:max-w-lg">
					<AlertDialogHeader>
						<AlertDialogTitle>{title}</AlertDialogTitle>
						<AlertDialogDescription>{description}</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter className="flex-col gap-2 sm:flex-row">
						<AlertDialogCancel disabled={isLoading}>{t("cancel")}</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleConfirm}
							disabled={isLoading}
							className={
								variant === "destructive" ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : ""
							}
						>
							{isLoading ? t("loading") : t("confirm")}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		);
	},
	(prevProps, nextProps) =>
		prevProps.open === nextProps.open &&
		prevProps.title === nextProps.title &&
		prevProps.description === nextProps.description &&
		prevProps.isLoading === nextProps.isLoading,
);

ConfirmDialog.displayName = "ConfirmDialog";
