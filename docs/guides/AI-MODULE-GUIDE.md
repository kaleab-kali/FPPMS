# AI Module Creation Guide

> Step-by-step guide for AI assistants to create consistent modules in PPMS

## Pre-Creation Checklist

Before creating ANY new module, ALWAYS:

- [ ] Check if similar module exists in `packages/api/src/modules/`
- [ ] Check if similar feature exists in `packages/web/src/features/`
- [ ] Check existing types in `packages/web/src/types/`
- [ ] Check existing API layer in `packages/web/src/api/`
- [ ] Review Prisma schema for existing models
- [ ] Check CLAUDE.md for coding rules

---

## Backend Module Creation

### Step 1: Check/Create Prisma Model

**File:** `packages/api/prisma/schema.prisma`

```prisma
model NewEntity {
  id        String   @id @default(uuid())
  tenantId  String
  tenant    Tenant   @relation(fields: [tenantId], references: [id])

  // Entity fields
  name      String
  code      String
  isActive  Boolean  @default(true)

  // Timestamps
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Indexes
  @@unique([tenantId, code])
  @@index([tenantId])
}
```

**After adding model:**
```bash
npx prisma generate
```

### Step 2: Create Module Folder Structure

```
packages/api/src/modules/{module-name}/
├── {module-name}.module.ts
├── {module-name}.controller.ts
├── {module-name}.service.ts
├── {module-name}.service.spec.ts
└── dto/
    ├── create-{entity}.dto.ts
    ├── update-{entity}.dto.ts
    └── {entity}-response.dto.ts
```

### Step 3: Create DTOs

**Create DTO:** `dto/create-{entity}.dto.ts`

```typescript
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsString, IsOptional, IsBoolean, MaxLength } from "class-validator";

export class CreateEntityDto {
	@ApiProperty({
		description: "Name of the entity",
		example: "Sample Entity",
		maxLength: 100,
	})
	@IsString()
	@MaxLength(100)
	name: string;

	@ApiPropertyOptional({
		description: "Optional description",
		example: "This is a description",
	})
	@IsString()
	@IsOptional()
	description?: string;

	@ApiPropertyOptional({
		description: "Whether the entity is active",
		example: true,
		default: true,
	})
	@IsBoolean()
	@IsOptional()
	isActive?: boolean;
}
```

**Update DTO:** `dto/update-{entity}.dto.ts`

```typescript
import { PartialType } from "@nestjs/swagger";
import { CreateEntityDto } from "./create-entity.dto";

export class UpdateEntityDto extends PartialType(CreateEntityDto) {}
```

**Response DTO:** `dto/{entity}-response.dto.ts`

```typescript
import { ApiProperty } from "@nestjs/swagger";

export class EntityResponseDto {
	@ApiProperty({ description: "Unique identifier" })
	id: string;

	@ApiProperty({ description: "Name of the entity" })
	name: string;

	@ApiProperty({ description: "Whether active", example: true })
	isActive: boolean;

	@ApiProperty({ description: "Creation timestamp" })
	createdAt: Date;

	@ApiProperty({ description: "Last update timestamp" })
	updatedAt: Date;
}
```

### Step 4: Create Service

**File:** `{module-name}.service.ts`

