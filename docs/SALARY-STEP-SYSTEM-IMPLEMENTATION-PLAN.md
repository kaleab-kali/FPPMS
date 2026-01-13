# Salary Step System Implementation Plan

## Executive Summary

This document outlines the enterprise-grade implementation strategy for the Police Salary Step Progression System based on the official 2018 EC salary scale matrix.

---

## Current State Analysis

### Existing Schema (Good Foundation)

```prisma
model MilitaryRank {
  baseSalary        Decimal  @db.Decimal(12, 2)
  ceilingSalary     Decimal  @db.Decimal(12, 2)
  stepCount         Int      @default(9)
  stepPeriodYears   Int      @default(2)
  salarySteps       MilitaryRankSalaryStep[]
}

model MilitaryRankSalaryStep {
  rankId        String
  stepNumber    Int
  salaryAmount  Decimal  @db.Decimal(12, 2)
  yearsRequired Int
}

model Employee {
  currentSalaryStep    Int      @default(0)
  currentSalary        Decimal? @db.Decimal(12, 2)
  salaryEffectiveDate  DateTime? @db.Date
  rankId               String?
}
```

### Gap Analysis

| Aspect | Current State | Required State |
|--------|--------------|----------------|
| Rank Names | Military-style (Corporal, Lieutenant) | Police-style (Constable, Inspector, Commander) |
| Salary Values | Calculated (interpolated) | Exact values from official matrix |
| Salary Scale Version | Not versioned | Version tracking (2018-EC) |
| Step Progression Trigger | Manual | Automatic (every 2 years) |
| Rank Promotion Integration | None | Linked to appraisal/promotion |
| Audit Trail | None | Full history tracking |
| Future Scale Changes | Not supported | Version management |

---

## Implementation Architecture

### Phase 1: Schema Enhancements (Required)

#### New Models to Add

