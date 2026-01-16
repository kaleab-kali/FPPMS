import { format } from "date-fns";
import { AlertCircle, FileText } from "lucide-react";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { useEmployeeCorrespondence } from "#web/api/correspondence/correspondence.queries";
import { Badge } from "#web/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "#web/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "#web/components/ui/table";
import type { CorrespondenceDocument } from "#web/types/correspondence";

interface EmployeeCorrespondenceTabProps {
	employeeId: string;
}

const getPriorityVariant = (priority: string): "default" | "secondary" | "destructive" | "outline" => {
	switch (priority.toUpperCase()) {
		case "URGENT":
		case "HIGH":
			return "destructive";
		case "NORMAL":
			return "secondary";
		default:
			return "outline";
	}
};

const EmployeeCorrespondenceTabComponent = ({ employeeId }: EmployeeCorrespondenceTabProps): React.ReactElement => {
	const { t } = useTranslation(["correspondence", "common"]);
	const { data, isLoading } = useEmployeeCorrespondence(employeeId);

	const documents = data?.data ?? [];

	if (isLoading) {
		return (
			<div className="flex items-center justify-center py-10">
				<div className="text-muted-foreground">{t("common:loading")}</div>
			</div>
		);
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<FileText className="h-5 w-5" />
					{t("correspondence:employeeTab.title")}
				</CardTitle>
			</CardHeader>
			<CardContent>
				{documents.length === 0 ? (
					<div className="text-center py-8 text-muted-foreground">{t("correspondence:employeeTab.noDocuments")}</div>
				) : (
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>{t("correspondence:table.referenceNumber")}</TableHead>
								<TableHead>{t("correspondence:table.subject")}</TableHead>
								<TableHead>{t("correspondence:table.direction")}</TableHead>
								<TableHead>{t("correspondence:table.documentDate")}</TableHead>
								<TableHead>{t("correspondence:table.priority")}</TableHead>
								<TableHead>{t("correspondence:table.status")}</TableHead>
								<TableHead>{t("correspondence:table.overdue")}</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{documents.map((doc: CorrespondenceDocument) => (
								<TableRow key={doc.id}>
									<TableCell className="font-mono text-sm">{doc.referenceNumber}</TableCell>
									<TableCell className="max-w-[200px] truncate" title={doc.subject}>
										{doc.subject}
									</TableCell>
									<TableCell>
										<Badge variant={doc.direction === "INCOMING" ? "default" : "secondary"}>
											{t(`correspondence:direction.${doc.direction.toLowerCase()}`)}
										</Badge>
									</TableCell>
									<TableCell>{format(new Date(doc.documentDate), "MMM dd, yyyy")}</TableCell>
									<TableCell>
										<Badge variant={getPriorityVariant(doc.priority)}>
											{t(`correspondence:priority.${doc.priority.toLowerCase()}`)}
										</Badge>
									</TableCell>
									<TableCell>
										<Badge variant="outline">{t(`correspondence:status.${doc.status.toLowerCase()}`)}</Badge>
									</TableCell>
									<TableCell>
										{(doc.isOverdue || doc.isResponseOverdue) && (
											<AlertCircle
												className="h-5 w-5 text-destructive"
												aria-label={t("correspondence:alerts.overdue")}
											/>
										)}
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				)}
			</CardContent>
		</Card>
	);
};

EmployeeCorrespondenceTabComponent.displayName = "EmployeeCorrespondenceTab";

export const EmployeeCorrespondenceTab = React.memo(
	EmployeeCorrespondenceTabComponent,
	(prevProps, nextProps) => prevProps.employeeId === nextProps.employeeId,
);
