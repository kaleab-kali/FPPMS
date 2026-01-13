import type { ColumnDef } from "@tanstack/react-table";
import { Archive, CheckCircle, Copy, Eye, MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
	useActivateSalaryScale,
	useArchiveSalaryScale,
	useDeleteSalaryScale,
	useDuplicateSalaryScale,
} from "#web/api/salary-scale/salary-scale.mutations.ts";
import { useSalaryScales } from "#web/api/salary-scale/salary-scale.queries.ts";
import { ConfirmDialog } from "#web/components/common/ConfirmDialog.tsx";
import { DataTable } from "#web/components/common/DataTable.tsx";
import { Badge } from "#web/components/ui/badge.tsx";
import { Button } from "#web/components/ui/button.tsx";
import { Card, CardContent, CardHeader, CardTitle } from "#web/components/ui/card.tsx";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "#web/components/ui/dialog.tsx";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "#web/components/ui/dropdown-menu.tsx";
import { Input } from "#web/components/ui/input.tsx";
import { Label } from "#web/components/ui/label.tsx";
import type { SalaryScaleListItem, SalaryScaleStatus } from "#web/types/salary-scale.ts";

const STATUS_VARIANTS: Record<SalaryScaleStatus, "default" | "secondary" | "outline"> = {
	DRAFT: "outline",
	ACTIVE: "default",
	ARCHIVED: "secondary",
} as const;

