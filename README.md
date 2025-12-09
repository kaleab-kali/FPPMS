# PPMS

A full-stack TypeScript monorepo application with NestJS backend and React frontend.

## Prerequisites

- Node.js 18+
- npm 9+

## Getting Started

### Installation

```bash
npm install
```

### Development

Run both API and Web in development mode:

```bash
npm run dev
```

Or run individually:

```bash
# API only
npm run dev:api

# Web only
npm run dev:web
```

### Building

```bash
# Build all packages
npm run build

# Build individually
npm run build:api
npm run build:web
```

### Testing

```bash
# Run API tests
npm run test

# Run E2E tests
npm run test:e2e
```

### Linting & Formatting

```bash
# Check for issues
npm run lint

# Auto-fix issues
npm run lint:fix

# Format code
npm run format
```

## Project Structure

```
ppms/
├── packages/
│   ├── api/          # NestJS backend
│   └── web/          # React + Vite frontend
├── docs/             # Documentation
├── biome.json        # Linter/formatter config
├── tsconfig.json     # TypeScript project references
└── package.json      # Workspace configuration
```

See [docs/folder-structure.md](docs/folder-structure.md) for detailed structure.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Backend | NestJS, TypeScript |
| Frontend | React, Vite, Tailwind CSS |
| UI Components | shadcn/ui |
| Tooling | Biome, TypeScript |

## Import Aliases

This project uses `#` prefix for import aliases:

```typescript
// API
import { AppService } from "#api/app.service";

// Web
import { Button } from "#web/components/ui/button";
```

## Documentation

- [Architecture](docs/architecture.md)
- [Folder Structure](docs/folder-structure.md)
- [Agents](docs/agents.md)

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development servers |
| `npm run build` | Build all packages |
| `npm run test` | Run tests |
| `npm run lint` | Check code quality |
| `npm run lint:fix` | Fix lint issues |
| `npm run format` | Format code |

## License

ISC
