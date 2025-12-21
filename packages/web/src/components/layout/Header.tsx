import { Globe, LogOut, User } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback } from "#web/components/ui/avatar.tsx";
import { Button } from "#web/components/ui/button.tsx";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "#web/components/ui/dropdown-menu.tsx";
import { STORAGE_KEYS } from "#web/config/constants.ts";
import { useAuth } from "#web/context/AuthContext.tsx";

export const Header = React.memo(
	() => {
		const { user, logout } = useAuth();
		const navigate = useNavigate();
		const { t, i18n } = useTranslation("auth");
		const { t: tNav } = useTranslation("navigation");

		const userInitials = React.useMemo(() => {
			if (!user) return "U";
			return user.username.substring(0, 2).toUpperCase();
		}, [user]);

		const handleLogout = React.useCallback(() => {
			logout();
			navigate("/login");
		}, [logout, navigate]);

		const handleProfileClick = React.useCallback(() => {
			navigate("/profile");
		}, [navigate]);

		const toggleLanguage = React.useCallback(() => {
			const newLang = i18n.language === "en" ? "am" : "en";
			i18n.changeLanguage(newLang);
			globalThis.localStorage.setItem(STORAGE_KEYS.locale, newLang);
		}, [i18n]);

		return (
			<header className="flex h-16 items-center justify-between border-b bg-background px-6">
				<div className="flex items-center gap-4">
					<h1 className="text-lg font-semibold lg:hidden">EPPMS</h1>
				</div>

				<div className="flex items-center gap-2">
					<Button variant="ghost" size="icon" onClick={toggleLanguage} title="Change Language">
						<Globe className="h-5 w-5" />
						<span className="sr-only">Toggle language</span>
					</Button>

					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="ghost" className="relative h-10 w-10 rounded-full">
								<Avatar className="h-10 w-10">
									<AvatarFallback>{userInitials}</AvatarFallback>
								</Avatar>
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent className="w-56" align="end" forceMount>
							<div className="flex flex-col space-y-1 p-2">
								<p className="text-sm font-medium leading-none">{user?.username}</p>
								<p className="text-xs leading-none text-muted-foreground">{user?.roles.join(", ")}</p>
							</div>
							<DropdownMenuSeparator />
							<DropdownMenuItem onClick={handleProfileClick}>
								<User className="mr-2 h-4 w-4" />
								{tNav("profile")}
							</DropdownMenuItem>
							<DropdownMenuSeparator />
							<DropdownMenuItem onClick={handleLogout}>
								<LogOut className="mr-2 h-4 w-4" />
								{t("logout")}
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</header>
		);
	},
	() => true,
);

Header.displayName = "Header";
