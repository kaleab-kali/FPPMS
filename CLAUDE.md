# CLAUDE.md

This file provides guidance to Claude Code when working with this codebase.

## Project Overview

PPMS is a TypeScript monorepo with:
- **API**: NestJS backend at `packages/api`
- **Web**: React + Vite frontend at `packages/web`

## Tech Stack

| Layer | Technology |
|-------|------------|
| Language | TypeScript 5.x (strict mode) |
| Backend | NestJS, Node.js |
| Frontend | React 18+, Vite |
| Styling | Tailwind CSS v4 |
| UI Components | shadcn/ui |
| Linting/Formatting | Biome |
| Testing | Jest, React Testing Library |

## Commands

```bash
# Development
npm run dev          # Run both API and Web
npm run dev:api      # Run API only (port 3000)
npm run dev:web      # Run Web only (port 5173)

# Building
npm run build        # Build all packages
npm run build:api    # Build API only
npm run build:web    # Build Web only

# Testing
npm run test         # Run API unit tests
npm run test:e2e     # Run API E2E tests

# Code Quality
npm run lint         # Check linting (Biome)
npm run lint:fix     # Auto-fix lint issues
npm run format       # Format code
```

## Import Aliases

Always use `#` prefix for internal imports:

```typescript
// API package
import { AppService } from "#api/app.service";

// Web package
import { Button } from "#web/components/ui/button";
import { cn } from "#web/lib/utils";
```

**Never use relative imports like `../` or `./` for cross-directory imports.**

## GENERAL CODE RULES

- NEVER insert emoji into any file. Use unicode codepoints instead.
- ONLY use valid, working unicode codepoints that render correctly. Test that unicode characters are valid before using them.
- For i18n/translation files: ALWAYS write the actual language characters directly (e.g., Amharic, Arabic, Chinese). NEVER use unicode escape sequences like \u1230 in JSON translation files - write the actual characters instead.
- ALWAYS respect the ignored file patterns in the `.gitignore` file.
- NEVER allow a git branch or Github pull request to contain more than 40 changed files.  If it does, do not do any work, and instruct the developer to split the changes into smaller branches.
- ALWAYS check the latest official documentation for any library/framework (NestJS, Prisma, React, etc.) BEFORE writing integration code.
- ALWAYS verify the current version of installed packages.
- NEVER assume API patterns from older versions - always confirm with latest docs.
- ALWAYS test each small implementation step before moving to the next one.

## GIT COMMIT RULES

- ALWAYS use single-line commit messages only.
- NEVER include multi-line commit messages with body text.
- NEVER include "Co-Authored-By" or "Generated with Claude Code" in commit messages.
- ALWAYS use conventional commit format: type(scope): description
- Example: feat(auth): add login endpoint
- ALWAYS test and commit when changes exceed 8 new files created OR 10 files edited.
- NEVER let a single commit grow too large - keep PRs clean and reviewable.

## Code Style

### General TypeScript

- **Formatter**: Biome (tabs, 120 line width, double quotes)
- **No ESLint/Prettier**: Use Biome only
- Prefer `interface` over `type` for object definitions
- Always annotate return types for functions
- Avoid `any` type - use `unknown` with type guards
- Use `undefined` instead of `null` for optional values
- Group imports logically (external, internal, types)

### File Naming Conventions

| Package | Convention | Example |
|---------|------------|---------|
| API | kebab-case | `user-service.ts`, `auth.controller.ts` |
| Web Components | PascalCase | `UserCard.tsx`, `AuthForm.tsx` |
| Web Hooks | camelCase with `use` prefix | `useAuth.ts`, `useUser.ts` |
| Web Utils/Lib | kebab-case | `utils.ts`, `api-client.ts` |

### API (NestJS)

- Use decorators for controllers, services, modules
- **Important**: Use `import` not `import type` for injectable services (NestJS DI requirement)
- Place tests alongside source files (`*.spec.ts`)
- Use DTOs for request/response validation
- Follow single responsibility principle per service



