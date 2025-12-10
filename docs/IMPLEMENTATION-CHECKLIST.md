# EPPMS Implementation Checklist

## Overview

This checklist provides a step-by-step, testable implementation plan for the EPPMS backend and frontend.

**Total Modules**: 17
**Total Estimated Tasks**: ~200+ individual tasks

---

## Implementation Phases

| Phase | Name | Modules | Priority |
|-------|------|---------|----------|
| 0 | Foundation | Config, Database, Common | CRITICAL |
| 1 | Authentication | Auth, Password Management | CRITICAL |
| 2 | Organization Core | Tenants, Centers, Lookups, Ranks, Departments, Positions | HIGH |
| 3 | Employee Core | Employee Registration (3 types), Addresses, Photos | HIGH |
| 4 | Leave & Holiday | Leave Types, Balances, Requests, Holidays | HIGH |
| 5 | Appraisal & Disciplinary | Periods, Criteria, Appraisals, Article 30/31 | MEDIUM |
| 6 | Salary Management | Military Scale, Steps, Increments | MEDIUM |
| 7 | Attendance & Shift | Schedules, Shifts, Clock In/Out | MEDIUM |
| 8 | Inventory | Categories, Items, Assignments, Clearance | MEDIUM |
| 9 | Retirement | Eligibility, Processing, Clearance | MEDIUM |
| 10 | Rewards & Complaints | Milestones, Eligibility, Complaint Workflow | LOW |
| 11 | Documents & Reports | Document Tracking, Reports, Analytics | LOW |
| 12 | Audit & Dashboard | Audit Logs, Statistics, Notifications | LOW |

---

# PHASE 0: FOUNDATION

## 0.1 Configuration Setup

### 0.1.1 Install Core Dependencies
- [ ] Install Prisma ORM
  ```bash
  npm install @prisma/client --workspace=packages/api
  npm install prisma --workspace=packages/api --save-dev
  ```
- [ ] Install NestJS Config
  ```bash
  npm install @nestjs/config --workspace=packages/api
  ```
- [ ] Install Validation packages
  ```bash
  npm install class-validator class-transformer --workspace=packages/api
  ```
- [ ] Install Passport & JWT
  ```bash
  npm install @nestjs/passport @nestjs/jwt passport passport-jwt passport-local --workspace=packages/api
  npm install @types/passport-jwt @types/passport-local --workspace=packages/api --save-dev
  ```
- [ ] Install bcrypt for password hashing
  ```bash
  npm install bcrypt --workspace=packages/api
  npm install @types/bcrypt --workspace=packages/api --save-dev
  ```
- [ ] Install UUID generator
  ```bash
  npm install uuid --workspace=packages/api
  npm install @types/uuid --workspace=packages/api --save-dev
  ```
- [ ] **TEST**: Run `npm run build:api` - should compile without errors

### 0.1.2 Create Config Module
- [ ] Create `packages/api/src/config/` directory
- [ ] Create `packages/api/src/config/index.ts` - barrel export
- [ ] Create `packages/api/src/config/config.module.ts`
- [ ] Create `packages/api/src/config/app.config.ts` - app settings
- [ ] Create `packages/api/src/config/database.config.ts` - DB connection
- [ ] Create `packages/api/src/config/auth.config.ts` - JWT settings
- [ ] Create `packages/api/src/config/file-storage.config.ts` - file paths
- [ ] Create `.env.example` with all required variables
- [ ] **TEST**: Import ConfigModule in AppModule, verify config loads

---

## 0.2 Database Setup

### 0.2.1 Initialize Prisma
- [ ] Run `npx prisma init` in packages/api
- [ ] Configure `prisma/schema.prisma` datasource for PostgreSQL
- [ ] Add multi-schema support (public, audit, stats, files)
- [ ] Add preview features (fullTextSearch, multiSchema)
- [ ] **TEST**: Run `npx prisma validate` - should pass

### 0.2.2 Create Prisma Enums
- [ ] Add `EmployeeType` enum (MILITARY, CIVILIAN, TEMPORARY)
- [ ] Add `EmployeeStatus` enum (ACTIVE, INACTIVE, ON_LEAVE, SUSPENDED, RETIRED, TERMINATED, DECEASED)
- [ ] Add `Gender` enum (MALE, FEMALE)
- [ ] Add `MaritalStatus` enum (SINGLE, MARRIED, DIVORCED, WIDOWED)
- [ ] Add `BloodType` enum (A_POSITIVE, A_NEGATIVE, B_POSITIVE, B_NEGATIVE, AB_POSITIVE, AB_NEGATIVE, O_POSITIVE, O_NEGATIVE)
- [ ] Add `WorkScheduleType` enum (REGULAR, SHIFT_24)
- [ ] Add `UserStatus` enum (ACTIVE, INACTIVE, LOCKED, PENDING)
- [ ] Add `LeaveRequestStatus` enum (DRAFT, PENDING, APPROVED, REJECTED, CANCELLED)
- [ ] Add `AppraisalStatus` enum
- [ ] Add `RetirementStatus` enum
- [ ] Add `ClearanceStatus` enum
- [ ] Add `DisciplinaryType` enum (ARTICLE_30, ARTICLE_31)
- [ ] Add `DisciplinaryStatus` enum
- [ ] Add `InvestigationStatus` enum
- [ ] Add `RewardEligibility` enum
- [ ] Add `DocumentDirection` enum
- [ ] Add `PhotoStatus` enum
- [ ] Add `AuditAction` enum
- [ ] **TEST**: Run `npx prisma validate`

### 0.2.3 Create Core Database Tables
- [ ] Create `Tenant` model
- [ ] Create `Center` model
- [ ] Create `User` model (with password fields)
- [ ] Create `Role` model
- [ ] Create `Permission` model
- [ ] Create `RolePermission` model
- [ ] Create `UserRole` model
- [ ] **TEST**: Run `npx prisma validate`

### 0.2.4 Create Address Lookup Tables
- [ ] Create `Region` model
- [ ] Create `SubCity` model (foreign key to Region)
- [ ] Create `Woreda` model (foreign key to SubCity)
- [ ] **TEST**: Run `npx prisma validate`

