import type { ColumnDef } from "@tanstack/react-table";
import { Heart, MoreHorizontal, Pencil, Plus, Trash2, User, Users } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
	useCreateFamilyMember,
	useDeleteFamilyMember,
	useUpdateFamilyMember,
} from "#web/api/employees/employee-family.mutations.ts";
import { useFamilyMembers } from "#web/api/employees/employee-family.queries.ts";
import { DataTable } from "#web/components/common/DataTable.tsx";
import { EmployeeSearch } from "#web/components/common/EmployeeSearch.tsx";
import { Badge } from "#web/components/ui/badge.tsx";
import { Button } from "#web/components/ui/button.tsx";
import { Card, CardContent, CardHeader, CardTitle } from "#web/components/ui/card.tsx";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "#web/components/ui/dialog.tsx";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "#web/components/ui/dropdown-menu.tsx";
import { Input } from "#web/components/ui/input.tsx";
import { Label } from "#web/components/ui/label.tsx";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "#web/components/ui/select.tsx";
import { Switch } from "#web/components/ui/switch.tsx";
import type { Employee, Gender } from "#web/types/employee.ts";
import type { CreateFamilyMemberRequest, FamilyMember, UpdateFamilyMemberRequest } from "#web/types/employee-family.ts";
import { FAMILY_RELATIONSHIPS } from "#web/types/employee-family.ts";

const formatDate = (date: string | null): string => {
	if (!date) return "-";
	return new Date(date).toLocaleDateString();
};

interface FormState {
	relationship: string;
	fullName: string;
	fullNameAm: string;
	gender: Gender | "";
	dateOfBirth: string;
	nationalId: string;
	phone: string;
	occupation: string;
	marriageDate: string;
	schoolName: string;
	isAlive: boolean;
}

const INITIAL_FORM_STATE: FormState = {
	relationship: FAMILY_RELATIONSHIPS.SPOUSE,
	fullName: "",
	fullNameAm: "",
	gender: "",
	dateOfBirth: "",
	nationalId: "",
	phone: "",
	occupation: "",
	marriageDate: "",
	schoolName: "",
	isAlive: true,
};

