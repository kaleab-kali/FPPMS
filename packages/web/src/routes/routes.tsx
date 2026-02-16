import React from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import { ComingSoonPage } from "#web/components/common/ComingSoonPage.tsx";
import { LazyRoute } from "#web/components/common/LazyRoute.tsx";
import { AppLayout } from "#web/components/layout/AppLayout.tsx";
import { AuthLayout } from "#web/components/layout/AuthLayout.tsx";
import { ProtectedRoute } from "#web/routes/ProtectedRoute.tsx";

// Lazy-loaded pages (large components)
const EmployeeDetailPage = React.lazy(() =>
	import("#web/features/employees/pages/EmployeeDetailPage.tsx").then((m) => ({ default: m.EmployeeDetailPage })),
);
const EmployeeTransferPage = React.lazy(() =>
	import("#web/features/employees/pages/EmployeeTransferPage.tsx").then((m) => ({ default: m.EmployeeTransferPage })),
);
const EmployeeMedicalPage = React.lazy(() =>
	import("#web/features/employees/pages/EmployeeMedicalPage.tsx").then((m) => ({ default: m.EmployeeMedicalPage })),
);
const DirectSuperiorPage = React.lazy(() =>
	import("#web/features/employees/pages/DirectSuperiorPage.tsx").then((m) => ({ default: m.DirectSuperiorPage })),
);
const EmployeeFamilyPage = React.lazy(() =>
	import("#web/features/employees/pages/EmployeeFamilyPage.tsx").then((m) => ({ default: m.EmployeeFamilyPage })),
);
const SalaryEligibilityPage = React.lazy(() =>
	import("#web/features/salary/pages/SalaryEligibilityPage.tsx").then((m) => ({ default: m.SalaryEligibilityPage })),
);
const SalaryScaleFormPage = React.lazy(() =>
	import("#web/features/salary/pages/SalaryScaleFormPage.tsx").then((m) => ({ default: m.SalaryScaleFormPage })),
);
const ComplaintDetailPage = React.lazy(() =>
	import("#web/features/complaints/pages/ComplaintDetailPage.tsx").then((m) => ({ default: m.ComplaintDetailPage })),
);
const ComplaintRegisterPage = React.lazy(() =>
	import("#web/features/complaints/pages/ComplaintRegisterPage.tsx").then((m) => ({
		default: m.ComplaintRegisterPage,
	})),
);
const WeaponCategoriesPage = React.lazy(() =>
	import("#web/features/weapons/pages/WeaponCategoriesPage.tsx").then((m) => ({ default: m.WeaponCategoriesPage })),
);
const CommitteesListPage = React.lazy(() =>
	import("#web/features/committees/pages/CommitteesListPage.tsx").then((m) => ({ default: m.CommitteesListPage })),
);

