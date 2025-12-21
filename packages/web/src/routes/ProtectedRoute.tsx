import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "#web/context/AuthContext.tsx";

interface ProtectedRouteProps {
	children: React.ReactNode;
	allowPasswordChange?: boolean;
}

export const ProtectedRoute = React.memo(
	({ children, allowPasswordChange = false }: ProtectedRouteProps) => {
		const { isAuthenticated, isLoading, requirePasswordChange } = useAuth();
		const location = useLocation();

		if (isLoading) {
			return (
				<div className="flex h-screen items-center justify-center">
					<div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
				</div>
			);
		}

		if (!isAuthenticated) {
			return <Navigate to="/login" state={{ from: location }} replace />;
		}

		if (requirePasswordChange && !allowPasswordChange && location.pathname !== "/change-password") {
			return <Navigate to="/change-password" replace />;
		}

		return <>{children}</>;
	},
	(prevProps, nextProps) =>
		prevProps.children === nextProps.children && prevProps.allowPasswordChange === nextProps.allowPasswordChange,
);

ProtectedRoute.displayName = "ProtectedRoute";
