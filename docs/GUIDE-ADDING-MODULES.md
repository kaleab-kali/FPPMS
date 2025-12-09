# EPPMS - Guide: Adding New Employee Sub-Modules

## How to Extend Employee Data with New Modules

---

# 1. Overview

The EPPMS architecture is designed for easy extensibility. This guide shows how to add new employee-related modules like:

- Health Information
- Marital Status
- Relatives/Dependents
- Previous Employment
- Education (future)
- Training/Certifications (future)

---

# 2. Relationship Patterns

## 2.1 Choose Your Pattern

### Option A: 1:1 Relationship (Separate Table)
**Use when:** Employee has **one record** with many fields

```
employees (1) ──────► (1) employee_health_info
employees (1) ──────► (1) employee_marital_info
```

**Characteristics:**
- `employeeId` is UNIQUE in child table
- Use `upsert` for create/update
- No list view needed, just form
- Always fetch with employee

### Option B: 1:N Relationship (Separate Table)
**Use when:** Employee can have **multiple records**

```
employees (1) ──────► (N) employee_relatives
employees (1) ──────► (N) employee_previous_employment
employees (1) ──────► (N) employee_education
```

**Characteristics:**
- `employeeId` is NOT unique (allows multiple)
- Full CRUD operations needed
- List view + detail/edit forms
- Pagination may be needed

### Option C: JSON Column (Simple Data)
**Use when:** Data is simple, rarely queried, no relations needed

```prisma
model Employee {
  // ...
  metadata Json?  // { hobbies: [], skills: [], etc. }
}
```

**Characteristics:**
- No separate table
- Cannot join or index easily
- Good for flexible/unstructured data
- Not recommended for important data

---

# 3. Step-by-Step Implementation

## Step 1: Design the Data Model

Before coding, answer these questions:

| Question | Answer Determines |
|----------|-------------------|
| Can employee have multiple records? | 1:1 vs 1:N |
| Need bilingual fields? | Add `_am` suffix columns |
| Need soft delete? | Add `deletedAt` column |
| Need audit trail? | Add `createdBy`, `updatedBy` |
| Need file uploads? | Add `_url` suffix columns |
| Has status workflow? | Add `status` enum column |

---

## Step 2: Create Prisma Schema

### 2.1 Health Information (1:1 Example)

```prisma
// prisma/schema.prisma

model EmployeeHealthInfo {
  id                    String    @id @default(uuid())
  tenantId              String    @map("tenant_id")
  employeeId            String    @unique @map("employee_id")  // UNIQUE = 1:1
  
  // =========== Blood & Physical ===========
  bloodType             String?   @map("blood_type")           // A+, A-, B+, B-, AB+, AB-, O+, O-
  rhFactor              String?   @map("rh_factor")            // POSITIVE, NEGATIVE
  height                Decimal?  @db.Decimal(5, 2)            // cm
  weight                Decimal?  @db.Decimal(5, 2)            // kg
  bmi                   Decimal?  @db.Decimal(4, 2)            // calculated
  
  // =========== Disability ===========
  hasDisability         Boolean   @default(false) @map("has_disability")
  disabilityType        String?   @map("disability_type")      // PHYSICAL, VISUAL, HEARING, COGNITIVE, OTHER
  disabilityDescription String?   @map("disability_description")
  disabilityDescriptionAm String? @map("disability_description_am")
  disabilityPercentage  Int?      @map("disability_percentage") // 0-100
  disabilityCertificateUrl String? @map("disability_certificate_url")
  
  // =========== Medical Conditions ===========
  hasChronicCondition   Boolean   @default(false) @map("has_chronic_condition")
  chronicConditions     String?   @map("chronic_conditions")   // Comma-separated or JSON
  allergies             String?
  allergiesAm           String?   @map("allergies_am")
  currentMedications    String?   @map("current_medications")
  
  // =========== Medical History ===========
  hasSurgeryHistory     Boolean   @default(false) @map("has_surgery_history")
  surgeryHistory        String?   @map("surgery_history")
  lastCheckupDate       DateTime? @map("last_checkup_date") @db.Date
  nextCheckupDate       DateTime? @map("next_checkup_date") @db.Date
  medicalNotes          String?   @map("medical_notes")
  medicalNotesAm        String?   @map("medical_notes_am")
  
  // =========== Emergency Medical ===========
  primaryPhysician      String?   @map("primary_physician")
  physicianPhone        String?   @map("physician_phone")
  preferredHospital     String?   @map("preferred_hospital")
  preferredHospitalAm   String?   @map("preferred_hospital_am")
  
  // =========== Insurance ===========
  hasInsurance          Boolean   @default(false) @map("has_insurance")
  insuranceProvider     String?   @map("insurance_provider")
  insuranceNumber       String?   @map("insurance_number")
  insuranceExpiryDate   DateTime? @map("insurance_expiry_date") @db.Date
  
  // =========== Fitness for Duty ===========
  fitnessStatus         String?   @map("fitness_status")       // FIT, FIT_WITH_RESTRICTIONS, UNFIT, PENDING_EVALUATION
  fitnessRestrictions   String?   @map("fitness_restrictions")
  lastFitnessEvaluation DateTime? @map("last_fitness_evaluation") @db.Date
  
  // =========== Audit ===========
  createdAt             DateTime  @default(now()) @map("created_at")
  updatedAt             DateTime  @updatedAt @map("updated_at")
  createdBy             String?   @map("created_by")
  updatedBy             String?   @map("updated_by")
  
  // =========== Relations ===========
  tenant                Tenant    @relation(fields: [tenantId], references: [id])
  employee              Employee  @relation(fields: [employeeId], references: [id], onDelete: Cascade)
  
  @@map("employee_health_info")
  @@index([tenantId])
}
```

