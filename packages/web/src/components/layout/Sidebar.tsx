import {
	Building2,
	ChevronDown,
	ChevronRight,
	LayoutDashboard,
	MapPin,
	Shield,
	UserCheck,
	UserMinus,
	Users,
} from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";
import { NavLink } from "react-router-dom";
import { Button } from "#web/components/ui/button.tsx";
import { ScrollArea } from "#web/components/ui/scroll-area.tsx";
import { cn } from "#web/lib/utils.ts";

interface NavItemProps {
	to: string;
	icon: React.ReactNode;
	label: string;
	children?: { to: string; label: string }[];
}

const NavItem = React.memo(
	({ to, icon, label, children }: NavItemProps) => {
		const [isOpen, setIsOpen] = React.useState(false);
		const hasChildren = children && children.length > 0;

		const toggleOpen = React.useCallback(() => {
			setIsOpen((prev) => !prev);
		}, []);

		if (hasChildren) {
			return (
				<div>
					<Button variant="ghost" className="w-full justify-start gap-2" onClick={toggleOpen}>
						{icon}
						<span className="flex-1 text-left">{label}</span>
						{isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
					</Button>
					{isOpen && (
						<div className="ml-6 space-y-1">
							{children.map((child) => (
								<NavLink
									key={child.to}
									to={child.to}
									className={({ isActive }) =>
										cn(
											"block rounded-md px-3 py-2 text-sm transition-colors",
											isActive
												? "bg-primary/10 text-primary font-medium"
												: "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
										)
									}
								>
									{child.label}
								</NavLink>
							))}
						</div>
					)}
				</div>
			);
		}

		return (
			<NavLink
				to={to}
				className={({ isActive }) =>
					cn(
						"flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
						isActive
							? "bg-primary/10 text-primary font-medium"
							: "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
					)
				}
			>
				{icon}
				{label}
			</NavLink>
		);
	},
	(prevProps, nextProps) =>
		prevProps.to === nextProps.to && prevProps.label === nextProps.label && prevProps.children === nextProps.children,
);

NavItem.displayName = "NavItem";

export const Sidebar = React.memo(
	() => {
		const { t } = useTranslation("navigation");

		const navItems = React.useMemo<NavItemProps[]>(
			() => [
				{
					to: "/dashboard",
					icon: <LayoutDashboard className="h-4 w-4" />,
					label: t("dashboard"),
				},
				{
					to: "/employees",
					icon: <UserCheck className="h-4 w-4" />,
					label: t("employees"),
				},
				{
					to: "/employees/former",
					icon: <UserMinus className="h-4 w-4" />,
					label: t("formerEmployees"),
				},
				{
					to: "/organization",
					icon: <Building2 className="h-4 w-4" />,
					label: t("organization"),
					children: [
						{ to: "/organization/tenants", label: t("tenants") },
						{ to: "/organization/centers", label: t("centers") },
						{ to: "/organization/departments", label: t("departments") },
						{ to: "/organization/positions", label: t("positions") },
					],
				},
				{
					to: "/users",
					icon: <Users className="h-4 w-4" />,
					label: t("users"),
				},
				{
					to: "/roles",
					icon: <Shield className="h-4 w-4" />,
					label: t("roles"),
				},
				{
					to: "/lookups",
					icon: <MapPin className="h-4 w-4" />,
					label: t("lookups"),
					children: [
						{ to: "/lookups/regions", label: t("regions") },
						{ to: "/lookups/sub-cities", label: t("subCities") },
						{ to: "/lookups/woredas", label: t("woredas") },
						{ to: "/lookups/ranks", label: t("ranks") },
					],
				},
			],
			[t],
		);

		return (
			<aside className="hidden w-64 border-r bg-background lg:block">
				<div className="flex h-16 items-center border-b px-6">
					<span className="text-lg font-semibold">EPPMS</span>
				</div>
				<ScrollArea className="h-[calc(100vh-4rem)]">
					<nav className="space-y-1 p-4">
						{navItems.map((item) => (
							<NavItem key={item.to} {...item} />
						))}
					</nav>
				</ScrollArea>
			</aside>
		);
	},
	() => true,
);

Sidebar.displayName = "Sidebar";
