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
	ExternalLink,
	FileText,
	Gavel,
	Heart,
	Home,
	Mail,
	MoreHorizontal,
	Package,
	Pencil,
	Phone,
	Shield,
	Stethoscope,
	Trash2,
	TrendingUp,
	User,
	UserCheck,
	Users,
	UsersRound,
} from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { useEmployeeCommittees, useEmployeeTermHistory } from "#web/api/committees/committees.queries.ts";
import { useEmployeeComplaintHistory } from "#web/api/complaints/complaints.queries.ts";
import { useFamilyMembers } from "#web/api/employees/employee-family.queries.ts";
import { useMaritalStatusHistory } from "#web/api/employees/employee-marital-status.queries.ts";
import { useMedicalRecords } from "#web/api/employees/employee-medical.queries.ts";
import { employeePhotoApi } from "#web/api/employees/employee-photo.api.ts";
import { useActivePhoto } from "#web/api/employees/employee-photo.queries.ts";
import { useDirectSuperior, useSubordinates } from "#web/api/employees/employee-superior.queries.ts";
import { useDeleteEmployee } from "#web/api/employees/employees.mutations.ts";
import { useEmployee } from "#web/api/employees/employees.queries.ts";
import { ConfirmDialog } from "#web/components/common/ConfirmDialog.tsx";
import { Avatar, AvatarFallback, AvatarImage } from "#web/components/ui/avatar.tsx";
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
import { STORAGE_KEYS } from "#web/config/constants.ts";
import { EmployeeAttendanceTab } from "#web/features/employees/components/EmployeeAttendanceTab.tsx";
import { EmployeeCorrespondenceTab } from "#web/features/employees/components/EmployeeCorrespondenceTab.tsx";
import { EmployeeInventoryTab } from "#web/features/employees/components/EmployeeInventoryTab.tsx";
import { EmployeeSalaryTab } from "#web/features/employees/components/EmployeeSalaryTab.tsx";
import type { CommitteeMemberTerm, EmployeeCommitteeMembership } from "#web/types/committee.ts";
import { TERM_STATUS_COLORS, TERM_STATUS_LABELS } from "#web/types/committee.ts";
import type { EmployeeComplaintHistoryItem } from "#web/types/complaint.ts";
import {
	COMPLAINT_ARTICLE_LABELS,
	COMPLAINT_FINDING_LABELS,
	COMPLAINT_STATUS_COLORS,
	COMPLAINT_STATUS_LABELS,
} from "#web/types/complaint.ts";
import type { Employee } from "#web/types/employee.ts";
import type { FamilyMember } from "#web/types/employee-family.ts";
import type { MaritalStatusRecord } from "#web/types/employee-marital-status.ts";
import type { MedicalRecord } from "#web/types/employee-medical.ts";
import type { EmployeeBasicInfo } from "#web/types/employee-superior.ts";

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
	photoId?: string;
}