### 2.2 Marital Information (1:1 Example)

```prisma
model EmployeeMaritalInfo {
  id                    String    @id @default(uuid())
  tenantId              String    @map("tenant_id")
  employeeId            String    @unique @map("employee_id")  // UNIQUE = 1:1
  
  // =========== Status ===========
  maritalStatus         String    @map("marital_status")       // SINGLE, MARRIED, DIVORCED, WIDOWED, SEPARATED
  marriageDate          DateTime? @map("marriage_date") @db.Date
  divorceDate           DateTime? @map("divorce_date") @db.Date
  marriageCertificateUrl String?  @map("marriage_certificate_url")
  
  // =========== Spouse Information ===========
  spouseFullName        String?   @map("spouse_full_name")
  spouseFullNameAm      String?   @map("spouse_full_name_am")
  spouseDateOfBirth     DateTime? @map("spouse_date_of_birth") @db.Date
  spouseGender          String?   @map("spouse_gender")
  spouseNationalId      String?   @map("spouse_national_id")
  
  // =========== Spouse Contact ===========
  spousePhone           String?   @map("spouse_phone")
  spouseEmail           String?   @map("spouse_email")
  spouseAddress         String?   @map("spouse_address")
  spouseAddressAm       String?   @map("spouse_address_am")
  
  // =========== Spouse Employment ===========
  spouseOccupation      String?   @map("spouse_occupation")
  spouseOccupationAm    String?   @map("spouse_occupation_am")
  spouseEmployer        String?   @map("spouse_employer")
  spouseEmployerAm      String?   @map("spouse_employer_am")
  spouseWorkPhone       String?   @map("spouse_work_phone")
  
  // =========== Children Summary ===========
  numberOfChildren      Int       @default(0) @map("number_of_children")
  numberOfDependents    Int       @default(0) @map("number_of_dependents")
  
  // =========== Audit ===========
  createdAt             DateTime  @default(now()) @map("created_at")
  updatedAt             DateTime  @updatedAt @map("updated_at")
  createdBy             String?   @map("created_by")
  updatedBy             String?   @map("updated_by")
  
  // =========== Relations ===========
  tenant                Tenant    @relation(fields: [tenantId], references: [id])
  employee              Employee  @relation(fields: [employeeId], references: [id], onDelete: Cascade)
  
  @@map("employee_marital_info")
  @@index([tenantId])
}
```

### 2.3 Relatives/Dependents (1:N Example)

```prisma
model EmployeeRelative {
  id                    String    @id @default(uuid())
  tenantId              String    @map("tenant_id")
  employeeId            String    @map("employee_id")          // NOT unique = 1:N
  
  // =========== Basic Information ===========
  fullName              String    @map("full_name")
  fullNameAm            String?   @map("full_name_am")
  relationship          String                                  // SPOUSE, FATHER, MOTHER, CHILD, SIBLING, GRANDPARENT, OTHER
  relationshipOther     String?   @map("relationship_other")   // If OTHER selected
  gender                String                                  // MALE, FEMALE
  dateOfBirth           DateTime? @map("date_of_birth") @db.Date
  age                   Int?                                    // Can be calculated or manual
  
  // =========== Identification ===========
  nationalId            String?   @map("national_id")
  
  // =========== Contact ===========
  phone                 String?
  email                 String?
  address               String?
  addressAm             String?   @map("address_am")
  city                  String?
  region                String?
  
  // =========== Employment/Education ===========
  occupation            String?
  occupationAm          String?   @map("occupation_am")
  employer              String?
  employerAm            String?   @map("employer_am")
  
  // =========== For Children ===========
  isStudent             Boolean?  @map("is_student")
  schoolName            String?   @map("school_name")
  schoolNameAm          String?   @map("school_name_am")
  gradeLevel            String?   @map("grade_level")
  
  // =========== Dependency Status ===========
  isDependent           Boolean   @default(false) @map("is_dependent")
  dependencyReason      String?   @map("dependency_reason")    // MINOR, STUDENT, DISABLED, ELDERLY
  isDependentForTax     Boolean   @default(false) @map("is_dependent_for_tax")
  isDependentForInsurance Boolean @default(false) @map("is_dependent_for_insurance")
  
  // =========== Emergency Contact ===========
  isEmergencyContact    Boolean   @default(false) @map("is_emergency_contact")
  emergencyPriority     Int?      @map("emergency_priority")   // 1 = primary, 2 = secondary, etc.
  
  // =========== Beneficiary ===========
  isBeneficiary         Boolean   @default(false) @map("is_beneficiary")
  beneficiaryPercentage Decimal?  @map("beneficiary_percentage") @db.Decimal(5, 2)
  
  // =========== Health (for dependents) ===========
  hasDisability         Boolean   @default(false) @map("has_disability")
  disabilityType        String?   @map("disability_type")
  
  // =========== Living Status ===========
  isLivingWithEmployee  Boolean   @default(false) @map("is_living_with_employee")
  isAlive               Boolean   @default(true) @map("is_alive")
  deceasedDate          DateTime? @map("deceased_date") @db.Date
  
  // =========== Documents ===========
  birthCertificateUrl   String?   @map("birth_certificate_url")
  idDocumentUrl         String?   @map("id_document_url")
  
  // =========== Audit ===========
  createdAt             DateTime  @default(now()) @map("created_at")
  updatedAt             DateTime  @updatedAt @map("updated_at")
  createdBy             String?   @map("created_by")
  updatedBy             String?   @map("updated_by")
  deletedAt             DateTime? @map("deleted_at")
  
  // =========== Relations ===========
  tenant                Tenant    @relation(fields: [tenantId], references: [id])
  employee              Employee  @relation(fields: [employeeId], references: [id], onDelete: Cascade)
  
  @@map("employee_relatives")
  @@index([tenantId])
  @@index([employeeId])
  @@index([employeeId, relationship])
  @@index([employeeId, isEmergencyContact])
  @@index([employeeId, isBeneficiary])
}
```

