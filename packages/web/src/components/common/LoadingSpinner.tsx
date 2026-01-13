import { Loader2 } from "lucide-react";
import React from "react";

import { cn } from "#web/lib/utils";

interface LoadingSpinnerProps {
	className?: string;
	size?: "sm" | "md" | "lg";
}

export const LoadingSpinner = React.memo(
	({ className, size = "md" }: LoadingSpinnerProps) => {
		const sizeClasses = {
			sm: "h-4 w-4",
			md: "h-8 w-8",
			lg: "h-12 w-12",
		} as const;

		return (
			<div className={cn("flex items-center justify-center", className)}>
				<Loader2 className={cn("animate-spin text-muted-foreground", sizeClasses[size])} />
			</div>
		);
	},
	(prevProps, nextProps) => prevProps.className === nextProps.className && prevProps.size === nextProps.size,
);

LoadingSpinner.displayName = "LoadingSpinner";
