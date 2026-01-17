import { createBrowserRouter, Navigate } from "react-router-dom";
import { ComingSoonPage } from "#web/components/common/ComingSoonPage.tsx";
import { AppLayout } from "#web/components/layout/AppLayout.tsx";
import { AuthLayout } from "#web/components/layout/AuthLayout.tsx";
// TODO: Uncomment when attendance module is merged
// import { AttendanceRecordsPage } from "#web/features/attendance/pages/AttendanceRecordsPage.tsx";
// import { AttendanceReportsPage } from "#web/features/attendance/pages/AttendanceReportsPage.tsx";
// import { DailyAttendancePage } from "#web/features/attendance/pages/DailyAttendancePage.tsx";
// import { ShiftDefinitionsPage } from "#web/features/attendance/pages/ShiftDefinitionsPage.tsx";
// import { ShiftSchedulePage } from "#web/features/attendance/pages/ShiftSchedulePage.tsx";
import { AuditLogListPage } from "#web/features/audit-log/pages/AuditLogListPage.tsx";
import { LoginHistoryPage } from "#web/features/audit-log/pages/LoginHistoryPage.tsx";
import { ChangePasswordPage } from "#web/features/auth/pages/ChangePasswordPage.tsx";
import { LoginPage } from "#web/features/auth/pages/LoginPage.tsx";
import { CommitteeDetailPage } from "#web/features/committees/pages/CommitteeDetailPage.tsx";
import { CommitteesListPage } from "#web/features/committees/pages/CommitteesListPage.tsx";
import { CommitteeTypesListPage } from "#web/features/committees/pages/CommitteeTypesListPage.tsx";
import { MyCommitteeCasesPage } from "#web/features/committees/pages/MyCommitteeCasesPage.tsx";
import { ComplaintDetailPage } from "#web/features/complaints/pages/ComplaintDetailPage.tsx";
import { ComplaintRegisterPage } from "#web/features/complaints/pages/ComplaintRegisterPage.tsx";
import { ComplaintsListPage } from "#web/features/complaints/pages/ComplaintsListPage.tsx";
import { CorrespondenceListPage } from "#web/features/correspondence/pages/CorrespondenceListPage.tsx";
import { IncomingDocumentsPage } from "#web/features/correspondence/pages/IncomingDocumentsPage.tsx";
import { OutgoingDocumentsPage } from "#web/features/correspondence/pages/OutgoingDocumentsPage.tsx";
import { DashboardPage } from "#web/features/dashboard/pages/DashboardPage.tsx";
import { HqDashboardPage } from "#web/features/dashboard/pages/HqDashboardPage.tsx";
import { DirectSuperiorPage } from "#web/features/employees/pages/DirectSuperiorPage.tsx";
import { EmployeeDetailPage } from "#web/features/employees/pages/EmployeeDetailPage.tsx";
import { EmployeeEditPage } from "#web/features/employees/pages/EmployeeEditPage.tsx";
import { EmployeeFamilyPage } from "#web/features/employees/pages/EmployeeFamilyPage.tsx";
import { EmployeeMaritalStatusPage } from "#web/features/employees/pages/EmployeeMaritalStatusPage.tsx";
import { EmployeeMedicalPage } from "#web/features/employees/pages/EmployeeMedicalPage.tsx";
import { EmployeePhotoPage } from "#web/features/employees/pages/EmployeePhotoPage.tsx";
import { EmployeeRegisterFormPage } from "#web/features/employees/pages/EmployeeRegisterFormPage.tsx";
import { EmployeeRegisterSelectPage } from "#web/features/employees/pages/EmployeeRegisterSelectPage.tsx";
import { EmployeesListPage } from "#web/features/employees/pages/EmployeesListPage.tsx";
import { EmployeeTransferPage } from "#web/features/employees/pages/EmployeeTransferPage.tsx";
import { FormerEmployeesPage } from "#web/features/employees/pages/FormerEmployeesPage.tsx";
// TODO: Uncomment when holidays module is merged
// import { HolidayListPage } from "#web/features/holidays/pages/HolidayListPage.tsx";
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
import { SalaryEligibilityPage } from "#web/features/salary/pages/SalaryEligibilityPage.tsx";
import { SalaryScaleDetailPage } from "#web/features/salary/pages/SalaryScaleDetailPage.tsx";
import { SalaryScaleFormPage } from "#web/features/salary/pages/SalaryScaleFormPage.tsx";
import { SalaryScalesListPage } from "#web/features/salary/pages/SalaryScalesListPage.tsx";
import { UsersListPage } from "#web/features/users/pages/UsersListPage.tsx";
import { AmmunitionStockPage } from "#web/features/weapons/pages/AmmunitionStockPage.tsx";
import { WeaponAssignmentsPage } from "#web/features/weapons/pages/WeaponAssignmentsPage.tsx";
import { WeaponCategoriesPage } from "#web/features/weapons/pages/WeaponCategoriesPage.tsx";
import { WeaponsListPage } from "#web/features/weapons/pages/WeaponsListPage.tsx";
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
				element: <EmployeeDetailPage />,
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
				element: <EmployeeMedicalPage />,
			},
			{
				path: "/employees/family",
				element: <EmployeeFamilyPage />,
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
				element: <EmployeeTransferPage />,
			},
			{
				path: "/employees/superior",
				element: <DirectSuperiorPage />,
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
				element: <CommitteesListPage />,
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
				element: <ComplaintRegisterPage />,
			},
			{
				path: "/complaints/:id",
				element: <ComplaintDetailPage />,
			},
			{
				path: "/leave/*",
				element: <ComingSoonPage />,
			},
			// TODO: Uncomment when holidays module is merged
			// {
			// 	path: "/holidays",
			// 	element: <HolidayListPage />,
			// },
			// {
			// 	path: "/holidays/calendar",
			// 	element: <ComingSoonPage />,
			// },
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
				element: <SalaryScaleFormPage />,
			},
			{
				path: "/salary/scale/:id",
				element: <SalaryScaleDetailPage />,
			},
			{
				path: "/salary/scale/:id/edit",
				element: <SalaryScaleFormPage />,
			},
			{
				path: "/salary/eligibility",
				element: <SalaryEligibilityPage />,
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
			// TODO: Uncomment when attendance module is merged
			// {
			// 	path: "/attendance/daily",
			// 	element: <DailyAttendancePage />,
			// },
			// {
			// 	path: "/attendance/records",
			// 	element: <AttendanceRecordsPage />,
			// },
			// {
			// 	path: "/attendance/shifts",
			// 	element: <ShiftDefinitionsPage />,
			// },
			// {
			// 	path: "/attendance/schedule",
			// 	element: <ShiftSchedulePage />,
			// },
			// {
			// 	path: "/attendance/reports",
			// 	element: <AttendanceReportsPage />,
			// },
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
				element: <WeaponCategoriesPage />,
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
