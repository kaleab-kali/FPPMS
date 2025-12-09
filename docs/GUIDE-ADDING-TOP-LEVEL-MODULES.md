# EPPMS - Guide: Adding New Top-Level Modules

## How to Add Entirely New Feature Modules

---

# 1. Overview

The EPPMS system currently has **8 core modules**:

| # | Module | Description |
|---|--------|-------------|
| 1 | Employee Management | Employee records, transfers |
| 2 | Leave Management | Leave types, requests, balances |
| 3 | Appraisal & Rank | Performance reviews, promotions |
| 4 | Salary & Payroll | Grades, records, raises |
| 5 | Service Rewards | Long service awards |
| 6 | Retirement | Retirement processing, clearance |
| 7 | Complaints | Grievance handling |
| 8 | Document Tracking | Incoming/outgoing documents |

This guide shows how to add **new top-level modules** such as:

- Training & Development
- Asset Management
- Attendance & Time Tracking
- Recruitment
- Announcements & Notices
- Meeting Management
- Vehicle Management
- Budget & Finance
- Inventory Management
- Project Management

---

# 2. Module Architecture Pattern

## 2.1 Standard Module Structure

Every module follows this pattern:

```
┌─────────────────────────────────────────────────────────────┐
│                      FRONTEND (React)                        │
├─────────────────────────────────────────────────────────────┤
│  Pages → Components → Hooks → Services → API Client          │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼ HTTP/REST
┌─────────────────────────────────────────────────────────────┐
│                      BACKEND (NestJS)                        │
├─────────────────────────────────────────────────────────────┤
│  Controller → Service → Repository → Prisma → PostgreSQL     │
└─────────────────────────────────────────────────────────────┘
```

## 2.2 Module Checklist

| Layer | Items to Create |
|-------|-----------------|
| **Database** | Prisma models, migrations, indexes |
| **Backend** | Module, Controller, Service, Repository, DTOs, Guards |
| **Frontend** | Pages, Components, Hooks, Services, Types, Routes |
| **Common** | Translations, Permissions, Menu items |

---

# 3. Example: Training & Development Module

Let's build a complete **Training Management** module step by step.

## 3.1 Requirements

- Define training programs/courses
- Schedule training sessions
- Register employees for training
- Track attendance and completion
- Issue certificates
- Track training budget
- Generate reports

---

# 4. Step 1: Database Design

## 4.1 Entity Relationship

```
┌──────────────────┐       ┌──────────────────┐
│ training_programs │──┬───│ training_sessions │
└──────────────────┘  │   └──────────────────┘
                      │            │
                      │            │
                      │   ┌────────┴────────┐
                      │   │                 │
                      ▼   ▼                 ▼
              ┌─────────────────┐   ┌─────────────────┐
              │training_enrollments│ │session_attendance│
              └─────────────────┘   └─────────────────┘
                      │
                      ▼
              ┌─────────────────┐
              │training_certificates│
              └─────────────────┘
```

## 4.2 Prisma Schema