```typescript
import { Injectable, NotFoundException, ConflictException } from "@nestjs/common";
import { PrismaService } from "#api/database/prisma.service";
import { paginate, PaginationParams } from "#api/common/utils/pagination.util";
import { CreateEntityDto } from "./dto/create-entity.dto";
import { UpdateEntityDto } from "./dto/update-entity.dto";

@Injectable()
export class EntityService {
	constructor(private readonly prisma: PrismaService) {}

	async create(tenantId: string, dto: CreateEntityDto) {
		// Check for duplicates if needed
		const existing = await this.prisma.entity.findFirst({
			where: { tenantId, name: dto.name },
		});

		if (existing) {
			throw new ConflictException("Entity with this name already exists");
		}

		return this.prisma.entity.create({
			data: {
				...dto,
				tenantId,
			},
		});
	}

	async findAll(tenantId: string, params: PaginationParams) {
		const { page, limit, search } = params;

		const where = {
			tenantId,
			...(search && {
				OR: [
					{ name: { contains: search, mode: "insensitive" as const } },
					{ code: { contains: search, mode: "insensitive" as const } },
				],
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

	async findOne(tenantId: string, id: string) {
		const entity = await this.prisma.entity.findFirst({
			where: { id, tenantId },
		});

		if (!entity) {
			throw new NotFoundException("Entity not found");
		}

		return entity;
	}

	async update(tenantId: string, id: string, dto: UpdateEntityDto) {
		await this.findOne(tenantId, id); // Verify exists

		return this.prisma.entity.update({
			where: { id },
			data: dto,
		});
	}

	async remove(tenantId: string, id: string) {
		await this.findOne(tenantId, id); // Verify exists

		return this.prisma.entity.delete({
			where: { id },
		});
	}
}
```

### Step 5: Create Controller

**File:** `{module-name}.controller.ts`

```typescript
import { Controller, Get, Post, Patch, Delete, Body, Param, Query } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { CurrentTenant } from "#api/common/decorators/current-tenant.decorator";
import { PaginationQueryDto } from "#api/common/dto/pagination-query.dto";
import { EntityService } from "./entity.service";
import { CreateEntityDto } from "./dto/create-entity.dto";
import { UpdateEntityDto } from "./dto/update-entity.dto";
import { EntityResponseDto } from "./dto/entity-response.dto";

@ApiTags("entities")
@Controller("entities")
export class EntityController {
	constructor(private readonly entityService: EntityService) {}

	@Post()
	@ApiOperation({ summary: "Create a new entity" })
	@ApiResponse({ status: 201, description: "Entity created successfully", type: EntityResponseDto })
	@ApiResponse({ status: 400, description: "Invalid input data" })
	@ApiResponse({ status: 409, description: "Entity already exists" })
	create(@CurrentTenant() tenantId: string, @Body() dto: CreateEntityDto) {
		return this.entityService.create(tenantId, dto);
	}

	@Get()
	@ApiOperation({ summary: "Get all entities with pagination" })
	@ApiResponse({ status: 200, description: "List of entities" })
	findAll(@CurrentTenant() tenantId: string, @Query() query: PaginationQueryDto) {
		return this.entityService.findAll(tenantId, query);
	}

	@Get(":id")
	@ApiOperation({ summary: "Get entity by ID" })
	@ApiResponse({ status: 200, description: "Entity found", type: EntityResponseDto })
	@ApiResponse({ status: 404, description: "Entity not found" })
	findOne(@CurrentTenant() tenantId: string, @Param("id") id: string) {
		return this.entityService.findOne(tenantId, id);
	}

	@Patch(":id")
	@ApiOperation({ summary: "Update entity" })
	@ApiResponse({ status: 200, description: "Entity updated", type: EntityResponseDto })
	@ApiResponse({ status: 404, description: "Entity not found" })
	update(@CurrentTenant() tenantId: string, @Param("id") id: string, @Body() dto: UpdateEntityDto) {
		return this.entityService.update(tenantId, id, dto);
	}

	@Delete(":id")
	@ApiOperation({ summary: "Delete entity" })
	@ApiResponse({ status: 200, description: "Entity deleted" })
	@ApiResponse({ status: 404, description: "Entity not found" })
	remove(@CurrentTenant() tenantId: string, @Param("id") id: string) {
		return this.entityService.remove(tenantId, id);
	}
}
```

### Step 6: Create Module

**File:** `{module-name}.module.ts`

```typescript
import { Module } from "@nestjs/common";
import { EntityController } from "./entity.controller";
import { EntityService } from "./entity.service";

@Module({
	controllers: [EntityController],
	providers: [EntityService],
	exports: [EntityService],
})
export class EntityModule {}
```

### Step 7: Register Module

**File:** `packages/api/src/app.module.ts`

```typescript
import { EntityModule } from "#api/modules/entity/entity.module";

@Module({
	imports: [
		// ... existing modules
		EntityModule, // Add here
	],
})
export class AppModule {}
```

