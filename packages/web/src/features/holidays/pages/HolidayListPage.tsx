import { Calendar, Pencil, Plus, Trash2, Wand2 } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useDeleteHoliday, useGenerateHolidays } from "#web/api/holidays/holidays.mutations";
import { useHolidays } from "#web/api/holidays/holidays.queries";
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
import { Badge } from "#web/components/ui/badge";
import { Button } from "#web/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "#web/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "#web/components/ui/table";
import { formatEthiopianDate, gregorianToEthiopian } from "#web/lib/ethiopian-calendar";
import type { Holiday, HolidayType } from "#web/types/holiday";
import { HolidayFormDialog } from "../components/HolidayFormDialog";

const HOLIDAY_TYPE_COLORS: Record<HolidayType, string> = {
	NATIONAL: "bg-blue-100 text-blue-800",
	RELIGIOUS: "bg-purple-100 text-purple-800",
	COMPANY: "bg-green-100 text-green-800",
	OTHER: "bg-gray-100 text-gray-800",
} as const;

const HOLIDAY_TYPE_LABELS: Record<HolidayType, string> = {
	NATIONAL: "National",
	RELIGIOUS: "Religious",
	COMPANY: "Company",
	OTHER: "Other",
} as const;

export const HolidayListPage = React.memo(() => {
	const { t } = useTranslation("holidays");
	const { data: holidays, isLoading } = useHolidays();
	const deleteHoliday = useDeleteHoliday();
	const generateHolidays = useGenerateHolidays();

	const [isFormOpen, setIsFormOpen] = React.useState(false);
	const [selectedHoliday, setSelectedHoliday] = React.useState<Holiday | undefined>();
	const [deleteId, setDeleteId] = React.useState<string | null>(null);

	const handleCreate = React.useCallback(() => {
		setSelectedHoliday(undefined);
		setIsFormOpen(true);
	}, []);

	const handleEdit = React.useCallback((holiday: Holiday) => {
		setSelectedHoliday(holiday);
		setIsFormOpen(true);
	}, []);

	const handleDelete = React.useCallback(async () => {
		if (!deleteId) return;

		deleteHoliday.mutate(deleteId, {
			onSuccess: () => {
				toast.success(t("deleteSuccess"));
				setDeleteId(null);
			},
			onError: () => {
				toast.error(t("deleteError"));
			},
		});
	}, [deleteId, deleteHoliday, t]);

	const handleGenerate = React.useCallback(() => {
		const ethiopianDate = gregorianToEthiopian(new Date());

		generateHolidays.mutate(ethiopianDate.year, {
			onSuccess: (result) => {
				toast.success(t("generateSuccess"), {
					description: `${result.generated} holidays generated for year ${result.year}`,
				});
			},
			onError: () => {
				toast.error(t("generateError"));
			},
		});
	}, [generateHolidays, t]);

	const formatDate = React.useCallback((dateStr: string) => {
		const date = new Date(dateStr);
		const gregorian = date.toLocaleDateString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
		});
		const ethiopian = formatEthiopianDate(date, { format: "long" });
		return `${gregorian} (${ethiopian})`;
	}, []);

	return (
		<div className="container mx-auto py-6 space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold">{t("title")}</h1>
					<p className="text-muted-foreground">{t("description")}</p>
				</div>
				<div className="flex gap-2">
					<Button variant="outline" onClick={handleGenerate} disabled={generateHolidays.isPending}>
						<Wand2 className="mr-2 h-4 w-4" />
						{t("generateRecurring")}
					</Button>
					<Button onClick={handleCreate}>
						<Plus className="mr-2 h-4 w-4" />
						{t("addHoliday")}
					</Button>
				</div>
			</div>

			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Calendar className="h-5 w-5" />
						{t("holidayList")}
					</CardTitle>
				</CardHeader>
				<CardContent>
					{isLoading ? (
						<div className="flex justify-center py-8">
							<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
						</div>
					) : holidays && holidays.length > 0 ? (
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>{t("name")}</TableHead>
									<TableHead>{t("date")}</TableHead>
									<TableHead>{t("type")}</TableHead>
									<TableHead>{t("recurring")}</TableHead>
									<TableHead className="text-right">{t("actions")}</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{holidays.map((holiday) => (
									<TableRow key={holiday.id}>
										<TableCell>
											<div>
												<div className="font-medium">{holiday.name}</div>
												{holiday.nameAmharic && (
													<div className="text-sm text-muted-foreground">{holiday.nameAmharic}</div>
												)}
											</div>
										</TableCell>
										<TableCell>{formatDate(holiday.date)}</TableCell>
										<TableCell>
											<Badge className={HOLIDAY_TYPE_COLORS[holiday.type]}>{HOLIDAY_TYPE_LABELS[holiday.type]}</Badge>
										</TableCell>
										<TableCell>
											{holiday.isRecurring ? (
												<Badge variant="outline">{t("yes")}</Badge>
											) : (
												<span className="text-muted-foreground">{t("no")}</span>
											)}
										</TableCell>
										<TableCell className="text-right">
											<div className="flex justify-end gap-2">
												<Button variant="ghost" size="icon" onClick={() => handleEdit(holiday)}>
													<Pencil className="h-4 w-4" />
												</Button>
												<Button variant="ghost" size="icon" onClick={() => setDeleteId(holiday.id)}>
													<Trash2 className="h-4 w-4 text-destructive" />
												</Button>
											</div>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					) : (
						<div className="text-center py-8 text-muted-foreground">{t("noHolidays")}</div>
					)}
				</CardContent>
			</Card>

			<HolidayFormDialog open={isFormOpen} onOpenChange={setIsFormOpen} holiday={selectedHoliday} />

			<AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>{t("deleteConfirmTitle")}</AlertDialogTitle>
						<AlertDialogDescription>{t("deleteConfirmDescription")}</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
						<AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
							{t("delete")}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
});

HolidayListPage.displayName = "HolidayListPage";
