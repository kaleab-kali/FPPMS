import {
	Building2,
	Calendar,
	ChevronRight,
	ClipboardList,
	Clock,
	DollarSign,
	FileText,
	Home,
	type LucideIcon,
	Package,
	Settings,
	Star,
	UserCheck,
	Users,
	UsersRound,
} from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";
import { NavLink, useLocation } from "react-router-dom";
import logoImage from "#web/assets/fpp.jpg";
import { NavUser } from "#web/components/layout/NavUser.tsx";
import { Avatar, AvatarFallback, AvatarImage } from "#web/components/ui/avatar.tsx";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "#web/components/ui/collapsible.tsx";
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
} from "#web/components/ui/sidebar.tsx";
import { useAuth } from "#web/context/AuthContext.tsx";

interface NavItemConfig {
	titleKey: string;
	url: string;
	icon: LucideIcon;
	items?: { titleKey: string; url: string }[];
}

const NAV_ITEMS_CONFIG: NavItemConfig[] = [
	{
		titleKey: "dashboard",
		url: "/dashboard",
		icon: Home,
	},
	{
		titleKey: "organization",
		url: "#",
		icon: Building2,
		items: [
			{ titleKey: "departments", url: "/organization/departments" },
			{ titleKey: "positions", url: "/organization/positions" },
			{ titleKey: "centers", url: "/organization/centers" },
			{ titleKey: "tenants", url: "/organization/tenants" },
			{ titleKey: "roles", url: "/roles" },
			{ titleKey: "users", url: "/users" },
			{ titleKey: "ranks", url: "/lookups/ranks" },
			{ titleKey: "regions", url: "/lookups/regions" },
			{ titleKey: "subCities", url: "/lookups/sub-cities" },
			{ titleKey: "woredas", url: "/lookups/woredas" },
		],
	},
	{
		titleKey: "employees",
		url: "#",
		icon: Users,
		items: [
			{ titleKey: "allEmployees", url: "/employees" },
			{ titleKey: "formerEmployees", url: "/employees/former" },
			{ titleKey: "registration", url: "/employees/register" },
			{ titleKey: "photoCapture", url: "/employees/photo" },
			{ titleKey: "medicalHistory", url: "/employees/medical" },
			{ titleKey: "family", url: "/employees/family" },
			{ titleKey: "maritalStatus", url: "/employees/marital" },
			{ titleKey: "healthRecords", url: "/employees/health" },
			{ titleKey: "transfer", url: "/employees/transfer" },
			{ titleKey: "directSuperior", url: "/employees/superior" },
		],
	},
	{
		titleKey: "committees",
		url: "#",
		icon: UsersRound,
		items: [
			{ titleKey: "allCommittees", url: "/committees" },
			{ titleKey: "committeeTypes", url: "/committees/types" },
		],
	},
	{
		titleKey: "leave",
		url: "#",
		icon: Calendar,
		items: [
			{ titleKey: "leaveTypes", url: "/leave/types" },
			{ titleKey: "leaveRequests", url: "/leave/requests" },
			{ titleKey: "leaveBalance", url: "/leave/balance" },
			{ titleKey: "leaveCalendar", url: "/leave/calendar" },
			{ titleKey: "leavePermit", url: "/leave/permit" },
		],
	},
	{
		titleKey: "holidays",
		url: "#",
		icon: Star,
		items: [
			{ titleKey: "holidayList", url: "/holidays" },
			{ titleKey: "holidayCalendar", url: "/holidays/calendar" },
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
		items: [
			{ titleKey: "salaryScale", url: "/salary/scale" },
			{ titleKey: "salaryIncrement", url: "/salary/increment" },
			{ titleKey: "payroll", url: "/salary/payroll" },
		],
	},
	{
		titleKey: "attendance",
		url: "#",
		icon: Clock,
		items: [
			{ titleKey: "clockInOut", url: "/attendance/clock" },
			{ titleKey: "attendanceRecords", url: "/attendance/records" },
			{ titleKey: "shiftSchedule", url: "/attendance/shifts" },
			{ titleKey: "overtime", url: "/attendance/overtime" },
		],
	},
	{
		titleKey: "inventory",
		url: "#",
		icon: Package,
		items: [
			{ titleKey: "weapons", url: "/inventory/weapons" },
			{ titleKey: "equipment", url: "/inventory/equipment" },
			{ titleKey: "uniforms", url: "/inventory/uniforms" },
			{ titleKey: "assignments", url: "/inventory/assignments" },
		],
	},
	{
		titleKey: "documents",
		url: "#",
		icon: FileText,
		items: [
			{ titleKey: "documentTypes", url: "/documents/types" },
			{ titleKey: "allDocuments", url: "/documents" },
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
];

interface NavMainItemProps {
	item: NavItemConfig;
	isActive: boolean;
	t: (key: string) => string;
}

const NavMainItem = React.memo(
	({ item, isActive, t }: NavMainItemProps) => {
		const hasSubItems = item.items && item.items.length > 0;
		const title = t(item.titleKey);

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
							{item.items?.map((subItem) => (
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
	(prev, next) => prev.item.titleKey === next.item.titleKey && prev.isActive === next.isActive && prev.t === next.t,
);

NavMainItem.displayName = "NavMainItem";

export const AppSidebar = React.memo(
	({ ...props }: React.ComponentProps<typeof Sidebar>) => {
		const { t } = useTranslation("navigation");
		const { user } = useAuth();
		const location = useLocation();

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

		const userData = React.useMemo(
			() => ({
				name: user?.username ?? "User",
				email: `${user?.username ?? "user"}@fpp.gov.et`,
				avatar: "",
			}),
			[user?.username],
		);

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
										<span className="truncate font-medium">FPP PPMS</span>
										<span className="truncate text-xs text-muted-foreground">Personnel Management</span>
									</div>
								</NavLink>
							</SidebarMenuButton>
						</SidebarMenuItem>
					</SidebarMenu>
				</SidebarHeader>
				<SidebarContent>
					<SidebarGroup>
						<SidebarGroupLabel>{t("navigation")}</SidebarGroupLabel>
						<SidebarMenu>
							{NAV_ITEMS_CONFIG.map((item) => (
								<NavMainItem key={item.titleKey} item={item} isActive={isItemActive(item)} t={t} />
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
