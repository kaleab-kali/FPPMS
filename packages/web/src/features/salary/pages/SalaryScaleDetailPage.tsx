import { Archive, ArrowLeft, CheckCircle, Copy, Pencil } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import {
	useActivateSalaryScale,
	useArchiveSalaryScale,
	useDuplicateSalaryScale,
} from "#web/api/salary-scale/salary-scale.mutations.ts";
import { useSalaryScale } from "#web/api/salary-scale/salary-scale.queries.ts";
import { ConfirmDialog } from "#web/components/common/ConfirmDialog.tsx";
import { LoadingSpinner } from "#web/components/common/LoadingSpinner.tsx";
import { Badge } from "#web/components/ui/badge.tsx";
import { Button } from "#web/components/ui/button.tsx";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "#web/components/ui/card.tsx";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "#web/components/ui/dialog.tsx";
import { Input } from "#web/components/ui/input.tsx";
import { Label } from "#web/components/ui/label.tsx";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "#web/components/ui/table.tsx";
import type { SalaryScaleRank, SalaryScaleStatus } from "#web/types/salary-scale.ts";

const STATUS_VARIANTS: Record<SalaryScaleStatus, "default" | "secondary" | "outline"> = {
	DRAFT: "outline",
	ACTIVE: "default",
	ARCHIVED: "secondary",
} as const;

