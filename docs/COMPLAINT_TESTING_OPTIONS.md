# Complaint Module Testing - Setup Options

## Problem Summary

To test the complete Article 31 flow (Center → HQ), you need **3 different users**:

| User | Role | What They Do |
|------|------|--------------|
| Center HR | HR_OFFICER | Registers complaint |
| Center Committee Member | Any + Committee membership | Investigates, forwards to HQ |
| HQ Committee Member | HQ_ADMIN + Committee membership | Makes final HQ decision |

**Current Issue:** IT_ADMIN cannot act as HQ Committee Member because:
1. No `employeeId` linked → "My Committees" sidebar section hidden
2. `centerId` is set (not NULL) → Not recognized as HQ user

---

## Option A: Quick Fix for IT_ADMIN (For Manual Testing)

**Pros:**
- Fast to set up
- Can test HQ flow immediately
- Single user can see HQ complaints

**Cons:**
- Cannot simulate full multi-user flow
- Still need another user for center-level actions
- Not realistic for production testing

**Setup Required:**
```sql
-- 1. Set IT_ADMIN as HQ user
UPDATE users SET center_id = NULL WHERE username = 'admin';

-- 2. Create employee record for IT_ADMIN
-- 3. Create HQ discipline committee
-- 4. Add IT_ADMIN employee to HQ committee as CHAIRMAN
```

---

## Option B: Create Separate Test Users (Recommended)

**Pros:**
- Realistic multi-user flow testing
- Can test permissions properly
- Better for E2E test automation
- Tests actual user experience

**Cons:**
- More setup time
- Need to switch between accounts to test

**Users to Create:**

| Username | Role | Center | Employee | Committee |
|----------|------|--------|----------|-----------|
| `hr_center1` | HR_OFFICER | Center 1 | Yes | No |
| `committee_center1` | CENTER_ADMIN | Center 1 | Yes | Center 1 Discipline Committee |
| `hq_committee` | HQ_ADMIN | NULL (HQ) | Yes | HQ Discipline Committee |

---

## Option C: E2E Test Infrastructure (Best for Long-term)

**Pros:**
- Automated testing
- Repeatable
- Catches regressions
- Documents expected behavior

**Cons:**
- Most setup time initially
- Need to maintain test data

**Approach:**
1. Create Playwright/Cypress test suite
2. Set up test data via API/seed before tests
3. Login as different users programmatically
4. Walk through complete flows
5. Clean up after tests

---

## Recommendation

**For immediate testing:** Go with **Option A** (Quick Fix for IT_ADMIN)
- Gets you testing today
- Can verify the bug fixes work

**For proper QA:** Set up **Option B** (Separate Test Users)
- Create via UI or seed script
- More realistic testing

**For CI/CD:** Eventually add **Option C** (E2E Tests)
- After manual testing confirms flows work

---

## What Was Already Fixed

1. **"Forward to HQ" button bug** - Was checking wrong condition, now fixed in `useComplaintActions.ts`
2. **Access scope editing for system roles** - Now allowed in both frontend and backend

---

## Next Steps

Choose an option above, then:

1. If **Option A**: I'll run the SQL to set up IT_ADMIN
2. If **Option B**: I'll create a seed script for test users
3. If **Option C**: I'll set up E2E test infrastructure

After setup, test the flow:
1. Register Article 31 complaint (as center user)
2. Process through committee (as committee member)
3. Forward to HQ
4. Record HQ Decision (as HQ committee member)
5. Close or Appeal
