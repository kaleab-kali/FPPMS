import { zodResolver } from "@hookform/resolvers/zod";
import * as React from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { z } from "zod";
import { useCreateCorrespondence, useUpdateCorrespondence } from "#web/api/correspondence/correspondence.mutations";
import { useDocumentTypes } from "#web/api/correspondence/correspondence.queries";
import { Button } from "#web/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "#web/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "#web/components/ui/form";
import { Input } from "#web/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "#web/components/ui/select";
import { Switch } from "#web/components/ui/switch";
import { Textarea } from "#web/components/ui/textarea";
import type { CorrespondenceDocument, CreateCorrespondenceDto, DocumentDirection } from "#web/types/correspondence";
import { DOCUMENT_CATEGORIES, DOCUMENT_PRIORITIES } from "#web/types/correspondence";

const correspondenceSchema = z.object({
	documentTypeId: z.string().min(1, "Document type is required"),
	direction: z.enum(["INCOMING", "OUTGOING"]),
	documentDate: z.string().min(1, "Document date is required"),
	receivedDate: z.string().optional(),
	sentDate: z.string().optional(),
	sourceOrganization: z.string().optional(),
	destinationOrganization: z.string().optional(),
	subject: z.string().min(1, "Subject is required"),
	summary: z.string().optional(),
	priority: z.string().optional(),
	actionRequired: z.string().optional(),
	deadline: z.string().optional(),
	folderNumber: z.string().optional(),
	shelfNumber: z.string().optional(),
	officeLocation: z.string().optional(),
	responseDeadline: z.string().optional(),
	isUrgent: z.boolean().optional(),
	category: z.string().optional(),
});

type CorrespondenceFormValues = z.infer<typeof correspondenceSchema>;

interface CorrespondenceFormDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	document?: CorrespondenceDocument | null;
	defaultDirection?: DocumentDirection;
}