### 0.2.5 Create Military Ranks Table
- [ ] Create `MilitaryRank` model with retirement age
- [ ] Create `MilitaryRankSalaryStep` model
- [ ] **TEST**: Run `npx prisma validate`

### 0.2.6 Create Employee Tables
- [ ] Create `Employee` model (main table)
- [ ] Create `EmployeeAddress` model
- [ ] Create `EmployeeMotherInfo` model
- [ ] Create `EmployeeEmergencyContact` model
- [ ] Create `EmployeeEducation` model
- [ ] Create `EmployeeWorkExperience` model
- [ ] Create `EmployeeFamilyMember` model
- [ ] Create `EmployeeMedicalDependent` model
- [ ] Create `EmployeePhoto` model (files schema)
- [ ] **TEST**: Run `npx prisma validate`

### 0.2.7 Create Leave Tables
- [ ] Create `LeaveType` model
- [ ] Create `EmployeeLeaveBalance` model
- [ ] Create `LeaveBalanceDetail` model
- [ ] Create `LeaveRequest` model
- [ ] **TEST**: Run `npx prisma validate`

### 0.2.8 Create Appraisal Tables
- [ ] Create `AppraisalPeriod` model
- [ ] Create `AppraisalCriteria` model
- [ ] Create `Appraisal` model
- [ ] Create `DisciplinaryRecord` model
- [ ] Create `Investigation` model
- [ ] **TEST**: Run `npx prisma validate`

### 0.2.9 Create Remaining Module Tables
- [ ] Create `RewardMilestone` model
- [ ] Create `ServiceReward` model
- [ ] Create `Retirement` model
- [ ] Create `RetirementClearance` model
- [ ] Create `ShiftDefinition` model
- [ ] Create `ShiftAssignment` model
- [ ] Create `AttendanceRecord` model
- [ ] Create `InventoryCategory` model
- [ ] Create `InventoryItemType` model
- [ ] Create `InventoryAssignment` model
- [ ] Create `Holiday` model
- [ ] Create `DocumentType` model
- [ ] Create `Document` model
- [ ] Create `EmployeeDocument` model
- [ ] **TEST**: Run `npx prisma validate`

### 0.2.10 Create Audit Tables
- [ ] Create `AuditLog` model (audit schema)
- [ ] Create `LoginHistory` model (audit schema)
- [ ] **TEST**: Run `npx prisma validate`

### 0.2.11 Generate & Migrate
- [ ] Run `npx prisma generate`
- [ ] Run `npx prisma migrate dev --name init`
- [ ] **TEST**: Verify database tables created in PostgreSQL

### 0.2.12 Create Database Module
- [ ] Create `packages/api/src/database/` directory
- [ ] Create `packages/api/src/database/database.module.ts`
- [ ] Create `packages/api/src/database/prisma.service.ts`
- [ ] Create `packages/api/src/database/index.ts` - barrel export
- [ ] **TEST**: Import DatabaseModule in AppModule, verify Prisma connects

---

## 0.3 Common Module Setup

### 0.3.1 Create Directory Structure
- [ ] Create `packages/api/src/common/` directory
- [ ] Create subdirectories: decorators, guards, interceptors, filters, pipes, middleware, dto, interfaces, constants, utils
- [ ] Create `packages/api/src/common/index.ts` - barrel export

### 0.3.2 Create Constants
- [ ] Create `packages/api/src/common/constants/index.ts`
- [ ] Create `packages/api/src/common/constants/roles.constant.ts`
- [ ] Create `packages/api/src/common/constants/permissions.constant.ts`
- [ ] Create `packages/api/src/common/constants/employee-types.constant.ts`
- [ ] **TEST**: Import constants in test file, verify exports

### 0.3.3 Create Interfaces
- [ ] Create `packages/api/src/common/interfaces/index.ts`
- [ ] Create `request-with-user.interface.ts`
- [ ] Create `jwt-payload.interface.ts`
- [ ] Create `paginated-result.interface.ts`
- [ ] **TEST**: TypeScript compiles with interfaces

### 0.3.4 Create DTOs
- [ ] Create `packages/api/src/common/dto/index.ts`
- [ ] Create `pagination-query.dto.ts`
- [ ] Create `paginated-response.dto.ts`
- [ ] Create `api-response.dto.ts`
- [ ] **TEST**: Import DTOs, verify class-validator decorators work

### 0.3.5 Create Decorators
- [ ] Create `packages/api/src/common/decorators/index.ts`
- [ ] Create `current-user.decorator.ts`
- [ ] Create `current-tenant.decorator.ts`
- [ ] Create `roles.decorator.ts`
- [ ] Create `permissions.decorator.ts`
- [ ] Create `public.decorator.ts`
- [ ] **TEST**: Decorators can be applied to controller methods

### 0.3.6 Create Guards
- [ ] Create `packages/api/src/common/guards/index.ts`
- [ ] Create `jwt-auth.guard.ts`
- [ ] Create `roles.guard.ts`
- [ ] Create `permissions.guard.ts`
- [ ] Create `tenant.guard.ts`
- [ ] **TEST**: Guards can be instantiated

### 0.3.7 Create Interceptors
- [ ] Create `packages/api/src/common/interceptors/index.ts`
- [ ] Create `audit.interceptor.ts`
- [ ] Create `tenant-context.interceptor.ts`
- [ ] Create `transform-response.interceptor.ts`
- [ ] Create `logging.interceptor.ts`
- [ ] **TEST**: Interceptors can be instantiated

### 0.3.8 Create Filters
- [ ] Create `packages/api/src/common/filters/index.ts`
- [ ] Create `all-exceptions.filter.ts`
- [ ] Create `http-exception.filter.ts`
- [ ] Create `prisma-exception.filter.ts`
- [ ] **TEST**: Filters handle exceptions correctly

### 0.3.9 Create Pipes
- [ ] Create `packages/api/src/common/pipes/index.ts`
- [ ] Create `validation.pipe.ts`
- [ ] Create `parse-cuid.pipe.ts`
- [ ] **TEST**: Pipes validate/transform input

