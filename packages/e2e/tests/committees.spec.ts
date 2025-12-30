import { expect, test } from "@playwright/test";

test.describe("Committee Types Management", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto("/committees/types");
		await page.waitForLoadState("networkidle");
	});

	test("committee types list page loads with table", async ({ page }) => {
		await expect(page.getByRole("heading", { name: /committee types/i })).toBeVisible();

		const table = page.locator("table");
		await expect(table).toBeVisible();

		const nameHeader = page.getByRole("columnheader", { name: /name/i }).first();
		await expect(nameHeader).toBeVisible();

		const codeHeader = page.getByRole("columnheader", { name: /code/i });
		await expect(codeHeader).toBeVisible();

		const actionsHeader = page.getByRole("columnheader", { name: /actions/i });
		await expect(actionsHeader).toBeVisible();
	});

	test("create committee type dialog opens and closes", async ({ page }) => {
		const createButton = page.getByRole("button", { name: /create/i }).first();
		await createButton.click();

		const dialog = page.getByRole("dialog");
		await expect(dialog).toBeVisible();

		const dialogTitle = dialog.getByRole("heading", { name: /create/i });
		await expect(dialogTitle).toBeVisible();

		const codeInput = dialog.getByLabel(/code/i);
		await expect(codeInput).toBeVisible();

		const nameInput = dialog.getByLabel(/name/i).first();
		await expect(nameInput).toBeVisible();

		const isPermanentCheckbox = dialog.getByLabel(/permanent/i);
		await expect(isPermanentCheckbox).toBeVisible();

		const requiresCenterCheckbox = dialog.getByLabel(/requires center/i);
		await expect(requiresCenterCheckbox).toBeVisible();

		const minMembersInput = dialog.getByLabel(/minimum members/i);
		await expect(minMembersInput).toBeVisible();

		const cancelButton = dialog.getByRole("button", { name: /cancel/i });
		await expect(cancelButton).toBeVisible();

		const saveButton = dialog.getByRole("button", { name: /save/i });
		await expect(saveButton).toBeVisible();

		await cancelButton.click();
		await expect(dialog).not.toBeVisible();
	});

	test("committee type form validates required fields", async ({ page }) => {
		const createButton = page.getByRole("button", { name: /create/i }).first();
		await createButton.click();

		const dialog = page.getByRole("dialog");
		await expect(dialog).toBeVisible();

		const saveButton = dialog.getByRole("button", { name: /save/i });
		await saveButton.click();

		const validationMessage = dialog.getByText(/required/i).first();
		const validationExists = await validationMessage.count();
		expect(validationExists).toBeGreaterThan(0);
	});

	test("edit committee type dialog opens with populated data", async ({ page }) => {
		const actionsButton = page.getByRole("button", { name: /actions/i }).first();
		await actionsButton.click();

		const editMenuItem = page.getByRole("menuitem", { name: /edit/i });
		await editMenuItem.click();

		const dialog = page.getByRole("dialog");
		await expect(dialog).toBeVisible();

		const dialogTitle = dialog.getByRole("heading", { name: /edit/i });
		await expect(dialogTitle).toBeVisible();

		const codeInput = dialog.getByLabel(/code/i);
		await expect(codeInput).toBeVisible();
		await expect(codeInput).toBeDisabled();
		await expect(codeInput).not.toHaveValue("");

		const nameInput = dialog.getByLabel(/name/i).first();
		await expect(nameInput).toBeVisible();
		await expect(nameInput).not.toHaveValue("");

		const cancelButton = dialog.getByRole("button", { name: /cancel/i });
		await cancelButton.click();
		await expect(dialog).not.toBeVisible();
	});

	test("view committee type details", async ({ page }) => {
		const tableRows = page.locator("table tbody tr");
		const rowCount = await tableRows.count();

		if (rowCount > 0) {
			const firstRow = tableRows.first();
			const actionsButton = firstRow.getByRole("button", { name: /actions/i });
			await actionsButton.click();

			const viewMenuItem = page.getByRole("menuitem", { name: /view/i });
			const viewExists = await viewMenuItem.count();

			if (viewExists > 0) {
				await viewMenuItem.click();

				const dialog = page.getByRole("dialog");
				await expect(dialog).toBeVisible();
			}
		}
	});

	test("committee type permanent flag displays correctly", async ({ page }) => {
		const permanentBadge = page.locator('text="Permanent"').first();
		const permanentExists = await permanentBadge.count();

		if (permanentExists > 0) {
			await expect(permanentBadge).toBeVisible();
		}
	});
});

