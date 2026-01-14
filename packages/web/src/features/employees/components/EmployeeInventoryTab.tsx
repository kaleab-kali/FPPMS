import { AlertCircle, Box, Package, RotateCcw } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";
import { useEmployeeInventoryAssignments } from "#web/api/inventory/inventory.queries";
import { Badge } from "#web/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "#web/components/ui/card";
import { Skeleton } from "#web/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "#web/components/ui/table";
import type { Employee } from "#web/types/employee";

interface EmployeeInventoryTabProps {
	employee: Employee;
	isAmharic: boolean;
}

export const EmployeeInventoryTab = React.memo(
	({ employee, isAmharic }: EmployeeInventoryTabProps) => {
		const { t } = useTranslation("inventory");
		const { t: tCommon } = useTranslation("common");

		const { data: assignmentsData, isLoading } = useEmployeeInventoryAssignments(employee.id, {
			isReturned: false,
		});

		const { data: historyData, isLoading: isLoadingHistory } = useEmployeeInventoryAssignments(employee.id, {
			isReturned: true,
			limit: 5,
		});

		const formatDate = React.useCallback((dateString?: string) => {
			if (!dateString) return "-";
			return new Date(dateString).toLocaleDateString();
		}, []);

		const getConditionBadgeVariant = React.useCallback((condition: string) => {
			const lowerCondition = condition.toLowerCase();
			if (lowerCondition.includes("good") || lowerCondition.includes("new")) return "default";
			if (lowerCondition.includes("fair") || lowerCondition.includes("used")) return "secondary";
			if (lowerCondition.includes("poor") || lowerCondition.includes("damaged")) return "destructive";
			return "outline";
		}, []);

		if (isLoading) {
			return (
				<div className="space-y-4">
					<Skeleton className="h-32" />
					<Skeleton className="h-48" />
				</div>
			);
		}

		const activeAssignments = assignmentsData?.data ?? [];
		const returnedAssignments = historyData?.data ?? [];

		return (
			<div className="space-y-6">
				<Card>
					<CardHeader>
						<div className="flex items-center gap-2">
							<Package className="h-5 w-5" />
							<CardTitle>{t("currentAssignments")}</CardTitle>
						</div>
						<CardDescription>{t("itemsCurrentlyAssigned")}</CardDescription>
					</CardHeader>
					<CardContent>
						{activeAssignments.length === 0 ? (
							<div className="flex flex-col items-center justify-center py-8 text-center">
								<Box className="h-12 w-12 text-muted-foreground mb-4" />
								<p className="text-muted-foreground">{t("noActiveAssignments")}</p>
							</div>
						) : (
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>{t("itemName")}</TableHead>
										<TableHead>{t("category")}</TableHead>
										<TableHead className="text-center">{t("quantity")}</TableHead>
										<TableHead>{t("serialNumber")}</TableHead>
										<TableHead>{t("assignedDate")}</TableHead>
										<TableHead>{t("condition")}</TableHead>
										<TableHead>{t("type")}</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{activeAssignments.map((assignment) => {
										const itemName =
											isAmharic && assignment.itemTypeNameAm ? assignment.itemTypeNameAm : assignment.itemTypeName;
										const isOverdue =
											!assignment.isPermanent &&
											assignment.expectedReturnDate &&
											new Date(assignment.expectedReturnDate) < new Date();

										return (
											<TableRow key={assignment.id} className={isOverdue ? "bg-destructive/5" : ""}>
												<TableCell className="font-medium">
													<div className="flex items-center gap-2">
														{itemName}
														{isOverdue && (
															<AlertCircle className="h-4 w-4 text-destructive" aria-label={t("overdue")} />
														)}
													</div>
												</TableCell>
												<TableCell>{assignment.categoryName}</TableCell>
												<TableCell className="text-center">{assignment.quantity}</TableCell>
												<TableCell>{assignment.serialNumber ?? assignment.assetTag ?? "-"}</TableCell>
												<TableCell>{formatDate(assignment.assignedDate)}</TableCell>
												<TableCell>
													<Badge variant={getConditionBadgeVariant(assignment.conditionAtAssignment)}>
														{assignment.conditionAtAssignment}
													</Badge>
												</TableCell>
												<TableCell>
													<Badge variant={assignment.isPermanent ? "default" : "secondary"}>
														{assignment.isPermanent ? t("permanent") : t("temporary")}
													</Badge>
												</TableCell>
											</TableRow>
										);
									})}
								</TableBody>
							</Table>
						)}
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<div className="flex items-center gap-2">
							<RotateCcw className="h-5 w-5" />
							<CardTitle>{t("returnHistory")}</CardTitle>
						</div>
						<CardDescription>{t("recentlyReturnedItems")}</CardDescription>
					</CardHeader>
					<CardContent>
						{isLoadingHistory ? (
							<Skeleton className="h-32" />
						) : returnedAssignments.length === 0 ? (
							<p className="text-center text-muted-foreground py-4">{t("noReturnHistory")}</p>
						) : (
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>{t("itemName")}</TableHead>
										<TableHead>{t("assignedDate")}</TableHead>
										<TableHead>{t("returnedDate")}</TableHead>
										<TableHead>{t("conditionAtReturn")}</TableHead>
										<TableHead>{tCommon("status")}</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{returnedAssignments.map((assignment) => {
										const itemName =
											isAmharic && assignment.itemTypeNameAm ? assignment.itemTypeNameAm : assignment.itemTypeName;

										return (
											<TableRow key={assignment.id}>
												<TableCell className="font-medium">{itemName}</TableCell>
												<TableCell>{formatDate(assignment.assignedDate)}</TableCell>
												<TableCell>{formatDate(assignment.returnedDate)}</TableCell>
												<TableCell>
													{assignment.conditionAtReturn ? (
														<Badge variant={getConditionBadgeVariant(assignment.conditionAtReturn)}>
															{assignment.conditionAtReturn}
														</Badge>
													) : (
														"-"
													)}
												</TableCell>
												<TableCell>
													{assignment.isLost ? (
														<Badge variant="destructive">{t("lost")}</Badge>
													) : assignment.isDamaged ? (
														<Badge variant="destructive">{t("damaged")}</Badge>
													) : (
														<Badge variant="secondary">{t("returned")}</Badge>
													)}
												</TableCell>
											</TableRow>
										);
									})}
								</TableBody>
							</Table>
						)}
					</CardContent>
				</Card>
			</div>
		);
	},
	(prev, next) => prev.employee.id === next.employee.id && prev.isAmharic === next.isAmharic,
);

EmployeeInventoryTab.displayName = "EmployeeInventoryTab";