---

## Frontend Feature Creation

### Step 1: Create Shared Types

**File:** `packages/web/src/types/{entity}.ts`

```typescript
// Match these EXACTLY to backend DTOs

export interface Entity {
	id: string;
	name: string;
	description?: string;
	isActive: boolean;
	createdAt: string;
	updatedAt: string;
}

export interface CreateEntityDto {
	name: string;
	description?: string;
	isActive?: boolean;
}

export interface UpdateEntityDto {
	name?: string;
	description?: string;
	isActive?: boolean;
}

export interface EntityFilters {
	page?: number;
	limit?: number;
	search?: string;
}
```

### Step 2: Create API Layer

**File:** `packages/web/src/api/{module}/{module}.api.ts`

```typescript
import { api } from "#web/lib/api-client";
import type { Entity, CreateEntityDto, UpdateEntityDto, EntityFilters } from "#web/types/entity";
import type { PaginatedResponse } from "#web/types/api";

export const entityApi = {
	getAll: (params?: EntityFilters) =>
		api.get<PaginatedResponse<Entity>>("/entities", { params }).then((res) => res.data),

	getById: (id: string) =>
		api.get<Entity>(`/entities/${id}`).then((res) => res.data),

	create: (data: CreateEntityDto) =>
		api.post<Entity>("/entities", data).then((res) => res.data),

	update: (id: string, data: UpdateEntityDto) =>
		api.patch<Entity>(`/entities/${id}`, data).then((res) => res.data),

	delete: (id: string) =>
		api.delete(`/entities/${id}`).then((res) => res.data),
};
```

**File:** `packages/web/src/api/{module}/{module}.queries.ts`

```typescript
import { useQuery } from "@tanstack/react-query";
import { entityApi } from "./entity.api";
import type { EntityFilters } from "#web/types/entity";

export const entityKeys = {
	all: ["entities"] as const,
	lists: () => [...entityKeys.all, "list"] as const,
	list: (filters: EntityFilters) => [...entityKeys.lists(), filters] as const,
	details: () => [...entityKeys.all, "detail"] as const,
	detail: (id: string) => [...entityKeys.details(), id] as const,
};

export const useEntities = (filters?: EntityFilters) =>
	useQuery({
		queryKey: entityKeys.list(filters ?? {}),
		queryFn: () => entityApi.getAll(filters),
	});

export const useEntity = (id: string) =>
	useQuery({
		queryKey: entityKeys.detail(id),
		queryFn: () => entityApi.getById(id),
		enabled: !!id,
	});
```

**File:** `packages/web/src/api/{module}/{module}.mutations.ts`

```typescript
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { entityApi } from "./entity.api";
import { entityKeys } from "./entity.queries";
import type { CreateEntityDto, UpdateEntityDto } from "#web/types/entity";

export const useCreateEntity = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: CreateEntityDto) => entityApi.create(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: entityKeys.lists() });
		},
	});
};

export const useUpdateEntity = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, data }: { id: string; data: UpdateEntityDto }) => entityApi.update(id, data),
		onSuccess: (_, { id }) => {
			queryClient.invalidateQueries({ queryKey: entityKeys.lists() });
			queryClient.invalidateQueries({ queryKey: entityKeys.detail(id) });
		},
	});
};

export const useDeleteEntity = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: string) => entityApi.delete(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: entityKeys.lists() });
		},
	});
};
```

### Step 3: Create Feature Structure

```
packages/web/src/features/{feature}/
├── pages/
│   └── EntityListPage.tsx
├── components/
│   ├── EntityTable.tsx
│   └── EntityFormDialog.tsx
└── schemas/
    └── entity.schema.ts
```

### Step 4: Create Zod Schema

**File:** `features/{feature}/schemas/entity.schema.ts`

```typescript
import { z } from "zod";

export const entitySchema = z.object({
	name: z.string().min(1, "Name is required").max(100, "Name too long"),
	description: z.string().optional(),
	isActive: z.boolean().default(true),
});

export type EntityFormData = z.infer<typeof entitySchema>;
```

