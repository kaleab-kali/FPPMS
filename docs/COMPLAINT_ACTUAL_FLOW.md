# ACTUAL Complaint Flow - Based on Real Code

## Users Required to Complete Article 31 Flow

You need **3 different users** with **3 different database setups**:

| User | Role | Database Requirements | Sidebar Menus Visible |
|------|------|----------------------|----------------------|
| **Center HR** | HR_OFFICER | `user.centerId` = Center X | Complaints > All, Register |
| **Center Committee Member** | Any | `employee` record + `committee_member` at Center X committee | My Committees > [Committee Name] |
| **HQ Committee Member** | HQ_ADMIN | `employee` record + `committee_member` at HQ committee (centerId=NULL) | My Committees > [HQ Committee Name] |

---

## ACTUAL SIDEBAR MENUS (from AppSidebar.tsx)

### Menu Structure:
```
SIDEBAR
|
+-- [MY COMMITTEES] (Group - ONLY VISIBLE if user has employee AND is committee member)
|   |
|   +-- Assigned Cases (Collapsible)
|       |
|       +-- [Committee Name 1] --> /my-committee/:id/cases
|       +-- [Committee Name 2] --> /my-committee/:id/cases
|
+-- [NAVIGATION] (Group)
    |
    +-- Dashboard
    |   +-- Overview --> /dashboard
    |   +-- HQ Oversight --> /dashboard/hq (requires ALL_CENTERS access)
    |
    +-- Complaints (requires complaints.read.complaint)
    |   +-- All Complaints --> /complaints
    |   +-- Register Complaint --> /complaints/register (requires complaints.create.complaint)
    |
    +-- Committees (requires committees.read.committee)
        +-- All Committees --> /committees
        +-- Committee Types --> /committees/types
```

### Critical: "My Committees" Visibility

The "My Committees" section in sidebar is controlled by:

```typescript
// AppSidebar.tsx line 396
{myCommittees && myCommittees.length > 0 && (
    <SidebarGroup>
        <SidebarGroupLabel>{t("myCommittees")}</SidebarGroupLabel>
        ...
    </SidebarGroup>
)}
```

`myCommittees` comes from `useMyCommittees()` hook which calls:
```
GET /committees/my-committees
```

Backend controller (committees.controller.ts line 339-348):
```typescript
@Get("my-committees")
getMyCommittees(
    @CurrentTenant() tenantId: string,
    @CurrentUser("employeeId") employeeId: string | undefined,  // <-- CRITICAL
    @Query("includeInactive") includeInactive?: string,
) {
    if (!employeeId) {
        return [];  // <-- Returns EMPTY if user has no employee record!
    }
    return this.committeesService.getEmployeeCommittees(tenantId, employeeId, includeInactive === "true");
}
```

**IF USER HAS NO EMPLOYEE RECORD → `employeeId` IS UNDEFINED → RETURNS EMPTY ARRAY → "MY COMMITTEES" NOT SHOWN**

---

## STEP-BY-STEP ACTUAL FLOW

### PHASE 1: Center HR Registers Article 31 Complaint

**User:** HR_OFFICER at Center X
**Required DB:** `users.center_id` = Center X ID

**Step 1.1: Navigate to Register**
```
CLICK: Sidebar > Complaints > Register Complaint
URL: /complaints/register
```

**Step 1.2: Fill Form**
```
Page: ComplaintRegisterPage.tsx

Select: Article 31 (radio button)
Select: Offense from dropdown
Search: Accused Employee (EmployeeSearch component)
Select: Complainant Type
Enter: Incident Date, Location, Summary
CLICK: Submit button
```

**Step 1.3: Backend Creates Complaint**
```
POST /complaints

Backend (complaints.service.ts line 85-97):
- If Article 31, auto-finds discipline committee for center
- Sets status = WITH_DISCIPLINE_COMMITTEE
- Sets assignedCommitteeId = found committee ID
```

**RESULT:**
- Complaint created with status `WITH_DISCIPLINE_COMMITTEE`
- Auto-assigned to center's DISCIPLINE committee

---

### PHASE 2: Center Committee Member Processes Case

**User:** Employee who is member of Center X's DISCIPLINE committee
**Required DB:**
- `users.employee_id` = some employee ID
- `committee_members.employee_id` = same employee ID
- `committee_members.committee_id` = Center X's discipline committee
- `committees.center_id` = Center X ID (NOT NULL)

**Step 2.1: See Committee in Sidebar**
```
Sidebar shows:
  MY COMMITTEES
  └── Assigned Cases
      └── [Discipline Committee Name] (CHAIRMAN badge)
```

**Step 2.2: Navigate to Cases**
```
CLICK: Sidebar > My Committees > Assigned Cases > [Committee Name]
URL: /my-committee/:committeeId/cases
Page: MyCommitteeCasesPage.tsx
```

