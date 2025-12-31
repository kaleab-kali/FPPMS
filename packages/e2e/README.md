# E2E Testing Suite

End-to-end testing suite for PPMS using Playwright.

## Prerequisites

1. Install dependencies:
```bash
npm install --workspace=packages/e2e
```

2. Install Playwright browsers:
```bash
npm run install:browsers --workspace=packages/e2e
```

3. Ensure both API and Web servers are running:
```bash
npm run dev
```

## Environment Variables

Create a `.env` file in the `packages/e2e` directory:

```env
BASE_URL=http://localhost:5173
TEST_USERNAME=FPCIV-0001-25
TEST_PASSWORD=Police@2025
```

## Running Tests

### Run all tests:
```bash
npm run test --workspace=packages/e2e
```

### Run tests in headed mode (visible browser):
```bash
npm run test:headed --workspace=packages/e2e
```

### Run tests in debug mode:
```bash
npm run test:debug --workspace=packages/e2e
```

### Run tests with UI:
```bash
npm run test:ui --workspace=packages/e2e
```

### Run specific test file:
```bash
npm run test --workspace=packages/e2e -- employees.spec.ts
```

### Run tests matching a pattern:
```bash
npm run test --workspace=packages/e2e -- --grep "registration"
```

## Test Organization

### Test Files

- `tests/employees.spec.ts` - Comprehensive employees feature tests
- `tests/example.spec.ts` - Example test (can be removed)

### Test Coverage

The employees test suite covers:

1. **Employees List Page**
   - Table rendering and data display
   - Statistics cards
   - Create button functionality
   - Type and status filters
   - Pagination

2. **Search and Filter**
   - Search by employee ID
   - Search by name
   - Filter by type (Military, Civilian, Temporary)
   - Filter by status (Active, Retired, etc.)
   - Clear filters

3. **Employee Detail Page**
   - Navigation to detail page
   - Display of employee information
   - Navigation to edit page
   - Tab navigation (Overview, Photo, Family, etc.)
   - Back navigation

4. **Registration Flow**
   - Type selection page
   - Navigation to specific registration forms
   - Form field validation
   - Required field checks
   - Transfer option for military employees
   - Back navigation

5. **Edit Functionality**
   - Load existing data in form
   - Update employee information
   - Cancel and return to detail page

6. **Former Employees**
   - Navigation to former employees page
   - Table display
   - Status filtering
   - View former employee details
   - Return to active employees

7. **Actions and Permissions**
   - Actions menu display
   - View, Edit, Change Status options

8. **Responsive Design**
   - Mobile viewport (375x667)
   - Tablet viewport (768x1024)
   - Desktop viewport (1920x1080)

## Authentication

Tests use stored authentication state from the global setup. The setup:

1. Logs in with test credentials
2. Saves authentication state to `playwright/.auth/user.json`
3. All test projects depend on this setup

## Test Reports

After running tests, view the HTML report:
```bash
npm run test:report --workspace=packages/e2e
```

## Debugging Tips

1. **Run in headed mode** to see the browser:
   ```bash
   npm run test:headed --workspace=packages/e2e
   ```

2. **Use debug mode** to step through tests:
   ```bash
   npm run test:debug --workspace=packages/e2e
   ```

3. **Use Playwright Inspector**:
   - Tests pause at `await page.pause()`
   - Explore page state and selectors

4. **Check screenshots and videos**:
   - Located in `test-results/` directory
   - Only captured on failures

## Writing New Tests

1. Create a new file in `tests/` directory
2. Import test utilities:
   ```typescript
   import { expect, test } from "@playwright/test";
   ```
3. Use `test.describe` for grouping tests
4. Use `test.beforeEach` for common setup
5. Assume user is already authenticated

### Example Test Structure

```typescript
import { expect, test } from "@playwright/test";

test.describe("Feature Name", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto("/feature-path");
		await page.waitForLoadState("networkidle");
	});

	test("should do something", async ({ page }) => {
		await expect(page.getByRole("heading")).toBeVisible();
	});
});
```

## Code Generator

Use Playwright's code generator to create tests:
```bash
npm run codegen --workspace=packages/e2e
```

This opens a browser where you can interact with your app, and Playwright generates the test code.

## Best Practices

1. **Wait for network idle** before assertions
2. **Use semantic selectors** (role, label, text) over CSS selectors
3. **Test user flows** not implementation details
4. **Keep tests independent** - each test should work in isolation
5. **Use descriptive test names** that explain the expected behavior
6. **Avoid hardcoded waits** - use Playwright's auto-waiting
7. **Test responsive design** on different viewports
8. **Don't use try/catch** - let tests fail naturally

## Continuous Integration

Tests are configured to run in CI with:
- 2 retries on failure
- Single worker (sequential execution)
- Screenshots and videos on failure
- HTML and list reporters

## Troubleshooting

### Tests fail with "Target closed"
- Ensure API and Web servers are running
- Check if BASE_URL is correct

### Authentication fails
- Verify TEST_USERNAME and TEST_PASSWORD
- Check if user exists in database
- Run seed script if needed

### Element not found
- Increase timeout: `{ timeout: 10000 }`
- Wait for network idle
- Check if element is in viewport

### Tests are flaky
- Add proper waits
- Ensure test data is consistent
- Check for race conditions
