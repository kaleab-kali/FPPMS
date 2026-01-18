# File Map

> Quick lookup: "Where is X?" - Find any file instantly

## Quick Search Index

### "I need to find the... controller/service/page for X"

| Module | Backend Controller | Backend Service | Frontend Page |
|--------|-------------------|-----------------|---------------|
| Auth | `api/src/modules/auth/auth.controller.ts` | `auth.service.ts` | `web/src/features/auth/pages/LoginPage.tsx` |
| Employees | `api/src/modules/employees/employees.controller.ts` | `employees.service.ts` | `web/src/features/employees/pages/` |
| Departments | `api/src/modules/departments/departments.controller.ts` | `departments.service.ts` | `web/src/features/organization/pages/DepartmentsPage.tsx` |
| Centers | `api/src/modules/centers/centers.controller.ts` | `centers.service.ts` | `web/src/features/organization/pages/CentersPage.tsx` |
| Tenants | `api/src/modules/tenants/tenants.controller.ts` | `tenants.service.ts` | `web/src/features/organization/pages/TenantsPage.tsx` |
| Users | `api/src/modules/users/users.controller.ts` | `users.service.ts` | `web/src/features/users/pages/UsersPage.tsx` |
| Roles | `api/src/modules/roles/roles.controller.ts` | `roles.service.ts` | `web/src/features/roles/pages/RolesPage.tsx` |
| Permissions | `api/src/modules/permissions/permissions.controller.ts` | `permissions.service.ts` | N/A |
| Positions | `api/src/modules/positions/positions.controller.ts` | `positions.service.ts` | `web/src/features/lookups/pages/PositionsPage.tsx` |
| Ranks | `api/src/modules/ranks/ranks.controller.ts` | `ranks.service.ts` | `web/src/features/lookups/pages/RanksPage.tsx` |
| Lookups | `api/src/modules/lookups/` (regions, sub-cities, woredas) | `lookups.service.ts` | `web/src/features/lookups/pages/` |
| Dashboard | `api/src/modules/dashboard/dashboard.controller.ts` | `dashboard.service.ts` | `web/src/features/dashboard/pages/DashboardPage.tsx` |
| Attendance | `api/src/modules/attendance/` | `attendance.service.ts` | `web/src/features/attendance/pages/` |
| Holidays | `api/src/modules/holidays/holidays.controller.ts` | `holidays.service.ts` | `web/src/features/holidays/pages/` |
| Complaints | `api/src/modules/complaints/complaints.controller.ts` | `complaints.service.ts` | `web/src/features/complaints/pages/` |
| Committees | `api/src/modules/committees/committees.controller.ts` | `committees.service.ts` | `web/src/features/committees/pages/` |
| Correspondence | `api/src/modules/correspondence/correspondence.controller.ts` | `correspondence.service.ts` | `web/src/features/correspondence/pages/` |
| Inventory | `api/src/modules/inventory/inventory.controller.ts` | `inventory.service.ts` | `web/src/features/inventory/pages/` |
| Weapons | `api/src/modules/weapons/weapons.controller.ts` | `weapons.service.ts` | `web/src/features/weapons/pages/` |
| Rewards | `api/src/modules/rewards/rewards.controller.ts` | `rewards.service.ts` | `web/src/features/rewards/pages/` |
| Salary | `api/src/modules/salary-management/` | `salary-management.service.ts` | `web/src/features/salary/pages/` |
| Salary Scale | `api/src/modules/salary-scale/salary-scale.controller.ts` | `salary-scale.service.ts` | `web/src/features/salary/pages/` |
| Attachments | `api/src/modules/attachments/attachments.controller.ts` | `attachments.service.ts` | N/A (component) |
| Audit Log | `api/src/modules/audit-log/audit-log.controller.ts` | `audit-log.service.ts` | `web/src/features/audit-log/pages/` |

---

## Backend File Locations

### Base Path: `packages/api/src/`

#### Core Files

| File | Path | Purpose |
|------|------|---------|
| App Module | `app.module.ts` | Root module, imports all modules |
| Main Entry | `main.ts` | Bootstrap, Swagger setup |
| Prisma Service | `database/prisma.service.ts` | Database connection |

#### Configuration

| Config | Path |
|--------|------|
| App Config | `config/app.config.ts` |
| Auth Config | `config/auth.config.ts` |
| Database Config | `config/database.config.ts` |
| File Storage | `config/file-storage.config.ts` |

#### Common Utilities

