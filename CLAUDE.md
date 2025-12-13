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
src/components/
├── ui/                    # shadcn/ui components
│   └── Button.tsx
├── common/                # Shared components
│   ├── Header.tsx
│   └── Footer.tsx
└── features/              # Feature-specific components
    └── auth/
        ├── LoginForm.tsx
        └── useAuth.ts
```

## Project Structure

```
ppms/
├── packages/
│   ├── api/
│   │   └── src/
│   │       ├── modules/       # Feature modules
│   │       ├── common/        # Shared utilities
│   │       ├── app.module.ts
│   │       └── main.ts
│   └── web/
│       └── src/
│           ├── components/    # React components (PascalCase)
│           ├── hooks/         # Custom hooks
│           ├── lib/           # Utilities
│           ├── pages/         # Page components
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
