# Complaint Module - Complete Flow Guide

## Overview

This document explains the complete flow of the complaint module from login to final decision, including what each user role can see and do.

---

## User Roles and Access

| Role | Access Scope | What They Can See | What They Can Do |
|------|--------------|-------------------|------------------|
| **IT_ADMIN** | ALL_CENTERS | All complaints from all centers | All actions (for testing) |
| **HQ_ADMIN** | ALL_CENTERS | All complaints from all centers | HQ-level decisions |
| **HR_DIRECTOR** | ALL_CENTERS | All complaints from all centers | Oversight, HQ decisions |
| **CENTER_ADMIN** | OWN_CENTER | Only their center's complaints | All center-level actions |
| **HR_OFFICER** | OWN_CENTER | Only their center's complaints | Register, investigate, decisions |
| **CENTER_COMMANDER** | OWN_CENTER | Only their center's complaints | Superior decisions |

---

## The Problem: How to Test the Full Flow

### Current Issue
You are logged in as **IT_ADMIN** but:
1. IT_ADMIN user has `centerId` set to a center (should be NULL for HQ)
2. IT_ADMIN has no `employeeId` so cannot be added to committees
3. Cannot see "My Committees" in sidebar because no employee record

### What You Need to Test

**Article 31 Flow (Serious Offenses):**
```
CENTER HR Officer                    HQ Committee
       |                                  |
   Registers complaint                    |
       |                                  |
   Assigns to Center Committee            |
       |                                  |
   Committee investigates                 |
       |                                  |
   Records Finding                        |
       |                                  |
   Forwards to HQ  ─────────────────────► Receives case
       |                                  |
       |                              Reviews case
       |                                  |
       |                              Records HQ Decision
       |                                  |
       ◄──────────────────────────────  Decided
       |
   Can Appeal or Close
```

---

## Two Options to Test

### Option A: Create Proper Test Users (Recommended)

You need **3 users minimum** to test the full flow:

1. **Center HR User** (OWN_CENTER scope)
   - Has an employee record at a specific center
   - Role: HR_OFFICER or CENTER_ADMIN
   - Can register complaints and manage center-level flow

2. **Center Committee Member** (OWN_CENTER scope)
   - Has an employee record at same center
   - Added to a DISCIPLINE committee at that center
   - Can see "My Committees" in sidebar
   - Can investigate and record findings

3. **HQ Committee Member** (ALL_CENTERS scope)
   - Has an employee record with centerId = NULL
   - Added to an HQ-level DISCIPLINE committee (centerId = NULL)
   - Can see "My Committees" in sidebar showing HQ committee
   - Can receive forwarded cases and record HQ decisions

### Option B: Fix IT_ADMIN for Testing (Quick but Limited)

1. Set IT_ADMIN's `centerId` to NULL
2. Create an employee record for IT_ADMIN
3. Add that employee to an HQ committee
4. IT_ADMIN can now act as HQ committee member

**Limitation:** You still cannot act as a center user - you'd need to create another account.

---

## Detailed Flow: Article 30 (Minor Offense)

