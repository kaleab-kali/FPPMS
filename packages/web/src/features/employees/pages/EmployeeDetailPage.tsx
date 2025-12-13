import {
	Activity,
	AlertTriangle,
	ArrowLeft,
	Award,
	BookOpen,
	Briefcase,
	Calendar,
	Clock,
	CreditCard,
	FileText,
	Heart,
	Home,
	Mail,
	MoreHorizontal,
	Package,
	Pencil,
	Phone,
	Shield,
	Trash2,
	TrendingUp,
	User,
	UserCheck,
	Users,
} from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { useDeleteEmployee } from "#web/api/employees/employees.mutations.ts";
import { useEmployee } from "#web/api/employees/employees.queries.ts";
import { ConfirmDialog } from "#web/components/common/ConfirmDialog.tsx";
import { Avatar, AvatarFallback } from "#web/components/ui/avatar.tsx";
import { Badge } from "#web/components/ui/badge.tsx";
import { Button } from "#web/components/ui/button.tsx";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "#web/components/ui/dropdown-menu.tsx";
import { Skeleton } from "#web/components/ui/skeleton.tsx";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "#web/components/ui/tabs.tsx";
import type { Employee } from "#web/types/employee.ts";

const STATUS_VARIANTS = {
	ACTIVE: "default",
	INACTIVE: "secondary",
	ON_LEAVE: "outline",
	SUSPENDED: "destructive",
	RETIRED: "secondary",
	TERMINATED: "destructive",
	DECEASED: "secondary",
} as const;

const TYPE_VARIANTS = {
	MILITARY: "default",
	CIVILIAN: "secondary",
	TEMPORARY: "outline",
} as const;

interface DataFieldProps {
	label: string;
	value: string | number | undefined | null;
}

const DataField = React.memo(
	({ label, value }: DataFieldProps) => (
		<div className="space-y-1">
			<p className="text-xs text-muted-foreground">{label}</p>
			<p className="text-sm font-medium">{value ?? "-"}</p>
		</div>
	),
	(prev, next) => prev.label === next.label && prev.value === next.value,
);
DataField.displayName = "DataField";

interface SectionProps {
	title: string;
	icon: React.ReactNode;
	children: React.ReactNode;
}

const Section = React.memo(
	({ title, icon, children }: SectionProps) => (
		<div className="rounded-lg border bg-card overflow-hidden border-l-4 border-l-navy">
			<div className="flex items-center gap-2 px-4 py-3 border-b bg-muted/30">
				<span className="text-navy">{icon}</span>
				<h3 className="font-semibold text-sm">{title}</h3>
			</div>
			<div className="p-4">{children}</div>
		</div>
	),
	(prev, next) => prev.title === next.title && prev.children === next.children,
);
Section.displayName = "Section";

const HeaderSkeleton = React.memo(
	() => (
		<div className="flex flex-col lg:flex-row gap-6 items-start">
			<Skeleton className="h-24 w-24 rounded-full shrink-0" />
			<div className="flex-1 space-y-3">
				<Skeleton className="h-7 w-56" />
				<Skeleton className="h-4 w-40" />
				<div className="flex gap-2">
					<Skeleton className="h-5 w-16" />
					<Skeleton className="h-5 w-16" />
				</div>
			</div>
		</div>
	),
	() => true,
);
HeaderSkeleton.displayName = "HeaderSkeleton";

const ContentSkeleton = React.memo(
	() => (
		<div className="space-y-4">
			<Skeleton className="h-10 w-full" />
			<div className="grid gap-4 md:grid-cols-2">
				<Skeleton className="h-48" />
				<Skeleton className="h-48" />
			</div>
		</div>
	),
	() => true,
);
ContentSkeleton.displayName = "ContentSkeleton";

interface EmployeeHeaderProps {
	employee: Employee;
	isAmharic: boolean;
	onEdit: () => void;
	onDelete: () => void;
	t: (key: string) => string;
	tCommon: (key: string) => string;
}

