# Database Models Reference

> All Prisma models and enums in PPMS

**Schema File:** `packages/api/prisma/schema.prisma`

---

## Core Models

### Tenant

Multi-tenant isolation root.

```prisma
model Tenant {
  id        String   @id @default(uuid())
  name      String
  code      String   @unique
  settings  Json?    // Employee counters, config
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  centers     Center[]
  employees   Employee[]
  users       User[]
  // ... all other tenant-scoped models
}
```

### User

System user accounts.

```prisma
model User {
  id                 String     @id @default(uuid())
  tenantId           String
  username           String     // Employee ID format (FPC-0001-25)
  password           String     // Hashed
  status             UserStatus @default(PENDING)
  mustChangePassword Boolean    @default(true)
  employeeId         String?    @unique
  createdAt          DateTime   @default(now())
  updatedAt          DateTime   @updatedAt

  // Relations
  tenant     Tenant    @relation(...)
  employee   Employee? @relation(...)
  roles      UserRole[]
}
```

### Employee

Core employee record.

```prisma
model Employee {
  id                     String         @id @default(uuid())
  tenantId               String
  employeeId             String         // FPC-0001/25
  type                   EmployeeType
  status                 EmployeeStatus @default(ACTIVE)

  // Personal Info
  firstName              String
  fatherName             String
  grandfatherName        String
  amharicFirstName       String?
  amharicFatherName      String?
  amharicGrandfatherName String?
  gender                 Gender
  dateOfBirth            DateTime
  birthPlace             String?

  // Employment Info
  centerId               String?
  departmentId           String?
  positionId             String?
  rankId                 String?
  employmentDate         DateTime
  retirementDate         DateTime?

  // Transfer Info
  isTransfer             Boolean        @default(false)
  sourceOrganization     String?
  originalEmploymentDate DateTime?

  // Relations
  tenant     Tenant      @relation(...)
  center     Center?     @relation(...)
  department Department? @relation(...)
  position   Position?   @relation(...)
  rank       MilitaryRank? @relation(...)
  user       User?
  photos     EmployeePhoto[]
  family     EmployeeFamilyMember[]
  // ... many more relations
}
```

---

## Organization Models

### Center

Physical work locations.

```prisma
model Center {
  id          String   @id @default(uuid())
  tenantId    String
  name        String
  code        String
  isHQ        Boolean  @default(false)
  regionId    String?
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@unique([tenantId, code])
}
```

### Department

Organizational units within centers.

```prisma
model Department {
  id          String   @id @default(uuid())
  tenantId    String
  centerId    String
  name        String
  code        String
  parentId    String?  // For hierarchy
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@unique([tenantId, centerId, code])
}
```

### Position

Job positions/titles.

```prisma
model Position {
  id          String   @id @default(uuid())
  tenantId    String
  name        String
  code        String
  description String?
  isActive    Boolean  @default(true)

  @@unique([tenantId, code])
}
```

---

## Lookup Models

### Region

Geographic regions.

```prisma
model Region {
  id        String    @id @default(uuid())
  tenantId  String
  name      String
  code      String
  subCities SubCity[]

  @@unique([tenantId, code])
}
```

### SubCity

Sub-cities within regions.

```prisma
model SubCity {
  id        String   @id @default(uuid())
  tenantId  String
  regionId  String
  name      String
  code      String
  woredas   Woreda[]

  @@unique([tenantId, code])
}
```

### Woreda

Woredas within sub-cities.

```prisma
model Woreda {
  id        String @id @default(uuid())
  tenantId  String
  subCityId String
  name      String
  code      String

  @@unique([tenantId, code])
}
```

---

## Military/Rank Models

### MilitaryRank

Military rank definitions.

```prisma
model MilitaryRank {
  id           String   @id @default(uuid())
  tenantId     String
  name         String
  code         String
  category     String   // ENLISTED, NCO, OFFICER
  level        Int
  salarySteps  MilitaryRankSalaryStep[]

  @@unique([tenantId, code])
}
```

### MilitaryRankSalaryStep

Salary steps per rank (1-8).