```
┌─────────────────────────────────────────────────────────────────┐
│  USER: HR_OFFICER at Center X                                   │
│  PAGE: /complaints/register                                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Step 1: Select Article 30                                      │
│  Step 2: Select Offense (e.g., "Late to work")                  │
│  Step 3: Search & Select Accused Employee                       │
│  Step 4: Enter Complainant Info                                 │
│  Step 5: Enter Incident Details + Summary                       │
│  Submit → Creates complaint with status: UNDER_HR_REVIEW        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  PAGE: /complaints/:id (Detail Page)                            │
│  STATUS: UNDER_HR_REVIEW                                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Available Actions:                                             │
│  ┌──────────────────────┐                                       │
│  │ Send Notification    │ → Records when accused was notified   │
│  └──────────────────────┘                                       │
│                                                                 │
│  If Level 5+ offense:                                           │
│  ┌──────────────────────┐                                       │
│  │ Forward to Committee │ → Escalates to discipline committee   │
│  └──────────────────────┘                                       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                              │
              (Click "Send Notification")
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  STATUS: WAITING_FOR_REBUTTAL                                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Available Actions:                                             │
│  ┌──────────────────────┐                                       │
│  │ Record Rebuttal      │ → Employee's defense received         │
│  └──────────────────────┘                                       │
│  ┌──────────────────────────────┐                               │
│  │ Mark Deadline Passed (RED)   │ → Auto GUILTY finding         │
│  └──────────────────────────────┘                               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                              │
              (Click "Record Rebuttal" or "Deadline Passed")
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  STATUS: UNDER_HR_ANALYSIS                                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Available Actions:                                             │
│  ┌──────────────────────┐                                       │
│  │ Record Finding       │ → GUILTY / NOT_GUILTY decision        │
│  └──────────────────────┘                                       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                              │
              (Click "Record Finding" → Select GUILTY)
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  STATUS: AWAITING_SUPERIOR_DECISION                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Available Actions:                                             │
│  ┌──────────────────────┐                                       │
│  │ Record Decision      │ → Punishment % and description        │
│  └──────────────────────┘                                       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                              │
              (Click "Record Decision")
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  STATUS: DECIDED                                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Available Actions:                                             │
│  ┌──────────────────────┐                                       │
│  │ Submit Appeal        │ → Start appeal process                │
│  └──────────────────────┘                                       │
│  ┌──────────────────────┐                                       │
│  │ Close Complaint      │ → Finalize case                       │
│  └──────────────────────┘                                       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Detailed Flow: Article 31 (Serious Offense)

```
┌─────────────────────────────────────────────────────────────────┐
│  USER: HR_OFFICER at Center X                                   │
│  PAGE: /complaints/register                                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Step 1: Select Article 31                                      │
│  Step 2: Select Offense (e.g., "Theft", "Assault")              │
│  Step 3-5: Same as Article 30                                   │
│                                                                 │
│  Submit → Creates complaint with status: WITH_DISCIPLINE_COMMITTEE│
│           (Auto-assigns to center's discipline committee)       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  USER: Committee Member at Center X                             │
│  PAGE: /my-committee/:committeeId/cases (Tab: Assigned)         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  See the new complaint in their assigned cases                  │
│  Click to view details                                          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  PAGE: /complaints/:id                                          │
│  STATUS: WITH_DISCIPLINE_COMMITTEE                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Available Actions:                                             │
│  ┌──────────────────────┐                                       │
│  │ Send Notification    │                                       │
│  └──────────────────────┘                                       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                              │
              ... (Same rebuttal flow as Article 30) ...
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  STATUS: COMMITTEE_ANALYSIS                                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Available Actions:                                             │
│  ┌──────────────────────┐                                       │
│  │ Record Finding       │                                       │
│  └──────────────────────┘                                       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                              │
              (Click "Record Finding" → Select GUILTY)
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  STATUS: INVESTIGATION_COMPLETE                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Available Actions:                                             │
│  ┌──────────────────────┐                                       │
│  │ Forward to HQ        │ → Send to HQ committee for decision   │
│  └──────────────────────┘                                       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                              │
              (Click "Forward to HQ" → Select HQ Committee)
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  USER: HQ Committee Member (centerId = NULL)                    │
│  PAGE: /my-committee/:hqCommitteeId/cases (Tab: HQ Complaints)  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  See forwarded complaints in HQ Complaints tab                  │
│  Click to view details                                          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  PAGE: /complaints/:id                                          │
│  STATUS: AWAITING_HQ_DECISION                                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Available Actions:                                             │
│  ┌──────────────────────┐                                       │
│  │ Record HQ Decision   │ → Final punishment decision           │
│  └──────────────────────┘                                       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                              │
              (Click "Record HQ Decision")
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  STATUS: DECIDED_BY_HQ                                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Available Actions:                                             │
│  ┌──────────────────────┐                                       │
│  │ Submit Appeal        │                                       │
│  └──────────────────────┘                                       │
│  ┌──────────────────────┐                                       │
│  │ Close Complaint      │                                       │
│  └──────────────────────┘                                       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Where to Find Things in the UI

### 1. Complaints List
**Path:** Sidebar → Complaints → All Complaints
**URL:** `/complaints`
**Shows:** Table of all complaints visible to user based on access scope

### 2. Register Complaint
**Path:** Sidebar → Complaints → Register Complaint
**URL:** `/complaints/register`
**Or:** Click "Register Complaint" button on list page

### 3. Complaint Details
**Path:** Click on any complaint row in the list
**URL:** `/complaints/:id`
**Shows:** Full details, timeline, actions based on status

### 4. My Committee Cases
**Path:** Sidebar → My Committees → [Committee Name]
**URL:** `/my-committee/:committeeId/cases`
**Shows:** Two tabs - "Assigned Complaints" and "HQ Complaints"
**Note:** Only visible if user's employee record is a member of a committee

### 5. HQ Dashboard
**Path:** Sidebar → Dashboard → HQ Oversight
**URL:** `/dashboard/hq`
**Shows:** Statistics across all centers
**Note:** Only visible to users with ALL_CENTERS access

---

## Database Requirements for Testing

### To have a working HQ flow, you need:

1. **An HQ Committee** (centerId = NULL)
   ```sql
   -- Check if HQ committee exists
   SELECT * FROM committees WHERE center_id IS NULL;
   ```

2. **An Employee at HQ** (centerId = NULL on their user record)
   ```sql
   -- Check for HQ employees
   SELECT e.id, e.employee_id, e.full_name, u.center_id
   FROM employees e
   JOIN users u ON u.employee_id = e.id
   WHERE u.center_id IS NULL;
   ```

3. **That employee must be a committee member**
   ```sql
   -- Check HQ committee members
   SELECT cm.*, e.full_name, c.name as committee_name
   FROM committee_members cm
   JOIN employees e ON cm.employee_id = e.id
   JOIN committees c ON cm.committee_id = c.id
   WHERE c.center_id IS NULL;
   ```

---

## Testing Strategy Recommendation

### For Development/Manual Testing:

1. **Create a test script** that sets up:
   - 1 HQ user (admin employee with HQ role)
   - 1 HQ committee with that employee as member
   - 1 Center user (HR officer at a center)
   - 1 Center committee at that center with members

2. **Test Article 31 flow:**
   - Login as Center HR → Register Article 31 complaint
   - See it auto-assigned to center committee
   - Act as committee member → Process through investigation
   - Forward to HQ
   - Login as HQ user → See complaint in "HQ Complaints" tab
   - Record HQ Decision

### For E2E Testing:

Create Playwright/Cypress tests that:
1. Set up test data via API before tests
2. Login as different users
3. Walk through complete flows
4. Clean up after tests

---

## Quick Fix for Current Issue

If you just want to see the HQ flow working NOW:

```sql
-- 1. Find or create an HQ committee
INSERT INTO committees (id, tenant_id, name, name_am, committee_type_id, status, center_id)
SELECT
  gen_random_uuid(),
  (SELECT id FROM tenants LIMIT 1),
  'HQ Discipline Committee',
  'HQ Discipline Committee',
  (SELECT id FROM committee_types WHERE code = 'DISCIPLINE' LIMIT 1),
  'ACTIVE',
  NULL  -- This makes it an HQ committee
WHERE NOT EXISTS (
  SELECT 1 FROM committees WHERE center_id IS NULL AND status = 'ACTIVE'
);

-- 2. Create an employee for IT_ADMIN user (if not exists)
-- Then add them to the HQ committee as CHAIRMAN

-- 3. Set IT_ADMIN user's centerId to NULL
UPDATE users SET center_id = NULL WHERE username = 'admin';
```

After this, IT_ADMIN should be able to see complaints forwarded to HQ.
