# EPPMS Database Architecture (Updated)

## Enterprise-Grade PostgreSQL + Prisma ORM Design

---

# 1. Architecture Overview

## 1.1 Design Principles

| Principle | Implementation |
|-----------|----------------|
| **Multi-Tenancy** | `tenantId` on every table + Row-Level Security |
| **Soft Delete** | `deletedAt` timestamp (never hard delete) |
| **Audit Trail** | `createdAt`, `updatedAt`, `createdBy`, `updatedBy` on all tables |
| **Bilingual** | `name` + `nameAm` columns for Amharic |
| **UUID Keys** | All primary keys are UUIDs (cuid() in Prisma) |
| **Security First** | Password hashing, sensitive data encryption |
| **Image Storage** | File system + database metadata (enterprise pattern) |
| **Statistics Optimization** | Materialized views + stats tables |
| **Ethiopian Calendar** | Store Gregorian, compute Ethiopian via functions |

## 1.2 Database Schemas

\`\`\`
eppms_db
├── public          → Main application tables
├── audit           → Immutable audit logs (partitioned by month)
├── stats           → Pre-computed statistics tables (refreshed by jobs)
├── files           → File metadata (actual files on disk storage)
└── archive         → Historical/retired employee data
\`\`\`

## 1.3 File Storage Architecture (Enterprise-Grade)

\`\`\`
/data/eppms/                          # Storage root (configurable)
├── photos/                           # Employee photos
│   └── {tenantId}/
│       └── {employeeId}/
│           ├── {uuid}_original.jpg   # Original upload
│           ├── {uuid}_large.jpg      # 800x800 (for profile)
│           ├── {uuid}_medium.jpg     # 400x400 (for lists)
│           └── {uuid}_thumb.jpg      # 100x100 (for thumbnails)
├── documents/                        # Document scans
│   └── {tenantId}/
│       ├── employees/                # Employee personal documents
│       │   └── {employeeId}/
│       └── official/                 # Official documents (incoming/outgoing)
├── certificates/                     # Education certificates, rewards
│   └── {tenantId}/
│       └── {employeeId}/
├── temp/                             # Temporary uploads (cleaned daily)
└── backup/                           # File backups
\`\`\`

### File Storage Rules:
1. **NEVER store files in database** - Only metadata
2. Files organized by tenant/employee for isolation
3. Generate thumbnails on upload for photos
4. Store SHA-256 hash for integrity verification
5. Daily cleanup of temp folder
6. Regular backups to separate location

## 1.4 Statistics Optimization Strategy

\`\`\`
┌─────────────────────────────────────────────────────────────────┐
│                 STATISTICS ARCHITECTURE                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐       │
│  │   Triggers   │───▶│  stats.*     │◀───│  Cron Jobs   │       │
│  │ (Real-time)  │    │  Tables      │    │ (Scheduled)  │       │
│  └──────────────┘    └──────────────┘    └──────────────┘       │
│                             │                                    │
│                             ▼                                    │
│                    ┌──────────────┐                             │
│                    │  Dashboard   │                             │
│                    │   Queries    │                             │
│                    └──────────────┘                             │
│                                                                  │
│  Update Frequency:                                               │
│  • Employee counts: Real-time (trigger on INSERT/DELETE)         │
│  • Leave stats: Every hour                                       │
│  • Attendance stats: End of day                                  │
│  • Retirement projections: Daily                                 │
│  • Full refresh: Weekly (off-peak hours)                         │
└─────────────────────────────────────────────────────────────────┘
\`\`\`

---

# 2. Table Categories Overview

\`\`\`
┌─────────────────────────────────────────────────────────────────┐
│                     CORE TABLES (~10)                            │
├─────────────────────────────────────────────────────────────────┤
│  tenants, centers, users, roles, permissions, user_roles,        │
│  role_permissions, login_history, sessions                       │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   ORGANIZATION TABLES (~10)                      │
├─────────────────────────────────────────────────────────────────┤
│  departments, positions, military_ranks, military_rank_steps,    │
│  regions, sub_cities, woredas, work_schedules, shift_definitions,│
│  education_levels, relationship_types                            │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    EMPLOYEE TABLES (~15)                         │
├─────────────────────────────────────────────────────────────────┤
│  employees, employee_addresses, employee_mother_info,            │
│  employee_emergency_contacts, employee_education,                │
│  employee_work_experience, employee_photos, employee_rank_history│
│  employee_salary_history, employee_family_members,               │
│  employee_medical_dependents, employee_documents                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    MODULE TABLES (~25)                           │
├─────────────────────────────────────────────────────────────────┤
│  LEAVE: leave_types, employee_leave_balances, leave_balance_     │
│         details, leave_requests, leave_approval_history          │
│  HOLIDAY: holidays                                               │
│  APPRAISAL: appraisal_periods, appraisal_criteria, appraisals,  │
│             appraisal_ratings                                    │
│  DISCIPLINARY: disciplinary_records, investigations              │
│  REWARDS: reward_milestones, service_rewards                     │
│  RETIREMENT: retirements, retirement_clearances                  │
│  ATTENDANCE: shift_assignments, attendance_records               │
│  INVENTORY: inventory_categories, inventory_item_types,          │
│             inventory_assignments                                │
│  DOCUMENTS: document_types, documents                            │
│  COMPLAINTS: complaint_types, complaints, complaint_notes        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   AUDIT & STATS TABLES (~10)                     │
├─────────────────────────────────────────────────────────────────┤
│  audit.logs (partitioned), audit.data_changes                    │
│  stats.employee_counts, stats.leave_summary, stats.attendance_   │
│  summary, stats.retirement_projections, stats.department_stats   │
└─────────────────────────────────────────────────────────────────┘

TOTAL: ~70 Tables
\`\`\`

---

# 3. Prisma Schema

## 3.1 Configuration

\`\`\`prisma
// prisma/schema.prisma

generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["fullTextSearch", "multiSchema", "postgresqlExtensions"]
}

datasource db {
  provider   = "postgresql"
  url        = env("DATABASE_URL")
  extensions = [pgcrypto, uuid_ossp]
  schemas    = ["public", "audit", "stats", "files"]
}
\`\`\`

## 3.2 Enums

\`\`\`prisma
// ============================================================================
// ENUMS
// ============================================================================

enum EmployeeType {
  MILITARY
  CIVILIAN
  TEMPORARY
}

enum EmployeeStatus {
  ACTIVE
  INACTIVE
  ON_LEAVE
  SUSPENDED
  RETIRED
  TERMINATED
  DECEASED
}

enum Gender {
  MALE
  FEMALE
}

enum MaritalStatus {
  SINGLE
  MARRIED
  DIVORCED
  WIDOWED
}

enum BloodType {
  A_POSITIVE
  A_NEGATIVE
  B_POSITIVE
  B_NEGATIVE
  AB_POSITIVE
  AB_NEGATIVE
  O_POSITIVE
  O_NEGATIVE
}

enum WorkScheduleType {
  REGULAR
  SHIFT_24
}

enum UserStatus {
  ACTIVE
  INACTIVE
  LOCKED
  PENDING
}

enum LeaveRequestStatus {
  DRAFT
  PENDING
  APPROVED
  REJECTED
  CANCELLED
}

enum AppraisalStatus {
  DRAFT
  IN_PROGRESS
  SUBMITTED
  REVIEWED
  APPROVED
  REJECTED
}

enum RetirementStatus {
  PENDING
  IN_PROGRESS
  CLEARANCE
  COMPLETED
  CANCELLED
}

enum ClearanceStatus {
  PENDING
  CLEARED
  ISSUES
  WAIVED
}

enum DisciplinaryType {
  ARTICLE_30
  ARTICLE_31
}

enum DisciplinaryStatus {
  ACTIVE
  EXPIRED
  REVOKED
}

enum InvestigationStatus {
  NOT_STARTED
  IN_PROGRESS
  COMPLETED_CLEARED
  COMPLETED_GUILTY
  SUSPENDED
}

enum RewardEligibility {
  ELIGIBLE
  DISQUALIFIED_ARTICLE_31
  POSTPONED_INVESTIGATION
  PENDING_REVIEW
}

enum DocumentDirection {
  INCOMING
  OUTGOING
}

enum PhotoStatus {
  PENDING_APPROVAL
  APPROVED
  REJECTED
  ACTIVE
  ARCHIVED
}

enum AuditAction {
  CREATE
  UPDATE
  DELETE
  VIEW
  LOGIN
  LOGOUT
  APPROVE
  REJECT
  EXPORT
  IMPORT
}
\`\`\`

---

## 3.3 Core Tables

\`\`\`prisma
// ============================================================================
// TENANT
// ============================================================================

model Tenant {
  id            String    @id @default(cuid())
  code          String    @unique
  name          String
  nameAm        String?   @map("name_am")
  type          String    @default("CENTER")
  
  // Settings
  settings      Json      @default("{}")
  
  isActive      Boolean   @default(true) @map("is_active")
  createdAt     DateTime  @default(now()) @map("created_at")
  updatedAt     DateTime  @updatedAt @map("updated_at")
  
  @@map("tenants")
  @@index([code])
}

// ============================================================================
// CENTER (HQ and Regional Centers)
// ============================================================================

model Center {
  id            String    @id @default(cuid())
  tenantId      String    @map("tenant_id")
  
  code          String
  name          String
  nameAm        String?   @map("name_am")
  type          String    @default("CENTER")
  
  // Location
  regionId      String?   @map("region_id")
  subCityId     String?   @map("sub_city_id")
  woredaId      String?   @map("woreda_id")
  address       String?
  phone         String?
  email         String?
  
  // Hierarchy
  parentCenterId String?  @map("parent_center_id")
  commanderId   String?   @map("commander_id")
  
  isActive      Boolean   @default(true) @map("is_active")
  createdAt     DateTime  @default(now()) @map("created_at")
  updatedAt     DateTime  @updatedAt @map("updated_at")
  deletedAt     DateTime? @map("deleted_at")
  
  @@unique([tenantId, code])
  @@map("centers")
  @@index([tenantId])
  @@index([parentCenterId])
}

// ============================================================================
// USER (Only HR staff, management - NOT regular employees)
// ============================================================================

model User {
  id                    String      @id @default(cuid())
  tenantId              String      @map("tenant_id")
  centerId              String?     @map("center_id")
  employeeId            String?     @unique @map("employee_id")
  
  // Authentication
  username              String
  email                 String?
  passwordHash          String      @map("password_hash")
  passwordSalt          String      @map("password_salt")
  passwordChangedAt     DateTime?   @map("password_changed_at")
  mustChangePassword    Boolean     @default(true) @map("must_change_password")
  
  // Security
  status                UserStatus  @default(PENDING)
  failedLoginAttempts   Int         @default(0) @map("failed_login_attempts")
  lockedUntil           DateTime?   @map("locked_until")
  lastLoginAt           DateTime?   @map("last_login_at")
  lastLoginIp           String?     @map("last_login_ip")
  
  // Session (single session only)
  currentSessionId      String?     @map("current_session_id")
  sessionExpiresAt      DateTime?   @map("session_expires_at")
  
  // Audit
  createdAt             DateTime    @default(now()) @map("created_at")
  updatedAt             DateTime    @updatedAt @map("updated_at")
  createdBy             String?     @map("created_by")
  updatedBy             String?     @map("updated_by")
  deletedAt             DateTime?   @map("deleted_at")
  
  @@unique([tenantId, username])
  @@map("users")
  @@index([tenantId])
  @@index([tenantId, status])
  @@index([centerId])
}

// ============================================================================
// ROLE
// ============================================================================

model Role {
  id            String    @id @default(cuid())
  tenantId      String?   @map("tenant_id")
  
  code          String
  name          String
  nameAm        String?   @map("name_am")
  description   String?
  
  // Role Properties
  isSystemRole  Boolean   @default(false) @map("is_system_role")
  level         Int       @default(0)
  
  // Access Scope: ALL, OWN_CENTER, OWN_DEPARTMENT
  accessScope   String    @default("OWN_CENTER") @map("access_scope")
  
  isActive      Boolean   @default(true) @map("is_active")
  createdAt     DateTime  @default(now()) @map("created_at")
  updatedAt     DateTime  @updatedAt @map("updated_at")
  
  @@unique([tenantId, code])
  @@map("roles")
  @@index([tenantId])
  @@index([code])
}

// ============================================================================
// PERMISSION
// ============================================================================

model Permission {
  id            String    @id @default(cuid())
  
  module        String
  action        String
  resource      String
  description   String?
  
  @@unique([module, action, resource])
  @@map("permissions")
  @@index([module])
}

// ============================================================================
// ROLE_PERMISSION
// ============================================================================

model RolePermission {
  roleId        String    @map("role_id")
  permissionId  String    @map("permission_id")
  conditions    Json?     @default("{}")
  
  @@id([roleId, permissionId])
  @@map("role_permissions")
}

// ============================================================================
// USER_ROLE
// ============================================================================

model UserRole {
  userId        String    @map("user_id")
  roleId        String    @map("role_id")
  assignedAt    DateTime  @default(now()) @map("assigned_at")
  assignedBy    String?   @map("assigned_by")
  expiresAt     DateTime? @map("expires_at")
  
  @@id([userId, roleId])
  @@map("user_roles")
}
\`\`\`

---

## 3.4 Address Lookup Tables (Cascading)

\`\`\`prisma
// ============================================================================
// REGION → SUB_CITY → WOREDA (Cascading Lookups)
// ============================================================================

model Region {
  id            String    @id @default(cuid())
  tenantId      String    @map("tenant_id")
  
  code          String
  name          String
  nameAm        String    @map("name_am")
  sortOrder     Int       @default(0) @map("sort_order")
  
  isActive      Boolean   @default(true) @map("is_active")
  createdAt     DateTime  @default(now()) @map("created_at")
  updatedAt     DateTime  @updatedAt @map("updated_at")
  
  @@unique([tenantId, code])
  @@map("regions")
  @@index([tenantId])
  @@index([tenantId, isActive])
}

model SubCity {
  id            String    @id @default(cuid())
  tenantId      String    @map("tenant_id")
  regionId      String    @map("region_id")
  
  code          String
  name          String
  nameAm        String    @map("name_am")
  sortOrder     Int       @default(0) @map("sort_order")
  
  isActive      Boolean   @default(true) @map("is_active")
  createdAt     DateTime  @default(now()) @map("created_at")
  updatedAt     DateTime  @updatedAt @map("updated_at")
  
  @@unique([tenantId, code])
  @@map("sub_cities")
  @@index([tenantId])
  @@index([regionId])
  @@index([tenantId, regionId, isActive])
}

model Woreda {
  id            String    @id @default(cuid())
  tenantId      String    @map("tenant_id")
  subCityId     String    @map("sub_city_id")
  
  code          String
  name          String
  nameAm        String    @map("name_am")
  sortOrder     Int       @default(0) @map("sort_order")
  
  isActive      Boolean   @default(true) @map("is_active")
  createdAt     DateTime  @default(now()) @map("created_at")
  updatedAt     DateTime  @updatedAt @map("updated_at")
  
  @@unique([tenantId, code])
  @@map("woredas")
  @@index([tenantId])
  @@index([subCityId])
}
\`\`\`

---

## 3.5 Military Ranks & Salary Scale

\`\`\`prisma
// ============================================================================
// MILITARY RANKS WITH SALARY SCALE
// ============================================================================

model MilitaryRank {
  id            String    @id @default(cuid())
  tenantId      String?   @map("tenant_id")
  
  code          String
  name          String
  nameAm        String    @map("name_am")
  
  // Classification
  level         Int                             // 1-16
  category      String                          // ENLISTED, NCO, JUNIOR_OFFICER, SENIOR_OFFICER, COMMAND
  
  // Salary Scale (from uploaded file)
  baseSalary    Decimal   @map("base_salary") @db.Decimal(12, 2)
  ceilingSalary Decimal   @map("ceiling_salary") @db.Decimal(12, 2)
  stepCount     Int       @default(9) @map("step_count")
  stepPeriodYears Int     @default(2) @map("step_period_years")
  
  // RETIREMENT AGE BY RANK GROUP
  // Group 1 (Level 1-5): 50 years
  // Group 2 (Level 6-8): 52 years
  // Group 3 (Level 9-16): 55 years
  retirementAge Int       @map("retirement_age")
  
  // Promotion Requirements
  minYearsForPromotion Int? @map("min_years_for_promotion")
  minAppraisalScore    Int? @map("min_appraisal_score")
  
  badgePath     String?   @map("badge_path")
  sortOrder     Int       @default(0) @map("sort_order")
  
  isActive      Boolean   @default(true) @map("is_active")
  createdAt     DateTime  @default(now()) @map("created_at")
  updatedAt     DateTime  @updatedAt @map("updated_at")
  
  @@unique([tenantId, code])
  @@unique([tenantId, level])
  @@map("military_ranks")
  @@index([level])
  @@index([category])
}

// Salary steps for each rank (Base + 9 steps + Ceiling = 11 points)
model MilitaryRankSalaryStep {
  id            String    @id @default(cuid())
  rankId        String    @map("rank_id")
  
  stepNumber    Int       @map("step_number")   // 0=base, 1-9=steps, 10=ceiling
  salaryAmount  Decimal   @map("salary_amount") @db.Decimal(12, 2)
  yearsRequired Int       @map("years_required")
  
  @@unique([rankId, stepNumber])
  @@map("military_rank_salary_steps")
  @@index([rankId])
}
\`\`\`


---

## 3.6 Employee Main Table

```prisma
// ============================================================================
// EMPLOYEE (Main Table)
// ============================================================================

