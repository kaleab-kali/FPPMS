import {
	AlertTriangle,
	Award,
	Building2,
	Calendar,
	ChevronRight,
	ClipboardList,
	Clock,
	DollarSign,
	FileText,
	Gavel,
	Home,
	type LucideIcon,
	Package,
	ScrollText,
	Settings,
	Shield,
	Star,
	UserCheck,
	Users,
	UsersRound,
} from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";
import { NavLink, useLocation } from "react-router-dom";
import { useMyCommittees } from "#web/api/committees/committees.queries";
import logoImage from "#web/assets/fpp.jpg";
import { NavUser } from "#web/components/layout/NavUser";
import { Avatar, AvatarFallback, AvatarImage } from "#web/components/ui/avatar";
import { Badge } from "#web/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "#web/components/ui/collapsible";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuAction,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarMenuSub,
	SidebarMenuSubButton,
	SidebarMenuSubItem,
} from "#web/components/ui/sidebar";
import { PERMISSIONS } from "#web/constants/permissions";
import { useAuth } from "#web/context/AuthContext";
import { useUserPermissions } from "#web/hooks/usePermissions";

interface NavSubItemConfig {
	titleKey: string;
	url: string;
	permission?: string;
	permissions?: string[];
	requiresAllCentersAccess?: boolean;
}

interface NavItemConfig {
	titleKey: string;
	url: string;
	icon: LucideIcon;
	permission?: string;
	permissions?: string[];
	items?: NavSubItemConfig[];
}

