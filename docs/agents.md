# AI Agents Documentation

This document outlines the AI agent patterns and integrations used in the PPMS project.

## Claude Code Integration

This project is optimized for use with [Claude Code](https://claude.ai/claude-code), Anthropic's CLI tool for AI-assisted development.

### CLAUDE.md

The `CLAUDE.md` file in the root directory provides context to Claude Code about:
- Project structure and commands
- Code style guidelines
- Import alias patterns
- Key configuration notes

### Best Practices with Claude Code

1. **Always run lint before committing**
   ```bash
   npm run lint:fix
   ```

2. **Use specific prompts**
   - "Add a new endpoint to the API for user authentication"
   - "Create a new React component for displaying user cards"

3. **Reference existing patterns**
   - Point to existing files as examples
   - Mention the import alias convention (`#api/*`, `#web/*`)

## Agent Capabilities

### Code Generation

Claude Code can help with:
- Creating new NestJS modules, controllers, services
- Building React components with shadcn/ui
- Writing unit tests and E2E tests
- Configuring TypeScript and build tools

### Code Review

Use Claude Code to:
- Review pull requests
- Identify potential bugs
- Suggest performance improvements
- Check for security issues

### Refactoring

Claude Code assists with:
- Updating import paths
- Extracting common logic
- Improving type safety
- Modernizing code patterns

## Prompt Templates

### New API Endpoint

```
Create a new NestJS module for [feature] with:
- Controller with CRUD endpoints
- Service with business logic
- DTOs for request/response validation
- Unit tests

Use #api/* imports and follow existing patterns in app.controller.ts
```

### New React Component

```
Create a new React component for [feature]:
- Use TypeScript with proper types
- Include Tailwind CSS styling
- Use shadcn/ui components where appropriate
- Place in src/components/

Use #web/* imports and follow patterns in App.tsx
```

### Fix Bug

```
I'm seeing this error: [error message]

The error occurs when: [steps to reproduce]

Expected behavior: [what should happen]

Please investigate and fix the issue.
```

## Future Agent Integrations

### Planned Features

1. **Automated Testing Agent**
   - Generate tests for new code
   - Maintain test coverage thresholds
   - Run tests in CI/CD pipeline

2. **Documentation Agent**
   - Auto-generate API documentation
   - Keep README up to date
   - Create component storybook entries

3. **Security Agent**
   - Scan for vulnerabilities
   - Review authentication logic
   - Check for OWASP top 10 issues

4. **Performance Agent**
   - Analyze bundle sizes
   - Identify slow database queries
   - Suggest caching strategies

## Configuration

### Environment Variables

For agent integrations, set these environment variables:

```bash
# Claude Code (if using API)
ANTHROPIC_API_KEY=your_api_key

# Future integrations
OPENAI_API_KEY=your_openai_key  # If using GPT models
```

### CI/CD Integration

Example GitHub Action for Claude Code review:

```yaml
name: AI Code Review
on: [pull_request]

jobs:
  review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run AI Review
        # Configure based on your AI tool
        run: echo "AI review placeholder"
```

## Resources

- [Claude Code Documentation](https://docs.anthropic.com/claude-code)
- [Anthropic API](https://docs.anthropic.com)
- [NestJS Documentation](https://docs.nestjs.com)
- [React Documentation](https://react.dev)