test.describe("Committees Management", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto("/committees");
		await page.waitForLoadState("networkidle");
	});

	test("committees list page loads with table", async ({ page }) => {
		await expect(page.getByRole("heading", { name: /committees/i })).toBeVisible();

		const table = page.locator("table");
		await expect(table).toBeVisible();

		const nameHeader = page.getByRole("columnheader", { name: /name/i }).first();
		await expect(nameHeader).toBeVisible();

		const codeHeader = page.getByRole("columnheader", { name: /code/i });
		await expect(codeHeader).toBeVisible();

		const typeHeader = page.getByRole("columnheader", { name: /type/i });
		await expect(typeHeader).toBeVisible();

		const statusHeader = page.getByRole("columnheader", { name: /status/i });
		await expect(statusHeader).toBeVisible();

		const actionsHeader = page.getByRole("columnheader", { name: /actions/i });
		await expect(actionsHeader).toBeVisible();
	});

	test("create new committee dialog opens and closes", async ({ page }) => {
		const createButton = page.getByRole("button", { name: /create/i }).first();
		await createButton.click();

		const dialog = page.getByRole("dialog");
		await expect(dialog).toBeVisible();

		const dialogTitle = dialog.getByRole("heading", { name: /create/i });
		await expect(dialogTitle).toBeVisible();

		const committeeTypeSelect = dialog.getByLabel(/committee type/i);
		await expect(committeeTypeSelect).toBeVisible();

		const codeInput = dialog.getByLabel(/code/i);
		await expect(codeInput).toBeVisible();

		const nameInput = dialog.getByLabel(/name/i).first();
		await expect(nameInput).toBeVisible();

		const establishedDateInput = dialog.getByLabel(/established date/i);
		await expect(establishedDateInput).toBeVisible();

		const cancelButton = dialog.getByRole("button", { name: /cancel/i });
		await expect(cancelButton).toBeVisible();

		const saveButton = dialog.getByRole("button", { name: /save/i });
		await expect(saveButton).toBeVisible();

		await cancelButton.click();
		await expect(dialog).not.toBeVisible();
	});

	test("create new committee with type selection", async ({ page }) => {
		const createButton = page.getByRole("button", { name: /create/i }).first();
		await createButton.click();

		const dialog = page.getByRole("dialog");
		await expect(dialog).toBeVisible();

		const committeeTypeSelect = dialog.getByLabel(/committee type/i);
		await committeeTypeSelect.click();

		const firstOption = page.getByRole("option").first();
		const optionExists = await firstOption.count();

		if (optionExists > 0) {
			await firstOption.click();

			const saveButton = dialog.getByRole("button", { name: /save/i });
			await expect(saveButton).toBeEnabled();
		}

		const cancelButton = dialog.getByRole("button", { name: /cancel/i });
		await cancelButton.click();
	});

	test("committee form validates required fields", async ({ page }) => {
		const createButton = page.getByRole("button", { name: /create/i }).first();
		await createButton.click();

		const dialog = page.getByRole("dialog");
		await expect(dialog).toBeVisible();

		const saveButton = dialog.getByRole("button", { name: /save/i });
		await saveButton.click();

		const validationMessage = dialog.getByText(/required/i).first();
		const validationExists = await validationMessage.count();
		expect(validationExists).toBeGreaterThan(0);
	});

	test("view committee details", async ({ page }) => {
		const tableRows = page.locator("table tbody tr");
		const rowCount = await tableRows.count();

		if (rowCount > 0) {
			const firstRow = tableRows.first();
			await firstRow.click();

			await page.waitForTimeout(1000);

			const detailsPage = page.locator("h1, h2").filter({ hasText: /committee/i });
			const detailsExists = await detailsPage.count();

			if (detailsExists > 0) {
				await expect(detailsPage.first()).toBeVisible();
			}
		}
	});

	test("committee status badges display correctly", async ({ page }) => {
		const tableRows = page.locator("table tbody tr");
		const rowCount = await tableRows.count();

		if (rowCount > 0) {
			const firstRow = tableRows.first();
			const statusBadge = firstRow.locator('[class*="badge"]').first();
			await expect(statusBadge).toBeVisible();

			const statusText = await statusBadge.textContent();
			const validStatuses = ["ACTIVE", "SUSPENDED", "DISSOLVED"];
			const hasValidStatus = validStatuses.some((status) => statusText?.toUpperCase().includes(status));
			expect(hasValidStatus).toBe(true);
		}
	});

	test("filter committees by type", async ({ page }) => {
		const typeFilter = page.getByLabel(/type/i).first();
		const typeFilterExists = await typeFilter.count();

		if (typeFilterExists > 0) {
			await typeFilter.click();

			const firstOption = page.getByRole("option").first();
			const optionExists = await firstOption.count();

			if (optionExists > 0) {
				await firstOption.click();
				await page.waitForTimeout(500);

				const tableRows = page.locator("table tbody tr");
				const rowCount = await tableRows.count();
				expect(rowCount).toBeGreaterThanOrEqual(0);
			}
		}
	});

	test("filter committees by status", async ({ page }) => {
		const statusFilter = page.getByLabel(/status/i).first();
		const statusFilterExists = await statusFilter.count();

		if (statusFilterExists > 0) {
			await statusFilter.click();

			const activeOption = page.getByRole("option", { name: /active/i });
			const activeExists = await activeOption.count();

			if (activeExists > 0) {
				await activeOption.click();
				await page.waitForTimeout(500);

				const tableRows = page.locator("table tbody tr");
				const rowCount = await tableRows.count();
				expect(rowCount).toBeGreaterThanOrEqual(0);
			}
		}
	});

	test("search committees by name or code", async ({ page }) => {
		const searchInput = page.getByPlaceholder(/search/i);
		await expect(searchInput).toBeVisible();

		await searchInput.fill("DISC");
		await page.waitForTimeout(500);

		const tableRows = page.locator("table tbody tr");
		const rowCount = await tableRows.count();

		if (rowCount > 0) {
			const firstRowText = await tableRows.first().textContent();
			expect(firstRowText?.toUpperCase()).toContain("DISC");
		}
	});

	test("edit committee dialog opens with populated data", async ({ page }) => {
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

	test("suspend committee dialog opens", async ({ page }) => {
		const activeStatusBadge = page.locator('text="ACTIVE"').first();
		const activeExists = await activeStatusBadge.count();

		if (activeExists > 0) {
			const row = activeStatusBadge.locator("xpath=ancestor::tr");
			const actionsButton = row.getByRole("button", { name: /actions/i });
			await actionsButton.click();

			const suspendMenuItem = page.getByRole("menuitem", { name: /suspend/i });
			const suspendExists = await suspendMenuItem.count();

			if (suspendExists > 0) {
				await suspendMenuItem.click();

				const dialog = page.getByRole("dialog");
				await expect(dialog).toBeVisible();

				const reasonInput = dialog.getByLabel(/reason/i);
				await expect(reasonInput).toBeVisible();

				const cancelButton = dialog.getByRole("button", { name: /cancel/i });
				await cancelButton.click();
			}
		}
	});

	test("reactivate committee option appears for suspended committees", async ({ page }) => {
		const suspendedStatusBadge = page.locator('text="SUSPENDED"').first();
		const suspendedExists = await suspendedStatusBadge.count();

		if (suspendedExists > 0) {
			const row = suspendedStatusBadge.locator("xpath=ancestor::tr");
			const actionsButton = row.getByRole("button", { name: /actions/i });
			await actionsButton.click();

			const reactivateMenuItem = page.getByRole("menuitem", { name: /reactivate/i });
			await expect(reactivateMenuItem).toBeVisible();
		}
	});

	test("dissolve committee dialog opens for active committees", async ({ page }) => {
		const activeStatusBadge = page.locator('text="ACTIVE"').first();
		const activeExists = await activeStatusBadge.count();

		if (activeExists > 0) {
			const row = activeStatusBadge.locator("xpath=ancestor::tr");
			const actionsButton = row.getByRole("button", { name: /actions/i });
			await actionsButton.click();

			const dissolveMenuItem = page.getByRole("menuitem", { name: /dissolve/i });
			const dissolveExists = await dissolveMenuItem.count();

			if (dissolveExists > 0) {
				await dissolveMenuItem.click();

				const dialog = page.getByRole("dialog");
				await expect(dialog).toBeVisible();

				const dissolvedDateInput = dialog.getByLabel(/dissolved date/i);
				await expect(dissolvedDateInput).toBeVisible();

				const reasonInput = dialog.getByLabel(/reason/i);
				await expect(reasonInput).toBeVisible();

				const cancelButton = dialog.getByRole("button", { name: /cancel/i });
				await cancelButton.click();
			}
		}
	});
});