const EmployeeHeader = React.memo(
	({ employee, isAmharic, onEdit, onDelete, t, tCommon, photoId }: EmployeeHeaderProps) => {
		const displayName = isAmharic && employee.fullNameAm ? employee.fullNameAm : employee.fullName;
		const initials = `${employee.firstName.charAt(0)}${employee.lastName.charAt(0)}`.toUpperCase();
		const token = globalThis.localStorage.getItem(STORAGE_KEYS.accessToken);
		const photoUrl = photoId ? `${employeePhotoApi.getPhotoUrl(photoId)}?token=${token}` : undefined;

		return (
			<div className="flex flex-col lg:flex-row gap-5 items-start">
				<Avatar className="h-24 w-24 border-4 border-border shadow-md shrink-0">
					{photoUrl && <AvatarImage src={photoUrl} alt={displayName} />}
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
	(prev, next) =>
		prev.employee.id === next.employee.id && prev.isAmharic === next.isAmharic && prev.photoId === next.photoId,
);
EmployeeHeader.displayName = "EmployeeHeader";

interface TabProps {
	employee: Employee;
	t: (key: string) => string;
	isAmharic?: boolean;
	directSuperior?: EmployeeBasicInfo | null;
	subordinates?: EmployeeBasicInfo[];
}

const formatDate = (dateString: string | undefined) => {
	if (!dateString) return "-";
	return new Date(dateString).toLocaleDateString();
};

const BasicInfoTab = React.memo(
	({ employee, t, isAmharic, directSuperior, subordinates }: TabProps) => (
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

			<Section title={t("superior.directSuperior")} icon={<UserCheck className="h-4 w-4" />}>
				<div className="space-y-3">
					<div className="grid grid-cols-2 gap-x-4 gap-y-3">
						<DataField
							label={t("superior.directSuperior")}
							value={
								directSuperior
									? isAmharic && directSuperior.fullNameAm
										? directSuperior.fullNameAm
										: directSuperior.fullName
									: t("superior.noSuperior")
							}
						/>
						{directSuperior && (
							<DataField
								label={t("position")}
								value={
									directSuperior.position
										? isAmharic && directSuperior.position.nameAm
											? directSuperior.position.nameAm
											: directSuperior.position.name
										: "-"
								}
							/>
						)}
					</div>
					{subordinates && subordinates.length > 0 && (
						<div className="pt-2 border-t">
							<p className="text-xs text-muted-foreground mb-2">
								{t("superior.subordinates")} ({subordinates.length})
							</p>
							<div className="flex flex-wrap gap-1">
								{subordinates.slice(0, 5).map((sub) => (
									<Badge key={sub.id} variant="outline" className="text-xs">
										{isAmharic && sub.fullNameAm ? sub.fullNameAm : sub.fullName}
									</Badge>
								))}
								{subordinates.length > 5 && (
									<Badge variant="secondary" className="text-xs">
										+{subordinates.length - 5}
									</Badge>
								)}
							</div>
						</div>
					)}
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
	(prev, next) =>
		prev.employee.id === next.employee.id &&
		prev.isAmharic === next.isAmharic &&
		prev.directSuperior?.id === next.directSuperior?.id &&
		prev.subordinates?.length === next.subordinates?.length,
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

interface FamilyTabProps {
	familyMembers: FamilyMember[];
	isLoading: boolean;
	t: (key: string) => string;
}

const FamilyTab = React.memo(
	({ familyMembers, isLoading, t }: FamilyTabProps) => {
		if (isLoading) {
			return (
				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
					<Skeleton className="h-48" />
					<Skeleton className="h-48" />
					<Skeleton className="h-48" />
				</div>
			);
		}

		if (familyMembers.length === 0) {
			return (
				<div className="flex flex-col items-center justify-center py-16 text-center">
					<Users className="h-12 w-12 text-muted-foreground mb-4" />
					<p className="text-muted-foreground">{t("family.noRecords")}</p>
				</div>
			);
		}

		return (
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
				{familyMembers.map((member) => (
					<div key={member.id} className="rounded-lg border bg-card p-4">
						<div className="flex items-start justify-between mb-3">
							<div>
								<h4 className="font-semibold">{member.fullName}</h4>
								{member.fullNameAm && <p className="text-sm text-muted-foreground">{member.fullNameAm}</p>}
							</div>
							<Badge variant="outline">{t(`family.relationships.${member.relationship}`)}</Badge>
						</div>
						<div className="grid grid-cols-2 gap-2 text-sm">
							{member.gender && <DataField label={t("gender")} value={t(`genders.${member.gender}`)} />}
							{member.dateOfBirth && <DataField label={t("dateOfBirth")} value={formatDate(member.dateOfBirth)} />}
							{member.phone && <DataField label={t("phone")} value={member.phone} />}
							{member.occupation && <DataField label={t("family.occupation")} value={member.occupation} />}
							{member.nationalId && <DataField label={t("family.nationalId")} value={member.nationalId} />}
							{member.schoolName && <DataField label={t("family.schoolName")} value={member.schoolName} />}
						</div>
						<div className="mt-2 pt-2 border-t">
							<Badge variant={member.isAlive ? "default" : "secondary"}>
								{member.isAlive ? t("family.alive") : t("family.deceased")}
							</Badge>
						</div>
					</div>
				))}
			</div>
		);
	},
	(prev, next) => prev.familyMembers === next.familyMembers && prev.isLoading === next.isLoading,
);
FamilyTab.displayName = "FamilyTab";

interface HealthTabProps {
	medicalRecords: MedicalRecord[];
	isLoading: boolean;
	t: (key: string) => string;
}

const HealthTab = React.memo(
	({ medicalRecords, isLoading, t }: HealthTabProps) => {
		if (isLoading) {
			return (
				<div className="space-y-4">
					<Skeleton className="h-32" />
					<Skeleton className="h-32" />
				</div>
			);
		}

		if (medicalRecords.length === 0) {
			return (
				<div className="flex flex-col items-center justify-center py-16 text-center">
					<Stethoscope className="h-12 w-12 text-muted-foreground mb-4" />
					<p className="text-muted-foreground">{t("medical.noRecords")}</p>
				</div>
			);
		}

		return (
			<div className="space-y-4">
				{medicalRecords.map((record) => (
					<div key={record.id} className="rounded-lg border bg-card p-4">
						<div className="flex items-start justify-between mb-3">
							<div>
								<h4 className="font-semibold">{record.institutionName}</h4>
								<p className="text-sm text-muted-foreground">{formatDate(record.visitDate)}</p>
							</div>
							<div className="flex gap-2">
								{record.isForSelf ? (
									<Badge variant="default">{t("medical.self")}</Badge>
								) : (
									<Badge variant="secondary">{record.familyMember?.fullName ?? t("medical.familyMember")}</Badge>
								)}
								{record.amountCovered !== null && record.amountCovered > 0 && (
									<Badge variant="outline">{record.amountCovered.toLocaleString()} ETB</Badge>
								)}
							</div>
						</div>
						<div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
							{record.visitType && (
								<DataField label={t("medical.visitType")} value={t(`medical.visitTypes.${record.visitType}`)} />
							)}
							{record.diagnosis && <DataField label={t("medical.diagnosis")} value={record.diagnosis} />}
							{record.treatment && <DataField label={t("medical.treatment")} value={record.treatment} />}
							{record.doctorName && <DataField label={t("medical.doctorName")} value={record.doctorName} />}
							{record.insuranceProvider && (
								<DataField label={t("medical.insuranceProvider")} value={record.insuranceProvider} />
							)}
							{record.totalBillAmount !== null && (
								<DataField
									label={t("medical.totalBillAmount")}
									value={`${record.totalBillAmount.toLocaleString()} ETB`}
								/>
							)}
						</div>
						{record.notes && <p className="mt-3 text-sm text-muted-foreground border-t pt-3">{record.notes}</p>}
					</div>
				))}
			</div>
		);
	},
	(prev, next) => prev.medicalRecords === next.medicalRecords && prev.isLoading === next.isLoading,
);
HealthTab.displayName = "HealthTab";

interface MaritalStatusSectionProps {
	statuses: MaritalStatusRecord[];
	isLoading: boolean;
	t: (key: string) => string;
}

const MaritalStatusSection = React.memo(
	({ statuses, isLoading, t }: MaritalStatusSectionProps) => {
		if (isLoading) {
			return <Skeleton className="h-24" />;
		}

		if (statuses.length === 0) {
			return null;
		}

		return (
			<Section title={t("maritalStatus.history")} icon={<Heart className="h-4 w-4" />}>
				<div className="space-y-3">
					{statuses.map((status, index) => (
						<div key={status.id} className="flex items-center justify-between p-2 rounded border bg-muted/30">
							<div className="flex items-center gap-2">
								<Badge variant={index === 0 ? "default" : "secondary"}>{t(`maritalStatuses.${status.status}`)}</Badge>
								{index === 0 && <Badge variant="outline">{t("maritalStatus.current")}</Badge>}
							</div>
							<span className="text-sm text-muted-foreground">{formatDate(status.effectiveDate)}</span>
						</div>
					))}
				</div>
			</Section>
		);
	},
	(prev, next) => prev.statuses === next.statuses && prev.isLoading === next.isLoading,
);
MaritalStatusSection.displayName = "MaritalStatusSection";

interface CommitteesTabProps {
	committees: EmployeeCommitteeMembership[];
	termHistory: CommitteeMemberTerm[];
	isLoading: boolean;
	isTermHistoryLoading: boolean;
	t: (key: string) => string;
	tCommittees: (key: string) => string;
	isAmharic: boolean;
}

const ROLE_COLORS = {
	CHAIRMAN: "default",
	VICE_CHAIRMAN: "default",
	SECRETARY: "secondary",
	MEMBER: "outline",
	ADVISOR: "outline",
} as const;

const CommitteesTab = React.memo(
	({ committees, termHistory, isLoading, isTermHistoryLoading, t, tCommittees, isAmharic }: CommitteesTabProps) => {
		const [showTermHistory, setShowTermHistory] = React.useState(false);

		if (isLoading) {
			return (
				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
					<Skeleton className="h-48" />
					<Skeleton className="h-48" />
					<Skeleton className="h-48" />
				</div>
			);
		}

		if (committees.length === 0 && termHistory.length === 0) {
			return (
				<div className="flex flex-col items-center justify-center py-16 text-center">
					<UsersRound className="h-12 w-12 text-muted-foreground mb-4" />
					<p className="text-muted-foreground">{t("committees.noMemberships")}</p>
				</div>
			);
		}

		return (
			<div className="space-y-6">
				<div className="flex items-center justify-between">
					<h3 className="font-semibold">{t("committees.currentMemberships")}</h3>
					{termHistory.length > 0 && (
						<Button variant="outline" size="sm" onClick={() => setShowTermHistory(!showTermHistory)}>
							{showTermHistory ? t("committees.hideTermHistory") : t("committees.showTermHistory")}
						</Button>
					)}
				</div>

				{committees.length > 0 ? (
					<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
						{committees.map((membership) => {
							const committeeName =
								isAmharic && membership.committee?.nameAm ? membership.committee.nameAm : membership.committee?.name;
							const typeName =
								isAmharic && membership.committee?.committeeType?.nameAm
									? membership.committee.committeeType.nameAm
									: membership.committee?.committeeType?.name;
							const centerName = membership.committee?.center
								? isAmharic && membership.committee.center.nameAm
									? membership.committee.center.nameAm
									: membership.committee.center.name
								: tCommittees("committee.hqLevel");

							return (
								<div key={membership.id} className="rounded-lg border bg-card p-4">
									<div className="flex items-start justify-between mb-3">
										<div>
											<h4 className="font-semibold">{committeeName ?? "-"}</h4>
											<p className="text-sm text-muted-foreground">{typeName}</p>
										</div>
										<Badge variant={ROLE_COLORS[membership.role as keyof typeof ROLE_COLORS] ?? "outline"}>
											{tCommittees(`role.${membership.role.toLowerCase()}`)}
										</Badge>
									</div>
									<div className="grid grid-cols-2 gap-2 text-sm">
										<DataField label={tCommittees("committee.center")} value={centerName} />
										<DataField
											label={tCommittees("member.appointedDate")}
											value={formatDate(membership.appointedDate)}
										/>
										{membership.endDate && (
											<DataField label={tCommittees("member.endDate")} value={formatDate(membership.endDate)} />
										)}
									</div>
									<div className="mt-2 pt-2 border-t flex gap-2">
										<Badge variant={membership.isActive ? "default" : "secondary"}>
											{membership.isActive ? t("committees.active") : t("committees.inactive")}
										</Badge>
										{membership.committee?.status && (
											<Badge variant="outline">
												{tCommittees(`status.${membership.committee.status.toLowerCase()}`)}
											</Badge>
										)}
									</div>
								</div>
							);
						})}
					</div>
				) : (
					<p className="text-sm text-muted-foreground">{t("committees.noActiveMemberships")}</p>
				)}

				{showTermHistory && (
					<div className="space-y-4">
						<h3 className="font-semibold border-t pt-4">{t("committees.termHistory")}</h3>
						{isTermHistoryLoading ? (
							<div className="space-y-2">
								<Skeleton className="h-16" />
								<Skeleton className="h-16" />
							</div>
						) : termHistory.length > 0 ? (
							<div className="space-y-3">
								{termHistory.map((term) => {
									const committeeName =
										isAmharic && term.committee?.nameAm ? term.committee.nameAm : term.committee?.name;
									const typeName =
										isAmharic && term.committee?.committeeType?.nameAm
											? term.committee.committeeType.nameAm
											: term.committee?.committeeType?.name;
									const centerName = term.center
										? isAmharic && term.center.nameAm
											? term.center.nameAm
											: term.center.name
										: tCommittees("committee.hqLevel");
									const statusLabel = TERM_STATUS_LABELS[term.status];
									const statusColor = TERM_STATUS_COLORS[term.status];

									return (
										<div key={term.id} className="rounded-lg border bg-card p-3">
											<div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2">
												<div className="flex-1">
													<div className="flex items-center gap-2 mb-1">
														<span className="font-medium">{committeeName ?? "-"}</span>
														<Badge variant="outline" className="text-xs">
															{t("committees.term")} {term.termNumber}
														</Badge>
														<Badge className={statusColor}>{statusLabel}</Badge>
													</div>
													<p className="text-sm text-muted-foreground">
														{typeName} - {centerName}
													</p>
												</div>
												<div className="flex flex-wrap gap-4 text-sm">
													<div>
														<span className="text-muted-foreground">{t("committees.termStart")}:</span>{" "}
														<span className="font-medium">{formatDate(term.startDate)}</span>
													</div>
													<div>
														<span className="text-muted-foreground">{t("committees.termEnd")}:</span>{" "}
														<span className="font-medium">{formatDate(term.endDate)}</span>
													</div>
													<div>
														<span className="text-muted-foreground">{t("committees.termLimit")}:</span>{" "}
														<span className="font-medium">
															{term.termLimitMonths} {t("committees.months")}
														</span>
													</div>
												</div>
											</div>
											{term.terminatedReason && (
												<p className="text-sm text-destructive mt-2">
													{t("committees.terminatedReason")}: {term.terminatedReason}
												</p>
											)}
										</div>
									);
								})}
							</div>
						) : (
							<p className="text-sm text-muted-foreground">{t("committees.noTermHistory")}</p>
						)}
					</div>
				)}
			</div>
		);
	},
	(prev, next) =>
		prev.committees === next.committees &&
		prev.termHistory === next.termHistory &&
		prev.isLoading === next.isLoading &&
		prev.isTermHistoryLoading === next.isTermHistoryLoading &&
		prev.isAmharic === next.isAmharic,
);
CommitteesTab.displayName = "CommitteesTab";

interface ComplaintsTabProps {
	complaints: EmployeeComplaintHistoryItem[];
	isLoading: boolean;
	t: (key: string, options?: Record<string, unknown>) => string;
	onViewDetails: (id: string) => void;
}

const CLOSED_STATUSES = ["CLOSED_NO_LIABILITY", "CLOSED_FINAL"] as const;
const GUILTY_FINDINGS = ["GUILTY", "GUILTY_NO_REBUTTAL"] as const;

const ComplaintsTab = React.memo(
	({ complaints, isLoading, t, onViewDetails }: ComplaintsTabProps) => {
		const stats = React.useMemo(() => {
			const total = complaints.length;
			const open = complaints.filter(
				(c) => !CLOSED_STATUSES.includes(c.status as (typeof CLOSED_STATUSES)[number]),
			).length;
			const closed = total - open;
			const guilty = complaints.filter((c) =>
				GUILTY_FINDINGS.includes(c.finding as (typeof GUILTY_FINDINGS)[number]),
			).length;
			return { total, open, closed, guilty };
		}, [complaints]);

		if (isLoading) {
			return (
				<div className="space-y-4">
					<div className="grid gap-4 md:grid-cols-4">
						<Skeleton className="h-20" />
						<Skeleton className="h-20" />
						<Skeleton className="h-20" />
						<Skeleton className="h-20" />
					</div>
					<Skeleton className="h-48" />
					<Skeleton className="h-48" />
				</div>
			);
		}

		if (complaints.length === 0) {
			return (
				<div className="flex flex-col items-center justify-center py-16 text-center">
					<AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
					<p className="text-muted-foreground">{t("complaints.noComplaints")}</p>
				</div>
			);
		}

		return (
			<div className="space-y-6">
				<div className="grid gap-4 md:grid-cols-4">
					<div className="rounded-lg border bg-card p-4">
						<div className="flex items-center gap-2 text-muted-foreground text-sm">
							<FileText className="h-4 w-4" />
							{t("complaints.totalComplaints")}
						</div>
						<p className="text-2xl font-bold mt-1">{stats.total}</p>
					</div>
					<div className="rounded-lg border bg-card p-4">
						<div className="flex items-center gap-2 text-muted-foreground text-sm">
							<Clock className="h-4 w-4" />
							{t("complaints.openComplaints")}
						</div>
						<p className="text-2xl font-bold mt-1 text-orange-600">{stats.open}</p>
					</div>
					<div className="rounded-lg border bg-card p-4">
						<div className="flex items-center gap-2 text-muted-foreground text-sm">
							<FileText className="h-4 w-4" />
							{t("complaints.closedComplaints")}
						</div>
						<p className="text-2xl font-bold mt-1 text-green-600">{stats.closed}</p>
					</div>
					<div className="rounded-lg border bg-card p-4">
						<div className="flex items-center gap-2 text-muted-foreground text-sm">
							<Gavel className="h-4 w-4" />
							{t("complaints.guiltyFindings")}
						</div>
						<p className="text-2xl font-bold mt-1 text-red-600">{stats.guilty}</p>
					</div>
				</div>

				<div className="space-y-4">
					{complaints.map((complaint) => {
						const articleLabel = COMPLAINT_ARTICLE_LABELS[complaint.article];
						const statusLabel = COMPLAINT_STATUS_LABELS[complaint.status];
						const statusColor = COMPLAINT_STATUS_COLORS[complaint.status];
						const findingLabel = complaint.finding
							? COMPLAINT_FINDING_LABELS[complaint.finding as keyof typeof COMPLAINT_FINDING_LABELS]
							: undefined;

						return (
							<div key={complaint.id} className="rounded-lg border bg-card p-4">
								<div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3">
									<div className="flex-1">
										<div className="flex items-center gap-2 mb-2">
											<span className="font-mono font-semibold">{complaint.complaintNumber}</span>
											<Badge variant={complaint.article === "ARTICLE_30" ? "outline" : "default"}>{articleLabel}</Badge>
											<Badge className={statusColor}>{statusLabel}</Badge>
										</div>
										<p className="text-sm text-muted-foreground mb-2">
											{t("complaints.offense")}: <span className="font-medium">{complaint.offenseCode}</span>
										</p>
										<div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
											<DataField label={t("complaints.incidentDate")} value={formatDate(complaint.incidentDate)} />
											<DataField label={t("complaints.registeredDate")} value={formatDate(complaint.registeredDate)} />
											{findingLabel && <DataField label={t("complaints.finding")} value={findingLabel} />}
											{complaint.punishmentDescription && (
												<DataField label={t("complaints.punishment")} value={complaint.punishmentDescription} />
											)}
										</div>
									</div>
									<Button variant="outline" size="sm" onClick={() => onViewDetails(complaint.id)}>
										<ExternalLink className="h-4 w-4 mr-1.5" />
										{t("complaints.viewDetails")}
									</Button>
								</div>
							</div>
						);
					})}
				</div>
			</div>
		);
	},
	(prev, next) => prev.complaints === next.complaints && prev.isLoading === next.isLoading,
);
ComplaintsTab.displayName = "ComplaintsTab";

export const EmployeeDetailPage = React.memo(
	() => {
		const { t } = useTranslation("employees");
		const { t: tCommon } = useTranslation("common");
		const { t: tCommittees } = useTranslation("committees");
		const { i18n } = useTranslation();
		const navigate = useNavigate();
		const { id } = useParams<{ id: string }>();

		const [deleteOpen, setDeleteOpen] = React.useState(false);

		const { data: employee, isLoading, error } = useEmployee(id ?? "");
		const { data: activePhoto } = useActivePhoto(id ?? "");
		const { data: familyMembers, isLoading: familyLoading } = useFamilyMembers(id ?? "");
		const { data: medicalRecords, isLoading: medicalLoading } = useMedicalRecords(id ?? "");
		const { data: maritalStatuses, isLoading: maritalLoading } = useMaritalStatusHistory(id ?? "");
		const { data: directSuperior } = useDirectSuperior(id ?? "");
		const { data: subordinates } = useSubordinates(id ?? "");
		const { data: employeeCommittees, isLoading: committeesLoading } = useEmployeeCommittees(id ?? "");
		const { data: employeeTermHistory, isLoading: termHistoryLoading } = useEmployeeTermHistory(id ?? "");
		const { data: employeeComplaints, isLoading: complaintsLoading } = useEmployeeComplaintHistory(id ?? "");
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

		const handleViewComplaintDetails = React.useCallback(
			(complaintId: string) => {
				navigate(`/complaints/${complaintId}`);
			},
			[navigate],
		);

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
					photoId={activePhoto?.id}
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
							value="family"
							className="text-xs gap-1.5 data-[state=active]:bg-background data-[state=active]:shadow-sm"
						>
							<Users className="h-3.5 w-3.5" />
							{t("tabs.family")}
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
						<TabsTrigger
							value="committees"
							className="text-xs gap-1.5 data-[state=active]:bg-background data-[state=active]:shadow-sm"
						>
							<UsersRound className="h-3.5 w-3.5" />
							{t("tabs.committees")}
						</TabsTrigger>
						<TabsTrigger
							value="correspondence"
							className="text-xs gap-1.5 data-[state=active]:bg-background data-[state=active]:shadow-sm"
						>
							<Mail className="h-3.5 w-3.5" />
							{t("tabs.correspondence")}
						</TabsTrigger>
					</TabsList>

					<TabsContent value="basic" className="mt-5">
						<BasicInfoTab
							employee={employee}
							t={t}
							isAmharic={isAmharic}
							directSuperior={directSuperior}
							subordinates={subordinates ?? []}
						/>
						<div className="mt-4">
							<MaritalStatusSection statuses={maritalStatuses ?? []} isLoading={maritalLoading} t={t} />
						</div>
					</TabsContent>

					<TabsContent value="family" className="mt-5">
						<FamilyTab familyMembers={familyMembers ?? []} isLoading={familyLoading} t={t} />
					</TabsContent>

					<TabsContent value="education" className="mt-5">
						<PlaceholderTab
							title={t("tabs.education")}
							icon={<BookOpen className="h-8 w-8 text-muted-foreground" />}
							t={t}
						/>
					</TabsContent>

					<TabsContent value="attendance" className="mt-5">
						<EmployeeAttendanceTab employeeId={id ?? ""} />
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
						<HealthTab medicalRecords={medicalRecords ?? []} isLoading={medicalLoading} t={t} />
					</TabsContent>

					<TabsContent value="retirement" className="mt-5">
						<PlaceholderTab
							title={t("tabs.retirement")}
							icon={<Briefcase className="h-8 w-8 text-muted-foreground" />}
							t={t}
						/>
					</TabsContent>

					<TabsContent value="complaint" className="mt-5">
						<ComplaintsTab
							complaints={employeeComplaints ?? []}
							isLoading={complaintsLoading}
							t={t}
							onViewDetails={handleViewComplaintDetails}
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
						<EmployeeSalaryTab employee={employee} isAmharic={isAmharic} />
					</TabsContent>

					<TabsContent value="inventory" className="mt-5">
						<EmployeeInventoryTab employee={employee} isAmharic={isAmharic} />
					</TabsContent>

					<TabsContent value="committees" className="mt-5">
						<CommitteesTab
							committees={employeeCommittees ?? []}
							termHistory={employeeTermHistory ?? []}
							isLoading={committeesLoading}
							isTermHistoryLoading={termHistoryLoading}
							t={t}
							tCommittees={tCommittees}
							isAmharic={isAmharic}
						/>
					</TabsContent>

					<TabsContent value="correspondence" className="mt-5">
						<EmployeeCorrespondenceTab employeeId={id ?? ""} />
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
