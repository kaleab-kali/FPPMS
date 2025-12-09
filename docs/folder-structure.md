# Folder Structure

## Root Directory

```
ppms/
├── .gitignore              # Git ignore patterns
├── .vscode/                # VS Code settings
├── biome.json              # Biome linter/formatter configuration
├── docs/                   # Project documentation
│   ├── architecture.md     # Architecture overview
│   ├── folder-structure.md # This file
│   └── agents.md           # AI agents documentation
├── node_modules/           # Dependencies (git-ignored)
├── package.json            # Root workspace config & scripts
├── package-lock.json       # Dependency lock file
├── packages/               # Workspace packages
│   ├── api/                # Backend NestJS application
│   └── web/                # Frontend React application
├── tsconfig.json           # TypeScript project references
├── CLAUDE.md               # Claude AI assistant instructions
└── README.md               # Project readme
```

## API Package (`packages/api/`)

```
packages/api/
├── dist/                   # Compiled output (git-ignored)
├── node_modules/           # Package dependencies (git-ignored)
├── src/                    # Source code
│   ├── app.controller.ts   # Main HTTP controller
│   ├── app.controller.spec.ts  # Controller tests
│   ├── app.module.ts       # Root NestJS module
│   ├── app.service.ts      # Main service
│   └── main.ts             # Application entry point
├── test/                   # E2E tests
│   ├── app.e2e-spec.ts     # E2E test file
│   └── jest-e2e.json       # Jest E2E configuration
├── nest-cli.json           # NestJS CLI configuration
├── package.json            # Package configuration
├── tsconfig.json           # TypeScript configuration
└── tsconfig.build.json     # Build-specific TS config
```

### API Import Alias

```typescript
// Use #api/* for all internal imports
import { AppService } from "#api/app.service";
import { AppModule } from "#api/app.module";
```

## Web Package (`packages/web/`)

```
packages/web/
├── dist/                   # Production build (git-ignored)
├── node_modules/           # Package dependencies (git-ignored)
├── public/                 # Static assets
│   └── vite.svg            # Vite logo
├── src/                    # Source code
│   ├── assets/             # Static assets (imported in code)
│   │   └── react.svg       # React logo
│   ├── components/         # React components
│   │   └── ui/             # shadcn/ui components
│   │       └── button.tsx  # Button component
│   ├── lib/                # Utility functions
│   │   └── utils.ts        # CN utility for class names
│   ├── App.css             # App-specific styles
│   ├── App.tsx             # Root component
│   ├── index.css           # Global styles & Tailwind
│   ├── main.tsx            # Application entry point
│   └── vite-env.d.ts       # Vite type declarations
├── components.json         # shadcn/ui configuration
├── index.html              # HTML template
├── package.json            # Package configuration
├── tsconfig.json           # TypeScript configuration
├── tsconfig.app.json       # App TypeScript config
├── tsconfig.node.json      # Node TypeScript config
└── vite.config.ts          # Vite configuration
```

### Web Import Alias

```typescript
// Use #web/* for all internal imports
import { Button } from "#web/components/ui/button";
import { cn } from "#web/lib/utils";
```

## Recommended Structure for Growth

### API (as it grows)

```
packages/api/src/
├── common/                 # Shared utilities
│   ├── decorators/         # Custom decorators
│   ├── filters/            # Exception filters
│   ├── guards/             # Auth guards
│   ├── interceptors/       # Request interceptors
│   └── pipes/              # Validation pipes
├── config/                 # Configuration
├── modules/                # Feature modules
│   ├── auth/               # Authentication
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── auth.module.ts
│   │   └── dto/
│   └── users/              # User management
│       ├── users.controller.ts
│       ├── users.service.ts
│       ├── users.module.ts
│       ├── dto/
│       └── entities/
├── app.module.ts
└── main.ts
```

### Web (as it grows)

```
packages/web/src/
├── assets/                 # Static assets
├── components/             # Shared components
│   ├── ui/                 # shadcn/ui components
│   └── common/             # Custom shared components
├── hooks/                  # Custom React hooks
├── lib/                    # Utilities
├── pages/                  # Page components
│   ├── home/
│   ├── auth/
│   └── dashboard/
├── services/               # API service layer
├── stores/                 # State management
├── types/                  # TypeScript types
├── App.tsx
└── main.tsx
```

## Configuration Files Summary

| File | Location | Purpose |
|------|----------|---------|
| `biome.json` | Root | Linting and formatting rules |
| `tsconfig.json` | Root | Project references |
| `package.json` | Root | Workspace & scripts |
| `tsconfig.json` | API | API TypeScript config |
| `nest-cli.json` | API | NestJS CLI config |
| `tsconfig.json` | Web | Web TypeScript references |
| `vite.config.ts` | Web | Vite bundler config |
| `components.json` | Web | shadcn/ui config |