```prisma
model MilitaryRankSalaryStep {
  id        String @id @default(uuid())
  tenantId  String
  rankId    String
  step      Int    // 1-8
  salary    Decimal

  @@unique([tenantId, rankId, step])
}
```

---

## Employee Sub-Models

### EmployeePhoto

```prisma
model EmployeePhoto {
  id           String      @id @default(uuid())
  tenantId     String
  employeeId   String
  filename     String
  originalName String
  mimeType     String
  size         Int
  path         String
  hash         String      // SHA-256 for deduplication
  status       PhotoStatus @default(PENDING_APPROVAL)
  createdAt    DateTime    @default(now())
}
```

### EmployeeFamilyMember

```prisma
model EmployeeFamilyMember {
  id           String   @id @default(uuid())
  tenantId     String
  employeeId   String
  relationship String   // SPOUSE, CHILD, PARENT
  firstName    String
  fatherName   String
  dateOfBirth  DateTime?
  gender       Gender?
}
```

### EmployeeMaritalStatus

```prisma
model EmployeeMaritalStatus {
  id            String        @id @default(uuid())
  tenantId      String
  employeeId    String
  status        MaritalStatus
  effectiveDate DateTime
  certificateNo String?
}
```

### EmployeeTransferRequest

```prisma
model EmployeeTransferRequest {
  id              String         @id @default(uuid())
  tenantId        String
  employeeId      String
  sourceCenterId  String
  targetCenterId  String
  status          TransferStatus @default(PENDING)
  reason          String?
  requestedAt     DateTime       @default(now())
  resolvedAt      DateTime?
}
```

---

## Attendance Models

### ShiftDefinition

```prisma
model ShiftDefinition {
  id          String           @id @default(uuid())
  tenantId    String
  name        String
  code        String
  startTime   String           // "08:00"
  endTime     String           // "17:00"
  scheduleType WorkScheduleType
  isActive    Boolean          @default(true)

  @@unique([tenantId, code])
}
```

### ShiftAssignment

```prisma
model ShiftAssignment {
  id          String   @id @default(uuid())
  tenantId    String
  employeeId  String
  shiftId     String
  startDate   DateTime
  endDate     DateTime?
}
```

### AttendanceRecord

```prisma
model AttendanceRecord {
  id          String    @id @default(uuid())
  tenantId    String
  employeeId  String
  date        DateTime
  checkIn     DateTime?
  checkOut    DateTime?
  status      String    // PRESENT, ABSENT, LATE, etc.
}
```

### Holiday

```prisma
model Holiday {
  id          String   @id @default(uuid())
  tenantId    String
  name        String
  date        DateTime
  isRecurring Boolean  @default(false)
  type        String   // NATIONAL, REGIONAL, RELIGIOUS
}
```

---

## Complaint Models

### Complaint

```prisma
model Complaint {
  id               String          @id @default(uuid())
  tenantId         String
  employeeId       String          // Accused employee
  complainantType  ComplainantType
  complainantName  String?
  article          ComplaintArticle
  description      String
  status           ComplaintStatus @default(SUBMITTED)
  filedAt          DateTime        @default(now())

  investigation    Investigation?
  timeline         ComplaintTimeline[]
  documents        ComplaintDocument[]
}
```

### Investigation

```prisma
model Investigation {
  id           String              @id @default(uuid())
  tenantId     String
  complaintId  String              @unique
  investigatorId String?
  status       InvestigationStatus @default(NOT_STARTED)
  startedAt    DateTime?
  completedAt  DateTime?
  findings     String?
}
```

---

## Committee Models

### Committee

```prisma
model Committee {
  id          String          @id @default(uuid())
  tenantId    String
  name        String
  typeId      String
  status      CommitteeStatus @default(ACTIVE)
  startDate   DateTime
  endDate     DateTime?

  members     CommitteeMember[]
}
```

### CommitteeMember

```prisma
model CommitteeMember {
  id          String              @id @default(uuid())
  tenantId    String
  committeeId String
  employeeId  String
  role        CommitteeMemberRole
  startDate   DateTime
  endDate     DateTime?

  terms       CommitteeMemberTerm[]
}
```