model Employee {
  id            String    @id @default(cuid())
  tenantId      String    @map("tenant_id")
  centerId      String?   @map("center_id")
  
  // Employee ID: FPC-000001
  employeeId    String    @unique @map("employee_id")
  employeeType  EmployeeType @map("employee_type")
  
  // Names
  firstName     String    @map("first_name")
  firstNameAm   String    @map("first_name_am")
  middleName    String    @map("middle_name")
  middleNameAm  String    @map("middle_name_am")
  lastName      String    @map("last_name")
  lastNameAm    String    @map("last_name_am")
  fullName      String    @map("full_name")       // Computed for search
  fullNameAm    String    @map("full_name_am")
  
  // Personal
  gender        Gender
  dateOfBirth   DateTime  @map("date_of_birth") @db.Date
  birthPlace    String?   @map("birth_place")
  birthPlaceAm  String?   @map("birth_place_am")
  
  // Physical
  height        Int?
  weight        Int?
  bloodType     BloodType? @map("blood_type")
  eyeColor      String?   @map("eye_color")
  hairColor     String?   @map("hair_color")
  distinguishingMarks String? @map("distinguishing_marks")
  
  // Identity
  nationality   String    @default("Ethiopian")
  ethnicity     String?
  faydaId       String?   @map("fayda_id")
  faydaVerified Boolean   @default(false) @map("fayda_verified")
  passportNumber String?  @map("passport_number")
  drivingLicense String?  @map("driving_license")
  
  // Contact
  primaryPhone  String    @map("primary_phone")
  secondaryPhone String?  @map("secondary_phone")
  email         String?
  
  // Photo
  currentPhotoId String?  @map("current_photo_id")
  
  // Employment
  departmentId  String?   @map("department_id")
  positionId    String?   @map("position_id")
  rankId        String?   @map("rank_id")
  
  employmentDate DateTime @map("employment_date") @db.Date
  originalEmploymentDate DateTime? @map("original_employment_date") @db.Date
  isTransfer    Boolean   @default(false) @map("is_transfer")
  sourceOrganization String? @map("source_organization")
  
  // Work Schedule
  workScheduleType WorkScheduleType @default(REGULAR) @map("work_schedule_type")
  
  // Marital
  maritalStatus MaritalStatus @default(SINGLE) @map("marital_status")
  marriageDate  DateTime? @map("marriage_date") @db.Date
  
  // Salary
  currentSalaryStep Int   @default(0) @map("current_salary_step")
  currentSalary Decimal?  @map("current_salary") @db.Decimal(12, 2)
  salaryEffectiveDate DateTime? @map("salary_effective_date") @db.Date
  
  // Temporary Employee Contract
  contractStartDate DateTime? @map("contract_start_date") @db.Date
  contractEndDate   DateTime? @map("contract_end_date") @db.Date
  contractAmount    Decimal?  @map("contract_amount") @db.Decimal(12, 2)
  
  // Retirement (calculated: DOB + rank retirement age)
  retirementDate DateTime? @map("retirement_date") @db.Date
  
  // Status
  status        EmployeeStatus @default(ACTIVE)
  statusChangedAt DateTime? @map("status_changed_at")
  statusReason  String?   @map("status_reason")
  
  // Audit
  createdAt     DateTime  @default(now()) @map("created_at")
  updatedAt     DateTime  @updatedAt @map("updated_at")
  createdBy     String?   @map("created_by")
  updatedBy     String?   @map("updated_by")
  deletedAt     DateTime? @map("deleted_at")
  
  @@map("employees")
  @@index([tenantId])
  @@index([tenantId, centerId])
  @@index([tenantId, status])
  @@index([tenantId, employeeType])
  @@index([tenantId, departmentId])
  @@index([tenantId, rankId])
  @@index([tenantId, retirementDate])
  @@index([fullName])
  @@index([primaryPhone])
  @@index([faydaId])
}
```

---

## 3.7 Employee Sub-Tables

```prisma
// ============================================================================
// EMPLOYEE ADDRESS (Cascading: Region → SubCity → Woreda)
// ============================================================================

