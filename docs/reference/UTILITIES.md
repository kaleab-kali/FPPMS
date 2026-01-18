# Utilities Reference

> Reusable utility functions in PPMS - check here before creating new ones

---

## Backend Utilities

**Location:** `packages/api/src/common/utils/`

### pagination.util.ts

```typescript
import { paginate, calculateSkip, PaginationParams } from "#api/common/utils/pagination.util";

// Calculate skip for Prisma
const skip = calculateSkip(page, limit);
// Result: (page - 1) * limit

// Create paginated response
const [data, total] = await Promise.all([
  prisma.entity.findMany({ skip, take: limit }),
  prisma.entity.count(),
]);

return paginate(data, total, page, limit);
// Result: { data, meta: { total, page, limit, totalPages, hasNextPage, hasPreviousPage } }
```

**Functions:**
| Function | Parameters | Returns |
|----------|------------|---------|
| `paginate` | (data[], total, page, limit) | PaginatedResponse |
| `calculateSkip` | (page, limit) | number |

**Types:**
```typescript
interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
}

interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}
```

---

### date.util.ts

```typescript
import {
  formatDate,
  formatDateTime,
  parseDate,
  isDateInRange,
  addDays,
  addMonths,
  addYears,
  differenceInYears,
} from "#api/common/utils/date.util";

// Format date
formatDate(new Date()); // "2025-01-18"
formatDateTime(new Date()); // "2025-01-18 14:30:00"

// Parse date string
parseDate("2025-01-18"); // Date object

// Date range check
isDateInRange(date, startDate, endDate); // boolean

// Date arithmetic
addDays(date, 30);
addMonths(date, 6);
addYears(date, 1);

// Difference
differenceInYears(new Date(), birthDate); // age in years
```

---

### ethiopian-calendar.util.ts

```typescript
import {
  toEthiopian,
  toGregorian,
  formatEthiopianDate,
  getEthiopianYear,
  getEthiopianMonth,
} from "#api/common/utils/ethiopian-calendar.util";

// Convert Gregorian to Ethiopian
const ethDate = toEthiopian(2025, 1, 18);
// Result: { year: 2017, month: 5, day: 9 }

// Convert Ethiopian to Gregorian
const gregDate = toGregorian(2017, 5, 9);
// Result: { year: 2025, month: 1, day: 18 }

// Format Ethiopian date
formatEthiopianDate(new Date()); // "9/5/2017"

// Get current Ethiopian year
getEthiopianYear(); // 2017
```

---

### hash.util.ts

```typescript
import { hashPassword, comparePassword, generateSalt } from "#api/common/utils/hash.util";

// Hash password
const hashedPassword = await hashPassword("Police@2025");

// Compare password
const isValid = await comparePassword("Police@2025", hashedPassword);
// Result: true or false

// Generate salt
const salt = generateSalt();
```

---

### string.util.ts

```typescript
import {
  generateUUID,
  slugify,
  truncate,
  capitalize,
  padStart,
} from "#api/common/utils/string.util";

// Generate UUID
const id = generateUUID(); // "550e8400-e29b-41d4-a716-446655440000"

// Create slug
slugify("Hello World"); // "hello-world"

// Truncate string
truncate("Long text here", 10); // "Long te..."

// Capitalize
capitalize("hello"); // "Hello"

// Pad number
padStart(42, 4, "0"); // "0042"
```

---

### file.util.ts

```typescript
import {
  getFileExtension,
  getMimeType,
  isImageFile,
  generateFilename,
  sanitizeFilename,
  getFileSizeInMB,
} from "#api/common/utils/file.util";

// Get extension
getFileExtension("photo.jpg"); // ".jpg"

// Check if image
isImageFile("photo.jpg"); // true

// Generate unique filename
generateFilename("photo.jpg"); // "a1b2c3d4-photo.jpg"

// Sanitize filename
sanitizeFilename("my file (1).jpg"); // "my-file-1.jpg"

// Get file size in MB
getFileSizeInMB(buffer); // 2.5
```

---

### access-scope.util.ts

