import { Check, ChevronsUpDown, Copy } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useCenters } from "#web/api/centers/centers.queries.ts";
import { useRoles } from "#web/api/roles/roles.queries.ts";
import { useAvailableEmployees } from "#web/api/users/users.queries.ts";
import { Button } from "#web/components/ui/button.tsx";
import { Checkbox } from "#web/components/ui/checkbox.tsx";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "#web/components/ui/command.tsx";
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
import { Popover, PopoverContent, PopoverTrigger } from "#web/components/ui/popover.tsx";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "#web/components/ui/select.tsx";
import { cn } from "#web/lib/utils.ts";
import type { AvailableEmployee, CreateUserFromEmployeeRequest, UpdateUserRequest, User } from "#web/types/user.ts";

const NONE_VALUE = "__none__";
const USER_STATUSES = ["ACTIVE", "INACTIVE", "LOCKED", "PENDING"] as const;

interface UserFormDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSubmit: (data: CreateUserFromEmployeeRequest | UpdateUserRequest) => void;
	user?: User;
	isLoading?: boolean;
	createdCredentials?: { username: string; password: string };
}

export const UserFormDialog = React.memo(
	({ open, onOpenChange, onSubmit, user, isLoading = false, createdCredentials }: UserFormDialogProps) => {
		const { t } = useTranslation("users");
		const { t: tCommon } = useTranslation("common");
		const isEditing = !!user;

		const [employeeSearch, setEmployeeSearch] = React.useState("");
		const [selectedEmployee, setSelectedEmployee] = React.useState<AvailableEmployee | undefined>(undefined);
		const [employeePopoverOpen, setEmployeePopoverOpen] = React.useState(false);
		const [centerId, setCenterId] = React.useState<string>("");
		const [status, setStatus] = React.useState<(typeof USER_STATUSES)[number]>("ACTIVE");
		const [mustChangePassword, setMustChangePassword] = React.useState(true);
		const [roleIds, setRoleIds] = React.useState<string[]>([]);
		const [email, setEmail] = React.useState("");

		const { data: rolesData } = useRoles();
		const { data: centersData } = useCenters();
		const { data: employeesData } = useAvailableEmployees(employeeSearch);

		const roles = rolesData ?? [];
		const centers = centersData ?? [];
		const availableEmployees = employeesData ?? [];

		React.useEffect(() => {
			if (user) {
				setCenterId(user.centerId ?? "");
				setStatus(user.status);
				setMustChangePassword(user.mustChangePassword);
				setRoleIds(user.roles.map((r) => r.id));
				setEmail(user.email ?? "");
			} else {
				setSelectedEmployee(undefined);
				setCenterId("");
				setStatus("ACTIVE");
				setMustChangePassword(true);
				setRoleIds([]);
				setEmail("");
			}
		}, [user]);

		const handleSubmit = React.useCallback(
			(e: React.FormEvent) => {
				e.preventDefault();

				if (isEditing) {
					const updatePayload: UpdateUserRequest = {
						email: email || undefined,
						centerId: centerId === NONE_VALUE || centerId === "" ? undefined : centerId,
						status,
						mustChangePassword,
						roleIds: roleIds.length > 0 ? roleIds : undefined,
					};
					onSubmit(updatePayload);
				} else {
					if (!selectedEmployee) {
						toast.error(t("selectEmployeeRequired"));
						return;
					}
					const createPayload: CreateUserFromEmployeeRequest = {
						employeeId: selectedEmployee.id,
						centerId: centerId === NONE_VALUE || centerId === "" ? undefined : centerId,
						roleIds: roleIds.length > 0 ? roleIds : undefined,
					};
					onSubmit(createPayload);
				}
			},
			[isEditing, selectedEmployee, centerId, status, mustChangePassword, roleIds, email, onSubmit, t],
		);

		const handleRoleToggle = React.useCallback((roleId: string, checked: boolean) => {
			setRoleIds((prev) => (checked ? [...prev, roleId] : prev.filter((id) => id !== roleId)));
		}, []);

		const handleCopyCredentials = React.useCallback(() => {
			if (createdCredentials) {
				const text = `Username: ${createdCredentials.username}\nPassword: ${createdCredentials.password}`;
				navigator.clipboard.writeText(text);
				toast.success(t("credentialsCopied"));
			}
		}, [createdCredentials, t]);

		if (createdCredentials) {
			return (
				<Dialog open={open} onOpenChange={onOpenChange}>
					<DialogContent className="max-w-[90vw] sm:max-w-md">
						<DialogHeader>
							<DialogTitle>{t("userCreated")}</DialogTitle>
							<DialogDescription>{t("userCreatedDescription")}</DialogDescription>
						</DialogHeader>
						<div className="space-y-4">
							<div className="rounded-lg border bg-muted p-4 space-y-3">
								<div className="space-y-1">
									<Label className="text-xs text-muted-foreground">{t("username")}</Label>
									<p className="font-mono text-lg font-semibold">{createdCredentials.username}</p>
								</div>
								<div className="space-y-1">
									<Label className="text-xs text-muted-foreground">{t("password")}</Label>
									<p className="font-mono text-lg font-semibold">{createdCredentials.password}</p>
								</div>
							</div>
							<p className="text-sm text-muted-foreground">{t("passwordChangeRequired")}</p>
						</div>
						<DialogFooter className="flex-col gap-2 sm:flex-row">
							<Button type="button" variant="outline" onClick={handleCopyCredentials}>
								<Copy className="mr-2 h-4 w-4" />
								{t("copyCredentials")}
							</Button>
							<Button type="button" onClick={() => onOpenChange(false)}>
								{tCommon("close")}
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			);
		}

		return (
			<Dialog open={open} onOpenChange={onOpenChange}>
				<DialogContent className="max-w-[90vw] sm:max-w-lg max-h-[90vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle>{isEditing ? t("edit") : t("create")}</DialogTitle>
						<DialogDescription>{isEditing ? t("editDescription") : t("createDescription")}</DialogDescription>
					</DialogHeader>
					<form onSubmit={handleSubmit} className="space-y-4">
						{!isEditing && (
							<div className="space-y-2">
								<Label>{t("selectEmployee")}</Label>
								<Popover open={employeePopoverOpen} onOpenChange={setEmployeePopoverOpen}>
									<PopoverTrigger asChild>
										<Button
											variant="outline"
											role="combobox"
											aria-expanded={employeePopoverOpen}
											className="w-full justify-between"
										>
											{selectedEmployee
												? `${selectedEmployee.employeeId} - ${selectedEmployee.fullName}`
												: t("selectEmployeePlaceholder")}
											<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
										</Button>
									</PopoverTrigger>
									<PopoverContent className="w-full p-0" align="start">
										<Command>
											<CommandInput
												placeholder={t("searchEmployee")}
												value={employeeSearch}
												onValueChange={setEmployeeSearch}
											/>
											<CommandList>
												<CommandEmpty>{t("noEmployeesFound")}</CommandEmpty>
												<CommandGroup>
													{availableEmployees.map((emp) => (
														<CommandItem
															key={emp.id}
															value={emp.employeeId}
															onSelect={() => {
																setSelectedEmployee(emp);
																setEmployeePopoverOpen(false);
															}}
														>
															<Check
																className={cn(
																	"mr-2 h-4 w-4",
																	selectedEmployee?.id === emp.id ? "opacity-100" : "opacity-0",
																)}
															/>
															<div className="flex flex-col">
																<span className="font-medium">
																	{emp.employeeId} - {emp.fullName}
																</span>
																<span className="text-xs text-muted-foreground">
																	{emp.departmentName} {emp.positionName ? `/ ${emp.positionName}` : ""}
																</span>
															</div>
														</CommandItem>
													))}
												</CommandGroup>
											</CommandList>
										</Command>
									</PopoverContent>
								</Popover>
							</div>
						)}

						{isEditing && (
							<>
								<div className="space-y-2">
									<Label>{t("username")}</Label>
									<Input value={user?.username ?? ""} disabled />
								</div>
								<div className="space-y-2">
									<Label htmlFor="email">{t("email")}</Label>
									<Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
								</div>
								<div className="space-y-2">
									<Label>{tCommon("status")}</Label>
									<Select value={status} onValueChange={(v) => setStatus(v as typeof status)}>
										<SelectTrigger>
											<SelectValue />
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
							</>
						)}

						<div className="space-y-2">
							<Label>{t("center")}</Label>
							<Select value={centerId || NONE_VALUE} onValueChange={(v) => setCenterId(v === NONE_VALUE ? "" : v)}>
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
							<div className="grid grid-cols-1 gap-2 sm:grid-cols-2 max-h-40 overflow-y-auto border rounded-md p-2">
								{roles.map((role) => (
									<div key={role.id} className="flex items-center space-x-2">
										<Checkbox
											id={`role-${role.id}`}
											checked={roleIds.includes(role.id)}
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
									onCheckedChange={(checked) => setMustChangePassword(checked === true)}
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
							<Button type="submit" disabled={isLoading || (!isEditing && !selectedEmployee)}>
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
		prevProps.isLoading === nextProps.isLoading &&
		prevProps.createdCredentials?.username === nextProps.createdCredentials?.username,
);

UserFormDialog.displayName = "UserFormDialog";
