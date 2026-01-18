# Business Rules & Domain Logic

> All business rules that must be enforced in PPMS

---

## Employee Rules

### Employee Types

| Type | Prefix | Description |
|------|--------|-------------|
| MILITARY | FPC | Federal Police Corps members |
| CIVILIAN | FPCIV | Civilian employees |
| TEMPORARY | TMP | Temporary/contract workers |

### Employee ID Format

```
{PREFIX}-{PADDED_NUMBER}/{YEAR}

Examples:
- FPC-0001/25    (Military, first employee, year 2025)
- FPCIV-0042/25  (Civilian, 42nd employee, year 2025)
- TMP-0003/25    (Temporary, 3rd employee, year 2025)
```

**Implementation:** `packages/api/src/modules/employees/services/employee-id-generator.service.ts`

### Counter Storage

- Counters stored in `Tenant.settings` JSON field
- Separate counter per employee type per year
- Format: `employeeCounters.{YEAR}.{TYPE}`

```json
{
  "employeeCounters": {
    "2025": {
      "MILITARY": 42,
      "CIVILIAN": 15,
      "TEMPORARY": 3
    }
  }
}
```

---

## Military Employee Rules

### Marriage Restriction

```
RULE: Military employees CANNOT have marital status MARRIED at registration
EXCEPTION: Transfer employees (isTransfer: true) CAN be married

Validation:
- If employeeType === MILITARY
- AND maritalStatus === MARRIED
- AND isTransfer !== true
- THEN reject with error
```

### Transfer Employee Requirements

When `isTransfer: true`:

| Field | Required | Description |
|-------|----------|-------------|
| `sourceOrganization` | Yes | Original organization name |
| `originalEmploymentDate` | Yes | Date first employed |

### Rank Categories & Retirement Ages

| Category | Ranks | Retirement Age |
|----------|-------|----------------|
| Enlisted | Constable, Lance Corporal, Corporal, Sergeant | 50 years |
| NCO | Staff Sergeant, Sergeant Major, Master Sergeant, Chief Warrant Officer | 52 years |
| Officer | 2nd Lieutenant to General | 55 years |

**Implementation:** `packages/api/src/modules/employees/services/retirement-calculation.service.ts`

### Retirement Date Calculation

```
retirementDate = dateOfBirth + retirementAge (based on rank category)
```

---

## Rank & Salary Rules

### Rank Structure

Military ranks follow a hierarchical structure with:
- **Rank Name** (e.g., Constable, Sergeant)
- **Rank Code** (e.g., PC, SGT)
- **Rank Category** (ENLISTED, NCO, OFFICER)
- **Level** (for ordering)
- **Salary Steps** (1-8 steps per rank)

### Salary Step Progression

```
RULE: Employee moves up one salary step every 2 years of service
CONDITION: No active Article 31 disciplinary action
```

**Salary Step Structure:**
| Step | Years of Service |
|------|------------------|
| 1 | 0-2 years |
| 2 | 2-4 years |
| 3 | 4-6 years |
| 4 | 6-8 years |
| 5 | 8-10 years |
| 6 | 10-12 years |
| 7 | 12-14 years |
| 8 | 14+ years |

### Salary Change Types

| Type | Description |
|------|-------------|
| INITIAL | First salary assignment |
| PROMOTION | Rank promotion |
| STEP_INCREMENT | Yearly step increase |
| ADJUSTMENT | Manual adjustment |
| DEMOTION | Rank demotion |

---

## Transfer Rules

### Two-Step Transfer Process

```
1. SOURCE CENTER creates transfer request
   - Status: PENDING
   - Employee remains at source

2. TARGET CENTER reviews
   - ACCEPT: Employee moves to target
   - REJECT: Request closed, employee stays
   - CANCEL (by source): Request withdrawn
```

### Transfer Effects on Accept

1. **Employee Record Updates:**
   - `centerId` -> target center
   - `departmentId` -> null (reassigned at target)

2. **Departure Record Created:**
   - At source center
   - Type: TRANSFER

3. **User Account:**
   - Status changes to TRANSFERRED
   - May need new credentials at target

### Transfer Permissions