```prisma
// Salary Scale Version Management
model SalaryScaleVersion {
  id              String   @id @default(cuid())
  tenantId        String?  @map("tenant_id")
  code            String   // e.g., "2018-EC", "2020-EC"
  name            String   // "Police Salary Scale 2018 EC"
  nameAm          String?  @map("name_am")
  effectiveDate   DateTime @map("effective_date") @db.Date
  expiryDate      DateTime? @map("expiry_date") @db.Date
  stepCount       Int      @default(9) @map("step_count")
  stepPeriodYears Int      @default(2) @map("step_period_years")
  isActive        Boolean  @default(true) @map("is_active")
  approvedBy      String?  @map("approved_by")
  approvedDate    DateTime? @map("approved_date")
  createdAt       DateTime @default(now()) @map("created_at")
  updatedAt       DateTime @updatedAt @map("updated_at")

  tenant          Tenant?  @relation(fields: [tenantId], references: [id])
  rankSalaries    RankSalaryScale[]

  @@unique([tenantId, code])
  @@index([tenantId])
  @@index([effectiveDate])
  @@map("salary_scale_versions")
}

// Rank-specific salary scale within a version
model RankSalaryScale {
  id              String   @id @default(cuid())
  scaleVersionId  String   @map("scale_version_id")
  rankId          String   @map("rank_id")
  baseSalary      Decimal  @map("base_salary") @db.Decimal(12, 2)
  ceilingSalary   Decimal  @map("ceiling_salary") @db.Decimal(12, 2)
  createdAt       DateTime @default(now()) @map("created_at")

  scaleVersion    SalaryScaleVersion    @relation(fields: [scaleVersionId], references: [id])
  rank            MilitaryRank          @relation(fields: [rankId], references: [id])
  steps           RankSalaryScaleStep[]

  @@unique([scaleVersionId, rankId])
  @@index([scaleVersionId])
  @@index([rankId])
  @@map("rank_salary_scales")
}

// Exact salary step values
model RankSalaryScaleStep {
  id              String   @id @default(cuid())
  rankSalaryId    String   @map("rank_salary_id")
  stepNumber      Int      @map("step_number") // 0 = base, 1-9 = steps
  salaryAmount    Decimal  @map("salary_amount") @db.Decimal(12, 2)
  yearsRequired   Int      @map("years_required")

  rankSalary      RankSalaryScale @relation(fields: [rankSalaryId], references: [id], onDelete: Cascade)

  @@unique([rankSalaryId, stepNumber])
  @@index([rankSalaryId])
  @@map("rank_salary_scale_steps")
}

// Employee Salary History (Audit Trail)
model EmployeeSalaryHistory {
  id                 String   @id @default(cuid())
  tenantId           String   @map("tenant_id")
  employeeId         String   @map("employee_id")
  scaleVersionId     String   @map("scale_version_id")
  rankId             String   @map("rank_id")
  fromStep           Int?     @map("from_step")
  toStep             Int      @map("to_step")
  fromSalary         Decimal? @map("from_salary") @db.Decimal(12, 2)
  toSalary           Decimal  @map("to_salary") @db.Decimal(12, 2)
  changeType         String   @map("change_type") // INITIAL, STEP_INCREMENT, PROMOTION, SCALE_REVISION
  effectiveDate      DateTime @map("effective_date") @db.Date
  reason             String?
  orderReference     String?  @map("order_reference")
  documentPath       String?  @map("document_path")
  processedBy        String?  @map("processed_by")
  processedAt        DateTime @default(now()) @map("processed_at")
  isAutomatic        Boolean  @default(false) @map("is_automatic")

  employee           Employee @relation(fields: [employeeId], references: [id], onDelete: Cascade)

  @@index([tenantId])
  @@index([employeeId])
  @@index([effectiveDate])
  @@index([tenantId, changeType])
  @@map("employee_salary_history")
}

// Step Increment Eligibility Tracking
model SalaryStepEligibility {
  id                   String   @id @default(cuid())
  tenantId             String   @map("tenant_id")
  employeeId           String   @map("employee_id")
  currentStep          Int      @map("current_step")
  nextStepNumber       Int      @map("next_step_number")
  eligibilityDate      DateTime @map("eligibility_date") @db.Date
  isEligible           Boolean  @default(true) @map("is_eligible")
  ineligibilityReason  String?  @map("ineligibility_reason")
  isProcessed          Boolean  @default(false) @map("is_processed")
  processedAt          DateTime? @map("processed_at")
  processedBy          String?  @map("processed_by")
  createdAt            DateTime @default(now()) @map("created_at")
  updatedAt            DateTime @updatedAt @map("updated_at")

  employee             Employee @relation(fields: [employeeId], references: [id], onDelete: Cascade)

  @@unique([employeeId, nextStepNumber])
  @@index([tenantId])
  @@index([employeeId])
  @@index([eligibilityDate])
  @@index([tenantId, isProcessed, eligibilityDate])
  @@map("salary_step_eligibility")
}
```

### Phase 2: Update Rank Data with Police Ranks

The current ranks are military-style. We need to UPDATE to match the official police salary scale:

| Order | Code | English Name | Amharic Name | Category |
|-------|------|--------------|--------------|----------|
| 1 | CONST | Constable | ኮንስታብል | ENLISTED |
| 2 | ASST_SGT | Assistant Sergeant | ረዳት ሳጅን | ENLISTED |
| 3 | DEP_SGT | Deputy Sergeant | ምክትል ሳጅን | ENLISTED |
| 4 | SGT | Sergeant | ሳጅን | ENLISTED |
| 5 | CHIEF_SGT | Chief Sergeant | ዋና ሳጅን | NCO |
| 6 | ASST_INSP | Assistant Inspector | ረዳት ኢንስፔክተር | NCO |
| 7 | DEP_INSP | Deputy Inspector | ምክትል ኢንስፔክተር | JUNIOR_OFFICER |
| 8 | INSP | Inspector | ኢንስፔክተር | JUNIOR_OFFICER |
| 9 | CHIEF_INSP | Chief Inspector | ዋና ኢንስፔክተር | JUNIOR_OFFICER |
| 10 | DEP_CMDR | Deputy Commander | ምክትል ኮማንደር | SENIOR_OFFICER |
| 11 | CMDR | Commander | ኮማንደር | SENIOR_OFFICER |
| 12 | ASST_COMM | Assistant Commissioner | ረዳት ኮሚሽነር | EXECUTIVE |
| 13 | DEP_COMM | Deputy Commissioner | ምክትል ኮሚሽነር | EXECUTIVE |
| 14 | COMM | Commissioner | ኮሚሽነር | EXECUTIVE |
| 15 | DEP_COMM_GEN | Deputy Commissioner General | ም/ኮሚ/ጀነራል | GENERAL |
| 16 | COMM_GEN | Commissioner General | ኮሚሽነር ጀነራል | GENERAL |

---

## Business Rules Engine

### Rule 1: Biennial Step Increment

```typescript
/**
 * Every 2 years of service at the same rank:
 * - Employee advances to the next salary step
 * - Until they reach the ceiling (Step 9)
 */
const calculateNextEligibilityDate = (
  employmentDate: Date,
  currentStep: number,
  stepPeriodYears: number
): Date | null => {
  if (currentStep >= 9) return null; // At ceiling

  const nextStep = currentStep + 1;
  const yearsRequired = nextStep * stepPeriodYears;

  const eligibilityDate = new Date(employmentDate);
  eligibilityDate.setFullYear(eligibilityDate.getFullYear() + yearsRequired);

  return eligibilityDate;
};
```

### Rule 2: Ceiling Behavior

```
When employee reaches Step 9 (ceiling):
- Salary remains frozen
- No further automatic increments
- Only way to increase salary: Promotion to higher rank
```

### Rule 3: Promotion/Rank Change

```
When employee is promoted to a new rank:
- Salary resets to BASE SALARY of new rank
- Step counter resets to 0
- New 2-year cycle begins from promotion date
```

### Rule 4: Salary Scale Version Change

```
When a new salary scale is published (e.g., 2020-EC):
- All active employees mapped to new scale
- Maintain current step number
- Apply new salary amount for that step
- Create audit trail entry
```

---

## Module Structure

### Backend Module: salary-management

```
packages/api/src/modules/salary-management/
├── salary-management.module.ts
├── salary-management.controller.ts
├── salary-management.service.ts
├── services/
│   ├── salary-scale.service.ts        # Scale version management
│   ├── salary-calculation.service.ts  # Salary calculations
│   ├── salary-progression.service.ts  # Step increment logic
│   └── salary-history.service.ts      # Audit trail
├── dto/
│   ├── create-salary-scale.dto.ts
│   ├── update-salary-scale.dto.ts
│   ├── salary-scale-response.dto.ts
│   ├── process-step-increment.dto.ts
│   └── salary-eligibility.dto.ts
├── jobs/
│   └── salary-step-processor.job.ts   # Scheduled job for batch processing
└── interfaces/
    └── salary-types.interface.ts
```

### API Endpoints

```typescript
// Salary Scale Management (Admin)
POST   /api/salary-scales                    // Create new scale version
GET    /api/salary-scales                    // List all scale versions
GET    /api/salary-scales/:id                // Get scale details with ranks
GET    /api/salary-scales/active             // Get current active scale
PATCH  /api/salary-scales/:id/activate       // Activate a scale version
PATCH  /api/salary-scales/:id/deactivate     // Deactivate a scale

// Salary Lookup (Read)
GET    /api/salary-scales/:scaleId/ranks/:rankId/steps  // Get all steps for a rank
GET    /api/salary-calculation?rankId=X&step=Y          // Calculate salary

// Employee Salary Management
GET    /api/employees/:id/salary                        // Current salary info
GET    /api/employees/:id/salary/history                // Salary change history
GET    /api/employees/:id/salary/projection             // Future step projections

// Batch Processing (HR Admin)
GET    /api/salary/eligibility/upcoming                 // Employees due for increment
POST   /api/salary/process-increments                   // Batch process increments
POST   /api/salary/process-scale-change                 // Apply new salary scale to all

// Reports
GET    /api/salary/reports/step-distribution            // Employees by step per rank
GET    /api/salary/reports/upcoming-increments          // Next 3/6/12 months
GET    /api/salary/reports/ceiling-employees            // Employees at ceiling
```