export const SalaryScaleDetailPage = React.memo(
	() => {
		const { t } = useTranslation("salary-scale");
		const { t: tCommon } = useTranslation("common");
		const { i18n } = useTranslation();
		const { id } = useParams<{ id: string }>();
		const navigate = useNavigate();
		const isAmharic = i18n.language === "am";

		const [activateOpen, setActivateOpen] = React.useState(false);
		const [archiveOpen, setArchiveOpen] = React.useState(false);
		const [duplicateOpen, setDuplicateOpen] = React.useState(false);
		const [newCode, setNewCode] = React.useState("");
		const [expandedRank, setExpandedRank] = React.useState<string | null>(null);

		const { data: scale, isLoading } = useSalaryScale(id ?? "");
		const activateMutation = useActivateSalaryScale();
		const archiveMutation = useArchiveSalaryScale();
		const duplicateMutation = useDuplicateSalaryScale();

		const handleBack = React.useCallback(() => {
			navigate("/salary/scale");
		}, [navigate]);

		const handleEdit = React.useCallback(() => {
			navigate(`/salary/scale/${id}/edit`);
		}, [navigate, id]);

		const handleActivateClick = React.useCallback(() => {
			setActivateOpen(true);
		}, []);

		const handleArchiveClick = React.useCallback(() => {
			setArchiveOpen(true);
		}, []);

		const handleDuplicateClick = React.useCallback(() => {
			if (scale) {
				setNewCode(`${scale.code}-COPY`);
				setDuplicateOpen(true);
			}
		}, [scale]);

		const handleActivateConfirm = React.useCallback(() => {
			if (id) {
				activateMutation.mutate(id, {
					onSuccess: () => {
						toast.success(tCommon("success"));
						setActivateOpen(false);
					},
					onError: () => {
						toast.error(tCommon("error"));
					},
				});
			}
		}, [id, activateMutation, tCommon]);

		const handleArchiveConfirm = React.useCallback(() => {
			if (id) {
				archiveMutation.mutate(id, {
					onSuccess: () => {
						toast.success(tCommon("success"));
						setArchiveOpen(false);
					},
					onError: () => {
						toast.error(tCommon("error"));
					},
				});
			}
		}, [id, archiveMutation, tCommon]);

		const handleDuplicateConfirm = React.useCallback(() => {
			if (id && newCode.trim()) {
				duplicateMutation.mutate(
					{ id, newCode: newCode.trim() },
					{
						onSuccess: (newScale) => {
							toast.success(tCommon("success"));
							setDuplicateOpen(false);
							setNewCode("");
							navigate(`/salary/scale/${newScale.id}`);
						},
						onError: () => {
							toast.error(tCommon("error"));
						},
					},
				);
			}
		}, [id, newCode, duplicateMutation, tCommon, navigate]);

		const toggleRankExpansion = React.useCallback((rankId: string) => {
			setExpandedRank((prev) => (prev === rankId ? null : rankId));
		}, []);

		const formatDate = React.useCallback((dateInput: string | Date | undefined) => {
			if (!dateInput) return "-";
			const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
			return date.toLocaleDateString();
		}, []);

		const formatCurrency = React.useCallback((amount: string | number) => {
			return Number(amount).toLocaleString("en-ET", {
				style: "currency",
				currency: "ETB",
				minimumFractionDigits: 2,
			});
		}, []);

		if (isLoading) {
			return <LoadingSpinner />;
		}

		if (!scale) {
			return (
				<div className="flex flex-col items-center justify-center h-64">
					<p className="text-muted-foreground">{t("notFound")}</p>
					<Button onClick={handleBack} className="mt-4">
						<ArrowLeft className="mr-2 h-4 w-4" />
						{tCommon("back")}
					</Button>
				</div>
			);
		}

		const canActivate = scale.status === "DRAFT";
		const canArchive = scale.status === "ACTIVE";
		const canEdit = scale.status !== "ARCHIVED";
		const displayName = isAmharic && scale.nameAm ? scale.nameAm : scale.name;

		return (
			<div className="space-y-6">
				<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
					<div className="flex items-center gap-4">
						<Button variant="ghost" size="icon" onClick={handleBack}>
							<ArrowLeft className="h-4 w-4" />
						</Button>
						<div>
							<h1 className="text-2xl font-bold">{displayName}</h1>
							<p className="text-muted-foreground">{scale.code}</p>
						</div>
						<Badge variant={STATUS_VARIANTS[scale.status]}>{t(`status${scale.status}`)}</Badge>
					</div>
					<div className="flex gap-2">
						{canEdit && (
							<Button variant="outline" onClick={handleEdit}>
								<Pencil className="mr-2 h-4 w-4" />
								{tCommon("edit")}
							</Button>
						)}
						<Button variant="outline" onClick={handleDuplicateClick}>
							<Copy className="mr-2 h-4 w-4" />
							{t("duplicate")}
						</Button>
						{canActivate && (
							<Button onClick={handleActivateClick}>
								<CheckCircle className="mr-2 h-4 w-4" />
								{t("activate")}
							</Button>
						)}
						{canArchive && (
							<Button variant="secondary" onClick={handleArchiveClick}>
								<Archive className="mr-2 h-4 w-4" />
								{t("archive")}
							</Button>
						)}
					</div>
				</div>

				<div className="grid gap-6 md:grid-cols-2">
					<Card>
						<CardHeader>
							<CardTitle>{t("detailTitle")}</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="grid grid-cols-2 gap-4">
								<div>
									<Label className="text-muted-foreground">{t("code")}</Label>
									<p className="font-medium">{scale.code}</p>
								</div>
								<div>
									<Label className="text-muted-foreground">{t("name")}</Label>
									<p className="font-medium">{scale.name}</p>
								</div>
								{scale.nameAm && (
									<div>
										<Label className="text-muted-foreground">{t("nameAm")}</Label>
										<p className="font-medium">{scale.nameAm}</p>
									</div>
								)}
								<div>
									<Label className="text-muted-foreground">{t("status")}</Label>
									<p className="font-medium">{t(`status${scale.status}`)}</p>
								</div>
								<div>
									<Label className="text-muted-foreground">{t("effectiveDate")}</Label>
									<p className="font-medium">{formatDate(scale.effectiveDate)}</p>
								</div>
								<div>
									<Label className="text-muted-foreground">{t("expiryDate")}</Label>
									<p className="font-medium">{formatDate(scale.expiryDate)}</p>
								</div>
								<div>
									<Label className="text-muted-foreground">{t("stepCount")}</Label>
									<p className="font-medium">{scale.stepCount}</p>
								</div>
								<div>
									<Label className="text-muted-foreground">{t("stepPeriodYears")}</Label>
									<p className="font-medium">{scale.stepPeriodYears}</p>
								</div>
							</div>
							{scale.description && (
								<div>
									<Label className="text-muted-foreground">{t("description")}</Label>
									<p className="font-medium">{scale.description}</p>
								</div>
							)}
							{scale.approvedBy && (
								<div className="grid grid-cols-2 gap-4 pt-4 border-t">
									<div>
										<Label className="text-muted-foreground">{t("approvedBy")}</Label>
										<p className="font-medium">{scale.approvedBy}</p>
									</div>
									<div>
										<Label className="text-muted-foreground">{t("approvedAt")}</Label>
										<p className="font-medium">{formatDate(scale.approvedAt)}</p>
									</div>
								</div>
							)}
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>{t("ranks")}</CardTitle>
							<CardDescription>
								{scale.rankSalaries?.length ?? 0} {t("rankCount").toLowerCase()}
							</CardDescription>
						</CardHeader>
						<CardContent>
							{!scale.rankSalaries || scale.rankSalaries.length === 0 ? (
								<p className="text-muted-foreground text-center py-8">{t("noRanks")}</p>
							) : (
								<div className="space-y-2 max-h-96 overflow-y-auto">
									{scale.rankSalaries.map((rank: SalaryScaleRank) => (
										<RankCard
											key={rank.id}
											rank={rank}
											isExpanded={expandedRank === rank.id}
											onToggle={() => toggleRankExpansion(rank.id)}
											isAmharic={isAmharic}
											t={t}
											formatCurrency={formatCurrency}
										/>
									))}
								</div>
							)}
						</CardContent>
					</Card>
				</div>

				{scale.rankSalaries && scale.rankSalaries.length > 0 && (
					<Card>
						<CardHeader>
							<CardTitle>{t("salaryMatrix")}</CardTitle>
						</CardHeader>
						<CardContent className="overflow-x-auto">
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead className="sticky left-0 bg-background">{t("rankName")}</TableHead>
										<TableHead className="text-right">{t("baseSalary")}</TableHead>
										{Array.from({ length: scale.stepCount }, (_, i) => (
											// biome-ignore lint/suspicious/noArrayIndexKey: static step headers never reorder
											<TableHead key={`step-${i}`} className="text-right">
												{t("stepNumber")} {i + 1}
											</TableHead>
										))}
										<TableHead className="text-right">{t("ceilingSalary")}</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{scale.rankSalaries.map((rank: SalaryScaleRank) => {
										const rankName = isAmharic && rank.rankNameAm ? rank.rankNameAm : rank.rankName;
										return (
											<TableRow key={rank.id}>
												<TableCell className="sticky left-0 bg-background font-medium">
													{rankName}
													<span className="text-xs text-muted-foreground ml-2">({rank.rankCode})</span>
												</TableCell>
												<TableCell className="text-right">{formatCurrency(rank.baseSalary)}</TableCell>
												{rank.salarySteps?.map((step) => (
													<TableCell key={step.id} className="text-right">
														{formatCurrency(step.salaryAmount)}
													</TableCell>
												))}
												{Array.from({
													length: scale.stepCount - (rank.salarySteps?.length ?? 0),
												}).map((_, i) => (
													<TableCell key={`empty-${rank.id}-${i}`} className="text-right text-muted-foreground">
														-
													</TableCell>
												))}
												<TableCell className="text-right font-medium">{formatCurrency(rank.ceilingSalary)}</TableCell>
											</TableRow>
										);
									})}
								</TableBody>
							</Table>
						</CardContent>
					</Card>
				)}

				<ConfirmDialog
					open={activateOpen}
					onOpenChange={setActivateOpen}
					title={tCommon("confirm")}
					description={t("activateConfirm")}
					onConfirm={handleActivateConfirm}
					isLoading={activateMutation.isPending}
				/>

				<ConfirmDialog
					open={archiveOpen}
					onOpenChange={setArchiveOpen}
					title={tCommon("confirm")}
					description={t("archiveConfirm")}
					onConfirm={handleArchiveConfirm}
					isLoading={archiveMutation.isPending}
				/>

				<Dialog open={duplicateOpen} onOpenChange={setDuplicateOpen}>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>{t("duplicateTitle")}</DialogTitle>
							<DialogDescription>{t("duplicateDescription")}</DialogDescription>
						</DialogHeader>
						<div className="grid gap-4 py-4">
							<div className="grid gap-2">
								<Label htmlFor="newCode">{t("newCode")}</Label>
								<Input
									id="newCode"
									value={newCode}
									onChange={(e) => setNewCode(e.target.value)}
									placeholder={t("code")}
								/>
							</div>
						</div>
						<DialogFooter>
							<Button variant="outline" onClick={() => setDuplicateOpen(false)}>
								{tCommon("cancel")}
							</Button>
							<Button onClick={handleDuplicateConfirm} disabled={!newCode.trim() || duplicateMutation.isPending}>
								{duplicateMutation.isPending ? tCommon("saving") : t("duplicate")}
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			</div>
		);
	},
	() => true,
);