model EmployeeAddress {
  id            String    @id @default(cuid())
  tenantId      String    @map("tenant_id")
  employeeId    String    @map("employee_id")
  
  addressType   String    @map("address_type")  // CURRENT, PERMANENT
  
  regionId      String    @map("region_id")
  subCityId     String    @map("sub_city_id")
  woredaId      String    @map("woreda_id")
  houseNumber   String?   @map("house_number")
  uniqueAreaName String?  @map("unique_area_name")
  
  fullAddress   String?   @map("full_address")
  fullAddressAm String?   @map("full_address_am")
  
  isPrimary     Boolean   @default(false) @map("is_primary")
  
  createdAt     DateTime  @default(now()) @map("created_at")
  updatedAt     DateTime  @updatedAt @map("updated_at")
  
  @@unique([employeeId, addressType])
  @@map("employee_addresses")
  @@index([employeeId])
}

// ============================================================================
// EMPLOYEE MOTHER INFO
// ============================================================================

model EmployeeMotherInfo {
  id            String    @id @default(cuid())
  tenantId      String    @map("tenant_id")
  employeeId    String    @unique @map("employee_id")
  
  fullName      String    @map("full_name")
  fullNameAm    String    @map("full_name_am")
  phone         String?
  isAlive       Boolean   @default(true) @map("is_alive")
  address       String?
  
  createdAt     DateTime  @default(now()) @map("created_at")
  updatedAt     DateTime  @updatedAt @map("updated_at")
  
  @@map("employee_mother_info")
}

// ============================================================================
// EMPLOYEE EMERGENCY CONTACT
// ============================================================================

model EmployeeEmergencyContact {
  id            String    @id @default(cuid())
  tenantId      String    @map("tenant_id")
  employeeId    String    @map("employee_id")
  
  fullName      String    @map("full_name")
  fullNameAm    String    @map("full_name_am")
  relationship  String
  phone         String
  alternativePhone String? @map("alternative_phone")
  email         String?
  
  regionId      String?   @map("region_id")
  subCityId     String?   @map("sub_city_id")
  woredaId      String?   @map("woreda_id")
  houseNumber   String?   @map("house_number")
  uniqueAreaName String?  @map("unique_area_name")
  
  priority      Int       @default(1)
  
  createdAt     DateTime  @default(now()) @map("created_at")
  updatedAt     DateTime  @updatedAt @map("updated_at")
  
  @@map("employee_emergency_contacts")
  @@index([employeeId])
}

// ============================================================================
// EMPLOYEE EDUCATION
// ============================================================================

model EmployeeEducation {
  id            String    @id @default(cuid())
  tenantId      String    @map("tenant_id")
  employeeId    String    @map("employee_id")
  
  educationLevel String   @map("education_level")
  institutionName String  @map("institution_name")
  graduationYear Int      @map("graduation_year")
  fieldOfStudy  String?   @map("field_of_study")
  gpa           Decimal?  @db.Decimal(3, 2)
  
  certificatePath String? @map("certificate_path")
  isVerified    Boolean   @default(false) @map("is_verified")
  verifiedAt    DateTime? @map("verified_at")
  verifiedBy    String?   @map("verified_by")
  
  sortOrder     Int       @default(0) @map("sort_order")
  
  createdAt     DateTime  @default(now()) @map("created_at")
  updatedAt     DateTime  @updatedAt @map("updated_at")
  
  @@map("employee_education")
  @@index([employeeId])
}

// ============================================================================
// EMPLOYEE WORK EXPERIENCE
// ============================================================================

model EmployeeWorkExperience {
  id            String    @id @default(cuid())
  tenantId      String    @map("tenant_id")
  employeeId    String    @map("employee_id")
  
  organizationName String @map("organization_name")
  position      String
  startDate     DateTime  @map("start_date") @db.Date
  endDate       DateTime? @map("end_date") @db.Date
  isCurrent     Boolean   @default(false) @map("is_current")
  
  responsibilities String?
  reasonForLeaving String? @map("reason_for_leaving")
  lastSalary    Decimal?  @map("last_salary") @db.Decimal(12, 2)
  
  referenceName String?   @map("reference_name")
  referencePhone String?  @map("reference_phone")
  experienceLetterPath String? @map("experience_letter_path")
  
  sortOrder     Int       @default(0) @map("sort_order")
  
  createdAt     DateTime  @default(now()) @map("created_at")
  updatedAt     DateTime  @updatedAt @map("updated_at")
  
  @@map("employee_work_experience")
  @@index([employeeId])
}

// ============================================================================
// EMPLOYEE FAMILY MEMBERS
// ============================================================================

model EmployeeFamilyMember {
  id            String    @id @default(cuid())
  tenantId      String    @map("tenant_id")
  employeeId    String    @map("employee_id")
  
  relationship  String
  fullName      String    @map("full_name")
  fullNameAm    String?   @map("full_name_am")
  gender        Gender?
  dateOfBirth   DateTime? @map("date_of_birth") @db.Date
  nationalId    String?   @map("national_id")
  phone         String?
  occupation    String?
  
  marriageDate  DateTime? @map("marriage_date") @db.Date
  marriageCertificatePath String? @map("marriage_certificate_path")
  birthCertificatePath String? @map("birth_certificate_path")
  schoolName    String?   @map("school_name")
  
  isAlive       Boolean   @default(true) @map("is_alive")
  
  createdAt     DateTime  @default(now()) @map("created_at")
  updatedAt     DateTime  @updatedAt @map("updated_at")
  deletedAt     DateTime? @map("deleted_at")
  
  @@map("employee_family_members")
  @@index([employeeId])
}

// ============================================================================
// EMPLOYEE MEDICAL DEPENDENTS (For expense coverage)
// ============================================================================