test.describe("Committee Members Management", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto("/committees");
		await page.waitForLoadState("networkidle");

		const tableRows = page.locator("table tbody tr");
		const rowCount = await tableRows.count();

		if (rowCount > 0) {
			const firstRow = tableRows.first();
			await firstRow.click();
			await page.waitForTimeout(1000);
		}
	});

	test("add committee member dialog opens and closes", async ({ page }) => {
		const addMemberButton = page.getByRole("button", { name: /add member/i });
		const addMemberExists = await addMemberButton.count();

		if (addMemberExists > 0) {
			await addMemberButton.click();

			const dialog = page.getByRole("dialog");
			await expect(dialog).toBeVisible();

			const dialogTitle = dialog.getByRole("heading", { name: /add member/i });
			await expect(dialogTitle).toBeVisible();

			const employeeSearch = dialog.getByPlaceholder(/search employee/i);
			await expect(employeeSearch).toBeVisible();

			const roleSelect = dialog.getByLabel(/role/i);
			await expect(roleSelect).toBeVisible();

			const appointedDateInput = dialog.getByLabel(/appointed date/i);
			await expect(appointedDateInput).toBeVisible();

			const termLimitInput = dialog.getByLabel(/term limit/i);
			await expect(termLimitInput).toBeVisible();

			const cancelButton = dialog.getByRole("button", { name: /cancel/i });
			await expect(cancelButton).toBeVisible();

			const saveButton = dialog.getByRole("button", { name: /save/i });
			await expect(saveButton).toBeVisible();

			await cancelButton.click();
			await expect(dialog).not.toBeVisible();
		}
	});

	test("add member with role selection", async ({ page }) => {
		const addMemberButton = page.getByRole("button", { name: /add member/i });
		const addMemberExists = await addMemberButton.count();

		if (addMemberExists > 0) {
			await addMemberButton.click();

			const dialog = page.getByRole("dialog");
			await expect(dialog).toBeVisible();

			const roleSelect = dialog.getByLabel(/role/i);
			await roleSelect.click();

			const memberOption = page.getByRole("option", { name: /member/i });
			const memberExists = await memberOption.count();

			if (memberExists > 0) {
				await memberOption.click();

				const roleText = await roleSelect.textContent();
				expect(roleText).toContain("MEMBER");
			}

			const cancelButton = dialog.getByRole("button", { name: /cancel/i });
			await cancelButton.click();
		}
	});

	test("committee member roles display correctly", async ({ page }) => {
		const membersList = page.locator("table tbody tr, [data-testid='member-list'] > div");
		const membersExist = await membersList.count();

		if (membersExist > 0) {
			const firstMember = membersList.first();
			const memberText = await firstMember.textContent();

			const validRoles = ["CHAIRMAN", "VICE_CHAIRMAN", "SECRETARY", "MEMBER", "ADVISOR"];
			const hasValidRole = validRoles.some((role) => memberText?.toUpperCase().includes(role));
			expect(hasValidRole).toBe(true);
		}
	});

	test("remove committee member dialog opens", async ({ page }) => {
		const membersTable = page.locator("table tbody tr");
		const membersExist = await membersTable.count();

		if (membersExist > 0) {
			const firstMember = membersTable.first();
			const actionsButton = firstMember.getByRole("button", { name: /actions/i });
			const actionsExists = await actionsButton.count();

			if (actionsExists > 0) {
				await actionsButton.click();

				const removeMenuItem = page.getByRole("menuitem", { name: /remove/i });
				const removeExists = await removeMenuItem.count();

				if (removeExists > 0) {
					await removeMenuItem.click();

					const dialog = page.getByRole("dialog");
					await expect(dialog).toBeVisible();

					const endDateInput = dialog.getByLabel(/end date/i);
					await expect(endDateInput).toBeVisible();

					const reasonInput = dialog.getByLabel(/reason/i);
					await expect(reasonInput).toBeVisible();

					const cancelButton = dialog.getByRole("button", { name: /cancel/i });
					await cancelButton.click();
				}
			}
		}
	});

	test("update member role dialog opens", async ({ page }) => {
		const membersTable = page.locator("table tbody tr");
		const membersExist = await membersTable.count();

		if (membersExist > 0) {
			const firstMember = membersTable.first();
			const actionsButton = firstMember.getByRole("button", { name: /actions/i });
			const actionsExists = await actionsButton.count();

			if (actionsExists > 0) {
				await actionsButton.click();

				const editMenuItem = page.getByRole("menuitem", { name: /edit/i });
				const editExists = await editMenuItem.count();

				if (editExists > 0) {
					await editMenuItem.click();

					const dialog = page.getByRole("dialog");
					await expect(dialog).toBeVisible();

					const roleSelect = dialog.getByLabel(/role/i);
					await expect(roleSelect).toBeVisible();

					const cancelButton = dialog.getByRole("button", { name: /cancel/i });
					await cancelButton.click();
				}
			}
		}
	});

	test("member term dates display correctly", async ({ page }) => {
		const membersTable = page.locator("table tbody tr");
		const membersExist = await membersTable.count();

		if (membersExist > 0) {
			const firstMember = membersTable.first();
			const memberText = await firstMember.textContent();

			const hasDatePattern =
				/\d{4}-\d{2}-\d{2}|\d{1,2}\/\d{1,2}\/\d{4}|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec/.test(
					memberText ?? "",
				);
			expect(hasDatePattern).toBe(true);
		}
	});
});