### Step 5: Create List Page

**File:** `features/{feature}/pages/EntityListPage.tsx`

```typescript
import React from "react";
import { useTranslation } from "react-i18next";
import { Plus } from "lucide-react";
import { Button } from "#web/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "#web/components/ui/card";
import { DataTable } from "#web/components/common/DataTable";
import { useEntities } from "#web/api/entity/entity.queries";
import { EntityFormDialog } from "../components/EntityFormDialog";

const EntityListPage = React.memo(() => {
	const { t } = useTranslation();
	const [page, setPage] = React.useState(1);
	const [search, setSearch] = React.useState("");
	const [isDialogOpen, setIsDialogOpen] = React.useState(false);
	const [editingEntity, setEditingEntity] = React.useState<Entity | null>(null);

	const { data, isLoading } = useEntities({ page, limit: 10, search });

	const handleEdit = React.useCallback((entity: Entity) => {
		setEditingEntity(entity);
		setIsDialogOpen(true);
	}, []);

	const handleCreate = React.useCallback(() => {
		setEditingEntity(null);
		setIsDialogOpen(true);
	}, []);

	const handleClose = React.useCallback(() => {
		setIsDialogOpen(false);
		setEditingEntity(null);
	}, []);

	return (
		<div className="container mx-auto py-6">
			<Card>
				<CardHeader className="flex flex-row items-center justify-between">
					<CardTitle>{t("entities.title")}</CardTitle>
					<Button onClick={handleCreate}>
						<Plus className="mr-2 h-4 w-4" />
						{t("entities.add")}
					</Button>
				</CardHeader>
				<CardContent>
					{/* Search and table implementation */}
					<DataTable
						data={data?.data ?? []}
						columns={columns}
						isLoading={isLoading}
						onEdit={handleEdit}
					/>
				</CardContent>
			</Card>

			<EntityFormDialog
				open={isDialogOpen}
				onClose={handleClose}
				entity={editingEntity}
			/>
		</div>
	);
}, () => true);

EntityListPage.displayName = "EntityListPage";

export default EntityListPage;
```

### Step 6: Create Form Dialog

**File:** `features/{feature}/components/EntityFormDialog.tsx`

```typescript
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "#web/components/ui/dialog";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "#web/components/ui/form";
import { Input } from "#web/components/ui/input";
import { Button } from "#web/components/ui/button";
import { useCreateEntity, useUpdateEntity } from "#web/api/entity/entity.mutations";
import { entitySchema, type EntityFormData } from "../schemas/entity.schema";
import type { Entity } from "#web/types/entity";

interface EntityFormDialogProps {
	open: boolean;
	onClose: () => void;
	entity: Entity | null;
}

const EntityFormDialog = React.memo(({ open, onClose, entity }: EntityFormDialogProps) => {
	const { t } = useTranslation();
	const isEditing = !!entity;

	const form = useForm<EntityFormData>({
		resolver: zodResolver(entitySchema),
		defaultValues: {
			name: entity?.name ?? "",
			description: entity?.description ?? "",
			isActive: entity?.isActive ?? true,
		},
	});

	const createMutation = useCreateEntity();
	const updateMutation = useUpdateEntity();

	const onSubmit = React.useCallback(async (data: EntityFormData) => {
		if (isEditing && entity) {
			await updateMutation.mutateAsync({ id: entity.id, data });
			toast.success(t("entities.updated"));
		} else {
			await createMutation.mutateAsync(data);
			toast.success(t("entities.created"));
		}
		onClose();
	}, [isEditing, entity, updateMutation, createMutation, onClose, t]);

	React.useEffect(() => {
		if (open) {
			form.reset({
				name: entity?.name ?? "",
				description: entity?.description ?? "",
				isActive: entity?.isActive ?? true,
			});
		}
	}, [open, entity, form]);

	return (
		<Dialog open={open} onOpenChange={onClose}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>
						{isEditing ? t("entities.edit") : t("entities.add")}
					</DialogTitle>
				</DialogHeader>

				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
						<FormField
							control={form.control}
							name="name"
							render={({ field }) => (
								<FormItem>
									<FormLabel>{t("entities.name")}</FormLabel>
									<FormControl>
										<Input {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						{/* More fields... */}

						<div className="flex justify-end gap-2">
							<Button type="button" variant="outline" onClick={onClose}>
								{t("common.cancel")}
							</Button>
							<Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
								{t("common.save")}
							</Button>
						</div>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}, (prev, next) => prev.open === next.open && prev.entity?.id === next.entity?.id);

EntityFormDialog.displayName = "EntityFormDialog";

export { EntityFormDialog };
```

