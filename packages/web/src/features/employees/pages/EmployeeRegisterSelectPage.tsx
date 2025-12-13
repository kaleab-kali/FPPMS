import { ArrowLeft, ArrowRight, Briefcase, Clock, Shield } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Button } from "#web/components/ui/button.tsx";
import { cn } from "#web/lib/utils.ts";

interface EmployeeTypeCardProps {
	type: "military" | "civilian" | "temporary";
	title: string;
	description: string;
	icon: React.ReactNode;
	onClick: () => void;
	color: string;
	bgColor: string;
	clickToRegisterText: string;
}

const EmployeeTypeCard = React.memo(
	({ title, description, icon, onClick, color, bgColor, clickToRegisterText }: EmployeeTypeCardProps) => {
		return (
			<button
				type="button"
				onClick={onClick}
				className={cn(
					"group relative flex flex-col items-center justify-center p-8 rounded-xl border-2 border-dashed",
					"transition-all duration-300 hover:border-solid hover:shadow-lg",
					"focus:outline-none focus:ring-2 focus:ring-offset-2",
					bgColor,
					color,
				)}
			>
				<div
					className={cn(
						"w-20 h-20 rounded-full flex items-center justify-center mb-4",
						"transition-transform duration-300 group-hover:scale-110",
						"bg-background shadow-md",
					)}
				>
					{icon}
				</div>
				<h3 className="text-xl font-bold mb-2">{title}</h3>
				<p className="text-sm text-center opacity-80">{description}</p>
				<div
					className={cn(
						"absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1",
						"opacity-0 group-hover:opacity-100 transition-opacity duration-300",
					)}
				>
					<span className="text-sm font-medium">{clickToRegisterText}</span>
					<ArrowRight className="h-4 w-4" />
				</div>
			</button>
		);
	},
	(prev, next) => prev.title === next.title && prev.type === next.type,
);

EmployeeTypeCard.displayName = "EmployeeTypeCard";

export const EmployeeRegisterSelectPage = React.memo(
	() => {
		const { t } = useTranslation("employees");
		const navigate = useNavigate();

		const handleBack = React.useCallback(() => {
			navigate("/employees");
		}, [navigate]);

		const handleSelectMilitary = React.useCallback(() => {
			navigate("/employees/register/military");
		}, [navigate]);

		const handleSelectCivilian = React.useCallback(() => {
			navigate("/employees/register/civilian");
		}, [navigate]);

		const handleSelectTemporary = React.useCallback(() => {
			navigate("/employees/register/temporary");
		}, [navigate]);

		return (
			<div className="space-y-6">
				<div className="flex items-center gap-4">
					<Button variant="ghost" size="icon" onClick={handleBack}>
						<ArrowLeft className="h-5 w-5" />
					</Button>
					<div>
						<h1 className="text-2xl font-bold">{t("create")}</h1>
						<p className="text-muted-foreground">{t("selectTypeDescription")}</p>
					</div>
				</div>

				<div className="grid gap-6 md:grid-cols-3 max-w-5xl mx-auto mt-8">
					<EmployeeTypeCard
						type="military"
						title={t("types.MILITARY")}
						description={t("typeDescriptions.military")}
						icon={<Shield className="h-10 w-10 text-blue-600" />}
						onClick={handleSelectMilitary}
						color="border-blue-300 hover:border-blue-500 focus:ring-blue-500"
						bgColor="bg-blue-50 hover:bg-blue-100"
						clickToRegisterText={t("clickToRegister")}
					/>

					<EmployeeTypeCard
						type="civilian"
						title={t("types.CIVILIAN")}
						description={t("typeDescriptions.civilian")}
						icon={<Briefcase className="h-10 w-10 text-green-600" />}
						onClick={handleSelectCivilian}
						color="border-green-300 hover:border-green-500 focus:ring-green-500"
						bgColor="bg-green-50 hover:bg-green-100"
						clickToRegisterText={t("clickToRegister")}
					/>

					<EmployeeTypeCard
						type="temporary"
						title={t("types.TEMPORARY")}
						description={t("typeDescriptions.temporary")}
						icon={<Clock className="h-10 w-10 text-orange-600" />}
						onClick={handleSelectTemporary}
						color="border-orange-300 hover:border-orange-500 focus:ring-orange-500"
						bgColor="bg-orange-50 hover:bg-orange-100"
						clickToRegisterText={t("clickToRegister")}
					/>
				</div>
			</div>
		);
	},
	() => true,
);

EmployeeRegisterSelectPage.displayName = "EmployeeRegisterSelectPage";