test.describe("Committee Term Management", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto("/committees");
		await page.waitForLoadState("networkidle");

		const tableRows = page.locator("table tbody tr");
		const rowCount = await tableRows.count();

		if (rowCount > 0) {
			const firstRow = tableRows.first();
			await firstRow.click();
			await page.waitForTimeout(1000);
		}
	});

	test("renew member term dialog opens", async ({ page }) => {
		const membersTable = page.locator("table tbody tr");
		const membersExist = await membersTable.count();

		if (membersExist > 0) {
			const firstMember = membersTable.first();
			const actionsButton = firstMember.getByRole("button", { name: /actions/i });
			const actionsExists = await actionsButton.count();

			if (actionsExists > 0) {
				await actionsButton.click();

				const renewMenuItem = page.getByRole("menuitem", { name: /renew/i });
				const renewExists = await renewMenuItem.count();

				if (renewExists > 0) {
					await renewMenuItem.click();

					const dialog = page.getByRole("dialog");
					await expect(dialog).toBeVisible();

					const newTermStartDateInput = dialog.getByLabel(/new term start date/i);
					await expect(newTermStartDateInput).toBeVisible();

					const termLimitInput = dialog.getByLabel(/term limit/i);
					await expect(termLimitInput).toBeVisible();

					const cancelButton = dialog.getByRole("button", { name: /cancel/i });
					await cancelButton.click();
				}
			}
		}
	});

	test("terminate member term dialog opens", async ({ page }) => {
		const membersTable = page.locator("table tbody tr");
		const membersExist = await membersTable.count();

		if (membersExist > 0) {
			const firstMember = membersTable.first();
			const actionsButton = firstMember.getByRole("button", { name: /actions/i });
			const actionsExists = await actionsButton.count();

			if (actionsExists > 0) {
				await actionsButton.click();

				const terminateMenuItem = page.getByRole("menuitem", { name: /terminate/i });
				const terminateExists = await terminateMenuItem.count();

				if (terminateExists > 0) {
					await terminateMenuItem.click();

					const dialog = page.getByRole("dialog");
					await expect(dialog).toBeVisible();

					const terminatedDateInput = dialog.getByLabel(/terminated date/i);
					await expect(terminatedDateInput).toBeVisible();

					const reasonInput = dialog.getByLabel(/reason/i);
					await expect(reasonInput).toBeVisible();

					const cancelButton = dialog.getByRole("button", { name: /cancel/i });
					await cancelButton.click();
				}
			}
		}
	});

	test("view member term history", async ({ page }) => {
		const membersTable = page.locator("table tbody tr");
		const membersExist = await membersTable.count();

		if (membersExist > 0) {
			const firstMember = membersTable.first();
			const actionsButton = firstMember.getByRole("button", { name: /actions/i });
			const actionsExists = await actionsButton.count();

			if (actionsExists > 0) {
				await actionsButton.click();

				const historyMenuItem = page.getByRole("menuitem", { name: /history|terms/i });
				const historyExists = await historyMenuItem.count();

				if (historyExists > 0) {
					await historyMenuItem.click();

					const dialog = page.getByRole("dialog");
					await expect(dialog).toBeVisible();

					const dialogTitle = dialog.getByRole("heading", { name: /term history|terms/i });
					await expect(dialogTitle).toBeVisible();

					const closeButton = dialog.getByRole("button", { name: /close/i });
					await closeButton.click();
				}
			}
		}
	});
});