### Step 7: Add Route

**File:** `packages/web/src/App.tsx`

```typescript
import EntityListPage from "#web/features/entity/pages/EntityListPage";

// In routes:
<Route path="/entities" element={<EntityListPage />} />
```

### Step 8: Add to Sidebar

**File:** `packages/web/src/components/layout/AppSidebar.tsx`

```typescript
{
  title: t("sidebar.entities"),
  url: "/entities",
  icon: BoxIcon,
}
```

### Step 9: Add Translations

**File:** `packages/web/src/i18n/locales/en.json`

```json
{
  "entities": {
    "title": "Entities",
    "add": "Add Entity",
    "edit": "Edit Entity",
    "name": "Name",
    "created": "Entity created successfully",
    "updated": "Entity updated successfully",
    "deleted": "Entity deleted successfully"
  }
}
```

**File:** `packages/web/src/i18n/locales/am.json`

```json
{
  "entities": {
    "title": "አካላት",
    "add": "አካል ጨምር",
    "edit": "አካል አርትዕ",
    "name": "ስም",
    "created": "አካል በተሳካ ሁኔታ ተፈጥሯል",
    "updated": "አካል በተሳካ ሁኔታ ተዘምኗል",
    "deleted": "አካል በተሳካ ሁኔታ ተሰርዟል"
  }
}
```

---

## Critical Rules

### ALWAYS

1. **Use `@CurrentTenant()`** in every controller method
2. **Include `tenantId`** in every Prisma query
3. **Add Swagger decorators** to all endpoints and DTOs
4. **Match frontend types** exactly to backend DTOs
5. **Use React.memo** for all components
6. **Add displayName** to all components
7. **Use useCallback** for event handlers
8. **Invalidate queries** after mutations
9. **Add translations** for both en and am

### NEVER

1. **Never use relative imports** for cross-directory
2. **Never use `.js` extensions** in imports
3. **Never use `any` type**
4. **Never skip Swagger documentation**
5. **Never forget tenant isolation**
6. **Never create duplicate utilities** - check existing first
7. **Never use `let` or `var`** - always use `const`
8. **Never use `forEach`** - use `for...of`

---

## Existing Utilities to Reuse

### Backend

| Utility | Import | Usage |
|---------|--------|-------|
| Pagination | `#api/common/utils/pagination.util` | `paginate(data, total, page, limit)` |
| Date formatting | `#api/common/utils/date.util` | Date operations |
| Hash | `#api/common/utils/hash.util` | Password hashing |
| String | `#api/common/utils/string.util` | ID generation |

### Frontend

| Utility | Import | Usage |
|---------|--------|-------|
| API client | `#web/lib/api-client` | `api.get()`, `api.post()`, etc. |
| Class names | `#web/lib/utils` | `cn("class1", condition && "class2")` |
| Ethiopian calendar | `#web/lib/ethiopian-calendar` | Date conversion |

---

## Reference Modules

Study these existing modules for patterns:

| Module | Backend | Frontend | Good For |
|--------|---------|----------|----------|
| Departments | `modules/departments/` | `features/organization/` | Simple CRUD |
| Employees | `modules/employees/` | `features/employees/` | Complex with sub-modules |
| Lookups | `modules/lookups/` | `features/lookups/` | Cascading dropdowns |
| Roles | `modules/roles/` | `features/roles/` | Permission-based |

---

*Last Updated: 2025-01-18*