## TYPESCRIPT AND JAVASCRIPT RULES

- ALWAYS use `const` for variables.
- NEVER use `let` or `var`.
- ALWAYS respect the biomejs linter ignore rules in the code files.
- ALWAYS respect the biomejs config in the `biome.jsonc` file.
- ALWAYS Respect the typescript configs in the `tsconfig.json` files.
- ALWAYS specify exact package versions in `package.json`.
- NEVER add unnecessary `console.log()` statements.
- NEVER use relative paths for imports.
- ALWAYS use the file extension for import paths.
- NEVER add an explicit type to a variable if it can be inferred.
- ALWAYS add `{} as const` to object literals, when it is helpful.
- NEVER add return type annotations to functions, unless they are type stubs.
- NEVER use try/catch.
- ALWAYS prefer a functional style of code.
- ALWAYS avoid using mutable variables.
- NEVER insert emoji into code.  Use unicode codepoints instead.
- NEVER add code comments, unless specifically requested.
- ALWAYS provide a type argument to `document.querySelector()` and `document.querySelectorAll()`.
- NEVER allow a Typescript file to be larger than 600 lines of code.
- NEVER allow a Typescript function to be larger than 100 lines of code, unless it is a React component or hook.
- NEVER reassign `globalThis`.
- NEVER use `window`.  Use `globalThis` instead.
- NEVER use `forEach()` for arrays.  Use `for...of` instead.
- ALWAYS use arrow functions. Never use function declarations unless function overloads are needed.
- ALWAYS use function overloading when it could be helpful.
- NEVER use the old `then()` promises syntax.
- ALWAYS use the `async`/`await` syntax for promises.
- NEVER reassign `globalThis`.
- NEVER use `window`.  Use `globalThis` instead.
- NEVER use `forEach()` for arrays.  Use `for...of` instead.
- ALWAYS specify JSDOC type syntax for `.js` files.
- ALWAYS use inline `@type {...}` annotations for JSDOC variable declarations in `.js` files.
- NEVER use the `@type {Object} a; @property {...} b;` syntax for JSDOC variable declarations in `.js` files.
- ALWAYS use arrow functions. Never use function declarations unless function overloads are needed.
- ALWAYS use function overloading when it could be helpful.
- NEVER use magic numbers or magic strings directly in code. Always use named constants.
- ALWAYS define configuration values in a constant object with `as const` at the top of the file or in a dedicated constants file.

## REACT RULES

- ALWAYS respect the biomejs linter ignores in the code files.
- ALWAYS respect the biomejs config in the `./biome.jsonc` file.
- ALWAYS use `React.useCallback()` for functions which are inside components.
- ALWAYS use `React.useMemo()` for values which are inside components.
- ALWAYS use `React.memo()` for all components.
- ALWAYS provide a `displayName` property to all components.
- ALWAYS provide a comparison function to `React.memo()`.
- NEVER set a React state from within the following handlers: `scroll`, `resize`, `keyDown`, `keyPress`.
- NEVER allow a React component to be larger than 300 lines of code.
- NEVER allow a non React component function to be larger than 100 lines of code.
- NEVER render a React component as a function call. It should only be rendered as a JSX element.
- NEVER add SSR checks such as `if (typeof window !== 'undefined')` to React components.  These should be handled manually by a developer.
- NEVER create `index.ts` barrel files in the frontend package except in rare essential cases. Import directly from the source file instead.
- ALWAYS make frontend code responsive. All components must work on mobile, tablet, and desktop screens.
- ALWAYS use TanStack Table for data tables with proper styling and responsive design.
- ALWAYS use the `EmployeeSearch` component (`#web/components/common/EmployeeSearch.tsx`) for employee selection in forms. NEVER use dropdown/select for employee selection.
- NEVER load all employees into a dropdown. Use the EmployeeSearch component which searches by Employee ID.

## MEMORY LEAK PREVENTION (React)