```typescript
import {
  hasAccessToCenter,
  hasAccessToDepartment,
  hasAccessToEmployee,
  getAccessibleCenterIds,
} from "#api/common/utils/access-scope.util";

// Check center access
hasAccessToCenter(user, centerId); // boolean

// Check department access
hasAccessToDepartment(user, departmentId); // boolean

// Check employee access
hasAccessToEmployee(user, employeeId); // boolean

// Get list of accessible center IDs
getAccessibleCenterIds(user); // string[] or null (null = all)
```

---

### hq.util.ts

```typescript
import { isHQUser, isHQCenter } from "#api/common/utils/hq.util";

// Check if user is HQ
isHQUser(user); // boolean

// Check if center is HQ
isHQCenter(center); // boolean
```

---

## Frontend Utilities

**Location:** `packages/web/src/lib/`

### api-client.ts

```typescript
import { api } from "#web/lib/api-client";

// GET request
const response = await api.get<Employee[]>("/employees");
const data = response.data;

// POST request
const response = await api.post<Employee>("/employees", createDto);

// PATCH request
const response = await api.patch<Employee>(`/employees/${id}`, updateDto);

// DELETE request
await api.delete(`/employees/${id}`);

// With query params
const response = await api.get("/employees", {
  params: { page: 1, limit: 10, search: "John" }
});
```

**Features:**
- Automatic Authorization header from localStorage
- 401 handling with token refresh
- Error transformation for toast messages

---

### utils.ts

```typescript
import { cn } from "#web/lib/utils";

// Merge class names conditionally
<div className={cn(
  "base-class",
  isActive && "active-class",
  variant === "primary" ? "primary" : "secondary"
)} />
```

---

### ethiopian-calendar.ts

```typescript
import {
  toEthiopian,
  toGregorian,
  formatEthiopianDate,
  getEthiopianMonthName,
  getEthiopianToday,
} from "#web/lib/ethiopian-calendar";

// Convert to Ethiopian
const ethDate = toEthiopian(new Date());
// Result: { year: 2017, month: 5, day: 9 }

// Format for display
formatEthiopianDate(new Date()); // "Tir 9, 2017"

// Get month name
getEthiopianMonthName(5); // "Tir"

// Get today in Ethiopian
getEthiopianToday(); // { year, month, day }
```

---

## Backend Common DTOs

**Location:** `packages/api/src/common/dto/`

### pagination-query.dto.ts

```typescript
import { PaginationQueryDto } from "#api/common/dto/pagination-query.dto";

// In controller
@Get()
findAll(@Query() query: PaginationQueryDto) {
  // query.page, query.limit, query.search
}
```

**Fields:**
| Field | Type | Default | Description |
|-------|------|---------|-------------|
| page | number | 1 | Page number |
| limit | number | 10 | Items per page |
| search | string | - | Search term |

### paginated-response.dto.ts

```typescript
import { PaginatedResponseDto } from "#api/common/dto/paginated-response.dto";

// For Swagger documentation
@ApiResponse({ type: PaginatedResponseDto<EntityDto> })
```

---

## Backend Decorators

**Location:** `packages/api/src/common/decorators/`

### @CurrentUser()

```typescript
import { CurrentUser } from "#api/common/decorators/current-user.decorator";

@Get("me")
getMe(@CurrentUser() user: User) {
  return user;
}
```

### @CurrentTenant()

```typescript
import { CurrentTenant } from "#api/common/decorators/current-tenant.decorator";

@Get()
findAll(@CurrentTenant() tenantId: string) {
  return this.service.findAll(tenantId);
}
```

### @Public()

```typescript
import { Public } from "#api/common/decorators/public.decorator";

@Public()
@Post("login")
login(@Body() dto: LoginDto) {
  // No auth required
}
```

### @Roles()

```typescript
import { Roles } from "#api/common/decorators/roles.decorator";

@Roles("IT_ADMIN", "HR_DIRECTOR")
@Delete(":id")
remove(@Param("id") id: string) {
  // Only IT_ADMIN or HR_DIRECTOR can access
}
```

### @Permissions()

```typescript
import { Permissions } from "#api/common/decorators/permissions.decorator";

@Permissions("employees:write")
@Post()
create(@Body() dto: CreateDto) {
  // Requires employees:write permission
}
```

---

## Backend Guards