const CorrespondenceFormDialogComponent = ({
	open,
	onOpenChange,
	document,
	defaultDirection = "INCOMING",
}: CorrespondenceFormDialogProps): React.ReactElement => {
	const { t } = useTranslation(["correspondence", "common"]);
	const { data: documentTypes } = useDocumentTypes();
	const createMutation = useCreateCorrespondence();
	const updateMutation = useUpdateCorrespondence();

	const isEditing = !!document;

	const form = useForm<CorrespondenceFormValues>({
		resolver: zodResolver(correspondenceSchema),
		defaultValues: {
			documentTypeId: document?.documentTypeId ?? "",
			direction: document?.direction ?? defaultDirection,
			documentDate: document?.documentDate?.split("T")[0] ?? new Date().toISOString().split("T")[0],
			receivedDate: document?.receivedDate?.split("T")[0] ?? "",
			sentDate: document?.sentDate?.split("T")[0] ?? "",
			sourceOrganization: document?.sourceOrganization ?? "",
			destinationOrganization: document?.destinationOrganization ?? "",
			subject: document?.subject ?? "",
			summary: document?.summary ?? "",
			priority: document?.priority ?? "NORMAL",
			actionRequired: document?.actionRequired ?? "",
			deadline: document?.deadline?.split("T")[0] ?? "",
			folderNumber: document?.folderNumber ?? "",
			shelfNumber: document?.shelfNumber ?? "",
			officeLocation: document?.officeLocation ?? "",
			responseDeadline: document?.responseDeadline?.split("T")[0] ?? "",
			isUrgent: document?.isUrgent ?? false,
			category: document?.category ?? "",
		},
	});

	React.useEffect(() => {
		if (open) {
			form.reset({
				documentTypeId: document?.documentTypeId ?? "",
				direction: document?.direction ?? defaultDirection,
				documentDate: document?.documentDate?.split("T")[0] ?? new Date().toISOString().split("T")[0],
				receivedDate: document?.receivedDate?.split("T")[0] ?? "",
				sentDate: document?.sentDate?.split("T")[0] ?? "",
				sourceOrganization: document?.sourceOrganization ?? "",
				destinationOrganization: document?.destinationOrganization ?? "",
				subject: document?.subject ?? "",
				summary: document?.summary ?? "",
				priority: document?.priority ?? "NORMAL",
				actionRequired: document?.actionRequired ?? "",
				deadline: document?.deadline?.split("T")[0] ?? "",
				folderNumber: document?.folderNumber ?? "",
				shelfNumber: document?.shelfNumber ?? "",
				officeLocation: document?.officeLocation ?? "",
				responseDeadline: document?.responseDeadline?.split("T")[0] ?? "",
				isUrgent: document?.isUrgent ?? false,
				category: document?.category ?? "",
			});
		}
	}, [open, document, defaultDirection, form]);

	const direction = form.watch("direction");

	const handleSubmit = React.useCallback(
		async (values: CorrespondenceFormValues) => {
			const cleanedValues: CreateCorrespondenceDto = {
				documentTypeId: values.documentTypeId,
				direction: values.direction,
				documentDate: values.documentDate,
				subject: values.subject,
				...(values.receivedDate && { receivedDate: values.receivedDate }),
				...(values.sentDate && { sentDate: values.sentDate }),
				...(values.sourceOrganization && { sourceOrganization: values.sourceOrganization }),
				...(values.destinationOrganization && { destinationOrganization: values.destinationOrganization }),
				...(values.summary && { summary: values.summary }),
				...(values.priority && { priority: values.priority }),
				...(values.actionRequired && { actionRequired: values.actionRequired }),
				...(values.deadline && { deadline: values.deadline }),
				...(values.folderNumber && { folderNumber: values.folderNumber }),
				...(values.shelfNumber && { shelfNumber: values.shelfNumber }),
				...(values.officeLocation && { officeLocation: values.officeLocation }),
				...(values.responseDeadline && { responseDeadline: values.responseDeadline }),
				...(values.isUrgent !== undefined && { isUrgent: values.isUrgent }),
				...(values.category && { category: values.category }),
			};

			if (isEditing && document) {
				await updateMutation.mutateAsync({
					id: document.id,
					dto: {
						subject: values.subject,
						summary: values.summary || undefined,
						priority: values.priority || undefined,
						actionRequired: values.actionRequired || undefined,
						deadline: values.deadline || undefined,
						folderNumber: values.folderNumber || undefined,
						shelfNumber: values.shelfNumber || undefined,
						officeLocation: values.officeLocation || undefined,
						responseDeadline: values.responseDeadline || undefined,
						isUrgent: values.isUrgent,
						category: values.category || undefined,
					},
				});
				toast.success(t("correspondence:messages.updateSuccess"));
			} else {
				await createMutation.mutateAsync(cleanedValues);
				toast.success(t("correspondence:messages.createSuccess"));
			}
			onOpenChange(false);
		},
		[isEditing, document, createMutation, updateMutation, onOpenChange, t],
	);

	const isSubmitting = createMutation.isPending || updateMutation.isPending;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>
						{isEditing ? t("correspondence:form.editTitle") : t("correspondence:form.createTitle")}
					</DialogTitle>
				</DialogHeader>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
						<div className="grid grid-cols-2 gap-4">
							<FormField
								control={form.control}
								name="documentTypeId"
								render={({ field }) => (
									<FormItem>
										<FormLabel>{t("correspondence:form.documentType")}</FormLabel>
										<Select onValueChange={field.onChange} value={field.value} disabled={isEditing}>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder={t("correspondence:form.selectDocumentType")} />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												{documentTypes?.map((type) => (
													<SelectItem key={type.id} value={type.id}>
														{type.name}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="direction"
								render={({ field }) => (
									<FormItem>
										<FormLabel>{t("correspondence:form.direction")}</FormLabel>
										<Select onValueChange={field.onChange} value={field.value} disabled={isEditing}>
											<FormControl>
												<SelectTrigger>
													<SelectValue />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												<SelectItem value="INCOMING">{t("correspondence:direction.incoming")}</SelectItem>
												<SelectItem value="OUTGOING">{t("correspondence:direction.outgoing")}</SelectItem>
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						<FormField
							control={form.control}
							name="subject"
							render={({ field }) => (
								<FormItem>
									<FormLabel>{t("correspondence:form.subject")}</FormLabel>
									<FormControl>
										<Input {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<div className="grid grid-cols-2 gap-4">
							<FormField
								control={form.control}
								name="documentDate"
								render={({ field }) => (
									<FormItem>
										<FormLabel>{t("correspondence:form.documentDate")}</FormLabel>
										<FormControl>
											<Input type="date" {...field} disabled={isEditing} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							{direction === "INCOMING" ? (
								<FormField
									control={form.control}
									name="receivedDate"
									render={({ field }) => (
										<FormItem>
											<FormLabel>{t("correspondence:form.receivedDate")}</FormLabel>
											<FormControl>
												<Input type="date" {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							) : (
								<FormField
									control={form.control}
									name="sentDate"
									render={({ field }) => (
										<FormItem>
											<FormLabel>{t("correspondence:form.sentDate")}</FormLabel>
											<FormControl>
												<Input type="date" {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							)}
						</div>

						<div className="grid grid-cols-2 gap-4">
							{direction === "INCOMING" ? (
								<FormField
									control={form.control}
									name="sourceOrganization"
									render={({ field }) => (
										<FormItem>
											<FormLabel>{t("correspondence:form.sourceOrganization")}</FormLabel>
											<FormControl>
												<Input {...field} disabled={isEditing} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							) : (
								<FormField
									control={form.control}
									name="destinationOrganization"
									render={({ field }) => (
										<FormItem>
											<FormLabel>{t("correspondence:form.destinationOrganization")}</FormLabel>
											<FormControl>
												<Input {...field} disabled={isEditing} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							)}

							<FormField
								control={form.control}
								name="category"
								render={({ field }) => (
									<FormItem>
										<FormLabel>{t("correspondence:form.category")}</FormLabel>
										<Select onValueChange={field.onChange} value={field.value}>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder={t("correspondence:form.selectCategory")} />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												{DOCUMENT_CATEGORIES.map((cat) => (
													<SelectItem key={cat} value={cat}>
														{t(`correspondence:category.${cat.toLowerCase()}`)}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						<FormField
							control={form.control}
							name="summary"
							render={({ field }) => (
								<FormItem>
									<FormLabel>{t("correspondence:form.summary")}</FormLabel>
									<FormControl>
										<Textarea {...field} rows={3} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<div className="grid grid-cols-3 gap-4">
							<FormField
								control={form.control}
								name="priority"
								render={({ field }) => (
									<FormItem>
										<FormLabel>{t("correspondence:form.priority")}</FormLabel>
										<Select onValueChange={field.onChange} value={field.value}>
											<FormControl>
												<SelectTrigger>
													<SelectValue />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												{DOCUMENT_PRIORITIES.map((p) => (
													<SelectItem key={p} value={p}>
														{t(`correspondence:priority.${p.toLowerCase()}`)}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="deadline"
								render={({ field }) => (
									<FormItem>
										<FormLabel>{t("correspondence:form.deadline")}</FormLabel>
										<FormControl>
											<Input type="date" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="responseDeadline"
								render={({ field }) => (
									<FormItem>
										<FormLabel>{t("correspondence:form.responseDeadline")}</FormLabel>
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
							name="actionRequired"
							render={({ field }) => (
								<FormItem>
									<FormLabel>{t("correspondence:form.actionRequired")}</FormLabel>
									<FormControl>
										<Textarea {...field} rows={2} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<div className="grid grid-cols-3 gap-4">
							<FormField
								control={form.control}
								name="folderNumber"
								render={({ field }) => (
									<FormItem>
										<FormLabel>{t("correspondence:form.folderNumber")}</FormLabel>
										<FormControl>
											<Input {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="shelfNumber"
								render={({ field }) => (
									<FormItem>
										<FormLabel>{t("correspondence:form.shelfNumber")}</FormLabel>
										<FormControl>
											<Input {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="officeLocation"
								render={({ field }) => (
									<FormItem>
										<FormLabel>{t("correspondence:form.officeLocation")}</FormLabel>
										<FormControl>
											<Input {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						<FormField
							control={form.control}
							name="isUrgent"
							render={({ field }) => (
								<FormItem className="flex items-center gap-3">
									<FormControl>
										<Switch checked={field.value} onCheckedChange={field.onChange} />
									</FormControl>
									<FormLabel className="!mt-0">{t("correspondence:form.isUrgent")}</FormLabel>
									<FormMessage />
								</FormItem>
							)}
						/>

						<DialogFooter>
							<Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
								{t("common:cancel")}
							</Button>
							<Button type="submit" disabled={isSubmitting}>
								{isSubmitting ? t("common:saving") : isEditing ? t("common:update") : t("common:create")}
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
};

CorrespondenceFormDialogComponent.displayName = "CorrespondenceFormDialog";

export const CorrespondenceFormDialog = React.memo(
	CorrespondenceFormDialogComponent,
	(prevProps, nextProps) =>
		prevProps.open === nextProps.open &&
		prevProps.document === nextProps.document &&
		prevProps.defaultDirection === nextProps.defaultDirection,
);
