import React, { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "#web/components/ui/button.tsx";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "#web/components/ui/dialog.tsx";
import { useAuth } from "#web/context/AuthContext.tsx";
import { useInactivityLogout } from "#web/hooks/useInactivityLogout.ts";

interface InactivityWarningDialogProps {
	timeoutMinutes?: number;
}

export const InactivityWarningDialog = React.memo(
	({ timeoutMinutes = 15 }: InactivityWarningDialogProps) => {
		const { t } = useTranslation("auth");
		const { isAuthenticated, logout } = useAuth();
		const [showWarning, setShowWarning] = useState(false);
		const [secondsRemaining, setSecondsRemaining] = useState(60);

		const handleWarning = useCallback((seconds: number) => {
			setSecondsRemaining(seconds);
			setShowWarning(true);
		}, []);

		const handleLogout = useCallback(() => {
			setShowWarning(false);
		}, []);

		const { extendSession } = useInactivityLogout({
			timeoutMinutes,
			onWarning: handleWarning,
			onLogout: handleLogout,
			enabled: isAuthenticated,
		});

		const handleStayLoggedIn = useCallback(() => {
			setShowWarning(false);
			extendSession();
		}, [extendSession]);

		const handleLogoutNow = useCallback(async () => {
			setShowWarning(false);
			await logout();
		}, [logout]);

		return (
			<Dialog open={showWarning} onOpenChange={setShowWarning}>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle>{t("sessionExpiring", "Session Expiring")}</DialogTitle>
						<DialogDescription>
							{t(
								"sessionExpiringDescription",
								"Your session will expire in {{seconds}} seconds due to inactivity. Would you like to stay logged in?",
								{ seconds: secondsRemaining },
							)}
						</DialogDescription>
					</DialogHeader>
					<DialogFooter className="flex gap-2 sm:justify-between">
						<Button variant="outline" onClick={handleLogoutNow}>
							{t("logout", "Logout")}
						</Button>
						<Button onClick={handleStayLoggedIn}>{t("stayLoggedIn", "Stay Logged In")}</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		);
	},
	(prevProps, nextProps) => prevProps.timeoutMinutes === nextProps.timeoutMinutes,
);

InactivityWarningDialog.displayName = "InactivityWarningDialog";