**Location:** `packages/api/src/common/guards/`

| Guard | Purpose | Applied By |
|-------|---------|------------|
| JwtAuthGuard | JWT authentication | Global (except @Public) |
| RolesGuard | Role-based access | @Roles decorator |
| PermissionsGuard | Permission-based access | @Permissions decorator |
| TenantGuard | Tenant isolation | Global |

Guards are applied globally in `main.ts`. Use decorators to trigger specific guards.

---

## Backend Constants

**Location:** `packages/api/src/common/constants/`

### roles.constant.ts

```typescript
import {
  SYSTEM_ROLES,
  ROLE_LEVELS,
  ACCESS_SCOPES,
} from "#api/common/constants/roles.constant";

// System roles
SYSTEM_ROLES.IT_ADMIN;      // "IT_ADMIN"
SYSTEM_ROLES.HR_OFFICER;    // "HR_OFFICER"

// Role levels (for hierarchy)
ROLE_LEVELS.IT_ADMIN;       // 100
ROLE_LEVELS.HR_OFFICER;     // 70

// Access scopes
ACCESS_SCOPES.ALL_CENTERS;      // "ALL_CENTERS"
ACCESS_SCOPES.OWN_CENTER;       // "OWN_CENTER"
ACCESS_SCOPES.OWN_DEPARTMENT;   // "OWN_DEPARTMENT"
ACCESS_SCOPES.OWN_RECORDS;      // "OWN_RECORDS"
```

### permissions.constant.ts

```typescript
import { PERMISSIONS } from "#api/common/constants/permissions.constant";

// Permission patterns
PERMISSIONS.EMPLOYEES_READ;   // "employees:read"
PERMISSIONS.EMPLOYEES_WRITE;  // "employees:write"
```

### employee-types.constant.ts

```typescript
import {
  EMPLOYEE_TYPE_PREFIXES,
  EMPLOYEE_ID_PATTERN,
} from "#api/common/constants/employee-types.constant";

// ID prefixes
EMPLOYEE_TYPE_PREFIXES.MILITARY;   // "FPC"
EMPLOYEE_TYPE_PREFIXES.CIVILIAN;   // "FPCIV"
EMPLOYEE_TYPE_PREFIXES.TEMPORARY;  // "TMP"

// ID pattern regex
EMPLOYEE_ID_PATTERN; // /^(FPC|FPCIV|TMP)-\d{4}\/\d{2}$/
```

---

## Frontend Hooks

**Location:** `packages/web/src/hooks/`

### usePermissions

```typescript
import { usePermissions } from "#web/hooks/usePermissions";

const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions();

// Single permission
if (hasPermission("employees:write")) {
  // Can write employees
}

// Any of these permissions
if (hasAnyPermission(["employees:write", "employees:delete"])) {
  // Can write OR delete
}

// All of these permissions
if (hasAllPermissions(["employees:read", "employees:write"])) {
  // Can read AND write
}
```

### useInactivityLogout

```typescript
import { useInactivityLogout } from "#web/hooks/useInactivityLogout";

// In root component
const { showWarning, remainingSeconds, resetTimer } = useInactivityLogout({
  timeout: 15 * 60 * 1000, // 15 minutes
  warningTime: 60 * 1000,  // 1 minute warning
});
```

### useMobile

```typescript
import { useMobile } from "#web/hooks/use-mobile";

const isMobile = useMobile();

if (isMobile) {
  // Render mobile layout
}
```

---

## Don't Duplicate - Check First!

Before creating a new utility:

1. Check `packages/api/src/common/utils/` for backend utilities
2. Check `packages/web/src/lib/` for frontend utilities
3. Check if similar function exists in existing module's utils folder

If utility is module-specific, place it in:
- `packages/api/src/modules/{module}/utils/`
- `packages/web/src/features/{feature}/utils/`

---

## Related Documentation

- [FILE-MAP.md](../codebase/FILE-MAP.md) - Find utility files
- [AI-MODULE-GUIDE.md](../guides/AI-MODULE-GUIDE.md) - Using utilities in modules
- [COMPONENTS.md](./COMPONENTS.md) - UI components

---

*Last Updated: 2025-01-18*
