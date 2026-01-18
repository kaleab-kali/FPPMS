# System Overview

> High-level architecture and technology stack for PPMS

## Technology Stack

### Backend (packages/api)

| Component | Technology | Version | Purpose |
|-----------|------------|---------|---------|
| Framework | NestJS | 10.x | REST API framework |
| ORM | Prisma | 5.x | Database access |
| Database | PostgreSQL | 15+ | Data persistence |
| Auth | JWT + Passport | - | Authentication |
| Validation | class-validator | - | DTO validation |
| Docs | Swagger/OpenAPI | - | API documentation |
| File Upload | Multer | - | File handling |

### Frontend (packages/web)

| Component | Technology | Version | Purpose |
|-----------|------------|---------|---------|
| Framework | React | 18.x | UI library |
| Build Tool | Vite | 5.x | Development/bundling |
| Routing | React Router | 6.x | Client-side routing |
| State | TanStack Query | 5.x | Server state management |
| Forms | React Hook Form | - | Form handling |
| Validation | Zod | - | Schema validation |
| Styling | Tailwind CSS | 4.x | Utility-first CSS |
| Components | shadcn/ui | - | UI component library |
| i18n | i18next | - | Internationalization |

### Development Tools

| Tool | Purpose |
|------|---------|
| Biome | Linting + formatting |
| TypeScript | Type safety |
| Jest | Testing |
| Prisma Studio | Database GUI |

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              FRONTEND                                    │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                    React + Vite (port 5173)                       │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐   │  │
│  │  │   Pages     │  │  Components │  │    State Management     │   │  │
│  │  │  /features  │  │  /components│  │  TanStack Query + Zustand│  │  │
│  │  └─────────────┘  └─────────────┘  └─────────────────────────┘   │  │
│  │                           │                                       │  │
│  │  ┌────────────────────────▼──────────────────────────────────┐   │  │
│  │  │              API Client (axios) /lib/api-client.ts         │   │  │
│  │  └────────────────────────┬──────────────────────────────────┘   │  │
│  └───────────────────────────┼───────────────────────────────────────┘  │
└──────────────────────────────┼──────────────────────────────────────────┘
                               │ HTTP/REST
                               ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                              BACKEND                                     │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                    NestJS (port 3000)                             │  │
│  │                                                                   │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐   │  │
│  │  │   Guards    │  │ Interceptors│  │    Middleware           │   │  │
│  │  │  JWT/RBAC   │  │  Transform  │  │  Tenant Resolution      │   │  │
│  │  └──────┬──────┘  └──────┬──────┘  └───────────┬─────────────┘   │  │
│  │         │                │                      │                 │  │
│  │         ▼                ▼                      ▼                 │  │
│  │  ┌───────────────────────────────────────────────────────────┐   │  │
│  │  │                    Controllers                             │   │  │
│  │  │          /modules/{module}/{module}.controller.ts          │   │  │
│  │  └────────────────────────┬──────────────────────────────────┘   │  │
│  │                           │                                       │  │
│  │  ┌────────────────────────▼──────────────────────────────────┐   │  │
│  │  │                    Services                                │   │  │
│  │  │           /modules/{module}/{module}.service.ts            │   │  │
│  │  └────────────────────────┬──────────────────────────────────┘   │  │
│  │                           │                                       │  │
│  │  ┌────────────────────────▼──────────────────────────────────┐   │  │
│  │  │              Prisma Service /database/prisma.service.ts    │   │  │
│  │  └────────────────────────┬──────────────────────────────────┘   │  │
│  └───────────────────────────┼───────────────────────────────────────┘  │
└──────────────────────────────┼──────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                            DATABASE                                      │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                    PostgreSQL                                     │  │
│  │                                                                   │  │
│  │   80 Models  │  38 Enums  │  Multi-tenant (tenantId FK)          │  │
│  │                                                                   │  │
│  └───────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Multi-Tenant Architecture

PPMS uses a **shared database, shared schema** multi-tenancy model:

```
┌──────────────────────────────────────────────────────────────┐
│                    Single PostgreSQL Database                 │
│                                                              │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ Tenant Table                                            │ │
│  │  id: "tenant-1" | name: "Federal Police"               │ │
│  │  id: "tenant-2" | name: "Regional Police"              │ │
│  └─────────────────────────────────────────────────────────┘ │
│                           │                                  │
│                           ▼                                  │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ All Other Tables (Employees, Centers, etc.)             │ │
│  │  tenantId: "tenant-1" | data for Federal Police         │ │
│  │  tenantId: "tenant-2" | data for Regional Police        │ │
│  └─────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

### Tenant Isolation Rules

1. **Every query** must include `tenantId` filter
2. **TenantGuard** enforces tenant context on all requests
3. **@CurrentTenant()** decorator extracts tenant from JWT
4. **Foreign key relations** validated within same tenant

---

## Authentication Flow

```
┌─────────┐     1. Login (username/password)     ┌─────────┐
│ Browser │ ──────────────────────────────────▶  │   API   │
└─────────┘                                      └────┬────┘
     │                                                │
     │                                    2. Validate credentials
     │                                    3. Generate JWT tokens
     │                                                │
     │      4. Return { accessToken, refreshToken }   │
     │  ◀──────────────────────────────────────────── │
     │                                                │
     │  5. Store tokens in localStorage               │
     │                                                │
     │  6. API requests with Authorization header     │
     │ ──────────────────────────────────────────────▶│
     │     Authorization: Bearer {accessToken}        │
     │                                                │
     │                                    7. JwtAuthGuard validates
     │                                    8. Extract user + tenant
     │                                    9. Process request
     │                                                │
     │      10. Return response                       │
     │  ◀──────────────────────────────────────────── │