### 2.4 Previous Employment (1:N Example)

```prisma
model EmployeePreviousEmployment {
  id                    String    @id @default(uuid())
  tenantId              String    @map("tenant_id")
  employeeId            String    @map("employee_id")          // NOT unique = 1:N
  
  // =========== Organization ===========
  organizationName      String    @map("organization_name")
  organizationNameAm    String?   @map("organization_name_am")
  organizationType      String?   @map("organization_type")    // GOVERNMENT, PRIVATE, NGO, MILITARY, INTERNATIONAL, SELF_EMPLOYED
  industry              String?
  industryAm            String?   @map("industry_am")
  organizationAddress   String?   @map("organization_address")
  organizationPhone     String?   @map("organization_phone")
  organizationWebsite   String?   @map("organization_website")
  
  // =========== Position ===========
  position              String
  positionAm            String?   @map("position_am")
  department            String?
  departmentAm          String?   @map("department_am")
  jobDescription        String?   @map("job_description")
  jobDescriptionAm      String?   @map("job_description_am")
  
  // =========== Duration ===========
  startDate             DateTime  @map("start_date") @db.Date
  endDate               DateTime? @map("end_date") @db.Date
  isCurrent             Boolean   @default(false) @map("is_current")
  durationYears         Int?      @map("duration_years")       // Calculated
  durationMonths        Int?      @map("duration_months")      // Calculated
  
  // =========== Compensation ===========
  startingSalary        Decimal?  @map("starting_salary") @db.Decimal(12, 2)
  endingSalary          Decimal?  @map("ending_salary") @db.Decimal(12, 2)
  currency              String?   @default("ETB")
  salaryFrequency       String?   @map("salary_frequency")     // MONTHLY, ANNUAL
  
  // =========== Responsibilities ===========
  responsibilities      String?
  responsibilitiesAm    String?   @map("responsibilities_am")
  achievements          String?
  achievementsAm        String?   @map("achievements_am")
  supervisorName        String?   @map("supervisor_name")
  supervisorTitle       String?   @map("supervisor_title")
  numberOfSubordinates  Int?      @map("number_of_subordinates")
  
  // =========== Leaving ===========
  reasonForLeaving      String?   @map("reason_for_leaving")   // RESIGNATION, TERMINATION, CONTRACT_END, RETIREMENT, LAYOFF, RELOCATION, CAREER_GROWTH, OTHER
  reasonForLeavingOther String?   @map("reason_for_leaving_other")
  reasonDetails         String?   @map("reason_details")
  reasonDetailsAm       String?   @map("reason_details_am")
  isEligibleForRehire   Boolean?  @map("is_eligible_for_rehire")
  
  // =========== Reference ===========
  referenceName         String?   @map("reference_name")
  referencePosition     String?   @map("reference_position")
  referencePhone        String?   @map("reference_phone")
  referenceEmail        String?   @map("reference_email")
  canContactReference   Boolean   @default(true) @map("can_contact_reference")
  referenceNotes        String?   @map("reference_notes")
  
  // =========== Verification ===========
  isVerified            Boolean   @default(false) @map("is_verified")
  verificationStatus    String?   @map("verification_status")  // PENDING, VERIFIED, FAILED, NOT_REQUIRED
  verifiedAt            DateTime? @map("verified_at")
  verifiedBy            String?   @map("verified_by")
  verificationMethod    String?   @map("verification_method")  // PHONE, EMAIL, LETTER, IN_PERSON
  verificationNotes     String?   @map("verification_notes")
  
  // =========== Documents ===========
  experienceLetterUrl   String?   @map("experience_letter_url")
  contractUrl           String?   @map("contract_url")
  payslipUrl            String?   @map("payslip_url")
  
  // =========== Sort Order ===========
  sortOrder             Int       @default(0) @map("sort_order")  // For manual ordering
  
  // =========== Audit ===========
  createdAt             DateTime  @default(now()) @map("created_at")
  updatedAt             DateTime  @updatedAt @map("updated_at")
  createdBy             String?   @map("created_by")
  updatedBy             String?   @map("updated_by")
  deletedAt             DateTime? @map("deleted_at")
  
  // =========== Relations ===========
  tenant                Tenant    @relation(fields: [tenantId], references: [id])
  employee              Employee  @relation(fields: [employeeId], references: [id], onDelete: Cascade)
  
  @@map("employee_previous_employment")
  @@index([tenantId])
  @@index([employeeId])
  @@index([employeeId, startDate])
  @@index([employeeId, endDate])
}
```