- ALWAYS cleanup subscriptions, timers, and event listeners in useEffect cleanup functions.
- NEVER create subscriptions or timers without corresponding cleanup.
- ALWAYS use AbortController for fetch requests that may be cancelled.
- NEVER store component references in module-level variables.
- ALWAYS check if component is still mounted before updating state in async callbacks.
- NEVER create closures that capture large objects unnecessarily.
- ALWAYS use weak references (WeakMap, WeakSet) when caching component instances.
- NEVER add event listeners to window/document without cleanup.
- ALWAYS cleanup TanStack Query subscriptions by using proper query invalidation.
- NEVER create new object/array references in render without useMemo.
- ALWAYS use stable callback references with useCallback for event handlers passed to children.
- NEVER store DOM references without cleanup.

### Memory Leak Checklist for Every Component

1. **useEffect cleanup**: Every useEffect with subscriptions/timers MUST return cleanup function
2. **Event listeners**: addEventListener MUST have corresponding removeEventListener in cleanup
3. **Timers**: setTimeout/setInterval MUST be cleared with clearTimeout/clearInterval
4. **Async operations**: Use AbortController or mounted flag to prevent state updates after unmount
5. **Refs**: Clear refs to DOM elements in cleanup if storing externally
6. **Subscriptions**: Unsubscribe from all observables/event emitters in cleanup

### Example Pattern for Async Operations

```typescript
useEffect(() => {
  const abortController = new AbortController();

  const fetchData = async () => {
    const response = await fetch(url, { signal: abortController.signal });
    if (!abortController.signal.aborted) {
      setData(await response.json());
    }
  };

  fetchData();

  return () => {
    abortController.abort();
  };
}, [url]);
```

## FRONTEND-BACKEND INTEGRATION RULES

- ALWAYS check backend DTOs before creating frontend types.
- ALWAYS match frontend request/response types exactly with backend DTOs.
- NEVER send fields that don't exist in backend DTOs.
- ALWAYS use undefined (not empty string) for optional fields not provided.
- ALWAYS filter out immutable fields (like `code`) when updating entities.
- ALWAYS check backend controller endpoints for correct HTTP methods and paths.

## CRUD FEATURE COMPLETION RULES

- NEVER move to the next feature/module until the current one is fully tested and confirmed working.
- ALWAYS ask the user to confirm that all CRUD operations (Create, Read, Update, Delete) work before proceeding.
- ALWAYS test each CRUD operation in the following order:
  1. List/Read - verify data displays correctly
  2. Create - verify new records can be created
  3. Update - verify existing records can be edited
  4. Delete - verify records can be deleted
- NEVER assume a feature works without user confirmation.
- ALWAYS wait for explicit user approval before moving to the next module.
- When fixing multiple modules, complete ONE module fully before starting the next.
- If the user reports an issue, FIX IT before moving on - do not skip to another module.

## DATABASE AND SQL RULES

- ALWAYS use the name `id` for primary keys.
- ALWAYS use a `UUID` for primary keys.
- NEVER use an integer for primary keys.
- NEVER specify schema names in SQL statements (Example: `public`).


### Component Structure Pattern

```
packages/web/src/
├── components/
│   ├── ui/                    # shadcn/ui components
│   │   └── button.tsx
│   ├── common/                # Shared components
│   │   ├── ComingSoonPage.tsx
│   │   └── LoadingSpinner.tsx
│   └── layout/                # Layout components
│       ├── AppLayout.tsx
│       ├── AppSidebar.tsx
│       └── NavUser.tsx
└── features/                  # Feature-specific modules
    └── {feature-name}/
        ├── pages/             # Page components
        ├── components/        # Feature-specific components
        ├── hooks/             # Feature-specific hooks
        ├── schemas/           # Zod schemas
        ├── types/             # Feature-specific types
        ├── utils/             # Feature-specific utils
        └── constants/         # Feature-specific constants
```

## Project Structure

