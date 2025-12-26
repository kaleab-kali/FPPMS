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
| 3 | Employee Core | Employee Registration (3 types), Addresses, Photos, Transfer | HIGH |
| 4 | Complaint/Disciplinary | Complaints, Investigations, Article 30/31 | HIGH |
| 5 | Appraisal | Periods, Criteria, Appraisals, Disciplinary Check | HIGH |
| 6 | Rewards | Milestones, Eligibility, Service Rewards | MEDIUM |
| 7 | Salary/Increment | Military Scale, Steps, 2-Year Increment | MEDIUM |
| 8 | Inventory | Categories, Items, Assignments, Clearance | MEDIUM |
| 9 | Documents | Types, Upload/Download, Tracking | MEDIUM |
| 10 | Leave Management | Types, Balances, Requests, Calendar, Holidays | MEDIUM |
| 11 | Attendance & Shift | Schedules, Shifts, Clock In/Out | LOW |
| 12 | Retirement | Eligibility, Processing, Clearance | LOW |
| 13 | Reports & Dashboard | Reports, Analytics, Audit Logs, Notifications | LOW |

---

# PHASE 0: FOUNDATION - COMPLETED

- [x] Install Core Dependencies (Prisma, NestJS Config, Validation, Passport, JWT, bcrypt, UUID)
- [x] Create Config Module (config.module.ts, app.config.ts, database.config.ts, auth.config.ts)
- [x] Initialize Prisma with PostgreSQL
- [x] Create all enums (EmployeeType, EmployeeStatus, Gender, MaritalStatus, BloodType, etc.)
- [x] Create all database tables (Tenant, Center, User, Role, Employee, Leave, etc.)
- [x] Create Database Module (prisma.service.ts)
- [x] Create Common Module (decorators, guards, interceptors, filters, pipes, middleware, utils)

---

# PHASE 1: AUTHENTICATION - COMPLETED

- [x] Create Auth Module (auth.module.ts, auth.controller.ts, auth.service.ts)
- [x] Create Auth DTOs (login.dto.ts, change-password.dto.ts, reset-password.dto.ts, login-response.dto.ts, refresh-token.dto.ts)
- [x] Create Auth Strategies (local.strategy.ts, jwt.strategy.ts)
- [x] Implement Auth Service (validateUser, login, changePassword, resetPassword, checkAccountLock)
- [x] Implement Auth Controller (POST /auth/login, /logout, /change-password, /reset-password/:userId, /refresh, GET /me)
- [x] LocalAuthGuard, JwtAuthGuard
- [x] Frontend Login Page (LoginPage.tsx)
- [x] Refresh Token System (RefreshToken model, token rotation, automatic refresh)
- [x] Session Management (device tracking, IP/user-agent logging)
- [x] Inactivity Timeout (15-minute warning dialog, auto-logout)
- [x] Force Password Change on First Login (mustChangePassword flag, ChangePasswordPage.tsx)
- [x] Deactivated User Login Message (proper error handling for inactive users)
- [x] Permission Auto-Discovery System (PermissionDiscoveryService scans controllers on startup)
- [x] Permission Version Tracking (permissionVersion field, forces re-login on permission changes)
- [x] Convert all controllers from @Roles to @Permissions decorator

---

# PHASE 2: ORGANIZATION CORE - COMPLETED

### Backend
- [x] Tenants Module (CRUD)
- [x] Centers Module (CRUD)
- [x] Lookups Module (Regions, SubCities, Woredas with cascading)
- [x] Military Ranks Module (with salary steps, retirement age 50/52/55)
- [x] Departments Module (with parent-child hierarchy)
- [x] Positions Module (CRUD)
- [x] Users Module (CRUD)
- [x] Roles Module (with permissions)
- [x] Permissions Module
- [x] Database Seeds (tenants, roles, permissions, military-ranks, regions, users)
- [x] Comprehensive Seeds (centers, departments, positions, employees, leave-types, holidays)

### Frontend
- [x] Tenants management pages (TenantsListPage, TenantFormDialog)
- [x] Centers management pages (CentersListPage, CenterFormDialog)
- [x] Lookups management pages (RegionsListPage, SubCitiesListPage, WoredasListPage)
- [x] Ranks management pages (RanksListPage, RankFormDialog)
- [x] Departments management pages (DepartmentsListPage, DepartmentFormDialog)
- [x] Positions management pages (PositionsListPage, PositionFormDialog)
- [x] Users management pages (UsersListPage, UserFormDialog)
- [x] User Status Management (activate/deactivate with dialog, UserStatusChangeDialog.tsx)
- [x] User Creation from Employee (auto-generated credentials, employee selection)
- [x] Roles management pages (RolesListPage, RoleFormDialog)

---

# UI/LAYOUT - COMPLETED

