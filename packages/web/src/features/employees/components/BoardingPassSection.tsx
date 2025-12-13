import React from "react";
import { cn } from "#web/lib/utils.ts";

interface BoardingPassSectionProps {
	title: string;
	icon?: React.ReactNode;
	children: React.ReactNode;
	className?: string;
	isFirst?: boolean;
	isLast?: boolean;
}

export const BoardingPassSection = React.memo(
	({ title, icon, children, className, isFirst = false, isLast = false }: BoardingPassSectionProps) => {
		return (
			<div className={cn("relative", className)}>
				{!isFirst && (
					<div className="relative h-8 flex items-center">
						<div className="absolute left-0 w-4 h-8 bg-background rounded-r-full" />
						<div className="absolute right-0 w-4 h-8 bg-background rounded-l-full" />
						<div className="flex-1 mx-4 border-t-2 border-dashed border-border" />
					</div>
				)}

				<div
					className={cn(
						"bg-card border-l-2 border-r-2 border-border relative",
						isFirst && "border-t-2 rounded-t-2xl",
						isLast && "border-b-2 rounded-b-2xl",
						!isFirst && "rounded-tl-2xl rounded-tr-2xl",
						!isLast && "rounded-bl-2xl rounded-br-2xl",
					)}
				>
					<div className="px-6 py-6">
						{title && (
							<div className="flex items-center gap-3 mb-6">
								{icon && (
									<div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
										{icon}
									</div>
								)}
								<h3 className="text-lg font-semibold">{title}</h3>
							</div>
						)}

						<div className="space-y-4">{children}</div>
					</div>
				</div>
			</div>
		);
	},
	(prev, next) =>
		prev.title === next.title &&
		prev.isFirst === next.isFirst &&
		prev.isLast === next.isLast &&
		prev.children === next.children,
);

BoardingPassSection.displayName = "BoardingPassSection";