### 2.5 Update Employee Model

```prisma
model Employee {
  id                    String    @id @default(uuid())
  tenantId              String    @map("tenant_id")
  employeeNumber        String    @map("employee_number")
  // ... all existing fields ...
  
  // =========== Existing Relations ===========
  tenant                Tenant    @relation(fields: [tenantId], references: [id])
  department            Department @relation(fields: [departmentId], references: [id])
  position              Position? @relation(fields: [positionId], references: [id])
  currentRank           MilitaryRank? @relation(fields: [currentRankId], references: [id])
  supervisor            Employee? @relation("Supervisor", fields: [supervisorId], references: [id])
  subordinates          Employee[] @relation("Supervisor")
  
  // =========== NEW: Sub-module Relations ===========
  healthInfo            EmployeeHealthInfo?          // 1:1
  maritalInfo           EmployeeMaritalInfo?         // 1:1
  relatives             EmployeeRelative[]           // 1:N
  previousEmployment    EmployeePreviousEmployment[] // 1:N
  
  // =========== Existing Module Relations ===========
  contacts              EmployeeContact[]
  addresses             EmployeeAddress[]
  rankHistory           RankHistory[]
  positionHistory       PositionHistory[]
  leaveRequests         LeaveRequest[]
  leaveBalances         LeaveBalance[]
  appraisals            Appraisal[]
  salaryRecords         SalaryRecord[]
  // ... etc.
  
  @@unique([tenantId, employeeNumber])
  @@map("employees")
}
```

---

## Step 3: Run Migration

```bash
cd packages/api

# Create migration
npx prisma migrate dev --name add_employee_submodules

# Generate Prisma Client
npx prisma generate
```

---

## Step 4: Create Backend Module Structure

### 4.1 Folder Structure

```
packages/api/src/modules/employees/
├── employees.module.ts
├── employees.controller.ts
├── employees.service.ts
├── employees.repository.ts
├── dto/
│   ├── create-employee.dto.ts
│   └── update-employee.dto.ts
│
└── submodules/
    │
    ├── health/
    │   ├── health.module.ts
    │   ├── health.controller.ts
    │   ├── health.service.ts
    │   ├── health.repository.ts
    │   └── dto/
    │       ├── upsert-health.dto.ts
    │       └── health-response.dto.ts
    │
    ├── marital/
    │   ├── marital.module.ts
    │   ├── marital.controller.ts
    │   ├── marital.service.ts
    │   ├── marital.repository.ts
    │   └── dto/
    │       ├── upsert-marital.dto.ts
    │       └── marital-response.dto.ts
    │
    ├── relatives/
    │   ├── relatives.module.ts
    │   ├── relatives.controller.ts
    │   ├── relatives.service.ts
    │   ├── relatives.repository.ts
    │   └── dto/
    │       ├── create-relative.dto.ts
    │       ├── update-relative.dto.ts
    │       └── relative-response.dto.ts
    │
    └── previous-employment/
        ├── previous-employment.module.ts
        ├── previous-employment.controller.ts
        ├── previous-employment.service.ts
        ├── previous-employment.repository.ts
        └── dto/
            ├── create-previous-employment.dto.ts
            ├── update-previous-employment.dto.ts
            └── previous-employment-response.dto.ts
```

### 4.2 Health Module (1:1 Pattern)

#### health.module.ts
```typescript
import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';
import { HealthRepository } from './health.repository';

@Module({
  controllers: [HealthController],
  providers: [HealthService, HealthRepository],
  exports: [HealthService],
})
export class HealthModule {}
```

#### health.controller.ts
```typescript
import { Controller, Get, Put, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '#api/common/guards/jwt-auth.guard';
import { TenantGuard } from '#api/common/guards/tenant.guard';
import { CurrentTenant } from '#api/common/decorators/current-tenant.decorator';
import { CurrentUser } from '#api/common/decorators/current-user.decorator';
import { HealthService } from './health.service';
import { UpsertHealthDto } from './dto/upsert-health.dto';

@ApiTags('Employee Health')
@Controller('employees/:employeeId/health')
@UseGuards(JwtAuthGuard, TenantGuard)
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @ApiOperation({ summary: 'Get employee health information' })
  async findOne(
    @Param('employeeId') employeeId: string,
    @CurrentTenant() tenantId: string,
  ) {
    return this.healthService.findByEmployee(employeeId, tenantId);
  }

  @Put()
  @ApiOperation({ summary: 'Create or update employee health information' })
  async upsert(
    @Param('employeeId') employeeId: string,
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: UpsertHealthDto,
  ) {
    return this.healthService.upsert(employeeId, tenantId, userId, dto);
  }

  @Patch()
  @ApiOperation({ summary: 'Partially update employee health information' })
  async partialUpdate(
    @Param('employeeId') employeeId: string,
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: Partial<UpsertHealthDto>,
  ) {
    return this.healthService.partialUpdate(employeeId, tenantId, userId, dto);
  }
}
```