- [x] Sidebar Navigation (shadcn sidebar-08 template)
  - [x] AppSidebar.tsx with collapsible menu groups
  - [x] NavUser.tsx with user dropdown (profile, settings, logout)
  - [x] Mobile responsive toggle
  - [x] Language Toggle (English/Amharic) in user dropdown
- [x] Dynamic Breadcrumb Navigation (AppLayout.tsx)
- [x] All menu structure implemented:
  - [x] Dashboard
  - [x] Organization (Departments, Positions, Centers, Tenants, Roles, Users, Ranks, Regions, Sub-Cities, Woredas)
  - [x] Employees (All, Former, Registration, Photo Capture, Medical History, Family, Marital Status, Health Records, Transfer)
  - [x] Leave (Types, Requests, Balance, Calendar, Permit)
  - [x] Holidays (List, Calendar)
  - [x] Appraisal (Reviews, Periods, Criteria, Disciplinary, Promotions)
  - [x] Salary (Scale, Increment, Payroll)
  - [x] Attendance (Clock In/Out, Records, Shifts, Overtime)
  - [x] Inventory (Weapons, Equipment, Uniforms, Assignments)
  - [x] Documents (Types, All Documents)
  - [x] Reports (Employee, Leave, Attendance, Salary)
  - [x] Settings (General, Notifications)
- [x] ComingSoonPage.tsx placeholder for unimplemented features

---

# PHASE 3: EMPLOYEE MANAGEMENT - IN PROGRESS (95%)

## 3.1 Employees Core Module - COMPLETED

### Backend
- [x] Create Employees Module Structure
- [x] Create Employee ID Generator Service (FPC-0000/YY format)
- [x] Create Employee DTOs (create-military, create-civilian, create-temporary, update, filter)
- [x] Implement Employees Service (registerMilitary, registerCivilian, registerTemporary, findAll, findOne, update)
- [x] Implement Employees Controller (POST /employees/military, /civilian, /temporary, GET, PATCH, DELETE)

### Frontend
- [x] Employee List Page with filters (EmployeesListPage.tsx)
- [x] Employee Registration Type Selection (EmployeeRegisterSelectPage.tsx)
- [x] Employee Registration Form (EmployeeRegisterFormPage.tsx)
  - [x] PersonalInfoSection
  - [x] PhysicalInfoSection
  - [x] ContactInfoSection
  - [x] IdentificationSection
  - [x] AddressSection (cascading Region/SubCity/Woreda)
  - [x] MotherInfoSection
  - [x] EmergencyContactSection
  - [x] EmploymentInfoSection
  - [x] MilitarySpecificSection
  - [x] CivilianSpecificSection
  - [x] TemporarySpecificSection
- [x] Employee Edit Page (EmployeeEditPage.tsx)
- [x] Employee Detail Page (EmployeeDetailPage.tsx)

## 3.2 Employee Status Management - COMPLETED
- [x] Change status endpoint (SUSPENDED, TERMINATED, RETIRED, DECEASED) - Backend
- [x] Return to active endpoint - Backend
- [x] Status change dialog UI (StatusChangeDialog.tsx)
- [x] Former employees page (FormerEmployeesPage.tsx)
- [x] Former employees navigation in sidebar

## 3.3 Employee Direct Superior Module - COMPLETED
- [x] Add `directSuperiorId` field to Employee model (nullable, self-reference)
- [x] Add `directSuperior` relation (Employee -> Employee)
- [x] Add `subordinates` relation (Employee[] for reverse lookup)
- [x] Add `@@index([directSuperiorId])` for performance
- [x] Create Employee Superior Service (assign, remove, getSubordinates, getOrgChart)
- [x] Create Employee Superior Controller (CRUD endpoints)
- [x] Create Employee Superior DTOs
- [x] Frontend DirectSuperiorPage.tsx with list and org chart views
- [x] Frontend API layer (queries, mutations)
- [x] Bulk assign functionality

## 3.4 Employee Sub-Modules - IN PROGRESS (60%)

### Backend - COMPLETED
- [x] Employee Addresses Module (CRUD with cascading validation)
- [x] Employee Mother Info Module
- [x] Employee Emergency Contacts Module
- [x] Employee Education Module (multiple entries)
- [x] Employee Work Experience Module (multiple entries)
- [x] Employee Family Module (spouse, children, dependents)
- [x] Employee Marital Status Module (status history tracking)
- [x] Employee Medical Records Module (health records)

### Frontend - COMPLETED
- [x] Employee Photo Page (EmployeePhotoPage.tsx)
- [x] Employee Family Page (EmployeeFamilyPage.tsx)
- [x] Employee Medical History Page (EmployeeMedicalHistoryPage.tsx)
- [x] Employee Marital Status Page (EmployeeMaritalStatusPage.tsx)
- [x] Employee Transfer Page (EmployeeTransferPage.tsx)

