import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { z } from "zod";
import { useCreateHoliday, useUpdateHoliday } from "#web/api/holidays/holidays.mutations";
import { Button } from "#web/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "#web/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "#web/components/ui/form";
import { Input } from "#web/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "#web/components/ui/select";
import { Switch } from "#web/components/ui/switch";
import { Textarea } from "#web/components/ui/textarea";
import type { Holiday, HolidayType } from "#web/types/holiday";

const holidaySchema = z.object({
	name: z.string().min(1, "Name is required"),
	nameAmharic: z.string().optional(),
	date: z.string().min(1, "Date is required"),
	type: z.enum(["NATIONAL", "RELIGIOUS", "COMPANY", "OTHER"]),
	isRecurring: z.boolean(),
	description: z.string().optional(),
});

type HolidayFormData = z.infer<typeof holidaySchema>;

interface HolidayFormDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	holiday?: Holiday;
}

const HOLIDAY_TYPES: { value: HolidayType; label: string }[] = [
	{ value: "NATIONAL", label: "National Holiday" },
	{ value: "RELIGIOUS", label: "Religious Holiday" },
	{ value: "COMPANY", label: "Company Holiday" },
	{ value: "OTHER", label: "Other" },
];

export const HolidayFormDialog = React.memo(
	({ open, onOpenChange, holiday }: HolidayFormDialogProps) => {
		const { t } = useTranslation("holidays");
		const createHoliday = useCreateHoliday();
		const updateHoliday = useUpdateHoliday();

		const isEditing = !!holiday;

		const form = useForm<HolidayFormData>({
			resolver: zodResolver(holidaySchema),
			defaultValues: {
				name: "",
				nameAmharic: "",
				date: "",
				type: "NATIONAL",
				isRecurring: false,
				description: "",
			},
		});

		React.useEffect(() => {
			if (holiday) {
				form.reset({
					name: holiday.name,
					nameAmharic: holiday.nameAmharic ?? "",
					date: holiday.date.split("T")[0],
					type: holiday.type,
					isRecurring: holiday.isRecurring,
					description: holiday.description ?? "",
				});
			} else {
				form.reset({
					name: "",
					nameAmharic: "",
					date: "",
					type: "NATIONAL",
					isRecurring: false,
					description: "",
				});
			}
		}, [holiday, form]);

		const onSubmit = React.useCallback(
			async (data: HolidayFormData) => {
				const payload = {
					name: data.name,
					nameAmharic: data.nameAmharic || undefined,
					date: data.date,
					type: data.type,
					isRecurring: data.isRecurring ?? false,
					description: data.description || undefined,
				};

				if (isEditing && holiday) {
					updateHoliday.mutate(
						{ id: holiday.id, data: payload },
						{
							onSuccess: () => {
								toast.success(t("updateSuccess"));
								onOpenChange(false);
							},
							onError: () => {
								toast.error(t("updateError"));
							},
						},
					);
				} else {
					createHoliday.mutate(payload, {
						onSuccess: () => {
							toast.success(t("createSuccess"));
							onOpenChange(false);
						},
						onError: () => {
							toast.error(t("createError"));
						},
					});
				}
			},
			[isEditing, holiday, createHoliday, updateHoliday, t, onOpenChange],
		);

		const isPending = createHoliday.isPending || updateHoliday.isPending;

		return (
			<Dialog open={open} onOpenChange={onOpenChange}>
				<DialogContent className="sm:max-w-[500px]">
					<DialogHeader>
						<DialogTitle>{isEditing ? t("editHoliday") : t("addHoliday")}</DialogTitle>
					</DialogHeader>
					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
							<FormField
								control={form.control}
								name="name"
								render={({ field }) => (
									<FormItem>
										<FormLabel>{t("name")}</FormLabel>
										<FormControl>
											<Input placeholder={t("namePlaceholder")} {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="nameAmharic"
								render={({ field }) => (
									<FormItem>
										<FormLabel>{t("nameAmharic")}</FormLabel>
										<FormControl>
											<Input placeholder={t("nameAmharicPlaceholder")} {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="date"
								render={({ field }) => (
									<FormItem>
										<FormLabel>{t("date")}</FormLabel>
										<FormControl>
											<Input type="date" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="type"
								render={({ field }) => (
									<FormItem>
										<FormLabel>{t("type")}</FormLabel>
										<Select onValueChange={field.onChange} value={field.value}>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder={t("selectType")} />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												{HOLIDAY_TYPES.map((type) => (
													<SelectItem key={type.value} value={type.value}>
														{type.label}
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
								name="isRecurring"
								render={({ field }) => (
									<FormItem className="flex items-center justify-between rounded-lg border p-4">
										<div className="space-y-0.5">
											<FormLabel className="text-base">{t("recurring")}</FormLabel>
											<div className="text-sm text-muted-foreground">{t("recurringDescription")}</div>
										</div>
										<FormControl>
											<Switch checked={field.value} onCheckedChange={field.onChange} />
										</FormControl>
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="description"
								render={({ field }) => (
									<FormItem>
										<FormLabel>{t("description")}</FormLabel>
										<FormControl>
											<Textarea placeholder={t("descriptionPlaceholder")} rows={3} {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<DialogFooter>
								<Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
									{t("cancel")}
								</Button>
								<Button type="submit" disabled={isPending}>
									{isPending ? t("saving") : isEditing ? t("update") : t("create")}
								</Button>
							</DialogFooter>
						</form>
					</Form>
				</DialogContent>
			</Dialog>
		);
	},
	(prev, next) =>
		prev.open === next.open && prev.holiday?.id === next.holiday?.id && prev.onOpenChange === next.onOpenChange,
);

HolidayFormDialog.displayName = "HolidayFormDialog";