**Step 2.3: View Assigned Complaints**
```
Page shows 2 tabs:
  [Assigned Complaints] (X) | [HQ Complaints] (0)

Table shows the complaint just registered
CLICK: View Details button on complaint row
URL: /complaints/:id
```

**Step 2.4: Send Notification**
```
Page: ComplaintDetailPage.tsx
Status: WITH_DISCIPLINE_COMMITTEE

Actions Card shows:
  [Send Notification] button

CLICK: Send Notification
FILL: Date, Notes
SUBMIT
```
**New Status:** `COMMITTEE_WAITING_REBUTTAL`

**Step 2.5: Record Rebuttal (or Mark Deadline Passed)**
```
Actions Card shows:
  [Record Rebuttal] button
  [Mark Deadline Passed] button (RED)

CLICK: Record Rebuttal
FILL: Date, Content, Notes
SUBMIT
```
**New Status:** `COMMITTEE_ANALYSIS`

**Step 2.6: Record Finding**
```
Actions Card shows:
  [Record Finding] button

CLICK: Record Finding
SELECT: Finding (GUILTY / NOT_GUILTY)
FILL: Date, Reason, Notes
SUBMIT
```
**New Status:** `INVESTIGATION_COMPLETE`

**Step 2.7: Forward to HQ**
```
Actions Card shows:
  [Forward to HQ] button  <-- THIS WAS BROKEN, NOW FIXED

CLICK: Forward to HQ
SELECT: HQ Committee (dropdown of committees with centerId = NULL)
FILL: Date, Notes
SUBMIT
```
**New Status:** `AWAITING_HQ_DECISION`
**Sets:** `hqCommitteeId` = selected HQ committee

---

### PHASE 3: HQ Committee Member Makes Decision

**User:** Employee who is member of HQ DISCIPLINE committee
**Required DB:**
- `users.employee_id` = some employee ID
- `users.center_id` = NULL (HQ user)
- `committee_members.employee_id` = same employee ID
- `committee_members.committee_id` = HQ discipline committee
- `committees.center_id` = NULL (HQ-level committee)

**Step 3.1: See HQ Committee in Sidebar**
```
Sidebar shows:
  MY COMMITTEES
  └── Assigned Cases
      └── [HQ Discipline Committee Name] (CHAIRMAN badge)
```

**Step 3.2: Navigate to HQ Cases**
```
CLICK: Sidebar > My Committees > Assigned Cases > [HQ Committee Name]
URL: /my-committee/:hqCommitteeId/cases
Page: MyCommitteeCasesPage.tsx
```

**Step 3.3: View HQ Complaints Tab**
```
Page shows 2 tabs:
  [Assigned Complaints] (0) | [HQ Complaints] (1)  <-- Click this tab!

Table shows forwarded complaint
CLICK: View Details button
URL: /complaints/:id
```

**Step 3.4: Record HQ Decision**
```
Page: ComplaintDetailPage.tsx
Status: AWAITING_HQ_DECISION

Actions Card shows:
  [Record HQ Decision] button

CLICK: Record HQ Decision
FILL: Decision Date, Punishment Description, Notes
SUBMIT
```
**New Status:** `DECIDED_BY_HQ`

---

### PHASE 4: Close or Appeal

**Step 4.1: Submit Appeal (Optional)**
```
Status: DECIDED_BY_HQ

Actions Card shows:
  [Submit Appeal] button
  [Close Complaint] button

CLICK: Submit Appeal
FILL: Date, Reviewer Employee, Reason, Notes
SUBMIT
```
**New Status:** `ON_APPEAL`

**Step 4.2: Record Appeal Decision**
```
Status: ON_APPEAL

Actions Card shows:
  [Record Appeal Decision] button

CLICK: Record Appeal Decision
SELECT: Decision (UPHELD/MODIFIED/OVERTURNED)
FILL: Date, Reason, New Punishment (if modified), Notes
SUBMIT
```
**New Status:** `APPEAL_DECIDED`

**Step 4.3: Close Complaint**
```
Actions Card shows:
  [Close Complaint] button

CLICK: Close Complaint
FILL: Date, Reason, Notes
SUBMIT
```
**Final Status:** `CLOSED_FINAL`

---

## WHAT'S BROKEN / MISSING

### Issue 1: IT_ADMIN Cannot See "My Committees"
**Problem:** IT_ADMIN has no `employeeId` in users table
**Result:** `useMyCommittees()` returns empty → sidebar doesn't show "My Committees"
**Fix:** Create employee record for IT_ADMIN and link it

