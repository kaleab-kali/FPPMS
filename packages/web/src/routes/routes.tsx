import { createBrowserRouter, Navigate } from "react-router-dom";
import { AppLayout } from "#web/components/layout/AppLayout.tsx";
import { AuthLayout } from "#web/components/layout/AuthLayout.tsx";
import { LoginPage } from "#web/features/auth/pages/LoginPage.tsx";
import { DashboardPage } from "#web/features/dashboard/pages/DashboardPage.tsx";
import { RanksListPage } from "#web/features/lookups/pages/RanksListPage.tsx";
import { RegionsListPage } from "#web/features/lookups/pages/RegionsListPage.tsx";
import { SubCitiesListPage } from "#web/features/lookups/pages/SubCitiesListPage.tsx";
import { WoredasListPage } from "#web/features/lookups/pages/WoredasListPage.tsx";
import { CentersListPage } from "#web/features/organization/pages/CentersListPage.tsx";
import { DepartmentsListPage } from "#web/features/organization/pages/DepartmentsListPage.tsx";
import { PositionsListPage } from "#web/features/organization/pages/PositionsListPage.tsx";
import { TenantsListPage } from "#web/features/organization/pages/TenantsListPage.tsx";
import { RolesListPage } from "#web/features/roles/pages/RolesListPage.tsx";
import { UsersListPage } from "#web/features/users/pages/UsersListPage.tsx";
import { ProtectedRoute } from "#web/routes/ProtectedRoute.tsx";

export const router = createBrowserRouter([
	{
		path: "/",
		element: <Navigate to="/dashboard" replace />,
	},
	{
		element: <AuthLayout />,
		children: [
			{
				path: "/login",
				element: <LoginPage />,
			},
		],
	},
	{
		element: (
			<ProtectedRoute>
				<AppLayout />
			</ProtectedRoute>
		),
		children: [
			{
				path: "/dashboard",
				element: <DashboardPage />,
			},
			{
				path: "/organization/tenants",
				element: <TenantsListPage />,
			},
			{
				path: "/organization/centers",
				element: <CentersListPage />,
			},
			{
				path: "/organization/departments",
				element: <DepartmentsListPage />,
			},
			{
				path: "/organization/positions",
				element: <PositionsListPage />,
			},
			{
				path: "/users",
				element: <UsersListPage />,
			},
			{
				path: "/roles",
				element: <RolesListPage />,
			},
			{
				path: "/lookups/regions",
				element: <RegionsListPage />,
			},
			{
				path: "/lookups/sub-cities",
				element: <SubCitiesListPage />,
			},
			{
				path: "/lookups/woredas",
				element: <WoredasListPage />,
			},
			{
				path: "/lookups/ranks",
				element: <RanksListPage />,
			},
		],
	},
]);
