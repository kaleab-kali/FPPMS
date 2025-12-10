# DATABASE SETUP GUIDE

This guide provides step-by-step instructions for setting up the PPMS database from scratch.

## Prerequisites

1. **PostgreSQL** installed and running (version 14+)
2. **Node.js** installed (version 18+)
3. **npm** installed
4. Project dependencies installed (`npm install` at root)

## Step 1: Create PostgreSQL Database

```bash
# Connect to PostgreSQL as superuser
psql -U postgres

# Create database
CREATE DATABASE ppms_db;

# Create user (optional, if not using postgres user)
CREATE USER ppms_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE ppms_db TO ppms_user;

# Exit psql
\q
```

## Step 2: Configure Environment Variables

Create or update the `.env` file in `packages/api/`:

```bash
cd packages/api
cp .env.example .env
```

Edit `.env` and set the DATABASE_URL:

```env
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/ppms_db"
JWT_SECRET="your-secure-jwt-secret-key-here"
JWT_EXPIRATION="8h"
```

## Step 3: Run Database Migrations

This creates all tables based on the Prisma schema:

```bash
cd packages/api
npx prisma migrate dev
```

Expected output:
```
Applying migration `20251210080942_init`
Database synchronized successfully
```

## Step 4: Seed the Database

This populates the database with initial data:

```bash
cd packages/api
npm run db:seed
```

Expected output:
```
=== Seeding Tenants ===
Created tenant: Federal Police Commission (FPC)

=== Seeding Roles ===
Created role: IT Administrator (IT_ADMIN)
Created role: HQ Administrator (HQ_ADMIN)
... (11 roles total)

=== Seeding Permissions ===
Seeded 50 permissions
Assigned 50 permissions to IT_ADMIN role

=== Seeding Military Ranks ===
Created rank: Constable (CONST) with 9 salary steps
... (16 ranks total)

=== Seeding Regions ===
Created region: Addis Ababa (AA)
... (14 regions total)

=== Seeding IT Admin User ===
Created IT Admin user: admin
Default password: Admin@123
NOTE: User must change password on first login

Database seed completed successfully!
```

## Step 5: Verify Setup

Start the API server:

```bash
npm run dev:api
```

Test login with default admin credentials:

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "Admin@123"}'
```

You should receive a JWT token in the response.

## Default Admin Credentials

| Field | Value |
|-------|-------|
| Username | `admin` |
| Password | `Admin@123` |
| Role | IT_ADMIN (full system access) |

**IMPORTANT:** Change the admin password immediately after first login.

## Seed Data Summary

### Tenant
- Federal Police Commission (FPC) - Primary tenant

### System Roles (11 roles)

| Code | Name | Level | Access Scope |
|------|------|-------|--------------|
| IT_ADMIN | IT Administrator | 100 | ALL_CENTERS |
| HQ_ADMIN | HQ Administrator | 95 | ALL_CENTERS |
| CENTER_ADMIN | Center Administrator | 85 | OWN_CENTER |
| HR_DIRECTOR | HR Director | 90 | ALL_CENTERS |
| HR_OFFICER | HR Officer | 70 | OWN_CENTER |
| CENTER_COMMANDER | Center Commander | 80 | OWN_CENTER |
| DEPARTMENT_HEAD | Department Head | 60 | OWN_DEPARTMENT |
| SUPERVISOR | Supervisor | 50 | OWN_DEPARTMENT |
| FINANCE_OFFICER | Finance Officer | 40 | OWN_CENTER |
| RECORDS_OFFICER | Records Officer | 30 | OWN_CENTER |
| VIEWER | Viewer | 10 | OWN_RECORDS |

### Permissions (50 permissions)
All CRUD permissions for system modules assigned to IT_ADMIN role.

### Military Ranks (16 ranks)
Ethiopian Federal Police rank structure from Constable to Lieutenant General, each with 9 salary steps.

### Regions (14 Ethiopian regions)
Addis Ababa, Afar, Amhara, Benishangul-Gumuz, Dire Dawa, Gambela, Harari, Oromia, Sidama, Somali, South West Ethiopia, Southern Nations, Tigray, Central Ethiopia.

## Common Commands

### Reset Database (Development Only)

**WARNING:** This deletes ALL data!

```bash
cd packages/api
npx prisma migrate reset --force
```

### Re-run Seeds Only

```bash
cd packages/api
npm run db:seed
```

### View Database with Prisma Studio

```bash
cd packages/api
npx prisma studio
```

Opens a web UI at http://localhost:5555

### Generate Prisma Client

After schema changes:

```bash
cd packages/api
npx prisma generate
```

## Troubleshooting

### Error: Database connection failed

1. Verify PostgreSQL is running:
   ```bash
   pg_isready -h localhost -p 5432
   ```

2. Check DATABASE_URL in `.env` file

3. Verify database exists:
   ```bash
   psql -U postgres -c "\l" | grep ppms_db
   ```

### Error: Migration failed

1. Check for pending migrations:
   ```bash
   npx prisma migrate status
   ```

2. Reset and re-migrate (development only):
   ```bash
   npx prisma migrate reset --force
   ```

### Error: Seed failed

1. Check if data already exists (seeds are idempotent)
2. Check database connection
3. Review error message for specific field issues

### Reset Admin Password

If you need to reset the admin password, create a script:

```typescript
// reset-admin-password.ts
import "dotenv/config";
import * as bcrypt from "bcrypt";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL as string });
const prisma = new PrismaClient({ adapter });

const SALT_ROUNDS = 10;
const NEW_PASSWORD = "Admin@123";

const resetPassword = async (): Promise<void> => {
    const hash = await bcrypt.hash(NEW_PASSWORD, SALT_ROUNDS);
    const result = await prisma.user.updateMany({
        where: { username: "admin" },
        data: { passwordHash: hash },
    });
    console.log(`Updated ${result.count} admin user(s)`);
    await prisma.$disconnect();
};

resetPassword();
```

Run with:
```bash
npx tsx reset-admin-password.ts
```

## Seed Files Structure

```
packages/api/prisma/seeds/
  seed.ts              # Main seed runner
  tenants.seed.ts      # FPC tenant
  roles.seed.ts        # 11 system roles
  permissions.seed.ts  # 50 permissions + role assignments
  military-ranks.seed.ts # 16 ranks with salary steps
  regions.seed.ts      # 14 Ethiopian regions
  users.seed.ts        # IT admin user
```

## Adding Custom Seeds

1. Create a new seed file: `prisma/seeds/your-data.seed.ts`

2. Export an async function:
   ```typescript
   import { PrismaClient } from "@prisma/client";

   export const seedYourData = async (prisma: PrismaClient, tenantId: string): Promise<void> => {
       // Your seeding logic
   };
   ```

3. Import and call in `seed.ts`:
   ```typescript
   import { seedYourData } from "./your-data.seed.js";

   // In main function:
   await seedYourData(prisma, tenantId);
   ```
