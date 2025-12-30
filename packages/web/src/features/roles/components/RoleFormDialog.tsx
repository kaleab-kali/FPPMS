import { zodResolver } from "@hookform/resolvers/zod";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import { usePermissions } from "#web/api/permissions/permissions.queries.ts";
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
import { ScrollArea } from "#web/components/ui/scroll-area.tsx";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "#web/components/ui/select.tsx";
import { Textarea } from "#web/components/ui/textarea.tsx";
import type { CreateRoleRequest, Role, UpdateRoleRequest } from "#web/types/role.ts";

const MAX_CODE_LENGTH = 50;
const MAX_NAME_LENGTH = 100;
const MAX_DESCRIPTION_LENGTH = 500;
const DEFAULT_LEVEL = 0;

const ACCESS_SCOPES = ["ALL_CENTERS", "OWN_CENTER"] as const;

const roleSchema = z.object({
	code: z.string().min(1, "Code is required").max(MAX_CODE_LENGTH),
	name: z.string().min(1, "Name is required").max(MAX_NAME_LENGTH),
	nameAm: z.string().max(MAX_NAME_LENGTH).optional().or(z.literal("")),
	description: z.string().max(MAX_DESCRIPTION_LENGTH).optional().or(z.literal("")),
	level: z.number().int().min(0),
	accessScope: z.string().min(1),
	isActive: z.boolean(),
	permissionIds: z.array(z.string()),
});

type RoleFormData = z.infer<typeof roleSchema>;

interface RoleFormDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSubmit: (data: CreateRoleRequest | UpdateRoleRequest) => void;
	role?: Role;
	isLoading?: boolean;
}

