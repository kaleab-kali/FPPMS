# HQ vs Center Access Control - Action Plan

## Executive Summary

This document outlines the comprehensive action plan to fix the HQ vs Center access control architecture in PPMS. The system will use the **accessScope-based approach** where:

- **HQ is a Center entity** (not NULL) - maintains data consistency
- **Access control uses `Role.accessScope`** to determine what users can see/manage
- **HQ roles** have `accessScope = "ALL_CENTERS"` - can see everything
- **Center roles** have `accessScope = "OWN_CENTER"` - can only see their center's data

---

## Architecture Decision

### Chosen Approach: Scope-Based Access Control (Industry Standard)

Based on research of enterprise patterns (SAP, Oracle, Workday):

| Aspect | Decision | Rationale |
|--------|----------|-----------|
| HQ Entity | Keep as Center | Matches SAP/Oracle patterns, maintains data consistency |
| Access Control | Use `accessScope` field | Already exists in Role model, just needs enforcement |
| Data Filtering | Server-side | Security best practice - never trust client |
| JWT Payload | Include accessScopes | Enable frontend to show/hide UI elements |

### Access Scope Values

| Scope | Meaning | Who Gets It |
|-------|---------|-------------|
| `ALL_CENTERS` | Can access all centers' data | IT_ADMIN, HQ_ADMIN, HR_DIRECTOR |
| `OWN_CENTER` | Can only access own center | CENTER_ADMIN, CENTER_COMMANDER, HR_OFFICER |
| `OWN_DEPARTMENT` | Can only access own department | DEPARTMENT_HEAD, SUPERVISOR |
| `OWN_RECORDS` | Can only access own records | EMPLOYEE, VIEWER |

---

## Implementation Phases

### Phase 1: Authentication Foundation (CRITICAL - Blocks Everything)

**Priority:** CRITICAL
**Estimated Files:** 4
**Must Complete Before:** All other phases

#### Task 1.1: Update Auth DTOs

| File | Changes | Status |
|------|---------|--------|
| `packages/api/src/common/dto/auth-user.dto.ts` | Add `accessScopes: string[]` and `effectiveAccessScope: string` | [ ] |
| `packages/api/src/common/interfaces/request-with-user.interface.ts` | Add accessScope properties to `RequestUser` interface | [ ] |
| `packages/api/src/modules/auth/dto/login-response.dto.ts` | Add `accessScopes` to `LoginUserDto` | [ ] |

#### Task 1.2: Update Auth Service

| File | Changes | Status |
|------|---------|--------|
| `packages/api/src/modules/auth/auth.service.ts` | Query user's roles, aggregate accessScopes, include in JWT payload | [ ] |

**Implementation Details:**
```typescript
// In auth.service.ts login method:
// 1. Query user with roles
// 2. Extract all accessScopes from roles
// 3. Compute effectiveAccessScope (most permissive wins)
// 4. Include in JWT payload
```

#### Task 1.3: Update JWT Strategy

| File | Changes | Status |
|------|---------|--------|
| `packages/api/src/modules/auth/strategies/jwt.strategy.ts` | Extract accessScopes from JWT, populate request user | [ ] |

---

### Phase 2: Create Access Control Utilities

**Priority:** CRITICAL
**Estimated Files:** 2-3
**Must Complete Before:** Phase 3

#### Task 2.1: Create Access Scope Helper

| File | Changes | Status |
|------|---------|--------|
| `packages/api/src/common/utils/access-scope.util.ts` | Create utility functions for access scope checks | [ ] |

**Functions to Create:**
```typescript
// Determine most permissive scope from array
computeEffectiveAccessScope(scopes: string[]): string

// Check if user can access a specific center
canAccessCenter(userCenterId: string | null, targetCenterId: string, accessScope: string): boolean

// Build Prisma where clause based on access scope
buildCenterAccessFilter(userCenterId: string | null, accessScope: string): Prisma.XWhereInput

// Validate user can perform action on resource
validateCenterAccess(userCenterId: string | null, resourceCenterId: string, accessScope: string): void
```