---

## Scheduled Jobs

### Daily Eligibility Check Job

```typescript
@Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
async checkSalaryEligibility(): Promise<void> {
  // Find employees eligible for step increment
  // Where: eligibilityDate <= today AND NOT processed AND isEligible
  // Create notification/task for HR
  // Log to audit
}
```

### Monthly Batch Processing (Optional Auto-Process)

```typescript
@Cron('0 0 1 * *') // First day of each month
async processMonthlyIncrements(): Promise<void> {
  // If organization enables auto-processing:
  // 1. Get all unprocessed eligible employees
  // 2. Verify no blockers (active disciplinary, etc.)
  // 3. Process step increment
  // 4. Create salary history entry
  // 5. Update employee.currentSalary
  // 6. Send notification
}
```

---

## Frontend Module Structure

```
packages/web/src/features/salary-management/
├── pages/
│   ├── SalaryScalesListPage.tsx          # List all scale versions
│   ├── SalaryScaleDetailPage.tsx         # View/Edit scale with all ranks
│   ├── SalaryEligibilityPage.tsx         # Employees due for increment
│   └── SalaryReportsPage.tsx             # Various salary reports
├── components/
│   ├── SalaryScaleTable.tsx              # Rank + steps matrix
│   ├── SalaryProgressionCard.tsx         # Employee salary projection
│   ├── StepIncrementProcessDialog.tsx    # Process increment modal
│   └── SalaryHistoryTimeline.tsx         # Employee salary history
├── hooks/
│   ├── useSalaryScales.ts
│   ├── useEmployeeSalary.ts
│   └── useSalaryEligibility.ts
└── types/
    └── salary.types.ts
```

---

## Data Migration Strategy

### Step 1: Create New Ranks (If Replacing)

Option A: **Update existing ranks** (if system not in production)
- Delete existing MilitaryRank data
- Seed new police ranks with exact names

Option B: **Add new ranks alongside** (if system has data)
- Add police ranks with new codes
- Create migration script to map old ranks to new

### Step 2: Seed 2018-EC Salary Scale

```typescript
const seed2018ECSalaryScale = async (prisma: PrismaClient) => {
  // 1. Create SalaryScaleVersion
  const scaleVersion = await prisma.salaryScaleVersion.create({
    data: {
      code: '2018-EC',
      name: 'Police Salary Scale 2018 EC',
      nameAm: 'የፖሊስ አባላት አዲሱ የ2018 ዓ.ም የደምወዝ ደረጃ',
      effectiveDate: new Date('2025-09-11'), // Ethiopian new year 2018
      stepCount: 9,
      stepPeriodYears: 2,
      isActive: true,
    }
  });

  // 2. For each rank, create RankSalaryScale with exact step values
  // (Using data from POLICE-SALARY-MATRIX-2018.md)
};
```

### Step 3: Initialize Employee Salary Data

For existing employees:
1. Set `currentSalaryStep` based on years of service
2. Calculate `currentSalary` from active scale
3. Set `salaryEffectiveDate` to employment date
4. Create initial `EmployeeSalaryHistory` entry

---

## Security & Access Control

### Required Permissions

