import { ArrowLeft, Trash2 } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { useRanks } from "#web/api/ranks/ranks.queries.ts";
import { useCreateSalaryScale, useUpdateSalaryScale } from "#web/api/salary-scale/salary-scale.mutations.ts";
import { useSalaryScale } from "#web/api/salary-scale/salary-scale.queries.ts";
import { LoadingSpinner } from "#web/components/common/LoadingSpinner.tsx";
import { Button } from "#web/components/ui/button.tsx";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "#web/components/ui/card.tsx";
import { Input } from "#web/components/ui/input.tsx";
import { Label } from "#web/components/ui/label.tsx";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "#web/components/ui/select.tsx";
import { Textarea } from "#web/components/ui/textarea.tsx";
import type { CreateSalaryScaleRequest, SalaryScaleRankInput, SalaryScaleStepInput } from "#web/types/salary-scale.ts";

const DEFAULT_STEP_COUNT = 9;
const DEFAULT_STEP_PERIOD_YEARS = 2;

interface RankFormData {
	tempId: string;
	rankCode: string;
	rankName: string;
	rankNameAm?: string;
	category: string;
	level: number;
	baseSalary: number;
	ceilingSalary: number;
	sortOrder: number;
	salarySteps: SalaryScaleStepInput[];
}

export const SalaryScaleFormPage = React.memo(
	() => {
		const { t } = useTranslation("salary-scale");
		const { t: tCommon } = useTranslation("common");
		const { i18n } = useTranslation();
		const { id } = useParams<{ id: string }>();
		const navigate = useNavigate();
		const isAmharic = i18n.language === "am";
		const isEditing = !!id && id !== "new";

		const { data: existingScale, isLoading: isLoadingScale } = useSalaryScale(isEditing ? id : "");
		const { data: ranks } = useRanks();
		const createMutation = useCreateSalaryScale();
		const updateMutation = useUpdateSalaryScale();

		const [formData, setFormData] = React.useState({
			code: "",
			name: "",
			nameAm: "",
			description: "",
			effectiveDate: "",
			expiryDate: "",
			stepCount: DEFAULT_STEP_COUNT,
			stepPeriodYears: DEFAULT_STEP_PERIOD_YEARS,
		});

		const [rankForms, setRankForms] = React.useState<RankFormData[]>([]);

		React.useEffect(() => {
			if (existingScale && isEditing) {
				setFormData({
					code: existingScale.code,
					name: existingScale.name,
					nameAm: existingScale.nameAm ?? "",
					description: existingScale.description ?? "",
					effectiveDate: existingScale.effectiveDate
						? new Date(existingScale.effectiveDate).toISOString().split("T")[0]
						: "",
					expiryDate: existingScale.expiryDate ? new Date(existingScale.expiryDate).toISOString().split("T")[0] : "",
					stepCount: existingScale.stepCount,
					stepPeriodYears: existingScale.stepPeriodYears,
				});

				if (existingScale.rankSalaries) {
					setRankForms(
						existingScale.rankSalaries.map((rank, idx) => ({
							tempId: `existing-${rank.id}`,
							rankCode: rank.rankCode,
							rankName: rank.rankName,
							rankNameAm: rank.rankNameAm,
							category: rank.category,
							level: rank.level,
							baseSalary: Number(rank.baseSalary),
							ceilingSalary: Number(rank.ceilingSalary),
							sortOrder: rank.sortOrder ?? idx,
							salarySteps:
								rank.salarySteps?.map((step) => ({
									stepNumber: step.stepNumber,
									salaryAmount: Number(step.salaryAmount),
								})) ?? [],
						})),
					);
				}
			}
		}, [existingScale, isEditing]);

		const handleBack = React.useCallback(() => {
			navigate("/salary/scale");
		}, [navigate]);

		const handleFormChange = React.useCallback((field: string, value: string | number) => {
			setFormData((prev) => ({ ...prev, [field]: value }));
		}, []);

		const handleAddRankFromExisting = React.useCallback(
			(rankCode: string) => {
				const selectedRank = ranks?.find((r) => r.code === rankCode);
				if (!selectedRank) return;

				const existsAlready = rankForms.some((r) => r.rankCode === rankCode);
				if (existsAlready) {
					toast.error("This rank is already added");
					return;
				}

				const steps: SalaryScaleStepInput[] = [];
				const stepCount = formData.stepCount || DEFAULT_STEP_COUNT;
				const baseSalary = Number(selectedRank.baseSalary);
				const ceilingSalary = Number(selectedRank.ceilingSalary);
				const increment = (ceilingSalary - baseSalary) / stepCount;

				for (let i = 1; i <= stepCount; i++) {
					steps.push({
						stepNumber: i,
						salaryAmount: Math.round(baseSalary + increment * i),
					});
				}

				const newRank: RankFormData = {
					tempId: `new-${Date.now()}`,
					rankCode: selectedRank.code,
					rankName: selectedRank.name,
					rankNameAm: selectedRank.nameAm,
					category: selectedRank.category,
					level: selectedRank.level,
					baseSalary: baseSalary,
					ceilingSalary: ceilingSalary,
					sortOrder: rankForms.length,
					salarySteps: steps,
				};

				setRankForms((prev) => [...prev, newRank]);
			},
			[ranks, rankForms, formData.stepCount],
		);

		const handleRemoveRank = React.useCallback((tempId: string) => {
			setRankForms((prev) => prev.filter((r) => r.tempId !== tempId));
		}, []);

		const handleRankFieldChange = React.useCallback((tempId: string, field: string, value: string | number) => {
			setRankForms((prev) => prev.map((r) => (r.tempId === tempId ? { ...r, [field]: value } : r)));
		}, []);

		const handleStepChange = React.useCallback((rankTempId: string, stepNumber: number, value: number) => {
			setRankForms((prev) =>
				prev.map((r) => {
					if (r.tempId !== rankTempId) return r;
					const steps = [...r.salarySteps];
					const stepIdx = steps.findIndex((s) => s.stepNumber === stepNumber);
					if (stepIdx >= 0) {
						steps[stepIdx] = { ...steps[stepIdx], salaryAmount: value };
					}
					return { ...r, salarySteps: steps };
				}),
			);
		}, []);

		const handleSubmit = React.useCallback(
			(e: React.FormEvent) => {
				e.preventDefault();

				if (!formData.code || !formData.name || !formData.effectiveDate) {
					toast.error(t("validation.required"));
					return;
				}

				const ranksData: SalaryScaleRankInput[] = rankForms.map((r) => ({
					rankCode: r.rankCode,
					rankName: r.rankName,
					rankNameAm: r.rankNameAm,
					category: r.category,
					level: r.level,
					baseSalary: r.baseSalary,
					ceilingSalary: r.ceilingSalary,
					sortOrder: r.sortOrder,
					salarySteps: r.salarySteps,
				}));

				const payload: CreateSalaryScaleRequest = {
					code: formData.code,
					name: formData.name,
					nameAm: formData.nameAm || undefined,
					description: formData.description || undefined,
					effectiveDate: formData.effectiveDate,
					expiryDate: formData.expiryDate || undefined,
					stepCount: formData.stepCount,
					stepPeriodYears: formData.stepPeriodYears,
					ranks: ranksData,
				};

				if (isEditing) {
					updateMutation.mutate(
						{ id, data: payload },
						{
							onSuccess: () => {
								toast.success(tCommon("success"));
								navigate(`/salary/scale/${id}`);
							},
							onError: () => {
								toast.error(tCommon("error"));
							},
						},
					);
				} else {
					createMutation.mutate(payload, {
						onSuccess: (newScale) => {
							toast.success(tCommon("success"));
							navigate(`/salary/scale/${newScale.id}`);
						},
						onError: () => {
							toast.error(tCommon("error"));
						},
					});
				}
			},
			[formData, rankForms, isEditing, id, createMutation, updateMutation, navigate, t, tCommon],
		);

		const availableRanks = React.useMemo(() => {
			if (!ranks) return [];
			const usedCodes = new Set(rankForms.map((r) => r.rankCode));
			return ranks.filter((r) => !usedCodes.has(r.code));
		}, [ranks, rankForms]);

		if (isEditing && isLoadingScale) {
			return <LoadingSpinner />;
		}

		const isSubmitting = createMutation.isPending || updateMutation.isPending;

		return (
			<div className="space-y-6">
				<div className="flex items-center gap-4">
					<Button variant="ghost" size="icon" onClick={handleBack}>
						<ArrowLeft className="h-4 w-4" />
					</Button>
					<div>
						<h1 className="text-2xl font-bold">{isEditing ? t("edit") : t("create")}</h1>
					</div>
				</div>

				<form onSubmit={handleSubmit} className="space-y-6">
					<Card>
						<CardHeader>
							<CardTitle>{t("detailTitle")}</CardTitle>
						</CardHeader>
						<CardContent className="grid gap-4 md:grid-cols-2">
							<div className="grid gap-2">
								<Label htmlFor="code">{t("code")} *</Label>
								<Input
									id="code"
									value={formData.code}
									onChange={(e) => handleFormChange("code", e.target.value)}
									placeholder="2018-EC"
									disabled={isEditing}
								/>
							</div>
							<div className="grid gap-2">
								<Label htmlFor="name">{t("name")} *</Label>
								<Input
									id="name"
									value={formData.name}
									onChange={(e) => handleFormChange("name", e.target.value)}
									placeholder={t("name")}
								/>
							</div>
							<div className="grid gap-2">
								<Label htmlFor="nameAm">{t("nameAm")}</Label>
								<Input
									id="nameAm"
									value={formData.nameAm}
									onChange={(e) => handleFormChange("nameAm", e.target.value)}
									placeholder={t("nameAm")}
								/>
							</div>
							<div className="grid gap-2">
								<Label htmlFor="effectiveDate">{t("effectiveDate")} *</Label>
								<Input
									id="effectiveDate"
									type="date"
									value={formData.effectiveDate}
									onChange={(e) => handleFormChange("effectiveDate", e.target.value)}
								/>
							</div>
							<div className="grid gap-2">
								<Label htmlFor="expiryDate">{t("expiryDate")}</Label>
								<Input
									id="expiryDate"
									type="date"
									value={formData.expiryDate}
									onChange={(e) => handleFormChange("expiryDate", e.target.value)}
								/>
							</div>
							<div className="grid gap-2">
								<Label htmlFor="stepCount">{t("stepCount")}</Label>
								<Input
									id="stepCount"
									type="number"
									value={formData.stepCount}
									onChange={(e) => handleFormChange("stepCount", Number(e.target.value))}
									min={1}
									max={15}
								/>
							</div>
							<div className="grid gap-2">
								<Label htmlFor="stepPeriodYears">{t("stepPeriodYears")}</Label>
								<Input
									id="stepPeriodYears"
									type="number"
									value={formData.stepPeriodYears}
									onChange={(e) => handleFormChange("stepPeriodYears", Number(e.target.value))}
									min={1}
									max={5}
								/>
							</div>
							<div className="grid gap-2 md:col-span-2">
								<Label htmlFor="description">{t("description")}</Label>
								<Textarea
									id="description"
									value={formData.description}
									onChange={(e) => handleFormChange("description", e.target.value)}
									placeholder={t("description")}
									rows={3}
								/>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>{t("ranks")}</CardTitle>
							<CardDescription>{t("addRank")}</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="flex gap-2">
								<Select onValueChange={handleAddRankFromExisting}>
									<SelectTrigger className="w-full md:w-64">
										<SelectValue placeholder={t("addRank")} />
									</SelectTrigger>
									<SelectContent>
										{availableRanks.map((rank) => {
											const displayName = isAmharic && rank.nameAm ? rank.nameAm : rank.name;
											return (
												<SelectItem key={rank.code} value={rank.code}>
													{displayName} ({rank.code})
												</SelectItem>
											);
										})}
									</SelectContent>
								</Select>
							</div>

							{rankForms.length === 0 ? (
								<p className="text-muted-foreground text-center py-8">{t("noRanks")}</p>
							) : (
								<div className="space-y-4">
									{rankForms.map((rank) => (
										<RankFormCard
											key={rank.tempId}
											rank={rank}
											stepCount={formData.stepCount}
											isAmharic={isAmharic}
											t={t}
											onRemove={() => handleRemoveRank(rank.tempId)}
											onFieldChange={(field, value) => handleRankFieldChange(rank.tempId, field, value)}
											onStepChange={(stepNumber, value) => handleStepChange(rank.tempId, stepNumber, value)}
										/>
									))}
								</div>
							)}
						</CardContent>
					</Card>

					<div className="flex justify-end gap-2">
						<Button type="button" variant="outline" onClick={handleBack}>
							{tCommon("cancel")}
						</Button>
						<Button type="submit" disabled={isSubmitting}>
							{isSubmitting ? tCommon("saving") : tCommon("save")}
						</Button>
					</div>
				</form>
			</div>
		);
	},
	() => true,
);