model EmployeeMedicalDependent {
  id            String    @id @default(cuid())
  tenantId      String    @map("tenant_id")
  employeeId    String    @map("employee_id")
  
  fullName      String    @map("full_name")
  fullNameAm    String?   @map("full_name_am")
  relationship  String    // SPOUSE, CHILD
  dateOfBirth   DateTime  @map("date_of_birth") @db.Date
  nationalId    String?   @map("national_id")
  
  // Eligibility: Spouse always eligible, Children only if under 18
  isEligible    Boolean   @default(true) @map("is_eligible")
  eligibilityReason String? @map("eligibility_reason")
  ageCheckDate  DateTime? @map("age_check_date")
  
  documentPath  String?   @map("document_path")
  
  createdAt     DateTime  @default(now()) @map("created_at")
  updatedAt     DateTime  @updatedAt @map("updated_at")
  deletedAt     DateTime? @map("deleted_at")
  
  @@map("employee_medical_dependents")
  @@index([employeeId])
  @@index([employeeId, isEligible])
}
```

---

## 3.8 Photo Management (Enterprise-Grade)

```prisma
// ============================================================================
// EMPLOYEE PHOTO (Enterprise-Grade File Handling)
// ============================================================================

model EmployeePhoto {
  id            String    @id @default(cuid())
  tenantId      String    @map("tenant_id")
  employeeId    String    @map("employee_id")
  
  // File Storage (Files on disk, not in DB)
  // Path: /data/photos/{tenantId}/{employeeId}/{uuid}.{ext}
  filePath      String    @map("file_path")
  fileName      String    @map("file_name")
  fileSize      Int       @map("file_size")       // Bytes (max 10MB)
  mimeType      String    @map("mime_type")       // image/jpeg, image/png
  fileHash      String    @map("file_hash")       // SHA-256 for integrity
  
  // Dimensions
  width         Int?
  height        Int?
  
  // Thumbnails (auto-generated)
  thumbnailPath String?   @map("thumbnail_path")  // 100x100
  mediumPath    String?   @map("medium_path")     // 400x400
  largePath     String?   @map("large_path")      // 800x800
  
  // Photo Type
  photoType     String    @map("photo_type")      // INITIAL, RANK_CHANGE, UPDATE, ID_CARD
  photoReason   String?   @map("photo_reason")
  
  // Capture Info
  captureMethod String    @map("capture_method")  // CAMERA, UPLOAD
  capturedAt    DateTime  @default(now()) @map("captured_at")
  capturedBy    String    @map("captured_by")
  
  // Approval (Required for UPLOAD method)
  status        PhotoStatus @default(PENDING_APPROVAL)
  approvedAt    DateTime? @map("approved_at")
  approvedBy    String?   @map("approved_by")
  rejectionReason String? @map("rejection_reason")
  
  // Active (Only one active per employee)
  isActive      Boolean   @default(false) @map("is_active")
  activatedAt   DateTime? @map("activated_at")
  
  createdAt     DateTime  @default(now()) @map("created_at")
  updatedAt     DateTime  @updatedAt @map("updated_at")
  deletedAt     DateTime? @map("deleted_at")
  
  @@map("employee_photos")
  @@schema("files")
  @@index([employeeId])
  @@index([tenantId, status])
  @@index([employeeId, isActive])
}
```

---

## 3.9 Leave Management

```prisma
// ============================================================================
// LEAVE TYPE CONFIGURATION
// ============================================================================

model LeaveType {
  id            String    @id @default(cuid())
  tenantId      String    @map("tenant_id")
  
  code          String
  name          String
  nameAm        String    @map("name_am")
  description   String?
  
  defaultDays   Int       @map("default_days")
  isPaid        Boolean   @default(true) @map("is_paid")
  accrualMethod String    @default("YEARLY") @map("accrual_method")
  
  // Carry Over
  allowCarryOver Boolean  @default(false) @map("allow_carry_over")
  maxCarryOverDays Int?   @map("max_carry_over_days")
  carryOverExpiryYears Int? @map("carry_over_expiry_years")  // 5 years
  
  // Applicability
  applicableEmployeeTypes String[] @default(["MILITARY", "CIVILIAN", "TEMPORARY"]) @map("applicable_employee_types")
  applicableGender String? @map("applicable_gender")
  
  // Requirements
  requiresDocument Boolean @default(false) @map("requires_document")
  minNoticeDays   Int      @default(0) @map("min_notice_days")
  
  // Holiday Impact
  holidayExtendsLeave Boolean @default(true) @map("holiday_extends_leave")
  shiftWorkerException Boolean @default(true) @map("shift_worker_exception")
  
  sortOrder     Int       @default(0) @map("sort_order")
  isActive      Boolean   @default(true) @map("is_active")
  
  createdAt     DateTime  @default(now()) @map("created_at")
  updatedAt     DateTime  @updatedAt @map("updated_at")
  
  @@unique([tenantId, code])
  @@map("leave_types")
  @@index([tenantId])
}

// ============================================================================
// EMPLOYEE LEAVE BALANCE (Per Year)
// ============================================================================

model EmployeeLeaveBalance {
  id            String    @id @default(cuid())
  tenantId      String    @map("tenant_id")
  employeeId    String    @map("employee_id")
  leaveTypeId   String    @map("leave_type_id")
  year          Int
  
  baseEntitlement Decimal @map("base_entitlement") @db.Decimal(5, 2)
  carriedForward  Decimal @default(0) @map("carried_forward") @db.Decimal(5, 2)
  adjustments     Decimal @default(0) @db.Decimal(5, 2)
  
  usedDays        Decimal @default(0) @map("used_days") @db.Decimal(5, 2)
  pendingDays     Decimal @default(0) @map("pending_days") @db.Decimal(5, 2)
  expiredDays     Decimal @default(0) @map("expired_days") @db.Decimal(5, 2)
  
  createdAt     DateTime  @default(now()) @map("created_at")
  updatedAt     DateTime  @updatedAt @map("updated_at")
  
  @@unique([employeeId, leaveTypeId, year])
  @@map("employee_leave_balances")
  @@index([employeeId])
  @@index([tenantId, year])
}

// ============================================================================
// LEAVE BALANCE DETAIL (For FIFO expiry tracking)
// ============================================================================

model LeaveBalanceDetail {
  id            String    @id @default(cuid())
  balanceId     String    @map("balance_id")
  
  sourceYear    Int       @map("source_year")
  originalDays  Decimal   @map("original_days") @db.Decimal(5, 2)
  remainingDays Decimal   @map("remaining_days") @db.Decimal(5, 2)
  expiresAt     DateTime? @map("expires_at") @db.Date
  isExpired     Boolean   @default(false) @map("is_expired")
  
  @@unique([balanceId, sourceYear])
  @@map("leave_balance_details")
}

// ============================================================================
// LEAVE REQUEST
// ============================================================================

model LeaveRequest {
  id            String    @id @default(cuid())
  tenantId      String    @map("tenant_id")
  employeeId    String    @map("employee_id")
  leaveTypeId   String    @map("leave_type_id")
  
  requestNumber String    @unique @map("request_number")
  
  startDate     DateTime  @map("start_date") @db.Date
  endDate       DateTime  @map("end_date") @db.Date
  
  requestedDays Decimal   @map("requested_days") @db.Decimal(5, 2)
  holidaysInPeriod Int    @default(0) @map("holidays_in_period")
  actualDaysDeducted Decimal @map("actual_days_deducted") @db.Decimal(5, 2)
  
  isShiftWorker Boolean   @default(false) @map("is_shift_worker")
  
  reason        String?
  destination   String?
  contactDuringLeave String? @map("contact_during_leave")
  
  handoverEmployeeId String? @map("handover_employee_id")
  handoverNotes String?   @map("handover_notes")
  documentPath  String?   @map("document_path")
  
  // Interruption (sick during annual)
  wasInterrupted Boolean  @default(false) @map("was_interrupted")
  interruptedByRequestId String? @map("interrupted_by_request_id")
  originalEndDate DateTime? @map("original_end_date") @db.Date
  
  status        LeaveRequestStatus @default(DRAFT)
  
  submittedAt   DateTime? @map("submitted_at")
  approvedAt    DateTime? @map("approved_at")
  approvedBy    String?   @map("approved_by")
  rejectedAt    DateTime? @map("rejected_at")
  rejectedBy    String?   @map("rejected_by")
  rejectionReason String? @map("rejection_reason")
  
  // Leave Permit
  permitNumber  String?   @map("permit_number")
  permitIssuedAt DateTime? @map("permit_issued_at")
  
  createdAt     DateTime  @default(now()) @map("created_at")
  updatedAt     DateTime  @updatedAt @map("updated_at")
  createdBy     String?   @map("created_by")
  
  @@map("leave_requests")
  @@index([tenantId])
  @@index([employeeId])
  @@index([tenantId, status])
  @@index([tenantId, startDate, endDate])
}
```

---

## 3.10 Appraisal & Disciplinary

```prisma
// ============================================================================
// APPRAISAL
// ============================================================================

