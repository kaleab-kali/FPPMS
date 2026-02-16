# Employee Edit Authorization Policy

> Defines who can edit what on employee records, based on role hierarchy and self-edit rules.

**Status:** Implemented
**Last Updated:** 2026-02-16

---

## Overview

Employee record editing follows a **tiered authorization model** that combines:
1. **Self-edit rules** - What fields a user can change on their own record
2. **Role hierarchy enforcement** - Who can edit sensitive fields on other users' records
3. **Audit logging** - All edits are logged, with self-edits flagged separately

---

## Role Hierarchy (Levels)

| Role | Level | Scope |
|------|-------|-------|
| IT_ADMIN | 100 | ALL_CENTERS |
| HQ_ADMIN | 95 | ALL_CENTERS |
| HR_DIRECTOR | 90 | ALL_CENTERS |
| CENTER_ADMIN | 85 | OWN_CENTER |
| CENTER_COMMANDER | 80 | OWN_CENTER |
| HR_OFFICER | 70 | OWN_CENTER |
| DEPARTMENT_HEAD | 60 | OWN_CENTER |
| SUPERVISOR | 50 | OWN_CENTER |
| FINANCE_OFFICER | 40 | OWN_CENTER |
| RECORDS_OFFICER | 30 | OWN_CENTER |

---

## Field Categories

### Personal Fields (Self-Editable)

These fields can be edited by the employee on their own record:

- `primaryPhone`, `secondaryPhone`
- `email`
- Address fields: `addressRegionId`, `addressSubCityId`, `addressWoredaId`, `houseNumber`, `uniqueAreaName`
- Emergency contact fields: `emergencyContactName`, `emergencyContactNameAm`, `emergencyContactRelationship`, `emergencyContactPhone`, `emergencyContactAltPhone`, `emergencyContactEmail`, emergency address fields
- Physical info: `height`, `weight`
- `distinguishingMarks`
- Mother info: `motherFullName`, `motherFullNameAm`, `motherPhone`, `motherIsAlive`, `motherAddress`

### Sensitive Fields (Require Higher Role)

These fields can ONLY be edited by someone with a role level >= the target employee's highest role level:

- `firstName`, `firstNameAm`, `middleName`, `middleNameAm`, `lastName`, `lastNameAm`
- `gender`, `dateOfBirth`, `birthPlace`, `birthPlaceAm`
- `nationality`, `ethnicity`
- `faydaId`, `faydaVerified`, `passportNumber`, `drivingLicense`
- `bloodType`, `eyeColor`, `hairColor`
- `centerId`, `departmentId`, `positionId`
- `rankId`, `currentSalaryStep`
- `workScheduleType`, `maritalStatus`
- `employeeType`, `status`
- `currentSalary`, `retirementDate`

### Always Blocked for Self-Action

These actions can NEVER be performed on your own record:

- Delete (soft delete)
- Change status (active, suspended, terminated, etc.)
- Return to active

---

## Authorization Rules

### Rule 1: Self-Edit (Personal Fields Only)

```
IF user.employeeId === targetEmployee.id
  AND all changed fields are in PERSONAL_FIELDS
THEN ALLOW (audit as SELF_EDIT)
```

### Rule 2: Self-Edit Sensitive Fields Blocked

```
IF user.employeeId === targetEmployee.id
  AND any changed field is in SENSITIVE_FIELDS
THEN DENY with "You cannot modify sensitive fields on your own record"
```

### Rule 3: Edit Others - Role Level Check

```
IF user.employeeId !== targetEmployee.id
  AND user.maxRoleLevel >= targetEmployee.maxRoleLevel
THEN ALLOW (normal edit)
```

### Rule 4: Edit Others - Insufficient Level

```
IF user.employeeId !== targetEmployee.id
  AND user.maxRoleLevel < targetEmployee.maxRoleLevel
THEN DENY with "Insufficient role level to edit this employee"
```

### Rule 5: Self Delete/Status Change Always Blocked

```
IF user.employeeId === targetEmployee.id
  AND action is DELETE or CHANGE_STATUS or RETURN_TO_ACTIVE
THEN DENY with "You cannot perform this action on your own record"
```

### Rule 6: Delete/Status Change Requires Higher Level

```
IF user.employeeId !== targetEmployee.id
  AND action is DELETE or CHANGE_STATUS or RETURN_TO_ACTIVE
  AND user.maxRoleLevel <= targetEmployee.maxRoleLevel
THEN DENY (unless IT_ADMIN editing peer IT_ADMIN)
```

---

## Implementation Details

### Files Involved

| File | Purpose |
|------|---------|
| `packages/api/src/common/utils/access-scope.util.ts` | `validateNotSelfEdit()`, `validateEditAuthorization()` |
| `packages/api/src/common/dto/auth-user.dto.ts` | `employeeId` field on AuthUserDto |
| `packages/api/src/modules/employees/employees.service.ts` | Uses validation in update/delete/status methods |
| `packages/api/src/modules/employees/employees.controller.ts` | Passes user context to service |

### How Role Level Is Determined

For the **acting user**: use the maximum level from their assigned roles (from JWT `roles` array mapped to `ROLE_LEVELS`).

For the **target employee**: query their linked User record and find the maximum level from their assigned roles. If the target employee has no User account, their effective level is 0 (any role can edit them).

### Audit Log Flags

When a self-edit occurs on personal fields, the audit log entry includes:
- `isSelfEdit: true`
- `editType: "SELF_EDIT"`

When editing another user's record:
- `isSelfEdit: false`
- `editType: "STANDARD_EDIT"`

---

## Examples

### Example 1: HR Officer Edits Own Phone

- User: HR Officer (level 70), employeeId = "emp-123"
- Target: Employee "emp-123"
- Fields changed: `primaryPhone`
- Result: **ALLOWED** (personal field, self-edit)

### Example 2: HR Officer Tries to Edit Own Salary Step

- User: HR Officer (level 70), employeeId = "emp-123"
- Target: Employee "emp-123"
- Fields changed: `currentSalaryStep`
- Result: **DENIED** ("You cannot modify sensitive fields on your own record")

### Example 3: HR Officer Edits Regular Employee

- User: HR Officer (level 70)
- Target: Employee with no user account (level 0)
- Fields changed: `firstName`, `departmentId`
- Result: **ALLOWED** (70 >= 0)

### Example 4: HR Officer Tries to Edit HR Director

- User: HR Officer (level 70)
- Target: Employee linked to HR Director user (level 90)
- Fields changed: `firstName`
- Result: **DENIED** ("Insufficient role level to edit this employee")

### Example 5: IT Admin Edits Another IT Admin

- User: IT Admin (level 100), employeeId = "emp-001"
- Target: Employee "emp-002" linked to IT Admin (level 100)
- Fields changed: any
- Result: **ALLOWED** (100 >= 100, and not self-edit)

### Example 6: Center Admin Tries to Delete Own Record

- User: Center Admin (level 85), employeeId = "emp-050"
- Target: Employee "emp-050"
- Action: DELETE
- Result: **DENIED** ("You cannot perform this action on your own record")

---

## Related Documentation

- [SECURITY-GUIDE.md](./SECURITY-GUIDE.md) - OWASP security practices
- [BUSINESS-RULES.md](../business/BUSINESS-RULES.md) - Business domain rules
- [AI-MODULE-GUIDE.md](./AI-MODULE-GUIDE.md) - Module creation patterns
