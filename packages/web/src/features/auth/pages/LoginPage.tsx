import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import { z } from "zod";
import { Alert, AlertDescription } from "#web/components/ui/alert.tsx";
import { Button } from "#web/components/ui/button.tsx";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "#web/components/ui/card.tsx";
import { Input } from "#web/components/ui/input.tsx";
import { Label } from "#web/components/ui/label.tsx";
import { useAuth } from "#web/context/AuthContext.tsx";
import { ACCOUNT_DEACTIVATED_KEY, PERMISSIONS_CHANGED_KEY } from "#web/lib/api-client.ts";

const loginSchema = z.object({
	username: z.string().min(1, "Username is required"),
	password: z.string().min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const LoginPage = React.memo(
	() => {
		const { t } = useTranslation("auth");
		const { t: tCommon } = useTranslation("common");
		const { login, isAuthenticated } = useAuth();
		const navigate = useNavigate();
		const location = useLocation();
		const [error, setError] = React.useState<string | undefined>();
		const [isSubmitting, setIsSubmitting] = React.useState(false);

		const from = (location.state as { from?: { pathname: string } })?.from?.pathname || "/dashboard";

		React.useEffect(() => {
			const deactivatedMessage = globalThis.localStorage.getItem(ACCOUNT_DEACTIVATED_KEY);
			if (deactivatedMessage) {
				setError(deactivatedMessage);
				globalThis.localStorage.removeItem(ACCOUNT_DEACTIVATED_KEY);
			}
			const permissionsChangedMessage = globalThis.localStorage.getItem(PERMISSIONS_CHANGED_KEY);
			if (permissionsChangedMessage) {
				setError(permissionsChangedMessage);
				globalThis.localStorage.removeItem(PERMISSIONS_CHANGED_KEY);
			}
		}, []);

		React.useEffect(() => {
			if (isAuthenticated) {
				navigate(from, { replace: true });
			}
		}, [isAuthenticated, navigate, from]);

		const {
			register,
			handleSubmit,
			formState: { errors },
		} = useForm<LoginFormData>({
			resolver: zodResolver(loginSchema),
		});

		const onSubmit = React.useCallback(
			async (data: LoginFormData) => {
				setError(undefined);
				setIsSubmitting(true);
				login(data)
					.then(() => {
						navigate(from, { replace: true });
					})
					.catch((err: unknown) => {
						const axiosError = err as { response?: { data?: { message?: string }; status?: number } };
						const apiMessage = axiosError.response?.data?.message;
						const statusCode = axiosError.response?.status;

						if (statusCode === 403 && apiMessage) {
							setError(apiMessage);
						} else {
							setError(t("invalidCredentials"));
						}
					})
					.finally(() => {
						setIsSubmitting(false);
					});
			},
			[login, navigate, from, t],
		);

		return (
			<Card>
				<CardHeader className="space-y-1">
					<CardTitle className="text-2xl font-bold text-center">{t("loginTitle")}</CardTitle>
					<CardDescription className="text-center">{t("loginSubtitle")}</CardDescription>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
						{error && (
							<Alert variant="destructive">
								<AlertDescription>{error}</AlertDescription>
							</Alert>
						)}

						<div className="space-y-2">
							<Label htmlFor="username">{t("username")}</Label>
							<Input
								id="username"
								type="text"
								placeholder={t("username")}
								{...register("username")}
								aria-invalid={!!errors.username}
							/>
							{errors.username && <p className="text-sm text-destructive">{errors.username.message}</p>}
						</div>

						<div className="space-y-2">
							<Label htmlFor="password">{t("password")}</Label>
							<Input
								id="password"
								type="password"
								placeholder={t("password")}
								{...register("password")}
								aria-invalid={!!errors.password}
							/>
							{errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
						</div>

						<Button type="submit" className="w-full" disabled={isSubmitting}>
							{isSubmitting ? tCommon("loading") : t("login")}
						</Button>
					</form>
				</CardContent>
			</Card>
		);
	},
	() => true,
);

LoginPage.displayName = "LoginPage";