```prisma
// =============================================================================
// TRAINING & DEVELOPMENT MODULE
// =============================================================================

// -----------------------------------------------------------------------------
// Training Categories (Lookup Table)
// -----------------------------------------------------------------------------
model TrainingCategory {
  id              String    @id @default(uuid())
  tenantId        String    @map("tenant_id")
  
  code            String
  name            String
  nameAm          String?   @map("name_am")
  description     String?
  
  isActive        Boolean   @default(true) @map("is_active")
  createdAt       DateTime  @default(now()) @map("created_at")
  updatedAt       DateTime  @updatedAt @map("updated_at")
  
  // Relations
  tenant          Tenant    @relation(fields: [tenantId], references: [id])
  programs        TrainingProgram[]
  
  @@unique([tenantId, code])
  @@map("training_categories")
  @@index([tenantId])
}

// -----------------------------------------------------------------------------
// Training Programs (Course Definitions)
// -----------------------------------------------------------------------------
model TrainingProgram {
  id              String    @id @default(uuid())
  tenantId        String    @map("tenant_id")
  
  // Basic Info
  code            String
  title           String
  titleAm         String?   @map("title_am")
  description     String?   @db.Text
  descriptionAm   String?   @map("description_am") @db.Text
  
  // Classification
  categoryId      String?   @map("category_id")
  type            String    // INTERNAL, EXTERNAL, ONLINE, WORKSHOP, SEMINAR, CONFERENCE
  level           String?   // BEGINNER, INTERMEDIATE, ADVANCED
  
  // Duration
  durationHours   Int?      @map("duration_hours")
  durationDays    Int?      @map("duration_days")
  
  // Requirements
  prerequisites   String?   @db.Text
  targetAudience  String?   @map("target_audience")  // MILITARY, CIVILIAN, ALL, MANAGEMENT
  minParticipants Int?      @map("min_participants")
  maxParticipants Int?      @map("max_participants")
  
  // Cost
  estimatedCost   Decimal?  @map("estimated_cost") @db.Decimal(12, 2)
  costPerPerson   Decimal?  @map("cost_per_person") @db.Decimal(12, 2)
  currency        String?   @default("ETB")
  
  // Provider (for external training)
  providerName    String?   @map("provider_name")
  providerContact String?   @map("provider_contact")
  
  // Certification
  hasCertificate  Boolean   @default(false) @map("has_certificate")
  certificateValidityMonths Int? @map("certificate_validity_months")
  
  // Materials
  materialsUrl    String?   @map("materials_url")
  syllabusUrl     String?   @map("syllabus_url")
  
  // Status
  status          String    @default("DRAFT")  // DRAFT, ACTIVE, ARCHIVED
  isActive        Boolean   @default(true) @map("is_active")
  
  // Audit
  createdAt       DateTime  @default(now()) @map("created_at")
  updatedAt       DateTime  @updatedAt @map("updated_at")
  createdBy       String?   @map("created_by")
  updatedBy       String?   @map("updated_by")
  deletedAt       DateTime? @map("deleted_at")
  
  // Relations
  tenant          Tenant    @relation(fields: [tenantId], references: [id])
  category        TrainingCategory? @relation(fields: [categoryId], references: [id])
  sessions        TrainingSession[]
  enrollments     TrainingEnrollment[]
  
  @@unique([tenantId, code])
  @@map("training_programs")
  @@index([tenantId])
  @@index([tenantId, status])
  @@index([categoryId])
}

// -----------------------------------------------------------------------------
// Training Sessions (Scheduled Instances of Programs)
// -----------------------------------------------------------------------------
model TrainingSession {
  id              String    @id @default(uuid())
  tenantId        String    @map("tenant_id")
  programId       String    @map("program_id")
  
  // Session Info
  sessionCode     String    @map("session_code")
  title           String?   // Override program title if needed
  titleAm         String?   @map("title_am")
  
  // Schedule
  startDate       DateTime  @map("start_date") @db.Date
  endDate         DateTime  @map("end_date") @db.Date
  startTime       String?   @map("start_time")  // "09:00"
  endTime         String?   @map("end_time")    // "17:00"
  
  // Location
  locationType    String    @map("location_type")  // ONSITE, OFFSITE, ONLINE, HYBRID
  location        String?
  locationAm      String?   @map("location_am")
  roomNumber      String?   @map("room_number")
  onlineUrl       String?   @map("online_url")
  onlinePlatform  String?   @map("online_platform")  // ZOOM, TEAMS, MEET
  
  // Trainer/Facilitator
  trainerType     String?   @map("trainer_type")  // INTERNAL, EXTERNAL
  trainerEmployeeId String? @map("trainer_employee_id")
  trainerName     String?   @map("trainer_name")
  trainerNameAm   String?   @map("trainer_name_am")
  trainerContact  String?   @map("trainer_contact")
  trainerBio      String?   @map("trainer_bio") @db.Text
  
  // Capacity
  capacity        Int?
  enrolledCount   Int       @default(0) @map("enrolled_count")
  attendedCount   Int       @default(0) @map("attended_count")
  
  // Budget
  budgetAllocated Decimal?  @map("budget_allocated") @db.Decimal(12, 2)
  actualCost      Decimal?  @map("actual_cost") @db.Decimal(12, 2)
  
  // Status
  status          String    @default("SCHEDULED")  // SCHEDULED, ONGOING, COMPLETED, CANCELLED, POSTPONED
  cancellationReason String? @map("cancellation_reason")
  
  // Evaluation
  averageRating   Decimal?  @map("average_rating") @db.Decimal(3, 2)
  feedbackCount   Int       @default(0) @map("feedback_count")
  
  // Audit
  createdAt       DateTime  @default(now()) @map("created_at")
  updatedAt       DateTime  @updatedAt @map("updated_at")
  createdBy       String?   @map("created_by")
  updatedBy       String?   @map("updated_by")
  deletedAt       DateTime? @map("deleted_at")
  
  // Relations
  tenant          Tenant    @relation(fields: [tenantId], references: [id])
  program         TrainingProgram @relation(fields: [programId], references: [id])
  trainerEmployee Employee? @relation("SessionTrainer", fields: [trainerEmployeeId], references: [id])
  enrollments     TrainingEnrollment[]
  attendance      TrainingAttendance[]
  feedback        TrainingFeedback[]
  
  @@unique([tenantId, sessionCode])
  @@map("training_sessions")
  @@index([tenantId])
  @@index([programId])
  @@index([tenantId, status])
  @@index([tenantId, startDate])
}

// -----------------------------------------------------------------------------
// Training Enrollments (Employee Registration for Sessions)
// -----------------------------------------------------------------------------
model TrainingEnrollment {
  id              String    @id @default(uuid())
  tenantId        String    @map("tenant_id")
  sessionId       String    @map("session_id")
  programId       String    @map("program_id")
  employeeId      String    @map("employee_id")
  
  // Enrollment Details
  enrollmentDate  DateTime  @default(now()) @map("enrollment_date")
  enrolledBy      String?   @map("enrolled_by")  // Self or manager
  
  // Approval
  requiresApproval Boolean  @default(true) @map("requires_approval")
  approvalStatus  String    @default("PENDING") @map("approval_status")  // PENDING, APPROVED, REJECTED
  approvedBy      String?   @map("approved_by")
  approvedAt      DateTime? @map("approved_at")
  rejectionReason String?   @map("rejection_reason")
  
  // Attendance
  attendanceStatus String   @default("REGISTERED") @map("attendance_status")  // REGISTERED, ATTENDED, PARTIAL, ABSENT, EXCUSED
  attendancePercentage Decimal? @map("attendance_percentage") @db.Decimal(5, 2)
  
  // Completion
  completionStatus String   @default("NOT_STARTED") @map("completion_status")  // NOT_STARTED, IN_PROGRESS, COMPLETED, FAILED, INCOMPLETE
  completedAt     DateTime? @map("completed_at")
  
  // Assessment
  preTestScore    Decimal?  @map("pre_test_score") @db.Decimal(5, 2)
  postTestScore   Decimal?  @map("post_test_score") @db.Decimal(5, 2)
  finalScore      Decimal?  @map("final_score") @db.Decimal(5, 2)
  grade           String?   // A, B, C, D, F or PASS, FAIL
  
  // Certificate
  certificateIssued Boolean @default(false) @map("certificate_issued")
  certificateId   String?   @map("certificate_id")
  
  // Notes
  remarks         String?   @db.Text
  
  // Audit
  createdAt       DateTime  @default(now()) @map("created_at")
  updatedAt       DateTime  @updatedAt @map("updated_at")
  deletedAt       DateTime? @map("deleted_at")
  
  // Relations
  tenant          Tenant    @relation(fields: [tenantId], references: [id])
  session         TrainingSession @relation(fields: [sessionId], references: [id])
  program         TrainingProgram @relation(fields: [programId], references: [id])
  employee        Employee  @relation(fields: [employeeId], references: [id])
  certificate     TrainingCertificate? @relation(fields: [certificateId], references: [id])
  
  @@unique([sessionId, employeeId])
  @@map("training_enrollments")
  @@index([tenantId])
  @@index([sessionId])
  @@index([employeeId])
  @@index([tenantId, approvalStatus])
  @@index([tenantId, completionStatus])
}

// -----------------------------------------------------------------------------
// Training Attendance (Daily/Session Attendance Records)
// -----------------------------------------------------------------------------
model TrainingAttendance {
  id              String    @id @default(uuid())
  tenantId        String    @map("tenant_id")
  sessionId       String    @map("session_id")
  employeeId      String    @map("employee_id")
  
  // Attendance
  attendanceDate  DateTime  @map("attendance_date") @db.Date
  checkInTime     String?   @map("check_in_time")
  checkOutTime    String?   @map("check_out_time")
  status          String    // PRESENT, ABSENT, LATE, EXCUSED, HALF_DAY
  
  // Notes
  remarks         String?
  excuseReason    String?   @map("excuse_reason")
  
  // Recorded by
  recordedBy      String?   @map("recorded_by")
  recordedAt      DateTime  @default(now()) @map("recorded_at")
  
  // Relations
  tenant          Tenant    @relation(fields: [tenantId], references: [id])
  session         TrainingSession @relation(fields: [sessionId], references: [id])
  employee        Employee  @relation(fields: [employeeId], references: [id])
  
  @@unique([sessionId, employeeId, attendanceDate])
  @@map("training_attendance")
  @@index([tenantId])
  @@index([sessionId])
  @@index([employeeId])
}

// -----------------------------------------------------------------------------
// Training Certificates
// -----------------------------------------------------------------------------
model TrainingCertificate {
  id              String    @id @default(uuid())
  tenantId        String    @map("tenant_id")
  employeeId      String    @map("employee_id")
  programId       String    @map("program_id")
  sessionId       String?   @map("session_id")
  
  // Certificate Info
  certificateNumber String  @map("certificate_number")
  title           String
  titleAm         String?   @map("title_am")
  
  // Dates
  issueDate       DateTime  @map("issue_date") @db.Date
  expiryDate      DateTime? @map("expiry_date") @db.Date
  isExpired       Boolean   @default(false) @map("is_expired")
  
  // Scores
  finalScore      Decimal?  @map("final_score") @db.Decimal(5, 2)
  grade           String?
  
  // Document
  certificateUrl  String?   @map("certificate_url")
  
  // Verification
  verificationCode String?  @map("verification_code")
  isVerified      Boolean   @default(true) @map("is_verified")
  
  // Issuer
  issuedBy        String?   @map("issued_by")
  issuerTitle     String?   @map("issuer_title")
  issuerSignatureUrl String? @map("issuer_signature_url")
  
  // Status
  status          String    @default("ACTIVE")  // ACTIVE, REVOKED, EXPIRED
  revocationReason String?  @map("revocation_reason")
  
  // Audit
  createdAt       DateTime  @default(now()) @map("created_at")
  updatedAt       DateTime  @updatedAt @map("updated_at")
  
  // Relations
  tenant          Tenant    @relation(fields: [tenantId], references: [id])
  employee        Employee  @relation(fields: [employeeId], references: [id])
  program         TrainingProgram @relation(fields: [programId], references: [id])
  enrollments     TrainingEnrollment[]
  
  @@unique([tenantId, certificateNumber])
  @@map("training_certificates")
  @@index([tenantId])
  @@index([employeeId])
  @@index([programId])
  @@index([tenantId, expiryDate])
}

// -----------------------------------------------------------------------------
// Training Feedback
// -----------------------------------------------------------------------------
model TrainingFeedback {
  id              String    @id @default(uuid())
  tenantId        String    @map("tenant_id")
  sessionId       String    @map("session_id")
  employeeId      String    @map("employee_id")
  
  // Ratings (1-5)
  overallRating   Int       @map("overall_rating")
  contentRating   Int?      @map("content_rating")
  trainerRating   Int?      @map("trainer_rating")
  materialsRating Int?      @map("materials_rating")
  venueRating     Int?      @map("venue_rating")
  
  // Feedback Text
  strengths       String?   @db.Text
  improvements    String?   @db.Text
  comments        String?   @db.Text
  
  // Would recommend
  wouldRecommend  Boolean?  @map("would_recommend")
  
  // Anonymous
  isAnonymous     Boolean   @default(false) @map("is_anonymous")
  
  // Audit
  submittedAt     DateTime  @default(now()) @map("submitted_at")
  
  // Relations
  tenant          Tenant    @relation(fields: [tenantId], references: [id])
  session         TrainingSession @relation(fields: [sessionId], references: [id])
  employee        Employee  @relation(fields: [employeeId], references: [id])
  
  @@unique([sessionId, employeeId])
  @@map("training_feedback")
  @@index([tenantId])
  @@index([sessionId])
}

// -----------------------------------------------------------------------------
// Training Budget (Annual/Departmental)
// -----------------------------------------------------------------------------
model TrainingBudget {
  id              String    @id @default(uuid())
  tenantId        String    @map("tenant_id")
  
  // Period
  fiscalYear      Int       @map("fiscal_year")
  departmentId    String?   @map("department_id")
  
  // Budget
  allocatedAmount Decimal   @map("allocated_amount") @db.Decimal(14, 2)
  usedAmount      Decimal   @default(0) @map("used_amount") @db.Decimal(14, 2)
  remainingAmount Decimal   @default(0) @map("remaining_amount") @db.Decimal(14, 2)
  
  // Status
  status          String    @default("ACTIVE")  // ACTIVE, FROZEN, CLOSED
  
  // Notes
  remarks         String?
  
  // Audit
  createdAt       DateTime  @default(now()) @map("created_at")
  updatedAt       DateTime  @updatedAt @map("updated_at")
  createdBy       String?   @map("created_by")
  
  // Relations
  tenant          Tenant    @relation(fields: [tenantId], references: [id])
  department      Department? @relation(fields: [departmentId], references: [id])
  
  @@unique([tenantId, fiscalYear, departmentId])
  @@map("training_budgets")
  @@index([tenantId])
  @@index([tenantId, fiscalYear])
}
```

