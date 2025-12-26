import type { ColumnDef } from "@tanstack/react-table";
import { Eye, MoreHorizontal, Pause, Pencil, Play, Plus, Trash2 } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useCenters } from "#web/api/centers/centers.queries.ts";
import {
	useCreateCommittee,
	useDissolveCommittee,
	useReactivateCommittee,
	useSuspendCommittee,
	useUpdateCommittee,
} from "#web/api/committees/committees.mutations.ts";
import { useCommittees, useCommitteeTypes } from "#web/api/committees/committees.queries.ts";
import { ConfirmDialog } from "#web/components/common/ConfirmDialog.tsx";
import { DataTable } from "#web/components/common/DataTable.tsx";
import { Badge } from "#web/components/ui/badge.tsx";
import { Button } from "#web/components/ui/button.tsx";
import { Card, CardContent, CardHeader, CardTitle } from "#web/components/ui/card.tsx";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "#web/components/ui/dropdown-menu.tsx";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "#web/components/ui/select.tsx";
import { CommitteeFormDialog } from "#web/features/committees/components/CommitteeFormDialog.tsx";
import type {
	Committee,
	CommitteeFilterParams,
	CommitteeStatus,
	CreateCommitteeRequest,
	UpdateCommitteeRequest,
} from "#web/types/committee.ts";

const STATUS_COLORS: Record<CommitteeStatus, "default" | "secondary" | "destructive"> = {
	ACTIVE: "default",
	SUSPENDED: "secondary",
	DISSOLVED: "destructive",
} as const;