#### health.service.ts
```typescript
import { Injectable, NotFoundException } from '@nestjs/common';
import { HealthRepository } from './health.repository';
import { UpsertHealthDto } from './dto/upsert-health.dto';

@Injectable()
export class HealthService {
  constructor(private readonly repository: HealthRepository) {}

  async findByEmployee(employeeId: string, tenantId: string) {
    const health = await this.repository.findByEmployee(employeeId, tenantId);
    
    // Return null or empty object if not found (1:1 may not exist yet)
    return health;
  }

  async upsert(
    employeeId: string,
    tenantId: string,
    userId: string,
    dto: UpsertHealthDto,
  ) {
    // Check if employee exists first
    await this.validateEmployee(employeeId, tenantId);

    return this.repository.upsert(employeeId, tenantId, userId, dto);
  }

  async partialUpdate(
    employeeId: string,
    tenantId: string,
    userId: string,
    dto: Partial<UpsertHealthDto>,
  ) {
    const existing = await this.repository.findByEmployee(employeeId, tenantId);
    
    if (!existing) {
      // Create new if doesn't exist
      return this.repository.upsert(employeeId, tenantId, userId, dto as UpsertHealthDto);
    }

    return this.repository.update(existing.id, tenantId, userId, dto);
  }

  private async validateEmployee(employeeId: string, tenantId: string) {
    // Inject EmployeesService or Repository to validate
    // throw NotFoundException if employee doesn't exist
  }
}
```

#### health.repository.ts
```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from '#api/database/prisma.service';
import { UpsertHealthDto } from './dto/upsert-health.dto';

@Injectable()
export class HealthRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmployee(employeeId: string, tenantId: string) {
    return this.prisma.employeeHealthInfo.findFirst({
      where: { employeeId, tenantId },
    });
  }

  async upsert(
    employeeId: string,
    tenantId: string,
    userId: string,
    dto: UpsertHealthDto,
  ) {
    return this.prisma.employeeHealthInfo.upsert({
      where: { employeeId },
      create: {
        ...dto,
        employeeId,
        tenantId,
        createdBy: userId,
        updatedBy: userId,
      },
      update: {
        ...dto,
        updatedBy: userId,
      },
    });
  }

  async update(
    id: string,
    tenantId: string,
    userId: string,
    dto: Partial<UpsertHealthDto>,
  ) {
    return this.prisma.employeeHealthInfo.update({
      where: { id, tenantId },
      data: {
        ...dto,
        updatedBy: userId,
      },
    });
  }
}
```

#### dto/upsert-health.dto.ts
```typescript
import { IsOptional, IsString, IsBoolean, IsInt, IsDecimal, IsDateString, IsEnum, Min, Max } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export enum BloodType {
  A_POSITIVE = 'A+',
  A_NEGATIVE = 'A-',
  B_POSITIVE = 'B+',
  B_NEGATIVE = 'B-',
  AB_POSITIVE = 'AB+',
  AB_NEGATIVE = 'AB-',
  O_POSITIVE = 'O+',
  O_NEGATIVE = 'O-',
}

export enum FitnessStatus {
  FIT = 'FIT',
  FIT_WITH_RESTRICTIONS = 'FIT_WITH_RESTRICTIONS',
  UNFIT = 'UNFIT',
  PENDING_EVALUATION = 'PENDING_EVALUATION',
}

export class UpsertHealthDto {
  @ApiPropertyOptional({ enum: BloodType })
  @IsOptional()
  @IsEnum(BloodType)
  bloodType?: BloodType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDecimal()
  height?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDecimal()
  weight?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  hasDisability?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  disabilityType?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  disabilityPercentage?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  chronicConditions?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  allergies?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  lastCheckupDate?: string;

  @ApiPropertyOptional({ enum: FitnessStatus })
  @IsOptional()
  @IsEnum(FitnessStatus)
  fitnessStatus?: FitnessStatus;

  // ... add all other fields
}
```

### 4.3 Relatives Module (1:N Pattern)