## 4.3 Update Employee Model

```prisma
model Employee {
  // ... existing fields and relations ...
  
  // Training Relations
  trainingSessions    TrainingSession[] @relation("SessionTrainer")
  trainingEnrollments TrainingEnrollment[]
  trainingAttendance  TrainingAttendance[]
  trainingCertificates TrainingCertificate[]
  trainingFeedback    TrainingFeedback[]
}
```

## 4.4 Run Migration

```bash
cd packages/api
npx prisma migrate dev --name add_training_module
npx prisma generate
```

---

# 5. Step 2: Backend Implementation

## 5.1 Folder Structure

```
packages/api/src/modules/training/
├── training.module.ts
├── programs/
│   ├── programs.controller.ts
│   ├── programs.service.ts
│   ├── programs.repository.ts
│   └── dto/
│       ├── create-program.dto.ts
│       ├── update-program.dto.ts
│       ├── program-filter.dto.ts
│       └── program-response.dto.ts
├── sessions/
│   ├── sessions.controller.ts
│   ├── sessions.service.ts
│   ├── sessions.repository.ts
│   └── dto/
│       ├── create-session.dto.ts
│       ├── update-session.dto.ts
│       └── session-filter.dto.ts
├── enrollments/
│   ├── enrollments.controller.ts
│   ├── enrollments.service.ts
│   ├── enrollments.repository.ts
│   └── dto/
│       ├── enroll.dto.ts
│       ├── approve-enrollment.dto.ts
│       └── enrollment-filter.dto.ts
├── attendance/
│   ├── attendance.controller.ts
│   ├── attendance.service.ts
│   └── dto/
├── certificates/
│   ├── certificates.controller.ts
│   ├── certificates.service.ts
│   └── dto/
├── feedback/
│   ├── feedback.controller.ts
│   ├── feedback.service.ts
│   └── dto/
├── categories/
│   ├── categories.controller.ts
│   ├── categories.service.ts
│   └── dto/
└── budget/
    ├── budget.controller.ts
    ├── budget.service.ts
    └── dto/
```