| Utility | Path | Purpose |
|---------|------|---------|
| Pagination | `common/utils/pagination.util.ts` | `paginate()`, `calculateSkip()` |
| Date | `common/utils/date.util.ts` | Date formatting |
| Ethiopian Calendar | `common/utils/ethiopian-calendar.util.ts` | Calendar conversion |
| Hash | `common/utils/hash.util.ts` | Password hashing |
| String | `common/utils/string.util.ts` | ID generation |
| File | `common/utils/file.util.ts` | File operations |
| Access Scope | `common/utils/access-scope.util.ts` | Permission checking |
| HQ | `common/utils/hq.util.ts` | HQ-specific logic |

#### Decorators

| Decorator | Path | Usage |
|-----------|------|-------|
| @CurrentUser() | `common/decorators/current-user.decorator.ts` | Get authenticated user |
| @CurrentTenant() | `common/decorators/current-tenant.decorator.ts` | Get tenant ID |
| @Public() | `common/decorators/public.decorator.ts` | Mark route as public |
| @Roles() | `common/decorators/roles.decorator.ts` | Require roles |
| @Permissions() | `common/decorators/permissions.decorator.ts` | Require permissions |

#### Guards

| Guard | Path | Purpose |
|-------|------|---------|
| JwtAuthGuard | `common/guards/jwt-auth.guard.ts` | JWT authentication |
| RolesGuard | `common/guards/roles.guard.ts` | Role-based access |
| PermissionsGuard | `common/guards/permissions.guard.ts` | Permission-based access |
| TenantGuard | `common/guards/tenant.guard.ts` | Tenant isolation |

#### Common DTOs

| DTO | Path | Purpose |
|-----|------|---------|
| PaginationQueryDto | `common/dto/pagination-query.dto.ts` | Pagination params |
| PaginatedResponseDto | `common/dto/paginated-response.dto.ts` | Paginated response |
| ApiResponseDto | `common/dto/api-response.dto.ts` | Standard response |

#### Constants

| Constant | Path | Contains |
|----------|------|----------|
| Roles | `common/constants/roles.constant.ts` | SYSTEM_ROLES, ROLE_LEVELS, ACCESS_SCOPES |
| Permissions | `common/constants/permissions.constant.ts` | Permission patterns |
| Employee Types | `common/constants/employee-types.constant.ts` | ID prefixes |

---

## Frontend File Locations

### Base Path: `packages/web/src/`

#### Core Files

| File | Path | Purpose |
|------|------|---------|
| App Entry | `App.tsx` | Routes, providers |
| Main Entry | `main.tsx` | React DOM render |
| API Client | `lib/api-client.ts` | Axios instance |
| Utils | `lib/utils.ts` | `cn()` classnames |
| Ethiopian Calendar | `lib/ethiopian-calendar.ts` | Calendar conversion |

#### Configuration

| Config | Path |
|--------|------|
| Constants | `config/constants.ts` |

#### Context Providers

| Context | Path | Purpose |
|---------|------|---------|
| Auth Context | `context/AuthContext.tsx` | Authentication state |

#### Shared Types

| Type File | Path | Contains |
|-----------|------|----------|
| API | `types/api.ts` | Pagination, response types |
| Auth | `types/auth.ts` | User, login types |
| Employee | `types/employee.ts` | Employee interfaces |
| Department | `types/department.ts` | Department interfaces |
| Center | `types/center.ts` | Center interfaces |
| ... | `types/*.ts` | All entity types |

#### UI Components (shadcn)

| Component | Path |
|-----------|------|
| Button | `components/ui/button.tsx` |
| Card | `components/ui/card.tsx` |
| Dialog | `components/ui/dialog.tsx` |
| Form | `components/ui/form.tsx` |
| Input | `components/ui/input.tsx` |
| Select | `components/ui/select.tsx` |
| Table | `components/ui/table.tsx` |
| Tabs | `components/ui/tabs.tsx` |
| ... | `components/ui/*.tsx` |

#### Common Components

| Component | Path | Purpose |
|-----------|------|---------|
| DataTable | `components/common/DataTable.tsx` | Reusable data table |
| Pagination | `components/common/Pagination.tsx` | Pagination controls |
| LoadingSpinner | `components/common/LoadingSpinner.tsx` | Loading indicator |
| ConfirmDialog | `components/common/ConfirmDialog.tsx` | Confirmation modal |
| DateDisplay | `components/common/DateDisplay.tsx` | Date formatting |
| DualCalendarPicker | `components/common/DualCalendarPicker.tsx` | Ethiopian/Gregorian |
| EmployeeSearch | `components/common/EmployeeSearch.tsx` | Employee lookup |
| PermissionGate | `components/common/PermissionGate.tsx` | Permission wrapper |
| ComingSoonPage | `components/common/ComingSoonPage.tsx` | Placeholder page |
| AttachmentUploader | `components/common/AttachmentUploader.tsx` | File upload |
| AttachmentList | `components/common/AttachmentList.tsx` | File display |

