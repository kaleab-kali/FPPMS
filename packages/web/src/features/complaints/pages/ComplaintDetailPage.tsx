import { ArrowLeft, Calendar, Clock, ExternalLink, FileText, User, Users } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useCommittee } from "#web/api/committees/committees.queries.ts";
import { useComplaint } from "#web/api/complaints/complaints.queries.ts";
import { Badge } from "#web/components/ui/badge.tsx";
import { Button } from "#web/components/ui/button.tsx";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "#web/components/ui/card.tsx";
import { Separator } from "#web/components/ui/separator.tsx";
import { Skeleton } from "#web/components/ui/skeleton.tsx";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "#web/components/ui/tabs.tsx";
import { ComplaintActions } from "#web/features/complaints/components/ComplaintActions.tsx";
import { ComplaintTimeline } from "#web/features/complaints/components/ComplaintTimeline.tsx";
import { getOffenseByCode } from "#web/features/complaints/constants/offense-types.ts";
import type { ComplaintStatus } from "#web/types/complaint.ts";
import {
	COMPLAINANT_TYPE_LABELS,
	COMPLAINT_ARTICLE_LABELS,
	COMPLAINT_FINDING_LABELS,
	COMPLAINT_STATUS_COLORS,
	COMPLAINT_STATUS_LABELS,
} from "#web/types/complaint.ts";