model AppraisalPeriod {
  id            String    @id @default(cuid())
  tenantId      String    @map("tenant_id")
  
  name          String
  nameAm        String?   @map("name_am")
  
  startDate     DateTime  @map("start_date") @db.Date
  endDate       DateTime  @map("end_date") @db.Date
  reviewDeadline DateTime @map("review_deadline") @db.Date
  
  applicableEmployeeTypes String[] @default(["MILITARY", "CIVILIAN"]) @map("applicable_employee_types")
  status        String    @default("DRAFT")
  
  createdAt     DateTime  @default(now()) @map("created_at")
  updatedAt     DateTime  @updatedAt @map("updated_at")
  createdBy     String?   @map("created_by")
  
  @@map("appraisal_periods")
  @@index([tenantId])
}

model AppraisalCriteria {
  id            String    @id @default(cuid())
  tenantId      String    @map("tenant_id")
  periodId      String?   @map("period_id")
  
  code          String
  name          String
  nameAm        String?   @map("name_am")
  description   String?
  
  maxScore      Int       @map("max_score")
  weightPercentage Decimal @map("weight_percentage") @db.Decimal(5, 2)
  category      String?
  
  applicableEmployeeTypes String[] @default(["ALL"]) @map("applicable_employee_types")
  
  sortOrder     Int       @default(0) @map("sort_order")
  isActive      Boolean   @default(true) @map("is_active")
  
  createdAt     DateTime  @default(now()) @map("created_at")
  updatedAt     DateTime  @updatedAt @map("updated_at")
  
  @@unique([tenantId, code])
  @@map("appraisal_criteria")
  @@index([tenantId])
}

model Appraisal {
  id            String    @id @default(cuid())
  tenantId      String    @map("tenant_id")
  employeeId    String    @map("employee_id")
  periodId      String    @map("period_id")
  
  // Eligibility (Auto-checked against disciplinary)
  isEligible    Boolean   @default(true) @map("is_eligible")
  ineligibilityReason String? @map("ineligibility_reason")
  
  // Scores
  criteriaScore Decimal?  @map("criteria_score") @db.Decimal(5, 2)
  disciplinaryDeduction Decimal @default(0) @map("disciplinary_deduction") @db.Decimal(5, 2)
  finalScore    Decimal?  @map("final_score") @db.Decimal(5, 2)
  grade         String?
  
  reviewedBy    String?   @map("reviewed_by")
  reviewedAt    DateTime? @map("reviewed_at")
  reviewerComments String? @map("reviewer_comments")
  
  approvedBy    String?   @map("approved_by")
  approvedAt    DateTime? @map("approved_at")
  
  status        AppraisalStatus @default(DRAFT)
  
  createdAt     DateTime  @default(now()) @map("created_at")
  updatedAt     DateTime  @updatedAt @map("updated_at")
  createdBy     String?   @map("created_by")
  
  @@unique([employeeId, periodId])
  @@map("appraisals")
  @@index([tenantId])
  @@index([employeeId])
}

// ============================================================================
// DISCIPLINARY RECORDS (Article 30 & 31)
// ============================================================================

model DisciplinaryRecord {
  id            String    @id @default(cuid())
  tenantId      String    @map("tenant_id")
  employeeId    String    @map("employee_id")
  
  // ARTICLE_30: Minor - eligible with deduction
  // ARTICLE_31: Major - NOT eligible for appraisal
  disciplinaryType DisciplinaryType @map("disciplinary_type")
  
  violationDate DateTime  @map("violation_date") @db.Date
  description   String
  
  effectiveFrom DateTime  @map("effective_from") @db.Date
  effectiveUntil DateTime? @map("effective_until") @db.Date
  
  penalties     Json      @default("[]")
  orderReference String?  @map("order_reference")
  documentPath  String?   @map("document_path")
  
  status        DisciplinaryStatus @default(ACTIVE)
  
  // Impact flags
  impactsAppraisal Boolean @default(true) @map("impacts_appraisal")
  impactsReward  Boolean  @default(true) @map("impacts_reward")
  
  createdAt     DateTime  @default(now()) @map("created_at")
  updatedAt     DateTime  @updatedAt @map("updated_at")
  createdBy     String?   @map("created_by")
  
  @@map("disciplinary_records")
  @@index([employeeId])
  @@index([tenantId, status])
  @@index([employeeId, status])
}

// ============================================================================
// INVESTIGATION (Links to Rewards postponement)
// ============================================================================

model Investigation {
  id            String    @id @default(cuid())
  tenantId      String    @map("tenant_id")
  employeeId    String    @map("employee_id")
  
  caseNumber    String    @unique @map("case_number")
  subject       String
  description   String?
  
  startDate     DateTime  @map("start_date") @db.Date
  endDate       DateTime? @map("end_date") @db.Date
  
  // IN_PROGRESS → Rewards POSTPONED by 2 years
  // COMPLETED_CLEARED → Rewards eligibility restored
  // COMPLETED_GUILTY → May result in Article 30/31
  status        InvestigationStatus @default(IN_PROGRESS)
  outcome       String?
  
  resultingDisciplinaryId String? @map("resulting_disciplinary_id")
  
  createdAt     DateTime  @default(now()) @map("created_at")
  updatedAt     DateTime  @updatedAt @map("updated_at")
  createdBy     String?   @map("created_by")
  
  @@map("investigations")
  @@index([employeeId])
  @@index([tenantId, status])
}
```

---

## 3.11 Service Rewards

```prisma
// ============================================================================
// REWARD MILESTONES
// ============================================================================

model RewardMilestone {
  id            String    @id @default(cuid())
  tenantId      String    @map("tenant_id")
  
  yearsOfService Int      @map("years_of_service")  // 5, 10, 15, 20, 25, 30
  name          String
  nameAm        String?   @map("name_am")
  description   String?
  
  rewardType    String    @map("reward_type")
  monetaryValue Decimal?  @map("monetary_value") @db.Decimal(12, 2)
  
  isActive      Boolean   @default(true) @map("is_active")
  
  createdAt     DateTime  @default(now()) @map("created_at")
  updatedAt     DateTime  @updatedAt @map("updated_at")
  
  @@unique([tenantId, yearsOfService])
  @@map("reward_milestones")
  @@index([tenantId])
}

// ============================================================================
// SERVICE REWARD (Employee Award)
// ============================================================================

model ServiceReward {
  id            String    @id @default(cuid())
  tenantId      String    @map("tenant_id")
  employeeId    String    @map("employee_id")
  milestoneId   String    @map("milestone_id")
  
  // Eligibility Check
  // ELIGIBLE: No issues
  // DISQUALIFIED_ARTICLE_31: Has active Article 31
  // POSTPONED_INVESTIGATION: Under investigation (2 year delay)
  eligibilityStatus RewardEligibility @default(PENDING_REVIEW) @map("eligibility_status")
  eligibilityCheckDate DateTime @map("eligibility_check_date")
  ineligibilityReason String? @map("ineligibility_reason")
  
  // Postponement (under investigation)
  postponedUntil DateTime? @map("postponed_until") @db.Date
  postponementReason String? @map("postponement_reason")
  originalEligibleDate DateTime? @map("original_eligible_date") @db.Date
  
  // Award
  awardDate     DateTime? @map("award_date") @db.Date
  awardedBy     String?   @map("awarded_by")
  ceremonyDetails String? @map("ceremony_details")
  certificateNumber String? @map("certificate_number")
  certificatePath String? @map("certificate_path")
  photoPath     String?   @map("photo_path")
  
  status        String    @default("PENDING")
  
  createdAt     DateTime  @default(now()) @map("created_at")
  updatedAt     DateTime  @updatedAt @map("updated_at")
  
  @@unique([employeeId, milestoneId])
  @@map("service_rewards")
  @@index([tenantId])
  @@index([employeeId])
  @@index([tenantId, eligibilityStatus])
}
```

---

## 3.12 Retirement

```prisma
// ============================================================================
// RETIREMENT
// ============================================================================

model Retirement {
  id            String    @id @default(cuid())
  tenantId      String    @map("tenant_id")
  employeeId    String    @unique @map("employee_id")
  
  retirementType String   @map("retirement_type")  // AGE, VOLUNTARY, MEDICAL, SERVICE
  
  retirementDate DateTime @map("retirement_date") @db.Date
  initiatedDate DateTime  @map("initiated_date") @db.Date
  completedDate DateTime? @map("completed_date") @db.Date
  
  // Age Calculation based on DOB + Rank
  dateOfBirth   DateTime  @map("date_of_birth") @db.Date
  ageAtRetirement Int     @map("age_at_retirement")
  rankAtRetirement String @map("rank_at_retirement")
  retirementAgeRule Int   @map("retirement_age_rule")  // 50, 52, or 55
  
  // Service
  totalServiceYears Int   @map("total_service_years")
  totalServiceMonths Int  @map("total_service_months")
  
  status        RetirementStatus @default(PENDING)
  
  // Clearance
  allClearancesComplete Boolean @default(false) @map("all_clearances_complete")
  
  // Documents
  retirementOrderPath String? @map("retirement_order_path")
  certificatePath String? @map("certificate_path")
  
  // Settlement
  finalSettlementAmount Decimal? @map("final_settlement_amount") @db.Decimal(14, 2)
  leaveEncashment Decimal? @map("leave_encashment") @db.Decimal(12, 2)
  
  createdAt     DateTime  @default(now()) @map("created_at")
  updatedAt     DateTime  @updatedAt @map("updated_at")
  createdBy     String?   @map("created_by")
  
  @@map("retirements")
  @@index([tenantId])
  @@index([tenantId, status])
  @@index([tenantId, retirementDate])
}

