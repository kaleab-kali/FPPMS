import { Loader2 } from "lucide-react";
import React, { Suspense } from "react";

interface LazyRouteProps {
	children: React.ReactNode;
}

const LoadingFallback = React.memo(() => (
	<div className="flex min-h-[400px] items-center justify-center">
		<div className="flex flex-col items-center gap-4">
			<Loader2 className="h-8 w-8 animate-spin text-primary" aria-hidden="true" />
			<p className="text-sm text-muted-foreground">Loading...</p>
		</div>
	</div>
));

LoadingFallback.displayName = "LoadingFallback";

export const LazyRoute = React.memo(
	({ children }: LazyRouteProps) => <Suspense fallback={<LoadingFallback />}>{children}</Suspense>,
	(prev, next) => prev.children === next.children,
);

LazyRoute.displayName = "LazyRoute";

export { LoadingFallback };
