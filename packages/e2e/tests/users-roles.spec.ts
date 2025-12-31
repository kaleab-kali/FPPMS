import { expect, test } from "@playwright/test";

test.describe("Users Management", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto("/users");
		await page.waitForLoadState("networkidle");
	});

	test("users list page loads with table", async ({ page }) => {
		await expect(page.getByRole("heading", { name: /users/i })).toBeVisible();

		const table = page.locator("table");
		await expect(table).toBeVisible();

		const usernameHeader = page.getByRole("columnheader", { name: /username/i });
		await expect(usernameHeader).toBeVisible();

		const emailHeader = page.getByRole("columnheader", { name: /email/i });
		await expect(emailHeader).toBeVisible();

		const rolesHeader = page.getByRole("columnheader", { name: /roles/i });
		await expect(rolesHeader).toBeVisible();

		const statusHeader = page.getByRole("columnheader", { name: /status/i });
		await expect(statusHeader).toBeVisible();

		const actionsHeader = page.getByRole("columnheader", { name: /actions/i });
		await expect(actionsHeader).toBeVisible();
	});

	test("create new user dialog opens and closes", async ({ page }) => {
		const createButton = page.getByRole("button", { name: /create/i }).first();
		await createButton.click();

		const dialog = page.getByRole("dialog");
		await expect(dialog).toBeVisible();

		const dialogTitle = dialog.getByRole("heading", { name: /create/i });
		await expect(dialogTitle).toBeVisible();

		const selectEmployeeLabel = dialog.getByText(/select employee/i);
		await expect(selectEmployeeLabel).toBeVisible();

		const centerLabel = dialog.getByText(/center/i);
		await expect(centerLabel).toBeVisible();

		const rolesLabel = dialog.getByText(/roles/i);
		await expect(rolesLabel).toBeVisible();

		const cancelButton = dialog.getByRole("button", { name: /cancel/i });
		await expect(cancelButton).toBeVisible();

		const saveButton = dialog.getByRole("button", { name: /save/i });
		await expect(saveButton).toBeVisible();
		await expect(saveButton).toBeDisabled();

		await cancelButton.click();
		await expect(dialog).not.toBeVisible();
	});

	test("create new user flow with employee selection", async ({ page }) => {
		const createButton = page.getByRole("button", { name: /create/i }).first();
		await createButton.click();

		const dialog = page.getByRole("dialog");
		await expect(dialog).toBeVisible();

		const employeeCombobox = dialog.getByRole("combobox");
		await employeeCombobox.click();

		const searchInput = page.getByPlaceholder(/search/i);
		await expect(searchInput).toBeVisible();
		await searchInput.fill("FPC");

		await page.waitForTimeout(500);

		const firstEmployee = page.getByRole("option").first();
		const employeeExists = await firstEmployee.count();

		if (employeeExists > 0) {
			await firstEmployee.click();

			const saveButton = dialog.getByRole("button", { name: /save/i });
			await expect(saveButton).toBeEnabled();
		}
	});

	test("edit user dialog opens with populated data", async ({ page }) => {
		const actionsButton = page.getByRole("button", { name: /actions/i }).first();
		await actionsButton.click();

		const editMenuItem = page.getByRole("menuitem", { name: /edit/i });
		await editMenuItem.click();

		const dialog = page.getByRole("dialog");
		await expect(dialog).toBeVisible();

		const dialogTitle = dialog.getByRole("heading", { name: /edit/i });
		await expect(dialogTitle).toBeVisible();

		const usernameInput = dialog.getByLabel(/username/i);
		await expect(usernameInput).toBeVisible();
		await expect(usernameInput).toBeDisabled();
		await expect(usernameInput).not.toHaveValue("");

		const statusSelect = dialog.getByRole("combobox").first();
		await expect(statusSelect).toBeVisible();

		const cancelButton = dialog.getByRole("button", { name: /cancel/i });
		await cancelButton.click();
		await expect(dialog).not.toBeVisible();
	});

	test("edit user email field", async ({ page }) => {
		const actionsButton = page.getByRole("button", { name: /actions/i }).first();
		await actionsButton.click();

		const editMenuItem = page.getByRole("menuitem", { name: /edit/i });
		await editMenuItem.click();

		const dialog = page.getByRole("dialog");
		await expect(dialog).toBeVisible();

		const emailInput = dialog.getByLabel(/email/i);
		await expect(emailInput).toBeVisible();

		await emailInput.clear();
		await emailInput.fill("test.user@example.com");

		await expect(emailInput).toHaveValue("test.user@example.com");

		const cancelButton = dialog.getByRole("button", { name: /cancel/i });
		await cancelButton.click();
	});

	test("reset password dialog opens and confirms", async ({ page }) => {
		const actionsButton = page.getByRole("button", { name: /actions/i }).first();
		await actionsButton.click();

		const resetMenuItem = page.getByRole("menuitem", { name: /reset password/i });
		await resetMenuItem.click();

		const confirmDialog = page.getByRole("dialog");
		await expect(confirmDialog).toBeVisible();

		const confirmTitle = confirmDialog.getByRole("heading", { name: /reset password/i });
		await expect(confirmTitle).toBeVisible();

		const cancelButton = confirmDialog.getByRole("button", { name: /cancel/i });
		await expect(cancelButton).toBeVisible();

		const confirmButton = confirmDialog.getByRole("button", { name: /confirm/i });
		await expect(confirmButton).toBeVisible();

		await cancelButton.click();
		await expect(confirmDialog).not.toBeVisible();
	});

	test("unlock user option appears for locked users", async ({ page }) => {
		const statusBadge = page.locator('text="LOCKED"').first();
		const statusBadgeExists = await statusBadge.count();

		if (statusBadgeExists > 0) {
			const row = statusBadge.locator("xpath=ancestor::tr");
			const actionsButton = row.getByRole("button", { name: /actions/i });
			await actionsButton.click();

			const unlockMenuItem = page.getByRole("menuitem", { name: /unlock/i });
			await expect(unlockMenuItem).toBeVisible();
		}
	});

	test("toggle user status dialog", async ({ page }) => {
		const actionsButton = page.getByRole("button", { name: /actions/i }).first();
		await actionsButton.click();

		const deactivateMenuItem = page.getByRole("menuitem", { name: /deactivate/i });
		const deactivateExists = await deactivateMenuItem.count();

		if (deactivateExists > 0) {
			await deactivateMenuItem.click();

			const dialog = page.getByRole("dialog");
			await expect(dialog).toBeVisible();

			const statusSelect = dialog.getByRole("combobox").first();
			await expect(statusSelect).toBeVisible();

			const reasonInput = dialog.getByLabel(/reason/i);
			await expect(reasonInput).toBeVisible();

			const cancelButton = dialog.getByRole("button", { name: /cancel/i });
			await cancelButton.click();
		}
	});

	test("reactivate user option appears for inactive users", async ({ page }) => {
		const statusBadge = page.locator('text="INACTIVE"').first();
		const statusBadgeExists = await statusBadge.count();

		if (statusBadgeExists > 0) {
			const row = statusBadge.locator("xpath=ancestor::tr");
			const actionsButton = row.getByRole("button", { name: /actions/i });
			await actionsButton.click();

			const reactivateMenuItem = page.getByRole("menuitem", { name: /reactivate/i });
			await expect(reactivateMenuItem).toBeVisible();
		}
	});

	test("search users by username", async ({ page }) => {
		const searchInput = page.getByPlaceholder(/search/i);
		await expect(searchInput).toBeVisible();

		await searchInput.fill("FPC");
		await page.waitForTimeout(500);

		const tableRows = page.locator("table tbody tr");
		const rowCount = await tableRows.count();

		if (rowCount > 0) {
			const firstRowText = await tableRows.first().textContent();
			expect(firstRowText?.toUpperCase()).toContain("FPC");
		}
	});

	test("user status badges display correctly", async ({ page }) => {
		const statusBadges = page.locator("table tbody tr").first().locator('[class*="badge"]');
		const badgeExists = await statusBadges.count();

		if (badgeExists > 0) {
			const badge = statusBadges.first();
			await expect(badge).toBeVisible();

			const badgeText = await badge.textContent();
			const validStatuses = ["ACTIVE", "INACTIVE", "LOCKED", "PENDING", "TRANSFERRED", "TERMINATED"];
			const hasValidStatus = validStatuses.some((status) => badgeText?.toUpperCase().includes(status));
			expect(hasValidStatus).toBe(true);
		}
	});

	test("roles display in user list", async ({ page }) => {
		const tableRows = page.locator("table tbody tr");
		const rowCount = await tableRows.count();

		if (rowCount > 0) {
			const firstRow = tableRows.first();
			const rolesCell = firstRow.locator("td").nth(2);
			await expect(rolesCell).toBeVisible();
		}
	});
});

