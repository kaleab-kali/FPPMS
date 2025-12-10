import { zodResolver } from "@hookform/resolvers/zod";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import { useCenters } from "#web/api/centers/centers.queries.ts";
import { useRoles } from "#web/api/roles/roles.queries.ts";
import { Button } from "#web/components/ui/button.tsx";
import { Checkbox } from "#web/components/ui/checkbox.tsx";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "#web/components/ui/select.tsx";
import type { CreateUserRequest, UpdateUserRequest, User } from "#web/types/user.ts";

const NONE_VALUE = "__none__";
const MIN_PASSWORD_LENGTH = 8;
const MAX_USERNAME_LENGTH = 50;

const USER_STATUSES = ["ACTIVE", "INACTIVE", "SUSPENDED", "PENDING"] as const;

const userSchema = z.object({
	username: z.string().min(1, "Username is required").max(MAX_USERNAME_LENGTH),
	email: z.string().email("Invalid email").optional().or(z.literal("")),
	password: z.string().optional(),
	centerId: z.string().optional(),
	status: z.enum(USER_STATUSES),
	mustChangePassword: z.boolean(),
	roleIds: z.array(z.string()),
});

type UserFormData = z.infer<typeof userSchema>;

interface UserFormDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSubmit: (data: CreateUserRequest | UpdateUserRequest) => void;
	user?: User;
	isLoading?: boolean;
}

