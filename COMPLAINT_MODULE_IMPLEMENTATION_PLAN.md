# COMPLAINT MODULE IMPLEMENTATION PLAN

## COMPLETE UNDERSTANDING

### Article 31 Flow (Serious Offenses):
```
HR Officer registers Article 31 complaint
         |
    VALIDATION: Does center have discipline committee?
         | (No = FAIL with error "Create committee first")
         | (Yes = Continue)
         |
    AUTO-ASSIGN to Center Discipline Committee
    Status: WITH_DISCIPLINE_COMMITTEE
         |
    +---------------------------------------------+
    | SAME PROCESS AS ARTICLE 30:                 |
    |  - Committee sends notification             |
    |  - Accused receives notification            |
    |  - 3 days rebuttal period                   |
    |  - Rebuttal received OR deadline passes     |
    |  - Committee analyzes                       |
    +---------------------------------------------+
         |
    Committee records finding (GUILTY / NOT_GUILTY)
         |
    Status: INVESTIGATION_COMPLETE (auto when finding recorded)
         |
    +--------+--------+
    |                 |
NOT_GUILTY         GUILTY
    |                 |
CLOSED         Secretary forwards to HQ
                      |
               HQ Committee receives
               Status: FORWARDED_TO_HQ
                      |
               HQ decides PUNISHMENT
                      |
               Status: DECIDED_BY_HQ
                      |
               (Optional Appeal)
                      |
               CLOSED_FINAL
```

### Article 30 Flow (Minor Offenses):
```
HR Officer registers Article 30 complaint
         |
    Status: UNDER_HR_REVIEW
         |
    HR sends notification to accused
         |
    Status: WAITING_FOR_REBUTTAL (3 days)
         |
    +----------+----------+
    |                      |
Rebuttal received    No rebuttal (deadline)
    |                      |
UNDER_HR_ANALYSIS    Auto: GUILTY_NO_REBUTTAL
    |                      |
HR records finding         |
    |                      |
    +----------------------+
    |                      |
NOT_GUILTY              GUILTY
    |                      |
CLOSED           Check Severity Level
                      |
         +-----------+-----------+
         |                       |
    Level 1-4                Level 5+
         |                       |
    AWAITING_SUPERIOR      HR MANUALLY forwards
    _DECISION              to Center Committee
         |                       |
Direct Superior decides    Status: WITH_DISCIPLINE
         |                 _COMMITTEE
    DECIDED                      |
         |                 Committee decides
    (Appeal?)              punishment
         |                       |
   CLOSED_FINAL               DECIDED
                                 |
                            (Appeal?)
                                 |
                            CLOSED_FINAL
```

### Appeal Process (Simplified):
```
After DECIDED or DECIDED_BY_HQ
         |
Employee goes to HR Officer
         |
HR Officer submits appeal:
  - Appeal reason
  - Appeal reviewer (Employee ID of higher authority)
         |
Status: ON_APPEAL
         |
Appeal reviewer makes decision
HR records: UPHELD / MODIFIED / OVERTURNED
         |
Status: APPEAL_DECIDED -> CLOSED_FINAL
```

**Key Points:**
- Appeal reviewer is ANY higher authority employee selected by HR (not fixed levels)
- The record shows who decided the appeal

### HQ Employees:
- Same as center employees
- Article 30: Goes to their direct superior (at HQ)
- Article 31: Goes to HQ Discipline Committee directly

### Committee Member Term Limits:
- Each member has `termStartDate` and `termEndDate` (MANDATORY)
- When term ends, member must be replaced OR extended
- Track term history across committees
- Employee profile shows:
  - Current committee memberships
  - Historical memberships (served from X to Y)

### Employee Profile - Complaints Tab Shows:
- All complaints where employee is accused
- Full timeline (notification, rebuttal, finding, decision)
- Committee that handled the case
- Appeal history with who decided
- Punishment details

### Employee Profile - Committees Tab Shows:
- Current committee memberships with role
- Historical memberships (term served from-to)
- Committee decisions they participated in

---

## IMPLEMENTATION PHASES

### PHASE 1: Permission-Based UI System
**Priority: HIGH**

**Files to create:**
- `packages/web/src/hooks/usePermissions.ts`
- `packages/web/src/components/common/PermissionGate.tsx`
- `packages/web/src/constants/permissions.ts`

**Files to modify:**
- `packages/web/src/components/layout/AppSidebar.tsx`

**Features:**
- `useHasPermission(permission)` hook
- `useHasAnyPermission(permissions[])` hook
- `useHasRole(role)` hook
- `<PermissionGate permission="...">` component
- Sidebar filters menu items based on user permissions
- Buttons hidden/shown based on permissions

---

### PHASE 2: Update Complaint Statuses
**Priority: HIGH**

