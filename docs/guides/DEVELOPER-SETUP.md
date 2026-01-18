# Developer Setup Guide

> Getting started with PPMS development

---

## Prerequisites

| Software | Version | Purpose |
|----------|---------|---------|
| Node.js | 18+ | JavaScript runtime |
| npm | 9+ | Package manager |
| PostgreSQL | 15+ | Database |
| Git | 2.x | Version control |

---

## Quick Start

### 1. Clone Repository

```bash
git clone <repository-url>
cd ppms
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Database

**Create PostgreSQL database:**
```sql
CREATE DATABASE ppms;
```

**Configure environment:**

Create `packages/api/.env`:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/ppms"
JWT_SECRET="your-secret-key-minimum-32-characters"
JWT_EXPIRATION="15m"
JWT_REFRESH_EXPIRATION="7d"
PORT=3000
```

Create `packages/web/.env`:
```env
VITE_API_URL=http://localhost:3000
```

### 4. Initialize Database

```bash
# Generate Prisma client
cd packages/api
npx prisma generate

# Run migrations
npx prisma migrate dev

# Seed database
npx prisma db seed
```

### 5. Start Development

```bash
# From root directory
npm run dev

# Or start separately
npm run dev:api    # Backend on http://localhost:3000
npm run dev:web    # Frontend on http://localhost:5173
```

### 6. Access Application

- **Frontend:** http://localhost:5173
- **API:** http://localhost:3000
- **Swagger:** http://localhost:3000/api

### 7. Login Credentials

After seeding, check console for the IT Admin username:
- **Username:** `FPCIV-XXXX-XX` (shown in seed output)
- **Password:** `Police@2025`

---

## Project Structure

```
ppms/
├── packages/
│   ├── api/                 # NestJS Backend
│   │   ├── prisma/          # Database schema & migrations
│   │   └── src/
│   │       ├── common/      # Shared utilities
│   │       ├── config/      # Configuration
│   │       ├── database/    # Prisma service
│   │       └── modules/     # Feature modules
│   │
│   └── web/                 # React Frontend
│       └── src/
│           ├── api/         # API calls & hooks
│           ├── components/  # UI components
│           ├── features/    # Feature modules
│           ├── hooks/       # Shared hooks
│           ├── lib/         # Utilities
│           └── types/       # TypeScript types
│
├── docs/                    # Documentation
├── biome.json               # Linting config
├── tsconfig.json            # TypeScript config
└── CLAUDE.md                # AI instructions
```

---

## Common Commands

### Development

```bash
npm run dev          # Run both API and Web
npm run dev:api      # Run API only
npm run dev:web      # Run Web only
```

### Building

```bash
npm run build        # Build all packages
npm run build:api    # Build API only
npm run build:web    # Build Web only
```

### Code Quality

```bash
npm run lint         # Check linting
npm run lint:fix     # Fix lint issues
npm run format       # Format code
```

### Testing

```bash
npm run test         # Run API tests
npm run test:e2e     # Run E2E tests
```

### Database

```bash
cd packages/api

# Generate Prisma client after schema changes
npx prisma generate

# Create and apply migration
npx prisma migrate dev --name migration_name

# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Open Prisma Studio (database GUI)
npx prisma studio

# Seed database
npx prisma db seed
```

---

## IDE Setup

### VS Code Extensions

Recommended extensions:
- Biome (formatter/linter)
- Prisma (schema highlighting)
- ES7+ React/Redux/React-Native snippets
- Tailwind CSS IntelliSense

### VS Code Settings

```json
{
  "editor.defaultFormatter": "biomejs.biome",
  "editor.formatOnSave": true,
  "[typescript]": {
    "editor.defaultFormatter": "biomejs.biome"
  },
  "[typescriptreact]": {
    "editor.defaultFormatter": "biomejs.biome"
  }
}
```

---

## Troubleshooting

### Database Connection Error

```
Error: P1001: Can't reach database server
```

**Solution:**
1. Ensure PostgreSQL is running
2. Check DATABASE_URL in `.env`
3. Verify database exists

### Prisma Client Not Found

```
Error: @prisma/client did not initialize yet
```

**Solution:**
```bash
cd packages/api
npx prisma generate
```

### Port Already in Use

```
Error: EADDRINUSE: address already in use :::3000
```

**Solution:**
```bash
# Find and kill process
npx kill-port 3000
```

### Module Not Found

```
Error: Cannot find module '#api/...'
```

**Solution:**
1. Ensure you're using correct import paths
2. Check tsconfig.json paths configuration
3. Restart TypeScript server in IDE

---

## Development Workflow

### Creating a New Feature

1. **Read documentation:**
   - [AI-MODULE-GUIDE.md](./AI-MODULE-GUIDE.md) for patterns
   - [FILE-MAP.md](../codebase/FILE-MAP.md) for file locations

2. **Backend first:**
   - Add Prisma model if needed
   - Create module folder structure
   - Implement service and controller
   - Add Swagger documentation

3. **Frontend second:**
   - Create types matching DTOs
   - Create API layer (api, queries, mutations)
   - Create feature components and pages
   - Add routes and navigation

4. **Test:**
   - Test API endpoints in Swagger
   - Test UI functionality

5. **Commit:**
   - Follow conventional commits
   - Keep commits focused

### Code Review Checklist

- [ ] Types match backend DTOs exactly
- [ ] Swagger documentation complete
- [ ] TenantId included in all queries
- [ ] React.memo on all components
- [ ] displayName on all components
- [ ] useCallback for event handlers
- [ ] Translations added (en + am)
- [ ] No console.log statements
- [ ] No relative imports across directories

---

## Related Documentation

- [AI-MODULE-GUIDE.md](./AI-MODULE-GUIDE.md) - Creating modules
- [TESTING-GUIDE.md](./TESTING-GUIDE.md) - Testing practices
- [FILE-MAP.md](../codebase/FILE-MAP.md) - File locations
- [SYSTEM-OVERVIEW.md](../architecture/SYSTEM-OVERVIEW.md) - Architecture

---

*Last Updated: 2025-01-18*