test.describe("Roles Management", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto("/roles");
		await page.waitForLoadState("networkidle");
	});

	test("roles list page loads with table", async ({ page }) => {
		await expect(page.getByRole("heading", { name: /roles/i })).toBeVisible();

		const table = page.locator("table");
		await expect(table).toBeVisible();

		const nameHeader = page.getByRole("columnheader", { name: /name/i }).first();
		await expect(nameHeader).toBeVisible();

		const codeHeader = page.getByRole("columnheader", { name: /code/i });
		await expect(codeHeader).toBeVisible();

		const accessScopeHeader = page.getByRole("columnheader", { name: /access scope/i });
		await expect(accessScopeHeader).toBeVisible();

		const permissionsHeader = page.getByRole("columnheader", { name: /permissions/i });
		await expect(permissionsHeader).toBeVisible();

		const statusHeader = page.getByRole("columnheader", { name: /status/i });
		await expect(statusHeader).toBeVisible();

		const actionsHeader = page.getByRole("columnheader", { name: /actions/i });
		await expect(actionsHeader).toBeVisible();
	});

	test("system roles are displayed", async ({ page }) => {
		const systemBadge = page.locator('text="System"').first();
		await expect(systemBadge).toBeVisible();

		const tableRows = page.locator("table tbody tr");
		const rowCount = await tableRows.count();
		expect(rowCount).toBeGreaterThan(0);
	});

	test("role permissions count displays", async ({ page }) => {
		const permissionsCell = page.locator("table tbody tr").first().locator("td").nth(3);
		await expect(permissionsCell).toBeVisible();

		const permissionsText = await permissionsCell.textContent();
		expect(permissionsText).toMatch(/\d+/);
	});

	test("access scope badges display correctly", async ({ page }) => {
		const tableRows = page.locator("table tbody tr");
		const rowCount = await tableRows.count();

		if (rowCount > 0) {
			const firstRow = tableRows.first();
			const scopeBadge = firstRow.locator('[class*="badge"]').first();
			await expect(scopeBadge).toBeVisible();

			const scopeText = await scopeBadge.textContent();
			const validScopes = ["ALL_CENTERS", "OWN_CENTER", "OWN_DEPARTMENT", "OWN_RECORDS"];
			const hasValidScope = validScopes.some((scope) => scopeText?.toUpperCase().includes(scope));
			expect(hasValidScope).toBe(true);
		}
	});

	test("create custom role dialog opens", async ({ page }) => {
		const createButton = page.getByRole("button", { name: /create/i }).first();
		await createButton.click();

		const dialog = page.getByRole("dialog");
		await expect(dialog).toBeVisible();

		const dialogTitle = dialog.getByRole("heading", { name: /create/i });
		await expect(dialogTitle).toBeVisible();

		const nameInput = dialog.getByLabel(/name/i).first();
		await expect(nameInput).toBeVisible();

		const codeInput = dialog.getByLabel(/code/i);
		await expect(codeInput).toBeVisible();

		const descriptionInput = dialog.getByLabel(/description/i);
		await expect(descriptionInput).toBeVisible();

		const accessScopeSelect = dialog.getByRole("combobox").first();
		await expect(accessScopeSelect).toBeVisible();

		const cancelButton = dialog.getByRole("button", { name: /cancel/i });
		await cancelButton.click();
		await expect(dialog).not.toBeVisible();
	});

	test("edit role dialog opens with populated data", async ({ page }) => {
		const actionsButton = page.getByRole("button", { name: /actions/i }).first();
		await actionsButton.click();

		const editMenuItem = page.getByRole("menuitem", { name: /edit/i });
		await editMenuItem.click();

		const dialog = page.getByRole("dialog");
		await expect(dialog).toBeVisible();

		const dialogTitle = dialog.getByRole("heading", { name: /edit/i });
		await expect(dialogTitle).toBeVisible();

		const nameInput = dialog.getByLabel(/name/i).first();
		await expect(nameInput).toBeVisible();
		await expect(nameInput).not.toHaveValue("");

		const cancelButton = dialog.getByRole("button", { name: /cancel/i });
		await cancelButton.click();
		await expect(dialog).not.toBeVisible();
	});

	test("view role permissions in edit dialog", async ({ page }) => {
		const actionsButton = page.getByRole("button", { name: /actions/i }).first();
		await actionsButton.click();

		const editMenuItem = page.getByRole("menuitem", { name: /edit/i });
		await editMenuItem.click();

		const dialog = page.getByRole("dialog");
		await expect(dialog).toBeVisible();

		const permissionsLabel = dialog.getByText(/permissions/i).first();
		await expect(permissionsLabel).toBeVisible();

		const checkboxes = dialog.locator('input[type="checkbox"]');
		const checkboxCount = await checkboxes.count();
		expect(checkboxCount).toBeGreaterThan(0);

		const cancelButton = dialog.getByRole("button", { name: /cancel/i });
		await cancelButton.click();
	});

	test("system roles cannot be deleted", async ({ page }) => {
		const systemBadge = page.locator('text="System"').first();
		const systemBadgeExists = await systemBadge.count();

		if (systemBadgeExists > 0) {
			const row = systemBadge.locator("xpath=ancestor::tr");
			const actionsButton = row.getByRole("button", { name: /actions/i });
			await actionsButton.click();

			const deleteMenuItem = page.getByRole("menuitem", { name: /delete/i });
			await expect(deleteMenuItem).toBeVisible();
			await expect(deleteMenuItem).toBeDisabled();
		}
	});

	test("custom roles can be deleted", async ({ page }) => {
		const customBadge = page.locator('text="Custom"').first();
		const customBadgeExists = await customBadge.count();

		if (customBadgeExists > 0) {
			const row = customBadge.locator("xpath=ancestor::tr");
			const actionsButton = row.getByRole("button", { name: /actions/i });
			await actionsButton.click();

			const deleteMenuItem = page.getByRole("menuitem", { name: /delete/i });
			await expect(deleteMenuItem).toBeVisible();
			await expect(deleteMenuItem).toBeEnabled();

			await deleteMenuItem.click();

			const confirmDialog = page.getByRole("dialog");
			await expect(confirmDialog).toBeVisible();

			const cancelButton = confirmDialog.getByRole("button", { name: /cancel/i });
			await cancelButton.click();
		}
	});

	test("search roles by name", async ({ page }) => {
		const searchInput = page.getByPlaceholder(/search/i);
		await expect(searchInput).toBeVisible();

		await searchInput.fill("IT");
		await page.waitForTimeout(500);

		const tableRows = page.locator("table tbody tr");
		const rowCount = await tableRows.count();

		if (rowCount > 0) {
			const firstRowText = await tableRows.first().textContent();
			expect(firstRowText?.toUpperCase()).toContain("IT");
		}
	});

	test("role status badges display correctly", async ({ page }) => {
		const statusBadges = page.locator("table tbody tr").first().locator('[class*="badge"]').last();
		await expect(statusBadges).toBeVisible();

		const badgeText = await statusBadges.textContent();
		const validStatuses = ["ACTIVE", "INACTIVE"];
		const hasValidStatus = validStatuses.some((status) => badgeText?.toUpperCase().includes(status));
		expect(hasValidStatus).toBe(true);
	});

	test("role code displays as unique identifier", async ({ page }) => {
		const tableRows = page.locator("table tbody tr");
		const rowCount = await tableRows.count();

		if (rowCount > 0) {
			const firstRow = tableRows.first();
			const codeCell = firstRow.locator("td").nth(1);
			await expect(codeCell).toBeVisible();

			const codeText = await codeCell.textContent();
			expect(codeText).toBeTruthy();
			expect(codeText?.length).toBeGreaterThan(0);
		}
	});

	test("role form validates required fields", async ({ page }) => {
		const createButton = page.getByRole("button", { name: /create/i }).first();
		await createButton.click();

		const dialog = page.getByRole("dialog");
		await expect(dialog).toBeVisible();

		const saveButton = dialog.getByRole("button", { name: /save/i });
		await expect(saveButton).toBeVisible();

		await saveButton.click();

		const validationMessage = dialog.getByText(/required/i).first();
		const validationExists = await validationMessage.count();
		expect(validationExists).toBeGreaterThan(0);
	});

	test("access scope dropdown displays all options", async ({ page }) => {
		const createButton = page.getByRole("button", { name: /create/i }).first();
		await createButton.click();

		const dialog = page.getByRole("dialog");
		await expect(dialog).toBeVisible();

		const accessScopeSelect = dialog.getByRole("combobox").first();
		await accessScopeSelect.click();

		const options = page.getByRole("option");
		const optionCount = await options.count();
		expect(optionCount).toBeGreaterThan(0);

		const optionTexts = await options.allTextContents();
		const validScopes = ["ALL_CENTERS", "OWN_CENTER", "OWN_DEPARTMENT", "OWN_RECORDS"];
		const hasValidScopes = optionTexts.some((text) => validScopes.some((scope) => text.toUpperCase().includes(scope)));
		expect(hasValidScopes).toBe(true);
	});
});