#### relatives.controller.ts
```typescript
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '#api/common/guards/jwt-auth.guard';
import { TenantGuard } from '#api/common/guards/tenant.guard';
import { CurrentTenant } from '#api/common/decorators/current-tenant.decorator';
import { CurrentUser } from '#api/common/decorators/current-user.decorator';
import { RelativesService } from './relatives.service';
import { CreateRelativeDto } from './dto/create-relative.dto';
import { UpdateRelativeDto } from './dto/update-relative.dto';
import { RelativeFilterDto } from './dto/relative-filter.dto';

@ApiTags('Employee Relatives')
@Controller('employees/:employeeId/relatives')
@UseGuards(JwtAuthGuard, TenantGuard)
export class RelativesController {
  constructor(private readonly relativesService: RelativesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all relatives of an employee' })
  async findAll(
    @Param('employeeId') employeeId: string,
    @CurrentTenant() tenantId: string,
    @Query() filter: RelativeFilterDto,
  ) {
    return this.relativesService.findAll(employeeId, tenantId, filter);
  }

  @Post()
  @ApiOperation({ summary: 'Add a new relative' })
  async create(
    @Param('employeeId') employeeId: string,
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateRelativeDto,
  ) {
    return this.relativesService.create(employeeId, tenantId, userId, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific relative' })
  async findOne(
    @Param('employeeId') employeeId: string,
    @Param('id') id: string,
    @CurrentTenant() tenantId: string,
  ) {
    return this.relativesService.findOne(id, employeeId, tenantId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a relative' })
  async update(
    @Param('employeeId') employeeId: string,
    @Param('id') id: string,
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateRelativeDto,
  ) {
    return this.relativesService.update(id, employeeId, tenantId, userId, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a relative (soft delete)' })
  async delete(
    @Param('employeeId') employeeId: string,
    @Param('id') id: string,
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
  ) {
    await this.relativesService.delete(id, employeeId, tenantId, userId);
  }

  // === Special Endpoints ===

  @Get('emergency-contacts')
  @ApiOperation({ summary: 'Get emergency contacts only' })
  async getEmergencyContacts(
    @Param('employeeId') employeeId: string,
    @CurrentTenant() tenantId: string,
  ) {
    return this.relativesService.getEmergencyContacts(employeeId, tenantId);
  }

  @Get('beneficiaries')
  @ApiOperation({ summary: 'Get beneficiaries only' })
  async getBeneficiaries(
    @Param('employeeId') employeeId: string,
    @CurrentTenant() tenantId: string,
  ) {
    return this.relativesService.getBeneficiaries(employeeId, tenantId);
  }

  @Get('dependents')
  @ApiOperation({ summary: 'Get dependents only' })
  async getDependents(
    @Param('employeeId') employeeId: string,
    @CurrentTenant() tenantId: string,
  ) {
    return this.relativesService.getDependents(employeeId, tenantId);
  }
}
```

#### relatives.service.ts
```typescript
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { RelativesRepository } from './relatives.repository';
import { CreateRelativeDto } from './dto/create-relative.dto';
import { UpdateRelativeDto } from './dto/update-relative.dto';
import { RelativeFilterDto } from './dto/relative-filter.dto';

@Injectable()
export class RelativesService {
  constructor(private readonly repository: RelativesRepository) {}

  async findAll(employeeId: string, tenantId: string, filter: RelativeFilterDto) {
    return this.repository.findAll(employeeId, tenantId, filter);
  }

  async findOne(id: string, employeeId: string, tenantId: string) {
    const relative = await this.repository.findOne(id, employeeId, tenantId);
    
    if (!relative) {
      throw new NotFoundException(`Relative with ID ${id} not found`);
    }
    
    return relative;
  }

  async create(
    employeeId: string,
    tenantId: string,
    userId: string,
    dto: CreateRelativeDto,
  ) {
    // Validate beneficiary percentage if adding beneficiary
    if (dto.isBeneficiary && dto.beneficiaryPercentage) {
      await this.validateBeneficiaryPercentage(employeeId, tenantId, dto.beneficiaryPercentage);
    }

    return this.repository.create(employeeId, tenantId, userId, dto);
  }

  async update(
    id: string,
    employeeId: string,
    tenantId: string,
    userId: string,
    dto: UpdateRelativeDto,
  ) {
    // Ensure exists
    await this.findOne(id, employeeId, tenantId);

    // Validate beneficiary percentage if updating
    if (dto.isBeneficiary && dto.beneficiaryPercentage) {
      await this.validateBeneficiaryPercentage(
        employeeId,
        tenantId,
        dto.beneficiaryPercentage,
        id, // exclude current record
      );
    }

    return this.repository.update(id, tenantId, userId, dto);
  }

  async delete(id: string, employeeId: string, tenantId: string, userId: string) {
    // Ensure exists
    await this.findOne(id, employeeId, tenantId);
    
    return this.repository.softDelete(id, tenantId, userId);
  }

  async getEmergencyContacts(employeeId: string, tenantId: string) {
    return this.repository.findAll(employeeId, tenantId, {
      isEmergencyContact: true,
    });
  }

  async getBeneficiaries(employeeId: string, tenantId: string) {
    return this.repository.findAll(employeeId, tenantId, {
      isBeneficiary: true,
    });
  }

  async getDependents(employeeId: string, tenantId: string) {
    return this.repository.findAll(employeeId, tenantId, {
      isDependent: true,
    });
  }

  private async validateBeneficiaryPercentage(
    employeeId: string,
    tenantId: string,
    newPercentage: number,
    excludeId?: string,
  ) {
    const beneficiaries = await this.repository.findAll(employeeId, tenantId, {
      isBeneficiary: true,
    });

    const currentTotal = beneficiaries
      .filter(b => b.id !== excludeId)
      .reduce((sum, b) => sum + (Number(b.beneficiaryPercentage) || 0), 0);

    if (currentTotal + newPercentage > 100) {
      throw new BadRequestException(
        `Total beneficiary percentage cannot exceed 100%. Current: ${currentTotal}%, Requested: ${newPercentage}%`,
      );
    }
  }
}
```