### 0.3.10 Create Middleware
- [ ] Create `packages/api/src/common/middleware/index.ts`
- [ ] Create `tenant.middleware.ts`
- [ ] Create `logger.middleware.ts`
- [ ] **TEST**: Middleware executes in request pipeline

### 0.3.11 Create Utils
- [ ] Create `packages/api/src/common/utils/index.ts`
- [ ] Create `hash.util.ts` - password hashing with bcrypt
- [ ] Create `date.util.ts` - date helpers
- [ ] Create `ethiopian-calendar.util.ts` - Ethiopian/Gregorian conversion
- [ ] Create `string.util.ts` - string helpers
- [ ] Create `file.util.ts` - file path helpers
- [ ] Create `pagination.util.ts` - pagination helpers
- [ ] **TEST**: Unit tests for utility functions

### 0.3.12 Wire Up Common Module
- [ ] Update `app.module.ts` to use global pipes, filters, interceptors
- [ ] Apply middleware in `main.ts`
- [ ] **TEST**: Run `npm run build:api` - compiles successfully
- [ ] **TEST**: Run `npm run dev:api` - server starts

---

# PHASE 1: AUTHENTICATION

## 1.1 Auth Module Structure

### 1.1.1 Create Auth Module
- [ ] Create `packages/api/src/modules/auth/` directory
- [ ] Create `auth.module.ts`
- [ ] Create `auth.controller.ts`
- [ ] Create `auth.service.ts`
- [ ] Create `strategies/` directory
- [ ] Create `dto/` directory
- [ ] **TEST**: Module compiles

### 1.1.2 Create Auth DTOs
- [ ] Create `dto/index.ts`
- [ ] Create `login.dto.ts` - username, password validation
- [ ] Create `login-response.dto.ts` - token, user info
- [ ] Create `change-password.dto.ts`
- [ ] Create `reset-password.dto.ts` (IT Admin only)
- [ ] **TEST**: DTOs validate correctly

### 1.1.3 Create Auth Strategies
- [ ] Create `strategies/local.strategy.ts` - username/password
- [ ] Create `strategies/jwt.strategy.ts` - JWT validation
- [ ] **TEST**: Strategies can be instantiated

### 1.1.4 Implement Auth Service
- [ ] Implement `validateUser(username, password)` - verify credentials
- [ ] Implement `login(user)` - generate JWT token
- [ ] Implement `changePassword(userId, oldPassword, newPassword)`
- [ ] Implement `resetPassword(userId, newPassword)` - IT Admin only
- [ ] Implement `checkAccountLock(userId)` - 5 failed attempts = lock
- [ ] Implement `incrementFailedAttempts(userId)`
- [ ] Implement `resetFailedAttempts(userId)`
- [ ] Implement `logout(userId)` - invalidate session
- [ ] **TEST**: Unit tests for each method

### 1.1.5 Implement Auth Controller
- [ ] POST `/auth/login` - login endpoint
- [ ] POST `/auth/logout` - logout endpoint
- [ ] POST `/auth/change-password` - change own password
- [ ] POST `/auth/reset-password/:userId` - IT Admin reset
- [ ] GET `/auth/me` - get current user
- [ ] **TEST**: API endpoints respond correctly

### 1.1.6 Wire Up Auth Module
- [ ] Import JwtModule with config
- [ ] Import PassportModule
- [ ] Register strategies as providers
- [ ] Export AuthService
- [ ] **TEST**: Full login flow works
- [ ] **TEST**: JWT token validates on protected routes
- [ ] **TEST**: Account locks after 5 failed attempts
- [ ] **TEST**: Forced password change on first login

---

# PHASE 2: ORGANIZATION CORE

## 2.1 Tenants Module

### 2.1.1 Create Tenants Module
- [ ] Create `packages/api/src/modules/tenants/` directory
- [ ] Create `tenants.module.ts`
- [ ] Create `tenants.controller.ts`
- [ ] Create `tenants.service.ts`
- [ ] Create `dto/` directory
- [ ] **TEST**: Module compiles

### 2.1.2 Create Tenant DTOs
- [ ] Create `create-tenant.dto.ts`
- [ ] Create `update-tenant.dto.ts`
- [ ] Create `tenant-response.dto.ts`
- [ ] **TEST**: DTOs validate correctly

### 2.1.3 Implement Tenants Service
- [ ] Implement `create(dto)`
- [ ] Implement `findAll()`
- [ ] Implement `findOne(id)`
- [ ] Implement `findByCode(code)`
- [ ] Implement `update(id, dto)`
- [ ] Implement `remove(id)` - soft delete
- [ ] **TEST**: Unit tests

### 2.1.4 Implement Tenants Controller
- [ ] POST `/tenants` - create tenant
- [ ] GET `/tenants` - list all tenants
- [ ] GET `/tenants/:id` - get single tenant
- [ ] PATCH `/tenants/:id` - update tenant
- [ ] DELETE `/tenants/:id` - soft delete
- [ ] **TEST**: API endpoints work

---

## 2.2 Centers Module

### 2.2.1 Create Centers Module
- [ ] Create `packages/api/src/modules/centers/` directory
- [ ] Create `centers.module.ts`
- [ ] Create `centers.controller.ts`
- [ ] Create `centers.service.ts`
- [ ] Create `dto/` directory
- [ ] **TEST**: Module compiles

### 2.2.2 Create Center DTOs
- [ ] Create `create-center.dto.ts`
- [ ] Create `update-center.dto.ts`
- [ ] Create `center-response.dto.ts`
- [ ] **TEST**: DTOs validate correctly

### 2.2.3 Implement Centers Service
- [ ] Implement `create(tenantId, dto)`
- [ ] Implement `findAll(tenantId)`
- [ ] Implement `findOne(tenantId, id)`
- [ ] Implement `update(tenantId, id, dto)`
- [ ] Implement `remove(tenantId, id)` - soft delete
- [ ] **TEST**: Unit tests

### 2.2.4 Implement Centers Controller
- [ ] POST `/centers` - create center
- [ ] GET `/centers` - list centers (tenant scoped)
- [ ] GET `/centers/:id` - get single center
- [ ] PATCH `/centers/:id` - update center
- [ ] DELETE `/centers/:id` - soft delete
- [ ] **TEST**: API endpoints work