```
ppms/
├── packages/
│   ├── api/
│   │   └── src/
│   │       ├── modules/       # Feature modules
│   │       ├── common/        # Shared utilities
│   │       ├── config/        # Configuration
│   │       ├── database/      # Prisma service
│   │       ├── app.module.ts
│   │       └── main.ts
│   └── web/
│       └── src/
│           ├── api/           # API calls (queries, mutations)
│           ├── components/    # Shared components (ui, common, layout)
│           ├── config/        # App configuration
│           ├── context/       # React contexts
│           ├── features/      # Feature modules with pages
│           ├── hooks/         # Shared hooks
│           ├── i18n/          # Translations (en, am)
│           ├── lib/           # Utilities (api-client, utils)
│           ├── routes/        # Route definitions
│           ├── types/         # Shared TypeScript types
│           ├── App.tsx
│           └── main.tsx
├── docs/                      # Documentation
├── biome.json                 # Linter config
├── tsconfig.json              # TS project refs
└── CLAUDE.md                  # This file
```

## Adding Dependencies

```bash
# Root level (dev tools)
npm install -D <package>

# API package
npm install <package> --workspace=packages/api

# Web package
npm install <package> --workspace=packages/web
```

## Adding shadcn/ui Components

```bash
cd packages/web
npx shadcn@latest add button
npx shadcn@latest add card
```

## Do Not

- Do not use `any` type 
- Do not use relative imports (`../`) for cross-directory imports
- Do not use `import type` for NestJS injectable services
- Do not commit directly to `main` branch
- Do not skip running `npm run lint` before commits
- Do not create CSS modules - use Tailwind utilities
- Do not use class components - functional only

## Testing Guidelines

### API Tests
```typescript
// app.controller.spec.ts
describe("AppController", () => {
  let controller: AppController;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    controller = module.get<AppController>(AppController);
  });

  it("should return hello", () => {
    expect(controller.getHello()).toBe("Hello World!");
  });
});
```

### Web Tests
```typescript
// UserCard.test.tsx
import { render, screen } from "@testing-library/react";
import { UserCard } from "./UserCard";

describe("UserCard", () => {
  it("renders user name", () => {
    render(<UserCard user={{ id: "1", name: "John" }} />);
    expect(screen.getByText("John")).toBeInTheDocument();
  });
});
```



## Accessibility Requirements

- All interactive elements must have proper ARIA labels
- Support keyboard navigation
- Ensure color contrast meets WCAG 2.1 AA standards
- Use semantic HTML elements

## Security Considerations

- Validate all server-side inputs
- Use parameterized queries for database operations
- Implement proper CORS configuration
- Never expose sensitive data in client-side code
- Use environment variables for secrets

---

# CODEBASE SCANNING GUIDE

This section provides step-by-step instructions for scanning and understanding the codebase before implementing new features.

## PRE-IMPLEMENTATION CHECKLIST

Before starting ANY new module or feature:

### Step 1: Check Implementation Status
```
Read: docs/IMPLEMENTATION-CHECKLIST.md
```
- Review what's already implemented
- Check the progress percentage for each phase
- Identify dependencies on other modules

### Step 2: Scan Core Configuration Files

**API Configuration:**
```
packages/api/src/config/app.config.ts      # App settings
packages/api/src/config/database.config.ts # DB connection
packages/api/src/config/auth.config.ts     # JWT/auth settings
packages/api/src/config/file-storage.config.ts # File upload config
```

**Web Configuration:**
```
packages/web/src/config/constants.ts       # App constants, API URL, storage keys
```

### Step 3: Understand Common Utilities

**API Common Utilities (packages/api/src/common/):**

