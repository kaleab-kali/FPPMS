import React from "react";
import { Outlet } from "react-router-dom";

export const AuthLayout = React.memo(
	() => {
		return (
			<div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
				<div className="w-full max-w-md">
					<Outlet />
				</div>
			</div>
		);
	},
	() => true,
);

AuthLayout.displayName = "AuthLayout";
