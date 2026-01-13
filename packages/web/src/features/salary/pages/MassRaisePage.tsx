import { ArrowLeft, Eye, Users } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useCenters } from "#web/api/centers/centers.queries.ts";
import { useRanks } from "#web/api/ranks/ranks.queries.ts";
import { useMassRaisePreview, useProcessMassRaise } from "#web/api/salary-management/salary-management.mutations.ts";
import { LoadingSpinner } from "#web/components/common/LoadingSpinner.tsx";
import { Badge } from "#web/components/ui/badge.tsx";
import { Button } from "#web/components/ui/button.tsx";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "#web/components/ui/card.tsx";
import { Input } from "#web/components/ui/input.tsx";
import { Label } from "#web/components/ui/label.tsx";
import { RadioGroup, RadioGroupItem } from "#web/components/ui/radio-group.tsx";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "#web/components/ui/select.tsx";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "#web/components/ui/table.tsx";
import { Textarea } from "#web/components/ui/textarea.tsx";
import type { MassRaisePreviewResponse, MassRaiseType } from "#web/types/salary-management.ts";

const formatCurrency = (value: string | number | undefined | null): string => {
	if (value === undefined || value === null) return "-";
	const num = typeof value === "string" ? Number.parseFloat(value) : value;
	return new Intl.NumberFormat("en-ET", { style: "currency", currency: "ETB" }).format(num);
};