| File | Purpose | When to Use |
|------|---------|-------------|
| `utils/pagination.util.ts` | `paginate()`, `calculateSkip()` | Any paginated list endpoint |
| `utils/date.util.ts` | Date formatting, calculations | Date operations |
| `utils/hash.util.ts` | Password hashing | Authentication |
| `utils/string.util.ts` | String manipulation | ID generation, formatting |
| `utils/file.util.ts` | File operations | File uploads |
| `utils/ethiopian-calendar.util.ts` | Ethiopian calendar conversion | Date display |
| `dto/pagination-query.dto.ts` | Base pagination DTO | Extend for list endpoints |
| `dto/paginated-response.dto.ts` | Standard paginated response | List responses |
| `dto/api-response.dto.ts` | Standard API response wrapper | All responses |

**API Decorators:**

| Decorator | File | Usage |
|-----------|------|-------|
| `@CurrentUser()` | `decorators/current-user.decorator.ts` | Get authenticated user |
| `@CurrentTenant()` | `decorators/current-tenant.decorator.ts` | Get tenant ID |
| `@Public()` | `decorators/public.decorator.ts` | Mark route as public |
| `@Roles()` | `decorators/roles.decorator.ts` | Require specific roles |
| `@Permissions()` | `decorators/permissions.decorator.ts` | Require permissions |

**API Guards:**

| Guard | File | Purpose |
|-------|------|---------|
| `JwtAuthGuard` | `guards/jwt-auth.guard.ts` | JWT authentication |
| `RolesGuard` | `guards/roles.guard.ts` | Role-based access |
| `PermissionsGuard` | `guards/permissions.guard.ts` | Permission-based access |
| `TenantGuard` | `guards/tenant.guard.ts` | Tenant isolation |

**Web Common Utilities (packages/web/src/lib/):**

| File | Purpose |
|------|---------|
| `api-client.ts` | Axios instance with auth interceptors, `api.get/post/patch/delete` |
| `utils.ts` | `cn()` for classnames |

### Step 4: Review Constants and Enums

**API Constants:**
```
packages/api/src/common/constants/roles.constant.ts       # SYSTEM_ROLES, ROLE_LEVELS, ACCESS_SCOPES
packages/api/src/common/constants/permissions.constant.ts # Permission patterns
packages/api/src/common/constants/employee-types.constant.ts # Employee type prefixes
```

**Prisma Enums (check schema.prisma):**
```
packages/api/prisma/schema.prisma  # All database enums
```

### Step 5: Check Existing Module Patterns

**API Module Structure Pattern:**
```
packages/api/src/modules/{module-name}/
  ├── {module-name}.module.ts     # NestJS module
  ├── {module-name}.controller.ts # HTTP endpoints
  ├── {module-name}.service.ts    # Business logic
  ├── {module-name}.service.spec.ts # Tests
  └── dto/
      ├── create-{entity}.dto.ts   # Create DTO
      ├── update-{entity}.dto.ts   # Update DTO
      └── {entity}-response.dto.ts # Response DTO
```

**Web Module Structure Pattern:**
```
packages/web/src/
  ├── api/{module-name}/
  │   ├── {module-name}.api.ts       # API functions
  │   ├── {module-name}.queries.ts   # TanStack Query hooks
  │   └── {module-name}.mutations.ts # TanStack Mutation hooks
  ├── types/{module-name}.ts         # Shared TypeScript interfaces
  └── features/{feature-name}/
      ├── pages/
      │   ├── {Module}ListPage.tsx   # List view
      │   └── {Module}DetailPage.tsx # Detail view (if needed)
      ├── components/
      │   ├── {Module}FormDialog.tsx # Create/Edit dialog
      │   └── {Module}Table.tsx      # Table component
      ├── hooks/                     # Feature-specific hooks
      ├── schemas/                   # Zod validation schemas
      ├── types/                     # Feature-specific types
      ├── utils/                     # Feature-specific utils
      └── constants/                 # Feature-specific constants
```

## MODULE IMPLEMENTATION WORKFLOW

### For New Backend Module:

1. **Check Prisma Schema:**
   ```
   packages/api/prisma/schema.prisma
   ```
   - Verify model exists or create it
   - Run `npx prisma generate` after changes

