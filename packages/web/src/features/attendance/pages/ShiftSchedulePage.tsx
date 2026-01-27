import { addDays, format, startOfWeek } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";
import { useShiftAssignments, useShifts } from "#web/api/attendance/shifts.queries.ts";
import { Button } from "#web/components/ui/button.tsx";
import { Card, CardContent, CardHeader, CardTitle } from "#web/components/ui/card.tsx";
import { Skeleton } from "#web/components/ui/skeleton.tsx";
import type { ShiftAssignment } from "#web/types/attendance.ts";

export const ShiftSchedulePage = React.memo(() => {
	const { t } = useTranslation("attendance");
	const { t: tCommon } = useTranslation("common");
	const { i18n } = useTranslation();
	const isAmharic = i18n.language === "am";

	const [currentWeekStart, setCurrentWeekStart] = React.useState(() => startOfWeek(new Date(), { weekStartsOn: 0 }));

	const weekDays = React.useMemo(
		() => Array.from({ length: 7 }).map((_, i) => addDays(currentWeekStart, i)),
		[currentWeekStart],
	);

	const startDate = format(weekDays[0], "yyyy-MM-dd");
	const endDate = format(weekDays[6], "yyyy-MM-dd");

	const { data: assignments, isLoading } = useShiftAssignments({ startDate, endDate });
	const { data: shifts } = useShifts();

	const shiftsList = shifts ?? [];
	const assignmentsList = assignments ?? [];

	const assignmentsByDate = React.useMemo(() => {
		const map = new Map<string, ShiftAssignment[]>();
		for (const assignment of assignmentsList) {
			const date = assignment.shiftDate;
			if (!map.has(date)) {
				map.set(date, []);
			}
			map.get(date)?.push(assignment);
		}
		return map;
	}, [assignmentsList]);

	const handlePreviousWeek = React.useCallback(() => {
		setCurrentWeekStart((prev) => addDays(prev, -7));
	}, []);

	const handleNextWeek = React.useCallback(() => {
		setCurrentWeekStart((prev) => addDays(prev, 7));
	}, []);

	const handleToday = React.useCallback(() => {
		setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn: 0 }));
	}, []);

	const getShiftColor = React.useCallback(
		(shiftId: string) => {
			const shift = shiftsList.find((s) => s.id === shiftId);
			return shift?.color ?? "#3b82f6";
		},
		[shiftsList],
	);

	const getShiftName = React.useCallback(
		(shiftId: string) => {
			const shift = shiftsList.find((s) => s.id === shiftId);
			if (!shift) return "";
			return isAmharic && shift.nameAm ? shift.nameAm : shift.name;
		},
		[shiftsList, isAmharic],
	);

	return (
		<div className="space-y-6">
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h1 className="text-2xl font-bold">{t("shiftSchedule")}</h1>
					<p className="text-muted-foreground">{t("weeklyView")}</p>
				</div>
				<div className="flex gap-2">
					<Button onClick={handlePreviousWeek} variant="outline" size="icon">
						<ChevronLeft className="h-4 w-4" />
					</Button>
					<Button onClick={handleToday} variant="outline">
						{tCommon("today")}
					</Button>
					<Button onClick={handleNextWeek} variant="outline" size="icon">
						<ChevronRight className="h-4 w-4" />
					</Button>
				</div>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>
						{format(weekDays[0], "MMM dd")} - {format(weekDays[6], "MMM dd, yyyy")}
					</CardTitle>
				</CardHeader>
				<CardContent>
					{isLoading ? (
						<div className="space-y-4">
							{[1, 2, 3, 4, 5].map((i) => (
								<Skeleton key={i} className="h-20 w-full" />
							))}
						</div>
					) : (
						<div className="overflow-x-auto">
							<div className="grid grid-cols-8 gap-2 min-w-[800px]">
								<div className="font-medium text-sm p-2">{t("employee")}</div>
								{weekDays.map((day) => (
									<div key={day.toISOString()} className="font-medium text-sm p-2 text-center">
										<div>{format(day, "EEE")}</div>
										<div className="text-muted-foreground">{format(day, "MMM dd")}</div>
									</div>
								))}

								{assignmentsList.length === 0 ? (
									<div className="col-span-8 py-12 text-center text-muted-foreground">{t("noShiftAssignments")}</div>
								) : (
									Array.from(new Set(assignmentsList.map((a) => a.employee?.id))).map((employeeId) => {
										const firstAssignment = assignmentsList.find((a) => a.employee?.id === employeeId);
										const employee = firstAssignment?.employee;
										if (!employee) return null;

										const displayName = isAmharic && employee.fullNameAm ? employee.fullNameAm : employee.fullName;

										return (
											<React.Fragment key={employeeId}>
												<div className="p-2 border rounded-lg">
													<p className="font-medium text-sm truncate">{displayName}</p>
													<p className="text-xs text-muted-foreground">{employee.employeeId}</p>
												</div>
												{weekDays.map((day) => {
													const dateStr = format(day, "yyyy-MM-dd");
													const dayAssignments = assignmentsByDate.get(dateStr) ?? [];
													const employeeAssignment = dayAssignments.find((a) => a.employee?.id === employeeId);

													return (
														<div key={`${employeeId}-${dateStr}`} className="p-2 border rounded-lg min-h-[60px]">
															{employeeAssignment ? (
																<div
																	className="rounded px-2 py-1 text-xs text-white"
																	style={{ backgroundColor: getShiftColor(employeeAssignment.shiftId) }}
																>
																	<p className="font-medium">{getShiftName(employeeAssignment.shiftId)}</p>
																	{employeeAssignment.shift && (
																		<p className="text-xs opacity-90">
																			{employeeAssignment.shift.startTime} - {employeeAssignment.shift.endTime}
																		</p>
																	)}
																</div>
															) : (
																<div className="text-xs text-muted-foreground text-center">-</div>
															)}
														</div>
													);
												})}
											</React.Fragment>
										);
									})
								)}
							</div>
						</div>
					)}
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>{t("legend")}</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="flex flex-wrap gap-4">
						{shiftsList
							.filter((s) => s.isActive)
							.map((shift) => (
								<div key={shift.id} className="flex items-center gap-2">
									<div className="h-4 w-4 rounded" style={{ backgroundColor: shift.color ?? "#3b82f6" }} />
									<span className="text-sm">
										{isAmharic && shift.nameAm ? shift.nameAm : shift.name} ({shift.code})
									</span>
								</div>
							))}
					</div>
				</CardContent>
			</Card>
		</div>
	);
});

ShiftSchedulePage.displayName = "ShiftSchedulePage";