---

## 2.3 Lookups Module (Address Cascading)

### 2.3.1 Create Lookups Module
- [ ] Create `packages/api/src/modules/lookups/` directory
- [ ] Create `lookups.module.ts`
- [ ] Create `controllers/` directory
- [ ] Create `services/` directory
- [ ] Create `dto/` directory
- [ ] **TEST**: Module compiles

### 2.3.2 Regions CRUD
- [ ] Create `controllers/regions.controller.ts`
- [ ] Create `services/regions.service.ts`
- [ ] Create `dto/create-region.dto.ts`
- [ ] Implement CRUD operations
- [ ] **TEST**: Region API works

### 2.3.3 Sub-Cities CRUD (Cascading from Region)
- [ ] Create `controllers/sub-cities.controller.ts`
- [ ] Create `services/sub-cities.service.ts`
- [ ] Create `dto/create-sub-city.dto.ts`
- [ ] Implement CRUD with region filter
- [ ] GET `/lookups/sub-cities?regionId=xxx` - filter by region
- [ ] **TEST**: Sub-cities cascade from region

### 2.3.4 Woredas CRUD (Cascading from Sub-City)
- [ ] Create `controllers/woredas.controller.ts`
- [ ] Create `services/woredas.service.ts`
- [ ] Create `dto/create-woreda.dto.ts`
- [ ] Implement CRUD with sub-city filter
- [ ] GET `/lookups/woredas?subCityId=xxx` - filter by sub-city
- [ ] **TEST**: Woredas cascade from sub-city

### 2.3.5 Other Lookups
- [ ] Create `controllers/education-levels.controller.ts`
- [ ] Create `services/education-levels.service.ts`
- [ ] Create `controllers/relationship-types.controller.ts`
- [ ] Create `services/relationship-types.service.ts`
- [ ] Implement CRUD for each
- [ ] **TEST**: All lookup endpoints work

---

## 2.4 Military Ranks Module

### 2.4.1 Create Military Ranks Module
- [ ] Create `packages/api/src/modules/military-ranks/` directory
- [ ] Create `military-ranks.module.ts`
- [ ] Create `military-ranks.controller.ts`
- [ ] Create `military-ranks.service.ts`
- [ ] Create `dto/` directory
- [ ] **TEST**: Module compiles

### 2.4.2 Create Rank DTOs
- [ ] Create `create-rank.dto.ts`
- [ ] Create `update-rank.dto.ts`
- [ ] Create `rank-response.dto.ts` (include salary steps, retirement age)
- [ ] **TEST**: DTOs validate correctly

### 2.4.3 Implement Military Ranks Service
- [ ] Implement `create(dto)` - with salary steps
- [ ] Implement `findAll()` - include salary steps
- [ ] Implement `findOne(id)` - include salary steps
- [ ] Implement `update(id, dto)`
- [ ] Implement `getRetirementAge(rankLevel)` - 50/52/55 by level
- [ ] Implement `getSalaryForStep(rankId, step)`
- [ ] **TEST**: Retirement age correct by rank level

### 2.4.4 Implement Military Ranks Controller
- [ ] GET `/military-ranks` - list all with salary info
- [ ] GET `/military-ranks/:id` - get single with steps
- [ ] GET `/military-ranks/:id/salary-steps` - get salary steps
- [ ] **TEST**: API endpoints work

---

## 2.5 Departments Module

### 2.5.1 Create Departments Module
- [ ] Create `packages/api/src/modules/departments/` directory
- [ ] Create `departments.module.ts`
- [ ] Create `departments.controller.ts`
- [ ] Create `departments.service.ts`
- [ ] Create `dto/` directory
- [ ] **TEST**: Module compiles

### 2.5.2 Implement Departments CRUD
- [ ] Implement service methods (CRUD + hierarchy)
- [ ] Implement controller endpoints
- [ ] Support parent-child relationships
- [ ] **TEST**: Department hierarchy works

---

## 2.6 Positions Module

### 2.6.1 Create Positions Module
- [ ] Create `packages/api/src/modules/positions/` directory
- [ ] Create `positions.module.ts`
- [ ] Create `positions.controller.ts`
- [ ] Create `positions.service.ts`
- [ ] Create `dto/` directory
- [ ] **TEST**: Module compiles

### 2.6.2 Implement Positions CRUD
- [ ] Implement service methods
- [ ] Implement controller endpoints
- [ ] **TEST**: Position API works

---

## 2.7 Users & Roles Module

### 2.7.1 Create Users Module
- [ ] Create `packages/api/src/modules/users/` directory
- [ ] Create `users.module.ts`
- [ ] Create `users.controller.ts`
- [ ] Create `users.service.ts`
- [ ] Create `users.repository.ts`
- [ ] Create `dto/` directory
- [ ] **TEST**: Module compiles

### 2.7.2 Create User DTOs
- [ ] Create `create-user.dto.ts`
- [ ] Create `update-user.dto.ts`
- [ ] Create `user-filter.dto.ts`
- [ ] Create `user-response.dto.ts` (exclude password)
- [ ] **TEST**: DTOs validate correctly

### 2.7.3 Implement Users Service
- [ ] Implement `create(dto)` - with password hash
- [ ] Implement `findAll(tenantId, filters)`
- [ ] Implement `findOne(id)`
- [ ] Implement `findByUsername(username)`
- [ ] Implement `update(id, dto)`
- [ ] Implement `lockUser(id)`
- [ ] Implement `unlockUser(id)`
- [ ] Implement `deactivateUser(id)` - soft delete
- [ ] Implement `assignRoles(userId, roleIds)`
- [ ] **TEST**: Unit tests

### 2.7.4 Implement Users Controller (IT Admin Only)
- [ ] POST `/users` - create user
- [ ] GET `/users` - list users
- [ ] GET `/users/:id` - get user
- [ ] PATCH `/users/:id` - update user
- [ ] POST `/users/:id/lock` - lock account
- [ ] POST `/users/:id/unlock` - unlock account
- [ ] DELETE `/users/:id` - deactivate
- [ ] POST `/users/:id/roles` - assign roles
- [ ] **TEST**: Only IT Admin can access