**Files to modify:**
- `packages/api/prisma/schema.prisma`
- `packages/web/src/types/complaint.ts`

**New/Updated Statuses:**
```
ComplaintStatus {
  // Article 30 HR flow
  UNDER_HR_REVIEW
  WAITING_FOR_REBUTTAL
  UNDER_HR_ANALYSIS
  AWAITING_SUPERIOR_DECISION     // Art 30 Level 1-4

  // Committee flow (both articles)
  WITH_DISCIPLINE_COMMITTEE
  COMMITTEE_WAITING_REBUTTAL     // Committee sent notification
  COMMITTEE_ANALYSIS             // Committee analyzing
  INVESTIGATION_COMPLETE         // Finding recorded, ready to forward/decide

  // Article 31 HQ flow
  FORWARDED_TO_HQ
  AWAITING_HQ_DECISION

  // Decision
  DECIDED
  DECIDED_BY_HQ

  // Appeal
  ON_APPEAL
  APPEAL_DECIDED

  // Final
  CLOSED_NO_LIABILITY
  CLOSED_FINAL
}
```

---

### PHASE 3: Fix Article 31 Flow
**Priority: HIGH**

**Files to modify:**
- `packages/api/src/modules/complaints/complaints.service.ts`
- `packages/api/src/modules/complaints/complaints.controller.ts`
- `packages/web/src/features/complaints/components/ComplaintActions.tsx`

**Backend Changes:**
1. `create()` - For Article 31:
   - Validate discipline committee exists for center
   - Auto-assign to committee
   - Status = `WITH_DISCIPLINE_COMMITTEE`

2. Add `committeeRecordNotification()` - Committee notifies accused
3. Add `committeeRecordRebuttal()` - Committee records rebuttal
4. Update `recordFinding()` - Auto-set status to `INVESTIGATION_COMPLETE`
5. Update `forwardToHq()` - Only from `INVESTIGATION_COMPLETE`

**Frontend Changes:**
- Update ComplaintActions to show committee workflow buttons
- Add notification/rebuttal actions for committee
- Labels: "Committee Sent Notification" instead of "HR Sent Notification"

---

### PHASE 4: Fix Article 30 Level 5+ Flow
**Priority: HIGH**

**Files to modify:**
- `packages/api/src/modules/complaints/complaints.service.ts`
- `packages/api/src/modules/complaints/dto/`
- `packages/web/src/features/complaints/components/ComplaintActions.tsx`

**Backend Changes:**
1. Add `forwardToCommittee()` - HR manually forwards Level 5+ cases
2. Update flow to allow committee decision for Article 30

**Frontend Changes:**
- Show "Forward to Committee" button for Level 5+ Article 30 cases
- Show "Record Decision" for committee on Article 30 cases

---

### PHASE 5: Simplify Appeal Process
**Priority: MEDIUM**

**Files to modify:**
- `packages/api/prisma/schema.prisma` (ComplaintAppeal model)
- `packages/api/src/modules/complaints/complaints.service.ts`
- `packages/api/src/modules/complaints/dto/submit-appeal.dto.ts`
- `packages/web/src/features/complaints/components/ComplaintActions.tsx`

**Changes:**
1. Remove fixed appeal levels (1-4)
2. Add `reviewerEmployeeId` field - HR selects who will review
3. Appeal changes complaint status to `ON_APPEAL`
4. Record reviewer's decision with their employee info
5. Status -> `APPEAL_DECIDED` -> `CLOSED_FINAL`

**Updated Appeal Model:**
```prisma
model ComplaintAppeal {
  id                 String
  complaintId        String
  appealDate         DateTime
  appealReason       String
  reviewerEmployeeId String    // Who will review (selected by HR)
  reviewerEmployee   Employee  @relation(...)
  decision           AppealDecision?
  decisionDate       DateTime?
  decisionReason     String?
  newPunishment      String?   // If modified
  submittedBy        String    // HR officer who submitted
}
```

---

### PHASE 6: Committee Member Term Limits
**Priority: MEDIUM**

**Files to modify:**
- `packages/api/prisma/schema.prisma` (CommitteeMember model)
- `packages/api/src/modules/committees/committees.service.ts`
- `packages/api/src/modules/committees/dto/`

**Changes:**
1. Add `termStartDate` and `termEndDate` to CommitteeMember (MANDATORY)
2. Validation: Cannot add member without term dates
3. Add endpoint to extend term
4. Track member history
5. Show term information in UI
6. Edge case: When term ends, member must be extended or replaced

**Updated CommitteeMember:**
```prisma
model CommitteeMember {
  // ... existing fields
  termStartDate    DateTime    // MANDATORY - when term started
  termEndDate      DateTime    // MANDATORY - when term should end
  // appointedDate and endDate already exist for actual service dates
}
```

---

