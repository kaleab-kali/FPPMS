import React from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { InactivityWarningDialog } from "#web/components/common/InactivityWarningDialog.tsx";
import { AppSidebar } from "#web/components/layout/AppSidebar.tsx";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "#web/components/ui/breadcrumb.tsx";
import { Separator } from "#web/components/ui/separator.tsx";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "#web/components/ui/sidebar.tsx";

const ROUTE_LABELS: Record<string, string> = {
	dashboard: "Dashboard",
	organization: "Organization",
	departments: "Departments",
	positions: "Positions",
	centers: "Centers",
	tenants: "Tenants",
	employees: "Employees",
	former: "Former Employees",
	register: "Registration",
	photo: "Photo Capture",
	medical: "Medical History",
	family: "Family",
	marital: "Marital Status",
	health: "Health Records",
	transfer: "Transfer",
	users: "Users",
	roles: "Roles",
	lookups: "Lookups",
	regions: "Regions",
	"sub-cities": "Sub-Cities",
	woredas: "Woredas",
	ranks: "Ranks",
	leave: "Leave",
	types: "Types",
	requests: "Requests",
	balance: "Balance",
	calendar: "Calendar",
	permit: "Permit",
	holidays: "Holidays",
	appraisal: "Appraisal",
	reviews: "Reviews",
	periods: "Periods",
	criteria: "Criteria",
	disciplinary: "Disciplinary",
	promotions: "Promotions",
	salary: "Salary",
	scale: "Scale",
	increment: "Increment",
	payroll: "Payroll",
	attendance: "Attendance",
	clock: "Clock In/Out",
	records: "Records",
	shifts: "Shifts",
	overtime: "Overtime",
	inventory: "Inventory",
	weapons: "Weapons",
	equipment: "Equipment",
	uniforms: "Uniforms",
	assignments: "Assignments",
	documents: "Documents",
	reports: "Reports",
	settings: "Settings",
	general: "General",
	notifications: "Notifications",
	edit: "Edit",
} as const;

export const AppLayout = React.memo(
	() => {
		const location = useLocation();

		const breadcrumbs = React.useMemo(() => {
			const segments = location.pathname.split("/").filter(Boolean);
			const crumbs: { label: string; path: string; isLast: boolean }[] = [];

			let currentPath = "";
			for (let i = 0; i < segments.length; i++) {
				const segment = segments[i];
				currentPath += `/${segment}`;
				const label = ROUTE_LABELS[segment] ?? segment.charAt(0).toUpperCase() + segment.slice(1);
				crumbs.push({
					label,
					path: currentPath,
					isLast: i === segments.length - 1,
				});
			}

			return crumbs;
		}, [location.pathname]);

		return (
			<SidebarProvider>
				<AppSidebar />
				<SidebarInset>
					<header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
						<SidebarTrigger className="-ml-1" />
						<Separator orientation="vertical" className="mr-2 h-4" />
						<Breadcrumb>
							<BreadcrumbList>
								{breadcrumbs.map((crumb, index) => (
									<React.Fragment key={crumb.path}>
										{index > 0 && <BreadcrumbSeparator />}
										<BreadcrumbItem>
											{crumb.isLast ? (
												<BreadcrumbPage>{crumb.label}</BreadcrumbPage>
											) : (
												<BreadcrumbLink asChild>
													<Link to={crumb.path}>{crumb.label}</Link>
												</BreadcrumbLink>
											)}
										</BreadcrumbItem>
									</React.Fragment>
								))}
							</BreadcrumbList>
						</Breadcrumb>
					</header>
					<main className="flex-1 overflow-auto p-4">
						<Outlet />
					</main>
				</SidebarInset>
				<InactivityWarningDialog timeoutMinutes={15} />
			</SidebarProvider>
		);
	},
	() => true,
);

AppLayout.displayName = "AppLayout";