SalaryScaleDetailPage.displayName = "SalaryScaleDetailPage";

interface RankCardProps {
	rank: SalaryScaleRank;
	isExpanded: boolean;
	onToggle: () => void;
	isAmharic: boolean;
	t: (key: string) => string;
	formatCurrency: (amount: string | number) => string;
}

const RankCard = React.memo(
	({ rank, isExpanded, onToggle, isAmharic, t, formatCurrency }: RankCardProps) => {
		const rankName = isAmharic && rank.rankNameAm ? rank.rankNameAm : rank.rankName;

		return (
			<div className="border rounded-lg">
				<button
					type="button"
					onClick={onToggle}
					className="w-full p-3 text-left flex items-center justify-between hover:bg-muted/50 transition-colors"
				>
					<div>
						<span className="font-medium">{rankName}</span>
						<span className="text-xs text-muted-foreground ml-2">({rank.rankCode})</span>
					</div>
					<div className="text-sm text-muted-foreground">
						{formatCurrency(rank.baseSalary)} - {formatCurrency(rank.ceilingSalary)}
					</div>
				</button>
				{isExpanded && rank.salarySteps && rank.salarySteps.length > 0 && (
					<div className="px-3 pb-3 border-t">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>{t("stepNumber")}</TableHead>
									<TableHead className="text-right">{t("salaryAmount")}</TableHead>
									<TableHead className="text-right">{t("yearsRequired")}</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{rank.salarySteps.map((step) => (
									<TableRow key={step.id}>
										<TableCell>{step.stepNumber}</TableCell>
										<TableCell className="text-right">{formatCurrency(step.salaryAmount)}</TableCell>
										<TableCell className="text-right">{step.yearsRequired}</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</div>
				)}
			</div>
		);
	},
	(prev, next) =>
		prev.rank.id === next.rank.id && prev.isExpanded === next.isExpanded && prev.isAmharic === next.isAmharic,
);

RankCard.displayName = "RankCard";