#### Task 2.2: Create Access Control Decorator (Optional)

| File | Changes | Status |
|------|---------|--------|
| `packages/api/src/common/decorators/access-scope.decorator.ts` | Create decorator for controller-level access control | [ ] |

---

### Phase 3: Core Data Services

**Priority:** HIGH
**Estimated Files:** 8
**Dependencies:** Phase 1, Phase 2

#### Task 3.1: Employees Module

| File | Method | Changes | Status |
|------|--------|---------|--------|
| `employees.service.ts` | `buildWhereClause()` | Add center filtering based on accessScope | [ ] |
| `employees.service.ts` | `findAll()` | Pass accessScope to buildWhereClause | [ ] |
| `employees.service.ts` | `findOne()` | Validate user can access employee's center | [ ] |
| `employees.service.ts` | `findByEmployeeId()` | Validate user can access employee's center | [ ] |
| `employees.service.ts` | `create()` | Validate user can create in target center | [ ] |
| `employees.service.ts` | `update()` | Validate user can update in target center | [ ] |
| `employees.controller.ts` | All endpoints | Pass user.accessScopes to service methods | [ ] |

#### Task 3.2: Users Module

| File | Method | Changes | Status |
|------|--------|---------|--------|
| `users.service.ts` | `findAll()` | Filter by center based on accessScope | [ ] |
| `users.service.ts` | `findByCenter()` | Validate user can access requested center | [ ] |
| `users.service.ts` | `createFromEmployee()` | Validate user can create in target center | [ ] |
| `users.service.ts` | `findEmployeesWithoutUserAccount()` | Filter by accessible centers | [ ] |
| `users.controller.ts` | All endpoints | Pass user.accessScopes to service methods | [ ] |

#### Task 3.3: Centers Module

| File | Method | Changes | Status |
|------|--------|---------|--------|
| `centers.service.ts` | `findAll()` | Filter centers based on accessScope | [ ] |
| `centers.service.ts` | `findOne()` | Validate user can access requested center | [ ] |
| `centers.controller.ts` | All endpoints | Pass user.accessScopes to service methods | [ ] |

#### Task 3.4: Departments Module

| File | Method | Changes | Status |
|------|--------|---------|--------|
| `departments.service.ts` | `findAll()` | Filter by accessible centers | [ ] |
| `departments.service.ts` | `findHierarchy()` | Filter by accessible centers | [ ] |
| `departments.controller.ts` | All endpoints | Pass user.accessScopes to service methods | [ ] |

---

### Phase 4: Feature Modules

**Priority:** HIGH
**Estimated Files:** 6
**Dependencies:** Phase 3

#### Task 4.1: Complaints Module

| File | Method | Changes | Status |
|------|--------|---------|--------|
| `complaints.service.ts` | `create()` | Validate user can create in target center | [ ] |
| `complaints.service.ts` | `findAll()` | Filter by center based on accessScope | [ ] |
| `complaints.service.ts` | `findOne()` | Validate user can access complaint's center | [ ] |
| `complaints.service.ts` | `findByCommittee()` | Filter by accessible centers | [ ] |
| `complaints.service.ts` | All action methods | Validate center access before action | [ ] |
| `complaints.controller.ts` | All endpoints | Pass user.accessScopes to service methods | [ ] |

#### Task 4.2: Committees Module

| File | Method | Changes | Status |
|------|--------|---------|--------|
| `committees.service.ts` | `createCommittee()` | Validate user can create in target center | [ ] |
| `committees.service.ts` | `findAllCommittees()` | Filter by center based on accessScope | [ ] |
| `committees.service.ts` | `findOneCommittee()` | Validate user can access committee's center | [ ] |
| `committees.service.ts` | Member methods | Validate center access for member operations | [ ] |
| `committees.controller.ts` | All endpoints | Pass user.accessScopes to service methods | [ ] |