const EmployeeHeader = React.memo(
	({ employee, isAmharic, onEdit, onDelete, t, tCommon }: EmployeeHeaderProps) => {
		const displayName = isAmharic && employee.fullNameAm ? employee.fullNameAm : employee.fullName;
		const initials = `${employee.firstName.charAt(0)}${employee.lastName.charAt(0)}`.toUpperCase();

		return (
			<div className="flex flex-col lg:flex-row gap-5 items-start">
				<Avatar className="h-24 w-24 border-4 border-border shadow-md shrink-0">
					<AvatarFallback className="text-2xl font-bold bg-primary text-primary-foreground">{initials}</AvatarFallback>
				</Avatar>

				<div className="flex-1 min-w-0">
					<div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
						<div className="min-w-0">
							<h1 className="text-xl font-bold truncate">{displayName}</h1>
							<p className="text-muted-foreground text-sm">{employee.positionName ?? t("noPosition")}</p>
							<p className="text-muted-foreground font-mono text-xs mt-0.5">{employee.employeeId}</p>
							<div className="flex flex-wrap gap-1.5 mt-2">
								<Badge variant={TYPE_VARIANTS[employee.employeeType]} className="text-xs">
									{t(`types.${employee.employeeType}`)}
								</Badge>
								<Badge variant={STATUS_VARIANTS[employee.status]} className="text-xs">
									{t(`statuses.${employee.status}`)}
								</Badge>
								{employee.faydaVerified && (
									<Badge variant="outline" className="gap-1 text-xs">
										<Shield className="h-3 w-3" />
										{t("verified")}
									</Badge>
								)}
							</div>
						</div>

						<div className="flex flex-wrap gap-2 shrink-0">
							{employee.email && (
								<Button variant="outline" size="sm" asChild>
									<a href={`mailto:${employee.email}`}>
										<Mail className="h-4 w-4 mr-1.5" />
										{tCommon("email")}
									</a>
								</Button>
							)}
							<Button variant="outline" size="sm" asChild>
								<a href={`tel:${employee.primaryPhone}`}>
									<Phone className="h-4 w-4 mr-1.5" />
									{tCommon("call")}
								</a>
							</Button>
							<Button size="sm" onClick={onEdit}>
								<Pencil className="h-4 w-4 mr-1.5" />
								{tCommon("edit")}
							</Button>
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button variant="outline" size="icon" className="h-8 w-8">
										<MoreHorizontal className="h-4 w-4" />
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align="end">
									<DropdownMenuItem>
										<FileText className="h-4 w-4 mr-2" />
										{tCommon("export")}
									</DropdownMenuItem>
									<DropdownMenuSeparator />
									<DropdownMenuItem onClick={onDelete} className="text-destructive">
										<Trash2 className="h-4 w-4 mr-2" />
										{tCommon("delete")}
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						</div>
					</div>
				</div>
			</div>
		);
	},
	(prev, next) => prev.employee.id === next.employee.id && prev.isAmharic === next.isAmharic,
);
EmployeeHeader.displayName = "EmployeeHeader";

interface TabProps {
	employee: Employee;
	t: (key: string) => string;
}

const formatDate = (dateString: string | undefined) => {
	if (!dateString) return "-";
	return new Date(dateString).toLocaleDateString();
};