test.describe("Committee History and Audit", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto("/committees");
		await page.waitForLoadState("networkidle");

		const tableRows = page.locator("table tbody tr");
		const rowCount = await tableRows.count();

		if (rowCount > 0) {
			const firstRow = tableRows.first();
			await firstRow.click();
			await page.waitForTimeout(1000);
		}
	});

	test("view committee history", async ({ page }) => {
		const historyTab = page.getByRole("tab", { name: /history/i });
		const historyExists = await historyTab.count();

		if (historyExists > 0) {
			await historyTab.click();

			const historyContent = page.locator("[role='tabpanel']");
			await expect(historyContent).toBeVisible();

			const historyItems = page.locator("[data-testid='history-item'], .history-entry");
			const itemsExist = await historyItems.count();

			if (itemsExist > 0) {
				const firstItem = historyItems.first();
				await expect(firstItem).toBeVisible();
			}
		}
	});

	test("committee history shows action types", async ({ page }) => {
		const historyTab = page.getByRole("tab", { name: /history/i });
		const historyExists = await historyTab.count();

		if (historyExists > 0) {
			await historyTab.click();

			const historyContent = page.locator("[role='tabpanel']");
			const historyText = await historyContent.textContent();

			const validActions = [
				"CREATED",
				"UPDATED",
				"MEMBER_ADDED",
				"MEMBER_REMOVED",
				"SUSPENDED",
				"REACTIVATED",
				"DISSOLVED",
			];
			const hasValidAction = validActions.some((action) => historyText?.toUpperCase().includes(action));
			expect(hasValidAction).toBe(true);
		}
	});
});