#### Task 4.3: Dashboard Module

| File | Method | Changes | Status |
|------|--------|---------|--------|
| `dashboard.service.ts` | `getHqOverview()` | Filter centers based on accessScope | [ ] |
| `dashboard.service.ts` | New: `getCenterOverview()` | Return single center stats for OWN_CENTER users | [ ] |
| `dashboard.controller.ts` | Endpoints | Route to appropriate method based on accessScope | [ ] |

---

### Phase 5: Employee Sub-Services

**Priority:** MEDIUM
**Estimated Files:** 6
**Dependencies:** Phase 3.1

#### Task 5.1: Employee Sub-Services

| File | Changes | Status |
|------|---------|--------|
| `employee-family.service.ts` | Add center validation to all methods | [ ] |
| `employee-medical.service.ts` | Add center validation to all methods | [ ] |
| `employee-marital-status.service.ts` | Add center validation to all methods | [ ] |
| `employee-photo.service.ts` | Add center validation to all methods | [ ] |
| `employee-transfer.service.ts` | Add center validation, handle HQ transfers | [ ] |
| `employee-superior.service.ts` | Add center validation to all methods | [ ] |

---

### Phase 6: Roles & Permissions Setup

**Priority:** MEDIUM
**Estimated Files:** 2
**Dependencies:** Phase 1

#### Task 6.1: Update System Roles

| File | Changes | Status |
|------|---------|--------|
| `packages/api/prisma/seeds/roles.seed.ts` | Ensure HQ roles have `ALL_CENTERS`, center roles have `OWN_CENTER` | [ ] |

**Role Access Scope Mapping:**
```
IT_ADMIN        -> ALL_CENTERS
HQ_ADMIN        -> ALL_CENTERS
HR_DIRECTOR     -> ALL_CENTERS
CENTER_ADMIN    -> OWN_CENTER
CENTER_COMMANDER -> OWN_CENTER
HR_OFFICER      -> OWN_CENTER
DEPARTMENT_HEAD -> OWN_DEPARTMENT
SUPERVISOR      -> OWN_DEPARTMENT
FINANCE_OFFICER -> OWN_CENTER
RECORDS_OFFICER -> OWN_CENTER
EMPLOYEE        -> OWN_RECORDS
VIEWER          -> OWN_RECORDS
```

#### Task 6.2: Create Migration Script

| File | Changes | Status |
|------|---------|--------|
| `packages/api/prisma/migrations/manual/update-role-access-scopes.ts` | Update existing roles with correct accessScope values | [ ] |

---

### Phase 7: Frontend Updates

**Priority:** LOW (Backend enforces security)
**Estimated Files:** 10+
**Dependencies:** All backend phases

#### Task 7.1: Auth Context Update

| File | Changes | Status |
|------|---------|--------|
| `packages/web/src/context/AuthContext.tsx` | Store accessScopes from login response | [ ] |

#### Task 7.2: API Layer Updates

| File | Changes | Status |
|------|---------|--------|
| `packages/web/src/api/employees/*.ts` | Queries respect server filtering (no changes needed if backend filters) | [ ] |
| `packages/web/src/api/complaints/*.ts` | Queries respect server filtering | [ ] |
| `packages/web/src/api/committees/*.ts` | Queries respect server filtering | [ ] |
| `packages/web/src/api/users/*.ts` | Queries respect server filtering | [ ] |

#### Task 7.3: UI Components

| File | Changes | Status |
|------|---------|--------|
| `packages/web/src/components/layout/AppSidebar.tsx` | Show/hide menu items based on accessScope | [ ] |
| Feature components | Show/hide actions based on accessScope | [ ] |

---

## Testing Checklist

### Unit Tests