const BasicInfoTab = React.memo(
	({ employee, t }: TabProps) => (
		<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
			<Section title={t("personalInfo")} icon={<User className="h-4 w-4" />}>
				<div className="grid grid-cols-2 gap-x-4 gap-y-3">
					<DataField label={t("firstName")} value={employee.firstName} />
					<DataField label={t("firstNameAm")} value={employee.firstNameAm} />
					<DataField label={t("middleName")} value={employee.middleName} />
					<DataField label={t("middleNameAm")} value={employee.middleNameAm} />
					<DataField label={t("lastName")} value={employee.lastName} />
					<DataField label={t("lastNameAm")} value={employee.lastNameAm} />
					<DataField label={t("gender")} value={t(`genders.${employee.gender}`)} />
					<DataField label={t("dateOfBirth")} value={formatDate(employee.dateOfBirth)} />
					<DataField label={t("birthPlace")} value={employee.birthPlace} />
					<DataField label={t("nationality")} value={employee.nationality} />
					<DataField label={t("ethnicity")} value={employee.ethnicity} />
					<DataField
						label={t("maritalStatus")}
						value={employee.maritalStatus ? t(`maritalStatuses.${employee.maritalStatus}`) : undefined}
					/>
					{employee.marriageDate && <DataField label={t("marriageDate")} value={formatDate(employee.marriageDate)} />}
				</div>
			</Section>

			<Section title={t("contactInfo")} icon={<Phone className="h-4 w-4" />}>
				<div className="grid grid-cols-2 gap-x-4 gap-y-3">
					<DataField label={t("primaryPhone")} value={employee.primaryPhone} />
					<DataField label={t("secondaryPhone")} value={employee.secondaryPhone} />
					<DataField label={t("email")} value={employee.email} />
				</div>
			</Section>

			<Section title={t("addressInfo")} icon={<Home className="h-4 w-4" />}>
				<div className="grid grid-cols-2 gap-x-4 gap-y-3">
					<DataField label={t("region")} value={employee.addressRegionName} />
					<DataField label={t("subCity")} value={employee.addressSubCityName} />
					<DataField label={t("woreda")} value={employee.addressWoredaName} />
					<DataField label={t("houseNumber")} value={employee.addressHouseNumber} />
					<DataField label={t("uniqueAreaName")} value={employee.addressUniqueAreaName} />
				</div>
			</Section>

			<Section title={t("physicalInfo")} icon={<Heart className="h-4 w-4" />}>
				<div className="grid grid-cols-2 gap-x-4 gap-y-3">
					<DataField label={t("height")} value={employee.height ? `${employee.height} cm` : undefined} />
					<DataField label={t("weight")} value={employee.weight ? `${employee.weight} kg` : undefined} />
					<DataField
						label={t("bloodType")}
						value={employee.bloodType ? t(`bloodTypes.${employee.bloodType}`) : undefined}
					/>
					<DataField label={t("eyeColor")} value={employee.eyeColor} />
					<DataField label={t("hairColor")} value={employee.hairColor} />
					<DataField label={t("distinguishingMarks")} value={employee.distinguishingMarks} />
				</div>
			</Section>

			<Section title={t("identificationInfo")} icon={<CreditCard className="h-4 w-4" />}>
				<div className="grid grid-cols-2 gap-x-4 gap-y-3">
					<DataField label={t("employeeId")} value={employee.employeeId} />
					<DataField label={t("faydaId")} value={employee.faydaId} />
					<DataField label={t("passportNumber")} value={employee.passportNumber} />
					<DataField label={t("drivingLicense")} value={employee.drivingLicense} />
				</div>
			</Section>

			<Section title={t("motherInfo")} icon={<Users className="h-4 w-4" />}>
				<div className="grid grid-cols-2 gap-x-4 gap-y-3">
					<DataField label={t("motherFullName")} value={employee.motherFullName} />
					<DataField label={t("motherFullNameAm")} value={employee.motherFullNameAm} />
					<DataField label={t("motherPhone")} value={employee.motherPhone} />
					<DataField
						label={t("motherIsAlive")}
						value={employee.motherIsAlive !== undefined ? (employee.motherIsAlive ? t("yes") : t("no")) : undefined}
					/>
					<DataField label={t("motherAddress")} value={employee.motherAddress} />
				</div>
			</Section>

			<Section title={t("emergencyContact")} icon={<UserCheck className="h-4 w-4" />}>
				<div className="grid grid-cols-2 gap-x-4 gap-y-3">
					<DataField label={t("emergencyFullName")} value={employee.emergencyFullName} />
					<DataField label={t("emergencyFullNameAm")} value={employee.emergencyFullNameAm} />
					<DataField label={t("emergencyRelationship")} value={employee.emergencyRelationship} />
					<DataField label={t("emergencyPhone")} value={employee.emergencyPhone} />
					<DataField label={t("emergencyAltPhone")} value={employee.emergencyAltPhone} />
					<DataField label={t("emergencyEmail")} value={employee.emergencyEmail} />
					<DataField label={t("region")} value={employee.emergencyRegionName} />
					<DataField label={t("subCity")} value={employee.emergencySubCityName} />
					<DataField label={t("woreda")} value={employee.emergencyWoredaName} />
					<DataField label={t("houseNumber")} value={employee.emergencyHouseNumber} />
					<DataField label={t("uniqueAreaName")} value={employee.emergencyUniqueAreaName} />
				</div>
			</Section>

			<Section title={t("employmentInfo")} icon={<Briefcase className="h-4 w-4" />}>
				<div className="grid grid-cols-2 gap-x-4 gap-y-3">
					<DataField label={t("employeeType")} value={t(`types.${employee.employeeType}`)} />
					<DataField label={t("status")} value={t(`statuses.${employee.status}`)} />
					<DataField label={t("center")} value={employee.centerName} />
					<DataField label={t("department")} value={employee.departmentName} />
					<DataField label={t("position")} value={employee.positionName} />
					{employee.employeeType === "MILITARY" && <DataField label={t("rank")} value={employee.rankName} />}
					<DataField label={t("employmentDate")} value={formatDate(employee.employmentDate)} />
					<DataField
						label={t("workSchedule")}
						value={employee.workScheduleType ? t(`workScheduleTypes.${employee.workScheduleType}`) : undefined}
					/>
				</div>
			</Section>

			<Section title={t("salaryInfo")} icon={<TrendingUp className="h-4 w-4" />}>
				<div className="grid grid-cols-2 gap-x-4 gap-y-3">
					<DataField label={t("salary")} value={employee.currentSalary} />
					<DataField label={t("salaryStep")} value={employee.currentSalaryStep} />
				</div>
			</Section>

			{employee.isTransfer && (
				<Section title={t("transferInfo")} icon={<FileText className="h-4 w-4" />}>
					<div className="grid grid-cols-2 gap-x-4 gap-y-3">
						<DataField label={t("isTransfer")} value={t("yes")} />
						<DataField label={t("originalEmploymentDate")} value={formatDate(employee.originalEmploymentDate)} />
						<DataField label={t("sourceOrganization")} value={employee.sourceOrganization} />
					</div>
				</Section>
			)}

			{employee.employeeType === "TEMPORARY" && (
				<Section title={t("contractInfo")} icon={<Calendar className="h-4 w-4" />}>
					<div className="grid grid-cols-2 gap-x-4 gap-y-3">
						<DataField label={t("contractStart")} value={formatDate(employee.contractStartDate)} />
						<DataField label={t("contractEnd")} value={formatDate(employee.contractEndDate)} />
						<DataField label={t("contractAmount")} value={employee.contractAmount} />
					</div>
				</Section>
			)}

			{employee.retirementDate && (
				<Section title={t("retirementInfo")} icon={<Briefcase className="h-4 w-4" />}>
					<div className="grid grid-cols-2 gap-x-4 gap-y-3">
						<DataField label={t("retirementDate")} value={formatDate(employee.retirementDate)} />
					</div>
				</Section>
			)}
		</div>
	),
	(prev, next) => prev.employee.id === next.employee.id,
);
BasicInfoTab.displayName = "BasicInfoTab";