export const UserFormDialog = React.memo(
	({ open, onOpenChange, onSubmit, user, isLoading = false }: UserFormDialogProps) => {
		const { t } = useTranslation("users");
		const { t: tCommon } = useTranslation("common");
		const isEditing = !!user;

		const { data: rolesData } = useRoles();
		const { data: centersData } = useCenters();
		const roles = rolesData ?? [];
		const centers = centersData ?? [];

		const {
			register,
			handleSubmit,
			reset,
			setValue,
			watch,
			setError,
			formState: { errors },
		} = useForm<UserFormData>({
			resolver: zodResolver(userSchema),
			defaultValues: {
				username: "",
				email: "",
				password: "",
				centerId: "",
				status: "ACTIVE",
				mustChangePassword: true,
				roleIds: [],
			},
		});

		const status = watch("status");
		const centerId = watch("centerId");
		const mustChangePassword = watch("mustChangePassword");
		const roleIds = watch("roleIds");

		useEffect(() => {
			if (user) {
				reset({
					username: user.username,
					email: user.email ?? "",
					password: "",
					centerId: user.centerId ?? "",
					status: user.status,
					mustChangePassword: user.mustChangePassword,
					roleIds: user.roles.map((r) => r.id),
				});
			} else {
				reset({
					username: "",
					email: "",
					password: "",
					centerId: "",
					status: "ACTIVE",
					mustChangePassword: true,
					roleIds: [],
				});
			}
		}, [user, reset]);

		const handleFormSubmit = React.useCallback(
			(formData: UserFormData) => {
				const centerId = formData.centerId === NONE_VALUE || formData.centerId === "" ? undefined : formData.centerId;
				const email = formData.email === "" ? undefined : formData.email;

				if (isEditing) {
					const updatePayload: UpdateUserRequest = {
						email,
						centerId,
						status: formData.status,
						mustChangePassword: formData.mustChangePassword,
						roleIds: formData.roleIds.length > 0 ? formData.roleIds : undefined,
					};
					onSubmit(updatePayload);
				} else {
					if (!formData.password || formData.password.length < MIN_PASSWORD_LENGTH) {
						setError("password", { message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters` });
						return;
					}
					const createPayload: CreateUserRequest = {
						username: formData.username,
						email,
						password: formData.password,
						centerId,
						roleIds: formData.roleIds.length > 0 ? formData.roleIds : undefined,
					};
					onSubmit(createPayload);
				}
			},
			[onSubmit, isEditing, setError],
		);

		const handleMustChangePasswordChange = React.useCallback(
			(checked: boolean) => {
				setValue("mustChangePassword", checked);
			},
			[setValue],
		);

		const handleStatusChange = React.useCallback(
			(value: string) => {
				setValue("status", value as (typeof USER_STATUSES)[number]);
			},
			[setValue],
		);

		const handleCenterChange = React.useCallback(
			(value: string) => {
				setValue("centerId", value === NONE_VALUE ? "" : value);
			},
			[setValue],
		);

		const handleRoleToggle = React.useCallback(
			(roleId: string, checked: boolean) => {
				const current = roleIds ?? [];
				if (checked) {
					setValue("roleIds", [...current, roleId]);
				} else {
					setValue(
						"roleIds",
						current.filter((id) => id !== roleId),
					);
				}
			},
			[setValue, roleIds],
		);

		return (
			<Dialog open={open} onOpenChange={onOpenChange}>
				<DialogContent className="max-w-[90vw] sm:max-w-lg max-h-[90vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle>{isEditing ? t("edit") : t("create")}</DialogTitle>
						<DialogDescription>
							{isEditing ? tCommon("edit") : tCommon("create")} {t("title").toLowerCase()}
						</DialogDescription>
					</DialogHeader>
					<form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="username">{t("username")}</Label>
							<Input id="username" {...register("username")} disabled={isEditing} aria-invalid={!!errors.username} />
							{errors.username && <p className="text-sm text-destructive">{errors.username.message}</p>}
						</div>

						<div className="space-y-2">
							<Label htmlFor="email">{t("email")}</Label>
							<Input id="email" type="email" {...register("email")} aria-invalid={!!errors.email} />
							{errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
						</div>

						{!isEditing && (
							<div className="space-y-2">
								<Label htmlFor="password">{t("password")}</Label>
								<Input id="password" type="password" {...register("password")} aria-invalid={!!errors.password} />
								{errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
							</div>
						)}

						{isEditing && (
							<div className="space-y-2">
								<Label htmlFor="status">{tCommon("status")}</Label>
								<Select value={status} onValueChange={handleStatusChange}>
									<SelectTrigger>
										<SelectValue placeholder={t("selectStatus")} />
									</SelectTrigger>
									<SelectContent>
										{USER_STATUSES.map((s) => (
											<SelectItem key={s} value={s}>
												{t(`status.${s.toLowerCase()}`)}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
						)}

						<div className="space-y-2">
							<Label htmlFor="centerId">{t("center")}</Label>
							<Select value={centerId || NONE_VALUE} onValueChange={handleCenterChange}>
								<SelectTrigger>
									<SelectValue placeholder={t("selectCenter")} />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value={NONE_VALUE}>{tCommon("none")}</SelectItem>
									{centers.map((center) => (
										<SelectItem key={center.id} value={center.id}>
											{center.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						<div className="space-y-2">
							<Label>{t("roles")}</Label>
							<div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
								{roles.map((role) => (
									<div key={role.id} className="flex items-center space-x-2">
										<Checkbox
											id={`role-${role.id}`}
											checked={roleIds?.includes(role.id) ?? false}
											onCheckedChange={(checked) => handleRoleToggle(role.id, checked === true)}
										/>
										<Label htmlFor={`role-${role.id}`} className="cursor-pointer text-sm font-normal">
											{role.name}
										</Label>
									</div>
								))}
							</div>
						</div>

						{isEditing && (
							<div className="flex items-center space-x-2">
								<Checkbox
									id="mustChangePassword"
									checked={mustChangePassword}
									onCheckedChange={handleMustChangePasswordChange}
								/>
								<Label htmlFor="mustChangePassword" className="cursor-pointer">
									{t("mustChangePassword")}
								</Label>
							</div>
						)}

						<DialogFooter className="flex-col gap-2 sm:flex-row">
							<Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
								{tCommon("cancel")}
							</Button>
							<Button type="submit" disabled={isLoading}>
								{isLoading ? tCommon("loading") : tCommon("save")}
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>
		);
	},
	(prevProps, nextProps) =>
		prevProps.open === nextProps.open &&
		prevProps.user?.id === nextProps.user?.id &&
		prevProps.isLoading === nextProps.isLoading,
);

UserFormDialog.displayName = "UserFormDialog";