#### Layout Components

| Component | Path | Purpose |
|-----------|------|---------|
| AppLayout | `components/layout/AppLayout.tsx` | Main layout |
| AppSidebar | `components/layout/AppSidebar.tsx` | Navigation sidebar |
| NavUser | `components/layout/NavUser.tsx` | User menu |

#### Hooks

| Hook | Path | Purpose |
|------|------|---------|
| usePermissions | `hooks/usePermissions.ts` | Permission checking |
| useInactivityLogout | `hooks/useInactivityLogout.ts` | Auto logout |
| useMobile | `hooks/use-mobile.ts` | Mobile detection |

#### i18n

| File | Path |
|------|------|
| English | `i18n/locales/en.json` |
| Amharic | `i18n/locales/am.json` |
| Config | `i18n/i18n.ts` |

---

## Database Files

| File | Path | Purpose |
|------|------|---------|
| Schema | `packages/api/prisma/schema.prisma` | All models and enums |
| Seed Main | `packages/api/prisma/seed.ts` | Seed orchestration |
| Permissions Seed | `packages/api/prisma/seeds/permissions.seed.ts` | Permission data |
| Roles Seed | `packages/api/prisma/seeds/roles.seed.ts` | Role data |
| ... | `packages/api/prisma/seeds/*.seed.ts` | Other seed files |

---

## API Layer (Frontend)

### Pattern: `packages/web/src/api/{module}/`

Each module has 3 files:
- `{module}.api.ts` - Raw API calls
- `{module}.queries.ts` - TanStack useQuery hooks
- `{module}.mutations.ts` - TanStack useMutation hooks

| Module | API Files Location |
|--------|-------------------|
| Employees | `api/employees/employees.api.ts`, `employees.queries.ts`, `employees.mutations.ts` |
| Employee Family | `api/employees/employee-family.api.ts`, etc. |
| Employee Photo | `api/employees/employee-photo.api.ts`, etc. |
| Employee Transfer | `api/employees/employee-transfer.api.ts`, etc. |
| Departments | `api/departments/` |
| Centers | `api/centers/` |
| Users | `api/users/` |
| Roles | `api/roles/` |
| Permissions | `api/permissions/` |
| Lookups | `api/lookups/` |
| Attendance | `api/attendance/` |
| Holidays | `api/holidays/` |
| Complaints | `api/complaints/` |
| Committees | `api/committees/` |
| Correspondence | `api/correspondence/` |
| Inventory | `api/inventory/` |
| Weapons | `api/weapons/` |
| Rewards | `api/rewards/` |
| Salary | `api/salary-management/`, `api/salary-scale/` |
| Attachments | `api/attachments/` |
| Audit Log | `api/audit-log/` |
| Dashboard | `api/dashboard/` |

---

## Quick Find by Keyword

| Looking For | File Location |
|-------------|---------------|
| Login logic | `api/src/modules/auth/auth.service.ts` |
| JWT configuration | `api/src/config/auth.config.ts` |
| Password hashing | `api/src/common/utils/hash.util.ts` |
| Pagination helper | `api/src/common/utils/pagination.util.ts` |
| Employee ID generator | `api/src/modules/employees/services/employee-id-generator.service.ts` |
| Retirement calculation | `api/src/modules/employees/services/retirement-calculation.service.ts` |
| Transfer workflow | `api/src/modules/employees/services/employee-transfer.service.ts` |
| Photo management | `api/src/modules/employees/services/employee-photo.service.ts` |
| File upload config | `api/src/config/file-storage.config.ts` |
| Swagger setup | `api/src/main.ts` |
| Route registration | `web/src/App.tsx` |
| Sidebar navigation | `web/src/components/layout/AppSidebar.tsx` |
| Auth state | `web/src/context/AuthContext.tsx` |
| API interceptors | `web/src/lib/api-client.ts` |
| Date formatting | `web/src/lib/ethiopian-calendar.ts` |
| Translations | `web/src/i18n/locales/` |

---

## Module Registration

### Backend: Register new module in `app.module.ts`

```typescript
// packages/api/src/app.module.ts
@Module({
  imports: [
    // ... existing modules
    NewModule,  // Add here
  ],
})
export class AppModule {}
```

### Frontend: Register routes in `App.tsx`

```typescript
// packages/web/src/App.tsx
<Route path="/new-feature" element={<NewFeaturePage />} />
```

### Frontend: Add to sidebar in `AppSidebar.tsx`

```typescript
// packages/web/src/components/layout/AppSidebar.tsx
{
  title: "New Feature",
  url: "/new-feature",
  icon: IconComponent,
}
```

---

*Last Updated: 2025-01-18*