model RetirementClearance {
  id            String    @id @default(cuid())
  retirementId  String    @map("retirement_id")
  
  department    String    // HR, FINANCE, INVENTORY, IT, SECURITY
  departmentName String   @map("department_name")
  
  status        ClearanceStatus @default(PENDING)
  
  clearedBy     String?   @map("cleared_by")
  clearedAt     DateTime? @map("cleared_at")
  issues        String?
  waivedBy      String?   @map("waived_by")
  waiverReason  String?   @map("waiver_reason")
  
  @@unique([retirementId, department])
  @@map("retirement_clearances")
}
```

---

## 3.13 Attendance & Shift Management

```prisma
// ============================================================================
// SHIFT DEFINITIONS
// ============================================================================

model ShiftDefinition {
  id            String    @id @default(cuid())
  tenantId      String    @map("tenant_id")
  
  code          String
  name          String
  nameAm        String?   @map("name_am")
  
  scheduleType  WorkScheduleType @map("schedule_type")
  
  startTime     String    @map("start_time")      // "06:00"
  endTime       String    @map("end_time")        // "14:00"
  isOvernight   Boolean   @default(false) @map("is_overnight")
  breakMinutes  Int       @default(30) @map("break_minutes")
  
  // Holiday Impact
  holidayAware  Boolean   @default(true) @map("holiday_aware")  // false for guards
  
  color         String?
  isActive      Boolean   @default(true) @map("is_active")
  
  createdAt     DateTime  @default(now()) @map("created_at")
  updatedAt     DateTime  @updatedAt @map("updated_at")
  
  @@unique([tenantId, code])
  @@map("shift_definitions")
  @@index([tenantId])
}

model ShiftAssignment {
  id            String    @id @default(cuid())
  tenantId      String    @map("tenant_id")
  employeeId    String    @map("employee_id")
  shiftId       String    @map("shift_id")
  
  shiftDate     DateTime  @map("shift_date") @db.Date
  status        String    @default("SCHEDULED")
  
  swappedWithEmployeeId String? @map("swapped_with_employee_id")
  swapApprovedBy String?  @map("swap_approved_by")
  
  createdAt     DateTime  @default(now()) @map("created_at")
  updatedAt     DateTime  @updatedAt @map("updated_at")
  
  @@unique([employeeId, shiftDate])
  @@map("shift_assignments")
  @@index([tenantId])
  @@index([employeeId])
  @@index([tenantId, shiftDate])
}

// ============================================================================
// ATTENDANCE RECORDS (Biometric-Ready)
// ============================================================================

model AttendanceRecord {
  id            String    @id @default(cuid())
  tenantId      String    @map("tenant_id")
  employeeId    String    @map("employee_id")
  
  attendanceDate DateTime @map("attendance_date") @db.Date
  shiftId       String?   @map("shift_id")
  
  clockIn       DateTime? @map("clock_in")
  clockOut      DateTime? @map("clock_out")
  
  // Biometric integration ready
  clockInMethod String?   @map("clock_in_method")   // MANUAL, FINGERPRINT, FACE
  clockOutMethod String?  @map("clock_out_method")
  clockInDeviceId String? @map("clock_in_device_id")
  clockOutDeviceId String? @map("clock_out_device_id")
  
  status        String    @default("PRESENT")
  
  hoursWorked   Decimal?  @map("hours_worked") @db.Decimal(4, 2)
  overtimeHours Decimal?  @map("overtime_hours") @db.Decimal(4, 2)
  lateMinutes   Int?      @map("late_minutes")
  
  remarks       String?
  recordedBy    String?   @map("recorded_by")
  
  createdAt     DateTime  @default(now()) @map("created_at")
  updatedAt     DateTime  @updatedAt @map("updated_at")
  
  @@unique([employeeId, attendanceDate])
  @@map("attendance_records")
  @@index([tenantId])
  @@index([employeeId])
  @@index([tenantId, attendanceDate])
}
```

---

## 3.14 Inventory Management

```prisma
// ============================================================================
// INVENTORY CATEGORIES
// ============================================================================

model InventoryCategory {
  id            String    @id @default(cuid())
  tenantId      String    @map("tenant_id")
  
  code          String
  name          String
  nameAm        String?   @map("name_am")
  
  requiresSerialNumber Boolean @default(false) @map("requires_serial_number")
  requiresLicense Boolean @default(false) @map("requires_license")
  requiresInspection Boolean @default(false) @map("requires_inspection")
  isHighSecurity Boolean  @default(false) @map("is_high_security")
  returnRequired Boolean  @default(true) @map("return_required")
  
  isActive      Boolean   @default(true) @map("is_active")
  
  createdAt     DateTime  @default(now()) @map("created_at")
  updatedAt     DateTime  @updatedAt @map("updated_at")
  
  @@unique([tenantId, code])
  @@map("inventory_categories")
  @@index([tenantId])
}

model InventoryItemType {
  id            String    @id @default(cuid())
  tenantId      String    @map("tenant_id")
  categoryId    String    @map("category_id")
  
  code          String
  name          String
  nameAm        String?   @map("name_am")
  description   String?
  
  isActive      Boolean   @default(true) @map("is_active")
  
  createdAt     DateTime  @default(now()) @map("created_at")
  updatedAt     DateTime  @updatedAt @map("updated_at")
  
  @@unique([tenantId, code])
  @@map("inventory_item_types")
  @@index([tenantId])
  @@index([categoryId])
}

model InventoryAssignment {
  id            String    @id @default(cuid())
  tenantId      String    @map("tenant_id")
  employeeId    String    @map("employee_id")
  itemTypeId    String    @map("item_type_id")
  
  serialNumber  String?   @map("serial_number")
  assetTag      String?   @map("asset_tag")
  size          String?
  quantity      Int       @default(1)
  
  assignedDate  DateTime  @map("assigned_date") @db.Date
  assignedBy    String    @map("assigned_by")
  conditionAtAssignment String @map("condition_at_assignment")
  
  // Return (Auto-checked at retirement)
  isReturned    Boolean   @default(false) @map("is_returned")
  returnedDate  DateTime? @map("returned_date") @db.Date
  returnedTo    String?   @map("returned_to")
  conditionAtReturn String? @map("condition_at_return")
  
  isLost        Boolean   @default(false) @map("is_lost")
  isDamaged     Boolean   @default(false) @map("is_damaged")
  damageNotes   String?   @map("damage_notes")
  costRecovery  Decimal?  @map("cost_recovery") @db.Decimal(12, 2)
  
  remarks       String?
  
  createdAt     DateTime  @default(now()) @map("created_at")
  updatedAt     DateTime  @updatedAt @map("updated_at")
  
  @@map("inventory_assignments")
  @@index([tenantId])
  @@index([employeeId])
  @@index([employeeId, isReturned])
}
```

---

## 3.15 Holiday & Document Management

```prisma
// ============================================================================
// HOLIDAYS
// ============================================================================

model Holiday {
  id            String    @id @default(cuid())
  tenantId      String    @map("tenant_id")
  
  name          String
  nameAm        String    @map("name_am")
  holidayDate   DateTime  @map("holiday_date") @db.Date
  
  holidayType   String    @map("holiday_type")
  isHalfDay     Boolean   @default(false) @map("is_half_day")
  
  isRecurring   Boolean   @default(false) @map("is_recurring")
  recurrenceType String?  @map("recurrence_type")
  ethiopianMonth Int?     @map("ethiopian_month")
  ethiopianDay  Int?      @map("ethiopian_day")
  
  appliesTo     String[]  @default(["ALL"]) @map("applies_to")
  description   String?
  
  createdAt     DateTime  @default(now()) @map("created_at")
  updatedAt     DateTime  @updatedAt @map("updated_at")
  createdBy     String?   @map("created_by")
  
  @@unique([tenantId, holidayDate])
  @@map("holidays")
  @@index([tenantId])
  @@index([tenantId, holidayDate])
}

// ============================================================================
// DOCUMENT TRACKING (Incoming/Outgoing - Document Officer Access)
// ============================================================================

model DocumentType {
  id            String    @id @default(cuid())
  tenantId      String    @map("tenant_id")
  
  code          String
  name          String
  nameAm        String?   @map("name_am")
  direction     DocumentDirection
  
  prefix        String?
  currentNumber Int       @default(0) @map("current_number")
  
  isActive      Boolean   @default(true) @map("is_active")
  
  createdAt     DateTime  @default(now()) @map("created_at")
  updatedAt     DateTime  @updatedAt @map("updated_at")
  
  @@unique([tenantId, code])
  @@map("document_types")
  @@index([tenantId])
}

