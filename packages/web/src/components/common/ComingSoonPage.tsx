import { Construction } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "#web/components/ui/card.tsx";

export const ComingSoonPage = React.memo(
	() => {
		const { t } = useTranslation("common");
		const location = useLocation();

		const pageName = React.useMemo(() => {
			const path = location.pathname;
			const segments = path.split("/").filter(Boolean);
			const lastSegment = segments[segments.length - 1] ?? "page";
			return lastSegment
				.split("-")
				.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
				.join(" ");
		}, [location.pathname]);

		return (
			<div className="flex h-full items-center justify-center p-4">
				<Card className="w-full max-w-md text-center">
					<CardHeader>
						<div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
							<Construction className="h-8 w-8 text-primary" />
						</div>
						<CardTitle className="text-2xl">{pageName}</CardTitle>
						<CardDescription>{t("comingSoon", "This feature is coming soon")}</CardDescription>
					</CardHeader>
					<CardContent>
						<p className="text-muted-foreground">
							{t("comingSoonDescription", "We are working hard to bring you this feature. Please check back later.")}
						</p>
					</CardContent>
				</Card>
			</div>
		);
	},
	() => true,
);

ComingSoonPage.displayName = "ComingSoonPage";
