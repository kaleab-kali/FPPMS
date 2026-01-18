# API Reference

> Complete list of all REST API endpoints in PPMS

**Base URL:** `http://localhost:3000`

**Swagger UI:** `http://localhost:3000/api` (when running in development)

---

## Authentication

### Login
```
POST /auth/login
Public: Yes

Request:
{
  "username": "FPC-0001-25",
  "password": "Police@2025"
}

Response:
{
  "accessToken": "jwt...",
  "refreshToken": "jwt...",
  "user": { ... }
}
```

### Refresh Token
```
POST /auth/refresh
Public: Yes

Request:
{
  "refreshToken": "jwt..."
}

Response:
{
  "accessToken": "jwt...",
  "refreshToken": "jwt..."
}
```

### Logout
```
POST /auth/logout
Auth: Required

Response: 200 OK
```

### Get Current User
```
GET /auth/me
Auth: Required

Response:
{
  "id": "uuid",
  "username": "FPC-0001-25",
  "employee": { ... },
  "roles": ["HR_OFFICER"]
}
```

### Change Password
```
POST /auth/change-password
Auth: Required

Request:
{
  "currentPassword": "...",
  "newPassword": "..."
}
```

---

## Employees

### List Employees
```
GET /employees
Auth: Required

Query Parameters:
- page (number, default: 1)
- limit (number, default: 10)
- search (string)
- status (EmployeeStatus)
- type (EmployeeType)
- centerId (uuid)
- departmentId (uuid)

Response:
{
  "data": [...],
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "totalPages": 10,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

### Get Employee
```
GET /employees/:id
Auth: Required

Response: Employee object
```

### Create Employee
```
POST /employees
Auth: Required
Permissions: employees:write

Request: CreateEmployeeDto
Response: 201, Employee object
```

### Update Employee
```
PATCH /employees/:id
Auth: Required
Permissions: employees:write

Request: UpdateEmployeeDto
Response: Employee object
```

### Delete Employee
```
DELETE /employees/:id
Auth: Required
Permissions: employees:delete

Response: 200 OK
```

### Change Employee Status
```
PATCH /employees/:id/status
Auth: Required
Permissions: employees:write