export const RoleFormDialog = React.memo(
	({ open, onOpenChange, onSubmit, role, isLoading = false }: RoleFormDialogProps) => {
		const { t } = useTranslation("roles");
		const { t: tCommon } = useTranslation("common");
		const isEditing = !!role;
		const isSystemRole = role?.isSystemRole ?? false;

		const { data: permissionsData } = usePermissions();
		const allPermissions = permissionsData ?? [];

		const permissionsByModule = React.useMemo(() => {
			const grouped: Record<string, typeof allPermissions> = {};
			for (const permission of allPermissions) {
				if (!grouped[permission.module]) {
					grouped[permission.module] = [];
				}
				grouped[permission.module].push(permission);
			}
			return grouped;
		}, [allPermissions]);

		const modules = React.useMemo(() => Object.keys(permissionsByModule).sort(), [permissionsByModule]);

		const {
			register,
			handleSubmit,
			reset,
			setValue,
			watch,
			formState: { errors },
		} = useForm<RoleFormData>({
			resolver: zodResolver(roleSchema),
			defaultValues: {
				code: "",
				name: "",
				nameAm: "",
				description: "",
				level: DEFAULT_LEVEL,
				accessScope: "OWN_CENTER",
				isActive: true,
				permissionIds: [],
			},
		});

		const isActive = watch("isActive");
		const accessScope = watch("accessScope");
		const permissionIds = watch("permissionIds");

		useEffect(() => {
			if (role) {
				reset({
					code: role.code,
					name: role.name,
					nameAm: role.nameAm ?? "",
					description: role.description ?? "",
					level: role.level,
					accessScope: role.accessScope,
					isActive: role.isActive,
					permissionIds: role.permissions.map((p) => p.id),
				});
			} else {
				reset({
					code: "",
					name: "",
					nameAm: "",
					description: "",
					level: DEFAULT_LEVEL,
					accessScope: "OWN_CENTER",
					isActive: true,
					permissionIds: [],
				});
			}
		}, [role, reset]);

		const handleFormSubmit = React.useCallback(
			(formData: RoleFormData) => {
				const nameAm = formData.nameAm === "" ? undefined : formData.nameAm;
				const description = formData.description === "" ? undefined : formData.description;

				if (isEditing) {
					const updatePayload: UpdateRoleRequest = {
						nameAm,
						description,
						accessScope: formData.accessScope,
						isActive: formData.isActive,
						permissionIds: formData.permissionIds,
					};
					if (!isSystemRole) {
						updatePayload.name = formData.name;
						updatePayload.level = formData.level;
					}
					onSubmit(updatePayload);
				} else {
					const createPayload: CreateRoleRequest = {
						code: formData.code,
						name: formData.name,
						nameAm,
						description,
						level: formData.level,
						accessScope: formData.accessScope,
						isActive: formData.isActive,
						permissionIds: formData.permissionIds,
					};
					onSubmit(createPayload);
				}
			},
			[onSubmit, isEditing, isSystemRole],
		);

		const handleCheckedChange = React.useCallback(
			(checked: boolean) => {
				setValue("isActive", checked);
			},
			[setValue],
		);

		const handleAccessScopeChange = React.useCallback(
			(value: string) => {
				setValue("accessScope", value);
			},
			[setValue],
		);

		const handlePermissionToggle = React.useCallback(
			(permissionId: string, checked: boolean) => {
				const current = permissionIds ?? [];
				if (checked) {
					setValue("permissionIds", [...current, permissionId]);
				} else {
					setValue(
						"permissionIds",
						current.filter((id) => id !== permissionId),
					);
				}
			},
			[setValue, permissionIds],
		);

		const handleSelectAll = React.useCallback(() => {
			setValue(
				"permissionIds",
				allPermissions.map((p) => p.id),
			);
		}, [setValue, allPermissions]);

		const handleDeselectAll = React.useCallback(() => {
			setValue("permissionIds", []);
		}, [setValue]);

		const handleSelectModule = React.useCallback(
			(module: string) => {
				const modulePermissionIds = permissionsByModule[module]?.map((p) => p.id) ?? [];
				const current = permissionIds ?? [];
				const newIds = new Set([...current, ...modulePermissionIds]);
				setValue("permissionIds", Array.from(newIds));
			},
			[setValue, permissionIds, permissionsByModule],
		);

		const handleDeselectModule = React.useCallback(
			(module: string) => {
				const modulePermissionIds = new Set(permissionsByModule[module]?.map((p) => p.id) ?? []);
				const current = permissionIds ?? [];
				setValue(
					"permissionIds",
					current.filter((id) => !modulePermissionIds.has(id)),
				);
			},
			[setValue, permissionIds, permissionsByModule],
		);

		return (
			<Dialog open={open} onOpenChange={onOpenChange}>
				<DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
					<DialogHeader className="flex-shrink-0">
						<DialogTitle>{isEditing ? t("edit") : t("create")}</DialogTitle>
						<DialogDescription>
							{isEditing ? tCommon("edit") : tCommon("create")} {t("title").toLowerCase()}
							{isSystemRole && ` (${t("system")} - ${t("partialEdit")})`}
						</DialogDescription>
					</DialogHeader>
					<form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col flex-1 min-h-0">
						<div className="flex-1 overflow-y-auto min-h-0">
							<div className="space-y-4 pr-2">
								<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
									<div className="space-y-2">
										<Label htmlFor="code">{t("code")}</Label>
										<Input id="code" {...register("code")} disabled={isEditing} aria-invalid={!!errors.code} />
										{errors.code && <p className="text-sm text-destructive">{errors.code.message}</p>}
									</div>
									<div className="space-y-2">
										<Label htmlFor="name">{t("name")}</Label>
										<Input id="name" {...register("name")} disabled={isSystemRole} aria-invalid={!!errors.name} />
										{errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
									</div>
								</div>
								<div className="space-y-2">
									<Label htmlFor="nameAm">{t("nameAm")}</Label>
									<Input id="nameAm" {...register("nameAm")} aria-invalid={!!errors.nameAm} />
									{errors.nameAm && <p className="text-sm text-destructive">{errors.nameAm.message}</p>}
								</div>
								<div className="space-y-2">
									<Label htmlFor="description">{t("description")}</Label>
									<Textarea id="description" {...register("description")} rows={2} />
								</div>
								<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
									<div className="space-y-2">
										<Label htmlFor="level">{t("level")}</Label>
										<Input
											id="level"
											type="number"
											{...register("level", { valueAsNumber: true })}
											disabled={isSystemRole}
											aria-invalid={!!errors.level}
										/>
										{errors.level && <p className="text-sm text-destructive">{errors.level.message}</p>}
									</div>
									<div className="space-y-2">
										<Label htmlFor="accessScope">{t("accessScope")}</Label>
										<Select value={accessScope} onValueChange={handleAccessScopeChange}>
											<SelectTrigger aria-invalid={!!errors.accessScope}>
												<SelectValue placeholder={t("selectAccessScope")} />
											</SelectTrigger>
											<SelectContent>
												{ACCESS_SCOPES.map((scope) => (
													<SelectItem key={scope} value={scope}>
														{t(`scopes.${scope}`)}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
										{errors.accessScope && <p className="text-sm text-destructive">{errors.accessScope.message}</p>}
									</div>
								</div>
								<div className="space-y-2">
									<div className="flex items-center justify-between">
										<Label>{t("permissions")}</Label>
										<div className="flex gap-2">
											<Button type="button" variant="outline" size="sm" onClick={handleSelectAll}>
												{tCommon("selectAll")}
											</Button>
											<Button type="button" variant="outline" size="sm" onClick={handleDeselectAll}>
												{tCommon("deselectAll")}
											</Button>
										</div>
									</div>
									<ScrollArea className="h-48 rounded-md border p-4">
										<div className="space-y-4">
											{modules.map((module) => {
												const modulePerms = permissionsByModule[module] ?? [];
												return (
													<div key={module} className="space-y-2">
														<div className="flex items-center justify-between border-b pb-1">
															<span className="font-medium capitalize">{module}</span>
															<div className="flex gap-1">
																<Button
																	type="button"
																	variant="ghost"
																	size="sm"
																	className="h-6 px-2 text-xs"
																	onClick={() => handleSelectModule(module)}
																>
																	{tCommon("all")}
																</Button>
																<Button
																	type="button"
																	variant="ghost"
																	size="sm"
																	className="h-6 px-2 text-xs"
																	onClick={() => handleDeselectModule(module)}
																>
																	{tCommon("none")}
																</Button>
															</div>
														</div>
														<div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
															{modulePerms.map((permission) => (
																<div key={permission.id} className="flex items-center space-x-2">
																	<Checkbox
																		id={permission.id}
																		checked={permissionIds?.includes(permission.id) ?? false}
																		onCheckedChange={(checked) =>
																			handlePermissionToggle(permission.id, checked === true)
																		}
																	/>
																	<Label
																		htmlFor={permission.id}
																		className="cursor-pointer text-xs"
																		title={permission.description}
																	>
																		{permission.action}:{permission.resource}
																	</Label>
																</div>
															))}
														</div>
													</div>
												);
											})}
										</div>
									</ScrollArea>
									<p className="text-xs text-muted-foreground">
										{permissionIds?.length ?? 0} {t("permissionsSelected")}
									</p>
								</div>
								<div className="flex items-center space-x-2">
									<Checkbox id="isActive" checked={isActive} onCheckedChange={handleCheckedChange} />
									<Label htmlFor="isActive" className="cursor-pointer">
										{t("isActive")}
									</Label>
								</div>
							</div>
						</div>
						<DialogFooter className="flex-shrink-0 pt-4 border-t mt-4">
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
		prevProps.role?.id === nextProps.role?.id &&
		prevProps.isLoading === nextProps.isLoading,
);

RoleFormDialog.displayName = "RoleFormDialog";