## 5.2 Main Module

```typescript
// training.module.ts
import { Module } from '@nestjs/common';
import { ProgramsController } from './programs/programs.controller';
import { ProgramsService } from './programs/programs.service';
import { ProgramsRepository } from './programs/programs.repository';
import { SessionsController } from './sessions/sessions.controller';
import { SessionsService } from './sessions/sessions.service';
import { SessionsRepository } from './sessions/sessions.repository';
import { EnrollmentsController } from './enrollments/enrollments.controller';
import { EnrollmentsService } from './enrollments/enrollments.service';
import { EnrollmentsRepository } from './enrollments/enrollments.repository';
import { AttendanceController } from './attendance/attendance.controller';
import { AttendanceService } from './attendance/attendance.service';
import { CertificatesController } from './certificates/certificates.controller';
import { CertificatesService } from './certificates/certificates.service';
import { FeedbackController } from './feedback/feedback.controller';
import { FeedbackService } from './feedback/feedback.service';
import { CategoriesController } from './categories/categories.controller';
import { CategoriesService } from './categories/categories.service';
import { BudgetController } from './budget/budget.controller';
import { BudgetService } from './budget/budget.service';

@Module({
  controllers: [
    ProgramsController,
    SessionsController,
    EnrollmentsController,
    AttendanceController,
    CertificatesController,
    FeedbackController,
    CategoriesController,
    BudgetController,
  ],
  providers: [
    ProgramsService,
    ProgramsRepository,
    SessionsService,
    SessionsRepository,
    EnrollmentsService,
    EnrollmentsRepository,
    AttendanceService,
    CertificatesService,
    FeedbackService,
    CategoriesService,
    BudgetService,
  ],
  exports: [
    ProgramsService,
    SessionsService,
    EnrollmentsService,
    CertificatesService,
  ],
})
export class TrainingModule {}
```

## 5.3 Register in App Module

```typescript
// app.module.ts
import { Module } from '@nestjs/common';
import { TrainingModule } from './modules/training/training.module';
// ... other imports

@Module({
  imports: [
    // ... existing modules
    EmployeesModule,
    LeaveModule,
    AppraisalModule,
    SalaryModule,
    RewardsModule,
    RetirementModule,
    ComplaintsModule,
    DocumentsModule,
    
    // NEW MODULE
    TrainingModule,
  ],
})
export class AppModule {}
```

## 5.4 Programs Controller

