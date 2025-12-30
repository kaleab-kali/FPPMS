import type { ColumnDef } from "@tanstack/react-table";
import { Eye, MoreHorizontal, Plus } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useCenters } from "#web/api/centers/centers.queries.ts";
import { useComplaints } from "#web/api/complaints/complaints.queries.ts";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "#web/components/ui/select.tsx";
import type {
	ComplaintArticle,
	ComplaintFilterParams,
	ComplaintListItem,
	ComplaintStatus,
} from "#web/types/complaint.ts";
import { COMPLAINT_ARTICLE_LABELS, COMPLAINT_STATUS_COLORS, COMPLAINT_STATUS_LABELS } from "#web/types/complaint.ts";

export const ComplaintsListPage = React.memo(
	() => {
		const { t } = useTranslation("complaints");
		const { t: tCommon } = useTranslation("common");
		const navigate = useNavigate();
		const { i18n } = useTranslation();
		const isAmharic = i18n.language === "am";

		const [filters, setFilters] = React.useState<ComplaintFilterParams>({});

		const { data: centers } = useCenters();
		const { data, isLoading } = useComplaints(filters);

		const complaints = data ?? [];

		const handleCreate = React.useCallback(() => {
			navigate("/complaints/register");
		}, [navigate]);

		const handleView = React.useCallback(
			(complaint: ComplaintListItem) => {
				navigate(`/complaints/${complaint.id}`);
			},
			[navigate],
		);

		const handleArticleFilter = React.useCallback((value: string) => {
			setFilters((prev) => ({ ...prev, article: value === "all" ? undefined : (value as ComplaintArticle) }));
		}, []);

		const handleStatusFilter = React.useCallback((value: string) => {
			setFilters((prev) => ({ ...prev, status: value === "all" ? undefined : (value as ComplaintStatus) }));
		}, []);

		const handleCenterFilter = React.useCallback((value: string) => {
			setFilters((prev) => ({ ...prev, centerId: value === "all" ? undefined : value }));
		}, []);

		const columns = React.useMemo<ColumnDef<ComplaintListItem>[]>(
			() => [
				{
					accessorKey: "complaintNumber",
					header: t("complaint.number"),
					cell: ({ row }) => <span className="font-mono text-sm">{row.getValue("complaintNumber")}</span>,
				},
				{
					accessorKey: "article",
					header: t("complaint.article"),
					cell: ({ row }) => {
						const article = row.getValue("article") as ComplaintArticle;
						const variant = article === "ARTICLE_30" ? "secondary" : "destructive";
						return <Badge variant={variant}>{COMPLAINT_ARTICLE_LABELS[article]}</Badge>;
					},
				},
				{
					accessorKey: "accusedEmployee",
					header: t("complaint.accused"),
					cell: ({ row }) => {
						const employee = row.original.accusedEmployee;
						if (!employee) return "-";
						const displayName = isAmharic && employee.fullNameAm ? employee.fullNameAm : employee.fullName;
						return (
							<div>
								<div className="font-medium">{displayName}</div>
								<div className="text-sm text-muted-foreground">{employee.employeeId}</div>
							</div>
						);
					},
				},
				{
					accessorKey: "offenseCode",
					header: t("complaint.offense"),
					cell: ({ row }) => <span className="font-mono text-sm">{row.getValue("offenseCode")}</span>,
				},
				{
					accessorKey: "incidentDate",
					header: t("complaint.incidentDate"),
					cell: ({ row }) => {
						const date = row.getValue("incidentDate") as string;
						return new Date(date).toLocaleDateString();
					},
				},
				{
					accessorKey: "registeredDate",
					header: t("complaint.registeredDate"),
					cell: ({ row }) => {
						const date = row.getValue("registeredDate") as string;
						return new Date(date).toLocaleDateString();
					},
				},
				{
					accessorKey: "status",
					header: tCommon("status"),
					cell: ({ row }) => {
						const status = row.getValue("status") as ComplaintStatus;
						return <Badge className={COMPLAINT_STATUS_COLORS[status]}>{COMPLAINT_STATUS_LABELS[status]}</Badge>;
					},
				},
				{
					id: "actions",
					header: tCommon("actions"),
					cell: ({ row }) => {
						const complaint = row.original;
						return (
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button variant="ghost" size="icon" className="h-8 w-8">
										<MoreHorizontal className="h-4 w-4" />
										<span className="sr-only">{tCommon("actions")}</span>
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align="end">
									<DropdownMenuItem onClick={() => handleView(complaint)}>
										<Eye className="mr-2 h-4 w-4" />
										{tCommon("view")}
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						);
					},
				},
			],
			[t, tCommon, handleView, isAmharic],
		);

		return (
			<div className="space-y-6">
				<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
					<div>
						<h1 className="text-2xl font-bold">{t("title")}</h1>
						<p className="text-muted-foreground">{t("description")}</p>
					</div>
					<Button onClick={handleCreate} className="w-full sm:w-auto">
						<Plus className="mr-2 h-4 w-4" />
						{t("action.register")}
					</Button>
				</div>

				<Card>
					<CardHeader>
						<CardTitle>{t("list.title")}</CardTitle>
						<div className="flex flex-wrap gap-4 pt-4">
							<Select value={filters.article ?? "all"} onValueChange={handleArticleFilter}>
								<SelectTrigger className="w-[180px]">
									<SelectValue placeholder={t("filter.byArticle")} />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">{t("filter.allArticles")}</SelectItem>
									<SelectItem value="ARTICLE_30">{COMPLAINT_ARTICLE_LABELS.ARTICLE_30}</SelectItem>
									<SelectItem value="ARTICLE_31">{COMPLAINT_ARTICLE_LABELS.ARTICLE_31}</SelectItem>
								</SelectContent>
							</Select>

							<Select value={filters.status ?? "all"} onValueChange={handleStatusFilter}>
								<SelectTrigger className="w-[220px]">
									<SelectValue placeholder={t("filter.byStatus")} />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">{t("filter.allStatuses")}</SelectItem>
									{Object.entries(COMPLAINT_STATUS_LABELS).map(([value, label]) => (
										<SelectItem key={value} value={value}>
											{label}
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
						</div>
					</CardHeader>
					<CardContent>
						<DataTable columns={columns} data={complaints} isLoading={isLoading} searchColumn="complaintNumber" />
					</CardContent>
				</Card>
			</div>
		);
	},
	() => true,
);

ComplaintsListPage.displayName = "ComplaintsListPage";