#### relatives.repository.ts
```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from '#api/database/prisma.service';
import { CreateRelativeDto } from './dto/create-relative.dto';
import { UpdateRelativeDto } from './dto/update-relative.dto';
import { RelativeFilterDto } from './dto/relative-filter.dto';

@Injectable()
export class RelativesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(employeeId: string, tenantId: string, filter?: RelativeFilterDto) {
    return this.prisma.employeeRelative.findMany({
      where: {
        employeeId,
        tenantId,
        deletedAt: null,
        ...(filter?.relationship && { relationship: filter.relationship }),
        ...(filter?.isEmergencyContact !== undefined && { isEmergencyContact: filter.isEmergencyContact }),
        ...(filter?.isBeneficiary !== undefined && { isBeneficiary: filter.isBeneficiary }),
        ...(filter?.isDependent !== undefined && { isDependent: filter.isDependent }),
      },
      orderBy: [
        { isEmergencyContact: 'desc' },
        { emergencyPriority: 'asc' },
        { relationship: 'asc' },
        { createdAt: 'desc' },
      ],
    });
  }

  async findOne(id: string, employeeId: string, tenantId: string) {
    return this.prisma.employeeRelative.findFirst({
      where: {
        id,
        employeeId,
        tenantId,
        deletedAt: null,
      },
    });
  }

  async create(employeeId: string, tenantId: string, userId: string, dto: CreateRelativeDto) {
    return this.prisma.employeeRelative.create({
      data: {
        ...dto,
        employeeId,
        tenantId,
        createdBy: userId,
        updatedBy: userId,
      },
    });
  }

  async update(id: string, tenantId: string, userId: string, dto: UpdateRelativeDto) {
    return this.prisma.employeeRelative.update({
      where: { id, tenantId },
      data: {
        ...dto,
        updatedBy: userId,
      },
    });
  }

  async softDelete(id: string, tenantId: string, userId: string) {
    return this.prisma.employeeRelative.update({
      where: { id, tenantId },
      data: {
        deletedAt: new Date(),
        updatedBy: userId,
      },
    });
  }

  async count(employeeId: string, tenantId: string, filter?: RelativeFilterDto) {
    return this.prisma.employeeRelative.count({
      where: {
        employeeId,
        tenantId,
        deletedAt: null,
        ...(filter?.relationship && { relationship: filter.relationship }),
      },
    });
  }
}
```

---

## Step 5: Register Modules

### 5.1 Update employees.module.ts

```typescript
import { Module } from '@nestjs/common';
import { EmployeesController } from './employees.controller';
import { EmployeesService } from './employees.service';
import { EmployeesRepository } from './employees.repository';

// Import sub-modules
import { HealthModule } from './submodules/health/health.module';
import { MaritalModule } from './submodules/marital/marital.module';
import { RelativesModule } from './submodules/relatives/relatives.module';
import { PreviousEmploymentModule } from './submodules/previous-employment/previous-employment.module';

@Module({
  imports: [
    // Register sub-modules
    HealthModule,
    MaritalModule,
    RelativesModule,
    PreviousEmploymentModule,
  ],
  controllers: [EmployeesController],
  providers: [EmployeesService, EmployeesRepository],
  exports: [EmployeesService],
})
export class EmployeesModule {}
```

---

## Step 6: API Endpoints Summary

### 6.1 Health (1:1)
```
GET    /api/employees/:employeeId/health          → Get health info
PUT    /api/employees/:employeeId/health          → Create/Replace health info
PATCH  /api/employees/:employeeId/health          → Partial update health info
```

### 6.2 Marital (1:1)
```
GET    /api/employees/:employeeId/marital         → Get marital info
PUT    /api/employees/:employeeId/marital         → Create/Replace marital info
PATCH  /api/employees/:employeeId/marital         → Partial update marital info
```

### 6.3 Relatives (1:N)
```
GET    /api/employees/:employeeId/relatives                    → List all relatives
POST   /api/employees/:employeeId/relatives                    → Add relative
GET    /api/employees/:employeeId/relatives/:id                → Get relative
PUT    /api/employees/:employeeId/relatives/:id                → Update relative
DELETE /api/employees/:employeeId/relatives/:id                → Delete relative

# Special endpoints
GET    /api/employees/:employeeId/relatives/emergency-contacts → List emergency contacts
GET    /api/employees/:employeeId/relatives/beneficiaries      → List beneficiaries
GET    /api/employees/:employeeId/relatives/dependents         → List dependents
```

### 6.4 Previous Employment (1:N)
```
GET    /api/employees/:employeeId/previous-employment          → List all previous jobs
POST   /api/employees/:employeeId/previous-employment          → Add previous job
GET    /api/employees/:employeeId/previous-employment/:id      → Get previous job
PUT    /api/employees/:employeeId/previous-employment/:id      → Update previous job
DELETE /api/employees/:employeeId/previous-employment/:id      → Delete previous job
```

---

## Step 7: Frontend Integration

### 7.1 Add Tabs to Employee Detail Page

```typescript
// src/features/employees/pages/EmployeeDetailPage.tsx

const employeeTabs = [
  { id: 'overview', label: 'Overview', labelAm: 'አጠቃላይ' },
  { id: 'personal', label: 'Personal Info', labelAm: 'የግል መረጃ' },
  { id: 'employment', label: 'Employment', labelAm: 'የስራ መረጃ' },
  
  // === NEW TABS ===
  { id: 'health', label: 'Health', labelAm: 'ጤና' },
  { id: 'family', label: 'Family & Relatives', labelAm: 'ቤተሰብ' },
  { id: 'experience', label: 'Work Experience', labelAm: 'የስራ ልምድ' },
  
  // === EXISTING TABS ===
  { id: 'leave', label: 'Leave', labelAm: 'ፈቃድ' },
  { id: 'salary', label: 'Salary', labelAm: 'ደሞዝ' },
  { id: 'appraisals', label: 'Appraisals', labelAm: 'ግምገማ' },
  { id: 'documents', label: 'Documents', labelAm: 'ሰነዶች' },
];
```