2. **Create Module Structure:**
   - Copy pattern from existing module (e.g., `departments`)
   - Create DTOs matching Prisma model
   - Implement service with CRUD operations
   - Create controller with standard endpoints

3. **Register Module:**
   ```
   packages/api/src/app.module.ts
   ```

4. **Add Permissions (if needed):**
   ```
   packages/api/prisma/seeds/permissions.seed.ts
   ```

### For New Frontend Module:

1. **Check Backend DTOs First:**
   ```
   packages/api/src/modules/{module}/dto/
   ```
   - Match frontend types EXACTLY to backend DTOs

2. **Create Shared Types:**
   ```
   packages/web/src/types/{module}.ts
   ```

3. **Create API Layer:**
   ```
   packages/web/src/api/{module}/
   ├── {module}.api.ts       # API calls using api client
   ├── {module}.queries.ts   # useQuery hooks
   └── {module}.mutations.ts # useMutation hooks
   ```

4. **Create Feature Module:**
   ```
   packages/web/src/features/{feature}/
   ├── pages/               # Page components
   ├── components/          # Feature-specific components
   ├── hooks/               # Feature-specific hooks (optional)
   ├── schemas/             # Zod schemas (optional)
   └── constants/           # Constants (optional)
   ```

5. **Add Routes:**
   ```
   packages/web/src/routes/  # Route definitions
   packages/web/src/App.tsx  # Main router
   ```

6. **Add Navigation:**
   ```
   packages/web/src/components/layout/AppSidebar.tsx
   ```

## CRITICAL FILES TO CHECK BEFORE ANY WORK

### Before Creating New Features:

| Check | Why |
|-------|-----|
| `docs/IMPLEMENTATION-CHECKLIST.md` | See if feature exists |
| `packages/api/prisma/schema.prisma` | Check data model |
| `packages/api/src/modules/` | Check existing backend modules |
| `packages/web/src/features/` | Check existing frontend features |
| `packages/web/src/types/` | Check existing shared types |
| `packages/web/src/api/` | Check existing API calls |

### Before Creating Utilities:

| Check | Why |
|-------|-----|
| `packages/api/src/common/utils/` | Avoid duplicating backend utils |
| `packages/web/src/lib/` | Check existing frontend helpers |
| `packages/web/src/features/{feature}/utils/` | Feature-specific utils |

### Before Creating Components:

| Check | Why |
|-------|-----|
| `packages/web/src/components/ui/` | shadcn components exist |
| `packages/web/src/components/common/` | Shared components |
| `packages/web/src/components/layout/` | Layout components |
| `packages/web/src/features/{feature}/components/` | Feature-specific components |

## EXISTING MODULE REFERENCE

### Fully Implemented Modules (use as reference):

| Module | Backend Path | Frontend Feature | Good For |
|--------|--------------|------------------|----------|
| `employees` | `modules/employees/` | `features/employees/` | Complex module pattern |
| `departments` | `modules/departments/` | `features/organization/` | Parent-child relations |
| `tenants` | `modules/tenants/` | `features/organization/` | Simple CRUD pattern |
| `centers` | `modules/centers/` | `features/organization/` | Multi-tenant pattern |
| `lookups` | `modules/lookups/` | `features/lookups/` | Cascading dropdowns |
| `ranks` | `modules/ranks/` | `features/lookups/` | Reference data |
| `users` | `modules/users/` | `features/users/` | User management |
| `roles` | `modules/roles/` | `features/roles/` | RBAC pattern |
| `auth` | `modules/auth/` | `features/auth/` | Authentication |
| `dashboard` | N/A | `features/dashboard/` | Dashboard page |

### Employee Sub-modules Pattern:

**Backend Structure:**
```
packages/api/src/modules/employees/
  ├── employees.module.ts
  ├── employees.controller.ts
  ├── employees.service.ts
  ├── services/
  │   ├── employee-id-generator.service.ts
  │   ├── retirement-calculation.service.ts
  │   ├── employee-photo.service.ts
  │   ├── employee-family.service.ts
  │   ├── employee-medical.service.ts
  │   ├── employee-marital-status.service.ts
  │   └── employee-transfer.service.ts
  └── controllers/
      ├── employee-photo.controller.ts
      ├── employee-family.controller.ts
      ├── employee-medical.controller.ts
      ├── employee-marital-status.controller.ts
      └── employee-transfer.controller.ts
```

**Frontend Feature Structure:**
```
packages/web/src/features/employees/
  ├── pages/
  │   ├── EmployeesListPage.tsx
  │   ├── EmployeeDetailPage.tsx
  │   ├── EmployeeEditPage.tsx
  │   ├── EmployeeRegisterSelectPage.tsx
  │   ├── EmployeeRegisterFormPage.tsx
  │   ├── FormerEmployeesPage.tsx
  │   ├── EmployeePhotoPage.tsx
  │   ├── EmployeeFamilyPage.tsx
  │   ├── EmployeeMedicalPage.tsx
  │   ├── EmployeeMaritalStatusPage.tsx
  │   └── EmployeeTransferPage.tsx
  ├── components/
  │   ├── sections/               # Form sections
  │   │   ├── PersonalInfoSection.tsx
  │   │   ├── AddressSection.tsx
  │   │   └── ...
  │   ├── StatusChangeDialog.tsx
  │   └── ...
  ├── hooks/
  ├── schemas/                    # Zod validation schemas
  ├── types/
  ├── utils/
  └── constants/
```

## MULTI-TENANT ARCHITECTURE

All data is tenant-scoped. ALWAYS:

1. Use `@CurrentTenant()` decorator to get tenant ID
2. Include `tenantId` in all Prisma queries
3. Validate related entities belong to same tenant

Example:
```typescript
@Get()
async findAll(@CurrentTenant() tenantId: string) {
  return this.service.findAll(tenantId);
}
```

## API RESPONSE PATTERNS

### List Endpoint Response:
```typescript
{
  data: T[],
  meta: {
    total: number,
    page: number,
    limit: number,
    totalPages: number,
    hasNextPage: boolean,
    hasPreviousPage: boolean
  }
}
```

### Single Entity Response:
```typescript
{
  id: string,
  // ...entity fields
  createdAt: Date,
  updatedAt: Date
}
```

## ROLE-BASED ACCESS CONTROL

System roles (from `roles.constant.ts`):
- `IT_ADMIN` (level 100) - Full system access
- `HQ_ADMIN` (level 95) - HQ operations
- `HR_DIRECTOR` (level 90) - HR management
- `CENTER_ADMIN` (level 85) - Center management
- `CENTER_COMMANDER` (level 80) - Center operations
- `HR_OFFICER` (level 70) - HR operations
- `DEPARTMENT_HEAD` (level 60) - Department management
- `SUPERVISOR` (level 50) - Team supervision
- `FINANCE_OFFICER` (level 40) - Finance operations
- `RECORDS_OFFICER` (level 30) - Records management
- `EMPLOYEE` (level 20) - Own records only
- `VIEWER` (level 10) - Read-only access

Access scopes:
- `ALL_CENTERS` - Access all centers
- `OWN_CENTER` - Access own center only
- `OWN_DEPARTMENT` - Access own department only
- `OWN_RECORDS` - Access own records only

## QUICK SEARCH COMMANDS

```bash
# Find all controllers
grep -r "@Controller" packages/api/src/modules/

# Find all services
grep -r "@Injectable" packages/api/src/modules/

# Find API endpoints
grep -r "@Get\|@Post\|@Patch\|@Delete" packages/api/src/modules/

# Find React Query hooks
grep -r "useQuery\|useMutation" packages/web/src/api/

# Find page components
ls packages/web/src/pages/
```

## AVOIDING DUPLICATE CODE

Before implementing:

1. **Search for existing functionality:**
   - Use grep/search for key terms
   - Check common utils folders
   - Review similar modules