### Pending
- [ ] Employee Documents Module (upload/download) - Backend
- [ ] Document upload UI in profile page

## 3.5 Employee Photos Module - COMPLETED
- [x] Photo upload endpoint with validation (10MB max)
- [x] Photo listing endpoint (active photo, history)
- [x] Photo file streaming endpoint with caching
- [x] Photo Processing Service (SHA-256 hash, tenant-scoped storage)
- [x] Soft delete with audit trail
- [x] Frontend Photo Page (EmployeePhotoPage.tsx)
- [x] Webcam capture with getUserMedia API
- [x] File upload with drag-and-drop
- [x] Image preview and retake functionality
- [x] React Query integration (queries, mutations)
- [x] Role-based access control
- [x] Unit tests for photo service

## 3.6 Employee Transfer Service - COMPLETED
- [x] Create Transfer Service (two-step workflow)
- [x] Create Transfer DTOs (request, accept, reject, cancel)
- [x] Transfer Request endpoints (create, accept, reject, cancel)
- [x] Departure Management (create, update, delete/reinstate)
- [x] Frontend Transfer Request pages
- [x] Role-based access (IT_ADMIN, HQ_ADMIN, HR_DIRECTOR, CENTER_ADMIN)

## 3.7 Profile Downloads - NOT STARTED
- [ ] Full Profile PDF generation
- [ ] Employment Profile PDF (mini)

---

# PHASE 4: COMPLAINT/DISCIPLINARY - NOT STARTED

### 4.1 Complaint Module
- [ ] Complaint Types CRUD (categories of complaints)
- [ ] Complaint submission workflow
- [ ] Complaint assignment (to investigator)
- [ ] Complaint status tracking (SUBMITTED, UNDER_REVIEW, INVESTIGATING, RESOLVED, DISMISSED)
- [ ] Complaint resolution with outcome

### 4.2 Investigation Module
- [ ] Investigation CRUD (link to complaint)
- [ ] Investigation workflow (NOT_STARTED, IN_PROGRESS, COMPLETED_CLEARED, COMPLETED_GUILTY, SUSPENDED)
- [ ] Case number generation
- [ ] Investigation outcome recording
- [ ] Link to resulting disciplinary record

### 4.3 Disciplinary Records Module
- [ ] Disciplinary Record CRUD
- [ ] Article 30 (Minor violations) - score deduction
- [ ] Article 31 (Major violations) - disqualification
- [ ] Penalty tracking (JSON array)
- [ ] Status management (ACTIVE, EXPIRED, REVOKED)
- [ ] Impact flags (impactsAppraisal, impactsReward)
- [ ] Document attachment support

### Frontend
- [ ] Complaint submission page
- [ ] Complaint list/management page
- [ ] Investigation management page
- [ ] Disciplinary records page
- [ ] Employee disciplinary history view

---

# PHASE 5: APPRAISAL - NOT STARTED

### 5.1 Appraisal Setup
- [ ] Appraisal Periods CRUD (fiscal year periods)
- [ ] Appraisal Criteria CRUD (evaluation criteria with weights)
- [ ] Criteria categories management

### 5.2 Appraisal Process
- [ ] Appraisal Form with criteria rating
- [ ] Automatic disciplinary check (Article 30/31)
- [ ] Article 31 = Auto-Ineligible
- [ ] Article 30 = Apply score deduction
- [ ] Final score calculation (out of 100)
- [ ] Appraisal submission and approval workflow
- [ ] Appraisal history tracking

### 5.3 Promotions (if time permits)
- [ ] Rank History tracking
- [ ] Promotion eligibility check
- [ ] Promotion workflow

### Frontend
- [ ] Appraisal periods management page
- [ ] Appraisal criteria management page
- [ ] Appraisal form page
- [ ] Employee appraisal history view

---

# PHASE 6: REWARDS - NOT STARTED

### 6.1 Reward Setup
- [ ] Reward Milestones CRUD (years of service thresholds)
- [ ] Reward types configuration
- [ ] Monetary value settings

### 6.2 Reward Processing
- [ ] Service years calculation
- [ ] Eligibility checking workflow:
  - [ ] Article 31 Active = DISQUALIFIED (automatic)
  - [ ] Under Investigation = POSTPONED (2-year extension)
  - [ ] Article 30 Active = Review required
- [ ] Service reward issuance
- [ ] Reward history tracking

### Frontend
- [ ] Reward milestones management page
- [ ] Eligible employees list page
- [ ] Reward processing page
- [ ] Employee reward history view

---

# PHASE 7: SALARY/INCREMENT - NOT STARTED

### 7.1 Salary Scale
- [ ] Military salary scale management (16 ranks, 9 steps)
- [ ] Salary step configuration
- [ ] Civilian basic salary management