| Test | Description | Status |
|------|-------------|--------|
| Access scope utility tests | Test all helper functions | [ ] |
| Auth service tests | Test accessScope inclusion in JWT | [ ] |
| Employee service tests | Test center filtering | [ ] |
| Complaints service tests | Test center filtering | [ ] |
| Committees service tests | Test center filtering | [ ] |

### Integration Tests

| Test | Description | Status |
|------|-------------|--------|
| HQ Admin can see all centers | Login as HQ_ADMIN, verify all data visible | [ ] |
| Center Admin sees only own center | Login as CENTER_ADMIN, verify filtered data | [ ] |
| Cross-center access denied | Try to access other center's data, verify 403 | [ ] |
| HQ can create in any center | Create employee in different center | [ ] |
| Center can only create in own | Try to create in other center, verify error | [ ] |

### E2E Tests

| Test | Description | Status |
|------|-------------|--------|
| Full complaint workflow - HQ | HQ user processes complaint across centers | [ ] |
| Full complaint workflow - Center | Center user processes only their complaints | [ ] |
| Committee case assignment | Verify committee only sees accessible cases | [ ] |
| Dashboard data accuracy | Verify stats match user's access scope | [ ] |

---

## Rollback Plan

If issues arise:

1. **Immediate:** Revert JWT changes to not include accessScopes
2. **Short-term:** Services fall back to tenant-only filtering
3. **Data:** No schema changes required, only code changes

---

## File Change Summary

### Critical (Must Do First)
- `packages/api/src/common/dto/auth-user.dto.ts`
- `packages/api/src/common/interfaces/request-with-user.interface.ts`
- `packages/api/src/modules/auth/dto/login-response.dto.ts`
- `packages/api/src/modules/auth/auth.service.ts`
- `packages/api/src/modules/auth/strategies/jwt.strategy.ts`

### High Priority
- `packages/api/src/common/utils/access-scope.util.ts` (NEW)
- `packages/api/src/modules/employees/employees.service.ts`
- `packages/api/src/modules/employees/employees.controller.ts`
- `packages/api/src/modules/users/users.service.ts`
- `packages/api/src/modules/users/users.controller.ts`
- `packages/api/src/modules/complaints/complaints.service.ts`
- `packages/api/src/modules/complaints/complaints.controller.ts`
- `packages/api/src/modules/committees/committees.service.ts`
- `packages/api/src/modules/committees/committees.controller.ts`

### Medium Priority
- `packages/api/src/modules/centers/centers.service.ts`
- `packages/api/src/modules/centers/centers.controller.ts`
- `packages/api/src/modules/departments/departments.service.ts`
- `packages/api/src/modules/departments/departments.controller.ts`
- `packages/api/src/modules/dashboard/dashboard.service.ts`
- `packages/api/src/modules/dashboard/dashboard.controller.ts`
- `packages/api/src/modules/employees/services/*.ts` (6 files)
- `packages/api/prisma/seeds/roles.seed.ts`

### Low Priority (Frontend)
- `packages/web/src/context/AuthContext.tsx`
- `packages/web/src/components/layout/AppSidebar.tsx`
- Various feature components

---

## Progress Tracking

### Overall Progress

| Phase | Status | Progress |
|-------|--------|----------|
| Phase 1: Auth Foundation | COMPLETED | 100% |
| Phase 2: Access Utilities | COMPLETED | 100% |
| Phase 3: Core Services | NOT STARTED | 0% |
| Phase 4: Feature Modules | NOT STARTED | 0% |
| Phase 5: Sub-Services | NOT STARTED | 0% |
| Phase 6: Roles Setup | NOT STARTED | 0% |
| Phase 7: Frontend | NOT STARTED | 0% |

**Total Progress: ~14%**

---

## Notes

- No database schema changes required
- HQ remains as a Center entity
- All security enforced server-side
- Frontend updates are for UX only (hiding buttons, etc.)
- Existing data does not need migration (roles just need accessScope values updated)

---

*Last Updated: 2025-12-27*
*Created By: Claude Code*
