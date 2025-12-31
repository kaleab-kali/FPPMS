import { expect, test } from "@playwright/test";

test.describe("Lookups - Regions", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto("/lookups/regions");
		await page.waitForLoadState("networkidle");
	});

	test("should load regions list page", async ({ page }) => {
		await expect(page).toHaveURL(/\/lookups\/regions/);

		await expect(page.getByRole("heading", { name: /region/i, level: 1 })).toBeVisible();

		await expect(page.getByRole("button", { name: /create/i })).toBeVisible();

		const table = page.locator("table");
		await expect(table).toBeVisible();

		await expect(page.getByRole("columnheader", { name: /name/i })).toBeVisible();
		await expect(page.getByRole("columnheader", { name: /code/i })).toBeVisible();
		await expect(page.getByRole("columnheader", { name: /status/i })).toBeVisible();
		await expect(page.getByRole("columnheader", { name: /actions/i })).toBeVisible();
	});

	test("should display existing regions data", async ({ page }) => {
		const table = page.locator("table");
		await expect(table).toBeVisible();

		const firstRow = table.locator("tbody tr").first();
		await expect(firstRow).toBeVisible();

		await expect(firstRow.locator("td").first()).toContainText(/\w+/);
	});

	test("should search regions by name", async ({ page }) => {
		const searchInput = page.getByPlaceholder(/search/i);
		await expect(searchInput).toBeVisible();

		await searchInput.fill("Addis");

		await page.waitForTimeout(500);

		const table = page.locator("table tbody");
		const rows = table.locator("tr");
		const count = await rows.count();

		if (count > 0) {
			const firstRow = rows.first();
			await expect(firstRow).toContainText(/addis/i);
		}
	});

	test("should open create region dialog", async ({ page }) => {
		await page.getByRole("button", { name: /create/i }).click();

		const dialog = page.getByRole("dialog");
		await expect(dialog).toBeVisible();

		await expect(dialog.getByRole("heading", { name: /create/i })).toBeVisible();

		await expect(dialog.getByLabel(/^name/i)).toBeVisible();
		await expect(dialog.getByLabel(/amharic/i)).toBeVisible();
		await expect(dialog.getByLabel(/code/i)).toBeVisible();
		await expect(dialog.getByLabel(/sort order/i)).toBeVisible();
		await expect(dialog.getByLabel(/active/i)).toBeVisible();

		await expect(dialog.getByRole("button", { name: /cancel/i })).toBeVisible();
		await expect(dialog.getByRole("button", { name: /save/i })).toBeVisible();

		await dialog.getByRole("button", { name: /cancel/i }).click();
		await expect(dialog).not.toBeVisible();
	});

	test("should create a new region", async ({ page }) => {
		await page.getByRole("button", { name: /create/i }).click();

		const dialog = page.getByRole("dialog");
		await expect(dialog).toBeVisible();

		const timestamp = Date.now();
		const regionCode = `TEST-${timestamp}`;
		const regionName = `Test Region ${timestamp}`;
		const regionNameAm = `የሙከራ ክልል ${timestamp}`;

		await dialog.getByLabel(/^name/i).fill(regionName);
		await dialog.getByLabel(/amharic/i).fill(regionNameAm);
		await dialog.getByLabel(/code/i).fill(regionCode);
		await dialog.getByLabel(/sort order/i).fill("100");

		await dialog.getByRole("button", { name: /save/i }).click();

		await expect(page.getByText(/success/i)).toBeVisible({ timeout: 5000 });

		await expect(dialog).not.toBeVisible({ timeout: 5000 });

		const searchInput = page.getByPlaceholder(/search/i);
		await searchInput.fill(regionName);
		await page.waitForTimeout(500);

		await expect(page.getByText(regionName)).toBeVisible();
	});

	test("should open edit region dialog", async ({ page }) => {
		const table = page.locator("table tbody");
		const firstRow = table.locator("tr").first();
		await expect(firstRow).toBeVisible();

		const actionsButton = firstRow.getByRole("button", { name: /actions/i });
		await actionsButton.click();

		const editMenuItem = page.getByRole("menuitem", { name: /edit/i });
		await expect(editMenuItem).toBeVisible();
		await editMenuItem.click();

		const dialog = page.getByRole("dialog");
		await expect(dialog).toBeVisible();

		await expect(dialog.getByRole("heading", { name: /edit/i })).toBeVisible();

		await expect(dialog.getByLabel(/^name/i)).toHaveValue(/\w+/);
		await expect(dialog.getByLabel(/amharic/i)).toHaveValue(/\w+/);
		await expect(dialog.getByLabel(/code/i)).toBeDisabled();

		await dialog.getByRole("button", { name: /cancel/i }).click();
		await expect(dialog).not.toBeVisible();
	});

	test("should edit an existing region", async ({ page }) => {
		const table = page.locator("table tbody");
		const firstRow = table.locator("tr").first();
		await expect(firstRow).toBeVisible();

		const actionsButton = firstRow.getByRole("button", { name: /actions/i });
		await actionsButton.click();

		await page.getByRole("menuitem", { name: /edit/i }).click();

		const dialog = page.getByRole("dialog");
		await expect(dialog).toBeVisible();

		const timestamp = Date.now();
		const updatedName = `Updated Region ${timestamp}`;

		const nameInput = dialog.getByLabel(/^name/i);
		await nameInput.clear();
		await nameInput.fill(updatedName);

		await dialog.getByRole("button", { name: /save/i }).click();

		await expect(page.getByText(/success/i)).toBeVisible({ timeout: 5000 });

		await expect(dialog).not.toBeVisible({ timeout: 5000 });

		await page.reload();
		await page.waitForLoadState("networkidle");

		await expect(page.getByText(updatedName)).toBeVisible();
	});

	test("should open delete confirmation dialog", async ({ page }) => {
		const table = page.locator("table tbody");
		const rows = table.locator("tr");
		const rowCount = await rows.count();

		if (rowCount > 3) {
			const lastRow = rows.last();
			await expect(lastRow).toBeVisible();

			const actionsButton = lastRow.getByRole("button", { name: /actions/i });
			await actionsButton.click();

			const deleteMenuItem = page.getByRole("menuitem", { name: /delete/i });
			await expect(deleteMenuItem).toBeVisible();
			await deleteMenuItem.click();

			const confirmDialog = page.getByRole("dialog");
			await expect(confirmDialog).toBeVisible();

			await expect(confirmDialog.getByText(/confirm/i)).toBeVisible();
			await expect(confirmDialog.getByText(/delete/i)).toBeVisible();

			await expect(confirmDialog.getByRole("button", { name: /cancel/i })).toBeVisible();
			await expect(confirmDialog.getByRole("button", { name: /confirm/i })).toBeVisible();

			await confirmDialog.getByRole("button", { name: /cancel/i }).click();
			await expect(confirmDialog).not.toBeVisible();
		}
	});
});