export const SalaryScalesListPage = React.memo(
	() => {
		const { t } = useTranslation("salary-scale");
		const { t: tCommon } = useTranslation("common");
		const { i18n } = useTranslation();
		const navigate = useNavigate();
		const isAmharic = i18n.language === "am";

		const [deleteOpen, setDeleteOpen] = React.useState(false);
		const [activateOpen, setActivateOpen] = React.useState(false);
		const [archiveOpen, setArchiveOpen] = React.useState(false);
		const [duplicateOpen, setDuplicateOpen] = React.useState(false);
		const [selectedScale, setSelectedScale] = React.useState<SalaryScaleListItem | undefined>();
		const [newCode, setNewCode] = React.useState("");

		const { data, isLoading } = useSalaryScales();
		const deleteMutation = useDeleteSalaryScale();
		const activateMutation = useActivateSalaryScale();
		const archiveMutation = useArchiveSalaryScale();
		const duplicateMutation = useDuplicateSalaryScale();

		const scales = data ?? [];

		const handleCreate = React.useCallback(() => {
			navigate("/salary/scale/new");
		}, [navigate]);

		const handleView = React.useCallback(
			(scale: SalaryScaleListItem) => {
				navigate(`/salary/scale/${scale.id}`);
			},
			[navigate],
		);

		const handleEdit = React.useCallback(
			(scale: SalaryScaleListItem) => {
				navigate(`/salary/scale/${scale.id}/edit`);
			},
			[navigate],
		);

		const handleDeleteClick = React.useCallback((scale: SalaryScaleListItem) => {
			setSelectedScale(scale);
			setDeleteOpen(true);
		}, []);

		const handleActivateClick = React.useCallback((scale: SalaryScaleListItem) => {
			setSelectedScale(scale);
			setActivateOpen(true);
		}, []);

		const handleArchiveClick = React.useCallback((scale: SalaryScaleListItem) => {
			setSelectedScale(scale);
			setArchiveOpen(true);
		}, []);

		const handleDuplicateClick = React.useCallback((scale: SalaryScaleListItem) => {
			setSelectedScale(scale);
			setNewCode(`${scale.code}-COPY`);
			setDuplicateOpen(true);
		}, []);

		const handleDeleteConfirm = React.useCallback(() => {
			if (selectedScale) {
				deleteMutation.mutate(selectedScale.id, {
					onSuccess: () => {
						toast.success(tCommon("success"));
						setDeleteOpen(false);
						setSelectedScale(undefined);
					},
					onError: () => {
						toast.error(tCommon("error"));
					},
				});
			}
		}, [selectedScale, deleteMutation, tCommon]);

		const handleActivateConfirm = React.useCallback(() => {
			if (selectedScale) {
				activateMutation.mutate(selectedScale.id, {
					onSuccess: () => {
						toast.success(tCommon("success"));
						setActivateOpen(false);
						setSelectedScale(undefined);
					},
					onError: () => {
						toast.error(tCommon("error"));
					},
				});
			}
		}, [selectedScale, activateMutation, tCommon]);

		const handleArchiveConfirm = React.useCallback(() => {
			if (selectedScale) {
				archiveMutation.mutate(selectedScale.id, {
					onSuccess: () => {
						toast.success(tCommon("success"));
						setArchiveOpen(false);
						setSelectedScale(undefined);
					},
					onError: () => {
						toast.error(tCommon("error"));
					},
				});
			}
		}, [selectedScale, archiveMutation, tCommon]);

		const handleDuplicateConfirm = React.useCallback(() => {
			if (selectedScale && newCode.trim()) {
				duplicateMutation.mutate(
					{ id: selectedScale.id, newCode: newCode.trim() },
					{
						onSuccess: () => {
							toast.success(tCommon("success"));
							setDuplicateOpen(false);
							setSelectedScale(undefined);
							setNewCode("");
						},
						onError: () => {
							toast.error(tCommon("error"));
						},
					},
				);
			}
		}, [selectedScale, newCode, duplicateMutation, tCommon]);

		const formatDate = React.useCallback((dateString: string) => {
			return new Date(dateString).toLocaleDateString();
		}, []);

		const columns = React.useMemo<ColumnDef<SalaryScaleListItem>[]>(
			() => [
				{
					accessorKey: "code",
					header: t("code"),
					cell: ({ row }) => <span className="font-medium">{row.getValue("code")}</span>,
				},
				{
					accessorKey: "name",
					header: t("name"),
					cell: ({ row }) => {
						const scale = row.original;
						const displayName = isAmharic && scale.nameAm ? scale.nameAm : scale.name;
						return <span>{displayName}</span>;
					},
				},
				{
					accessorKey: "effectiveDate",
					header: t("effectiveDate"),
					cell: ({ row }) => formatDate(row.getValue("effectiveDate")),
				},
				{
					accessorKey: "expiryDate",
					header: t("expiryDate"),
					cell: ({ row }) => {
						const value = row.getValue("expiryDate") as string | undefined;
						return value ? formatDate(value) : "-";
					},
				},
				{
					accessorKey: "status",
					header: t("status"),
					cell: ({ row }) => {
						const status = row.getValue("status") as SalaryScaleStatus;
						return <Badge variant={STATUS_VARIANTS[status]}>{t(`status${status}`)}</Badge>;
					},
				},
				{
					accessorKey: "rankCount",
					header: t("rankCount"),
					cell: ({ row }) => <span className="text-center">{row.getValue("rankCount")}</span>,
				},
				{
					id: "actions",
					header: tCommon("actions"),
					cell: ({ row }) => {
						const scale = row.original;
						const canActivate = scale.status === "DRAFT";
						const canArchive = scale.status === "ACTIVE";
						const canDelete = scale.status !== "ACTIVE";
						const canEdit = scale.status !== "ARCHIVED";

						return (
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button variant="ghost" size="icon" className="h-8 w-8">
										<MoreHorizontal className="h-4 w-4" />
										<span className="sr-only">{tCommon("actions")}</span>
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align="end">
									<DropdownMenuItem onClick={() => handleView(scale)}>
										<Eye className="mr-2 h-4 w-4" />
										{t("viewDetails")}
									</DropdownMenuItem>
									{canEdit && (
										<DropdownMenuItem onClick={() => handleEdit(scale)}>
											<Pencil className="mr-2 h-4 w-4" />
											{tCommon("edit")}
										</DropdownMenuItem>
									)}
									<DropdownMenuItem onClick={() => handleDuplicateClick(scale)}>
										<Copy className="mr-2 h-4 w-4" />
										{t("duplicate")}
									</DropdownMenuItem>
									<DropdownMenuSeparator />
									{canActivate && (
										<DropdownMenuItem onClick={() => handleActivateClick(scale)}>
											<CheckCircle className="mr-2 h-4 w-4" />
											{t("activate")}
										</DropdownMenuItem>
									)}
									{canArchive && (
										<DropdownMenuItem onClick={() => handleArchiveClick(scale)}>
											<Archive className="mr-2 h-4 w-4" />
											{t("archive")}
										</DropdownMenuItem>
									)}
									{canDelete && (
										<>
											<DropdownMenuSeparator />
											<DropdownMenuItem onClick={() => handleDeleteClick(scale)} className="text-destructive">
												<Trash2 className="mr-2 h-4 w-4" />
												{tCommon("delete")}
											</DropdownMenuItem>
										</>
									)}
								</DropdownMenuContent>
							</DropdownMenu>
						);
					},
				},
			],
			[
				t,
				tCommon,
				isAmharic,
				formatDate,
				handleView,
				handleEdit,
				handleDeleteClick,
				handleActivateClick,
				handleArchiveClick,
				handleDuplicateClick,
			],
		);

		return (
			<div className="space-y-6">
				<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
					<div>
						<h1 className="text-2xl font-bold">{t("title")}</h1>
					</div>
					<Button onClick={handleCreate} className="w-full sm:w-auto">
						<Plus className="mr-2 h-4 w-4" />
						{t("create")}
					</Button>
				</div>

				<Card>
					<CardHeader>
						<CardTitle>{t("listTitle")}</CardTitle>
					</CardHeader>
					<CardContent>
						<DataTable columns={columns} data={scales} isLoading={isLoading} searchColumn="name" />
					</CardContent>
				</Card>

				<ConfirmDialog
					open={deleteOpen}
					onOpenChange={setDeleteOpen}
					title={tCommon("confirm")}
					description={t("deleteConfirm")}
					onConfirm={handleDeleteConfirm}
					isLoading={deleteMutation.isPending}
					variant="destructive"
				/>

				<ConfirmDialog
					open={activateOpen}
					onOpenChange={setActivateOpen}
					title={tCommon("confirm")}
					description={t("activateConfirm")}
					onConfirm={handleActivateConfirm}
					isLoading={activateMutation.isPending}
				/>

				<ConfirmDialog
					open={archiveOpen}
					onOpenChange={setArchiveOpen}
					title={tCommon("confirm")}
					description={t("archiveConfirm")}
					onConfirm={handleArchiveConfirm}
					isLoading={archiveMutation.isPending}
				/>

				<Dialog open={duplicateOpen} onOpenChange={setDuplicateOpen}>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>{t("duplicateTitle")}</DialogTitle>
							<DialogDescription>{t("duplicateDescription")}</DialogDescription>
						</DialogHeader>
						<div className="grid gap-4 py-4">
							<div className="grid gap-2">
								<Label htmlFor="newCode">{t("newCode")}</Label>
								<Input
									id="newCode"
									value={newCode}
									onChange={(e) => setNewCode(e.target.value)}
									placeholder={t("code")}
								/>
							</div>
						</div>
						<DialogFooter>
							<Button variant="outline" onClick={() => setDuplicateOpen(false)}>
								{tCommon("cancel")}
							</Button>
							<Button onClick={handleDuplicateConfirm} disabled={!newCode.trim() || duplicateMutation.isPending}>
								{duplicateMutation.isPending ? tCommon("saving") : t("duplicate")}
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			</div>
		);
	},
	() => true,
);

SalaryScalesListPage.displayName = "SalaryScalesListPage";
