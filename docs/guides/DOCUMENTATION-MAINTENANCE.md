# Documentation Maintenance Guide

> How to keep PPMS documentation up-to-date when implementing new features

**CRITICAL:** Documentation must be updated whenever code changes. Outdated documentation is worse than no documentation.

---

## When to Update Documentation

### ALWAYS Update After:

| Change Type | Documents to Update |
|-------------|---------------------|
| New backend module | FILE-MAP.md, API-REFERENCE.md, BACKEND-MODULES.md |
| New frontend feature | FILE-MAP.md, FRONTEND-FEATURES.md |
| New Prisma model | DATABASE-MODELS.md |
| New API endpoint | API-REFERENCE.md |
| New UI component | COMPONENTS.md |
| New utility function | UTILITIES.md |
| New business rule | BUSINESS-RULES.md |
| New workflow/status | STATE-MACHINES.md |
| Security-related change | SECURITY-GUIDE.md |
| New term/concept | GLOSSARY.md |

---

## Documentation Update Checklist

### After Creating a New Module/Feature

```markdown
## Documentation Checklist - New Feature: {Feature Name}

### 1. FILE-MAP.md
- [ ] Add backend controller path
- [ ] Add backend service path
- [ ] Add frontend page path
- [ ] Add API layer path

### 2. API-REFERENCE.md
- [ ] Add all new endpoints
- [ ] Document request/response formats
- [ ] Include query parameters
- [ ] Add error responses

### 3. DATABASE-MODELS.md (if new models)
- [ ] Add new Prisma model
- [ ] Document fields and relations
- [ ] Add any new enums

### 4. STATE-MACHINES.md (if stateful)
- [ ] Add state diagram
- [ ] Document state transitions
- [ ] List valid status changes

### 5. BUSINESS-RULES.md (if business logic)
- [ ] Document validation rules
- [ ] Add business constraints
- [ ] Document workflow rules

### 6. COMPONENTS.md (if new components)
- [ ] Add component documentation
- [ ] Include props table
- [ ] Add usage example

### 7. UTILITIES.md (if new utilities)
- [ ] Document function signature
- [ ] Add usage example
- [ ] Note where it's used

### 8. Translations (always)
- [ ] Add English translations
- [ ] Add Amharic translations
```

---

## How to Update Each Document

### FILE-MAP.md

Add new module to the lookup table:

```markdown
| Module | Backend Controller | Backend Service | Frontend Page |
|--------|-------------------|-----------------|---------------|
| NewModule | `api/src/modules/new-module/new-module.controller.ts` | `new-module.service.ts` | `web/src/features/new-module/pages/NewModulePage.tsx` |
```

Add to "Quick Find by Keyword" section:

```markdown
| Looking For | File Location |
|-------------|---------------|
| New module logic | `api/src/modules/new-module/new-module.service.ts` |
```

---

### API-REFERENCE.md

Add new endpoint section:

```markdown
## New Module

### List Items
\`\`\`
GET /new-module
Auth: Required
Permissions: new-module:read

Query Parameters:
- page (number, default: 1)
- limit (number, default: 10)
- search (string)

Response:
{
  "data": [...],
  "meta": { ... }
}
\`\`\`

### Create Item
\`\`\`
POST /new-module
Auth: Required
Permissions: new-module:write

Request:
{
  "name": "string",
  "description": "string"
}

Response: 201, NewModule object
\`\`\`
```

---

### DATABASE-MODELS.md

Add new model:

```markdown
### NewModel

\`\`\`prisma
model NewModel {
  id        String   @id @default(uuid())
  tenantId  String
  name      String
  status    NewModelStatus @default(ACTIVE)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([tenantId, name])
}
\`\`\`
```

Add new enums:

```markdown
### New Enums

\`\`\`prisma
enum NewModelStatus {
  ACTIVE
  INACTIVE
  ARCHIVED
}
\`\`\`
```

---

### STATE-MACHINES.md

Add new workflow:

```markdown
## New Module Workflow

### Status States

\`\`\`
┌──────────┐
│  ACTIVE  │ ─────────────┐
└────┬─────┘              │
     │                    │
     ▼                    ▼
┌──────────┐        ┌──────────┐
│ INACTIVE │        │ ARCHIVED │
└──────────┘        └──────────┘
\`\`\`

### Mermaid Diagram

\`\`\`mermaid
stateDiagram-v2
    [*] --> ACTIVE: Created
    ACTIVE --> INACTIVE: Deactivate
    ACTIVE --> ARCHIVED: Archive
    INACTIVE --> ACTIVE: Reactivate
\`\`\`

### Status Transitions

| From | To | Trigger | Roles |
|------|-----|---------|-------|
| ACTIVE | INACTIVE | User deactivates | ADMIN |
| ACTIVE | ARCHIVED | Archive action | ADMIN |
| INACTIVE | ACTIVE | Reactivate | ADMIN |
```

---

### BUSINESS-RULES.md

Add new rules:

```markdown
## New Module Rules

### Validation Rules

\`\`\`
RULE: Name must be unique within tenant
RULE: Cannot archive if has active dependencies
RULE: Only ADMIN can change status
\`\`\`

### Business Logic

| Rule | Description |
|------|-------------|
| Unique name | Name + tenantId must be unique |
| Archive restriction | Cannot archive with active children |
| Status change | Requires ADMIN role |
```

