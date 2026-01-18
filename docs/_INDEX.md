# PPMS Documentation Index

> **Police Personnel Management System** - Complete Documentation Hub

## Quick Navigation

| I Need To... | Go To |
|--------------|-------|
| Understand the system architecture | [SYSTEM-OVERVIEW.md](./architecture/SYSTEM-OVERVIEW.md) |
| Find a specific file or module | [FILE-MAP.md](./codebase/FILE-MAP.md) |
| Understand how data flows | [DATA-FLOW.md](./architecture/DATA-FLOW.md) |
| See workflow state diagrams | [STATE-MACHINES.md](./architecture/STATE-MACHINES.md) |
| Create a new module (AI) | [AI-MODULE-GUIDE.md](./guides/AI-MODULE-GUIDE.md) |
| Follow feature creation steps (AI) | [AI-FEATURE-CHECKLIST.md](./guides/AI-FEATURE-CHECKLIST.md) |
| **Follow security best practices** | [SECURITY-GUIDE.md](./guides/SECURITY-GUIDE.md) |
| Set up development environment | [DEVELOPER-SETUP.md](./guides/DEVELOPER-SETUP.md) |
| Write/run tests | [TESTING-GUIDE.md](./guides/TESTING-GUIDE.md) |
| **Update documentation** | [DOCUMENTATION-MAINTENANCE.md](./guides/DOCUMENTATION-MAINTENANCE.md) |
| Understand business rules | [BUSINESS-RULES.md](./business/BUSINESS-RULES.md) |
| Look up API endpoints | [API-REFERENCE.md](./reference/API-REFERENCE.md) |
| Find reusable components | [COMPONENTS.md](./reference/COMPONENTS.md) |
| Find utility functions | [UTILITIES.md](./reference/UTILITIES.md) |
| Understand database models | [DATABASE-MODELS.md](./codebase/DATABASE-MODELS.md) |

---

## Project Overview

**PPMS** is a multi-tenant Police Personnel Management System built with:

| Layer | Technology |
|-------|------------|
| Backend | NestJS + Prisma + PostgreSQL |
| Frontend | React 18 + Vite + TanStack Query |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Language | TypeScript (strict mode) |
| Linting | Biome |

### Monorepo Structure

```
ppms/
├── packages/
│   ├── api/          # NestJS Backend (port 3000)
│   └── web/          # React Frontend (port 5173)
├── docs/             # This documentation
└── CLAUDE.md         # AI coding instructions
```

---

## Documentation Structure

```
docs/
├── _INDEX.md                    # YOU ARE HERE
│
├── architecture/                # System design
│   ├── SYSTEM-OVERVIEW.md       # Tech stack, high-level design
│   ├── DATA-FLOW.md             # Frontend -> API -> DB flow
│   └── STATE-MACHINES.md        # Workflow state diagrams
│
├── codebase/                    # Code organization
│   ├── FILE-MAP.md              # Quick file lookup
│   ├── BACKEND-MODULES.md       # All API modules
│   ├── FRONTEND-FEATURES.md     # All Web features
│   └── DATABASE-MODELS.md       # Prisma schema reference
│
├── guides/                      # How-to guides
│   ├── AI-MODULE-GUIDE.md       # FOR AI: Create modules
│   ├── AI-FEATURE-CHECKLIST.md  # FOR AI: Step-by-step
│   ├── SECURITY-GUIDE.md        # OWASP & API security (MUST READ)
│   ├── DOCUMENTATION-MAINTENANCE.md # Keep docs updated
│   ├── DEVELOPER-SETUP.md       # FOR HUMANS: Setup
│   └── TESTING-GUIDE.md         # Testing practices
│
├── business/                    # Domain knowledge
│   ├── PRD.md                   # Product requirements
│   ├── BUSINESS-RULES.md        # Domain rules
│   └── GLOSSARY.md              # Terms & definitions
│
├── reference/                   # Quick references
│   ├── API-REFERENCE.md         # All endpoints
│   ├── COMPONENTS.md            # UI components
│   └── UTILITIES.md             # Helper functions
│
└── old/                         # Legacy docs (for reference)
```

---

## Quick Stats

| Metric | Count |
|--------|-------|
| Backend Modules | 26 |
| Frontend Features | 19 |
| Database Models | 80 |
| Database Enums | 38 |
| API Endpoints | 40+ routes |
| UI Components | 30 (shadcn) |
| Common Components | 12 |

---

## Essential Commands

```bash
# Development
npm run dev          # Run both API and Web
npm run dev:api      # API only (port 3000)
npm run dev:web      # Web only (port 5173)

# Building
npm run build        # Build all packages

# Code Quality
npm run lint         # Check with Biome
npm run lint:fix     # Auto-fix issues

# Testing
npm run test         # Run API tests
npm run test:e2e     # Run E2E tests

# Database
npx prisma generate  # Generate Prisma client
npx prisma migrate dev  # Run migrations
npx prisma db seed   # Seed database
```

---

## For AI Assistants

When working on this codebase:

1. **ALWAYS** read [AI-MODULE-GUIDE.md](./guides/AI-MODULE-GUIDE.md) before creating modules
2. **ALWAYS** check [FILE-MAP.md](./codebase/FILE-MAP.md) to find existing code
3. **ALWAYS** follow patterns in [BACKEND-MODULES.md](./codebase/BACKEND-MODULES.md)
4. **ALWAYS** check [BUSINESS-RULES.md](./business/BUSINESS-RULES.md) for domain logic
5. **NEVER** duplicate utilities - check [UTILITIES.md](./reference/UTILITIES.md) first
6. **NEVER** create new components without checking [COMPONENTS.md](./reference/COMPONENTS.md)

---

## Important Files Outside docs/

| File | Purpose |
|------|---------|
| `/CLAUDE.md` | AI coding instructions (MUST READ) |
| `/packages/api/prisma/schema.prisma` | Database schema |
| `/packages/api/src/app.module.ts` | Backend module registration |
| `/packages/web/src/App.tsx` | Frontend route registration |
| `/biome.json` | Linting configuration |

---

## Legacy Documentation

Previous documentation is preserved in `docs/old/` for reference. Key files:
- `FEATURES-PART1.md` / `FEATURES-PART2.md` - Feature requirements (not all implemented)
- `IMPLEMENTATION-CHECKLIST.md` - Implementation progress tracking
- `DATABASE-ARCHITECTURE.md` - Detailed database design

---

*Last Updated: 2025-01-18*
