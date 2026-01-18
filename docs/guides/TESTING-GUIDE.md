# Testing Guide

> How to write and run tests in PPMS

---

## Test Commands

```bash
# Run all API tests
npm run test

# Run API tests in watch mode
npm run test:watch

# Run E2E tests
npm run test:e2e

# Run tests with coverage
npm run test:cov
```

---

## Backend Unit Tests

### Location

Test files are co-located with source files:
```
packages/api/src/modules/{module}/
├── {module}.service.ts
└── {module}.service.spec.ts    # Tests here
```

### Test Structure

```typescript
import { Test, TestingModule } from "@nestjs/testing";
import { EntityService } from "./entity.service";
import { PrismaService } from "#api/database/prisma.service";

describe("EntityService", () => {
  let service: EntityService;
  let prisma: PrismaService;

  const mockPrismaService = {
    entity: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EntityService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<EntityService>(EntityService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("findAll", () => {
    it("should return paginated entities", async () => {
      const tenantId = "tenant-1";
      const mockEntities = [{ id: "1", name: "Test" }];

      mockPrismaService.entity.findMany.mockResolvedValue(mockEntities);
      mockPrismaService.entity.count.mockResolvedValue(1);

      const result = await service.findAll(tenantId, { page: 1, limit: 10 });

      expect(result.data).toEqual(mockEntities);
      expect(result.meta.total).toBe(1);
      expect(prisma.entity.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { tenantId },
        })
      );
    });
  });

  describe("findOne", () => {
    it("should return entity when found", async () => {
      const mockEntity = { id: "1", name: "Test", tenantId: "tenant-1" };
      mockPrismaService.entity.findFirst.mockResolvedValue(mockEntity);

      const result = await service.findOne("tenant-1", "1");

      expect(result).toEqual(mockEntity);
    });

    it("should throw NotFoundException when not found", async () => {
      mockPrismaService.entity.findFirst.mockResolvedValue(null);

      await expect(service.findOne("tenant-1", "1")).rejects.toThrow(
        "Entity not found"
      );
    });
  });

  describe("create", () => {
    it("should create entity", async () => {
      const dto = { name: "New Entity" };
      const mockCreated = { id: "1", ...dto, tenantId: "tenant-1" };

      mockPrismaService.entity.create.mockResolvedValue(mockCreated);

      const result = await service.create("tenant-1", dto);

      expect(result).toEqual(mockCreated);
      expect(prisma.entity.create).toHaveBeenCalledWith({
        data: { ...dto, tenantId: "tenant-1" },
      });
    });
  });
});
```

---

## Backend E2E Tests

### Location

```
packages/api/test/
├── app.e2e-spec.ts
└── jest-e2e.json
```

### E2E Test Structure

```typescript
import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import * as request from "supertest";
import { AppModule } from "#api/app.module";

describe("EntityController (e2e)", () => {
  let app: INestApplication;
  let authToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Login to get token
    const loginResponse = await request(app.getHttpServer())
      .post("/auth/login")
      .send({ username: "test-user", password: "password" });

    authToken = loginResponse.body.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  describe("GET /entities", () => {
    it("should return paginated list", () => {
      return request(app.getHttpServer())
        .get("/entities")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty("data");
          expect(res.body).toHaveProperty("meta");
        });
    });

    it("should return 401 without auth", () => {
      return request(app.getHttpServer())
        .get("/entities")
        .expect(401);
    });
  });

  describe("POST /entities", () => {
    it("should create entity", () => {
      return request(app.getHttpServer())
        .post("/entities")
        .set("Authorization", `Bearer ${authToken}`)
        .send({ name: "Test Entity" })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty("id");
          expect(res.body.name).toBe("Test Entity");
        });
    });

    it("should return 400 for invalid data", () => {
      return request(app.getHttpServer())
        .post("/entities")
        .set("Authorization", `Bearer ${authToken}`)
        .send({}) // Missing required fields
        .expect(400);
    });
  });
});
```

---

## Test Mocking Patterns

### Mocking Prisma Service

```typescript
const mockPrismaService = {
  entity: {
    findMany: jest.fn(),
    findFirst: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  $transaction: jest.fn((callback) => callback(mockPrismaService)),
};
```

### Mocking External Services

```typescript
const mockExternalService = {
  doSomething: jest.fn().mockResolvedValue({ success: true }),
};

// In module setup
{
  provide: ExternalService,
  useValue: mockExternalService,
}
```

---

## Test Coverage

Run with coverage:

```bash
npm run test:cov
```

Coverage report location: `packages/api/coverage/`

### Minimum Coverage Targets

| Type | Target |
|------|--------|
| Statements | 70% |
| Branches | 60% |
| Functions | 70% |
| Lines | 70% |

---

## Testing Checklist

### For Each Service Method

- [ ] Test success case
- [ ] Test not found case (where applicable)
- [ ] Test validation errors
- [ ] Test tenant isolation
- [ ] Verify Prisma called with correct params

### For Each Controller Endpoint

- [ ] Test with valid auth
- [ ] Test without auth (expect 401)
- [ ] Test with wrong permissions (expect 403)
- [ ] Test with valid input
- [ ] Test with invalid input (expect 400)
- [ ] Test not found scenarios (expect 404)

---

## Manual Testing

### Using Swagger

1. Start API: `npm run dev:api`
2. Open: http://localhost:3000/api
3. Authenticate: Use "Authorize" button with JWT
4. Test endpoints directly

### Testing Checklist

For each new feature:

- [ ] Test all CRUD operations in Swagger
- [ ] Test pagination (page, limit)
- [ ] Test search functionality
- [ ] Test error responses
- [ ] Test UI functionality in browser
- [ ] Test responsive design

---

## Related Documentation

- [AI-MODULE-GUIDE.md](./AI-MODULE-GUIDE.md) - Creating modules
- [API-REFERENCE.md](../reference/API-REFERENCE.md) - API endpoints
- [DEVELOPER-SETUP.md](./DEVELOPER-SETUP.md) - Environment setup

---

*Last Updated: 2025-01-18*