---

### COMPONENTS.md

Add new component:

```markdown
### NewComponent

\`\`\`typescript
import { NewComponent } from "#web/components/common/NewComponent";

<NewComponent
  value={selected}
  onChange={setSelected}
  disabled={false}
/>
\`\`\`

**Props:**
| Prop | Type | Required | Description |
|------|------|----------|-------------|
| value | T | No | Current value |
| onChange | (value: T) => void | Yes | Change handler |
| disabled | boolean | No | Disable input |
```

---

### UTILITIES.md

Add new utility:

```markdown
### newUtilityFunction

\`\`\`typescript
import { newUtilityFunction } from "#api/common/utils/new.util";

// Usage
const result = newUtilityFunction(input);
\`\`\`

**Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| input | string | Input value |

**Returns:** `ProcessedResult`
```

---

## Template for New Feature Documentation

Copy this template when adding a new feature:

```markdown
## {Feature Name} - Documentation Updates

**Date:** YYYY-MM-DD
**Developer:** {Name}
**Feature:** {Brief description}

### Files Created

#### Backend
- [ ] `packages/api/src/modules/{module}/{module}.module.ts`
- [ ] `packages/api/src/modules/{module}/{module}.controller.ts`
- [ ] `packages/api/src/modules/{module}/{module}.service.ts`
- [ ] `packages/api/src/modules/{module}/dto/create-{entity}.dto.ts`
- [ ] `packages/api/src/modules/{module}/dto/update-{entity}.dto.ts`

#### Frontend
- [ ] `packages/web/src/api/{module}/{module}.api.ts`
- [ ] `packages/web/src/api/{module}/{module}.queries.ts`
- [ ] `packages/web/src/api/{module}/{module}.mutations.ts`
- [ ] `packages/web/src/types/{entity}.ts`
- [ ] `packages/web/src/features/{feature}/pages/{Entity}ListPage.tsx`
- [ ] `packages/web/src/features/{feature}/components/{Entity}FormDialog.tsx`

### Documentation Updated

- [ ] FILE-MAP.md - Added module locations
- [ ] API-REFERENCE.md - Added endpoints
- [ ] DATABASE-MODELS.md - Added models (if any)
- [ ] STATE-MACHINES.md - Added workflow (if stateful)
- [ ] BUSINESS-RULES.md - Added rules (if any)
- [ ] COMPONENTS.md - Added components (if reusable)
- [ ] UTILITIES.md - Added utilities (if any)
- [ ] GLOSSARY.md - Added terms (if new concepts)

### Translations Added

- [ ] en.json - English translations
- [ ] am.json - Amharic translations
```

---

## Automated Documentation Reminders

### Pre-commit Checklist

Before committing code that adds new features:

1. **Check FILE-MAP.md** - Is the new file location documented?
2. **Check API-REFERENCE.md** - Are new endpoints documented?
3. **Check types match DTOs** - Do frontend types match backend?
4. **Check translations** - Are all strings translated?

### Pull Request Template

Include in PR description:

```markdown
## Documentation

- [ ] FILE-MAP.md updated
- [ ] API-REFERENCE.md updated
- [ ] Other docs updated: {list}
- [ ] Translations added
- [ ] No documentation needed (explain why)
```

---

## Documentation Quality Standards

### Every Document Should Have

1. **Clear title** - What this document covers
2. **Last updated date** - When it was last modified
3. **Table of contents** - For longer documents
4. **Code examples** - Show, don't just tell
5. **Cross-references** - Link to related docs

### Writing Style

- Use tables for structured data
- Use code blocks for code
- Use mermaid for diagrams
- Keep explanations concise
- Include practical examples
- Update "Last Updated" date

### Document Structure

```markdown
# Document Title

> Brief description of what this document covers

---

## Section 1

### Subsection 1.1

Content...

---

## Section 2

Content...

---

## Related Documentation

- [Link to related doc](./related.md)

---

*Last Updated: YYYY-MM-DD*
```

---

## AI Assistant Instructions

When implementing new features, AI assistants MUST:

1. **Before coding:**
   - Read relevant documentation
   - Check FILE-MAP.md for existing code
   - Check UTILITIES.md before creating utilities
   - Check COMPONENTS.md before creating components

2. **After coding:**
   - Update FILE-MAP.md with new file locations
   - Update API-REFERENCE.md with new endpoints
   - Update other relevant documentation
   - Add translations for new strings

3. **Always:**
   - Follow patterns in AI-MODULE-GUIDE.md
   - Follow security rules in SECURITY-GUIDE.md
   - Keep documentation in sync with code

---

## Related Documentation

- [AI-MODULE-GUIDE.md](./AI-MODULE-GUIDE.md) - Creating modules
- [AI-FEATURE-CHECKLIST.md](./AI-FEATURE-CHECKLIST.md) - Feature checklist
- [FILE-MAP.md](../codebase/FILE-MAP.md) - File locations
- [_INDEX.md](../_INDEX.md) - Documentation index

---

*Last Updated: 2025-01-18*
