import { ChevronsUpDown, Languages, LogOut, Settings, User } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "#web/components/ui/avatar.tsx";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "#web/components/ui/dropdown-menu.tsx";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "#web/components/ui/sidebar.tsx";
import { STORAGE_KEYS } from "#web/config/constants.ts";
import { useAuth } from "#web/context/AuthContext.tsx";

interface NavUserProps {
	user: {
		name: string;
		email: string;
		avatar: string;
	};
}

export const NavUser = React.memo(
	({ user }: NavUserProps) => {
		const { isMobile } = useSidebar();
		const { logout } = useAuth();
		const navigate = useNavigate();
		const { t, i18n } = useTranslation("common");

		const currentLanguage = i18n.language;

		const handleLogout = React.useCallback(async () => {
			await logout();
			navigate("/login");
		}, [logout, navigate]);

		const handleLanguageToggle = React.useCallback(() => {
			const newLang = currentLanguage === "en" ? "am" : "en";
			i18n.changeLanguage(newLang);
			localStorage.setItem(STORAGE_KEYS.locale, newLang);
		}, [currentLanguage, i18n]);

		const getInitials = React.useCallback((name: string) => {
			return name
				.split(" ")
				.map((n) => n[0])
				.join("")
				.toUpperCase()
				.slice(0, 2);
		}, []);

		return (
			<SidebarMenu>
				<SidebarMenuItem>
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<SidebarMenuButton
								size="lg"
								className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
							>
								<Avatar className="h-8 w-8 rounded-lg">
									<AvatarImage src={user.avatar} alt={user.name} />
									<AvatarFallback className="rounded-lg">{getInitials(user.name)}</AvatarFallback>
								</Avatar>
								<div className="grid flex-1 text-left text-sm leading-tight">
									<span className="truncate font-medium">{user.name}</span>
									<span className="truncate text-xs">{user.email}</span>
								</div>
								<ChevronsUpDown className="ml-auto size-4" />
							</SidebarMenuButton>
						</DropdownMenuTrigger>
						<DropdownMenuContent
							className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
							side={isMobile ? "bottom" : "right"}
							align="end"
							sideOffset={4}
						>
							<DropdownMenuLabel className="p-0 font-normal">
								<div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
									<Avatar className="h-8 w-8 rounded-lg">
										<AvatarImage src={user.avatar} alt={user.name} />
										<AvatarFallback className="rounded-lg">{getInitials(user.name)}</AvatarFallback>
									</Avatar>
									<div className="grid flex-1 text-left text-sm leading-tight">
										<span className="truncate font-medium">{user.name}</span>
										<span className="truncate text-xs">{user.email}</span>
									</div>
								</div>
							</DropdownMenuLabel>
							<DropdownMenuSeparator />
							<DropdownMenuGroup>
								<DropdownMenuItem>
									<User className="mr-2 h-4 w-4" />
									{t("profile", "Profile")}
								</DropdownMenuItem>
								<DropdownMenuItem>
									<Settings className="mr-2 h-4 w-4" />
									{t("settings", "Settings")}
								</DropdownMenuItem>
								<DropdownMenuItem onClick={handleLanguageToggle}>
									<Languages className="mr-2 h-4 w-4" />
									{currentLanguage === "en" ? "Amharic" : "English"}
								</DropdownMenuItem>
							</DropdownMenuGroup>
							<DropdownMenuSeparator />
							<DropdownMenuItem onClick={handleLogout}>
								<LogOut className="mr-2 h-4 w-4" />
								{t("logout", "Logout")}
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</SidebarMenuItem>
			</SidebarMenu>
		);
	},
	(prev, next) => prev.user.name === next.user.name && prev.user.email === next.user.email,
);

NavUser.displayName = "NavUser";