model Document {
  id            String    @id @default(cuid())
  tenantId      String    @map("tenant_id")
  documentTypeId String   @map("document_type_id")
  
  referenceNumber String  @unique @map("reference_number")
  direction     DocumentDirection
  
  documentDate  DateTime  @map("document_date") @db.Date
  receivedDate  DateTime? @map("received_date") @db.Date
  sentDate      DateTime? @map("sent_date") @db.Date
  
  sourceOrganization String? @map("source_organization")
  destinationOrganization String? @map("destination_organization")
  
  subject       String
  summary       String?
  priority      String    @default("NORMAL")
  
  actionRequired String?  @map("action_required")
  deadline      DateTime? @db.Date
  
  assignedTo    String?   @map("assigned_to")
  assignedDepartmentId String? @map("assigned_department_id")
  
  filePath      String?   @map("file_path")
  status        String    @default("RECEIVED")
  
  registeredBy  String    @map("registered_by")
  createdAt     DateTime  @default(now()) @map("created_at")
  updatedAt     DateTime  @updatedAt @map("updated_at")
  
  @@map("documents")
  @@index([tenantId])
  @@index([tenantId, direction])
  @@index([tenantId, status])
  @@index([tenantId, documentDate])
}

// ============================================================================
// EMPLOYEE DOCUMENTS (Personal Documents)
// ============================================================================

model EmployeeDocument {
  id            String    @id @default(cuid())
  tenantId      String    @map("tenant_id")
  employeeId    String    @map("employee_id")
  
  documentCategory String @map("document_category")
  documentType  String    @map("document_type")
  
  title         String
  description   String?
  
  filePath      String    @map("file_path")
  fileName      String    @map("file_name")
  fileSize      Int       @map("file_size")
  mimeType      String    @map("mime_type")
  
  issueDate     DateTime? @map("issue_date") @db.Date
  expiryDate    DateTime? @map("expiry_date") @db.Date
  isExpired     Boolean   @default(false) @map("is_expired")
  
  isVerified    Boolean   @default(false) @map("is_verified")
  verifiedBy    String?   @map("verified_by")
  verifiedAt    DateTime? @map("verified_at")
  
  createdAt     DateTime  @default(now()) @map("created_at")
  updatedAt     DateTime  @updatedAt @map("updated_at")
  uploadedBy    String    @map("uploaded_by")
  deletedAt     DateTime? @map("deleted_at")
  
  @@map("employee_documents")
  @@index([employeeId])
  @@index([tenantId, documentCategory])
}
```

---

## 3.16 Audit Log (Immutable)

```prisma
// ============================================================================
// AUDIT LOG (Immutable - Partitioned by Month)
// ============================================================================

model AuditLog {
  id            String    @id @default(cuid())
  tenantId      String    @map("tenant_id")
  
  // Timestamp (used for partitioning)
  timestamp     DateTime  @default(now())
  
  // Actor
  userId        String?   @map("user_id")
  username      String?
  userRole      String?   @map("user_role")
  userCenter    String?   @map("user_center")
  
  // Action
  action        AuditAction
  module        String
  resource      String
  resourceId    String?   @map("resource_id")
  
  // Context
  ipAddress     String    @map("ip_address")
  userAgent     String?   @map("user_agent")
  deviceType    String?   @map("device_type")
  browser       String?
  os            String?
  sessionId     String?   @map("session_id")
  requestId     String?   @map("request_id")
  
  // Changes
  previousValue Json?     @map("previous_value")
  newValue      Json?     @map("new_value")
  changedFields String[]  @default([]) @map("changed_fields")
  
  // Description
  description   String?
  reason        String?
  
  // Related
  relatedAuditId String?  @map("related_audit_id")
  
  @@map("audit_logs")
  @@schema("audit")
  @@index([tenantId])
  @@index([timestamp])
  @@index([userId])
  @@index([module, resource])
  @@index([resourceId])
  @@index([ipAddress])
}

// ============================================================================
// LOGIN HISTORY
// ============================================================================

model LoginHistory {
  id            String    @id @default(cuid())
  userId        String    @map("user_id")
  
  loginAt       DateTime  @default(now()) @map("login_at")
  logoutAt      DateTime? @map("logout_at")
  ipAddress     String    @map("ip_address")
  userAgent     String?   @map("user_agent")
  deviceType    String?   @map("device_type")
  browser       String?
  os            String?
  location      String?
  
  sessionId     String    @map("session_id")
  isSuccessful  Boolean   @default(true) @map("is_successful")
  failureReason String?   @map("failure_reason")
  
  @@map("login_history")
  @@schema("audit")
  @@index([userId])
  @@index([loginAt])
  @@index([ipAddress])
}
```

---

## 3.17 Statistics Tables (Pre-computed)

```prisma
// ============================================================================
// STATISTICS TABLES (Refreshed by Background Jobs)
// ============================================================================

// Employee counts by various dimensions
model StatsEmployeeCounts {
  id            String    @id @default(cuid())
  tenantId      String    @map("tenant_id")
  
  // Dimensions
  centerId      String?   @map("center_id")
  departmentId  String?   @map("department_id")
  employeeType  EmployeeType? @map("employee_type")
  rankId        String?   @map("rank_id")
  status        EmployeeStatus?
  gender        Gender?
  
  // Counts
  totalCount    Int       @map("total_count")
  activeCount   Int       @map("active_count")
  
  // Last Updated
  computedAt    DateTime  @default(now()) @map("computed_at")
  
  @@map("stats_employee_counts")
  @@schema("stats")
  @@index([tenantId])
  @@index([tenantId, centerId])
}

// Leave statistics
model StatsLeaveSummary {
  id            String    @id @default(cuid())
  tenantId      String    @map("tenant_id")
  year          Int
  month         Int?
  
  // Dimensions
  centerId      String?   @map("center_id")
  departmentId  String?   @map("department_id")
  leaveTypeId   String?   @map("leave_type_id")
  
  // Counts
  totalRequests Int       @map("total_requests")
  approvedRequests Int    @map("approved_requests")
  rejectedRequests Int    @map("rejected_requests")
  pendingRequests Int     @map("pending_requests")
  totalDays     Decimal   @map("total_days") @db.Decimal(10, 2)
  
  computedAt    DateTime  @default(now()) @map("computed_at")
  
  @@map("stats_leave_summary")
  @@schema("stats")
  @@index([tenantId])
  @@index([tenantId, year])
}

// Attendance statistics
model StatsAttendanceSummary {
  id            String    @id @default(cuid())
  tenantId      String    @map("tenant_id")
  date          DateTime  @db.Date
  
  centerId      String?   @map("center_id")
  departmentId  String?   @map("department_id")
  
  totalEmployees Int      @map("total_employees")
  presentCount  Int       @map("present_count")
  absentCount   Int       @map("absent_count")
  lateCount     Int       @map("late_count")
  onLeaveCount  Int       @map("on_leave_count")
  
  attendanceRate Decimal  @map("attendance_rate") @db.Decimal(5, 2)
  
  computedAt    DateTime  @default(now()) @map("computed_at")
  
  @@map("stats_attendance_summary")
  @@schema("stats")
  @@index([tenantId])
  @@index([tenantId, date])
}

// Retirement projections
model StatsRetirementProjections {
  id            String    @id @default(cuid())
  tenantId      String    @map("tenant_id")
  
  year          Int
  month         Int?
  
  centerId      String?   @map("center_id")
  departmentId  String?   @map("department_id")
  rankId        String?   @map("rank_id")
  
  // Counts
  retiringCount Int       @map("retiring_count")
  retirementAgeGroup String? @map("retirement_age_group")  // '50', '52', '55'
  
  computedAt    DateTime  @default(now()) @map("computed_at")
  
  @@map("stats_retirement_projections")
  @@schema("stats")
  @@index([tenantId])
  @@index([tenantId, year])
}
```

---

# 4. Database Functions & Triggers

## 4.1 Employee ID Generation

```sql
-- Function to generate employee ID: FPC-000001
CREATE OR REPLACE FUNCTION generate_employee_id(tenant_id UUID)
RETURNS TEXT AS $$
DECLARE
    next_num INT;
    tenant_prefix TEXT;