└─────────────────────────────────────────────────────────────┘
```

### JWT Payload Structure

```typescript
{
  sub: string;        // User ID
  username: string;   // Employee ID (e.g., "FPC-0001-25")
  tenantId: string;   // Tenant UUID
  roles: string[];    // ["IT_ADMIN", "HR_OFFICER"]
  permissions: string[]; // ["employees:read", "employees:write"]
  iat: number;        // Issued at
  exp: number;        // Expiration
}
```

---

## Role-Based Access Control (RBAC)

### Role Hierarchy

```
Level 100: IT_ADMIN          (Full system access)
Level 95:  HQ_ADMIN          (HQ operations)
Level 90:  HR_DIRECTOR       (HR management)
Level 85:  CENTER_ADMIN      (Center management)
Level 80:  CENTER_COMMANDER  (Center operations)
Level 70:  HR_OFFICER        (HR operations)
Level 60:  DEPARTMENT_HEAD   (Department management)
Level 50:  SUPERVISOR        (Team supervision)
Level 40:  FINANCE_OFFICER   (Finance operations)
Level 30:  RECORDS_OFFICER   (Records management)
Level 20:  EMPLOYEE          (Own records only)
Level 10:  VIEWER            (Read-only access)
```

### Access Scopes

| Scope | Description |
|-------|-------------|
| ALL_CENTERS | Access data from all centers |
| OWN_CENTER | Access data from assigned center only |
| OWN_DEPARTMENT | Access data from assigned department only |
| OWN_RECORDS | Access only own employee records |

### Permission Pattern

```
{module}:{action}

Examples:
- employees:read
- employees:write
- employees:delete
- transfers:approve
```

---

## Module Organization

### Backend Module Pattern

```
packages/api/src/modules/{module}/
├── {module}.module.ts        # NestJS module definition
├── {module}.controller.ts    # HTTP endpoints
├── {module}.service.ts       # Business logic
├── {module}.service.spec.ts  # Unit tests
├── dto/
│   ├── create-{entity}.dto.ts
│   ├── update-{entity}.dto.ts
│   └── {entity}-response.dto.ts
├── controllers/              # Sub-controllers (optional)
│   └── {sub-entity}.controller.ts
└── services/                 # Sub-services (optional)
    └── {sub-entity}.service.ts
```

### Frontend Feature Pattern

```
packages/web/src/features/{feature}/
├── pages/
│   ├── {Feature}ListPage.tsx
│   ├── {Feature}DetailPage.tsx
│   └── {Feature}FormPage.tsx
├── components/
│   ├── {Feature}Table.tsx
│   ├── {Feature}Form.tsx
│   └── {Feature}Dialog.tsx
├── hooks/                    # Feature-specific hooks
├── schemas/                  # Zod validation schemas
├── types/                    # Feature-specific types
├── utils/                    # Feature-specific utilities
└── constants/                # Feature-specific constants
```

### API Layer Pattern

```
packages/web/src/api/{module}/
├── {module}.api.ts           # API functions (axios calls)
├── {module}.queries.ts       # TanStack useQuery hooks
└── {module}.mutations.ts     # TanStack useMutation hooks
```

---

## Key Design Decisions

### 1. Prisma over TypeORM
- Better TypeScript integration
- Auto-generated types from schema
- Cleaner query API
- Declarative migrations

### 2. TanStack Query over Redux
- Built for server state
- Automatic caching
- Background refetching
- Optimistic updates

### 3. Zod over Yup
- Better TypeScript inference
- Smaller bundle size
- Consistent with backend validation

### 4. Biome over ESLint + Prettier
- Single tool for lint + format
- Faster execution
- Simpler configuration

### 5. Feature-based structure over type-based
- Related code stays together
- Easier to understand module boundaries
- Simpler to add/remove features

---

## Environment Variables

### Backend (.env)

```bash
DATABASE_URL=postgresql://user:pass@localhost:5432/ppms
JWT_SECRET=your-secret-key
JWT_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d
PORT=3000
```

### Frontend (.env)

```bash
VITE_API_URL=http://localhost:3000
```

---

## Related Documentation

- [DATA-FLOW.md](./DATA-FLOW.md) - Detailed data flow diagrams
- [STATE-MACHINES.md](./STATE-MACHINES.md) - Workflow state diagrams
- [FILE-MAP.md](../codebase/FILE-MAP.md) - File location reference
- [AI-MODULE-GUIDE.md](../guides/AI-MODULE-GUIDE.md) - Module creation guide

---

*Last Updated: 2025-01-18*
