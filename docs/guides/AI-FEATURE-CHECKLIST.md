# AI Feature Creation Checklist

> Step-by-step checklist for AI to follow when creating new features

---

## Pre-Implementation

### 1. Understand Requirements

- [ ] Read user request completely
- [ ] Identify what entity/module is being created
- [ ] List all CRUD operations needed
- [ ] Identify any special business rules

### 2. Check Existing Code

- [ ] Search for similar modules in `packages/api/src/modules/`
- [ ] Search for similar features in `packages/web/src/features/`
- [ ] Check if types exist in `packages/web/src/types/`
- [ ] Check if API layer exists in `packages/web/src/api/`
- [ ] Review related utilities in common folders

### 3. Check Prisma Schema

- [ ] Verify model exists in `schema.prisma`
- [ ] If not, plan model structure
- [ ] Identify required relations (tenant, center, department, etc.)
- [ ] Identify enums needed

---

## Backend Implementation

### 4. Create/Update Prisma Model

- [ ] Add model to `packages/api/prisma/schema.prisma`
- [ ] Include `id`, `tenantId`, `createdAt`, `updatedAt`
- [ ] Add appropriate indexes
- [ ] Run `npx prisma generate`

### 5. Create DTOs

Location: `packages/api/src/modules/{module}/dto/`

- [ ] Create `create-{entity}.dto.ts`
  - [ ] Add validation decorators
  - [ ] Add Swagger `@ApiProperty` decorators
  - [ ] Add examples in Swagger decorators

- [ ] Create `update-{entity}.dto.ts`
  - [ ] Extend from CreateDto with PartialType

- [ ] Create `{entity}-response.dto.ts`
  - [ ] Add Swagger decorators for response fields

### 6. Create Service

Location: `packages/api/src/modules/{module}/{module}.service.ts`

- [ ] Inject PrismaService
- [ ] Implement `create(tenantId, dto)`
- [ ] Implement `findAll(tenantId, params)` with pagination
- [ ] Implement `findOne(tenantId, id)`
- [ ] Implement `update(tenantId, id, dto)`
- [ ] Implement `remove(tenantId, id)`
- [ ] ALWAYS include tenantId in queries
- [ ] Add appropriate error handling (NotFoundException, ConflictException)

### 7. Create Controller

Location: `packages/api/src/modules/{module}/{module}.controller.ts`

- [ ] Add `@ApiTags` decorator
- [ ] Add `@Controller` with route path
- [ ] Create endpoint for each CRUD operation
- [ ] Add `@ApiOperation` to each endpoint
- [ ] Add `@ApiResponse` decorators (200, 201, 400, 401, 403, 404)
- [ ] Use `@CurrentTenant()` in all methods
- [ ] Use appropriate HTTP decorators (@Get, @Post, @Patch, @Delete)

### 8. Create Module

Location: `packages/api/src/modules/{module}/{module}.module.ts`

- [ ] Import Controller and Service
- [ ] Export Service if needed by other modules

### 9. Register Module

- [ ] Add module import to `packages/api/src/app.module.ts`

### 10. Test Backend

- [ ] Start API: `npm run dev:api`
- [ ] Open Swagger: http://localhost:3000/api
- [ ] Test all endpoints manually
- [ ] Verify responses match DTOs

---

## Frontend Implementation

### 11. Create Shared Types

Location: `packages/web/src/types/{entity}.ts`

- [ ] Create interface matching response DTO
- [ ] Create CreateDto interface matching backend
- [ ] Create UpdateDto interface matching backend
- [ ] Create Filters interface for list queries

### 12. Create API Layer

Location: `packages/web/src/api/{module}/`

- [ ] Create `{module}.api.ts`
  - [ ] Import api client from `#web/lib/api-client`
  - [ ] Create functions for each endpoint
  - [ ] Use correct HTTP methods

- [ ] Create `{module}.queries.ts`
  - [ ] Create query keys
  - [ ] Create useQuery hooks for GET operations

- [ ] Create `{module}.mutations.ts`
  - [ ] Create useMutation hooks for POST/PATCH/DELETE
  - [ ] Invalidate queries on success

### 13. Create Feature Structure