```typescript
// programs/programs.controller.ts
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
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '#api/common/guards/jwt-auth.guard';
import { TenantGuard } from '#api/common/guards/tenant.guard';
import { RolesGuard } from '#api/common/guards/roles.guard';
import { Roles } from '#api/common/decorators/roles.decorator';
import { CurrentTenant } from '#api/common/decorators/current-tenant.decorator';
import { CurrentUser } from '#api/common/decorators/current-user.decorator';
import { ApiPagination } from '#api/common/decorators/api-pagination.decorator';
import { PaginationDto } from '#api/common/dto/pagination.dto';
import { ProgramsService } from './programs.service';
import { CreateProgramDto } from './dto/create-program.dto';
import { UpdateProgramDto } from './dto/update-program.dto';
import { ProgramFilterDto } from './dto/program-filter.dto';

@ApiTags('Training Programs')
@ApiBearerAuth()
@Controller('training/programs')
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
export class ProgramsController {
  constructor(private readonly programsService: ProgramsService) {}

  @Get()
  @ApiOperation({ summary: 'List all training programs' })
  @ApiPagination()
  async findAll(
    @CurrentTenant() tenantId: string,
    @Query() filter: ProgramFilterDto,
    @Query() pagination: PaginationDto,
  ) {
    return this.programsService.findAll(tenantId, filter, pagination);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get training program by ID' })
  async findOne(
    @Param('id') id: string,
    @CurrentTenant() tenantId: string,
  ) {
    return this.programsService.findOne(id, tenantId);
  }

  @Post()
  @Roles('ADMIN', 'HR_MANAGER', 'TRAINING_MANAGER')
  @ApiOperation({ summary: 'Create a new training program' })
  async create(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateProgramDto,
  ) {
    return this.programsService.create(tenantId, userId, dto);
  }

  @Put(':id')
  @Roles('ADMIN', 'HR_MANAGER', 'TRAINING_MANAGER')
  @ApiOperation({ summary: 'Update a training program' })
  async update(
    @Param('id') id: string,
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateProgramDto,
  ) {
    return this.programsService.update(id, tenantId, userId, dto);
  }

  @Delete(':id')
  @Roles('ADMIN', 'HR_MANAGER')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a training program (soft delete)' })
  async delete(
    @Param('id') id: string,
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
  ) {
    await this.programsService.delete(id, tenantId, userId);
  }

  @Post(':id/activate')
  @Roles('ADMIN', 'HR_MANAGER', 'TRAINING_MANAGER')
  @ApiOperation({ summary: 'Activate a training program' })
  async activate(
    @Param('id') id: string,
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.programsService.updateStatus(id, tenantId, userId, 'ACTIVE');
  }

  @Post(':id/archive')
  @Roles('ADMIN', 'HR_MANAGER', 'TRAINING_MANAGER')
  @ApiOperation({ summary: 'Archive a training program' })
  async archive(
    @Param('id') id: string,
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.programsService.updateStatus(id, tenantId, userId, 'ARCHIVED');
  }
}
```

## 5.5 Programs Service

```typescript
// programs/programs.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ProgramsRepository } from './programs.repository';
import { CreateProgramDto } from './dto/create-program.dto';
import { UpdateProgramDto } from './dto/update-program.dto';
import { ProgramFilterDto } from './dto/program-filter.dto';
import { PaginationDto } from '#api/common/dto/pagination.dto';
import { PaginatedResponseDto } from '#api/common/dto/paginated-response.dto';

@Injectable()
export class ProgramsService {
  constructor(
    private readonly repository: ProgramsRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async findAll(
    tenantId: string,
    filter: ProgramFilterDto,
    pagination: PaginationDto,
  ) {
    const { data, total } = await this.repository.findAll(tenantId, filter, pagination);
    return new PaginatedResponseDto(data, total, pagination);
  }

  async findOne(id: string, tenantId: string) {
    const program = await this.repository.findById(id, tenantId);
    
    if (!program) {
      throw new NotFoundException(`Training program with ID ${id} not found`);
    }
    
    return program;
  }

  async create(tenantId: string, userId: string, dto: CreateProgramDto) {
    // Validate unique code
    const existing = await this.repository.findByCode(dto.code, tenantId);
    if (existing) {
      throw new BadRequestException(`Program with code ${dto.code} already exists`);
    }

    const program = await this.repository.create(tenantId, userId, dto);

    // Emit event for audit logging
    this.eventEmitter.emit('training.program.created', {
      tenantId,
      userId,
      programId: program.id,
      program,
    });

    return program;
  }

  async update(id: string, tenantId: string, userId: string, dto: UpdateProgramDto) {
    await this.findOne(id, tenantId);

    // If code is being updated, check for duplicates
    if (dto.code) {
      const existing = await this.repository.findByCode(dto.code, tenantId);
      if (existing && existing.id !== id) {
        throw new BadRequestException(`Program with code ${dto.code} already exists`);
      }
    }

    const program = await this.repository.update(id, tenantId, userId, dto);

    this.eventEmitter.emit('training.program.updated', {
      tenantId,
      userId,
      programId: program.id,
      changes: dto,
    });

    return program;
  }

  async delete(id: string, tenantId: string, userId: string) {
    const program = await this.findOne(id, tenantId);

    // Check if program has active sessions
    const activeSessions = await this.repository.countActiveSessions(id, tenantId);
    if (activeSessions > 0) {
      throw new BadRequestException(
        `Cannot delete program with ${activeSessions} active sessions. Archive it instead.`
      );
    }

    await this.repository.softDelete(id, tenantId, userId);

    this.eventEmitter.emit('training.program.deleted', {
      tenantId,
      userId,
      programId: id,
    });
  }

  async updateStatus(id: string, tenantId: string, userId: string, status: string) {
    await this.findOne(id, tenantId);
    return this.repository.updateStatus(id, tenantId, userId, status);
  }
}
```

## 5.6 Enrollments Controller (with Approval Workflow)

