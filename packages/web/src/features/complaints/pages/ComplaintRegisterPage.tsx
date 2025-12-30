import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Loader2 } from "lucide-react";
import React from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { z } from "zod";
import { useCreateComplaint } from "#web/api/complaints/complaints.mutations.ts";
import { EmployeeSearch } from "#web/components/common/EmployeeSearch.tsx";
import { Button } from "#web/components/ui/button.tsx";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "#web/components/ui/card.tsx";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "#web/components/ui/form.tsx";
import { Input } from "#web/components/ui/input.tsx";
import { RadioGroup, RadioGroupItem } from "#web/components/ui/radio-group.tsx";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "#web/components/ui/select.tsx";
import { Separator } from "#web/components/ui/separator.tsx";
import { Textarea } from "#web/components/ui/textarea.tsx";
import { ARTICLE_30_OFFENSE_LIST, ARTICLE_31_OFFENSE_LIST } from "#web/features/complaints/constants/offense-types.ts";
import type { ComplainantType, ComplaintArticle, CreateComplaintRequest } from "#web/types/complaint.ts";
import { COMPLAINANT_TYPE_LABELS, COMPLAINT_ARTICLE_LABELS } from "#web/types/complaint.ts";
import type { Employee } from "#web/types/employee.ts";

const formSchema = z.object({
	article: z.enum(["ARTICLE_30", "ARTICLE_31"]),
	offenseCode: z.string().min(1, "Offense is required"),
	accusedEmployeeId: z.string().min(1, "Accused employee is required"),
	complainantType: z.enum(["EMPLOYEE", "EXTERNAL", "ANONYMOUS"]),
	complainantName: z.string().optional(),
	complainantEmployeeId: z.string().optional(),
	summary: z.string().min(10, "Summary must be at least 10 characters"),
	summaryAm: z.string().optional(),
	incidentDate: z.string().min(1, "Incident date is required"),
	incidentLocation: z.string().optional(),
	registeredDate: z.string().min(1, "Registered date is required"),
});

type FormValues = z.infer<typeof formSchema>;