const PlaceholderTab = React.memo(
	({ title, icon, t }: { title: string; icon: React.ReactNode; t: (key: string) => string }) => (
		<div className="flex flex-col items-center justify-center py-16 text-center">
			<div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">{icon}</div>
			<h3 className="text-lg font-semibold mb-2">{title}</h3>
			<p className="text-muted-foreground text-sm max-w-md">{t("tabComingSoon")}</p>
		</div>
	),
	(prev, next) => prev.title === next.title,
);
PlaceholderTab.displayName = "PlaceholderTab";

export const EmployeeDetailPage = React.memo(
	() => {
		const { t } = useTranslation("employees");
		const { t: tCommon } = useTranslation("common");
		const { i18n } = useTranslation();
		const navigate = useNavigate();
		const { id } = useParams<{ id: string }>();

		const [deleteOpen, setDeleteOpen] = React.useState(false);

		const { data: employee, isLoading, error } = useEmployee(id ?? "");
		const deleteMutation = useDeleteEmployee();

		const isAmharic = i18n.language === "am";

		const handleBack = React.useCallback(() => {
			navigate("/employees");
		}, [navigate]);

		const handleEdit = React.useCallback(() => {
			navigate(`/employees/${id}/edit`);
		}, [navigate, id]);

		const handleDeleteClick = React.useCallback(() => {
			setDeleteOpen(true);
		}, []);

		const handleDeleteConfirm = React.useCallback(() => {
			if (id) {
				deleteMutation.mutate(id, {
					onSuccess: () => {
						toast.success(tCommon("success"));
						navigate("/employees");
					},
					onError: () => {
						toast.error(tCommon("error"));
					},
				});
			}
		}, [id, deleteMutation, tCommon, navigate]);

		if (isLoading) {
			return (
				<div className="space-y-6">
					<div className="flex items-center gap-3">
						<Button variant="ghost" size="icon" onClick={handleBack}>
							<ArrowLeft className="h-5 w-5" />
						</Button>
						<span className="text-muted-foreground text-sm">{t("view")}</span>
					</div>
					<HeaderSkeleton />
					<ContentSkeleton />
				</div>
			);
		}

		if (error || !employee) {
			return (
				<div className="flex flex-col items-center justify-center py-16 space-y-4">
					<p className="text-destructive">{tCommon("error")}</p>
					<Button variant="outline" onClick={handleBack}>
						<ArrowLeft className="mr-2 h-4 w-4" />
						{tCommon("back")}
					</Button>
				</div>
			);
		}

		return (
			<div className="space-y-6">
				<div className="flex items-center gap-3">
					<Button variant="ghost" size="icon" onClick={handleBack}>
						<ArrowLeft className="h-5 w-5" />
					</Button>
					<span className="text-muted-foreground text-sm">{t("view")}</span>
				</div>

				<EmployeeHeader
					employee={employee}
					isAmharic={isAmharic}
					onEdit={handleEdit}
					onDelete={handleDeleteClick}
					t={t}
					tCommon={tCommon}
				/>

				<Tabs defaultValue="basic" className="w-full">
					<TabsList className="w-full h-auto p-1.5 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-1 bg-muted/50 rounded-lg">
						<TabsTrigger
							value="basic"
							className="text-xs gap-1.5 data-[state=active]:bg-background data-[state=active]:shadow-sm"
						>
							<User className="h-3.5 w-3.5" />
							{t("tabs.basic")}
						</TabsTrigger>
						<TabsTrigger
							value="education"
							className="text-xs gap-1.5 data-[state=active]:bg-background data-[state=active]:shadow-sm"
						>
							<BookOpen className="h-3.5 w-3.5" />
							{t("tabs.education")}
						</TabsTrigger>
						<TabsTrigger
							value="attendance"
							className="text-xs gap-1.5 data-[state=active]:bg-background data-[state=active]:shadow-sm"
						>
							<Clock className="h-3.5 w-3.5" />
							{t("tabs.attendance")}
						</TabsTrigger>
						<TabsTrigger
							value="leave"
							className="text-xs gap-1.5 data-[state=active]:bg-background data-[state=active]:shadow-sm"
						>
							<Calendar className="h-3.5 w-3.5" />
							{t("tabs.leave")}
						</TabsTrigger>
						<TabsTrigger
							value="appraisal"
							className="text-xs gap-1.5 data-[state=active]:bg-background data-[state=active]:shadow-sm"
						>
							<Award className="h-3.5 w-3.5" />
							{t("tabs.appraisal")}
						</TabsTrigger>
						<TabsTrigger
							value="health"
							className="text-xs gap-1.5 data-[state=active]:bg-background data-[state=active]:shadow-sm"
						>
							<Heart className="h-3.5 w-3.5" />
							{t("tabs.health")}
						</TabsTrigger>
						<TabsTrigger
							value="retirement"
							className="text-xs gap-1.5 data-[state=active]:bg-background data-[state=active]:shadow-sm"
						>
							<Briefcase className="h-3.5 w-3.5" />
							{t("tabs.retirement")}
						</TabsTrigger>
						<TabsTrigger
							value="complaint"
							className="text-xs gap-1.5 data-[state=active]:bg-background data-[state=active]:shadow-sm"
						>
							<AlertTriangle className="h-3.5 w-3.5" />
							{t("tabs.complaint")}
						</TabsTrigger>
						<TabsTrigger
							value="performance"
							className="text-xs gap-1.5 data-[state=active]:bg-background data-[state=active]:shadow-sm"
						>
							<Activity className="h-3.5 w-3.5" />
							{t("tabs.performance")}
						</TabsTrigger>
						<TabsTrigger
							value="salary"
							className="text-xs gap-1.5 data-[state=active]:bg-background data-[state=active]:shadow-sm"
						>
							<TrendingUp className="h-3.5 w-3.5" />
							{t("tabs.salary")}
						</TabsTrigger>
						<TabsTrigger
							value="inventory"
							className="text-xs gap-1.5 data-[state=active]:bg-background data-[state=active]:shadow-sm"
						>
							<Package className="h-3.5 w-3.5" />
							{t("tabs.inventory")}
						</TabsTrigger>
					</TabsList>

					<TabsContent value="basic" className="mt-5">
						<BasicInfoTab employee={employee} t={t} />
					</TabsContent>

					<TabsContent value="education" className="mt-5">
						<PlaceholderTab
							title={t("tabs.education")}
							icon={<BookOpen className="h-8 w-8 text-muted-foreground" />}
							t={t}
						/>
					</TabsContent>

					<TabsContent value="attendance" className="mt-5">
						<PlaceholderTab
							title={t("tabs.attendance")}
							icon={<Clock className="h-8 w-8 text-muted-foreground" />}
							t={t}
						/>
					</TabsContent>

					<TabsContent value="leave" className="mt-5">
						<PlaceholderTab
							title={t("tabs.leave")}
							icon={<Calendar className="h-8 w-8 text-muted-foreground" />}
							t={t}
						/>
					</TabsContent>

					<TabsContent value="appraisal" className="mt-5">
						<PlaceholderTab
							title={t("tabs.appraisal")}
							icon={<Award className="h-8 w-8 text-muted-foreground" />}
							t={t}
						/>
					</TabsContent>

					<TabsContent value="health" className="mt-5">
						<PlaceholderTab title={t("tabs.health")} icon={<Heart className="h-8 w-8 text-muted-foreground" />} t={t} />
					</TabsContent>

					<TabsContent value="retirement" className="mt-5">
						<PlaceholderTab
							title={t("tabs.retirement")}
							icon={<Briefcase className="h-8 w-8 text-muted-foreground" />}
							t={t}
						/>
					</TabsContent>

					<TabsContent value="complaint" className="mt-5">
						<PlaceholderTab
							title={t("tabs.complaint")}
							icon={<AlertTriangle className="h-8 w-8 text-muted-foreground" />}
							t={t}
						/>
					</TabsContent>

					<TabsContent value="performance" className="mt-5">
						<PlaceholderTab
							title={t("tabs.performance")}
							icon={<Activity className="h-8 w-8 text-muted-foreground" />}
							t={t}
						/>
					</TabsContent>

					<TabsContent value="salary" className="mt-5">
						<PlaceholderTab
							title={t("tabs.salary")}
							icon={<TrendingUp className="h-8 w-8 text-muted-foreground" />}
							t={t}
						/>
					</TabsContent>

					<TabsContent value="inventory" className="mt-5">
						<PlaceholderTab
							title={t("tabs.inventory")}
							icon={<Package className="h-8 w-8 text-muted-foreground" />}
							t={t}
						/>
					</TabsContent>
				</Tabs>

				<ConfirmDialog
					open={deleteOpen}
					onOpenChange={setDeleteOpen}
					title={tCommon("confirm")}
					description={t("deleteConfirm")}
					onConfirm={handleDeleteConfirm}
					isLoading={deleteMutation.isPending}
					variant="destructive"
				/>
			</div>
		);
	},
	() => true,
);

EmployeeDetailPage.displayName = "EmployeeDetailPage";