### 7.2 Increment Processing
- [ ] 2-year automatic increment eligibility check
- [ ] Step increment processing
- [ ] Salary history tracking
- [ ] Increment approval workflow

### Frontend
- [ ] Salary scale management page
- [ ] Increment processing page
- [ ] Employee salary history view

---

# PHASE 8: INVENTORY - NOT STARTED

### 8.1 Inventory Setup
- [ ] Inventory categories CRUD (Weapons, Equipment, Uniforms)
- [ ] Item types CRUD
- [ ] Item registration

### 8.2 Item Management
- [ ] Item assignment workflow
- [ ] Item return workflow
- [ ] Lost/damaged tracking
- [ ] Retirement clearance integration

### Frontend
- [ ] Inventory categories page
- [ ] Item types page
- [ ] Item assignment page
- [ ] Employee inventory view

---

# PHASE 9: DOCUMENTS - NOT STARTED

### 9.1 Document Setup
- [ ] Document types CRUD
- [ ] Document categories

### 9.2 Document Management
- [ ] Document upload/download
- [ ] Incoming/Outgoing document tracking
- [ ] Document reference number generation
- [ ] Document search and filtering

### Frontend
- [ ] Document types management page
- [ ] Document upload page
- [ ] Document list/search page
- [ ] Employee documents view

---

# PHASE 10: LEAVE MANAGEMENT - IN PROGRESS (10%)

### 10.1 Leave Setup
- [x] Leave Types Seed Data (10 types: Annual, Sick, Maternity, Paternity, etc.)
- [x] Holiday Seed Data (13 Ethiopian holidays for 2025)
- [ ] Leave Types CRUD
- [ ] Holiday CRUD
- [ ] Ethiopian Calendar Support

### 10.2 Leave Processing
- [ ] Leave Calculation Engine (working days, holidays, shift workers)
- [ ] FIFO Balance Tracking (5-year expiry)
- [ ] Leave Balances Management
- [ ] Leave Requests Workflow (create, submit, approve, reject, cancel)
- [ ] Leave Interruption (sick during annual)
- [ ] Leave Permit Generation

### Frontend
- [ ] Leave Types Management pages
- [ ] Holiday Management page
- [ ] Leave Balance pages
- [ ] Leave Request pages
- [ ] Leave Calendar View
- [ ] Holiday Calendar view

---

# PHASE 11: ATTENDANCE & SHIFT - NOT STARTED

- [ ] Shift definitions CRUD
- [ ] Work schedule types (Regular 8hr, Shift 24hr)
- [ ] Shift assignments
- [ ] Attendance recording (Manual clock in/out)
- [ ] Biometric-ready structure (future)
- [ ] Attendance reports

---

# PHASE 12: RETIREMENT - NOT STARTED

- [ ] Retirement eligibility rules (50/52/55 by rank)
- [ ] Automatic retirement calculation
- [ ] Retirement dashboard (upcoming)
- [ ] Retirement initiation workflow
- [ ] Clearance checklist tracking
- [ ] Retirement completion

---

# PHASE 13: REPORTS & DASHBOARD - NOT STARTED

- [ ] Employee reports
- [ ] Leave reports
- [ ] Attendance reports
- [ ] Salary reports
- [ ] Audit log service
- [ ] Dashboard statistics
- [ ] Notification system

---

# Progress Tracking

| Phase | Status | Completion % |
|-------|--------|--------------|
| Phase 0: Foundation | Completed | 100% |
| Phase 1: Authentication | Completed | 100% |
| Phase 2: Organization Core | Completed | 100% |
| UI/Layout | Completed | 100% |
| Phase 3: Employee Management | Completed | 98% |
| Phase 4: Complaint/Disciplinary | In Progress | 5% |
| Phase 5: Appraisal | Not Started | 0% |
| Phase 6: Rewards | Not Started | 0% |
| Phase 7: Salary/Increment | Not Started | 0% |
| Phase 8: Inventory | Not Started | 0% |
| Phase 9: Documents | Not Started | 0% |
| Phase 10: Leave Management | In Progress | 10% |
| Phase 11: Attendance & Shift | Not Started | 0% |
| Phase 12: Retirement | Not Started | 0% |
| Phase 13: Reports & Dashboard | Not Started | 0% |

---

## Current Implementation Order

Based on module dependencies:

1. **Phase 4: Complaint/Disciplinary** - Foundation for appraisal and rewards
2. **Phase 5: Appraisal** - Uses disciplinary records for eligibility
3. **Phase 6: Rewards** - Uses Article 31 for disqualification
4. **Phase 7: Salary/Increment** - Uses appraisal results
5. **Phase 8: Inventory** - Needed for retirement clearance
6. **Phase 9: Documents** - Support module
7. **Phase 10: Leave Management** - Complex module, last priority

---

**Last Updated**: 2025-12-26
**Total Tasks**: 200+
**Completed**: ~145