export const ComplaintRegisterPage = React.memo(
	() => {
		const { t } = useTranslation("complaints");
		const { t: tCommon } = useTranslation("common");
		const navigate = useNavigate();
		const { i18n } = useTranslation();
		const isAmharic = i18n.language === "am";

		const [accusedEmployee, setAccusedEmployee] = React.useState<Employee | null>(null);
		const [complainantEmployee, setComplainantEmployee] = React.useState<Employee | null>(null);

		const createMutation = useCreateComplaint();

		const form = useForm<FormValues>({
			resolver: zodResolver(formSchema),
			defaultValues: {
				article: "ARTICLE_30",
				offenseCode: "",
				accusedEmployeeId: "",
				complainantType: "EMPLOYEE",
				complainantName: "",
				complainantEmployeeId: "",
				summary: "",
				summaryAm: "",
				incidentDate: "",
				incidentLocation: "",
				registeredDate: new Date().toISOString().split("T")[0],
			},
		});

		const watchedArticle = form.watch("article");
		const watchedComplainantType = form.watch("complainantType");

		const offenseOptions = React.useMemo(() => {
			return watchedArticle === "ARTICLE_30" ? ARTICLE_30_OFFENSE_LIST : ARTICLE_31_OFFENSE_LIST;
		}, [watchedArticle]);

		const handleAccusedEmployeeFound = React.useCallback(
			(employee: Employee) => {
				setAccusedEmployee(employee);
				form.setValue("accusedEmployeeId", employee.id);
			},
			[form],
		);

		const handleAccusedEmployeeClear = React.useCallback(() => {
			setAccusedEmployee(null);
			form.setValue("accusedEmployeeId", "");
		}, [form]);

		const handleComplainantEmployeeFound = React.useCallback(
			(employee: Employee) => {
				setComplainantEmployee(employee);
				form.setValue("complainantEmployeeId", employee.id);
				form.setValue("complainantName", employee.fullName);
			},
			[form],
		);

		const handleComplainantEmployeeClear = React.useCallback(() => {
			setComplainantEmployee(null);
			form.setValue("complainantEmployeeId", "");
			form.setValue("complainantName", "");
		}, [form]);

		const handleBack = React.useCallback(() => {
			navigate("/complaints");
		}, [navigate]);

		const onSubmit = React.useCallback(
			(values: FormValues) => {
				const request: CreateComplaintRequest = {
					article: values.article as ComplaintArticle,
					offenseCode: values.offenseCode,
					accusedEmployeeId: values.accusedEmployeeId,
					complainantType: values.complainantType as ComplainantType,
					complainantName: values.complainantName,
					complainantEmployeeId: values.complainantEmployeeId,
					summary: values.summary,
					summaryAm: values.summaryAm,
					incidentDate: values.incidentDate,
					incidentLocation: values.incidentLocation,
					registeredDate: values.registeredDate,
				};

				createMutation.mutate(request, {
					onSuccess: (data) => {
						toast.success(t("success.registered"));
						navigate(`/complaints/${data.id}`);
					},
					onError: () => {
						toast.error(tCommon("error"));
					},
				});
			},
			[createMutation, navigate, t, tCommon],
		);

		const handleArticleChange = React.useCallback(
			(value: string) => {
				form.setValue("article", value as "ARTICLE_30" | "ARTICLE_31");
				form.setValue("offenseCode", "");
			},
			[form],
		);

		return (
			<div className="space-y-6">
				<div className="flex items-center gap-4">
					<Button variant="ghost" size="icon" onClick={handleBack}>
						<ArrowLeft className="h-5 w-5" />
					</Button>
					<div>
						<h1 className="text-2xl font-bold">{t("register.title")}</h1>
						<p className="text-muted-foreground">{t("register.description")}</p>
					</div>
				</div>

				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
						<Card>
							<CardHeader>
								<CardTitle>{t("register.articleSection")}</CardTitle>
								<CardDescription>{t("register.articleDescription")}</CardDescription>
							</CardHeader>
							<CardContent className="space-y-6">
								<FormField
									control={form.control}
									name="article"
									render={({ field }) => (
										<FormItem>
											<FormLabel>{t("complaint.article")}</FormLabel>
											<FormControl>
												<RadioGroup
													onValueChange={handleArticleChange}
													value={field.value}
													className="flex flex-col space-y-2 sm:flex-row sm:space-x-6 sm:space-y-0"
												>
													<div className="flex items-center space-x-2">
														<RadioGroupItem value="ARTICLE_30" id="article30" />
														<label htmlFor="article30" className="cursor-pointer">
															{COMPLAINT_ARTICLE_LABELS.ARTICLE_30}
														</label>
													</div>
													<div className="flex items-center space-x-2">
														<RadioGroupItem value="ARTICLE_31" id="article31" />
														<label htmlFor="article31" className="cursor-pointer">
															{COMPLAINT_ARTICLE_LABELS.ARTICLE_31}
														</label>
													</div>
												</RadioGroup>
											</FormControl>
											<FormDescription>
												{watchedArticle === "ARTICLE_30" ? t("register.article30Hint") : t("register.article31Hint")}
											</FormDescription>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="offenseCode"
									render={({ field }) => (
										<FormItem>
											<FormLabel>{t("complaint.offense")}</FormLabel>
											<Select onValueChange={field.onChange} value={field.value}>
												<FormControl>
													<SelectTrigger>
														<SelectValue placeholder={t("register.selectOffense")} />
													</SelectTrigger>
												</FormControl>
												<SelectContent>
													{offenseOptions.map((offense) => (
														<SelectItem key={offense.code} value={offense.code}>
															{offense.code} - {isAmharic ? offense.nameAm : offense.name}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
											<FormMessage />
										</FormItem>
									)}
								/>
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle>{t("register.accusedSection")}</CardTitle>
								<CardDescription>{t("register.accusedDescription")}</CardDescription>
							</CardHeader>
							<CardContent>
								<FormField
									control={form.control}
									name="accusedEmployeeId"
									render={() => (
										<FormItem>
											<EmployeeSearch
												onEmployeeFound={handleAccusedEmployeeFound}
												onClear={handleAccusedEmployeeClear}
												selectedEmployee={accusedEmployee}
											/>
											<FormMessage />
										</FormItem>
									)}
								/>
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle>{t("register.complainantSection")}</CardTitle>
								<CardDescription>{t("register.complainantDescription")}</CardDescription>
							</CardHeader>
							<CardContent className="space-y-6">
								<FormField
									control={form.control}
									name="complainantType"
									render={({ field }) => (
										<FormItem>
											<FormLabel>{t("complaint.complainantType")}</FormLabel>
											<Select onValueChange={field.onChange} value={field.value}>
												<FormControl>
													<SelectTrigger>
														<SelectValue />
													</SelectTrigger>
												</FormControl>
												<SelectContent>
													{Object.entries(COMPLAINANT_TYPE_LABELS).map(([value, label]) => (
														<SelectItem key={value} value={value}>
															{label}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
											<FormMessage />
										</FormItem>
									)}
								/>

								{watchedComplainantType === "EMPLOYEE" && (
									<EmployeeSearch
										onEmployeeFound={handleComplainantEmployeeFound}
										onClear={handleComplainantEmployeeClear}
										selectedEmployee={complainantEmployee}
									/>
								)}

								{watchedComplainantType === "EXTERNAL" && (
									<FormField
										control={form.control}
										name="complainantName"
										render={({ field }) => (
											<FormItem>
												<FormLabel>{t("complaint.complainantName")}</FormLabel>
												<FormControl>
													<Input {...field} placeholder={t("register.enterComplainantName")} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								)}
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle>{t("register.incidentSection")}</CardTitle>
								<CardDescription>{t("register.incidentDescription")}</CardDescription>
							</CardHeader>
							<CardContent className="space-y-6">
								<div className="grid gap-6 sm:grid-cols-2">
									<FormField
										control={form.control}
										name="incidentDate"
										render={({ field }) => (
											<FormItem>
												<FormLabel>{t("complaint.incidentDate")}</FormLabel>
												<FormControl>
													<Input type="date" {...field} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										control={form.control}
										name="registeredDate"
										render={({ field }) => (
											<FormItem>
												<FormLabel>{t("complaint.registeredDate")}</FormLabel>
												<FormControl>
													<Input type="date" {...field} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>

								<FormField
									control={form.control}
									name="incidentLocation"
									render={({ field }) => (
										<FormItem>
											<FormLabel>{t("complaint.incidentLocation")}</FormLabel>
											<FormControl>
												<Input {...field} placeholder={t("register.enterLocation")} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<Separator />

								<FormField
									control={form.control}
									name="summary"
									render={({ field }) => (
										<FormItem>
											<FormLabel>{t("complaint.summary")}</FormLabel>
											<FormControl>
												<Textarea {...field} placeholder={t("register.enterSummary")} className="min-h-[120px]" />
											</FormControl>
											<FormDescription>{t("register.summaryHint")}</FormDescription>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="summaryAm"
									render={({ field }) => (
										<FormItem>
											<FormLabel>{t("complaint.summaryAm")}</FormLabel>
											<FormControl>
												<Textarea {...field} placeholder={t("register.enterSummaryAm")} className="min-h-[120px]" />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</CardContent>
						</Card>

						<div className="flex justify-end gap-4">
							<Button type="button" variant="outline" onClick={handleBack}>
								{tCommon("cancel")}
							</Button>
							<Button type="submit" disabled={createMutation.isPending}>
								{createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
								{t("action.register")}
							</Button>
						</div>
					</form>
				</Form>
			</div>
		);
	},
	() => true,
);

ComplaintRegisterPage.displayName = "ComplaintRegisterPage";