export const CommitteesListPage = React.memo(
	() => {
		const { t } = useTranslation("committees");
		const { t: tCommon } = useTranslation("common");
		const navigate = useNavigate();

		const [formOpen, setFormOpen] = React.useState(false);
		const [suspendOpen, setSuspendOpen] = React.useState(false);
		const [reactivateOpen, setReactivateOpen] = React.useState(false);
		const [dissolveOpen, setDissolveOpen] = React.useState(false);
		const [selectedCommittee, setSelectedCommittee] = React.useState<Committee | undefined>();
		const [filters, setFilters] = React.useState<CommitteeFilterParams>({});

		const { data: committeeTypes } = useCommitteeTypes();
		const { data: centers } = useCenters();
		const { data, isLoading } = useCommittees(filters);
		const createMutation = useCreateCommittee();
		const updateMutation = useUpdateCommittee();
		const suspendMutation = useSuspendCommittee();
		const reactivateMutation = useReactivateCommittee();
		const dissolveMutation = useDissolveCommittee();

		const committees = data ?? [];

		const handleCreate = React.useCallback(() => {
			setSelectedCommittee(undefined);
			setFormOpen(true);
		}, []);

		const handleEdit = React.useCallback((committee: Committee) => {
			setSelectedCommittee(committee);
			setFormOpen(true);
		}, []);

		const handleView = React.useCallback(
			(committee: Committee) => {
				navigate(`/committees/${committee.id}`);
			},
			[navigate],
		);

		const handleSuspendClick = React.useCallback((committee: Committee) => {
			setSelectedCommittee(committee);
			setSuspendOpen(true);
		}, []);

		const handleReactivateClick = React.useCallback((committee: Committee) => {
			setSelectedCommittee(committee);
			setReactivateOpen(true);
		}, []);

		const handleDissolveClick = React.useCallback((committee: Committee) => {
			setSelectedCommittee(committee);
			setDissolveOpen(true);
		}, []);

		const handleFormSubmit = React.useCallback(
			(data: CreateCommitteeRequest | UpdateCommitteeRequest) => {
				if (selectedCommittee) {
					updateMutation.mutate(
						{ id: selectedCommittee.id, data },
						{
							onSuccess: () => {
								toast.success(tCommon("success"));
								setFormOpen(false);
								setSelectedCommittee(undefined);
							},
							onError: () => {
								toast.error(tCommon("error"));
							},
						},
					);
				} else {
					createMutation.mutate(data as CreateCommitteeRequest, {
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
			[selectedCommittee, createMutation, updateMutation, tCommon],
		);

		const handleSuspendConfirm = React.useCallback(() => {
			if (selectedCommittee) {
				suspendMutation.mutate(
					{ id: selectedCommittee.id, data: {} },
					{
						onSuccess: () => {
							toast.success(tCommon("success"));
							setSuspendOpen(false);
							setSelectedCommittee(undefined);
						},
						onError: () => {
							toast.error(tCommon("error"));
						},
					},
				);
			}
		}, [selectedCommittee, suspendMutation, tCommon]);

		const handleReactivateConfirm = React.useCallback(() => {
			if (selectedCommittee) {
				reactivateMutation.mutate(
					{ id: selectedCommittee.id, data: {} },
					{
						onSuccess: () => {
							toast.success(tCommon("success"));
							setReactivateOpen(false);
							setSelectedCommittee(undefined);
						},
						onError: () => {
							toast.error(tCommon("error"));
						},
					},
				);
			}
		}, [selectedCommittee, reactivateMutation, tCommon]);

		const handleDissolveConfirm = React.useCallback(() => {
			if (selectedCommittee) {
				dissolveMutation.mutate(
					{
						id: selectedCommittee.id,
						data: {
							dissolvedDate: new Date().toISOString().split("T")[0],
							dissolvedReason: "Committee dissolved by administrator",
						},
					},
					{
						onSuccess: () => {
							toast.success(tCommon("success"));
							setDissolveOpen(false);
							setSelectedCommittee(undefined);
						},
						onError: () => {
							toast.error(tCommon("error"));
						},
					},
				);
			}
		}, [selectedCommittee, dissolveMutation, tCommon]);

		const handleTypeFilter = React.useCallback((value: string) => {
			setFilters((prev) => ({ ...prev, committeeTypeId: value === "all" ? undefined : value }));
		}, []);

		const handleCenterFilter = React.useCallback((value: string) => {
			setFilters((prev) => ({ ...prev, centerId: value === "all" ? undefined : value }));
		}, []);

		const handleStatusFilter = React.useCallback((value: string) => {
			setFilters((prev) => ({ ...prev, status: value === "all" ? undefined : (value as CommitteeStatus) }));
		}, []);

		const { i18n } = useTranslation();
		const isAmharic = i18n.language === "am";

		const columns = React.useMemo<ColumnDef<Committee>[]>(
			() => [
				{
					accessorKey: "code",
					header: t("committee.code"),
					cell: ({ row }) => <span className="font-mono text-sm">{row.getValue("code")}</span>,
				},
				{
					accessorKey: "name",
					header: t("committee.name"),
					cell: ({ row }) => {
						const committee = row.original;
						const displayName = isAmharic && committee.nameAm ? committee.nameAm : committee.name;
						return <span className="font-medium">{displayName}</span>;
					},
				},
				{
					accessorKey: "committeeType",
					header: t("committee.type"),
					cell: ({ row }) => {
						const type = row.original.committeeType;
						if (!type) return "-";
						const displayName = isAmharic && type.nameAm ? type.nameAm : type.name;
						return <span>{displayName}</span>;
					},
				},
				{
					accessorKey: "center",
					header: t("committee.center"),
					cell: ({ row }) => {
						const center = row.original.center;
						if (!center) return <span className="text-muted-foreground">{t("committee.hqLevel")}</span>;
						const displayName = isAmharic && center.nameAm ? center.nameAm : center.name;
						return <span>{displayName}</span>;
					},
				},
				{
					accessorKey: "_count.members",
					header: t("committee.memberCount"),
					cell: ({ row }) => <span>{row.original._count?.members ?? 0}</span>,
				},
				{
					accessorKey: "status",
					header: tCommon("status"),
					cell: ({ row }) => {
						const status = row.getValue("status") as CommitteeStatus;
						return <Badge variant={STATUS_COLORS[status]}>{t(`status.${status.toLowerCase()}`)}</Badge>;
					},
				},
				{
					id: "actions",
					header: tCommon("actions"),
					cell: ({ row }) => {
						const committee = row.original;
						const isPermanent = committee.committeeType?.isPermanent ?? false;
						return (
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button variant="ghost" size="icon" className="h-8 w-8">
										<MoreHorizontal className="h-4 w-4" />
										<span className="sr-only">{tCommon("actions")}</span>
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align="end">
									<DropdownMenuItem onClick={() => handleView(committee)}>
										<Eye className="mr-2 h-4 w-4" />
										{tCommon("view")}
									</DropdownMenuItem>
									{committee.status !== "DISSOLVED" && (
										<DropdownMenuItem onClick={() => handleEdit(committee)}>
											<Pencil className="mr-2 h-4 w-4" />
											{tCommon("edit")}
										</DropdownMenuItem>
									)}
									<DropdownMenuSeparator />
									{committee.status === "ACTIVE" && (
										<DropdownMenuItem onClick={() => handleSuspendClick(committee)}>
											<Pause className="mr-2 h-4 w-4" />
											{t("action.suspend")}
										</DropdownMenuItem>
									)}
									{committee.status === "SUSPENDED" && (
										<DropdownMenuItem onClick={() => handleReactivateClick(committee)}>
											<Play className="mr-2 h-4 w-4" />
											{t("action.reactivate")}
										</DropdownMenuItem>
									)}
									{committee.status !== "DISSOLVED" && !isPermanent && (
										<DropdownMenuItem onClick={() => handleDissolveClick(committee)} className="text-destructive">
											<Trash2 className="mr-2 h-4 w-4" />
											{t("action.dissolve")}
										</DropdownMenuItem>
									)}
								</DropdownMenuContent>
							</DropdownMenu>
						);
					},
				},
			],
			[t, tCommon, handleView, handleEdit, handleSuspendClick, handleReactivateClick, handleDissolveClick, isAmharic],
		);

		return (
			<div className="space-y-6">
				<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
					<div>
						<h1 className="text-2xl font-bold">{t("committee.title")}</h1>
						<p className="text-muted-foreground">{t("committee.committeeDescription")}</p>
					</div>
					<Button onClick={handleCreate} className="w-full sm:w-auto">
						<Plus className="mr-2 h-4 w-4" />
						{t("committee.create")}
					</Button>
				</div>

				<Card>
					<CardHeader>
						<CardTitle>{t("committee.list")}</CardTitle>
						<div className="flex flex-wrap gap-4 pt-4">
							<Select value={filters.committeeTypeId ?? "all"} onValueChange={handleTypeFilter}>
								<SelectTrigger className="w-[200px]">
									<SelectValue placeholder={t("filter.byType")} />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">{t("filter.allTypes")}</SelectItem>
									{committeeTypes?.map((type) => (
										<SelectItem key={type.id} value={type.id}>
											{isAmharic && type.nameAm ? type.nameAm : type.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>

							<Select value={filters.centerId ?? "all"} onValueChange={handleCenterFilter}>
								<SelectTrigger className="w-[200px]">
									<SelectValue placeholder={t("filter.byCenter")} />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">{t("filter.allCenters")}</SelectItem>
									{centers?.map((center) => (
										<SelectItem key={center.id} value={center.id}>
											{isAmharic && center.nameAm ? center.nameAm : center.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>

							<Select value={filters.status ?? "all"} onValueChange={handleStatusFilter}>
								<SelectTrigger className="w-[150px]">
									<SelectValue placeholder={t("filter.byStatus")} />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">{t("filter.allStatuses")}</SelectItem>
									<SelectItem value="ACTIVE">{t("status.active")}</SelectItem>
									<SelectItem value="SUSPENDED">{t("status.suspended")}</SelectItem>
									<SelectItem value="DISSOLVED">{t("status.dissolved")}</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</CardHeader>
					<CardContent>
						<DataTable columns={columns} data={committees} isLoading={isLoading} searchColumn="name" />
					</CardContent>
				</Card>

				<CommitteeFormDialog
					open={formOpen}
					onOpenChange={setFormOpen}
					onSubmit={handleFormSubmit}
					committee={selectedCommittee}
					isLoading={createMutation.isPending || updateMutation.isPending}
				/>

				<ConfirmDialog
					open={suspendOpen}
					onOpenChange={setSuspendOpen}
					title={t("action.suspendTitle")}
					description={t("action.suspendDescription")}
					onConfirm={handleSuspendConfirm}
					isLoading={suspendMutation.isPending}
					variant="default"
				/>

				<ConfirmDialog
					open={reactivateOpen}
					onOpenChange={setReactivateOpen}
					title={t("action.reactivateTitle")}
					description={t("action.reactivateDescription")}
					onConfirm={handleReactivateConfirm}
					isLoading={reactivateMutation.isPending}
					variant="default"
				/>

				<ConfirmDialog
					open={dissolveOpen}
					onOpenChange={setDissolveOpen}
					title={t("action.dissolveTitle")}
					description={t("action.dissolveDescription")}
					onConfirm={handleDissolveConfirm}
					isLoading={dissolveMutation.isPending}
					variant="destructive"
				/>
			</div>
		);
	},
	() => true,
);

CommitteesListPage.displayName = "CommitteesListPage";