BEGIN
    -- Get tenant prefix (default 'FPC')
    SELECT COALESCE(settings->>'employeeIdPrefix', 'FPC') 
    INTO tenant_prefix 
    FROM tenants WHERE id = tenant_id;
    
    -- Get and increment counter
    UPDATE tenants 
    SET settings = jsonb_set(
        settings, 
        '{employeeIdCounter}', 
        to_jsonb(COALESCE((settings->>'employeeIdCounter')::INT, 0) + 1)
    )
    WHERE id = tenant_id
    RETURNING (settings->>'employeeIdCounter')::INT INTO next_num;
    
    RETURN tenant_prefix || '-' || LPAD(next_num::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql;
```

## 4.2 Retirement Date Calculation

```sql
-- Function to calculate retirement date based on DOB and rank
CREATE OR REPLACE FUNCTION calculate_retirement_date(
    p_date_of_birth DATE,
    p_rank_id UUID
) RETURNS DATE AS $$
DECLARE
    retirement_age INT;
BEGIN
    -- Get retirement age from rank
    SELECT mr.retirement_age INTO retirement_age
    FROM military_ranks mr
    WHERE mr.id = p_rank_id;
    
    -- If no rank (civilian), default to 60 or handle separately
    IF retirement_age IS NULL THEN
        retirement_age := 60;
    END IF;
    
    RETURN p_date_of_birth + (retirement_age || ' years')::INTERVAL;
END;
$$ LANGUAGE plpgsql;
```

## 4.3 Leave Balance Update Trigger

```sql
-- Trigger to update leave balance when request is approved
CREATE OR REPLACE FUNCTION update_leave_balance_on_approval()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'APPROVED' AND OLD.status != 'APPROVED' THEN
        UPDATE employee_leave_balances
        SET 
            used_days = used_days + NEW.actual_days_deducted,
            pending_days = pending_days - NEW.actual_days_deducted,
            updated_at = NOW()
        WHERE 
            employee_id = NEW.employee_id 
            AND leave_type_id = NEW.leave_type_id
            AND year = EXTRACT(YEAR FROM NEW.start_date);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_leave_balance_update
    AFTER UPDATE ON leave_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_leave_balance_on_approval();
```

## 4.4 Stats Update Trigger

```sql
-- Trigger to update employee counts on insert/delete
CREATE OR REPLACE FUNCTION update_employee_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Refresh materialized view or update stats table
    -- This is called but actual refresh happens in background job
    -- Just mark stats as stale
    UPDATE stats_employee_counts
    SET computed_at = '1970-01-01'::timestamp
    WHERE tenant_id = COALESCE(NEW.tenant_id, OLD.tenant_id);
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_employee_stats
    AFTER INSERT OR UPDATE OR DELETE ON employees
    FOR EACH ROW
    EXECUTE FUNCTION update_employee_stats();
```

---

# 5. Indexes Strategy

## 5.1 Composite Indexes for Common Queries

```sql
-- Employee searches
CREATE INDEX idx_employee_search ON employees(tenant_id, status, employee_type) 
    WHERE deleted_at IS NULL;

-- Leave requests by approver
CREATE INDEX idx_leave_pending ON leave_requests(tenant_id, status) 
    WHERE status = 'PENDING';

-- Upcoming retirements
CREATE INDEX idx_retirement_upcoming ON employees(tenant_id, retirement_date) 
    WHERE status = 'ACTIVE' AND retirement_date IS NOT NULL;

-- Active disciplinary records
CREATE INDEX idx_disciplinary_active ON disciplinary_records(employee_id, status) 
    WHERE status = 'ACTIVE';

-- Audit log queries
CREATE INDEX idx_audit_user_date ON audit.audit_logs(tenant_id, user_id, timestamp DESC);
```

## 5.2 Full-Text Search Indexes

```sql
-- Employee name search
CREATE INDEX idx_employee_fulltext ON employees 
    USING gin(to_tsvector('english', full_name || ' ' || COALESCE(full_name_am, '')));

-- Document search
CREATE INDEX idx_document_fulltext ON documents 
    USING gin(to_tsvector('english', subject || ' ' || COALESCE(summary, '')));
```

---

# 6. Security Configuration

## 6.1 Row-Level Security (RLS)

```sql
-- Enable RLS on all main tables
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see employees from their tenant
CREATE POLICY tenant_isolation ON employees
    USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

-- Policy: Center-level access
CREATE POLICY center_access ON employees
    USING (
        center_id = current_setting('app.current_center_id')::UUID
        OR current_setting('app.access_scope') = 'ALL'
    );
```

## 6.2 Sensitive Data Handling

```sql
-- Never expose password fields in queries
-- Use views for safe access
CREATE VIEW v_users_safe AS
SELECT 
    id, tenant_id, username, email, status, 
    last_login_at, created_at, updated_at
FROM users
WHERE deleted_at IS NULL;

-- Encrypt sensitive fields at rest
-- Use pgcrypto for additional encryption
```

---

# 7. Seed Data

## 7.1 Military Ranks (From Uploaded Salary Scale)

```sql
INSERT INTO military_ranks (code, name, name_am, level, category, base_salary, ceiling_salary, retirement_age) VALUES
('CONSTABLE', 'Constable', 'ኮንስታብል', 1, 'ENLISTED', 6365, 8944, 50),
('ASST_SGT', 'Assistant Sergeant', 'ረዳት ሳጅን', 2, 'ENLISTED', 7054, 9859, 50),
('DEP_SGT', 'Deputy Sergeant', 'ምክትል ሳጅን', 3, 'NCO', 7809, 11223, 50),
('SGT', 'Sergeant', 'ሳጅን', 4, 'NCO', 8646, 12992, 50),
('CHIEF_SGT', 'Chief Sergeant', 'ዋና ሳጅን', 5, 'NCO', 9544, 14975, 50),
('ASST_INSP', 'Assistant Inspector', 'ረዳት ኢንስፔክተር', 6, 'JUNIOR_OFFICER', 10688, 17121, 52),
('DEP_INSP', 'Deputy Inspector', 'ምክትል ኢንስፔክተር', 7, 'JUNIOR_OFFICER', 12373, 19538, 52),
('INSP', 'Inspector', 'ኢንስፔክተር', 8, 'JUNIOR_OFFICER', 14296, 22256, 52),
('CHIEF_INSP', 'Chief Inspector', 'ዋና ኢንስፔክተር', 9, 'SENIOR_OFFICER', 16384, 25232, 55),
('DEP_CMDR', 'Deputy Commander', 'ምክትል ኮማንደር', 10, 'SENIOR_OFFICER', 18697, 28361, 55),
('CMDR', 'Commander', 'ኮማንደር', 11, 'SENIOR_OFFICER', 21336, 31627, 55),
('ASST_COMM', 'Assistant Commissioner', 'ረዳት ኮሚሽነር', 12, 'COMMAND', 24215, 35011, 55),
('DEP_COMM', 'Deputy Commissioner', 'ምክትል ኮሚሽነር', 13, 'COMMAND', 27310, 38526, 55),
('COMM', 'Commissioner', 'ኮሚሽነር', 14, 'COMMAND', 30522, 42393, 55),
('DEP_COMM_GEN', 'Deputy Commissioner General', 'ም/ኮሚ/ጀነራል', 15, 'COMMAND', 32750, 44412, 55),
('COMM_GEN', 'Commissioner General', 'ኮሚሽነር ጀነራል', 16, 'COMMAND', 35011, 46865, 55);
```

## 7.2 System Roles

```sql
INSERT INTO roles (code, name, name_am, description, is_system_role, access_scope, level) VALUES
('COMMISSIONER', 'Commissioner', 'ኮሚሽነር', 'View stats and reports for decisions', true, 'ALL', 1),
('VICE_COMMISSIONER', 'Vice Commissioner', 'ም/ኮሚሽነር', 'View stats and reports for decisions', true, 'ALL', 2),
('DEPT_HEAD_COMM', 'Department Head Commissioner', 'የመምሪያ ኃላፊ ኮሚሽነር', 'View department data', true, 'OWN_DEPARTMENT', 3),
('IT_ADMIN', 'IT Administrator', 'የአይቲ አስተዳዳሪ', 'Manage users, roles, settings', true, 'ALL', 4),
('HQ_HR_MANAGER', 'HQ HR Manager', 'የዋና መስሪያ ቤት HR ስራ አስኪያጅ', 'Full HR access for all centers', true, 'ALL', 5),
('CENTER_COMMANDER', 'Center Commander', 'የማዕከል አዛዥ', 'View center reports, approve requests', true, 'OWN_CENTER', 6),
('CENTER_HR_MANAGER', 'Center HR Manager', 'የማዕከል HR ስራ አስኪያጅ', 'HR access for own center', true, 'OWN_CENTER', 7),
('HR_OFFICER', 'HR Officer', 'HR ኦፊሰር', 'Day-to-day HR activities', true, 'OWN_CENTER', 8),
('DOCUMENT_OFFICER', 'Document Officer', 'የሰነድ ኦፊሰር', 'Document module only', true, 'OWN_CENTER', 9);
```

---

# 8. Summary

## 8.1 Table Count by Category

| Category | Count | Examples |
|----------|-------|----------|
| Core | ~10 | tenants, users, roles, permissions |
| Organization | ~10 | centers, departments, positions, ranks |
| Employee | ~15 | employees, addresses, education, photos |
| Modules | ~25 | leave, appraisal, retirement, inventory |
| Audit & Stats | ~10 | audit_logs, login_history, stats_* |
| **Total** | **~70** | |

## 8.2 Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| UUID primary keys | Distributed generation, security |
| Soft delete | Data recovery, audit compliance |
| Multi-tenancy with RLS | Data isolation, security |
| Files on disk (not DB) | Performance, scalability |
| Stats tables | Dashboard performance |
| Audit log partitioning | Query performance, archival |
| Bilingual columns | Native Amharic support |

## 8.3 Enterprise-Grade Features

- ✅ Row-Level Security (RLS)
- ✅ Password hashing with salt
- ✅ Single session enforcement
- ✅ Failed login lockout
- ✅ Comprehensive audit logging
- ✅ File integrity verification (SHA-256)
- ✅ Biometric-ready attendance
- ✅ Statistics optimization
- ✅ Ethiopian calendar support

---

End of Database Architecture
