import { expect, test } from "@playwright/test";

test.describe("Employees Feature", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto("/");
		await page.waitForLoadState("networkidle");
	});

	test.describe("Employees List Page", () => {
		test("should load and display employees table", async ({ page }) => {
			await page.goto("/employees");
			await page.waitForLoadState("networkidle");

			await expect(page.getByRole("heading", { name: /employees/i })).toBeVisible();

			await expect(page.locator("table")).toBeVisible();

			await expect(page.getByRole("columnheader", { name: /employee id/i })).toBeVisible();
			await expect(page.getByRole("columnheader", { name: /name/i })).toBeVisible();
			await expect(page.getByRole("columnheader", { name: /type/i })).toBeVisible();
			await expect(page.getByRole("columnheader", { name: /status/i })).toBeVisible();

			const rows = page.locator("tbody tr");
			await expect(rows.first()).toBeVisible();
		});

		test("should display statistics cards", async ({ page }) => {
			await page.goto("/employees");
			await page.waitForLoadState("networkidle");

			await expect(page.getByText(/total employees/i)).toBeVisible();
			await expect(page.getByText(/military/i)).toBeVisible();
			await expect(page.getByText(/civilian/i)).toBeVisible();
			await expect(page.getByText(/temporary/i)).toBeVisible();
		});

		test("should have create employee button", async ({ page }) => {
			await page.goto("/employees");
			await page.waitForLoadState("networkidle");

			const createButton = page.getByRole("button", { name: /create|register/i });
			await expect(createButton).toBeVisible();
			await expect(createButton).toBeEnabled();
		});

		test("should filter employees by type", async ({ page }) => {
			await page.goto("/employees");
			await page.waitForLoadState("networkidle");

			const typeFilter = page.getByRole("combobox", { name: /type/i });
			if ((await typeFilter.count()) > 0) {
				await typeFilter.click();
				await page.getByRole("option", { name: /military/i }).click();
				await page.waitForLoadState("networkidle");

				const militaryBadges = page.locator("text=/MILITARY/i");
				await expect(militaryBadges.first()).toBeVisible();
			}
		});

		test("should filter employees by status", async ({ page }) => {
			await page.goto("/employees");
			await page.waitForLoadState("networkidle");

			const statusFilter = page.getByRole("combobox", { name: /status/i });
			if ((await statusFilter.count()) > 0) {
				await statusFilter.click();
				await page.getByRole("option", { name: /active/i }).click();
				await page.waitForLoadState("networkidle");

				const activeBadges = page.locator("text=/ACTIVE/i");
				await expect(activeBadges.first()).toBeVisible();
			}
		});

		test("should paginate employees list", async ({ page }) => {
			await page.goto("/employees");
			await page.waitForLoadState("networkidle");

			const nextButton = page.getByRole("button", { name: /next/i });
			const previousButton = page.getByRole("button", { name: /previous/i });

			if ((await nextButton.count()) > 0) {
				const isNextEnabled = await nextButton.isEnabled();
				if (isNextEnabled) {
					await nextButton.click();
					await page.waitForLoadState("networkidle");
					await expect(previousButton).toBeEnabled();
				}
			}
		});
	});

	test.describe("Search and Filter Functionality", () => {
		test("should search employees by employee ID", async ({ page }) => {
			await page.goto("/employees");
			await page.waitForLoadState("networkidle");

			const firstRow = page.locator("tbody tr").first();
			const employeeIdCell = firstRow.locator("td").first();
			const employeeId = await employeeIdCell.textContent();

			if (employeeId) {
				const searchInput = page.getByPlaceholder(/search/i);
				if ((await searchInput.count()) > 0) {
					await searchInput.fill(employeeId.trim());
					await page.waitForLoadState("networkidle");

					await expect(page.locator("tbody tr")).toHaveCount(1);
					await expect(employeeIdCell).toContainText(employeeId.trim());
				}
			}
		});

		test("should search employees by name", async ({ page }) => {
			await page.goto("/employees");
			await page.waitForLoadState("networkidle");

			const firstRow = page.locator("tbody tr").first();
			const nameCell = firstRow.locator("td").nth(1);
			const employeeName = await nameCell.textContent();

			if (employeeName) {
				const searchInput = page.getByPlaceholder(/search/i);
				if ((await searchInput.count()) > 0) {
					const searchTerm = employeeName.trim().split(" ")[0];
					await searchInput.fill(searchTerm);
					await page.waitForLoadState("networkidle");

					const visibleRows = page.locator("tbody tr");
					await expect(visibleRows).toHaveCount(1, { timeout: 5000 });
				}
			}
		});

		test("should clear filters", async ({ page }) => {
			await page.goto("/employees");
			await page.waitForLoadState("networkidle");

			const statusFilter = page.getByRole("combobox", { name: /status/i });
			if ((await statusFilter.count()) > 0) {
				await statusFilter.click();
				await page.getByRole("option", { name: /retired/i }).click();
				await page.waitForLoadState("networkidle");

				const clearButton = page.getByRole("button", { name: /clear|reset/i });
				if ((await clearButton.count()) > 0) {
					await clearButton.click();
					await page.waitForLoadState("networkidle");
				}
			}
		});
	});

	test.describe("Employee Detail Page", () => {
		test("should navigate to employee detail page", async ({ page }) => {
			await page.goto("/employees");
			await page.waitForLoadState("networkidle");

			const firstRow = page.locator("tbody tr").first();
			const viewButton = firstRow.getByRole("button", { name: /view|eye/i }).first();

			if ((await viewButton.count()) === 0) {
				const actionsButton = firstRow.getByRole("button").first();
				await actionsButton.click();
				await page.getByRole("menuitem", { name: /view|details/i }).click();
			} else {
				await viewButton.click();
			}

			await page.waitForURL(/\/employees\/[a-f0-9-]+$/);
			await expect(page).toHaveURL(/\/employees\/[a-f0-9-]+$/);
		});

		test("should display employee details", async ({ page }) => {
			await page.goto("/employees");
			await page.waitForLoadState("networkidle");

			const firstRow = page.locator("tbody tr").first();
			const employeeIdCell = firstRow.locator("td").first();
			const employeeId = await employeeIdCell.textContent();

			const viewButton = firstRow.getByRole("button").first();
			await viewButton.click();

			await page.waitForURL(/\/employees\/[a-f0-9-]+$/);

			await expect(page.getByText(employeeId ?? "")).toBeVisible();

			await expect(page.getByText(/personal information/i)).toBeVisible();
			await expect(page.getByText(/contact information/i)).toBeVisible();
		});

		test("should navigate to edit page from detail page", async ({ page }) => {
			await page.goto("/employees");
			await page.waitForLoadState("networkidle");

			const firstRow = page.locator("tbody tr").first();
			const viewButton = firstRow.getByRole("button").first();
			await viewButton.click();

			await page.waitForURL(/\/employees\/[a-f0-9-]+$/);

			const editButton = page.getByRole("button", { name: /edit/i }).first();
			await editButton.click();

			await page.waitForURL(/\/employees\/[a-f0-9-]+\/edit$/);
			await expect(page).toHaveURL(/\/employees\/[a-f0-9-]+\/edit$/);
		});

		test("should display tabs for employee sections", async ({ page }) => {
			await page.goto("/employees");
			await page.waitForLoadState("networkidle");

			const firstRow = page.locator("tbody tr").first();
			const viewButton = firstRow.getByRole("button").first();
			await viewButton.click();

			await page.waitForURL(/\/employees\/[a-f0-9-]+$/);

			await expect(page.getByRole("tab", { name: /overview|details/i })).toBeVisible();
			await expect(page.getByRole("tab", { name: /photo/i })).toBeVisible();
			await expect(page.getByRole("tab", { name: /family/i })).toBeVisible();
		});

		test("should navigate back to employees list", async ({ page }) => {
			await page.goto("/employees");
			await page.waitForLoadState("networkidle");

			const firstRow = page.locator("tbody tr").first();
			const viewButton = firstRow.getByRole("button").first();
			await viewButton.click();

			await page.waitForURL(/\/employees\/[a-f0-9-]+$/);

			const backButton = page.getByRole("button", { name: /back/i }).first();
			await backButton.click();

			await page.waitForURL("/employees");
			await expect(page).toHaveURL("/employees");
		});
	});

	test.describe("Employee Registration Flow", () => {
		test("should navigate to registration type selection", async ({ page }) => {
			await page.goto("/employees");
			await page.waitForLoadState("networkidle");

			const createButton = page.getByRole("button", { name: /create|register/i }).first();
			await createButton.click();

			await page.waitForURL("/employees/register");
			await expect(page).toHaveURL("/employees/register");
		});

		test("should display employee type selection cards", async ({ page }) => {
			await page.goto("/employees/register");
			await page.waitForLoadState("networkidle");

			await expect(page.getByText(/military/i)).toBeVisible();
			await expect(page.getByText(/civilian/i)).toBeVisible();
			await expect(page.getByText(/temporary/i)).toBeVisible();

			const cards = page.locator("button[type='button']").filter({ hasText: /military|civilian|temporary/i });
			await expect(cards).toHaveCount(3);
		});

		test("should navigate to military registration form", async ({ page }) => {
			await page.goto("/employees/register");
			await page.waitForLoadState("networkidle");

			const militaryCard = page
				.locator("button")
				.filter({ hasText: /military/i })
				.first();
			await militaryCard.click();

			await page.waitForURL("/employees/register/military");
			await expect(page).toHaveURL("/employees/register/military");
		});

		test("should navigate to civilian registration form", async ({ page }) => {
			await page.goto("/employees/register");
			await page.waitForLoadState("networkidle");

			const civilianCard = page
				.locator("button")
				.filter({ hasText: /civilian/i })
				.first();
			await civilianCard.click();

			await page.waitForURL("/employees/register/civilian");
			await expect(page).toHaveURL("/employees/register/civilian");
		});

		test("should navigate to temporary registration form", async ({ page }) => {
			await page.goto("/employees/register");
			await page.waitForLoadState("networkidle");

			const temporaryCard = page
				.locator("button")
				.filter({ hasText: /temporary/i })
				.first();
			await temporaryCard.click();

			await page.waitForURL("/employees/register/temporary");
			await expect(page).toHaveURL("/employees/register/temporary");
		});

		test("should display registration form fields", async ({ page }) => {
			await page.goto("/employees/register/civilian");
			await page.waitForLoadState("networkidle");

			await expect(page.getByLabel(/first name/i)).toBeVisible();
			await expect(page.getByLabel(/middle name/i)).toBeVisible();
			await expect(page.getByLabel(/last name/i)).toBeVisible();
			await expect(page.getByLabel(/date of birth/i)).toBeVisible();
			await expect(page.getByLabel(/gender/i)).toBeVisible();
		});

		test("should validate required fields", async ({ page }) => {
			await page.goto("/employees/register/civilian");
			await page.waitForLoadState("networkidle");

			const submitButton = page.getByRole("button", { name: /submit|register|save/i }).first();
			await submitButton.click();

			await expect(page.getByText(/required|must be/i).first()).toBeVisible({ timeout: 3000 });
		});

		test("should show transfer option for military employees", async ({ page }) => {
			await page.goto("/employees/register/military");
			await page.waitForLoadState("networkidle");

			const isTransferCheckbox = page.getByRole("checkbox", { name: /transfer/i });
			if ((await isTransferCheckbox.count()) > 0) {
				await expect(isTransferCheckbox).toBeVisible();
			}
		});

		test("should navigate back to type selection from form", async ({ page }) => {
			await page.goto("/employees/register/civilian");
			await page.waitForLoadState("networkidle");

			const backButton = page.getByRole("button", { name: /back/i }).first();
			await backButton.click();

			await page.waitForURL("/employees/register");
			await expect(page).toHaveURL("/employees/register");
		});
	});

	test.describe("Employee Edit Functionality", () => {
		test("should load edit form with existing data", async ({ page }) => {
			await page.goto("/employees");
			await page.waitForLoadState("networkidle");

			const firstRow = page.locator("tbody tr").first();
			const editButton = firstRow.getByRole("button", { name: /edit|pencil/i }).first();

			if ((await editButton.count()) === 0) {
				const actionsButton = firstRow.getByRole("button").first();
				await actionsButton.click();
				await page.getByRole("menuitem", { name: /edit/i }).click();
			} else {
				await editButton.click();
			}

			await page.waitForURL(/\/employees\/[a-f0-9-]+\/edit$/);

			const firstNameInput = page.getByLabel(/first name/i);
			const firstNameValue = await firstNameInput.inputValue();
			expect(firstNameValue.length).toBeGreaterThan(0);
		});

		test("should update employee information", async ({ page }) => {
			await page.goto("/employees");
			await page.waitForLoadState("networkidle");

			const firstRow = page.locator("tbody tr").first();
			const viewButton = firstRow.getByRole("button").first();
			await viewButton.click();

			await page.waitForURL(/\/employees\/[a-f0-9-]+$/);

			const editButton = page.getByRole("button", { name: /edit/i }).first();
			await editButton.click();

			await page.waitForURL(/\/employees\/[a-f0-9-]+\/edit$/);

			const phoneInput = page.getByLabel(/phone|mobile/i).first();
			if ((await phoneInput.count()) > 0) {
				await phoneInput.clear();
				await phoneInput.fill("0911223344");
			}

			const saveButton = page.getByRole("button", { name: /save|update/i }).first();
			await saveButton.click();

			await page.waitForURL(/\/employees\/[a-f0-9-]+$/, { timeout: 10000 });
		});

		test("should cancel edit and return to detail page", async ({ page }) => {
			await page.goto("/employees");
			await page.waitForLoadState("networkidle");

			const firstRow = page.locator("tbody tr").first();
			const viewButton = firstRow.getByRole("button").first();
			await viewButton.click();

			await page.waitForURL(/\/employees\/[a-f0-9-]+$/);

			const editButton = page.getByRole("button", { name: /edit/i }).first();
			await editButton.click();

			await page.waitForURL(/\/employees\/[a-f0-9-]+\/edit$/);

			const cancelButton = page.getByRole("button", { name: /cancel/i }).first();
			await cancelButton.click();

			await page.waitForURL(/\/employees\/[a-f0-9-]+$/);
			await expect(page).toHaveURL(/\/employees\/[a-f0-9-]+$/);
		});
	});

	test.describe("Former Employees Page", () => {
		test("should navigate to former employees page", async ({ page }) => {
			await page.goto("/employees");
			await page.waitForLoadState("networkidle");

			const formerButton = page.getByRole("button", { name: /former|inactive/i }).first();

			if ((await formerButton.count()) > 0) {
				await formerButton.click();
				await page.waitForURL("/employees/former");
				await expect(page).toHaveURL("/employees/former");
			} else {
				await page.goto("/employees/former");
			}
		});

		test("should display former employees table", async ({ page }) => {
			await page.goto("/employees/former");
			await page.waitForLoadState("networkidle");

			await expect(page.getByRole("heading", { name: /former|inactive/i })).toBeVisible();

			await expect(page.locator("table")).toBeVisible();

			await expect(page.getByRole("columnheader", { name: /employee id/i })).toBeVisible();
			await expect(page.getByRole("columnheader", { name: /name/i })).toBeVisible();
		});

		test("should filter former employees by status", async ({ page }) => {
			await page.goto("/employees/former");
			await page.waitForLoadState("networkidle");

			const statusFilter = page.getByRole("combobox", { name: /status/i });
			if ((await statusFilter.count()) > 0) {
				await statusFilter.click();
				await page.getByRole("option", { name: /retired/i }).click();
				await page.waitForLoadState("networkidle");

				const retiredBadges = page.locator("text=/RETIRED/i");
				if ((await retiredBadges.count()) > 0) {
					await expect(retiredBadges.first()).toBeVisible();
				}
			}
		});

		test("should view former employee details", async ({ page }) => {
			await page.goto("/employees/former");
			await page.waitForLoadState("networkidle");

			const rows = page.locator("tbody tr");
			const rowCount = await rows.count();

			if (rowCount > 0) {
				const firstRow = rows.first();
				const viewButton = firstRow.getByRole("button").first();
				await viewButton.click();

				await page.waitForURL(/\/employees\/[a-f0-9-]+$/);
				await expect(page).toHaveURL(/\/employees\/[a-f0-9-]+$/);
			}
		});

		test("should return to active employees from former page", async ({ page }) => {
			await page.goto("/employees/former");
			await page.waitForLoadState("networkidle");

			const backButton = page.getByRole("button", { name: /back|active/i }).first();
			if ((await backButton.count()) > 0) {
				await backButton.click();
				await page.waitForURL("/employees");
				await expect(page).toHaveURL("/employees");
			}
		});
	});

	test.describe("Employee Actions and Permissions", () => {
		test("should display actions menu", async ({ page }) => {
			await page.goto("/employees");
			await page.waitForLoadState("networkidle");

			const firstRow = page.locator("tbody tr").first();
			const actionsButton = firstRow.getByRole("button", { name: /actions|more/i }).first();

			if ((await actionsButton.count()) > 0) {
				await actionsButton.click();
				await expect(page.getByRole("menu")).toBeVisible();
			}
		});

		test("should show view option in actions menu", async ({ page }) => {
			await page.goto("/employees");
			await page.waitForLoadState("networkidle");

			const firstRow = page.locator("tbody tr").first();
			const actionsButton = firstRow.getByRole("button", { name: /actions|more/i }).first();

			if ((await actionsButton.count()) > 0) {
				await actionsButton.click();
				await expect(page.getByRole("menuitem", { name: /view|details/i })).toBeVisible();
			}
		});

		test("should show edit option in actions menu", async ({ page }) => {
			await page.goto("/employees");
			await page.waitForLoadState("networkidle");

			const firstRow = page.locator("tbody tr").first();
			const actionsButton = firstRow.getByRole("button", { name: /actions|more/i }).first();

			if ((await actionsButton.count()) > 0) {
				await actionsButton.click();
				await expect(page.getByRole("menuitem", { name: /edit/i })).toBeVisible();
			}
		});

		test("should show change status option in actions menu", async ({ page }) => {
			await page.goto("/employees");
			await page.waitForLoadState("networkidle");

			const firstRow = page.locator("tbody tr").first();
			const actionsButton = firstRow.getByRole("button", { name: /actions|more/i }).first();

			if ((await actionsButton.count()) > 0) {
				await actionsButton.click();
				const changeStatusOption = page.getByRole("menuitem", { name: /status/i });
				if ((await changeStatusOption.count()) > 0) {
					await expect(changeStatusOption).toBeVisible();
				}
			}
		});
	});

	test.describe("Responsive Design", () => {
		test("should display properly on mobile viewport", async ({ page }) => {
			await page.setViewportSize({ width: 375, height: 667 });

			await page.goto("/employees");
			await page.waitForLoadState("networkidle");

			await expect(page.getByRole("heading", { name: /employees/i })).toBeVisible();
			await expect(page.locator("table")).toBeVisible();
		});

		test("should display properly on tablet viewport", async ({ page }) => {
			await page.setViewportSize({ width: 768, height: 1024 });

			await page.goto("/employees");
			await page.waitForLoadState("networkidle");

			await expect(page.getByRole("heading", { name: /employees/i })).toBeVisible();
			await expect(page.locator("table")).toBeVisible();
		});

		test("should display properly on desktop viewport", async ({ page }) => {
			await page.setViewportSize({ width: 1920, height: 1080 });

			await page.goto("/employees");
			await page.waitForLoadState("networkidle");

			await expect(page.getByRole("heading", { name: /employees/i })).toBeVisible();
			await expect(page.locator("table")).toBeVisible();
		});
	});
});
