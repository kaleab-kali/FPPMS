# Architecture

## Overview

PPMS is a full-stack monorepo application built with modern TypeScript technologies. The project uses npm workspaces to manage multiple packages within a single repository.

## Technology Stack

### Backend (API)
- **Framework**: NestJS
- **Runtime**: Node.js
- **Language**: TypeScript
- **Testing**: Jest

### Frontend (Web)
- **Framework**: React 18+
- **Build Tool**: Vite
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui
- **Language**: TypeScript

### Development Tools
- **Linter/Formatter**: Biome
- **Package Manager**: npm with workspaces
- **TypeScript**: Shared configuration with project references

## Design Principles

### Monorepo Structure
The project follows a monorepo pattern using npm workspaces, allowing:
- Shared dependencies at the root level
- Independent package versioning
- Unified build and test commands
- Consistent tooling across packages

### Import Aliases
Both packages use the `#` prefix for import aliases following Node.js subpath imports pattern:
- `#api/*` - API package imports
- `#web/*` - Web package imports

This provides:
- Clean, readable imports
- Decoupling from file system structure
- Easy refactoring support

### Code Quality
- **Biome**: Single tool for linting and formatting
- **TypeScript**: Strict type checking
- **Testing**: Unit tests with Jest (API), component tests (Web)

## Package Communication

```
┌─────────────────────────────────────────────────────────┐
│                        Client                           │
│                      (Browser)                          │
└─────────────────────────┬───────────────────────────────┘
                          │
                          │ HTTP/HTTPS
                          │
┌─────────────────────────▼───────────────────────────────┐
│                     Web Package                         │
│                   (React + Vite)                        │
│                                                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │ Components  │  │   Pages     │  │   Hooks     │     │
│  └─────────────┘  └─────────────┘  └─────────────┘     │
└─────────────────────────┬───────────────────────────────┘
                          │
                          │ REST API
                          │
┌─────────────────────────▼───────────────────────────────┐
│                     API Package                         │
│                      (NestJS)                           │
│                                                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │ Controllers │  │  Services   │  │  Modules    │     │
│  └─────────────┘  └─────────────┘  └─────────────┘     │
└─────────────────────────┬───────────────────────────────┘
                          │
                          │ Database Connection
                          │
┌─────────────────────────▼───────────────────────────────┐
│                      Database                           │
│                    (To be added)                        │
└─────────────────────────────────────────────────────────┘
```

## Configuration Files

| File | Purpose |
|------|---------|
| `biome.json` | Linting and formatting rules |
| `tsconfig.json` | Root TypeScript project references |
| `package.json` | Root workspace configuration and scripts |
| `packages/api/tsconfig.json` | API TypeScript configuration |
| `packages/web/tsconfig.json` | Web TypeScript configuration |

## Future Considerations

- **Authentication**: JWT-based auth system
- **Database**: PostgreSQL with Prisma ORM
- **Caching**: Redis for session management
- **API Documentation**: Swagger/OpenAPI
- **Deployment**: Docker containerization