const NAV_ITEMS_CONFIG: NavItemConfig[] = [
	{
		titleKey: "dashboard",
		url: "#",
		icon: Home,
		items: [
			{ titleKey: "overview", url: "/dashboard" },
			{
				titleKey: "hqOversight",
				url: "/dashboard/hq",
				permission: PERMISSIONS.DASHBOARD_HQ,
				requiresAllCentersAccess: true,
			},
		],
	},
	{
		titleKey: "organization",
		url: "#",
		icon: Building2,
		permissions: [
			PERMISSIONS.DEPARTMENT_READ,
			PERMISSIONS.POSITION_READ,
			PERMISSIONS.CENTER_READ,
			PERMISSIONS.TENANT_READ,
			PERMISSIONS.ROLE_READ,
			PERMISSIONS.USER_READ,
			PERMISSIONS.RANK_READ,
			PERMISSIONS.LOOKUP_READ,
		],
		items: [
			{ titleKey: "departments", url: "/organization/departments", permission: PERMISSIONS.DEPARTMENT_READ },
			{ titleKey: "positions", url: "/organization/positions", permission: PERMISSIONS.POSITION_READ },
			{ titleKey: "centers", url: "/organization/centers", permission: PERMISSIONS.CENTER_READ },
			{ titleKey: "tenants", url: "/organization/tenants", permission: PERMISSIONS.TENANT_READ },
			{ titleKey: "roles", url: "/roles", permission: PERMISSIONS.ROLE_READ },
			{ titleKey: "users", url: "/users", permission: PERMISSIONS.USER_READ },
			{ titleKey: "ranks", url: "/lookups/ranks", permission: PERMISSIONS.RANK_READ },
			{ titleKey: "regions", url: "/lookups/regions", permission: PERMISSIONS.LOOKUP_READ },
			{ titleKey: "subCities", url: "/lookups/sub-cities", permission: PERMISSIONS.LOOKUP_READ },
			{ titleKey: "woredas", url: "/lookups/woredas", permission: PERMISSIONS.LOOKUP_READ },
		],
	},
	{
		titleKey: "employees",
		url: "#",
		icon: Users,
		permission: PERMISSIONS.EMPLOYEE_READ,
		items: [
			{ titleKey: "allEmployees", url: "/employees", permission: PERMISSIONS.EMPLOYEE_READ },
			{ titleKey: "formerEmployees", url: "/employees/former", permission: PERMISSIONS.EMPLOYEE_READ },
			{ titleKey: "registration", url: "/employees/register", permission: PERMISSIONS.EMPLOYEE_CREATE },
			{ titleKey: "photoCapture", url: "/employees/photo", permission: PERMISSIONS.EMPLOYEE_UPDATE },
			{ titleKey: "medicalHistory", url: "/employees/medical", permission: PERMISSIONS.EMPLOYEE_READ },
			{ titleKey: "family", url: "/employees/family", permission: PERMISSIONS.EMPLOYEE_READ },
			{ titleKey: "maritalStatus", url: "/employees/marital", permission: PERMISSIONS.EMPLOYEE_READ },
			{ titleKey: "healthRecords", url: "/employees/health", permission: PERMISSIONS.EMPLOYEE_READ },
			{ titleKey: "transfer", url: "/employees/transfer", permission: PERMISSIONS.EMPLOYEE_UPDATE },
			{ titleKey: "directSuperior", url: "/employees/superior", permission: PERMISSIONS.EMPLOYEE_UPDATE },
		],
	},
	{
		titleKey: "committees",
		url: "#",
		icon: UsersRound,
		permission: PERMISSIONS.COMMITTEE_READ,
		items: [
			{ titleKey: "allCommittees", url: "/committees", permission: PERMISSIONS.COMMITTEE_READ },
			{ titleKey: "committeeTypes", url: "/committees/types", permission: PERMISSIONS.COMMITTEE_TYPE_READ },
		],
	},
	{
		titleKey: "complaints",
		url: "#",
		icon: AlertTriangle,
		permission: PERMISSIONS.COMPLAINT_READ,
		items: [
			{ titleKey: "allComplaints", url: "/complaints", permission: PERMISSIONS.COMPLAINT_READ },
			{ titleKey: "registerComplaint", url: "/complaints/register", permission: PERMISSIONS.COMPLAINT_CREATE },
		],
	},
	{
		titleKey: "leave",
		url: "#",
		icon: Calendar,
		permissions: [PERMISSIONS.LEAVE_READ, PERMISSIONS.LEAVE_TYPE_READ],
		items: [
			{ titleKey: "leaveTypes", url: "/leave/types", permission: PERMISSIONS.LEAVE_TYPE_READ },
			{ titleKey: "leaveRequests", url: "/leave/requests", permission: PERMISSIONS.LEAVE_READ },
			{ titleKey: "leaveBalance", url: "/leave/balance", permission: PERMISSIONS.LEAVE_READ },
			{ titleKey: "leaveCalendar", url: "/leave/calendar", permission: PERMISSIONS.LEAVE_READ },
			{ titleKey: "leavePermit", url: "/leave/permit", permission: PERMISSIONS.LEAVE_READ },
		],
	},
	{
		titleKey: "holidays",
		url: "#",
		icon: Star,
		permission: PERMISSIONS.HOLIDAY_READ,
		items: [
			{ titleKey: "holidayList", url: "/holidays", permission: PERMISSIONS.HOLIDAY_READ },
			{ titleKey: "holidayCalendar", url: "/holidays/calendar", permission: PERMISSIONS.HOLIDAY_READ },
		],
	},
	{
		titleKey: "appraisal",
		url: "#",
		icon: ClipboardList,
		items: [
			{ titleKey: "performanceReviews", url: "/appraisal/reviews" },
			{ titleKey: "reviewPeriods", url: "/appraisal/periods" },
			{ titleKey: "criteria", url: "/appraisal/criteria" },
			{ titleKey: "disciplinary", url: "/appraisal/disciplinary" },
			{ titleKey: "promotions", url: "/appraisal/promotions" },
		],
	},
	{
		titleKey: "salary",
		url: "#",
		icon: DollarSign,
		permissions: [
			PERMISSIONS.SALARY_SCALE_READ,
			PERMISSIONS.SALARY_ELIGIBILITY_READ,
			PERMISSIONS.SALARY_INCREMENT_APPROVE,
			PERMISSIONS.SALARY_MANUAL_JUMP,
			PERMISSIONS.SALARY_MASS_RAISE,
		],
		items: [
			{ titleKey: "salaryScale", url: "/salary/scale", permission: PERMISSIONS.SALARY_SCALE_READ },
			{ titleKey: "salaryEligibility", url: "/salary/eligibility", permission: PERMISSIONS.SALARY_ELIGIBILITY_READ },
			{ titleKey: "manualStepJump", url: "/salary/manual-jump", permission: PERMISSIONS.SALARY_MANUAL_JUMP },
			{ titleKey: "massRaise", url: "/salary/mass-raise", permission: PERMISSIONS.SALARY_MASS_RAISE },
			{ titleKey: "payroll", url: "/salary/payroll" },
		],
	},
	{
		titleKey: "attendance",
		url: "#",
		icon: Clock,
		items: [
			{ titleKey: "dailyAttendance", url: "/attendance/daily" },
			{ titleKey: "attendanceRecords", url: "/attendance/records" },
			{ titleKey: "shiftDefinitions", url: "/attendance/shifts" },
			{ titleKey: "shiftSchedule", url: "/attendance/schedule" },
			{ titleKey: "attendanceReports", url: "/attendance/reports" },
		],
	},
	{
		titleKey: "inventory",
		url: "#",
		icon: Package,
		permissions: [PERMISSIONS.INVENTORY_READ, PERMISSIONS.CENTER_STOCK_READ],
		items: [
			{ titleKey: "assignments", url: "/inventory/assignments", permission: PERMISSIONS.INVENTORY_READ },
			{ titleKey: "centerStock", url: "/inventory/stock", permission: PERMISSIONS.CENTER_STOCK_READ },
			{ titleKey: "overdueItems", url: "/inventory/overdue", permission: PERMISSIONS.INVENTORY_READ },
		],
	},
	{
		titleKey: "correspondence",
		url: "#",
		icon: FileText,
		items: [
			{ titleKey: "allCorrespondence", url: "/correspondence" },
			{ titleKey: "incomingDocuments", url: "/correspondence/incoming" },
			{ titleKey: "outgoingDocuments", url: "/correspondence/outgoing" },
		],
	},
	{
		titleKey: "weapons",
		url: "#",
		icon: Shield,
		permissions: [PERMISSIONS.WEAPON_READ, PERMISSIONS.AMMUNITION_STOCK_READ],
		items: [
			{ titleKey: "weaponRegistry", url: "/weapons", permission: PERMISSIONS.WEAPON_READ },
			{ titleKey: "weaponCategories", url: "/weapons/categories", permission: PERMISSIONS.WEAPON_CATEGORY_READ },
			{ titleKey: "weaponAssignments", url: "/weapons/assignments", permission: PERMISSIONS.WEAPON_ASSIGNMENT_READ },
			{ titleKey: "ammunitionStock", url: "/weapons/ammunition", permission: PERMISSIONS.AMMUNITION_STOCK_READ },
		],
	},
	{
		titleKey: "rewards",
		url: "#",
		icon: Award,
		permissions: [PERMISSIONS.REWARD_READ, PERMISSIONS.REWARD_ELIGIBILITY_READ, PERMISSIONS.REWARD_MILESTONE_READ],
		items: [
			{ titleKey: "serviceRewards", url: "/rewards", permission: PERMISSIONS.REWARD_READ },
			{ titleKey: "eligibleEmployees", url: "/rewards/eligibility", permission: PERMISSIONS.REWARD_ELIGIBILITY_READ },
			{ titleKey: "rewardMilestones", url: "/rewards/milestones", permission: PERMISSIONS.REWARD_MILESTONE_READ },
		],
	},
	{
		titleKey: "reports",
		url: "#",
		icon: UserCheck,
		items: [
			{ titleKey: "employeeReports", url: "/reports/employees" },
			{ titleKey: "leaveReports", url: "/reports/leave" },
			{ titleKey: "attendanceReports", url: "/reports/attendance" },
			{ titleKey: "salaryReports", url: "/reports/salary" },
		],
	},
	{
		titleKey: "settings",
		url: "#",
		icon: Settings,
		items: [
			{ titleKey: "general", url: "/settings/general" },
			{ titleKey: "notifications", url: "/settings/notifications" },
		],
	},
	{
		titleKey: "auditLogs",
		url: "#",
		icon: ScrollText,
		permission: PERMISSIONS.AUDIT_LOG_READ,
		items: [
			{ titleKey: "allAuditLogs", url: "/audit-logs", permission: PERMISSIONS.AUDIT_LOG_READ },
			{ titleKey: "loginHistory", url: "/audit-logs/login-history", permission: PERMISSIONS.AUDIT_HISTORY_READ },
		],
	},
];