### 7.2 Create Tab Components

```
src/features/employees/components/tabs/
├── OverviewTab.tsx
├── PersonalInfoTab.tsx
├── EmploymentTab.tsx
├── HealthTab.tsx              ← NEW
├── FamilyTab.tsx              ← NEW (includes marital + relatives)
├── WorkExperienceTab.tsx      ← NEW
├── LeaveTab.tsx
├── SalaryTab.tsx
├── AppraisalsTab.tsx
└── DocumentsTab.tsx
```

### 7.3 Example: HealthTab.tsx

```typescript
// src/features/employees/components/tabs/HealthTab.tsx

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { healthApi } from '#web/features/employees/services/health.api';
import { healthSchema, type HealthFormData } from '#web/features/employees/schemas/health.schema';
import { Button } from '#web/components/ui/button';
import { Form, FormField } from '#web/components/ui/form';
import { useToast } from '#web/hooks/use-toast';

export function HealthTab() {
  const { employeeId } = useParams<{ employeeId: string }>();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch health data
  const { data: health, isLoading } = useQuery({
    queryKey: ['employee-health', employeeId],
    queryFn: () => healthApi.get(employeeId!),
    enabled: !!employeeId,
  });

  // Form setup
  const form = useForm<HealthFormData>({
    resolver: zodResolver(healthSchema),
    defaultValues: health || {},
  });

  // Mutation for save
  const mutation = useMutation({
    mutationFn: (data: HealthFormData) => healthApi.upsert(employeeId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['employee-health', employeeId]);
      toast({ title: 'Health information saved successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error saving health information', variant: 'destructive' });
    },
  });

  const onSubmit = (data: HealthFormData) => {
    mutation.mutate(data);
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Blood Type */}
        <FormField
          control={form.control}
          name="bloodType"
          render={({ field }) => (
            // ... field render
          )}
        />

        {/* ... other fields */}

        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? 'Saving...' : 'Save'}
        </Button>
      </form>
    </Form>
  );
}
```

---

# 4. Quick Checklist for New Modules

| # | Step | File(s) |
|---|------|---------|
| 1 | Design data model (1:1 or 1:N) | - |
| 2 | Add Prisma model | `prisma/schema.prisma` |
| 3 | Add relation to Employee model | `prisma/schema.prisma` |
| 4 | Run migration | `npx prisma migrate dev` |
| 5 | Create module folder | `src/modules/employees/submodules/{name}/` |
| 6 | Create module file | `{name}.module.ts` |
| 7 | Create controller | `{name}.controller.ts` |
| 8 | Create service | `{name}.service.ts` |
| 9 | Create repository | `{name}.repository.ts` |
| 10 | Create DTOs | `dto/*.dto.ts` |
| 11 | Register in EmployeesModule | `employees.module.ts` |
| 12 | Add frontend tab | `EmployeeDetailPage.tsx` |
| 13 | Create tab component | `components/tabs/{Name}Tab.tsx` |
| 14 | Create API service | `services/{name}.api.ts` |
| 15 | Create form schema | `schemas/{name}.schema.ts` |
| 16 | Add translations | `locales/en/{name}.json`, `locales/am/{name}.json` |

---

# 5. Best Practices

## 5.1 Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Table | snake_case, plural | `employee_relatives` |
| Model | PascalCase, singular | `EmployeeRelative` |
| Module folder | kebab-case | `previous-employment/` |
| Controller | PascalCase + Controller | `RelativesController` |
| Service | PascalCase + Service | `RelativesService` |
| DTO | PascalCase + Dto | `CreateRelativeDto` |

## 5.2 Always Include

- `tenantId` for multi-tenancy
- `createdAt`, `updatedAt` for audit
- `deletedAt` for soft delete
- `createdBy`, `updatedBy` for user tracking
- `_am` suffix fields for Amharic translations
- Proper indexes for common queries

## 5.3 Validation Rules

- Required fields: Use `@IsNotEmpty()`
- String length: Use `@MaxLength()`
- Enums: Use `@IsEnum()`
- UUIDs: Use `@IsUUID()`
- Dates: Use `@IsDateString()`
- Nested objects: Use `@ValidateNested()` + `@Type()`

---

# 6. Future Module Ideas

Using the same pattern, you can easily add:

| Module | Relationship | Description |
|--------|--------------|-------------|
| `employee_education` | 1:N | Degrees, certificates |
| `employee_training` | 1:N | Training courses attended |
| `employee_certifications` | 1:N | Professional certifications |
| `employee_languages` | 1:N | Language proficiencies |
| `employee_skills` | 1:N | Skills and expertise |
| `employee_awards` | 1:N | Awards and recognitions |
| `employee_disciplinary` | 1:N | Disciplinary records |
| `employee_medical_records` | 1:N | Medical visit history |
| `employee_insurance` | 1:1 | Insurance details |
| `employee_bank_info` | 1:1 | Bank account details |
| `employee_tax_info` | 1:1 | Tax-related information |

---

End of Guide
