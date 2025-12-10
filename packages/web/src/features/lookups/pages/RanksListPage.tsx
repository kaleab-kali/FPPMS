import type { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useCreateRank, useDeleteRank, useUpdateRank } from "#web/api/ranks/ranks.mutations.ts";
import { useRanks } from "#web/api/ranks/ranks.queries.ts";
import { ConfirmDialog } from "#web/components/common/ConfirmDialog.tsx";
import { DataTable } from "#web/components/common/DataTable.tsx";
import { Badge } from "#web/components/ui/badge.tsx";
import { Button } from "#web/components/ui/button.tsx";
import { Card, CardContent, CardHeader, CardTitle } from "#web/components/ui/card.tsx";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "#web/components/ui/dropdown-menu.tsx";
import { RankFormDialog } from "#web/features/lookups/components/RankFormDialog.tsx";
import type { CreateRankRequest, Rank, UpdateRankRequest } from "#web/types/rank.ts";

export const RanksListPage = React.memo(
	() => {
		const { t } = useTranslation("lookups");
		const { t: tCommon } = useTranslation("common");

		const [formOpen, setFormOpen] = React.useState(false);
		const [deleteOpen, setDeleteOpen] = React.useState(false);
		const [selectedRank, setSelectedRank] = React.useState<Rank | undefined>();

		const { data, isLoading } = useRanks();
		const createMutation = useCreateRank();
		const updateMutation = useUpdateRank();
		const deleteMutation = useDeleteRank();

		const ranks = data ?? [];

		const handleCreate = React.useCallback(() => {
			setSelectedRank(undefined);
			setFormOpen(true);
		}, []);

		const handleEdit = React.useCallback((rank: Rank) => {
			setSelectedRank(rank);
			setFormOpen(true);
		}, []);

		const handleDeleteClick = React.useCallback((rank: Rank) => {
			setSelectedRank(rank);
			setDeleteOpen(true);
		}, []);

		const handleFormSubmit = React.useCallback(
			(data: CreateRankRequest | UpdateRankRequest) => {
				if (selectedRank) {
					updateMutation.mutate(
						{ id: selectedRank.id, data },
						{
							onSuccess: () => {
								toast.success(tCommon("success"));
								setFormOpen(false);
								setSelectedRank(undefined);
							},
							onError: () => {
								toast.error(tCommon("error"));
							},
						},
					);
				} else {
					createMutation.mutate(data as CreateRankRequest, {
						onSuccess: () => {
							toast.success(tCommon("success"));
							setFormOpen(false);
						},
						onError: () => {
							toast.error(tCommon("error"));
						},
					});
				}
			},
			[selectedRank, createMutation, updateMutation, tCommon],
		);

		const handleDeleteConfirm = React.useCallback(() => {
			if (selectedRank) {
				deleteMutation.mutate(selectedRank.id, {
					onSuccess: () => {
						toast.success(tCommon("success"));
						setDeleteOpen(false);
						setSelectedRank(undefined);
					},
					onError: () => {
						toast.error(tCommon("error"));
					},
				});
			}
		}, [selectedRank, deleteMutation, tCommon]);

		const { i18n } = useTranslation();
		const isAmharic = i18n.language === "am";

		const columns = React.useMemo<ColumnDef<Rank>[]>(
			() => [
				{
					accessorKey: "name",
					header: t("rank.name"),
					cell: ({ row }) => {
						const rank = row.original;
						const displayName = isAmharic && rank.nameAm ? rank.nameAm : rank.name;
						return <span className="font-medium">{displayName}</span>;
					},
				},
				{
					accessorKey: "code",
					header: t("rank.code"),
				},
				{
					accessorKey: "level",
					header: t("rank.level"),
				},
				{
					accessorKey: "category",
					header: t("rank.category"),
					cell: ({ row }) => <span className="text-sm">{String(row.getValue("category")).replace(/_/g, " ")}</span>,
				},
				{
					accessorKey: "baseSalary",
					header: t("rank.baseSalary"),
					cell: ({ row }) => <span className="text-sm">{Number(row.getValue("baseSalary")).toLocaleString()}</span>,
				},
				{
					accessorKey: "isActive",
					header: tCommon("status"),
					cell: ({ row }) => (
						<Badge variant={row.getValue("isActive") ? "default" : "secondary"}>
							{row.getValue("isActive") ? tCommon("active") : tCommon("inactive")}
						</Badge>
					),
				},
				{
					id: "actions",
					header: tCommon("actions"),
					cell: ({ row }) => {
						const rank = row.original;
						return (
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button variant="ghost" size="icon" className="h-8 w-8">
										<MoreHorizontal className="h-4 w-4" />
										<span className="sr-only">{tCommon("actions")}</span>
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align="end">
									<DropdownMenuItem onClick={() => handleEdit(rank)}>
										<Pencil className="mr-2 h-4 w-4" />
										{tCommon("edit")}
									</DropdownMenuItem>
									<DropdownMenuItem onClick={() => handleDeleteClick(rank)} className="text-destructive">
										<Trash2 className="mr-2 h-4 w-4" />
										{tCommon("delete")}
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						);
					},
				},
			],
			[t, tCommon, handleEdit, handleDeleteClick, isAmharic],
		);

		return (
			<div className="space-y-6">
				<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
					<div>
						<h1 className="text-2xl font-bold">{t("rank.title")}</h1>
					</div>
					<Button onClick={handleCreate} className="w-full sm:w-auto">
						<Plus className="mr-2 h-4 w-4" />
						{t("rank.create")}
					</Button>
				</div>

				<Card>
					<CardHeader>
						<CardTitle>{t("rank.title")}</CardTitle>
					</CardHeader>
					<CardContent>
						<DataTable columns={columns} data={ranks} isLoading={isLoading} searchColumn="name" />
					</CardContent>
				</Card>

				<RankFormDialog
					open={formOpen}
					onOpenChange={setFormOpen}
					onSubmit={handleFormSubmit}
					rank={selectedRank}
					isLoading={createMutation.isPending || updateMutation.isPending}
				/>

				<ConfirmDialog
					open={deleteOpen}
					onOpenChange={setDeleteOpen}
					title={tCommon("confirm")}
					description={t("rank.deleteConfirm")}
					onConfirm={handleDeleteConfirm}
					isLoading={deleteMutation.isPending}
					variant="destructive"
				/>
			</div>
		);
	},
	() => true,
);

RanksListPage.displayName = "RanksListPage";