### 2.7.5 Create Roles Module
- [ ] Create `packages/api/src/modules/roles/` directory
- [ ] Create `roles.module.ts`
- [ ] Create `roles.controller.ts`
- [ ] Create `roles.service.ts`
- [ ] Create `dto/` directory
- [ ] **TEST**: Module compiles

### 2.7.6 Implement Roles Service
- [ ] Implement `findAll()`
- [ ] Implement `findOne(id)`
- [ ] Implement `getPermissions(roleId)`
- [ ] Implement `assignPermissions(roleId, permissionIds)`
- [ ] **TEST**: Unit tests

### 2.7.7 Implement Roles Controller
- [ ] GET `/roles` - list roles
- [ ] GET `/roles/:id` - get role with permissions
- [ ] POST `/roles/:id/permissions` - assign permissions
- [ ] **TEST**: API endpoints work

---

## 2.8 Database Seeds

### 2.8.1 Create Seed Files
- [ ] Create `packages/api/prisma/seeds/` directory
- [ ] Create `seed.ts` - main seed runner
- [ ] Create `tenants.seed.ts` - default tenant
- [ ] Create `roles.seed.ts` - 9 system roles
- [ ] Create `permissions.seed.ts` - module permissions
- [ ] Create `military-ranks.seed.ts` - 16 ranks with salary steps
- [ ] Create `regions.seed.ts` - Ethiopian regions
- [ ] Create `leave-types.seed.ts` - default leave types
- [ ] Create `users.seed.ts` - IT Admin user
- [ ] **TEST**: Run `npx prisma db seed`

### 2.8.2 Verify Seed Data
- [ ] Verify 16 military ranks with correct retirement ages
- [ ] Verify 9 system roles created
- [ ] Verify IT Admin user can login
- [ ] **TEST**: Login as IT Admin works

---

# PHASE 3: EMPLOYEE MANAGEMENT (Module 1)

## 3.1 Employees Core Module

### 3.1.1 Create Employees Module Structure
- [ ] Create `packages/api/src/modules/employees/` directory
- [ ] Create `employees.module.ts`
- [ ] Create `employees.controller.ts`
- [ ] Create `employees.service.ts`
- [ ] Create `employees.repository.ts`
- [ ] Create `services/` directory
- [ ] Create `dto/` directory
- [ ] **TEST**: Module compiles

### 3.1.2 Create Employee ID Generator Service
- [ ] Create `services/employee-id-generator.service.ts`
- [ ] Implement `generateEmployeeId(tenantId)` - returns "FPC-000001"
- [ ] Implement counter increment in tenant settings
- [ ] **TEST**: IDs generate sequentially

### 3.1.3 Create Retirement Calculation Service
- [ ] Create `services/employee-retirement-calc.service.ts`
- [ ] Implement `calculateRetirementDate(dateOfBirth, rankId)`
- [ ] Get retirement age from rank (50/52/55)
- [ ] **TEST**: Retirement dates calculate correctly for each rank group

### 3.1.4 Create Employee DTOs
- [ ] Create `dto/index.ts`
- [ ] Create `create-employee.dto.ts` - base fields
- [ ] Create `create-military-employee.dto.ts` - extends base, adds rank
- [ ] Create `create-civilian-employee.dto.ts` - extends base, adds salary grade
- [ ] Create `create-temporary-employee.dto.ts` - extends base, adds contract fields
- [ ] Create `update-employee.dto.ts`
- [ ] Create `employee-filter.dto.ts` - search, type, status, department, rank filters
- [ ] Create `employee-response.dto.ts`
- [ ] **TEST**: DTOs validate correctly

### 3.1.5 Implement Employees Repository
- [ ] Implement `create(tenantId, data)`
- [ ] Implement `findAll(tenantId, filters, pagination)`
- [ ] Implement `findOne(tenantId, id)`
- [ ] Implement `findByEmployeeId(tenantId, employeeId)`
- [ ] Implement `update(tenantId, id, data)`
- [ ] Implement `softDelete(tenantId, id)`
- [ ] Implement `count(tenantId, filters)`
- [ ] **TEST**: Repository queries work

### 3.1.6 Implement Employees Service
- [ ] Implement `registerMilitaryEmployee(tenantId, dto)`
  - Generate employee ID
  - Set default rank (Constable)
  - Calculate retirement date
  - Set default salary from rank
  - Set marital status default (Single for trainees)
- [ ] Implement `registerCivilianEmployee(tenantId, dto)`
  - Generate employee ID
  - No rank field
  - Set basic salary
- [ ] Implement `registerTemporaryEmployee(tenantId, dto)`
  - Generate employee ID
  - Set contract dates
  - Set contract amount
- [ ] Implement `findAll(tenantId, filters, pagination)`
- [ ] Implement `findOne(tenantId, id)`
- [ ] Implement `findByEmployeeId(tenantId, employeeId)`
- [ ] Implement `update(tenantId, id, dto)`
- [ ] Implement `updateStatus(tenantId, id, status, reason)`
- [ ] Implement `getProfile(tenantId, id)` - full profile with all relations
- [ ] **TEST**: Unit tests for each method

### 3.1.7 Implement Employees Controller
- [ ] POST `/employees/military` - register military employee
- [ ] POST `/employees/civilian` - register civilian employee
- [ ] POST `/employees/temporary` - register temporary employee
- [ ] GET `/employees` - list with filters & pagination
- [ ] GET `/employees/:id` - get basic employee
- [ ] GET `/employees/:id/profile` - get full profile
- [ ] GET `/employees/by-employee-id/:employeeId` - get by FPC-XXXXXX
- [ ] PATCH `/employees/:id` - update employee
- [ ] DELETE `/employees/:id` - soft delete
- [ ] **TEST**: All endpoints work
- [ ] **TEST**: Military employee gets correct default rank and salary
- [ ] **TEST**: Retirement date calculates correctly

---

## 3.2 Employee Sub-Modules