interface NavMainItemProps {
	item: NavItemConfig;
	isActive: boolean;
	t: (key: string) => string;
	hasPermission: (permission: string) => boolean;
	hasAnyPermission: (permissions: string[]) => boolean;
	hasAllCentersAccess: boolean;
}

const NavMainItem = React.memo(
	({ item, isActive, t, hasPermission, hasAnyPermission, hasAllCentersAccess }: NavMainItemProps) => {
		const hasSubItems = item.items && item.items.length > 0;
		const title = t(item.titleKey);

		const filteredSubItems = React.useMemo(() => {
			if (!item.items) return [];
			return item.items.filter((subItem) => {
				if (subItem.requiresAllCentersAccess && !hasAllCentersAccess) return false;
				if (!subItem.permission && !subItem.permissions) return true;
				if (subItem.permission) return hasPermission(subItem.permission);
				if (subItem.permissions) return hasAnyPermission(subItem.permissions);
				return true;
			});
		}, [item.items, hasPermission, hasAnyPermission, hasAllCentersAccess]);

		if (hasSubItems && filteredSubItems.length === 0) {
			return null;
		}

		if (!hasSubItems) {
			return (
				<SidebarMenuItem>
					<SidebarMenuButton asChild tooltip={title} isActive={isActive}>
						<NavLink to={item.url}>
							<item.icon />
							<span>{title}</span>
						</NavLink>
					</SidebarMenuButton>
				</SidebarMenuItem>
			);
		}

		return (
			<Collapsible asChild defaultOpen={isActive}>
				<SidebarMenuItem>
					<SidebarMenuButton asChild tooltip={title}>
						<span className="cursor-pointer">
							<item.icon />
							<span>{title}</span>
						</span>
					</SidebarMenuButton>
					<CollapsibleTrigger asChild>
						<SidebarMenuAction className="data-[state=open]:rotate-90">
							<ChevronRight />
							<span className="sr-only">Toggle</span>
						</SidebarMenuAction>
					</CollapsibleTrigger>
					<CollapsibleContent>
						<SidebarMenuSub>
							{filteredSubItems.map((subItem) => (
								<SidebarMenuSubItem key={subItem.titleKey}>
									<SidebarMenuSubButton asChild>
										<NavLink
											to={subItem.url}
											className={({ isActive: subActive }) => (subActive ? "bg-sidebar-accent" : "")}
										>
											<span>{t(subItem.titleKey)}</span>
										</NavLink>
									</SidebarMenuSubButton>
								</SidebarMenuSubItem>
							))}
						</SidebarMenuSub>
					</CollapsibleContent>
				</SidebarMenuItem>
			</Collapsible>
		);
	},
	(prev, next) =>
		prev.item.titleKey === next.item.titleKey &&
		prev.isActive === next.isActive &&
		prev.t === next.t &&
		prev.hasPermission === next.hasPermission &&
		prev.hasAnyPermission === next.hasAnyPermission &&
		prev.hasAllCentersAccess === next.hasAllCentersAccess,
);