| Role | Can Create | Can Accept | Can Reject |
|------|------------|------------|------------|
| IT_ADMIN | Yes | Yes | Yes |
| HQ_ADMIN | Yes | Yes | Yes |
| HR_DIRECTOR | Yes | Yes | Yes |
| CENTER_ADMIN | Own center | Own center | Own center |
| HR_OFFICER | No | No | No |

---

## Leave Rules

### Leave Types

| Type | Description | Default Days |
|------|-------------|--------------|
| Annual Leave | Regular vacation | 20 |
| Sick Leave | Medical absence | 15 |
| Maternity Leave | For mothers | 120 |
| Paternity Leave | For fathers | 15 |
| Bereavement Leave | Family death | 5 |
| Marriage Leave | Wedding | 5 |
| Study Leave | Education | Varies |
| Unpaid Leave | Without pay | Varies |
| Special Leave | Other reasons | Varies |
| Training Leave | Work training | Varies |

### Leave Balance Rules

```
RULE: Leave balance calculated per fiscal year
RULE: Some leave types may carry over (configurable)
RULE: Cannot request more days than balance
```

### Leave Request Flow

```
1. Employee creates request (DRAFT)
2. Employee submits (PENDING)
3. Supervisor/HR reviews
   - APPROVE: Deduct from balance
   - REJECT: No change
4. Employee can CANCEL before decision
```

---

## Complaint & Disciplinary Rules

### Complaint Articles

| Article | Description | Effect on Rewards |
|---------|-------------|-------------------|
| Article 30 | Minor violations | No effect |
| Article 31 | Serious violations | Disqualifies from rewards |

### Disciplinary Status Flow

```
ACTIVE -> EXPIRED (time-based)
ACTIVE -> REVOKED (by authority)
```

### Investigation Impact

```
RULE: Employee under investigation has rewards POSTPONED
RULE: When investigation clears, rewards may be awarded
RULE: When found guilty, rewards are INELIGIBLE
```

---

## Service Reward Rules

### Reward Milestones

| Years of Service | Reward Type |
|------------------|-------------|
| 5 years | Bronze Medal |
| 10 years | Silver Medal |
| 15 years | Gold Medal |
| 20 years | Distinguished Service |
| 25 years | Excellence Award |
| 30 years | Lifetime Achievement |

### Eligibility Calculation

```
ELIGIBLE if:
  - Reached milestone years
  - No active Article 31 disciplinary
  - Not under investigation

INELIGIBLE if:
  - Active Article 31 disciplinary action

POSTPONED if:
  - Under active investigation
  - Will re-evaluate when investigation concludes
```

**Implementation:** `packages/api/src/modules/rewards/rewards.service.ts`

---

## User Account Rules

### Username Format

```
Username = Employee ID with "/" replaced by "-"

Employee ID: FPC-0001/25
Username:    FPC-0001-25
```

### Default Password

```
Password = "Police@{currentYear}"

Example (2025): Police@2025
```

### First Login Requirement

```
RULE: New users must change password on first login
FLAG: mustChangePassword = true (for new accounts)
```

### Account Locking

```
RULE: Account locks after 5 failed login attempts
UNLOCK: Admin must manually unlock
```

---

## Photo Rules

### Photo Requirements

| Requirement | Value |
|-------------|-------|
| Max file size | 10 MB |
| Allowed formats | JPEG, PNG, WebP |
| Min dimensions | 200x200 px |
| Max dimensions | 4000x4000 px |

### Photo Approval Flow

```
1. Upload -> PENDING_APPROVAL
2. HR Reviews:
   - APPROVE -> ACTIVE (becomes profile photo)
   - REJECT -> REJECTED
3. When new photo uploaded:
   - Current ACTIVE -> ARCHIVED
   - New photo -> PENDING_APPROVAL
```

### Photo Storage

```
Path: uploads/{tenantId}/photos/{employeeId}/{filename}
Deduplication: SHA-256 hash
Soft delete: Mark as deleted, keep file
```

---

## Multi-Tenant Rules

### Tenant Isolation

```
RULE: ALL data queries MUST include tenantId filter
RULE: Users can only access data from their tenant
RULE: Cross-tenant data access is NEVER allowed
```

### Tenant-Scoped Entities

ALL entities except `Tenant` itself have `tenantId` foreign key:
- Employee
- Center
- Department
- User
- All transactions and records

### Validation Rule