Location: `packages/web/src/features/{feature}/`

- [ ] Create folder structure:
  ```
  {feature}/
  ├── pages/
  ├── components/
  └── schemas/
  ```

### 14. Create Zod Schema

Location: `packages/web/src/features/{feature}/schemas/`

- [ ] Create validation schema matching DTO
- [ ] Export type from schema

### 15. Create List Page

Location: `packages/web/src/features/{feature}/pages/{Entity}ListPage.tsx`

- [ ] Use React.memo
- [ ] Add displayName
- [ ] Implement search/filter
- [ ] Implement pagination
- [ ] Add create button
- [ ] Add edit/delete actions
- [ ] Use DataTable component
- [ ] Handle loading states
- [ ] Handle empty states

### 16. Create Form Dialog

Location: `packages/web/src/features/{feature}/components/{Entity}FormDialog.tsx`

- [ ] Use React.memo with comparison function
- [ ] Add displayName
- [ ] Use React Hook Form with Zod resolver
- [ ] Handle create and edit modes
- [ ] Reset form when dialog opens
- [ ] Show success toast on save
- [ ] Close dialog after successful save
- [ ] Use useCallback for handlers

### 17. Add Routes

- [ ] Add route in `packages/web/src/App.tsx`
- [ ] Use lazy loading if appropriate

### 18. Add Navigation

- [ ] Add menu item in `packages/web/src/components/layout/AppSidebar.tsx`
- [ ] Choose appropriate icon
- [ ] Use translation key for title

### 19. Add Translations

- [ ] Add English translations in `packages/web/src/i18n/locales/en.json`
- [ ] Add Amharic translations in `packages/web/src/i18n/locales/am.json`
- [ ] Include: title, add, edit, delete, field labels, messages

---

## Post-Implementation

### 20. Test Frontend

- [ ] Test list page loads
- [ ] Test search/filter works
- [ ] Test pagination works
- [ ] Test create new entity
- [ ] Test edit existing entity
- [ ] Test delete entity
- [ ] Test error handling
- [ ] Test responsive design (mobile, tablet, desktop)

### 21. Code Quality

- [ ] Run `npm run lint`
- [ ] Fix any lint errors
- [ ] Check for console.log statements (remove them)
- [ ] Check for hardcoded strings (use translations)
- [ ] Verify no relative imports across directories

### 22. Final Verification

- [ ] All CRUD operations work
- [ ] Swagger documentation complete
- [ ] Types match backend exactly
- [ ] Translations complete
- [ ] No lint errors
- [ ] Responsive design works

---

## Quick Reference: Essential Patterns

### Backend Service Method

```typescript
async findAll(tenantId: string, params: PaginationParams) {
  const { page = 1, limit = 10, search } = params;

  const where = {
    tenantId,  // ALWAYS include
    ...(search && {
      name: { contains: search, mode: "insensitive" as const },
    }),
  };

  const [data, total] = await Promise.all([
    this.prisma.entity.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    this.prisma.entity.count({ where }),
  ]);

  return paginate(data, total, page, limit);
}
```

### Frontend Query Hook

```typescript
export const useEntities = (filters?: Filters) =>
  useQuery({
    queryKey: ["entities", "list", filters],
    queryFn: () => entityApi.getAll(filters),
  });
```

### Frontend Mutation Hook

```typescript
export const useCreateEntity = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: entityApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["entities"] });
    },
  });
};
```

### React Component Pattern

```typescript
const MyComponent = React.memo(({ prop }: Props) => {
  const handleClick = React.useCallback(() => {
    // handler logic
  }, []);

  return <div onClick={handleClick}>{prop}</div>;
}, (prev, next) => prev.prop === next.prop);

MyComponent.displayName = "MyComponent";

export { MyComponent };
```

---

## Related Documentation

- [AI-MODULE-GUIDE.md](./AI-MODULE-GUIDE.md) - Detailed patterns
- [FILE-MAP.md](../codebase/FILE-MAP.md) - File locations
- [COMPONENTS.md](../reference/COMPONENTS.md) - Available components
- [UTILITIES.md](../reference/UTILITIES.md) - Available utilities

---

*Last Updated: 2025-01-18*
