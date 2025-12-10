import React from "react";
import { Outlet } from "react-router-dom";
import { Header } from "#web/components/layout/Header.tsx";
import { Sidebar } from "#web/components/layout/Sidebar.tsx";

export const AppLayout = React.memo(
	() => {
		return (
			<div className="flex h-screen overflow-hidden">
				<Sidebar />
				<div className="flex flex-1 flex-col overflow-hidden">
					<Header />
					<main className="flex-1 overflow-auto bg-muted/30 p-6">
						<Outlet />
					</main>
				</div>
			</div>
		);
	},
	() => true,
);

AppLayout.displayName = "AppLayout";
