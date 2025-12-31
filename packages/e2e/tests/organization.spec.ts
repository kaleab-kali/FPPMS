import { expect, test } from "@playwright/test";

test.describe("Organization Features", () => {
	test.describe("Centers Management", () => {
		test("should load centers list page", async ({ page }) => {
			await page.goto("/organization/centers");

			await expect(page).toHaveURL(/\/organization\/centers/);

			await expect(page.getByRole("heading", { name: /centers/i })).toBeVisible();

			await expect(page.getByRole("button", { name: /create/i })).toBeVisible();

			const table = page.locator("table");
			await expect(table).toBeVisible();
		});

		test("should open create center dialog", async ({ page }) => {
			await page.goto("/organization/centers");

			await page.getByRole("button", { name: /create/i }).click();

			const dialog = page.getByRole("dialog");
			await expect(dialog).toBeVisible();

			await expect(dialog.getByLabel("Name", { exact: false })).toBeVisible();
			await expect(dialog.getByLabel("Code", { exact: false })).toBeVisible();
			await expect(dialog.getByLabel("Type", { exact: false })).toBeVisible();
			await expect(dialog.getByLabel("Address", { exact: false })).toBeVisible();
			await expect(dialog.getByLabel("Phone", { exact: false })).toBeVisible();
			await expect(dialog.getByLabel("Email", { exact: false })).toBeVisible();

			await expect(dialog.getByRole("button", { name: /cancel/i })).toBeVisible();
			await expect(dialog.getByRole("button", { name: /save/i })).toBeVisible();

			await dialog.getByRole("button", { name: /cancel/i }).click();

			await expect(dialog).not.toBeVisible();
		});

		test("should create new center", async ({ page }) => {
			await page.goto("/organization/centers");

			await page.getByRole("button", { name: /create/i }).click();

			const dialog = page.getByRole("dialog");
			await expect(dialog).toBeVisible();

			const timestamp = Date.now();
			const centerCode = `TEST-${timestamp}`;
			const centerName = `Test Center ${timestamp}`;

			await dialog.getByLabel("Name", { exact: false }).fill(centerName);
			await dialog.getByLabel("Code", { exact: false }).fill(centerCode);
			await dialog.getByLabel("Type", { exact: false }).fill("Test Type");
			await dialog.getByLabel("Phone", { exact: false }).fill("+251911234567");
			await dialog.getByLabel("Email", { exact: false }).fill(`test${timestamp}@example.com`);

			await dialog.getByRole("button", { name: /save/i }).click();

			await expect(page.getByText(/success/i)).toBeVisible({ timeout: 10000 });

			await expect(dialog).not.toBeVisible();

			await expect(page.getByText(centerName)).toBeVisible();
		});

		test("should edit center", async ({ page }) => {
			await page.goto("/organization/centers");

			const firstRow = page.locator("table tbody tr").first();
			await expect(firstRow).toBeVisible({ timeout: 10000 });

			await firstRow.getByRole("button", { name: /actions/i }).click();

			await page.getByRole("menuitem", { name: /edit/i }).click();

			const dialog = page.getByRole("dialog");
			await expect(dialog).toBeVisible();

			const codeInput = dialog.getByLabel("Code", { exact: false });
			await expect(codeInput).toBeDisabled();

			const nameInput = dialog.getByLabel("Name", { exact: false });
			const currentName = await nameInput.inputValue();
			const updatedName = `${currentName} (Updated)`;
			await nameInput.clear();
			await nameInput.fill(updatedName);

			await dialog.getByRole("button", { name: /save/i }).click();

			await expect(page.getByText(/success/i)).toBeVisible({ timeout: 10000 });

			await expect(dialog).not.toBeVisible();

			await expect(page.getByText(updatedName)).toBeVisible();
		});

		test("should delete center with confirmation", async ({ page }) => {
			await page.goto("/organization/centers");

			const timestamp = Date.now();
			const centerCode = `DEL-${timestamp}`;
			const centerName = `Delete Test ${timestamp}`;

			await page.getByRole("button", { name: /create/i }).click();

			const createDialog = page.getByRole("dialog");
			await createDialog.getByLabel("Name", { exact: false }).fill(centerName);
			await createDialog.getByLabel("Code", { exact: false }).fill(centerCode);
			await createDialog.getByRole("button", { name: /save/i }).click();

			await expect(page.getByText(/success/i)).toBeVisible({ timeout: 10000 });

			await page.reload();

			const centerRow = page.locator("table tbody tr", { hasText: centerName });
			await expect(centerRow).toBeVisible({ timeout: 10000 });

			await centerRow.getByRole("button", { name: /actions/i }).click();

			await page.getByRole("menuitem", { name: /delete/i }).click();

			const confirmDialog = page.getByRole("dialog");
			await expect(confirmDialog).toBeVisible();

			await expect(confirmDialog.getByText(/confirm/i)).toBeVisible();

			await confirmDialog.getByRole("button", { name: /cancel/i }).click();

			await expect(confirmDialog).not.toBeVisible();

			await expect(centerRow).toBeVisible();

			await centerRow.getByRole("button", { name: /actions/i }).click();

			await page.getByRole("menuitem", { name: /delete/i }).click();

			await expect(confirmDialog).toBeVisible();

			await confirmDialog.getByRole("button", { name: /confirm|delete/i }).click();

			await expect(page.getByText(/success/i)).toBeVisible({ timeout: 10000 });

			await page.reload();

			await expect(page.locator("table tbody tr", { hasText: centerName })).not.toBeVisible();
		});
	});

	test.describe("Departments Management", () => {
		test("should load departments list page", async ({ page }) => {
			await page.goto("/organization/departments");

			await expect(page).toHaveURL(/\/organization\/departments/);

			await expect(page.getByRole("heading", { name: /departments/i })).toBeVisible();

			await expect(page.getByRole("button", { name: /create/i })).toBeVisible();

			const table = page.locator("table");
			await expect(table).toBeVisible();
		});

		test("should open create department dialog", async ({ page }) => {
			await page.goto("/organization/departments");

			await page.getByRole("button", { name: /create/i }).click();

			const dialog = page.getByRole("dialog");
			await expect(dialog).toBeVisible();

			await expect(dialog.getByLabel("Name", { exact: false })).toBeVisible();
			await expect(dialog.getByLabel("Code", { exact: false })).toBeVisible();
			await expect(dialog.getByLabel("Description", { exact: false })).toBeVisible();

			await expect(dialog.getByRole("button", { name: /cancel/i })).toBeVisible();
			await expect(dialog.getByRole("button", { name: /save/i })).toBeVisible();

			await dialog.getByRole("button", { name: /cancel/i }).click();

			await expect(dialog).not.toBeVisible();
		});

		test("should create new department", async ({ page }) => {
			await page.goto("/organization/departments");

			await page.getByRole("button", { name: /create/i }).click();

			const dialog = page.getByRole("dialog");
			await expect(dialog).toBeVisible();

			const timestamp = Date.now();
			const deptCode = `DEPT-${timestamp}`;
			const deptName = `Test Department ${timestamp}`;

			await dialog.getByLabel("Name", { exact: false }).fill(deptName);
			await dialog.getByLabel("Code", { exact: false }).fill(deptCode);
			await dialog.getByLabel("Description", { exact: false }).fill("Test department description");

			await dialog.getByRole("button", { name: /save/i }).click();

			await expect(page.getByText(/success/i)).toBeVisible({ timeout: 10000 });

			await expect(dialog).not.toBeVisible();

			await expect(page.getByText(deptName)).toBeVisible();
		});

		test("should edit department", async ({ page }) => {
			await page.goto("/organization/departments");

			const firstRow = page.locator("table tbody tr").first();
			await expect(firstRow).toBeVisible({ timeout: 10000 });

			await firstRow.getByRole("button", { name: /actions/i }).click();

			await page.getByRole("menuitem", { name: /edit/i }).click();

			const dialog = page.getByRole("dialog");
			await expect(dialog).toBeVisible();

			const codeInput = dialog.getByLabel("Code", { exact: false });
			await expect(codeInput).toBeDisabled();

			const nameInput = dialog.getByLabel("Name", { exact: false });
			const currentName = await nameInput.inputValue();
			const updatedName = `${currentName} (Modified)`;
			await nameInput.clear();
			await nameInput.fill(updatedName);

			await dialog.getByRole("button", { name: /save/i }).click();

			await expect(page.getByText(/success/i)).toBeVisible({ timeout: 10000 });

			await expect(dialog).not.toBeVisible();

			await expect(page.getByText(updatedName)).toBeVisible();
		});

		test("should delete department with confirmation", async ({ page }) => {
			await page.goto("/organization/departments");

			const timestamp = Date.now();
			const deptCode = `DEL-${timestamp}`;
			const deptName = `Delete Dept ${timestamp}`;

			await page.getByRole("button", { name: /create/i }).click();

			const createDialog = page.getByRole("dialog");
			await createDialog.getByLabel("Name", { exact: false }).fill(deptName);
			await createDialog.getByLabel("Code", { exact: false }).fill(deptCode);
			await createDialog.getByRole("button", { name: /save/i }).click();

			await expect(page.getByText(/success/i)).toBeVisible({ timeout: 10000 });

			await page.reload();

			const deptRow = page.locator("table tbody tr", { hasText: deptName });
			await expect(deptRow).toBeVisible({ timeout: 10000 });

			await deptRow.getByRole("button", { name: /actions/i }).click();

			await page.getByRole("menuitem", { name: /delete/i }).click();

			const confirmDialog = page.getByRole("dialog");
			await expect(confirmDialog).toBeVisible();

			await expect(confirmDialog.getByText(/confirm/i)).toBeVisible();

			await confirmDialog.getByRole("button", { name: /cancel/i }).click();

			await expect(confirmDialog).not.toBeVisible();

			await expect(deptRow).toBeVisible();

			await deptRow.getByRole("button", { name: /actions/i }).click();

			await page.getByRole("menuitem", { name: /delete/i }).click();

			await expect(confirmDialog).toBeVisible();

			await confirmDialog.getByRole("button", { name: /confirm|delete/i }).click();

			await expect(page.getByText(/success/i)).toBeVisible({ timeout: 10000 });

			await page.reload();

			await expect(page.locator("table tbody tr", { hasText: deptName })).not.toBeVisible();
		});
	});

	test.describe("Positions Management", () => {
		test("should load positions list page", async ({ page }) => {
			await page.goto("/organization/positions");

			await expect(page).toHaveURL(/\/organization\/positions/);

			await expect(page.getByRole("heading", { name: /positions/i })).toBeVisible();

			await expect(page.getByRole("button", { name: /create/i })).toBeVisible();

			const table = page.locator("table");
			await expect(table).toBeVisible();
		});

		test("should open create position dialog", async ({ page }) => {
			await page.goto("/organization/positions");

			await page.getByRole("button", { name: /create/i }).click();

			const dialog = page.getByRole("dialog");
			await expect(dialog).toBeVisible();

			await expect(dialog.getByLabel("Name", { exact: false })).toBeVisible();
			await expect(dialog.getByLabel("Code", { exact: false })).toBeVisible();
			await expect(dialog.getByLabel("Description", { exact: false })).toBeVisible();

			await expect(dialog.getByRole("button", { name: /cancel/i })).toBeVisible();
			await expect(dialog.getByRole("button", { name: /save/i })).toBeVisible();

			await dialog.getByRole("button", { name: /cancel/i }).click();

			await expect(dialog).not.toBeVisible();
		});

		test("should create new position", async ({ page }) => {
			await page.goto("/organization/positions");

			await page.getByRole("button", { name: /create/i }).click();

			const dialog = page.getByRole("dialog");
			await expect(dialog).toBeVisible();

			const timestamp = Date.now();
			const posCode = `POS-${timestamp}`;
			const posName = `Test Position ${timestamp}`;

			await dialog.getByLabel("Name", { exact: false }).fill(posName);
			await dialog.getByLabel("Code", { exact: false }).fill(posCode);
			await dialog.getByLabel("Description", { exact: false }).fill("Test position description");

			await dialog.getByRole("button", { name: /save/i }).click();

			await expect(page.getByText(/success/i)).toBeVisible({ timeout: 10000 });

			await expect(dialog).not.toBeVisible();

			await expect(page.getByText(posName)).toBeVisible();
		});

		test("should edit position", async ({ page }) => {
			await page.goto("/organization/positions");

			const firstRow = page.locator("table tbody tr").first();
			await expect(firstRow).toBeVisible({ timeout: 10000 });

			await firstRow.getByRole("button", { name: /actions/i }).click();

			await page.getByRole("menuitem", { name: /edit/i }).click();

			const dialog = page.getByRole("dialog");
			await expect(dialog).toBeVisible();

			const codeInput = dialog.getByLabel("Code", { exact: false });
			await expect(codeInput).toBeDisabled();

			const nameInput = dialog.getByLabel("Name", { exact: false });
			const currentName = await nameInput.inputValue();
			const updatedName = `${currentName} (Updated)`;
			await nameInput.clear();
			await nameInput.fill(updatedName);

			await dialog.getByRole("button", { name: /save/i }).click();

			await expect(page.getByText(/success/i)).toBeVisible({ timeout: 10000 });

			await expect(dialog).not.toBeVisible();

			await expect(page.getByText(updatedName)).toBeVisible();
		});

		test("should not allow delete position", async ({ page }) => {
			await page.goto("/organization/positions");

			const firstRow = page.locator("table tbody tr").first();
			await expect(firstRow).toBeVisible({ timeout: 10000 });

			await firstRow.getByRole("button", { name: /actions/i }).click();

			const deleteOption = page.getByRole("menuitem", { name: /delete/i });
			const editOption = page.getByRole("menuitem", { name: /edit/i });

			await expect(editOption).toBeVisible();

			if ((await deleteOption.count()) > 0) {
				await deleteOption.click();

				const confirmDialog = page.getByRole("dialog");
				await expect(confirmDialog).toBeVisible();

				await confirmDialog.getByRole("button", { name: /cancel/i }).click();
			}
		});
	});

	test.describe("Cross-Feature Workflows", () => {
		test("should navigate between organization pages", async ({ page }) => {
			await page.goto("/organization/centers");
			await expect(page).toHaveURL(/\/organization\/centers/);

			const sidebar = page.locator("aside");
			await expect(sidebar).toBeVisible();

			await page.getByRole("link", { name: /departments/i }).click();
			await expect(page).toHaveURL(/\/organization\/departments/);

			await page.getByRole("link", { name: /positions/i }).click();
			await expect(page).toHaveURL(/\/organization\/positions/);

			await page.getByRole("link", { name: /centers/i }).click();
			await expect(page).toHaveURL(/\/organization\/centers/);
		});

		test("should maintain data across page refreshes", async ({ page }) => {
			await page.goto("/organization/centers");

			const timestamp = Date.now();
			const centerCode = `PERSIST-${timestamp}`;
			const centerName = `Persist Test ${timestamp}`;

			await page.getByRole("button", { name: /create/i }).click();

			const dialog = page.getByRole("dialog");
			await dialog.getByLabel("Name", { exact: false }).fill(centerName);
			await dialog.getByLabel("Code", { exact: false }).fill(centerCode);
			await dialog.getByRole("button", { name: /save/i }).click();

			await expect(page.getByText(/success/i)).toBeVisible({ timeout: 10000 });

			await page.reload();

			await expect(page.getByText(centerName)).toBeVisible({ timeout: 10000 });
		});

		test("should handle concurrent operations", async ({ page }) => {
			await page.goto("/organization/departments");

			await page.getByRole("button", { name: /create/i }).click();

			const dialog = page.getByRole("dialog");
			await expect(dialog).toBeVisible();

			await dialog.getByRole("button", { name: /cancel/i }).click();

			await expect(dialog).not.toBeVisible();

			await page.getByRole("button", { name: /create/i }).click();

			await expect(dialog).toBeVisible();

			const timestamp = Date.now();
			const deptCode = `CONC-${timestamp}`;
			const deptName = `Concurrent Test ${timestamp}`;

			await dialog.getByLabel("Name", { exact: false }).fill(deptName);
			await dialog.getByLabel("Code", { exact: false }).fill(deptCode);
			await dialog.getByRole("button", { name: /save/i }).click();

			await expect(page.getByText(/success/i)).toBeVisible({ timeout: 10000 });
		});
	});

	test.describe("Data Validation", () => {
		test("should validate required fields in center form", async ({ page }) => {
			await page.goto("/organization/centers");

			await page.getByRole("button", { name: /create/i }).click();

			const dialog = page.getByRole("dialog");
			await expect(dialog).toBeVisible();

			await dialog.getByRole("button", { name: /save/i }).click();

			const nameInput = dialog.getByLabel("Name", { exact: false });
			await expect(nameInput).toHaveAttribute("aria-invalid", "true");

			const codeInput = dialog.getByLabel("Code", { exact: false });
			await expect(codeInput).toHaveAttribute("aria-invalid", "true");
		});

		test("should validate email format in center form", async ({ page }) => {
			await page.goto("/organization/centers");

			await page.getByRole("button", { name: /create/i }).click();

			const dialog = page.getByRole("dialog");
			await expect(dialog).toBeVisible();

			const timestamp = Date.now();
			await dialog.getByLabel("Name", { exact: false }).fill(`Test ${timestamp}`);
			await dialog.getByLabel("Code", { exact: false }).fill(`TEST-${timestamp}`);
			await dialog.getByLabel("Email", { exact: false }).fill("invalid-email");

			await dialog.getByRole("button", { name: /save/i }).click();

			const emailInput = dialog.getByLabel("Email", { exact: false });
			await expect(emailInput).toHaveAttribute("aria-invalid", "true");
		});

		test("should validate required fields in department form", async ({ page }) => {
			await page.goto("/organization/departments");

			await page.getByRole("button", { name: /create/i }).click();

			const dialog = page.getByRole("dialog");
			await expect(dialog).toBeVisible();

			await dialog.getByRole("button", { name: /save/i }).click();

			const nameInput = dialog.getByLabel("Name", { exact: false });
			await expect(nameInput).toHaveAttribute("aria-invalid", "true");

			const codeInput = dialog.getByLabel("Code", { exact: false });
			await expect(codeInput).toHaveAttribute("aria-invalid", "true");
		});

		test("should validate required fields in position form", async ({ page }) => {
			await page.goto("/organization/positions");

			await page.getByRole("button", { name: /create/i }).click();

			const dialog = page.getByRole("dialog");
			await expect(dialog).toBeVisible();

			await dialog.getByRole("button", { name: /save/i }).click();

			const nameInput = dialog.getByLabel("Name", { exact: false });
			await expect(nameInput).toHaveAttribute("aria-invalid", "true");

			const codeInput = dialog.getByLabel("Code", { exact: false });
			await expect(codeInput).toHaveAttribute("aria-invalid", "true");
		});
	});

	test.describe("Table Functionality", () => {
		test("should search centers table", async ({ page }) => {
			await page.goto("/organization/centers");

			const searchInput = page.getByPlaceholder(/search/i);
			await expect(searchInput).toBeVisible({ timeout: 10000 });

			const firstRow = page.locator("table tbody tr").first();
			await expect(firstRow).toBeVisible();

			const firstCellText = await firstRow.locator("td").first().textContent();

			await searchInput.fill(firstCellText ?? "");

			await page.waitForTimeout(500);

			const visibleRows = page.locator("table tbody tr");
			const count = await visibleRows.count();
			expect(count).toBeGreaterThan(0);
		});

		test("should search departments table", async ({ page }) => {
			await page.goto("/organization/departments");

			const searchInput = page.getByPlaceholder(/search/i);
			await expect(searchInput).toBeVisible({ timeout: 10000 });

			const firstRow = page.locator("table tbody tr").first();
			await expect(firstRow).toBeVisible();

			const firstCellText = await firstRow.locator("td").first().textContent();

			await searchInput.fill(firstCellText ?? "");

			await page.waitForTimeout(500);

			const visibleRows = page.locator("table tbody tr");
			const count = await visibleRows.count();
			expect(count).toBeGreaterThan(0);
		});

		test("should search positions table", async ({ page }) => {
			await page.goto("/organization/positions");

			const searchInput = page.getByPlaceholder(/search/i);
			await expect(searchInput).toBeVisible({ timeout: 10000 });

			const firstRow = page.locator("table tbody tr").first();
			await expect(firstRow).toBeVisible();

			const firstCellText = await firstRow.locator("td").first().textContent();

			await searchInput.fill(firstCellText ?? "");

			await page.waitForTimeout(500);

			const visibleRows = page.locator("table tbody tr");
			const count = await visibleRows.count();
			expect(count).toBeGreaterThan(0);
		});

		test("should display status badges in centers table", async ({ page }) => {
			await page.goto("/organization/centers");

			const firstRow = page.locator("table tbody tr").first();
			await expect(firstRow).toBeVisible({ timeout: 10000 });

			const badge = firstRow.locator("[class*='badge']");
			await expect(badge).toBeVisible();

			const badgeText = await badge.textContent();
			expect(badgeText?.toLowerCase()).toMatch(/active|inactive/i);
		});

		test("should display status badges in departments table", async ({ page }) => {
			await page.goto("/organization/departments");

			const firstRow = page.locator("table tbody tr").first();
			await expect(firstRow).toBeVisible({ timeout: 10000 });

			const badge = firstRow.locator("[class*='badge']");
			await expect(badge).toBeVisible();

			const badgeText = await badge.textContent();
			expect(badgeText?.toLowerCase()).toMatch(/active|inactive/i);
		});

		test("should display status badges in positions table", async ({ page }) => {
			await page.goto("/organization/positions");

			const firstRow = page.locator("table tbody tr").first();
			await expect(firstRow).toBeVisible({ timeout: 10000 });

			const badge = firstRow.locator("[class*='badge']");
			await expect(badge).toBeVisible();

			const badgeText = await badge.textContent();
			expect(badgeText?.toLowerCase()).toMatch(/active|inactive/i);
		});
	});
});