```typescript
// enrollments/enrollments.controller.ts
import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '#api/common/guards/jwt-auth.guard';
import { TenantGuard } from '#api/common/guards/tenant.guard';
import { CurrentTenant } from '#api/common/decorators/current-tenant.decorator';
import { CurrentUser } from '#api/common/decorators/current-user.decorator';
import { EnrollmentsService } from './enrollments.service';
import { EnrollDto } from './dto/enroll.dto';
import { ApproveEnrollmentDto } from './dto/approve-enrollment.dto';
import { EnrollmentFilterDto } from './dto/enrollment-filter.dto';

@ApiTags('Training Enrollments')
@ApiBearerAuth()
@Controller('training')
@UseGuards(JwtAuthGuard, TenantGuard)
export class EnrollmentsController {
  constructor(private readonly enrollmentsService: EnrollmentsService) {}

  // === Session-based endpoints ===

  @Get('sessions/:sessionId/enrollments')
  @ApiOperation({ summary: 'Get all enrollments for a session' })
  async findBySession(
    @Param('sessionId') sessionId: string,
    @CurrentTenant() tenantId: string,
    @Query() filter: EnrollmentFilterDto,
  ) {
    return this.enrollmentsService.findBySession(sessionId, tenantId, filter);
  }

  @Post('sessions/:sessionId/enroll')
  @ApiOperation({ summary: 'Enroll employee(s) in a training session' })
  async enroll(
    @Param('sessionId') sessionId: string,
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: EnrollDto,
  ) {
    return this.enrollmentsService.enroll(sessionId, tenantId, userId, dto);
  }

  @Post('sessions/:sessionId/enroll/self')
  @ApiOperation({ summary: 'Self-enroll in a training session' })
  async selfEnroll(
    @Param('sessionId') sessionId: string,
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: any,
  ) {
    return this.enrollmentsService.selfEnroll(sessionId, tenantId, user);
  }

  // === Enrollment management ===

  @Get('enrollments/:id')
  @ApiOperation({ summary: 'Get enrollment details' })
  async findOne(
    @Param('id') id: string,
    @CurrentTenant() tenantId: string,
  ) {
    return this.enrollmentsService.findOne(id, tenantId);
  }

  @Post('enrollments/:id/approve')
  @ApiOperation({ summary: 'Approve an enrollment' })
  async approve(
    @Param('id') id: string,
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: ApproveEnrollmentDto,
  ) {
    return this.enrollmentsService.approve(id, tenantId, userId, dto);
  }

  @Post('enrollments/:id/reject')
  @ApiOperation({ summary: 'Reject an enrollment' })
  async reject(
    @Param('id') id: string,
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: ApproveEnrollmentDto,
  ) {
    return this.enrollmentsService.reject(id, tenantId, userId, dto);
  }

  @Post('enrollments/:id/cancel')
  @ApiOperation({ summary: 'Cancel an enrollment' })
  async cancel(
    @Param('id') id: string,
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.enrollmentsService.cancel(id, tenantId, userId);
  }

  @Post('enrollments/:id/complete')
  @ApiOperation({ summary: 'Mark enrollment as completed' })
  async complete(
    @Param('id') id: string,
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: { score?: number; grade?: string },
  ) {
    return this.enrollmentsService.complete(id, tenantId, userId, dto);
  }

  // === Employee's training history ===

  @Get('employees/:employeeId/enrollments')
  @ApiOperation({ summary: 'Get training history for an employee' })
  async findByEmployee(
    @Param('employeeId') employeeId: string,
    @CurrentTenant() tenantId: string,
    @Query() filter: EnrollmentFilterDto,
  ) {
    return this.enrollmentsService.findByEmployee(employeeId, tenantId, filter);
  }

  // === Pending approvals ===

  @Get('enrollments/pending')
  @ApiOperation({ summary: 'Get pending enrollment approvals' })
  async findPending(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: any,
  ) {
    return this.enrollmentsService.findPendingApprovals(tenantId, user);
  }
}
```

---

# 6. Step 3: API Endpoints Summary

## 6.1 Training Programs
```
GET    /api/training/programs                    → List programs
POST   /api/training/programs                    → Create program
GET    /api/training/programs/:id                → Get program
PUT    /api/training/programs/:id                → Update program
DELETE /api/training/programs/:id                → Delete program
POST   /api/training/programs/:id/activate       → Activate
POST   /api/training/programs/:id/archive        → Archive
```

## 6.2 Training Sessions
```
GET    /api/training/sessions                    → List sessions
POST   /api/training/sessions                    → Create session
GET    /api/training/sessions/:id                → Get session
PUT    /api/training/sessions/:id                → Update session
DELETE /api/training/sessions/:id                → Delete session
POST   /api/training/sessions/:id/cancel         → Cancel session
POST   /api/training/sessions/:id/complete       → Mark completed
GET    /api/training/sessions/upcoming           → Get upcoming sessions
GET    /api/training/sessions/calendar           → Calendar view
```

## 6.3 Enrollments
```
GET    /api/training/sessions/:sessionId/enrollments    → List enrollments
POST   /api/training/sessions/:sessionId/enroll         → Enroll employees
POST   /api/training/sessions/:sessionId/enroll/self    → Self-enroll
GET    /api/training/enrollments/:id                    → Get enrollment
POST   /api/training/enrollments/:id/approve            → Approve
POST   /api/training/enrollments/:id/reject             → Reject
POST   /api/training/enrollments/:id/cancel             → Cancel
POST   /api/training/enrollments/:id/complete           → Complete
GET    /api/training/enrollments/pending                → Pending approvals
GET    /api/training/employees/:employeeId/enrollments  → Employee history
```

## 6.4 Attendance
```
GET    /api/training/sessions/:sessionId/attendance           → Get attendance
POST   /api/training/sessions/:sessionId/attendance           → Record attendance
PUT    /api/training/sessions/:sessionId/attendance/:id       → Update attendance
POST   /api/training/sessions/:sessionId/attendance/bulk      → Bulk attendance
```

## 6.5 Certificates
```
GET    /api/training/certificates                        → List certificates
GET    /api/training/certificates/:id                    → Get certificate
POST   /api/training/enrollments/:id/issue-certificate   → Issue certificate
GET    /api/training/certificates/verify/:code           → Verify certificate
GET    /api/training/employees/:employeeId/certificates  → Employee certificates
GET    /api/training/certificates/expiring               → Expiring soon
```

## 6.6 Feedback
```
POST   /api/training/sessions/:sessionId/feedback        → Submit feedback
GET    /api/training/sessions/:sessionId/feedback        → Get session feedback
GET    /api/training/programs/:programId/feedback        → Get program feedback
```

## 6.7 Categories
```
GET    /api/training/categories                    → List categories
POST   /api/training/categories                    → Create category
PUT    /api/training/categories/:id                → Update category
DELETE /api/training/categories/:id                → Delete category
```

## 6.8 Budget
```
GET    /api/training/budgets                       → List budgets
POST   /api/training/budgets                       → Create budget
PUT    /api/training/budgets/:id                   → Update budget
GET    /api/training/budgets/summary               → Budget summary
```

---

# 7. Step 4: Frontend Implementation

## 7.1 Folder Structure