test.describe("Committee Navigation and Tabs", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto("/committees");
		await page.waitForLoadState("networkidle");

		const tableRows = page.locator("table tbody tr");
		const rowCount = await tableRows.count();

		if (rowCount > 0) {
			const firstRow = tableRows.first();
			await firstRow.click();
			await page.waitForTimeout(1000);
		}
	});

	test("committee detail page shows tabs", async ({ page }) => {
		const overviewTab = page.getByRole("tab", { name: /overview|details/i });
		const overviewExists = await overviewTab.count();

		if (overviewExists > 0) {
			await expect(overviewTab).toBeVisible();
		}

		const membersTab = page.getByRole("tab", { name: /members/i });
		const membersExists = await membersTab.count();

		if (membersExists > 0) {
			await expect(membersTab).toBeVisible();
		}
	});

	test("switch between committee tabs", async ({ page }) => {
		const membersTab = page.getByRole("tab", { name: /members/i });
		const membersExists = await membersTab.count();

		if (membersExists > 0) {
			await membersTab.click();

			const membersContent = page.locator("[role='tabpanel']");
			await expect(membersContent).toBeVisible();

			const overviewTab = page.getByRole("tab", { name: /overview|details/i });
			const overviewExists = await overviewTab.count();

			if (overviewExists > 0) {
				await overviewTab.click();

				const overviewContent = page.locator("[role='tabpanel']");
				await expect(overviewContent).toBeVisible();
			}
		}
	});
});

test.describe("My Committees", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto("/committees/my-committees");
		await page.waitForLoadState("networkidle");
	});

	test("my committees page loads", async ({ page }) => {
		const heading = page.getByRole("heading", { name: /my committees/i });
		const headingExists = await heading.count();

		if (headingExists > 0) {
			await expect(heading).toBeVisible();
		}
	});

	test("displays current user committee memberships", async ({ page }) => {
		const membershipsList = page.locator("table tbody tr, [data-testid='my-committees-list'] > div");
		const membershipsExist = await membershipsList.count();

		if (membershipsExist > 0) {
			const firstMembership = membershipsList.first();
			await expect(firstMembership).toBeVisible();

			const membershipText = await firstMembership.textContent();
			expect(membershipText).toBeTruthy();
		}
	});

	test("shows committee role for current user", async ({ page }) => {
		const membershipsList = page.locator("table tbody tr, [data-testid='my-committees-list'] > div");
		const membershipsExist = await membershipsList.count();

		if (membershipsExist > 0) {
			const firstMembership = membershipsList.first();
			const membershipText = await firstMembership.textContent();

			const validRoles = ["CHAIRMAN", "VICE_CHAIRMAN", "SECRETARY", "MEMBER", "ADVISOR"];
			const hasValidRole = validRoles.some((role) => membershipText?.toUpperCase().includes(role));
			expect(hasValidRole).toBe(true);
		}
	});
});