2. **Reuse existing patterns:**
   - Copy DTO patterns from similar modules
   - Use existing pagination utilities
   - Leverage existing decorators and guards

3. **Extend, don't recreate:**
   - Extend base DTOs when possible
   - Use composition over duplication

---

# BUSINESS RULES AND DOMAIN KNOWLEDGE

## Employee ID Format

| Type | Prefix | Example |
|------|--------|---------|
| Military | FPC | FPC-0001/25 |
| Civilian | FPCIV | FPCIV-0001/25 |
| Temporary | TMP | TMP-0001/25 |

Format: `{PREFIX}-{PADDED_NUMBER}/{YEAR}`
- Counter stored in `Tenant.settings` JSON field
- Use `EmployeeIdGeneratorService` to generate

## User Credentials

- Username: Employee ID with `/` replaced by `-` (e.g., `FPC-0001-25`)
- Default password: `Police@{currentYear}` (e.g., `Police@2025`)
- New users must change password on first login (`mustChangePassword: true`)

## Military Employee Rules

1. **Marriage Restriction**: Military employees CANNOT be MARRIED at registration UNLESS they are transfers (`isTransfer: true`)
2. **Transfer Fields Required for Transfers**:
   - `sourceOrganization` - Original organization name
   - `originalEmploymentDate` - Original employment date
3. **Retirement Age by Rank Category**:
   - Enlisted (Constable to Sergeant): 50 years
   - NCO (Staff Sergeant to Chief Warrant Officer): 52 years
   - Officer (2nd Lieutenant to General): 55 years

## Transfer Workflow (Two-Step)

1. **Source Center** creates transfer request (status: PENDING)
2. **Target Center** accepts or rejects
3. On acceptance:
   - Employee moves to target center
   - Departure record created at source
   - Employee record updated with new center

**Roles with transfer permissions**: IT_ADMIN, HQ_ADMIN, HR_DIRECTOR, CENTER_ADMIN

## Photo Management

- Max file size: 10MB
- Supported formats: JPEG, PNG, WebP
- Storage: Tenant-scoped directory (`uploads/{tenantId}/photos/`)
- SHA-256 hash for deduplication
- Soft delete with audit trail

## Leave Types

Standard leave types (10):
1. Annual Leave
2. Sick Leave
3. Maternity Leave
4. Paternity Leave
5. Bereavement Leave
6. Marriage Leave
7. Study Leave
8. Unpaid Leave
9. Special Leave
10. Training Leave

## Ethiopian Calendar

Use `ethiopian-calendar.util.ts` for:
- Date conversions (Gregorian to Ethiopian)
- Ethiopian holiday calculations
- Display formatting

## Prisma JSON Fields

When working with JSON fields (like `Tenant.settings`):
```typescript
import { Prisma } from "@prisma/client";

const settings = (tenant.settings as Prisma.JsonObject) ?? {};
const updated: Prisma.JsonObject = { ...settings, newField: value };
```

---

# SEED DATA REFERENCE

## Seed Files Location
```
packages/api/prisma/seeds/
```

## Seed Execution Order
```typescript
// seed.ts orchestrates in this order:
1. seedPermissions()       // Create permissions first
2. seedRoles()             // Create roles
3. assignPermissionsToRoles() // Link permissions to roles
4. seedTenants()           // Create tenant
5. seedMilitaryRanks()     // Create ranks with salary steps
6. seedRegions()           // Create regions
7. seedCenters()           // Create centers (needs regions)
8. seedDepartments()       // Create departments (needs centers)
9. seedPositions()         // Create positions
10. seedLeaveTypes()       // Create leave types
11. seedHolidays()         // Create holidays
12. seedEmployees()        // Create employees (needs all above)
13. seedUsers()            // Create users (needs employees)
```

## Default Admin Credentials
After seeding:
- Username: Check console output for IT Admin employee ID (format: `FPCIV-XXXX-XX`)
- Password: `Police@{year}` (e.g., `Police@2025`)