```
packages/web/src/features/training/
├── index.ts                          # Barrel export
├── components/
│   ├── ProgramCard.tsx
│   ├── ProgramForm.tsx
│   ├── SessionCard.tsx
│   ├── SessionForm.tsx
│   ├── SessionCalendar.tsx
│   ├── EnrollmentList.tsx
│   ├── EnrollmentForm.tsx
│   ├── AttendanceSheet.tsx
│   ├── CertificateCard.tsx
│   ├── CertificateViewer.tsx
│   ├── FeedbackForm.tsx
│   ├── TrainingStats.tsx
│   └── filters/
│       ├── ProgramFilters.tsx
│       └── SessionFilters.tsx
├── pages/
│   ├── TrainingDashboard.tsx
│   ├── ProgramsListPage.tsx
│   ├── ProgramDetailPage.tsx
│   ├── ProgramFormPage.tsx
│   ├── SessionsListPage.tsx
│   ├── SessionDetailPage.tsx
│   ├── SessionFormPage.tsx
│   ├── EnrollmentsPage.tsx
│   ├── AttendancePage.tsx
│   ├── CertificatesPage.tsx
│   ├── MyTrainingPage.tsx              # Employee's own training
│   ├── TrainingCalendarPage.tsx
│   ├── TrainingReportsPage.tsx
│   └── BudgetPage.tsx
├── hooks/
│   ├── usePrograms.ts
│   ├── useSessions.ts
│   ├── useEnrollments.ts
│   ├── useCertificates.ts
│   └── useTrainingStats.ts
├── services/
│   ├── programs.api.ts
│   ├── sessions.api.ts
│   ├── enrollments.api.ts
│   ├── attendance.api.ts
│   ├── certificates.api.ts
│   ├── feedback.api.ts
│   └── budget.api.ts
├── schemas/
│   ├── program.schema.ts
│   ├── session.schema.ts
│   ├── enrollment.schema.ts
│   └── feedback.schema.ts
└── types/
    └── training.types.ts
```

## 7.2 Add Routes

```typescript
// src/routes/index.tsx
import { TrainingRoutes } from '#web/features/training/routes';

export const routes = [
  // ... existing routes
  
  // Training Module Routes
  {
    path: 'training',
    children: [
      { index: true, element: <TrainingDashboard /> },
      { path: 'programs', element: <ProgramsListPage /> },
      { path: 'programs/new', element: <ProgramFormPage /> },
      { path: 'programs/:id', element: <ProgramDetailPage /> },
      { path: 'programs/:id/edit', element: <ProgramFormPage /> },
      { path: 'sessions', element: <SessionsListPage /> },
      { path: 'sessions/new', element: <SessionFormPage /> },
      { path: 'sessions/:id', element: <SessionDetailPage /> },
      { path: 'sessions/:id/edit', element: <SessionFormPage /> },
      { path: 'sessions/:id/attendance', element: <AttendancePage /> },
      { path: 'enrollments', element: <EnrollmentsPage /> },
      { path: 'certificates', element: <CertificatesPage /> },
      { path: 'calendar', element: <TrainingCalendarPage /> },
      { path: 'my-training', element: <MyTrainingPage /> },
      { path: 'reports', element: <TrainingReportsPage /> },
      { path: 'budget', element: <BudgetPage /> },
    ],
  },
];
```

## 7.3 Add to Sidebar Navigation

```typescript
// src/components/layout/Sidebar.tsx
const navigationItems = [
  // ... existing items
  
  {
    name: 'Training',
    nameAm: 'ስልጠና',
    icon: AcademicCapIcon,
    path: '/training',
    children: [
      { name: 'Dashboard', nameAm: 'ዳሽቦርድ', path: '/training' },
      { name: 'Programs', nameAm: 'ፕሮግራሞች', path: '/training/programs' },
      { name: 'Sessions', nameAm: 'ክፍለ ጊዜዎች', path: '/training/sessions' },
      { name: 'Calendar', nameAm: 'የቀን መቁጠሪያ', path: '/training/calendar' },
      { name: 'My Training', nameAm: 'የኔ ስልጠና', path: '/training/my-training' },
      { name: 'Certificates', nameAm: 'የምስክር ወረቀቶች', path: '/training/certificates' },
      { name: 'Reports', nameAm: 'ሪፖርቶች', path: '/training/reports' },
    ],
  },
];
```

## 7.4 Add Translations

```json
// src/locales/en/training.json
{
  "training": {
    "title": "Training & Development",
    "programs": {
      "title": "Training Programs",
      "create": "Create Program",
      "edit": "Edit Program",
      "fields": {
        "code": "Program Code",
        "title": "Program Title",
        "category": "Category",
        "type": "Training Type",
        "duration": "Duration",
        "cost": "Estimated Cost"
      }
    },
    "sessions": {
      "title": "Training Sessions",
      "create": "Schedule Session",
      "fields": {
        "startDate": "Start Date",
        "endDate": "End Date",
        "location": "Location",
        "trainer": "Trainer",
        "capacity": "Capacity"
      }
    },
    "enrollments": {
      "title": "Enrollments",
      "enroll": "Enroll",
      "selfEnroll": "Self Enroll",
      "approve": "Approve",
      "reject": "Reject"
    },
    "certificates": {
      "title": "Certificates",
      "issue": "Issue Certificate",
      "verify": "Verify Certificate"
    }
  }
}
```

```json
// src/locales/am/training.json
{
  "training": {
    "title": "ስልጠና እና ልማት",
    "programs": {
      "title": "የስልጠና ፕሮግራሞች",
      "create": "ፕሮግራም ፍጠር",
      "edit": "ፕሮግራም አርትዕ"
    }
  }
}
```

---

# 8. Step 5: Permissions

## 8.1 Define Permissions