### 3.2.1 Employee Addresses Module
- [ ] Create `packages/api/src/modules/employee-addresses/` directory
- [ ] Create module, controller, service, DTOs
- [ ] POST `/employees/:employeeId/addresses` - add address
- [ ] GET `/employees/:employeeId/addresses` - list addresses
- [ ] PUT `/employees/:employeeId/addresses/:id` - update address
- [ ] Implement cascading validation (region -> subcity -> woreda)
- [ ] **TEST**: Address CRUD works with cascading lookups

### 3.2.2 Employee Mother Info Module
- [ ] Create `packages/api/src/modules/employee-mother-info/` directory
- [ ] Create module, controller, service, DTOs
- [ ] POST `/employees/:employeeId/mother-info` - create/update
- [ ] GET `/employees/:employeeId/mother-info` - get
- [ ] **TEST**: Mother info CRUD works

### 3.2.3 Employee Emergency Contacts Module
- [ ] Create `packages/api/src/modules/employee-emergency-contacts/` directory
- [ ] Create module, controller, service, DTOs
- [ ] POST `/employees/:employeeId/emergency-contacts` - add contact
- [ ] GET `/employees/:employeeId/emergency-contacts` - list contacts
- [ ] PUT `/employees/:employeeId/emergency-contacts/:id` - update
- [ ] DELETE `/employees/:employeeId/emergency-contacts/:id` - remove
- [ ] **TEST**: Emergency contact CRUD works

### 3.2.4 Employee Education Module
- [ ] Create `packages/api/src/modules/employee-education/` directory
- [ ] Create module, controller, service, DTOs
- [ ] POST `/employees/:employeeId/education` - add education record
- [ ] GET `/employees/:employeeId/education` - list education
- [ ] PUT `/employees/:employeeId/education/:id` - update
- [ ] DELETE `/employees/:employeeId/education/:id` - remove
- [ ] **TEST**: Education CRUD works

### 3.2.5 Employee Work Experience Module
- [ ] Create `packages/api/src/modules/employee-work-experience/` directory
- [ ] Create module, controller, service, DTOs
- [ ] POST `/employees/:employeeId/work-experience` - add experience
- [ ] GET `/employees/:employeeId/work-experience` - list experience
- [ ] PUT `/employees/:employeeId/work-experience/:id` - update
- [ ] DELETE `/employees/:employeeId/work-experience/:id` - remove
- [ ] **TEST**: Work experience CRUD works

### 3.2.6 Employee Family Module
- [ ] Create `packages/api/src/modules/employee-family/` directory
- [ ] Create module, controller, service, DTOs
- [ ] POST `/employees/:employeeId/family` - add family member
- [ ] GET `/employees/:employeeId/family` - list family
- [ ] PUT `/employees/:employeeId/family/:id` - update
- [ ] DELETE `/employees/:employeeId/family/:id` - remove
- [ ] Handle spouse info when marital status = MARRIED
- [ ] **TEST**: Family CRUD works

### 3.2.7 Employee Documents Module
- [ ] Create `packages/api/src/modules/employee-documents/` directory
- [ ] Create module, controller, service, DTOs
- [ ] POST `/employees/:employeeId/documents` - upload document
- [ ] GET `/employees/:employeeId/documents` - list documents
- [ ] GET `/employees/:employeeId/documents/:id/download` - download
- [ ] DELETE `/employees/:employeeId/documents/:id` - soft delete
- [ ] Store files on disk, metadata in DB
- [ ] **TEST**: Document upload/download works

---

## 3.3 Employee Photos Module

### 3.3.1 Create Photo Processing Service
- [ ] Create `packages/api/src/modules/file-storage/` directory
- [ ] Create `file-storage.module.ts`
- [ ] Create `file-storage.service.ts` - file storage operations
- [ ] Create `services/image-processor.service.ts`
- [ ] Implement thumbnail generation (100x100, 400x400, 800x800)
- [ ] Implement SHA-256 hash calculation
- [ ] **TEST**: Images process correctly

### 3.3.2 Create Employee Photos Module
- [ ] Create `packages/api/src/modules/employee-photos/` directory
- [ ] Create module, controller, service, DTOs
- [ ] Implement `uploadPhoto(employeeId, file, captureMethod)`
- [ ] Implement `approvePhoto(photoId)` - supervisors only
- [ ] Implement `rejectPhoto(photoId, reason)`
- [ ] Implement `getActivePhoto(employeeId)`
- [ ] Implement `getPhotoHistory(employeeId)`
- [ ] **TEST**: Photo upload works

### 3.3.3 Implement Photo Controller
- [ ] POST `/employees/:employeeId/photos/capture` - camera capture (auto-approve)
- [ ] POST `/employees/:employeeId/photos/upload` - file upload (needs approval)
- [ ] GET `/employees/:employeeId/photos/current` - get current active photo
- [ ] GET `/employees/:employeeId/photos/history` - get photo history
- [ ] GET `/photos/pending` - list pending approvals (supervisor)
- [ ] POST `/photos/:id/approve` - approve uploaded photo
- [ ] POST `/photos/:id/reject` - reject with reason
- [ ] **TEST**: Full photo workflow works

---

## 3.4 Employee Transfer Service

### 3.4.1 Create Transfer Service
- [ ] Create `services/employee-transfer.service.ts`
- [ ] Implement `requestInternalTransfer(dto)` - within center
- [ ] Implement `requestExternalTransfer(dto)` - between centers (HQ approval)
- [ ] Implement `approveTransfer(transferId, approverId)`
- [ ] Implement `executeTransfer(transferId)` - update employee center
- [ ] **TEST**: Transfer workflow works

### 3.4.2 Create Transfer DTOs
- [ ] Create `transfer-employee.dto.ts`
- [ ] Include: employeeId, fromCenterId, toCenterId, transferType, reason
- [ ] **TEST**: DTO validates correctly

---

# PHASE 4: LEAVE MANAGEMENT (Module 2)

## 4.1 Leave Module Structure

