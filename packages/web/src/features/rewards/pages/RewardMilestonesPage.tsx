import { Plus } from "lucide-react";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useDeleteMilestone } from "#web/api/rewards/rewards.mutations";
import { useMilestones } from "#web/api/rewards/rewards.queries";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "#web/components/ui/alert-dialog";
import { Button } from "#web/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "#web/components/ui/card";
import { Switch } from "#web/components/ui/switch";
import { MilestoneFormDialog } from "#web/features/rewards/components/MilestoneFormDialog";
import { MilestoneTable } from "#web/features/rewards/components/MilestoneTable";
import type { RewardMilestone } from "#web/types/rewards";

const RewardMilestonesPageComponent = (): React.ReactElement => {
	const { t } = useTranslation("rewards");
	const [includeInactive, setIncludeInactive] = React.useState(false);
	const [dialogOpen, setDialogOpen] = React.useState(false);
	const [selectedMilestone, setSelectedMilestone] = React.useState<RewardMilestone | null>(null);
	const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
	const [milestoneToDelete, setMilestoneToDelete] = React.useState<RewardMilestone | null>(null);

	const { data: milestones, isLoading } = useMilestones(includeInactive);
	const deleteMutation = useDeleteMilestone();

	const handleCreate = React.useCallback(() => {
		setSelectedMilestone(null);
		setDialogOpen(true);
	}, []);

	const handleEdit = React.useCallback((milestone: RewardMilestone) => {
		setSelectedMilestone(milestone);
		setDialogOpen(true);
	}, []);

	const handleDeleteClick = React.useCallback((milestone: RewardMilestone) => {
		setMilestoneToDelete(milestone);
		setDeleteDialogOpen(true);
	}, []);

	const handleDeleteConfirm = React.useCallback(async () => {
		if (!milestoneToDelete) return;

		await deleteMutation.mutateAsync(milestoneToDelete.id);
		toast.success(t("messages.deleteSuccess"));
		setDeleteDialogOpen(false);
		setMilestoneToDelete(null);
	}, [milestoneToDelete, deleteMutation, t]);

	return (
		<div className="container mx-auto py-6 space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold">{t("milestones.title")}</h1>
					<p className="text-muted-foreground">{t("milestones.subtitle")}</p>
				</div>
				<Button onClick={handleCreate}>
					<Plus className="h-4 w-4 mr-2" />
					{t("milestones.create")}
				</Button>
			</div>

			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<div>
							<CardTitle>{t("milestones.title")}</CardTitle>
							<CardDescription>Configure service milestone rewards for employees</CardDescription>
						</div>
						<div className="flex items-center gap-2">
							<Switch checked={includeInactive} onCheckedChange={setIncludeInactive} />
							<span className="text-sm">Include inactive</span>
						</div>
					</div>
				</CardHeader>
				<CardContent>
					<MilestoneTable
						data={milestones ?? []}
						isLoading={isLoading}
						onEdit={handleEdit}
						onDelete={handleDeleteClick}
					/>
				</CardContent>
			</Card>

			<MilestoneFormDialog open={dialogOpen} onOpenChange={setDialogOpen} milestone={selectedMilestone} />

			<AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>{t("milestones.delete")}</AlertDialogTitle>
						<AlertDialogDescription>{t("milestones.deleteConfirm")}</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>{t("actions.cancel")}</AlertDialogCancel>
						<AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground">
							Delete
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
};

RewardMilestonesPageComponent.displayName = "RewardMilestonesPage";

export const RewardMilestonesPage = React.memo(RewardMilestonesPageComponent, () => true);