```typescript
const SALARY_PERMISSIONS = {
  // View
  'salary:scale:read': 'View salary scales',
  'salary:employee:read': 'View employee salary info',
  'salary:history:read': 'View salary history',

  // Manage
  'salary:scale:create': 'Create new salary scale',
  'salary:scale:update': 'Update salary scale',
  'salary:scale:activate': 'Activate/deactivate scale',

  // Process
  'salary:increment:process': 'Process salary step increments',
  'salary:batch:process': 'Batch process increments',

  // Reports
  'salary:reports:read': 'View salary reports',
  'salary:reports:export': 'Export salary data',
};
```

### Role Access Matrix

| Role | View Scale | View Employee Salary | Process Increment | Reports |
|------|------------|---------------------|-------------------|---------|
| IT_ADMIN | Yes | Yes | Yes | Yes |
| HQ_ADMIN | Yes | Yes | Yes | Yes |
| HR_DIRECTOR | Yes | Yes | Yes | Yes |
| CENTER_ADMIN | Yes | Own Center | No | Own Center |
| HR_OFFICER | Yes | Own Center | No | Own Center |
| EMPLOYEE | No | Own Only | No | No |

---

## Implementation Timeline

### Sprint 1: Schema & Seed Data
- [ ] Update Prisma schema with new models
- [ ] Create migration
- [ ] Update military-ranks.seed.ts with police ranks
- [ ] Create salary-scale.seed.ts with 2018-EC data
- [ ] Run migration and seed

### Sprint 2: Backend Services
- [ ] Create salary-management module
- [ ] Implement SalaryScaleService
- [ ] Implement SalaryCalculationService
- [ ] Implement SalaryProgressionService
- [ ] Add endpoints

### Sprint 3: Integration & History
- [ ] Update employee creation to set initial salary
- [ ] Implement SalaryHistoryService
- [ ] Create scheduled jobs
- [ ] Add audit logging

### Sprint 4: Frontend
- [ ] Create salary scale list/detail pages
- [ ] Create eligibility dashboard
- [ ] Create employee salary card/history
- [ ] Create reports pages

### Sprint 5: Testing & Polish
- [ ] Unit tests for calculation logic
- [ ] E2E tests for increment processing
- [ ] Performance testing with large datasets
- [ ] Documentation

---

## Risk Mitigation

### Risk 1: Salary Calculation Errors
- **Mitigation**: Use Decimal type for all amounts, extensive testing

### Risk 2: Missed Step Increments
- **Mitigation**: Daily eligibility job, dashboard alerts

### Risk 3: Scale Version Conflicts
- **Mitigation**: Only one active scale per tenant, validation

### Risk 4: Performance with Many Employees
- **Mitigation**: Batch processing, indexed queries, caching

---

## Success Metrics

1. **Accuracy**: 100% correct salary calculations
2. **Automation**: Zero missed step increments
3. **Audit**: Full traceability of all salary changes
4. **Performance**: Batch processing < 5 seconds for 10,000 employees
5. **Usability**: HR can process monthly increments in < 5 minutes

---

## Questions for Confirmation

Before proceeding with implementation, please confirm:

1. **Rank Structure**: Should we REPLACE existing military ranks with police ranks, or keep both?

2. **Auto vs Manual Processing**: Should step increments be:
   - Fully automatic (processed by scheduled job)
   - Semi-automatic (job identifies eligible, HR approves batch)
   - Manual (HR processes individually)

3. **Disciplinary Impact**: Should active disciplinary records block salary increment?

4. **Transfer Employees**: When an employee transfers in with `originalEmploymentDate`, should step calculation use that date?

5. **Civilian Employees**: Does this salary scale apply to civilian employees, or only military?

6. **Scale Overlap**: If a new scale (2020-EC) is published mid-year, should employees:
   - Immediately get new scale amounts
   - Get new amounts at next step increment
   - Get a one-time adjustment to match

7. **Historical Data**: For existing employees, should we calculate their theoretical step based on `employmentDate` and create history entries?