NavMainItem.displayName = "NavMainItem";

export const AppSidebar = React.memo(
	({ ...props }: React.ComponentProps<typeof Sidebar>) => {
		const { t } = useTranslation("navigation");
		const { i18n } = useTranslation();
		const { user, hasAllCentersAccess } = useAuth();
		const location = useLocation();
		const isAmharic = i18n.language === "am";
		const { hasPermission, hasAnyPermission } = useUserPermissions();

		const { data: myCommittees } = useMyCommittees();

		const isItemActive = React.useCallback(
			(item: NavItemConfig): boolean => {
				if (location.pathname === item.url) return true;
				if (item.items) {
					return item.items.some((sub) => location.pathname.startsWith(sub.url));
				}
				return false;
			},
			[location.pathname],
		);

		const filteredNavItems = React.useMemo(() => {
			return NAV_ITEMS_CONFIG.filter((item) => {
				if (!item.permission && !item.permissions) return true;
				if (item.permission) return hasPermission(item.permission);
				if (item.permissions) return hasAnyPermission(item.permissions);
				return true;
			});
		}, [hasPermission, hasAnyPermission]);

		const userData = React.useMemo(
			() => ({
				name: user?.username ?? "User",
				email: `${user?.username ?? "user"}@fpp.gov.et`,
				avatar: "",
			}),
			[user?.username],
		);

		const isMyCommitteesActive = React.useMemo(() => {
			return location.pathname.startsWith("/my-committee");
		}, [location.pathname]);

		return (
			<Sidebar variant="inset" {...props}>
				<SidebarHeader>
					<SidebarMenu>
						<SidebarMenuItem>
							<SidebarMenuButton size="lg" asChild>
								<NavLink to="/dashboard">
									<Avatar className="h-8 w-8">
										<AvatarImage src={logoImage} alt="FPP Logo" />
										<AvatarFallback>FP</AvatarFallback>
									</Avatar>
									<div className="grid flex-1 text-left text-sm leading-tight">
										{/* Previous institution name - commented out for now */}
										{/* <span className="truncate font-medium">FPP PPMS</span> */}
										{/* <span className="truncate text-xs text-muted-foreground">Personnel Management</span> */}
										<span className="truncate font-medium">{t("institutionName")}</span>
										<span className="truncate text-xs text-muted-foreground">{t("systemSubtitle")}</span>
									</div>
								</NavLink>
							</SidebarMenuButton>
						</SidebarMenuItem>
					</SidebarMenu>
				</SidebarHeader>
				<SidebarContent>
					{myCommittees && myCommittees.length > 0 && (
						<SidebarGroup>
							<SidebarGroupLabel>{t("myCommittees")}</SidebarGroupLabel>
							<SidebarMenu>
								<Collapsible asChild defaultOpen={isMyCommitteesActive}>
									<SidebarMenuItem>
										<SidebarMenuButton asChild tooltip={t("assignedCases")}>
											<span className="cursor-pointer">
												<Gavel />
												<span>{t("assignedCases")}</span>
											</span>
										</SidebarMenuButton>
										<CollapsibleTrigger asChild>
											<SidebarMenuAction className="data-[state=open]:rotate-90">
												<ChevronRight />
												<span className="sr-only">Toggle</span>
											</SidebarMenuAction>
										</CollapsibleTrigger>
										<CollapsibleContent>
											<SidebarMenuSub>
												{myCommittees.map((membership) => {
													const committeeName =
														isAmharic && membership.committee?.nameAm
															? membership.committee.nameAm
															: (membership.committee?.name ?? "Committee");
													return (
														<SidebarMenuSubItem key={membership.id}>
															<SidebarMenuSubButton asChild>
																<NavLink
																	to={`/my-committee/${membership.committeeId}/cases`}
																	className={({ isActive: subActive }) => (subActive ? "bg-sidebar-accent" : "")}
																>
																	<span className="flex items-center gap-2">
																		<span className="truncate max-w-[150px]">{committeeName}</span>
																		<Badge variant="outline" className="text-xs">
																			{t(`role.${membership.role.toLowerCase()}`)}
																		</Badge>
																	</span>
																</NavLink>
															</SidebarMenuSubButton>
														</SidebarMenuSubItem>
													);
												})}
											</SidebarMenuSub>
										</CollapsibleContent>
									</SidebarMenuItem>
								</Collapsible>
							</SidebarMenu>
						</SidebarGroup>
					)}
					<SidebarGroup>
						<SidebarGroupLabel>{t("navigation")}</SidebarGroupLabel>
						<SidebarMenu>
							{filteredNavItems.map((item) => (
								<NavMainItem
									key={item.titleKey}
									item={item}
									isActive={isItemActive(item)}
									t={t}
									hasPermission={hasPermission}
									hasAnyPermission={hasAnyPermission}
									hasAllCentersAccess={hasAllCentersAccess}
								/>
							))}
						</SidebarMenu>
					</SidebarGroup>
				</SidebarContent>
				<SidebarFooter>
					<NavUser user={userData} />
				</SidebarFooter>
			</Sidebar>
		);
	},
	() => true,
);

AppSidebar.displayName = "AppSidebar";