export const MassRaisePage = React.memo(
	() => {
		const { t } = useTranslation("salary-management");
		const { t: tCommon } = useTranslation("common");
		const { i18n } = useTranslation();
		const navigate = useNavigate();
		const isAmharic = i18n.language === "am";

		const [rankId, setRankId] = React.useState("");
		const [raiseType, setRaiseType] = React.useState<MassRaiseType>("INCREMENT_BY_STEPS");
		const [incrementSteps, setIncrementSteps] = React.useState(1);
		const [targetStep, setTargetStep] = React.useState(5);
		const [centerId, setCenterId] = React.useState<string | undefined>(undefined);
		const [orderReference, setOrderReference] = React.useState("");
		const [reason, setReason] = React.useState("");
		const [effectiveDate, setEffectiveDate] = React.useState("");
		const [documentPath, setDocumentPath] = React.useState("");
		const [notes, setNotes] = React.useState("");

		const [preview, setPreview] = React.useState<MassRaisePreviewResponse | null>(null);

		const { data: ranks } = useRanks();
		const { data: centers } = useCenters();

		const previewMutation = useMassRaisePreview();
		const processMutation = useProcessMassRaise();

		const handlePreview = React.useCallback(() => {
			if (!rankId) {
				toast.error(t("massRaise.validation.rankRequired"));
				return;
			}

			previewMutation.mutate(
				{
					rankId,
					raiseType,
					incrementSteps: raiseType === "INCREMENT_BY_STEPS" ? incrementSteps : undefined,
					targetStep: raiseType === "JUMP_TO_STEP" ? targetStep : undefined,
					centerId,
				},
				{
					onSuccess: (data) => {
						setPreview(data);
					},
					onError: () => {
						toast.error(tCommon("error"));
					},
				},
			);
		}, [rankId, raiseType, incrementSteps, targetStep, centerId, previewMutation, t, tCommon]);

		const handleSubmit = React.useCallback(
			(e: React.FormEvent) => {
				e.preventDefault();

				if (!rankId) {
					toast.error(t("massRaise.validation.rankRequired"));
					return;
				}
				if (!orderReference.trim()) {
					toast.error(t("massRaise.validation.orderRequired"));
					return;
				}
				if (!reason.trim()) {
					toast.error(t("massRaise.validation.reasonRequired"));
					return;
				}
				if (!effectiveDate) {
					toast.error(t("massRaise.validation.dateRequired"));
					return;
				}

				processMutation.mutate(
					{
						rankId,
						raiseType,
						incrementSteps: raiseType === "INCREMENT_BY_STEPS" ? incrementSteps : undefined,
						targetStep: raiseType === "JUMP_TO_STEP" ? targetStep : undefined,
						centerId,
						orderReference,
						reason,
						effectiveDate,
						documentPath: documentPath || undefined,
						notes: notes || undefined,
					},
					{
						onSuccess: (result) => {
							toast.success(
								t("massRaise.success", {
									success: result.successCount,
									failed: result.failureCount,
									skipped: result.skippedCount,
								}),
							);
							navigate("/salary/eligibility");
						},
						onError: () => {
							toast.error(tCommon("error"));
						},
					},
				);
			},
			[
				rankId,
				raiseType,
				incrementSteps,
				targetStep,
				centerId,
				orderReference,
				reason,
				effectiveDate,
				documentPath,
				notes,
				processMutation,
				t,
				tCommon,
				navigate,
			],
		);

		const selectedRank = ranks?.find((r) => r.id === rankId);

		return (
			<div className="container mx-auto p-6 space-y-6">
				<div className="flex items-center gap-4">
					<Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
						<ArrowLeft className="h-4 w-4" />
					</Button>
					<div>
						<h1 className="text-2xl font-bold">{t("massRaise.title")}</h1>
						<p className="text-muted-foreground">{t("massRaise.description")}</p>
					</div>
				</div>

				<form onSubmit={handleSubmit}>
					<div className="grid gap-6 lg:grid-cols-2">
						{/* Configuration */}
						<Card>
							<CardHeader>
								<CardTitle>{t("massRaise.selectRank")}</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<div>
									<Label>{t("massRaise.selectRank")} *</Label>
									<Select value={rankId} onValueChange={setRankId}>
										<SelectTrigger>
											<SelectValue placeholder={t("massRaise.selectRank")} />
										</SelectTrigger>
										<SelectContent>
											{ranks?.map((rank) => (
												<SelectItem key={rank.id} value={rank.id}>
													{isAmharic && rank.nameAm ? rank.nameAm : rank.name} ({rank.code})
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>

								<div>
									<Label>{t("massRaise.filterByCenter")}</Label>
									<Select
										value={centerId ?? "all"}
										onValueChange={(value) => setCenterId(value === "all" ? undefined : value)}
									>
										<SelectTrigger>
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="all">{t("massRaise.allCenters")}</SelectItem>
											{centers?.map((center) => (
												<SelectItem key={center.id} value={center.id}>
													{isAmharic && center.nameAm ? center.nameAm : center.name}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>

								<div>
									<Label>{t("massRaise.raiseType")} *</Label>
									<RadioGroup value={raiseType} onValueChange={(value) => setRaiseType(value as MassRaiseType)}>
										<div className="flex items-center space-x-2">
											<RadioGroupItem value="INCREMENT_BY_STEPS" id="increment" />
											<Label htmlFor="increment">{t("massRaise.incrementBySteps")}</Label>
										</div>
										<div className="flex items-center space-x-2">
											<RadioGroupItem value="JUMP_TO_STEP" id="jump" />
											<Label htmlFor="jump">{t("massRaise.jumpToStep")}</Label>
										</div>
									</RadioGroup>
								</div>

								{raiseType === "INCREMENT_BY_STEPS" ? (
									<div>
										<Label>{t("massRaise.incrementSteps")}</Label>
										<Select value={String(incrementSteps)} onValueChange={(value) => setIncrementSteps(Number(value))}>
											<SelectTrigger>
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												{[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
													<SelectItem key={n} value={String(n)}>
														{n} {n === 1 ? "step" : "steps"}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</div>
								) : (
									<div>
										<Label>{t("massRaise.targetStep")}</Label>
										<Select value={String(targetStep)} onValueChange={(value) => setTargetStep(Number(value))}>
											<SelectTrigger>
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												{[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
													<SelectItem key={n} value={String(n)}>
														{t("common.step", { number: n })}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</div>
								)}

								<Button
									type="button"
									variant="outline"
									onClick={handlePreview}
									disabled={!rankId || previewMutation.isPending}
									className="w-full"
								>
									<Eye className="h-4 w-4 mr-2" />
									{t("massRaise.preview")}
								</Button>
							</CardContent>
						</Card>

						{/* Order Details */}
						<Card>
							<CardHeader>
								<CardTitle>{t("massRaise.orderReference")}</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<div>
									<Label>{t("massRaise.orderReference")} *</Label>
									<Input
										value={orderReference}
										onChange={(e) => setOrderReference(e.target.value)}
										placeholder={t("massRaise.orderReferencePlaceholder")}
										required
									/>
								</div>
								<div>
									<Label>{t("massRaise.effectiveDate")} *</Label>
									<Input
										type="date"
										value={effectiveDate}
										onChange={(e) => setEffectiveDate(e.target.value)}
										required
									/>
								</div>
								<div>
									<Label>{t("massRaise.reason")} *</Label>
									<Textarea
										value={reason}
										onChange={(e) => setReason(e.target.value)}
										placeholder={t("massRaise.reasonPlaceholder")}
										required
									/>
								</div>
								<div>
									<Label>{t("massRaise.documentPath")}</Label>
									<Input value={documentPath} onChange={(e) => setDocumentPath(e.target.value)} />
								</div>
								<div>
									<Label>{t("massRaise.notes")}</Label>
									<Textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
								</div>
							</CardContent>
						</Card>

						{/* Preview Results */}
						<Card className="lg:col-span-2">
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<Users className="h-5 w-5" />
									{t("massRaise.previewResults")}
								</CardTitle>
								{preview && (
									<CardDescription>
										{selectedRank && (isAmharic && selectedRank.nameAm ? selectedRank.nameAm : selectedRank.name)}
									</CardDescription>
								)}
							</CardHeader>
							<CardContent>
								{previewMutation.isPending ? (
									<div className="flex items-center justify-center py-8">
										<LoadingSpinner />
									</div>
								) : preview ? (
									<>
										{/* Summary */}
										<div className="grid gap-4 md:grid-cols-4 mb-6">
											<div className="p-4 border rounded-lg text-center">
												<div className="text-2xl font-bold">{preview.totalEmployees}</div>
												<div className="text-sm text-muted-foreground">{t("massRaise.totalEmployees")}</div>
											</div>
											<div className="p-4 border rounded-lg text-center bg-green-500/10">
												<div className="text-2xl font-bold text-green-600">{preview.affectedEmployees}</div>
												<div className="text-sm text-muted-foreground">{t("massRaise.affectedEmployees")}</div>
											</div>
											<div className="p-4 border rounded-lg text-center bg-yellow-500/10">
												<div className="text-2xl font-bold text-yellow-600">{preview.skippedEmployees}</div>
												<div className="text-sm text-muted-foreground">{t("massRaise.skippedEmployees")}</div>
											</div>
											<div className="p-4 border rounded-lg text-center bg-blue-500/10">
												<div className="text-2xl font-bold text-blue-600">
													{formatCurrency(preview.totalSalaryIncrease)}
												</div>
												<div className="text-sm text-muted-foreground">{t("massRaise.totalSalaryIncrease")}</div>
											</div>
										</div>

										{/* Preview Table */}
										<div className="border rounded-md max-h-96 overflow-auto">
											<Table>
												<TableHeader>
													<TableRow>
														<TableHead>{t("massRaise.employeeName")}</TableHead>
														<TableHead className="text-center">{t("massRaise.currentStep")}</TableHead>
														<TableHead className="text-center">{t("massRaise.newStep")}</TableHead>
														<TableHead className="text-right">{t("massRaise.currentSalary")}</TableHead>
														<TableHead className="text-right">{t("massRaise.newSalary")}</TableHead>
														<TableHead>{t("massRaise.willBeSkipped")}</TableHead>
													</TableRow>
												</TableHeader>
												<TableBody>
													{preview.preview.map((item) => (
														<TableRow key={item.employeeId} className={item.willBeSkipped ? "opacity-50" : ""}>
															<TableCell>
																<div className="font-medium">{item.employeeName}</div>
																<div className="text-sm text-muted-foreground">{item.employeeId}</div>
															</TableCell>
															<TableCell className="text-center">{item.currentStep}</TableCell>
															<TableCell className="text-center">{item.newStep}</TableCell>
															<TableCell className="text-right">{formatCurrency(item.currentSalary)}</TableCell>
															<TableCell className="text-right text-green-600">
																{formatCurrency(item.newSalary)}
															</TableCell>
															<TableCell>
																{item.willBeSkipped ? (
																	<Badge variant="outline">{item.skipReason}</Badge>
																) : (
																	<Badge variant="secondary">{tCommon("no")}</Badge>
																)}
															</TableCell>
														</TableRow>
													))}
												</TableBody>
											</Table>
										</div>
									</>
								) : (
									<div className="text-center text-muted-foreground py-8">{t("massRaise.noPreview")}</div>
								)}
							</CardContent>
						</Card>
					</div>

					<div className="flex justify-end gap-4 mt-6">
						<Button type="button" variant="outline" onClick={() => navigate(-1)}>
							{t("common.cancel")}
						</Button>
						<Button type="submit" disabled={!preview || preview.affectedEmployees === 0 || processMutation.isPending}>
							{t("massRaise.submit")} ({preview?.affectedEmployees ?? 0})
						</Button>
					</div>
				</form>
			</div>
		);
	},
	() => true,
);

MassRaisePage.displayName = "MassRaisePage";