### 4.1.1 Create Leave Module
- [ ] Create `packages/api/src/modules/leave/` directory
- [ ] Create `leave.module.ts`
- [ ] Create `controllers/` directory
- [ ] Create `services/` directory
- [ ] Create `repositories/` directory
- [ ] Create `dto/` directory
- [ ] **TEST**: Module compiles

### 4.1.2 Create Leave DTOs
- [ ] Create `dto/index.ts`
- [ ] Create `create-leave-type.dto.ts`
- [ ] Create `create-leave-request.dto.ts`
- [ ] Create `approve-leave.dto.ts`
- [ ] Create `reject-leave.dto.ts`
- [ ] Create `leave-filter.dto.ts`
- [ ] Create `adjust-balance.dto.ts`
- [ ] Create `leave-response.dto.ts`
- [ ] **TEST**: DTOs validate correctly

---

## 4.2 Leave Types Management

### 4.2.1 Implement Leave Types Service
- [ ] Create `services/leave-types.service.ts`
- [ ] Implement `create(tenantId, dto)`
- [ ] Implement `findAll(tenantId)`
- [ ] Implement `findOne(tenantId, id)`
- [ ] Implement `update(tenantId, id, dto)`
- [ ] Implement `deactivate(tenantId, id)`
- [ ] Implement `getApplicableTypes(employeeType, gender)` - filter by applicability
- [ ] **TEST**: Leave types CRUD works

### 4.2.2 Implement Leave Types Controller
- [ ] Create `controllers/leave-types.controller.ts`
- [ ] POST `/leave-types` - create leave type
- [ ] GET `/leave-types` - list all
- [ ] GET `/leave-types/applicable` - get types applicable to current user
- [ ] GET `/leave-types/:id` - get single
- [ ] PATCH `/leave-types/:id` - update
- [ ] DELETE `/leave-types/:id` - deactivate
- [ ] **TEST**: API endpoints work

---

## 4.3 Leave Calculation Engine

### 4.3.1 Create Leave Calculation Service
- [ ] Create `services/leave-calculation.service.ts`
- [ ] Implement `calculateWorkingDays(startDate, endDate, employeeId)`
  - Count calendar days
  - Exclude weekends (for regular employees)
  - Exclude holidays (for regular employees)
  - Shift workers: count ALL days
- [ ] Implement `getHolidaysInPeriod(startDate, endDate)`
- [ ] Implement `isShiftWorker(employeeId)`
- [ ] Implement `calculateBalanceAfterRequest(employeeId, leaveTypeId, days)`
- [ ] **TEST**: Working days calculate correctly
- [ ] **TEST**: Shift worker exception works

### 4.3.2 Implement FIFO Balance Tracking
- [ ] Implement `deductFromBalance(employeeId, leaveTypeId, days)`
  - Use FIFO (oldest balance first)
  - Track source year for each deduction
- [ ] Implement `calculateCarryOver(employeeId, leaveTypeId, year)`
  - Apply max carry-over cap
  - Set 5-year expiry
- [ ] Implement `processExpiredBalances(tenantId, date)`
  - Mark expired days
  - Generate warnings (30, 15, 7 days before)
- [ ] **TEST**: FIFO deduction works correctly

---

## 4.4 Leave Balances Management

### 4.4.1 Implement Leave Balances Service
- [ ] Create `services/leave-balances.service.ts`
- [ ] Implement `initializeBalance(employeeId, leaveTypeId, year)` - yearly allocation
- [ ] Implement `getBalance(employeeId, leaveTypeId, year)`
- [ ] Implement `getAllBalances(employeeId, year)`
- [ ] Implement `adjustBalance(employeeId, leaveTypeId, adjustment, reason)`
- [ ] Implement `getBalanceDetails(employeeId, leaveTypeId)` - breakdown by source year
- [ ] **TEST**: Balance operations work

### 4.4.2 Implement Leave Balances Controller
- [ ] Create `controllers/leave-balances.controller.ts`
- [ ] GET `/leave-balances/me` - current user balances
- [ ] GET `/employees/:employeeId/leave-balances` - employee balances (HR)
- [ ] GET `/employees/:employeeId/leave-balances/:leaveTypeId/details` - FIFO breakdown
- [ ] POST `/employees/:employeeId/leave-balances/adjust` - adjust balance (HR)
- [ ] **TEST**: API endpoints work

---

## 4.5 Leave Requests Workflow

### 4.5.1 Implement Leave Requests Service
- [ ] Create `services/leave-requests.service.ts`
- [ ] Implement `create(employeeId, dto)`
  - Validate balance
  - Calculate working days
  - Check notice period
  - Save as DRAFT or PENDING
- [ ] Implement `submit(requestId)`
- [ ] Implement `approve(requestId, approverId)`
  - Deduct from balance
  - Generate permit if leaving city
- [ ] Implement `reject(requestId, rejectorId, reason)`
- [ ] Implement `cancel(requestId, employeeId)`
- [ ] Implement `findMyRequests(employeeId, filters)`
- [ ] Implement `findTeamRequests(supervisorId, filters)`
- [ ] Implement `findPendingApprovals(approverId)`
- [ ] **TEST**: Full workflow works

### 4.5.2 Implement Leave Interruption
- [ ] Implement `interruptLeave(requestId, sickLeaveRequestId)`
  - Calculate days used before sick
  - Return unused annual days to balance
  - Mark original as interrupted
- [ ] **TEST**: Example: 10 days annual, sick day 5-8 = 6 annual used, 4 returned

### 4.5.3 Implement Leave Requests Controller
- [ ] Create `controllers/leave-requests.controller.ts`
- [ ] POST `/leave-requests` - create request
- [ ] POST `/leave-requests/:id/submit` - submit for approval
- [ ] POST `/leave-requests/:id/approve` - approve
- [ ] POST `/leave-requests/:id/reject` - reject
- [ ] POST `/leave-requests/:id/cancel` - cancel
- [ ] GET `/leave-requests/me` - my requests
- [ ] GET `/leave-requests/team` - team requests (supervisor)
- [ ] GET `/leave-requests/pending` - pending approvals
- [ ] GET `/leave-requests/:id` - single request
- [ ] **TEST**: All endpoints work

---

## 4.6 Leave Permit Generation

