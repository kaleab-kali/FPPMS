import { FileText, Filter, Plus, Search } from "lucide-react";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { useCorrespondenceList } from "#web/api/correspondence/correspondence.queries";
import { Pagination } from "#web/components/common/Pagination";
import { Button } from "#web/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "#web/components/ui/card";
import { Input } from "#web/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "#web/components/ui/select";
import type { CorrespondenceDocument, CorrespondenceFilter, DocumentDirection } from "#web/types/correspondence";
import { DOCUMENT_PRIORITIES, DOCUMENT_STATUSES } from "#web/types/correspondence";
import { CorrespondenceFormDialog } from "../components/CorrespondenceFormDialog";
import { CorrespondenceTable } from "../components/CorrespondenceTable";

const CorrespondenceListPageComponent = (): React.ReactElement => {
	const { t } = useTranslation(["correspondence", "common"]);
	const [filter, setFilter] = React.useState<CorrespondenceFilter>({
		page: 1,
		limit: 10,
	});
	const [searchTerm, setSearchTerm] = React.useState("");
	const [isFormOpen, setIsFormOpen] = React.useState(false);
	const [editingDocument, setEditingDocument] = React.useState<CorrespondenceDocument | null>(null);

	const { data, isLoading } = useCorrespondenceList(filter);

	const handleSearch = React.useCallback(() => {
		setFilter((prev) => ({ ...prev, search: searchTerm, page: 1 }));
	}, [searchTerm]);

	const handleFilterChange = React.useCallback((key: keyof CorrespondenceFilter, value: string | undefined) => {
		setFilter((prev) => ({ ...prev, [key]: value === "all" ? undefined : value, page: 1 }));
	}, []);

	const handlePageChange = React.useCallback((page: number) => {
		setFilter((prev) => ({ ...prev, page }));
	}, []);

	const handleView = React.useCallback((doc: CorrespondenceDocument) => {
		setEditingDocument(doc);
		setIsFormOpen(true);
	}, []);

	const handleEdit = React.useCallback((doc: CorrespondenceDocument) => {
		setEditingDocument(doc);
		setIsFormOpen(true);
	}, []);

	const handleCreate = React.useCallback(() => {
		setEditingDocument(null);
		setIsFormOpen(true);
	}, []);

	const handleCloseForm = React.useCallback((open: boolean) => {
		setIsFormOpen(open);
		if (!open) {
			setEditingDocument(null);
		}
	}, []);

	return (
		<div className="container mx-auto py-6 space-y-6">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-3">
					<FileText className="h-8 w-8 text-primary" />
					<div>
						<h1 className="text-2xl font-bold">{t("correspondence:title")}</h1>
						<p className="text-muted-foreground">{t("correspondence:description")}</p>
					</div>
				</div>
				<Button onClick={handleCreate}>
					<Plus className="h-4 w-4 mr-2" />
					{t("correspondence:actions.create")}
				</Button>
			</div>

			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Filter className="h-5 w-5" />
						{t("correspondence:filters.title")}
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-1 md:grid-cols-5 gap-4">
						<div className="flex gap-2 md:col-span-2">
							<Input
								placeholder={t("correspondence:filters.searchPlaceholder")}
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								onKeyDown={(e) => e.key === "Enter" && handleSearch()}
							/>
							<Button variant="outline" onClick={handleSearch}>
								<Search className="h-4 w-4" />
							</Button>
						</div>

						<Select
							value={filter.direction ?? "all"}
							onValueChange={(value) => handleFilterChange("direction", value as DocumentDirection)}
						>
							<SelectTrigger>
								<SelectValue placeholder={t("correspondence:filters.direction")} />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">{t("common:all")}</SelectItem>
								<SelectItem value="INCOMING">{t("correspondence:direction.incoming")}</SelectItem>
								<SelectItem value="OUTGOING">{t("correspondence:direction.outgoing")}</SelectItem>
							</SelectContent>
						</Select>

						<Select value={filter.priority ?? "all"} onValueChange={(value) => handleFilterChange("priority", value)}>
							<SelectTrigger>
								<SelectValue placeholder={t("correspondence:filters.priority")} />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">{t("common:all")}</SelectItem>
								{DOCUMENT_PRIORITIES.map((p) => (
									<SelectItem key={p} value={p}>
										{t(`correspondence:priority.${p.toLowerCase()}`)}
									</SelectItem>
								))}
							</SelectContent>
						</Select>

						<Select value={filter.status ?? "all"} onValueChange={(value) => handleFilterChange("status", value)}>
							<SelectTrigger>
								<SelectValue placeholder={t("correspondence:filters.status")} />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">{t("common:all")}</SelectItem>
								{DOCUMENT_STATUSES.map((s) => (
									<SelectItem key={s} value={s}>
										{t(`correspondence:status.${s.toLowerCase()}`)}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				</CardContent>
			</Card>

			<CorrespondenceTable data={data?.data ?? []} isLoading={isLoading} onView={handleView} onEdit={handleEdit} />

			{data?.meta && (
				<Pagination currentPage={data.meta.page} totalPages={data.meta.totalPages} onPageChange={handlePageChange} />
			)}

			<CorrespondenceFormDialog open={isFormOpen} onOpenChange={handleCloseForm} document={editingDocument} />
		</div>
	);
};

CorrespondenceListPageComponent.displayName = "CorrespondenceListPage";

export const CorrespondenceListPage = React.memo(CorrespondenceListPageComponent);