---

## Inventory & Weapons

### InventoryItemType

```prisma
model InventoryItemType {
  id          String @id @default(uuid())
  tenantId    String
  categoryId  String
  name        String
  code        String
  description String?

  @@unique([tenantId, code])
}
```

### Weapon

```prisma
model Weapon {
  id           String          @id @default(uuid())
  tenantId     String
  typeId       String
  serialNumber String
  status       WeaponStatus    @default(IN_SERVICE)
  condition    WeaponCondition @default(GOOD)
  centerId     String?

  assignments  WeaponAssignment[]

  @@unique([tenantId, serialNumber])
}
```

### WeaponAssignment

```prisma
model WeaponAssignment {
  id          String    @id @default(uuid())
  tenantId    String
  weaponId    String
  employeeId  String
  assignedAt  DateTime  @default(now())
  returnedAt  DateTime?
}
```

---

## Rewards & Salary

### ServiceReward

```prisma
model ServiceReward {
  id           String              @id @default(uuid())
  tenantId     String
  employeeId   String
  milestoneId  String
  yearsOfService Int
  eligibility  RewardEligibility
  status       ServiceRewardStatus @default(PENDING)
  awardedAt    DateTime?
}
```

### SalaryScaleVersion

```prisma
model SalaryScaleVersion {
  id          String            @id @default(uuid())
  tenantId    String
  name        String
  effectiveFrom DateTime
  status      SalaryScaleStatus @default(DRAFT)

  ranks       SalaryScaleRank[]
}
```

---

## Enums

### Employee Enums

```prisma
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
```

### User Enums

```prisma
enum UserStatus {
  ACTIVE
  INACTIVE
  LOCKED
  PENDING
  TRANSFERRED
  TERMINATED
}
```

### Workflow Enums

```prisma
enum TransferStatus {
  PENDING
  ACCEPTED
  REJECTED
  CANCELLED
}

enum LeaveRequestStatus {
  DRAFT
  PENDING
  APPROVED
  REJECTED
  CANCELLED
}

enum ComplaintStatus {
  SUBMITTED
  UNDER_REVIEW
  INVESTIGATION_IN_PROGRESS
  COMPLETED_CLEARED
  COMPLETED_GUILTY
  RESOLVED
}

enum PhotoStatus {
  PENDING_APPROVAL
  APPROVED
  REJECTED
  ACTIVE
  ARCHIVED
}
```

### Other Enums

```prisma
enum WeaponStatus {
  IN_SERVICE
  ASSIGNED
  IN_MAINTENANCE
  DECOMMISSIONED
  LOST
  STOLEN
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
```

---

## Model Count Summary

| Category | Models |
|----------|--------|
| Core | 3 (Tenant, User, Employee) |
| Organization | 3 (Center, Department, Position) |
| Lookups | 3 (Region, SubCity, Woreda) |
| Military | 2 (MilitaryRank, SalaryStep) |
| Employee Sub | 10+ (Photo, Family, Medical, etc.) |
| Attendance | 4 (Shift, Assignment, Record, Holiday) |
| Complaints | 5 (Complaint, Investigation, Timeline, etc.) |
| Committees | 4 (Committee, Type, Member, Term) |
| Inventory | 4 (Category, Type, Assignment, CenterStock) |
| Weapons | 5 (Weapon, Type, Category, Assignment, Ammo) |
| Rewards | 3 (Reward, Milestone, Timeline) |
| Salary | 4 (ScaleVersion, ScaleRank, ScaleStep, History) |
| Other | 5 (AuditLog, Document, Attachment, etc.) |
| **Total** | **~80 models** |

---

## Related Documentation

- [BUSINESS-RULES.md](../business/BUSINESS-RULES.md) - Business logic for models
- [STATE-MACHINES.md](../architecture/STATE-MACHINES.md) - Status transitions
- [API-REFERENCE.md](../reference/API-REFERENCE.md) - API endpoints

---

*Last Updated: 2025-01-18*