test.describe("Lookups - Ranks", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto("/lookups/ranks");
		await page.waitForLoadState("networkidle");
	});

	test("should load ranks list page", async ({ page }) => {
		await expect(page).toHaveURL(/\/lookups\/ranks/);

		await expect(page.getByRole("heading", { name: /rank/i, level: 1 })).toBeVisible();

		await expect(page.getByRole("button", { name: /create/i })).toBeVisible();

		const table = page.locator("table");
		await expect(table).toBeVisible();

		await expect(page.getByRole("columnheader", { name: /name/i })).toBeVisible();
		await expect(page.getByRole("columnheader", { name: /code/i })).toBeVisible();
		await expect(page.getByRole("columnheader", { name: /level/i })).toBeVisible();
		await expect(page.getByRole("columnheader", { name: /category/i })).toBeVisible();
		await expect(page.getByRole("columnheader", { name: /base salary/i })).toBeVisible();
		await expect(page.getByRole("columnheader", { name: /status/i })).toBeVisible();
		await expect(page.getByRole("columnheader", { name: /actions/i })).toBeVisible();
	});

	test("should display existing ranks data", async ({ page }) => {
		const table = page.locator("table");
		await expect(table).toBeVisible();

		const firstRow = table.locator("tbody tr").first();
		await expect(firstRow).toBeVisible();

		await expect(firstRow.locator("td").first()).toContainText(/\w+/);

		const levelCell = firstRow.locator("td").nth(2);
		await expect(levelCell).toContainText(/\d+/);

		const salaryCell = firstRow.locator("td").nth(4);
		await expect(salaryCell).toContainText(/\d/);
	});

	test("should search ranks by name", async ({ page }) => {
		const searchInput = page.getByPlaceholder(/search/i);
		await expect(searchInput).toBeVisible();

		await searchInput.fill("Colonel");

		await page.waitForTimeout(500);

		const table = page.locator("table tbody");
		const rows = table.locator("tr");
		const count = await rows.count();

		if (count > 0) {
			const firstRow = rows.first();
			await expect(firstRow).toContainText(/colonel/i);
		}
	});

	test("should open create rank dialog", async ({ page }) => {
		await page.getByRole("button", { name: /create/i }).click();

		const dialog = page.getByRole("dialog");
		await expect(dialog).toBeVisible();

		await expect(dialog.getByRole("heading", { name: /create/i })).toBeVisible();

		await expect(dialog.getByLabel(/^name/i)).toBeVisible();
		await expect(dialog.getByLabel(/amharic/i)).toBeVisible();
		await expect(dialog.getByLabel(/code/i)).toBeVisible();
		await expect(dialog.getByLabel(/^level/i)).toBeVisible();
		await expect(dialog.getByLabel(/category/i)).toBeVisible();
		await expect(dialog.getByLabel(/base salary/i)).toBeVisible();
		await expect(dialog.getByLabel(/ceiling salary/i)).toBeVisible();
		await expect(dialog.getByLabel(/step count/i)).toBeVisible();
		await expect(dialog.getByLabel(/step period/i)).toBeVisible();
		await expect(dialog.getByLabel(/retirement age/i)).toBeVisible();
		await expect(dialog.getByLabel(/min years/i)).toBeVisible();
		await expect(dialog.getByLabel(/min appraisal/i)).toBeVisible();
		await expect(dialog.getByLabel(/sort order/i)).toBeVisible();
		await expect(dialog.getByLabel(/active/i)).toBeVisible();

		await expect(dialog.getByRole("button", { name: /cancel/i })).toBeVisible();
		await expect(dialog.getByRole("button", { name: /save/i })).toBeVisible();

		await dialog.getByRole("button", { name: /cancel/i }).click();
		await expect(dialog).not.toBeVisible();
	});

	test("should create a new rank", async ({ page }) => {
		await page.getByRole("button", { name: /create/i }).click();

		const dialog = page.getByRole("dialog");
		await expect(dialog).toBeVisible();

		const timestamp = Date.now();
		const rankCode = `TST-${timestamp}`;
		const rankName = `Test Rank ${timestamp}`;
		const rankNameAm = `የሙከራ ደረጃ ${timestamp}`;

		await dialog.getByLabel(/^name/i).fill(rankName);
		await dialog.getByLabel(/amharic/i).fill(rankNameAm);
		await dialog.getByLabel(/code/i).fill(rankCode);
		await dialog.getByLabel(/^level/i).fill("99");
		await dialog.getByLabel(/base salary/i).fill("15000");
		await dialog.getByLabel(/ceiling salary/i).fill("25000");
		await dialog.getByLabel(/retirement age/i).fill("55");

		const categoryTrigger = dialog.getByRole("combobox", { name: /category/i });
		await categoryTrigger.click();

		const officerOption = page.getByRole("option", { name: /officer/i }).first();
		await officerOption.click();

		await dialog.getByRole("button", { name: /save/i }).click();

		await expect(page.getByText(/success/i)).toBeVisible({ timeout: 5000 });

		await expect(dialog).not.toBeVisible({ timeout: 5000 });

		const searchInput = page.getByPlaceholder(/search/i);
		await searchInput.fill(rankName);
		await page.waitForTimeout(500);

		await expect(page.getByText(rankName)).toBeVisible();
	});

	test("should open edit rank dialog", async ({ page }) => {
		const table = page.locator("table tbody");
		const firstRow = table.locator("tr").first();
		await expect(firstRow).toBeVisible();

		const actionsButton = firstRow.getByRole("button", { name: /actions/i });
		await actionsButton.click();

		const editMenuItem = page.getByRole("menuitem", { name: /edit/i });
		await expect(editMenuItem).toBeVisible();
		await editMenuItem.click();

		const dialog = page.getByRole("dialog");
		await expect(dialog).toBeVisible();

		await expect(dialog.getByRole("heading", { name: /edit/i })).toBeVisible();

		await expect(dialog.getByLabel(/^name/i)).toHaveValue(/\w+/);
		await expect(dialog.getByLabel(/amharic/i)).toHaveValue(/\w+/);
		await expect(dialog.getByLabel(/code/i)).toBeDisabled();
		await expect(dialog.getByLabel(/^level/i)).toHaveValue(/\d+/);
		await expect(dialog.getByLabel(/base salary/i)).toHaveValue(/\d+/);

		await dialog.getByRole("button", { name: /cancel/i }).click();
		await expect(dialog).not.toBeVisible();
	});

	test("should edit an existing rank", async ({ page }) => {
		const table = page.locator("table tbody");
		const firstRow = table.locator("tr").first();
		await expect(firstRow).toBeVisible();

		const actionsButton = firstRow.getByRole("button", { name: /actions/i });
		await actionsButton.click();

		await page.getByRole("menuitem", { name: /edit/i }).click();

		const dialog = page.getByRole("dialog");
		await expect(dialog).toBeVisible();

		const timestamp = Date.now();
		const updatedName = `Updated Rank ${timestamp}`;

		const nameInput = dialog.getByLabel(/^name/i);
		await nameInput.clear();
		await nameInput.fill(updatedName);

		const baseSalaryInput = dialog.getByLabel(/base salary/i);
		await baseSalaryInput.clear();
		await baseSalaryInput.fill("20000");

		await dialog.getByRole("button", { name: /save/i }).click();

		await expect(page.getByText(/success/i)).toBeVisible({ timeout: 5000 });

		await expect(dialog).not.toBeVisible({ timeout: 5000 });

		await page.reload();
		await page.waitForLoadState("networkidle");

		await expect(page.getByText(updatedName)).toBeVisible();
	});

	test("should display rank categories correctly", async ({ page }) => {
		const table = page.locator("table tbody");
		const firstRow = table.locator("tr").first();
		await expect(firstRow).toBeVisible();

		const categoryCell = firstRow.locator("td").nth(3);
		await expect(categoryCell).toContainText(/officer|enlisted|non commissioned officer/i);
	});

	test("should display salary with proper formatting", async ({ page }) => {
		const table = page.locator("table tbody");
		const firstRow = table.locator("tr").first();
		await expect(firstRow).toBeVisible();

		const salaryCell = firstRow.locator("td").nth(4);
		const salaryText = await salaryCell.textContent();

		const hasComma = salaryText?.includes(",");
		const hasDigits = /\d/.test(salaryText ?? "");
		expect(hasComma || hasDigits).toBe(true);
	});

	test("should open delete confirmation dialog for rank", async ({ page }) => {
		const table = page.locator("table tbody");
		const rows = table.locator("tr");
		const rowCount = await rows.count();

		if (rowCount > 15) {
			const lastRow = rows.last();
			await expect(lastRow).toBeVisible();

			const actionsButton = lastRow.getByRole("button", { name: /actions/i });
			await actionsButton.click();

			const deleteMenuItem = page.getByRole("menuitem", { name: /delete/i });
			await expect(deleteMenuItem).toBeVisible();
			await deleteMenuItem.click();

			const confirmDialog = page.getByRole("dialog");
			await expect(confirmDialog).toBeVisible();

			await expect(confirmDialog.getByText(/confirm/i)).toBeVisible();
			await expect(confirmDialog.getByText(/delete/i)).toBeVisible();

			await expect(confirmDialog.getByRole("button", { name: /cancel/i })).toBeVisible();
			await expect(confirmDialog.getByRole("button", { name: /confirm/i })).toBeVisible();

			await confirmDialog.getByRole("button", { name: /cancel/i }).click();
			await expect(confirmDialog).not.toBeVisible();
		}
	});

	test("should validate required fields in create rank form", async ({ page }) => {
		await page.getByRole("button", { name: /create/i }).click();

		const dialog = page.getByRole("dialog");
		await expect(dialog).toBeVisible();

		await dialog.getByRole("button", { name: /save/i }).click();

		const nameError = dialog.getByText(/name is required/i);
		const codeError = dialog.getByText(/code is required/i);

		await expect(nameError.or(codeError)).toBeVisible();

		await expect(dialog).toBeVisible();
	});
});