SalaryScaleFormPage.displayName = "SalaryScaleFormPage";

interface RankFormCardProps {
	rank: RankFormData;
	stepCount: number;
	isAmharic: boolean;
	t: (key: string) => string;
	onRemove: () => void;
	onFieldChange: (field: string, value: string | number) => void;
	onStepChange: (stepNumber: number, value: number) => void;
}

const RankFormCard = React.memo(
	({ rank, stepCount, isAmharic, t, onRemove, onFieldChange, onStepChange }: RankFormCardProps) => {
		const displayName = isAmharic && rank.rankNameAm ? rank.rankNameAm : rank.rankName;

		return (
			<Card>
				<CardHeader className="py-3">
					<div className="flex items-center justify-between">
						<div>
							<CardTitle className="text-base">{displayName}</CardTitle>
							<CardDescription>
								{rank.rankCode} - {rank.category}
							</CardDescription>
						</div>
						<Button type="button" variant="ghost" size="icon" onClick={onRemove}>
							<Trash2 className="h-4 w-4 text-destructive" />
						</Button>
					</div>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid gap-4 md:grid-cols-4">
						<div className="grid gap-2">
							<Label>{t("baseSalary")}</Label>
							<Input
								type="number"
								value={rank.baseSalary}
								onChange={(e) => onFieldChange("baseSalary", Number(e.target.value))}
							/>
						</div>
						<div className="grid gap-2">
							<Label>{t("ceilingSalary")}</Label>
							<Input
								type="number"
								value={rank.ceilingSalary}
								onChange={(e) => onFieldChange("ceilingSalary", Number(e.target.value))}
							/>
						</div>
						<div className="grid gap-2">
							<Label>{t("level")}</Label>
							<Input
								type="number"
								value={rank.level}
								onChange={(e) => onFieldChange("level", Number(e.target.value))}
							/>
						</div>
						<div className="grid gap-2">
							<Label>{t("sortOrder")}</Label>
							<Input
								type="number"
								value={rank.sortOrder}
								onChange={(e) => onFieldChange("sortOrder", Number(e.target.value))}
							/>
						</div>
					</div>

					<div>
						<Label className="mb-2 block">{t("salarySteps")}</Label>
						<div className="grid gap-2 grid-cols-3 md:grid-cols-5 lg:grid-cols-9">
							{Array.from({ length: stepCount }, (_, i) => {
								const stepNumber = i + 1;
								const step = rank.salarySteps.find((s) => s.stepNumber === stepNumber);
								return (
									<div key={stepNumber} className="grid gap-1">
										<Label className="text-xs text-muted-foreground">
											{t("stepNumber")} {stepNumber}
										</Label>
										<Input
											type="number"
											value={step?.salaryAmount ?? 0}
											onChange={(e) => onStepChange(stepNumber, Number(e.target.value))}
											className="text-sm"
										/>
									</div>
								);
							})}
						</div>
					</div>
				</CardContent>
			</Card>
		);
	},
	(prev, next) =>
		prev.rank.tempId === next.rank.tempId &&
		prev.rank.baseSalary === next.rank.baseSalary &&
		prev.rank.ceilingSalary === next.rank.ceilingSalary &&
		prev.stepCount === next.stepCount &&
		prev.isAmharic === next.isAmharic &&
		JSON.stringify(prev.rank.salarySteps) === JSON.stringify(next.rank.salarySteps),
);

RankFormCard.displayName = "RankFormCard";