export const EmployeeFamilyPage = React.memo(() => {
	const { t } = useTranslation("employees");
	const { t: tCommon } = useTranslation("common");

	const [selectedEmployee, setSelectedEmployee] = React.useState<Employee | null>(null);
	const [dialogOpen, setDialogOpen] = React.useState(false);
	const [editingMember, setEditingMember] = React.useState<FamilyMember | null>(null);
	const [formState, setFormState] = React.useState<FormState>(INITIAL_FORM_STATE);

	const { data: familyMembers, isLoading } = useFamilyMembers(selectedEmployee?.id ?? "");

	const createMutation = useCreateFamilyMember();
	const updateMutation = useUpdateFamilyMember();
	const deleteMutation = useDeleteFamilyMember();

	const handleEmployeeFound = React.useCallback((employee: Employee) => {
		setSelectedEmployee(employee);
	}, []);

	const handleEmployeeClear = React.useCallback(() => {
		setSelectedEmployee(null);
	}, []);

	const handleAddClick = React.useCallback(() => {
		setEditingMember(null);
		setFormState(INITIAL_FORM_STATE);
		setDialogOpen(true);
	}, []);

	const handleEditClick = React.useCallback((member: FamilyMember) => {
		setEditingMember(member);
		setFormState({
			relationship: member.relationship,
			fullName: member.fullName,
			fullNameAm: member.fullNameAm ?? "",
			gender: member.gender ?? "",
			dateOfBirth: member.dateOfBirth ? member.dateOfBirth.split("T")[0] : "",
			nationalId: member.nationalId ?? "",
			phone: member.phone ?? "",
			occupation: member.occupation ?? "",
			marriageDate: member.marriageDate ? member.marriageDate.split("T")[0] : "",
			schoolName: member.schoolName ?? "",
			isAlive: member.isAlive,
		});
		setDialogOpen(true);
	}, []);

	const handleDelete = React.useCallback(
		(member: FamilyMember) => {
			if (!globalThis.confirm(t("family.deleteConfirm"))) return;

			deleteMutation.mutate(member.id, {
				onSuccess: () => {
					toast.success(tCommon("success"));
				},
				onError: () => {
					toast.error(tCommon("error"));
				},
			});
		},
		[deleteMutation, t, tCommon],
	);

	const handleFormChange = React.useCallback((field: keyof FormState, value: string | boolean) => {
		setFormState((prev) => ({ ...prev, [field]: value }));
	}, []);

	const handleSubmit = React.useCallback(() => {
		if (!formState.fullName.trim() || !formState.relationship) {
			toast.error(tCommon("fillRequired"));
			return;
		}

		if (editingMember) {
			const updateData: UpdateFamilyMemberRequest = {
				relationship: formState.relationship,
				fullName: formState.fullName,
				fullNameAm: formState.fullNameAm || undefined,
				gender: formState.gender || undefined,
				dateOfBirth: formState.dateOfBirth || undefined,
				nationalId: formState.nationalId || undefined,
				phone: formState.phone || undefined,
				occupation: formState.occupation || undefined,
				marriageDate: formState.marriageDate || undefined,
				schoolName: formState.schoolName || undefined,
				isAlive: formState.isAlive,
			};

			updateMutation.mutate(
				{ id: editingMember.id, data: updateData },
				{
					onSuccess: () => {
						toast.success(tCommon("success"));
						setDialogOpen(false);
					},
					onError: () => {
						toast.error(tCommon("error"));
					},
				},
			);
		} else {
			if (!selectedEmployee) return;

			const createData: CreateFamilyMemberRequest = {
				employeeId: selectedEmployee.id,
				relationship: formState.relationship,
				fullName: formState.fullName,
				fullNameAm: formState.fullNameAm || undefined,
				gender: formState.gender || undefined,
				dateOfBirth: formState.dateOfBirth || undefined,
				nationalId: formState.nationalId || undefined,
				phone: formState.phone || undefined,
				occupation: formState.occupation || undefined,
				marriageDate: formState.marriageDate || undefined,
				schoolName: formState.schoolName || undefined,
				isAlive: formState.isAlive,
			};

			createMutation.mutate(createData, {
				onSuccess: () => {
					toast.success(tCommon("success"));
					setDialogOpen(false);
				},
				onError: () => {
					toast.error(tCommon("error"));
				},
			});
		}
	}, [formState, editingMember, selectedEmployee, createMutation, updateMutation, tCommon]);

	const columns = React.useMemo<ColumnDef<FamilyMember>[]>(
		() => [
			{
				accessorKey: "fullName",
				header: t("fullName"),
				cell: ({ row }) => <span className="font-medium">{row.getValue("fullName")}</span>,
			},
			{
				accessorKey: "relationship",
				header: t("family.relationship"),
				cell: ({ row }) => {
					const rel = row.getValue("relationship") as string;
					return <Badge variant="outline">{t(`family.relationships.${rel}`, rel)}</Badge>;
				},
			},
			{
				accessorKey: "gender",
				header: t("gender"),
				cell: ({ row }) => {
					const gender = row.getValue("gender") as string | null;
					return gender ? t(`genders.${gender}`, gender) : "-";
				},
			},
			{
				accessorKey: "dateOfBirth",
				header: t("dateOfBirth"),
				cell: ({ row }) => formatDate(row.getValue("dateOfBirth")),
			},
			{
				accessorKey: "phone",
				header: t("family.phone"),
				cell: ({ row }) => row.getValue("phone") ?? "-",
			},
			{
				accessorKey: "isAlive",
				header: t("family.isAlive"),
				cell: ({ row }) => {
					const isAlive = row.getValue("isAlive") as boolean;
					return (
						<Badge variant={isAlive ? "default" : "secondary"}>
							{isAlive ? t("family.isAlive") : t("family.deceased")}
						</Badge>
					);
				},
			},
			{
				id: "actions",
				header: tCommon("actions"),
				cell: ({ row }) => {
					const member = row.original;
					return (
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button variant="ghost" size="icon" className="h-8 w-8">
									<MoreHorizontal className="h-4 w-4" />
									<span className="sr-only">{tCommon("actions")}</span>
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end">
								<DropdownMenuItem onClick={() => handleEditClick(member)}>
									<Pencil className="mr-2 h-4 w-4" />
									{tCommon("edit")}
								</DropdownMenuItem>
								<DropdownMenuItem onClick={() => handleDelete(member)} className="text-destructive">
									<Trash2 className="mr-2 h-4 w-4" />
									{tCommon("delete")}
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					);
				},
			},
		],
		[t, tCommon, handleEditClick, handleDelete],
	);

	const spouseCount = React.useMemo(
		() => familyMembers?.filter((m) => m.relationship === FAMILY_RELATIONSHIPS.SPOUSE).length ?? 0,
		[familyMembers],
	);

	const childrenCount = React.useMemo(
		() => familyMembers?.filter((m) => m.relationship === FAMILY_RELATIONSHIPS.CHILD).length ?? 0,
		[familyMembers],
	);

	return (
		<div className="space-y-6">
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h1 className="text-2xl font-bold">{t("family.title")}</h1>
					<p className="text-muted-foreground">{t("family.subtitle")}</p>
				</div>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>{t("employeeId")}</CardTitle>
				</CardHeader>
				<CardContent>
					<EmployeeSearch
						onEmployeeFound={handleEmployeeFound}
						onClear={handleEmployeeClear}
						selectedEmployee={selectedEmployee}
					/>
				</CardContent>
			</Card>

			{selectedEmployee && (
				<>
					<div className="flex justify-end">
						<Button onClick={handleAddClick}>
							<Plus className="mr-2 h-4 w-4" />
							{t("family.addMember")}
						</Button>
					</div>

					<div className="grid gap-4 grid-cols-2 md:grid-cols-4">
						<Card>
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="text-sm font-medium">{tCommon("all")}</CardTitle>
								<Users className="h-4 w-4 text-muted-foreground" />
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">{familyMembers?.length ?? 0}</div>
							</CardContent>
						</Card>
						<Card>
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="text-sm font-medium">{t("family.spouse")}</CardTitle>
								<Heart className="h-4 w-4 text-muted-foreground" />
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">{spouseCount}</div>
							</CardContent>
						</Card>
						<Card>
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="text-sm font-medium">{t("family.children")}</CardTitle>
								<User className="h-4 w-4 text-muted-foreground" />
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">{childrenCount}</div>
							</CardContent>
						</Card>
					</div>

					<Card>
						<CardHeader>
							<CardTitle>{t("family.title")}</CardTitle>
						</CardHeader>
						<CardContent>
							{!familyMembers?.length && !isLoading ? (
								<p className="text-center text-muted-foreground py-8">{t("family.noMembers")}</p>
							) : (
								<DataTable columns={columns} data={familyMembers ?? []} isLoading={isLoading} searchColumn="fullName" />
							)}
						</CardContent>
					</Card>
				</>
			)}

			<Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
				<DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle>{editingMember ? t("family.editMember") : t("family.addMember")}</DialogTitle>
						<DialogDescription>{t("family.subtitle")}</DialogDescription>
					</DialogHeader>
					<div className="space-y-4">
						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label>{t("family.relationship")} *</Label>
								<Select value={formState.relationship} onValueChange={(v) => handleFormChange("relationship", v)}>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value={FAMILY_RELATIONSHIPS.SPOUSE}>{t("family.relationships.SPOUSE")}</SelectItem>
										<SelectItem value={FAMILY_RELATIONSHIPS.CHILD}>{t("family.relationships.CHILD")}</SelectItem>
										<SelectItem value={FAMILY_RELATIONSHIPS.PARENT}>{t("family.relationships.PARENT")}</SelectItem>
										<SelectItem value={FAMILY_RELATIONSHIPS.SIBLING}>{t("family.relationships.SIBLING")}</SelectItem>
									</SelectContent>
								</Select>
							</div>
							<div className="space-y-2">
								<Label>{t("gender")}</Label>
								<Select value={formState.gender} onValueChange={(v) => handleFormChange("gender", v)}>
									<SelectTrigger>
										<SelectValue placeholder={t("selectGender")} />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="MALE">{t("genders.MALE")}</SelectItem>
										<SelectItem value="FEMALE">{t("genders.FEMALE")}</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</div>
						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label>{t("fullName")} *</Label>
								<Input
									value={formState.fullName}
									onChange={(e) => handleFormChange("fullName", e.target.value)}
									placeholder={t("fullName")}
								/>
							</div>
							<div className="space-y-2">
								<Label>{t("fullName")} (Amharic)</Label>
								<Input
									value={formState.fullNameAm}
									onChange={(e) => handleFormChange("fullNameAm", e.target.value)}
									placeholder={t("fullName")}
								/>
							</div>
						</div>
						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label>{t("dateOfBirth")}</Label>
								<Input
									type="date"
									value={formState.dateOfBirth}
									onChange={(e) => handleFormChange("dateOfBirth", e.target.value)}
								/>
							</div>
							<div className="space-y-2">
								<Label>{t("family.nationalId")}</Label>
								<Input
									value={formState.nationalId}
									onChange={(e) => handleFormChange("nationalId", e.target.value)}
									placeholder={t("family.nationalId")}
								/>
							</div>
						</div>
						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label>{t("family.phone")}</Label>
								<Input
									value={formState.phone}
									onChange={(e) => handleFormChange("phone", e.target.value)}
									placeholder={t("family.phone")}
								/>
							</div>
							<div className="space-y-2">
								<Label>{t("family.occupation")}</Label>
								<Input
									value={formState.occupation}
									onChange={(e) => handleFormChange("occupation", e.target.value)}
									placeholder={t("family.occupation")}
								/>
							</div>
						</div>
						{formState.relationship === FAMILY_RELATIONSHIPS.SPOUSE && (
							<div className="space-y-2">
								<Label>{t("marriageDate")}</Label>
								<Input
									type="date"
									value={formState.marriageDate}
									onChange={(e) => handleFormChange("marriageDate", e.target.value)}
								/>
							</div>
						)}
						{formState.relationship === FAMILY_RELATIONSHIPS.CHILD && (
							<div className="space-y-2">
								<Label>{t("family.schoolName")}</Label>
								<Input
									value={formState.schoolName}
									onChange={(e) => handleFormChange("schoolName", e.target.value)}
									placeholder={t("family.schoolName")}
								/>
							</div>
						)}
						<div className="flex items-center space-x-2">
							<Switch
								id="isAlive"
								checked={formState.isAlive}
								onCheckedChange={(v) => handleFormChange("isAlive", v)}
							/>
							<Label htmlFor="isAlive">{t("family.isAlive")}</Label>
						</div>
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={() => setDialogOpen(false)}>
							{tCommon("cancel")}
						</Button>
						<Button onClick={handleSubmit} disabled={createMutation.isPending || updateMutation.isPending}>
							{createMutation.isPending || updateMutation.isPending ? tCommon("saving") : tCommon("save")}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
});

EmployeeFamilyPage.displayName = "EmployeeFamilyPage";