### Issue 2: IT_ADMIN Has centerId Set (Not HQ)
**Problem:** IT_ADMIN user has `centerId` pointing to a center
**Result:** Not treated as HQ user
**Fix:** Set `users.center_id = NULL` for IT_ADMIN

### Issue 3: "Forward to HQ" Button Was Not Appearing
**Problem:** Code checked `!complaint.centerId` instead of `!complaint.hqCommitteeId`
**Result:** Button never showed (complaints always have centerId)
**Fixed:** Changed logic to check `!complaint.hqCommitteeId`

### Issue 4: No HQ Committee Exists
**Problem:** Need a committee with `center_id = NULL` for HQ level
**Result:** Can't forward to HQ even if button appears
**Fix:** Create HQ discipline committee

---

## DATABASE RECORDS NEEDED

### For Complete Test Flow:

```sql
-- 1. Check/Create Center (you probably have this)
SELECT id, code, name FROM centers LIMIT 5;

-- 2. Check/Create Discipline Committee Type
SELECT id, code, name FROM committee_types WHERE code = 'DISCIPLINE';

-- 3. Check Center Discipline Committee exists
SELECT c.id, c.name, c.center_id, ct.code as type
FROM committees c
JOIN committee_types ct ON c.committee_type_id = ct.id
WHERE ct.code = 'DISCIPLINE' AND c.center_id IS NOT NULL;

-- 4. Check HQ Discipline Committee exists (center_id = NULL)
SELECT c.id, c.name, c.center_id, ct.code as type
FROM committees c
JOIN committee_types ct ON c.committee_type_id = ct.id
WHERE ct.code = 'DISCIPLINE' AND c.center_id IS NULL;

-- 5. Check IT_ADMIN user
SELECT u.id, u.username, u.employee_id, u.center_id, e.full_name
FROM users u
LEFT JOIN employees e ON u.employee_id = e.id
WHERE u.username = 'admin';

-- 6. Check committee members
SELECT cm.*, e.full_name, c.name as committee_name
FROM committee_members cm
JOIN employees e ON cm.employee_id = e.id
JOIN committees c ON cm.committee_id = c.id
WHERE cm.is_active = true;
```

---

## QUICK TEST SETUP SCRIPT

To test as IT_ADMIN acting as HQ committee member:

```sql
-- 1. Set IT_ADMIN as HQ user (centerId = NULL)
UPDATE users SET center_id = NULL WHERE username = 'admin';

-- 2. Create employee for IT_ADMIN (if not exists)
INSERT INTO employees (id, tenant_id, employee_id, full_name, full_name_am, employee_type, hire_date, status)
SELECT
  gen_random_uuid(),
  u.tenant_id,
  'HQ-ADMIN-001',
  'System Administrator',
  'System Administrator',
  'CIVILIAN',
  CURRENT_DATE,
  'ACTIVE'
FROM users u WHERE u.username = 'admin'
ON CONFLICT DO NOTHING
RETURNING id;

-- 3. Link employee to user
UPDATE users u
SET employee_id = e.id
FROM employees e
WHERE u.username = 'admin' AND e.employee_id = 'HQ-ADMIN-001';

-- 4. Create HQ Discipline Committee (if not exists)
INSERT INTO committees (id, tenant_id, name, name_am, committee_type_id, status, center_id)
SELECT
  gen_random_uuid(),
  (SELECT tenant_id FROM users WHERE username = 'admin'),
  'HQ Discipline Committee',
  'HQ Discipline Committee',
  (SELECT id FROM committee_types WHERE code = 'DISCIPLINE' LIMIT 1),
  'ACTIVE',
  NULL  -- NULL = HQ level
WHERE NOT EXISTS (
  SELECT 1 FROM committees c
  JOIN committee_types ct ON c.committee_type_id = ct.id
  WHERE ct.code = 'DISCIPLINE' AND c.center_id IS NULL
);

-- 5. Add IT_ADMIN employee to HQ Committee as CHAIRMAN
INSERT INTO committee_members (id, tenant_id, committee_id, employee_id, role, appointed_date, is_active, status)
SELECT
  gen_random_uuid(),
  (SELECT tenant_id FROM users WHERE username = 'admin'),
  (SELECT c.id FROM committees c JOIN committee_types ct ON c.committee_type_id = ct.id WHERE ct.code = 'DISCIPLINE' AND c.center_id IS NULL LIMIT 1),
  (SELECT employee_id FROM users WHERE username = 'admin'),
  'CHAIRMAN',
  CURRENT_DATE,
  true,
  'ACTIVE';
```

After running this:
1. Login as IT_ADMIN
2. Should see "My Committees" in sidebar
3. Can navigate to HQ Committee cases
4. Can see complaints forwarded to HQ in "HQ Complaints" tab
5. Can click "Record HQ Decision" button