```typescript
// src/common/constants/permissions.ts
export const TRAINING_PERMISSIONS = {
  // Programs
  'training.programs.create': 'Create training programs',
  'training.programs.read': 'View training programs',
  'training.programs.update': 'Update training programs',
  'training.programs.delete': 'Delete training programs',
  
  // Sessions
  'training.sessions.create': 'Schedule training sessions',
  'training.sessions.read': 'View training sessions',
  'training.sessions.update': 'Update training sessions',
  'training.sessions.delete': 'Delete training sessions',
  
  // Enrollments
  'training.enrollments.enroll': 'Enroll employees in training',
  'training.enrollments.self-enroll': 'Self-enroll in training',
  'training.enrollments.approve': 'Approve training enrollments',
  'training.enrollments.reject': 'Reject training enrollments',
  
  // Attendance
  'training.attendance.record': 'Record training attendance',
  'training.attendance.view': 'View training attendance',
  
  // Certificates
  'training.certificates.issue': 'Issue training certificates',
  'training.certificates.view': 'View training certificates',
  'training.certificates.revoke': 'Revoke training certificates',
  
  // Budget
  'training.budget.manage': 'Manage training budget',
  'training.budget.view': 'View training budget',
  
  // Reports
  'training.reports.view': 'View training reports',
};
```

## 8.2 Role-Permission Mapping

```typescript
// Seed data
const rolePermissions = {
  ADMIN: ['training.*'],
  HR_MANAGER: ['training.*'],
  TRAINING_MANAGER: [
    'training.programs.*',
    'training.sessions.*',
    'training.enrollments.*',
    'training.attendance.*',
    'training.certificates.*',
    'training.reports.view',
  ],
  DEPARTMENT_HEAD: [
    'training.programs.read',
    'training.sessions.read',
    'training.enrollments.enroll',
    'training.enrollments.approve',
    'training.attendance.view',
    'training.certificates.view',
  ],
  EMPLOYEE: [
    'training.programs.read',
    'training.sessions.read',
    'training.enrollments.self-enroll',
    'training.certificates.view',
  ],
};
```

---

# 9. Module Template Summary

## 9.1 Quick Checklist for Any New Module

| # | Layer | Task | Files |
|---|-------|------|-------|
| **DATABASE** |
| 1 | Schema | Design entities & relationships | - |
| 2 | Schema | Add Prisma models | `schema.prisma` |
| 3 | Schema | Add indexes | `schema.prisma` |
| 4 | Schema | Run migration | `npx prisma migrate dev` |
| **BACKEND** |
| 5 | Module | Create module folder | `src/modules/{name}/` |
| 6 | Module | Create main module file | `{name}.module.ts` |
| 7 | Module | Create sub-modules | `{submodule}/` |
| 8 | Controller | Create controllers | `*.controller.ts` |
| 9 | Service | Create services | `*.service.ts` |
| 10 | Repository | Create repositories | `*.repository.ts` |
| 11 | DTOs | Create request DTOs | `dto/create-*.dto.ts` |
| 12 | DTOs | Create response DTOs | `dto/*-response.dto.ts` |
| 13 | DTOs | Create filter DTOs | `dto/*-filter.dto.ts` |
| 14 | Module | Register in AppModule | `app.module.ts` |
| **FRONTEND** |
| 15 | Feature | Create feature folder | `src/features/{name}/` |
| 16 | Types | Define TypeScript types | `types/*.types.ts` |
| 17 | Services | Create API services | `services/*.api.ts` |
| 18 | Hooks | Create React Query hooks | `hooks/use*.ts` |
| 19 | Schemas | Create Zod schemas | `schemas/*.schema.ts` |
| 20 | Components | Create components | `components/*.tsx` |
| 21 | Pages | Create pages | `pages/*.tsx` |
| 22 | Routes | Add routes | `routes/index.tsx` |
| 23 | Navigation | Add to sidebar | `layout/Sidebar.tsx` |
| **COMMON** |
| 24 | i18n | Add English translations | `locales/en/{name}.json` |
| 25 | i18n | Add Amharic translations | `locales/am/{name}.json` |
| 26 | Permissions | Define permissions | `constants/permissions.ts` |
| 27 | Permissions | Map to roles | Seed data |
| **TESTING** |
| 28 | Backend | Write unit tests | `*.spec.ts` |
| 29 | Backend | Write e2e tests | `*.e2e-spec.ts` |
| 30 | Frontend | Write component tests | `*.test.tsx` |

---

# 10. Other Module Ideas

Using this same pattern, you can add:

| Module | Key Entities | Description |
|--------|--------------|-------------|
| **Attendance** | attendance_records, shifts, overtime | Time tracking, clock in/out |
| **Asset Management** | assets, asset_assignments, asset_maintenance | Equipment tracking |
| **Recruitment** | job_postings, applications, interviews | Hiring process |
| **Announcements** | announcements, announcement_views | Internal communications |
| **Meetings** | meetings, meeting_participants, meeting_minutes | Meeting scheduling |
| **Vehicle Management** | vehicles, vehicle_assignments, fuel_logs | Fleet management |
| **Projects** | projects, project_members, tasks | Project tracking |
| **Inventory** | items, stock_movements, requisitions | Stock management |
| **Budget** | budgets, budget_lines, expenses | Financial tracking |
| **Facility** | rooms, room_bookings, maintenance_requests | Space management |
| **Travel** | travel_requests, travel_expenses, per_diem | Travel management |
| **Contracts** | contracts, contract_renewals, vendors | Contract management |

---

# 11. Best Practices Summary

## 11.1 Always Include

| Item | Reason |
|------|--------|
| `tenantId` | Multi-tenancy isolation |
| `createdAt`, `updatedAt` | Audit trail |
| `createdBy`, `updatedBy` | User tracking |
| `deletedAt` | Soft delete |
| `*Am` fields | Bilingual support |
| Proper indexes | Query performance |
| Status workflow | Business process |
| Event emission | Audit logging |

## 11.2 Follow Patterns

| Pattern | Description |
|---------|-------------|
| Repository Pattern | Data access abstraction |
| DTO Pattern | Input/Output validation |
| Service Pattern | Business logic isolation |
| Event-Driven | Loose coupling for audit/notifications |
| Soft Delete | Never hard delete |

## 11.3 API Design

| Principle | Example |
|-----------|---------|
| RESTful | `GET /training/programs/:id` |
| Nested for relationships | `GET /training/sessions/:id/enrollments` |
| Actions as POST | `POST /training/enrollments/:id/approve` |
| Filters as query params | `GET /training/programs?status=ACTIVE` |
| Pagination always | `?page=1&limit=10` |

---

End of Guide