### 4.6.1 Implement Leave Permit Service
- [ ] Create `services/leave-permit.service.ts`
- [ ] Implement `generatePermit(requestId)`
  - Generate permit number
  - Include employee photo & details
  - Include leave type, dates, destination
  - Include approver signature area
- [ ] Implement `getPermit(requestId)`
- [ ] Implement `downloadPermitPdf(requestId)`
- [ ] **TEST**: Permit generates correctly

---

# PHASE 5: HOLIDAY MANAGEMENT (Module 3)

## 5.1 Holiday Module

### 5.1.1 Create Holiday Module
- [ ] Create `packages/api/src/modules/holidays/` directory
- [ ] Create `holidays.module.ts`
- [ ] Create `holidays.controller.ts`
- [ ] Create `holidays.service.ts`
- [ ] Create `dto/` directory
- [ ] **TEST**: Module compiles

### 5.1.2 Create Holiday DTOs
- [ ] Create `create-holiday.dto.ts`
- [ ] Create `update-holiday.dto.ts`
- [ ] Create `holiday-response.dto.ts`
- [ ] **TEST**: DTOs validate correctly

### 5.1.3 Implement Holidays Service
- [ ] Implement `create(tenantId, dto)`
- [ ] Implement `findAll(tenantId, year)`
- [ ] Implement `findOne(tenantId, id)`
- [ ] Implement `update(tenantId, id, dto)`
- [ ] Implement `remove(tenantId, id)`
- [ ] Implement `getHolidaysInRange(tenantId, startDate, endDate)`
- [ ] Implement `isHoliday(tenantId, date)`
- [ ] Implement `importEthiopianHolidays(tenantId, year)`
- [ ] **TEST**: Holiday CRUD works

### 5.1.4 Ethiopian Calendar Support
- [ ] Implement Ethiopian date conversion utilities
- [ ] Handle recurring Ethiopian calendar holidays
- [ ] Store Ethiopian month/day for recurring
- [ ] Calculate Gregorian date for given year
- [ ] **TEST**: Ethiopian holidays convert correctly

### 5.1.5 Implement Holidays Controller
- [ ] POST `/holidays` - create holiday
- [ ] GET `/holidays` - list holidays (year filter)
- [ ] GET `/holidays/calendar` - calendar view
- [ ] GET `/holidays/:id` - get single
- [ ] PATCH `/holidays/:id` - update
- [ ] DELETE `/holidays/:id` - remove
- [ ] POST `/holidays/import-ethiopian` - import Ethiopian holidays
- [ ] **TEST**: All endpoints work

---

# PHASE 6-12: REMAINING MODULES

## Phase 6: Appraisal & Disciplinary (Module 4)
- [ ] Appraisal Periods CRUD
- [ ] Appraisal Criteria CRUD
- [ ] Appraisal Form (with disciplinary check)
- [ ] Disciplinary Records (Article 30, 31)
- [ ] Investigations tracking
- [ ] Eligibility calculation service
- [ ] Promotion workflow

## Phase 7: Salary Management (Module 5)
- [ ] Military salary scale management
- [ ] Salary steps per rank (9 steps)
- [ ] 2-year automatic increment check
- [ ] Step increment processing
- [ ] Salary history tracking
- [ ] Civilian basic salary management

## Phase 8: Attendance & Shift (Module 6)
- [ ] Shift definitions CRUD
- [ ] Work schedule types (Regular, Shift 24)
- [ ] Shift assignments
- [ ] Attendance recording (Manual)
- [ ] Clock in/out endpoints
- [ ] Biometric-ready structure
- [ ] Attendance reports

## Phase 9: Inventory Management (Module 7)
- [ ] Inventory categories CRUD (Weapons, Equipment, Uniforms)
- [ ] Item types CRUD
- [ ] Item assignment workflow
- [ ] Item return workflow
- [ ] Retirement clearance integration
- [ ] Lost/damaged tracking

## Phase 10: Retirement Management (Module 9)
- [ ] Retirement eligibility rules (50/52/55 by rank)
- [ ] Automatic retirement calculation
- [ ] Retirement dashboard (upcoming)
- [ ] Retirement initiation workflow
- [ ] Clearance checklist tracking
- [ ] Retirement completion

## Phase 11: Rewards & Complaints (Modules 10, 11)
- [ ] Reward milestones CRUD
- [ ] Eligibility checking (Article 31 = disqualified)
- [ ] Investigation postponement (2 years)
- [ ] Service reward processing
- [ ] Complaint types CRUD
- [ ] Complaint submission workflow
- [ ] Investigation tracking

## Phase 12: Documents, Reports, Audit, Dashboard (Modules 12-17)
- [ ] Document types CRUD
- [ ] Incoming/Outgoing document tracking
- [ ] Employee reports
- [ ] Leave reports
- [ ] Attendance reports
- [ ] Audit log service
- [ ] Audit viewer
- [ ] Dashboard statistics
- [ ] Role-based dashboards
- [ ] Notification system

---

# Testing Checklist

## Unit Tests
- [ ] All services have unit tests
- [ ] All repositories have unit tests
- [ ] Utility functions have unit tests
- [ ] DTOs validate correctly

## Integration Tests
- [ ] Auth flow works end-to-end
- [ ] Employee registration flow works
- [ ] Leave request workflow works
- [ ] Multi-tenant isolation works
- [ ] Role-based access works

## E2E Tests
- [ ] Full user journey: Login -> Register Employee -> Request Leave -> Approve
- [ ] Photo upload and approval flow
- [ ] Retirement clearance flow

---

# Progress Tracking

| Phase | Status | Completion % |
|-------|--------|--------------|
| Phase 0: Foundation | Not Started | 0% |
| Phase 1: Authentication | Not Started | 0% |
| Phase 2: Organization Core | Not Started | 0% |
| Phase 3: Employee Management | Not Started | 0% |
| Phase 4: Leave Management | Not Started | 0% |
| Phase 5: Holiday Management | Not Started | 0% |
| Phase 6-12: Remaining | Not Started | 0% |

---

**Last Updated**: [DATE]
**Total Tasks**: 200+
**Completed**: 0