```
RULE: When creating related records, validate parent belongs to same tenant

Example:
- Creating employee with departmentId
- First verify department.tenantId === user.tenantId
```

---

## Access Scope Rules

### Scope Hierarchy

| Scope | Access Level |
|-------|--------------|
| ALL_CENTERS | All data in tenant |
| OWN_CENTER | Only assigned center |
| OWN_DEPARTMENT | Only assigned department |
| OWN_RECORDS | Only own employee record |

### Role Default Scopes

| Role | Default Scope |
|------|---------------|
| IT_ADMIN | ALL_CENTERS |
| HQ_ADMIN | ALL_CENTERS |
| HR_DIRECTOR | ALL_CENTERS |
| CENTER_ADMIN | OWN_CENTER |
| CENTER_COMMANDER | OWN_CENTER |
| HR_OFFICER | OWN_CENTER |
| DEPARTMENT_HEAD | OWN_DEPARTMENT |
| SUPERVISOR | OWN_DEPARTMENT |
| EMPLOYEE | OWN_RECORDS |

---

## Weapon Rules

### Weapon Assignment

```
RULE: One weapon can only be assigned to one employee at a time
RULE: Employee can have multiple weapons assigned
RULE: Assignment requires clearance check
```

### Weapon Status Flow

```
IN_SERVICE -> ASSIGNED (to employee)
ASSIGNED -> IN_SERVICE (returned)
ASSIGNED -> IN_MAINTENANCE (needs repair)
ASSIGNED -> LOST/STOLEN (incident report required)
IN_MAINTENANCE -> IN_SERVICE (repaired)
IN_MAINTENANCE -> DECOMMISSIONED (beyond repair)
```

### Clearance on Retirement

```
RULE: Employee must return all assigned weapons before retirement clearance
RULE: Weapons department signs off on clearance
```

---

## Committee Rules

### Committee Types

- Disciplinary Committee
- Promotion Board
- Transfer Committee
- Welfare Committee

### Member Term Rules

```
RULE: Member term has start and end date
RULE: Only ACTIVE terms count toward committee composition
RULE: Member can be SUSPENDED (temporary removal)
RULE: Member can be TERMINATED (permanent removal)
```

### Committee Composition

| Role | Required | Max |
|------|----------|-----|
| CHAIRMAN | 1 | 1 |
| VICE_CHAIRMAN | 0 | 1 |
| SECRETARY | 1 | 1 |
| MEMBER | 2+ | Unlimited |
| ADVISOR | 0 | Unlimited |

---

## Audit Rules

### Audited Actions

ALL sensitive operations are logged:
- CREATE / UPDATE / DELETE on any entity
- LOGIN / LOGOUT
- APPROVE / REJECT (for workflows)
- EXPORT / IMPORT (data operations)

### Audit Log Fields

| Field | Description |
|-------|-------------|
| action | CREATE, UPDATE, DELETE, etc. |
| entityType | Table/entity name |
| entityId | Record ID |
| userId | Who performed action |
| tenantId | Which tenant |
| changes | JSON diff of changes |
| ipAddress | Client IP |
| timestamp | When occurred |

---

## Calendar Rules

### Ethiopian Calendar Support

```
RULE: All dates displayed in both Gregorian and Ethiopian
RULE: Internal storage always in Gregorian (ISO format)
RULE: Conversion happens at display layer
```

**Implementation:** `packages/api/src/common/utils/ethiopian-calendar.util.ts`

### Ethiopian New Year

- Ethiopian New Year: September 11 (or 12 in leap year)
- Ethiopian year is ~7-8 years behind Gregorian

---

## Holiday Rules

### Holiday Types

- National Holidays (apply to all centers)
- Regional Holidays (apply to specific regions)
- Religious Holidays (may vary by religion)

### Holiday Effects

```
RULE: Holidays are non-working days
RULE: Leave requests should exclude holidays from count
RULE: Attendance records adjusted for holidays
```

---

## Related Documentation

- [STATE-MACHINES.md](../architecture/STATE-MACHINES.md) - Workflow diagrams
- [API-REFERENCE.md](../reference/API-REFERENCE.md) - API endpoints
- [DATABASE-MODELS.md](../codebase/DATABASE-MODELS.md) - Data models

---

*Last Updated: 2025-01-18*
