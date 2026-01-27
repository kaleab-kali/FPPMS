import { Eye, EyeOff } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "#web/components/ui/button.tsx";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "#web/components/ui/card.tsx";
import { Input } from "#web/components/ui/input.tsx";
import { Label } from "#web/components/ui/label.tsx";
import { useAuth } from "#web/context/AuthContext.tsx";
import { api } from "#web/lib/api-client.ts";
import type { ChangePasswordRequest } from "#web/types/auth.ts";

export const ChangePasswordPage = React.memo(
	() => {
		const { t } = useTranslation("auth");
		const { t: tCommon } = useTranslation("common");
		const navigate = useNavigate();
		const { user, updateUser, logout } = useAuth();

		const [currentPassword, setCurrentPassword] = React.useState("");
		const [newPassword, setNewPassword] = React.useState("");
		const [confirmPassword, setConfirmPassword] = React.useState("");
		const [isLoading, setIsLoading] = React.useState(false);
		const [error, setError] = React.useState("");
		const [showPasswords, setShowPasswords] = React.useState({
			current: false,
			new: false,
			confirm: false,
		});

		const togglePasswordVisibility = React.useCallback((field: "current" | "new" | "confirm") => {
			setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
		}, []);

		const handleSubmit = React.useCallback(
			async (e: React.FormEvent) => {
				e.preventDefault();
				setError("");

				if (newPassword !== confirmPassword) {
					setError(t("passwordsDoNotMatch"));
					return;
				}

				if (newPassword.length < 8) {
					setError(t("passwordTooShort"));
					return;
				}

				setIsLoading(true);

				const payload: ChangePasswordRequest = {
					currentPassword,
					newPassword,
					confirmPassword,
				};

				const result = await api.post<{ message: string }>("/auth/change-password", payload).catch((err) => {
					const errorMessage = err.response?.data?.message;
					if (Array.isArray(errorMessage)) {
						setError(errorMessage.join(". "));
					} else {
						setError(errorMessage || err.message || tCommon("error"));
					}
					return null;
				});

				setIsLoading(false);

				if (result) {
					toast.success(t("passwordChangedSuccess"));
					if (user) {
						updateUser({ ...user, requirePasswordChange: false });
					}
					navigate("/dashboard");
				}
			},
			[currentPassword, newPassword, confirmPassword, t, tCommon, user, updateUser, navigate],
		);

		const handleLogout = React.useCallback(async () => {
			await logout();
			navigate("/login");
		}, [logout, navigate]);

		return (
			<div className="flex min-h-screen items-center justify-center bg-muted/50 p-4">
				<Card className="w-full max-w-md">
					<CardHeader className="text-center">
						<CardTitle>{t("changePassword")}</CardTitle>
						<CardDescription>{t("changePasswordRequired")}</CardDescription>
					</CardHeader>
					<CardContent>
						<form onSubmit={handleSubmit} className="space-y-4">
							{error && <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}

							<div className="rounded-md bg-muted p-3 text-sm text-muted-foreground">
								{t(
									"passwordRequirements",
									"Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)",
								)}
							</div>

							<div className="space-y-2">
								<Label htmlFor="currentPassword">{t("currentPassword")}</Label>
								<div className="relative">
									<Input
										id="currentPassword"
										type={showPasswords.current ? "text" : "password"}
										value={currentPassword}
										onChange={(e) => setCurrentPassword(e.target.value)}
										required
										disabled={isLoading}
										className="pr-10"
									/>
									<Button
										type="button"
										variant="ghost"
										size="icon"
										className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
										onClick={() => togglePasswordVisibility("current")}
										aria-label={showPasswords.current ? "Hide current password" : "Show current password"}
									>
										{showPasswords.current ? (
											<EyeOff className="h-4 w-4" aria-hidden="true" />
										) : (
											<Eye className="h-4 w-4" aria-hidden="true" />
										)}
									</Button>
								</div>
							</div>

							<div className="space-y-2">
								<Label htmlFor="newPassword">{t("newPassword")}</Label>
								<div className="relative">
									<Input
										id="newPassword"
										type={showPasswords.new ? "text" : "password"}
										value={newPassword}
										onChange={(e) => setNewPassword(e.target.value)}
										required
										disabled={isLoading}
										className="pr-10"
									/>
									<Button
										type="button"
										variant="ghost"
										size="icon"
										className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
										onClick={() => togglePasswordVisibility("new")}
										aria-label={showPasswords.new ? "Hide new password" : "Show new password"}
									>
										{showPasswords.new ? (
											<EyeOff className="h-4 w-4" aria-hidden="true" />
										) : (
											<Eye className="h-4 w-4" aria-hidden="true" />
										)}
									</Button>
								</div>
							</div>

							<div className="space-y-2">
								<Label htmlFor="confirmPassword">{t("confirmPassword")}</Label>
								<div className="relative">
									<Input
										id="confirmPassword"
										type={showPasswords.confirm ? "text" : "password"}
										value={confirmPassword}
										onChange={(e) => setConfirmPassword(e.target.value)}
										required
										disabled={isLoading}
										className="pr-10"
									/>
									<Button
										type="button"
										variant="ghost"
										size="icon"
										className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
										onClick={() => togglePasswordVisibility("confirm")}
										aria-label={showPasswords.confirm ? "Hide confirm password" : "Show confirm password"}
									>
										{showPasswords.confirm ? (
											<EyeOff className="h-4 w-4" aria-hidden="true" />
										) : (
											<Eye className="h-4 w-4" aria-hidden="true" />
										)}
									</Button>
								</div>
							</div>

							<div className="flex flex-col gap-2">
								<Button type="submit" className="w-full" disabled={isLoading}>
									{isLoading ? tCommon("loading") : t("changePassword")}
								</Button>
								<Button type="button" variant="outline" className="w-full" onClick={handleLogout}>
									{t("logout")}
								</Button>
							</div>
						</form>
					</CardContent>
				</Card>
			</div>
		);
	},
	() => true,
);

ChangePasswordPage.displayName = "ChangePasswordPage";