// Statically imported pages (smaller components)
import { AttendanceRecordsPage } from "#web/features/attendance/pages/AttendanceRecordsPage.tsx";
import { AttendanceReportsPage } from "#web/features/attendance/pages/AttendanceReportsPage.tsx";
import { DailyAttendancePage } from "#web/features/attendance/pages/DailyAttendancePage.tsx";
import { ShiftDefinitionsPage } from "#web/features/attendance/pages/ShiftDefinitionsPage.tsx";
import { ShiftSchedulePage } from "#web/features/attendance/pages/ShiftSchedulePage.tsx";
import { AuditLogListPage } from "#web/features/audit-log/pages/AuditLogListPage.tsx";
import { LoginHistoryPage } from "#web/features/audit-log/pages/LoginHistoryPage.tsx";
import { ChangePasswordPage } from "#web/features/auth/pages/ChangePasswordPage.tsx";
import { LoginPage } from "#web/features/auth/pages/LoginPage.tsx";
import { CommitteeDetailPage } from "#web/features/committees/pages/CommitteeDetailPage.tsx";
import { CommitteeTypesListPage } from "#web/features/committees/pages/CommitteeTypesListPage.tsx";
import { MyCommitteeCasesPage } from "#web/features/committees/pages/MyCommitteeCasesPage.tsx";
import { ComplaintsListPage } from "#web/features/complaints/pages/ComplaintsListPage.tsx";
import { CorrespondenceListPage } from "#web/features/correspondence/pages/CorrespondenceListPage.tsx";
import { IncomingDocumentsPage } from "#web/features/correspondence/pages/IncomingDocumentsPage.tsx";
import { OutgoingDocumentsPage } from "#web/features/correspondence/pages/OutgoingDocumentsPage.tsx";
import { DashboardPage } from "#web/features/dashboard/pages/DashboardPage.tsx";
import { HqDashboardPage } from "#web/features/dashboard/pages/HqDashboardPage.tsx";
import { EmployeeEditPage } from "#web/features/employees/pages/EmployeeEditPage.tsx";
import { EmployeeMaritalStatusPage } from "#web/features/employees/pages/EmployeeMaritalStatusPage.tsx";
import { EmployeePhotoPage } from "#web/features/employees/pages/EmployeePhotoPage.tsx";
import { EmployeeRegisterFormPage } from "#web/features/employees/pages/EmployeeRegisterFormPage.tsx";
import { EmployeeRegisterSelectPage } from "#web/features/employees/pages/EmployeeRegisterSelectPage.tsx";
import { EmployeesListPage } from "#web/features/employees/pages/EmployeesListPage.tsx";
import { FormerEmployeesPage } from "#web/features/employees/pages/FormerEmployeesPage.tsx";
import { HolidayListPage } from "#web/features/holidays/pages/HolidayListPage.tsx";
import { CenterStockPage } from "#web/features/inventory/pages/CenterStockPage.tsx";
import { InventoryAssignmentsPage } from "#web/features/inventory/pages/InventoryAssignmentsPage.tsx";
import { OverdueItemsPage } from "#web/features/inventory/pages/OverdueItemsPage.tsx";
import { RanksListPage } from "#web/features/lookups/pages/RanksListPage.tsx";
import { RegionsListPage } from "#web/features/lookups/pages/RegionsListPage.tsx";
import { SubCitiesListPage } from "#web/features/lookups/pages/SubCitiesListPage.tsx";
import { WoredasListPage } from "#web/features/lookups/pages/WoredasListPage.tsx";
import { CentersListPage } from "#web/features/organization/pages/CentersListPage.tsx";
import { DepartmentsListPage } from "#web/features/organization/pages/DepartmentsListPage.tsx";
import { PositionsListPage } from "#web/features/organization/pages/PositionsListPage.tsx";
import { TenantsListPage } from "#web/features/organization/pages/TenantsListPage.tsx";
import { EligibleEmployeesPage } from "#web/features/rewards/pages/EligibleEmployeesPage.tsx";
import { RewardMilestonesPage } from "#web/features/rewards/pages/RewardMilestonesPage.tsx";
import { ServiceRewardsListPage } from "#web/features/rewards/pages/ServiceRewardsListPage.tsx";
import { RolesListPage } from "#web/features/roles/pages/RolesListPage.tsx";
import { ManualStepJumpPage } from "#web/features/salary/pages/ManualStepJumpPage.tsx";
import { MassRaisePage } from "#web/features/salary/pages/MassRaisePage.tsx";
import { SalaryScaleDetailPage } from "#web/features/salary/pages/SalaryScaleDetailPage.tsx";
import { SalaryScalesListPage } from "#web/features/salary/pages/SalaryScalesListPage.tsx";
import { UsersListPage } from "#web/features/users/pages/UsersListPage.tsx";
import { AmmunitionStockPage } from "#web/features/weapons/pages/AmmunitionStockPage.tsx";
import { WeaponAssignmentsPage } from "#web/features/weapons/pages/WeaponAssignmentsPage.tsx";
import { WeaponsListPage } from "#web/features/weapons/pages/WeaponsListPage.tsx";

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
		path: "/change-password",
		element: (
			<ProtectedRoute allowPasswordChange>
				<ChangePasswordPage />
			</ProtectedRoute>
		),
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
				path: "/dashboard/hq",
				element: <HqDashboardPage />,
			},
			{
				path: "/employees",
				element: <EmployeesListPage />,
			},
			{
				path: "/employees/register",
				element: <EmployeeRegisterSelectPage />,
			},
			{
				path: "/employees/register/:type",
				element: <EmployeeRegisterFormPage />,
			},
			{
				path: "/employees/former",
				element: <FormerEmployeesPage />,
			},
			{
				path: "/employees/:id",
				element: (
					<LazyRoute>
						<EmployeeDetailPage />
					</LazyRoute>
				),
			},
			{
				path: "/employees/:id/edit",
				element: <EmployeeEditPage />,
			},
			{
				path: "/employees/photo",
				element: <EmployeePhotoPage />,
			},
			{
				path: "/employees/medical",
				element: (
					<LazyRoute>
						<EmployeeMedicalPage />
					</LazyRoute>
				),
			},
			{
				path: "/employees/family",
				element: (
					<LazyRoute>
						<EmployeeFamilyPage />
					</LazyRoute>
				),
			},
			{
				path: "/employees/marital",
				element: <EmployeeMaritalStatusPage />,
			},
			{
				path: "/employees/health",
				element: <ComingSoonPage />,
			},
			{
				path: "/employees/transfer",
				element: (
					<LazyRoute>
						<EmployeeTransferPage />
					</LazyRoute>
				),
			},
			{
				path: "/employees/superior",
				element: (
					<LazyRoute>
						<DirectSuperiorPage />
					</LazyRoute>
				),
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
			{
				path: "/committees",
				element: (
					<LazyRoute>
						<CommitteesListPage />
					</LazyRoute>
				),
			},
			{
				path: "/committees/types",
				element: <CommitteeTypesListPage />,
			},
			{
				path: "/committees/:id",
				element: <CommitteeDetailPage />,
			},
			{
				path: "/my-committee/:committeeId/cases",
				element: <MyCommitteeCasesPage />,
			},
			{
				path: "/complaints",
				element: <ComplaintsListPage />,
			},
			{
				path: "/complaints/register",
				element: (
					<LazyRoute>
						<ComplaintRegisterPage />
					</LazyRoute>
				),
			},
			{
				path: "/complaints/:id",
				element: (
					<LazyRoute>
						<ComplaintDetailPage />
					</LazyRoute>
				),
			},
			{
				path: "/leave/*",
				element: <ComingSoonPage />,
			},
			{
				path: "/holidays",
				element: <HolidayListPage />,
			},
			{
				path: "/holidays/calendar",
				element: <ComingSoonPage />,
			},
			{
				path: "/appraisal/*",
				element: <ComingSoonPage />,
			},
			{
				path: "/salary/scale",
				element: <SalaryScalesListPage />,
			},
			{
				path: "/salary/scale/new",
				element: (
					<LazyRoute>
						<SalaryScaleFormPage />
					</LazyRoute>
				),
			},
			{
				path: "/salary/scale/:id",
				element: <SalaryScaleDetailPage />,
			},
			{
				path: "/salary/scale/:id/edit",
				element: (
					<LazyRoute>
						<SalaryScaleFormPage />
					</LazyRoute>
				),
			},
			{
				path: "/salary/eligibility",
				element: (
					<LazyRoute>
						<SalaryEligibilityPage />
					</LazyRoute>
				),
			},
			{
				path: "/salary/manual-jump",
				element: <ManualStepJumpPage />,
			},
			{
				path: "/salary/mass-raise",
				element: <MassRaisePage />,
			},
			{
				path: "/salary/payroll",
				element: <ComingSoonPage />,
			},
			{
				path: "/attendance/daily",
				element: <DailyAttendancePage />,
			},
			{
				path: "/attendance/records",
				element: <AttendanceRecordsPage />,
			},
			{
				path: "/attendance/shifts",
				element: <ShiftDefinitionsPage />,
			},
			{
				path: "/attendance/schedule",
				element: <ShiftSchedulePage />,
			},
			{
				path: "/attendance/reports",
				element: <AttendanceReportsPage />,
			},
			{
				path: "/inventory/assignments",
				element: <InventoryAssignmentsPage />,
			},
			{
				path: "/inventory/stock",
				element: <CenterStockPage />,
			},
			{
				path: "/inventory/overdue",
				element: <OverdueItemsPage />,
			},
			{
				path: "/correspondence",
				element: <CorrespondenceListPage />,
			},
			{
				path: "/correspondence/incoming",
				element: <IncomingDocumentsPage />,
			},
			{
				path: "/correspondence/outgoing",
				element: <OutgoingDocumentsPage />,
			},
			{
				path: "/weapons",
				element: <WeaponsListPage />,
			},
			{
				path: "/weapons/categories",
				element: (
					<LazyRoute>
						<WeaponCategoriesPage />
					</LazyRoute>
				),
			},
			{
				path: "/weapons/assignments",
				element: <WeaponAssignmentsPage />,
			},
			{
				path: "/weapons/ammunition",
				element: <AmmunitionStockPage />,
			},
			{
				path: "/rewards",
				element: <ServiceRewardsListPage />,
			},
			{
				path: "/rewards/milestones",
				element: <RewardMilestonesPage />,
			},
			{
				path: "/rewards/eligibility",
				element: <EligibleEmployeesPage />,
			},
			{
				path: "/reports/*",
				element: <ComingSoonPage />,
			},
			{
				path: "/settings/*",
				element: <ComingSoonPage />,
			},
			{
				path: "/audit-logs",
				element: <AuditLogListPage />,
			},
			{
				path: "/audit-logs/login-history",
				element: <LoginHistoryPage />,
			},
		],
	},
]);