Request:
{
  "status": "INACTIVE",
  "reason": "Optional reason"
}
```

---

## Employee Sub-resources

### Employee Photos
```
GET    /employees/:employeeId/photos
POST   /employees/:employeeId/photos (multipart/form-data)
GET    /employees/:employeeId/photos/:photoId
DELETE /employees/:employeeId/photos/:photoId
PATCH  /employees/:employeeId/photos/:photoId/approve
PATCH  /employees/:employeeId/photos/:photoId/reject
```

### Employee Family
```
GET    /employees/:employeeId/family
POST   /employees/:employeeId/family
GET    /employees/:employeeId/family/:id
PATCH  /employees/:employeeId/family/:id
DELETE /employees/:employeeId/family/:id
```

### Employee Medical
```
GET    /employees/:employeeId/medical
POST   /employees/:employeeId/medical
GET    /employees/:employeeId/medical/:id
PATCH  /employees/:employeeId/medical/:id
DELETE /employees/:employeeId/medical/:id
```

### Employee Marital Status
```
GET    /employees/:employeeId/marital-status
POST   /employees/:employeeId/marital-status
```

### Employee Transfer
```
GET    /employees/transfer
POST   /employees/transfer
GET    /employees/transfer/:id
PATCH  /employees/transfer/:id/accept
PATCH  /employees/transfer/:id/reject
PATCH  /employees/transfer/:id/cancel
```

### Employee Superior
```
GET    /employee-superior
POST   /employee-superior
GET    /employee-superior/:id
PATCH  /employee-superior/:id
DELETE /employee-superior/:id
```

---

## Organization

### Tenants
```
GET    /tenants
POST   /tenants
GET    /tenants/:id
PATCH  /tenants/:id
DELETE /tenants/:id
```

### Centers
```
GET    /centers
POST   /centers
GET    /centers/:id
PATCH  /centers/:id
DELETE /centers/:id
GET    /centers/:id/departments
```

### Departments
```
GET    /departments
POST   /departments
GET    /departments/:id
PATCH  /departments/:id
DELETE /departments/:id
GET    /departments/:id/employees
```

---

## Lookups

### Positions
```
GET    /positions
POST   /positions
GET    /positions/:id
PATCH  /positions/:id
DELETE /positions/:id
```

### Ranks
```
GET    /ranks
POST   /ranks
GET    /ranks/:id
PATCH  /ranks/:id
DELETE /ranks/:id
GET    /ranks/:id/salary-steps
```

### Regions
```
GET    /lookups/regions
POST   /lookups/regions
GET    /lookups/regions/:id
PATCH  /lookups/regions/:id
DELETE /lookups/regions/:id
```

### Sub-Cities
```
GET    /lookups/sub-cities
POST   /lookups/sub-cities
GET    /lookups/sub-cities/:id
PATCH  /lookups/sub-cities/:id
DELETE /lookups/sub-cities/:id
GET    /lookups/sub-cities/by-region/:regionId
```

### Woredas
```
GET    /lookups/woredas
POST   /lookups/woredas
GET    /lookups/woredas/:id
PATCH  /lookups/woredas/:id
DELETE /lookups/woredas/:id
GET    /lookups/woredas/by-sub-city/:subCityId
```

---

## Users & Access

### Users
```
GET    /users
POST   /users
GET    /users/:id
PATCH  /users/:id
DELETE /users/:id
PATCH  /users/:id/reset-password
PATCH  /users/:id/lock
PATCH  /users/:id/unlock
```

### Roles
```
GET    /roles
POST   /roles
GET    /roles/:id
PATCH  /roles/:id
DELETE /roles/:id
GET    /roles/:id/permissions
PATCH  /roles/:id/permissions
```

### Permissions
```
GET    /permissions
GET    /permissions/:id
```

---

## Attendance

### Shifts
```
GET    /shifts
POST   /shifts
GET    /shifts/:id
PATCH  /shifts/:id
DELETE /shifts/:id
```

### Shift Assignments
```
GET    /shift-assignments
POST   /shift-assignments
GET    /shift-assignments/:id
PATCH  /shift-assignments/:id
DELETE /shift-assignments/:id
GET    /shift-assignments/by-employee/:employeeId
GET    /shift-assignments/by-shift/:shiftId
```

### Attendance Records
```
GET    /attendance
POST   /attendance
GET    /attendance/:id
PATCH  /attendance/:id
DELETE /attendance/:id
GET    /attendance/by-employee/:employeeId
```

### Attendance Device
```
GET    /attendance/device
POST   /attendance/device/sync
```

### Attendance Reports
```
GET    /attendance/reports
GET    /attendance/reports/summary
GET    /attendance/reports/export
```

---

## Holidays
```
GET    /holidays
POST   /holidays
GET    /holidays/:id
PATCH  /holidays/:id
DELETE /holidays/:id
GET    /holidays/by-year/:year
```

---

## Complaints
```
GET    /complaints
POST   /complaints
GET    /complaints/:id
PATCH  /complaints/:id
DELETE /complaints/:id
PATCH  /complaints/:id/status
GET    /complaints/:id/timeline
POST   /complaints/:id/documents
```

---

## Committees
```
GET    /committees
POST   /committees
GET    /committees/:id
PATCH  /committees/:id
DELETE /committees/:id
GET    /committees/:id/members
POST   /committees/:id/members
DELETE /committees/:id/members/:memberId
```

---

## Correspondence
```
GET    /correspondence
POST   /correspondence
GET    /correspondence/:id
PATCH  /correspondence/:id
DELETE /correspondence/:id
GET    /correspondence/:id/attachments
POST   /correspondence/:id/attachments
```

---

## Inventory

### Categories & Types
```
GET    /inventory
POST   /inventory
GET    /inventory/:id
PATCH  /inventory/:id
DELETE /inventory/:id
```

### Center Stock
```
GET    /inventory/center-stock
POST   /inventory/center-stock
GET    /inventory/center-stock/:id
PATCH  /inventory/center-stock/:id
```

### Assignments
```
GET    /inventory/assignments
POST   /inventory/assignments
GET    /inventory/assignments/:id
PATCH  /inventory/assignments/:id
DELETE /inventory/assignments/:id
```

---

## Weapons

### Weapon Registry
```
GET    /weapons
POST   /weapons
GET    /weapons/:id
PATCH  /weapons/:id
DELETE /weapons/:id
```

### Weapon Assignments
```
GET    /weapons/assignments
POST   /weapons/assignments
GET    /weapons/assignments/:id
PATCH  /weapons/assignments/:id/return
```

### Ammunition
```
GET    /ammunition
POST   /ammunition
GET    /ammunition/:id
PATCH  /ammunition/:id
GET    /ammunition/transactions
POST   /ammunition/transactions
```

---

## Rewards
```
GET    /rewards
POST   /rewards
GET    /rewards/:id
PATCH  /rewards/:id
PATCH  /rewards/:id/approve
PATCH  /rewards/:id/reject
GET    /rewards/eligible
```

### Reward Milestones
```
GET    /reward-milestones
POST   /reward-milestones
GET    /reward-milestones/:id
PATCH  /reward-milestones/:id
DELETE /reward-milestones/:id
```

---

## Salary

### Salary Management
```
GET    /salary
POST   /salary
GET    /salary/:id
PATCH  /salary/:id
GET    /salary/by-employee/:employeeId
```

### Salary Scale
```
GET    /salary-scales
POST   /salary-scales
GET    /salary-scales/:id
PATCH  /salary-scales/:id
GET    /salary-scales/:id/steps
POST   /salary-scales/:id/steps
```

---

## Attachments
```
GET    /attachments
POST   /attachments (multipart/form-data)
GET    /attachments/:id
DELETE /attachments/:id
GET    /attachments/:id/download
```

---

## Audit Log
```
GET    /audit-logs
GET    /audit-logs/:id
GET    /audit-logs/by-entity/:entityType/:entityId
GET    /audit-logs/by-user/:userId
```

---

## Dashboard
```
GET    /dashboard
GET    /dashboard/stats
GET    /dashboard/charts
GET    /dashboard/recent-activities
```

---

## Common Query Parameters

### Pagination

All list endpoints support:

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | number | 1 | Page number |
| `limit` | number | 10 | Items per page (max 100) |
| `search` | string | - | Search term |
| `sortBy` | string | createdAt | Sort field |
| `sortOrder` | asc/desc | desc | Sort direction |

### Response Format

**Success (List):**
```json
{
  "data": [...],
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "totalPages": 10,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

**Success (Single):**
```json
{
  "id": "uuid",
  "field": "value",
  "createdAt": "2025-01-18T00:00:00Z",
  "updatedAt": "2025-01-18T00:00:00Z"
}
```

**Error:**
```json
{
  "statusCode": 400,
  "message": "Error description",
  "error": "Bad Request"
}
```

---

## HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 204 | No Content (deleted) |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (not logged in) |
| 403 | Forbidden (no permission) |
| 404 | Not Found |
| 409 | Conflict (duplicate) |
| 500 | Internal Server Error |

---

## Authentication Header

All protected endpoints require:

```
Authorization: Bearer {accessToken}
```

---

## Related Documentation

- [DATA-FLOW.md](../architecture/DATA-FLOW.md) - How requests flow
- [AI-MODULE-GUIDE.md](../guides/AI-MODULE-GUIDE.md) - Creating new endpoints
- [FILE-MAP.md](../codebase/FILE-MAP.md) - Find controller files

---

*Last Updated: 2025-01-18*