export const ComplaintDetailPage = React.memo(
	() => {
		const { t } = useTranslation("complaints");
		const { t: tCommon } = useTranslation("common");
		const navigate = useNavigate();
		const { id } = useParams<{ id: string }>();
		const { i18n } = useTranslation();
		const isAmharic = i18n.language === "am";

		const { data: complaint, isLoading } = useComplaint(id ?? "");
		const { data: assignedCommittee } = useCommittee(complaint?.assignedCommitteeId ?? "", false);
		const { data: hqCommittee } = useCommittee(complaint?.hqCommitteeId ?? "", false);

		const handleBack = React.useCallback(() => {
			navigate("/complaints");
		}, [navigate]);

		const offense = React.useMemo(() => {
			if (!complaint?.offenseCode) return null;
			return getOffenseByCode(complaint.offenseCode);
		}, [complaint?.offenseCode]);

		const offenseDisplay = React.useMemo(() => {
			if (!offense) return complaint?.offenseCode ?? "-";
			return isAmharic ? offense.nameAm : offense.name;
		}, [offense, complaint?.offenseCode, isAmharic]);

		const accusedName = React.useMemo(() => {
			if (!complaint?.accusedEmployee) return "-";
			return isAmharic && complaint.accusedEmployee.fullNameAm
				? complaint.accusedEmployee.fullNameAm
				: complaint.accusedEmployee.fullName;
		}, [complaint?.accusedEmployee, isAmharic]);

		const assignedCommitteeName = React.useMemo(() => {
			if (!assignedCommittee) return null;
			return isAmharic && assignedCommittee.nameAm ? assignedCommittee.nameAm : assignedCommittee.name;
		}, [assignedCommittee, isAmharic]);

		const hqCommitteeName = React.useMemo(() => {
			if (!hqCommittee) return null;
			return isAmharic && hqCommittee.nameAm ? hqCommittee.nameAm : hqCommittee.name;
		}, [hqCommittee, isAmharic]);

		const showCommitteeInfo = complaint?.assignedCommitteeId || complaint?.hqCommitteeId;

		if (isLoading) {
			return (
				<div className="space-y-6">
					<div className="flex items-center gap-4">
						<Skeleton className="h-10 w-10" />
						<Skeleton className="h-8 w-64" />
					</div>
					<div className="grid gap-6 md:grid-cols-2">
						<Skeleton className="h-48" />
						<Skeleton className="h-48" />
					</div>
				</div>
			);
		}

		if (!complaint) {
			return (
				<div className="space-y-6">
					<div className="flex items-center gap-4">
						<Button variant="ghost" size="icon" onClick={handleBack}>
							<ArrowLeft className="h-5 w-5" />
						</Button>
						<h1 className="text-2xl font-bold">{tCommon("notFound")}</h1>
					</div>
				</div>
			);
		}

		return (
			<div className="space-y-6">
				<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
					<div className="flex items-center gap-4">
						<Button variant="ghost" size="icon" onClick={handleBack}>
							<ArrowLeft className="h-5 w-5" />
						</Button>
						<div>
							<div className="flex items-center gap-3">
								<h1 className="text-2xl font-bold font-mono">{complaint.complaintNumber}</h1>
								<Badge className={COMPLAINT_STATUS_COLORS[complaint.status as ComplaintStatus]}>
									{COMPLAINT_STATUS_LABELS[complaint.status as ComplaintStatus]}
								</Badge>
							</div>
							<p className="text-muted-foreground">
								{COMPLAINT_ARTICLE_LABELS[complaint.article]} - {offenseDisplay}
							</p>
						</div>
					</div>
				</div>

				<div className="grid gap-6 lg:grid-cols-3">
					<div className="lg:col-span-2 space-y-6">
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<FileText className="h-5 w-5" />
									{t("detail.summary")}
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<div>
									<p className="text-sm text-muted-foreground mb-1">{t("complaint.summary")}</p>
									<p className="whitespace-pre-wrap">{complaint.summary}</p>
								</div>
								{complaint.summaryAm && (
									<div>
										<p className="text-sm text-muted-foreground mb-1">{t("complaint.summaryAm")}</p>
										<p className="whitespace-pre-wrap">{complaint.summaryAm}</p>
									</div>
								)}
							</CardContent>
						</Card>

						<Tabs defaultValue="timeline">
							<TabsList>
								<TabsTrigger value="timeline">{t("detail.timeline")}</TabsTrigger>
								<TabsTrigger value="details">{t("detail.details")}</TabsTrigger>
								{complaint.appeals && complaint.appeals.length > 0 && (
									<TabsTrigger value="appeals">{t("detail.appeals")}</TabsTrigger>
								)}
							</TabsList>

							<TabsContent value="timeline" className="mt-4">
								<Card>
									<CardHeader>
										<CardTitle>{t("detail.timeline")}</CardTitle>
										<CardDescription>{t("detail.timelineDescription")}</CardDescription>
									</CardHeader>
									<CardContent>
										<ComplaintTimeline timeline={complaint.timeline ?? []} />
									</CardContent>
								</Card>
							</TabsContent>

							<TabsContent value="details" className="mt-4">
								<Card>
									<CardHeader>
										<CardTitle>{t("detail.fullDetails")}</CardTitle>
									</CardHeader>
									<CardContent className="space-y-4">
										<div className="grid gap-4 sm:grid-cols-2">
											<div>
												<p className="text-sm text-muted-foreground">{t("complaint.offenseOccurrence")}</p>
												<p className="font-medium">
													{complaint.offenseOccurrence === 1
														? t("detail.firstOffense")
														: t("detail.nthOffense", { n: complaint.offenseOccurrence })}
												</p>
											</div>
											{complaint.finding && (
												<div>
													<p className="text-sm text-muted-foreground">{t("complaint.finding")}</p>
													<p className="font-medium">{COMPLAINT_FINDING_LABELS[complaint.finding]}</p>
												</div>
											)}
											{complaint.findingReason && (
												<div className="sm:col-span-2">
													<p className="text-sm text-muted-foreground">{t("complaint.findingReason")}</p>
													<p>{complaint.findingReason}</p>
												</div>
											)}
											{complaint.punishmentDescription && (
												<div className="sm:col-span-2">
													<p className="text-sm text-muted-foreground">{t("complaint.punishment")}</p>
													<p>{complaint.punishmentDescription}</p>
													{complaint.punishmentPercentage && (
														<p className="text-sm text-muted-foreground">
															({complaint.punishmentPercentage}% {t("detail.salaryDeduction")})
														</p>
													)}
												</div>
											)}
											{complaint.rebuttalContent && (
												<div className="sm:col-span-2">
													<p className="text-sm text-muted-foreground">{t("complaint.rebuttal")}</p>
													<p className="whitespace-pre-wrap">{complaint.rebuttalContent}</p>
												</div>
											)}
										</div>
									</CardContent>
								</Card>
							</TabsContent>

							{complaint.appeals && complaint.appeals.length > 0 && (
								<TabsContent value="appeals" className="mt-4">
									<Card>
										<CardHeader>
											<CardTitle>{t("detail.appeals")}</CardTitle>
										</CardHeader>
										<CardContent>
											<div className="space-y-4">
												{complaint.appeals.map((appeal) => (
													<div key={appeal.id} className="border rounded-lg p-4">
														<div className="flex justify-between items-start mb-2">
															<span className="font-medium">
																{t("detail.appealLevel", { level: appeal.appealLevel })}
															</span>
															{appeal.decision && (
																<Badge variant={appeal.decision === "UPHELD" ? "destructive" : "default"}>
																	{appeal.decision}
																</Badge>
															)}
														</div>
														<p className="text-sm text-muted-foreground mb-2">
															{new Date(appeal.appealDate).toLocaleDateString()}
														</p>
														<p className="text-sm">{appeal.appealReason}</p>
														{appeal.decisionReason && (
															<div className="mt-2 pt-2 border-t">
																<p className="text-sm text-muted-foreground">{t("complaint.decisionReason")}</p>
																<p className="text-sm">{appeal.decisionReason}</p>
															</div>
														)}
													</div>
												))}
											</div>
										</CardContent>
									</Card>
								</TabsContent>
							)}
						</Tabs>
					</div>

					<div className="space-y-6">
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<User className="h-5 w-5" />
									{t("detail.accused")}
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="space-y-3">
									<div>
										<p className="font-medium">{accusedName}</p>
										<p className="text-sm text-muted-foreground">{complaint.accusedEmployee?.employeeId}</p>
									</div>
								</div>
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<Calendar className="h-5 w-5" />
									{t("detail.dates")}
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="space-y-3 text-sm">
									<div className="flex justify-between">
										<span className="text-muted-foreground">{t("complaint.incidentDate")}</span>
										<span>{new Date(complaint.incidentDate).toLocaleDateString()}</span>
									</div>
									<Separator />
									<div className="flex justify-between">
										<span className="text-muted-foreground">{t("complaint.registeredDate")}</span>
										<span>{new Date(complaint.registeredDate).toLocaleDateString()}</span>
									</div>
									{complaint.notificationDate && (
										<>
											<Separator />
											<div className="flex justify-between">
												<span className="text-muted-foreground">{t("complaint.notificationDate")}</span>
												<span>{new Date(complaint.notificationDate).toLocaleDateString()}</span>
											</div>
										</>
									)}
									{complaint.rebuttalDeadline && (
										<>
											<Separator />
											<div className="flex justify-between">
												<span className="text-muted-foreground">{t("complaint.rebuttalDeadline")}</span>
												<span>{new Date(complaint.rebuttalDeadline).toLocaleDateString()}</span>
											</div>
										</>
									)}
									{complaint.decisionDate && (
										<>
											<Separator />
											<div className="flex justify-between">
												<span className="text-muted-foreground">{t("complaint.decisionDate")}</span>
												<span>{new Date(complaint.decisionDate).toLocaleDateString()}</span>
											</div>
										</>
									)}
									{complaint.closedDate && (
										<>
											<Separator />
											<div className="flex justify-between">
												<span className="text-muted-foreground">{t("complaint.closedDate")}</span>
												<span>{new Date(complaint.closedDate).toLocaleDateString()}</span>
											</div>
										</>
									)}
								</div>
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<Clock className="h-5 w-5" />
									{t("detail.complainant")}
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="space-y-2 text-sm">
									<div className="flex justify-between">
										<span className="text-muted-foreground">{t("complaint.complainantType")}</span>
										<span>{COMPLAINANT_TYPE_LABELS[complaint.complainantType]}</span>
									</div>
									{complaint.complainantName && (
										<>
											<Separator />
											<div className="flex justify-between">
												<span className="text-muted-foreground">{t("complaint.complainantName")}</span>
												<span>{complaint.complainantName}</span>
											</div>
										</>
									)}
									{complaint.incidentLocation && (
										<>
											<Separator />
											<div className="flex justify-between">
												<span className="text-muted-foreground">{t("complaint.incidentLocation")}</span>
												<span>{complaint.incidentLocation}</span>
											</div>
										</>
									)}
								</div>
							</CardContent>
						</Card>

						{showCommitteeInfo && (
							<Card>
								<CardHeader>
									<CardTitle className="flex items-center gap-2">
										<Users className="h-5 w-5" />
										{t("detail.committeeInfo")}
									</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="space-y-3 text-sm">
										{complaint.assignedCommitteeId && (
											<div>
												<p className="text-muted-foreground mb-1">{t("complaint.assignedCommittee")}</p>
												<div className="flex items-center justify-between">
													<span className="font-medium">{assignedCommitteeName ?? "-"}</span>
													<Button variant="ghost" size="sm" asChild>
														<Link to={`/committees/${complaint.assignedCommitteeId}`}>
															<ExternalLink className="h-3 w-3 mr-1" />
															{tCommon("view")}
														</Link>
													</Button>
												</div>
												{complaint.committeeAssignedDate && (
													<p className="text-xs text-muted-foreground mt-1">
														{t("complaint.committeeAssignedDate")}:{" "}
														{new Date(complaint.committeeAssignedDate).toLocaleDateString()}
													</p>
												)}
											</div>
										)}
										{complaint.assignedCommitteeId && complaint.hqCommitteeId && <Separator />}
										{complaint.hqCommitteeId && (
											<div>
												<p className="text-muted-foreground mb-1">{t("complaint.hqCommittee")}</p>
												<div className="flex items-center justify-between">
													<span className="font-medium">{hqCommitteeName ?? "-"}</span>
													<Button variant="ghost" size="sm" asChild>
														<Link to={`/committees/${complaint.hqCommitteeId}`}>
															<ExternalLink className="h-3 w-3 mr-1" />
															{tCommon("view")}
														</Link>
													</Button>
												</div>
												{complaint.hqForwardedDate && (
													<p className="text-xs text-muted-foreground mt-1">
														{t("complaint.hqForwardedDate")}:{" "}
														{new Date(complaint.hqForwardedDate).toLocaleDateString()}
													</p>
												)}
											</div>
										)}
									</div>
								</CardContent>
							</Card>
						)}

						<ComplaintActions complaint={complaint} />
					</div>
				</div>
			</div>
		);
	},
	() => true,
);

ComplaintDetailPage.displayName = "ComplaintDetailPage";