### PHASE 7: Employee Profile - Complaints Tab
**Priority: MEDIUM**

**Files to create/modify:**
- `packages/api/src/modules/employees/employees.controller.ts` (add endpoint)
- `packages/api/src/modules/complaints/complaints.service.ts` (add method)
- `packages/web/src/features/employees/pages/EmployeeDetailPage.tsx`
- `packages/web/src/features/employees/components/EmployeeComplaintsTab.tsx` (NEW)

**Features:**
- List all complaints where employee is accused
- Show full timeline for each complaint
- Show committee that handled the case
- Show finding, punishment, appeal details
- Expandable rows for full history

---

### PHASE 8: Employee Profile - Committees Tab
**Priority: LOW**

**Files to create/modify:**
- `packages/api/src/modules/committees/committees.controller.ts` (add endpoint)
- `packages/web/src/features/employees/pages/EmployeeDetailPage.tsx`
- `packages/web/src/features/employees/components/EmployeeCommitteesTab.tsx` (NEW)

**Features:**
- List current committee memberships
- Show role, term dates
- List historical memberships
- Show "Served as [ROLE] from [DATE] to [DATE]"

---

### PHASE 9: Committee Creation Restrictions
**Priority: MEDIUM**

**Files to modify:**
- `packages/api/src/modules/committees/committees.service.ts`
- `packages/api/src/modules/committees/committees.controller.ts`
- `packages/web/src/features/committees/components/CommitteeFormDialog.tsx`

**Backend Changes:**
1. Add role check in `createCommittee()`:
   - CENTER_ADMIN: Can only create for their center
   - HQ_ADMIN: Can create HQ committees (centerId = null)
2. Throw ForbiddenException if role doesn't match

**Frontend Changes:**
- Hide "Create Committee" button if user lacks permission
- Auto-set centerId for CENTER_ADMIN users

---

### PHASE 10: HQ Oversight Dashboard
**Priority: LOW**

**Files to create:**
- `packages/api/src/modules/committees/dto/committee-statistics.dto.ts` (NEW)
- `packages/web/src/features/committees/pages/CommitteesOverviewPage.tsx` (NEW)

**Backend Endpoint:**
```typescript
GET /committees/statistics
// Returns:
{
  totalCommittees: number,
  byCenter: [
    { centerId, centerName, committeeCount, activeCount, memberCount }
  ],
  byStatus: { active, suspended, dissolved },
  complaintStats: {
    totalAssigned: number,
    pendingInvestigation: number,
    forwardedToHq: number
  }
}
```

**Frontend Page:**
- Cards showing overall stats
- Table of centers with their committee counts
- Drill-down to see center's committees
- Only visible to HQ_ADMIN role

---

## SUMMARY TABLE

| Phase | Description | Backend | Frontend | Priority |
|-------|-------------|---------|----------|----------|
| 1 | Permission-based UI | - | High | HIGH |
| 2 | Update statuses | High | Medium | HIGH |
| 3 | Article 31 flow | High | High | HIGH |
| 4 | Article 30 Level 5+ | Medium | Medium | HIGH |
| 5 | Appeal process | Medium | Medium | MEDIUM |
| 6 | Term limits | Medium | Medium | MEDIUM |
| 7 | Employee complaints tab | Medium | High | MEDIUM |
| 8 | Employee committees tab | Low | Medium | LOW |
| 9 | Committee creation restrict | Medium | Low | MEDIUM |
| 10 | HQ dashboard | Medium | High | LOW |

---

## PERMISSION MATRIX

### Complaint Permissions:
```
complaints.create.complaint   - Register new complaint
complaints.read.complaint     - View complaints list/detail
complaints.update.complaint   - Edit complaint details
complaints.action.complaint   - Perform workflow actions (notify, finding, decision, etc.)
complaints.delete.complaint   - Delete/archive complaint
```

### Committee Permissions:
```
committees.create.committee   - Create new committee
committees.read.committee     - View committees
committees.update.committee   - Edit committee details
committees.manage.committee   - Suspend/reactivate/dissolve
committees.create.type        - Create committee types
committees.read.type          - View committee types
committees.update.type        - Edit committee types
committees.delete.type        - Delete committee types
committees.read.member        - View committee members
committees.manage.member      - Add/remove/change member roles
```

### Role Permission Assignments:

| Role | Permissions |
|------|-------------|
| **IT_ADMIN** | All permissions |
| **HQ_ADMIN** | All committees (all centers), all complaints |
| **HR_DIRECTOR** | Read all, create/update complaints, manage committees |
| **CENTER_ADMIN** | Own center committees, complaints |
| **HR_OFFICER** | Create/read complaints, read committees |
| **COMMITTEE_SECRETARY** | Read/action own committee complaints |
| **VIEWER** | Read only |
