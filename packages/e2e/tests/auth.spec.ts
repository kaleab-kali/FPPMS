import { expect, test } from "@playwright/test";

test.describe("Authentication", () => {
	test.describe("Login Page", () => {
		test.use({ storageState: { cookies: [], origins: [] } });

		test("displays login form with all required fields", async ({ page }) => {
			await page.goto("/login");

			await expect(page).toHaveTitle(/PPMS|Police/i);

			await expect(page.getByRole("heading", { name: /login/i })).toBeVisible();

			await expect(page.getByLabel("Username", { exact: false })).toBeVisible();
			await expect(page.getByLabel("Password", { exact: false })).toBeVisible();

			const submitButton = page.getByRole("button", { name: /login|sign in|submit/i });
			await expect(submitButton).toBeVisible();
			await expect(submitButton).toBeEnabled();
		});

		test("validates required fields", async ({ page }) => {
			await page.goto("/login");

			const submitButton = page.getByRole("button", { name: /login|sign in|submit/i });
			await submitButton.click();

			const usernameInput = page.getByLabel("Username", { exact: false });
			const passwordInput = page.getByLabel("Password", { exact: false });

			await expect(usernameInput).toHaveAttribute("aria-invalid", "true");
			await expect(passwordInput).toHaveAttribute("aria-invalid", "true");
		});

		test("successful login redirects to dashboard", async ({ page }) => {
			const username = process.env.TEST_USERNAME ?? "FPCIV-0001-25";
			const password = process.env.TEST_PASSWORD ?? "Police@2025";

			await page.goto("/login");

			await page.getByLabel("Username", { exact: false }).fill(username);
			await page.getByLabel("Password", { exact: false }).fill(password);

			await page.getByRole("button", { name: /login|sign in|submit/i }).click();

			await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });

			await expect(page.getByRole("heading", { name: /dashboard/i })).toBeVisible();
		});

		test("failed login shows error message", async ({ page }) => {
			await page.goto("/login");

			await page.getByLabel("Username", { exact: false }).fill("invalid-user");
			await page.getByLabel("Password", { exact: false }).fill("wrong-password");

			await page.getByRole("button", { name: /login|sign in|submit/i }).click();

			await expect(page.getByRole("alert")).toBeVisible({ timeout: 5000 });
			await expect(page.getByRole("alert")).toContainText(/invalid|credentials|incorrect/i);

			await expect(page).toHaveURL(/\/login/);
		});

		test("shows loading state during login", async ({ page }) => {
			const username = process.env.TEST_USERNAME ?? "FPCIV-0001-25";
			const password = process.env.TEST_PASSWORD ?? "Police@2025";

			await page.goto("/login");

			await page.getByLabel("Username", { exact: false }).fill(username);
			await page.getByLabel("Password", { exact: false }).fill(password);

			const submitButton = page.getByRole("button", { name: /login|sign in|submit/i });

			const loadingPromise = submitButton.click();

			await expect(submitButton).toBeDisabled();
			await expect(submitButton).toContainText(/loading|wait|processing/i);

			await loadingPromise;
		});

		test("redirects authenticated users away from login", async ({ page }) => {
			const username = process.env.TEST_USERNAME ?? "FPCIV-0001-25";
			const password = process.env.TEST_PASSWORD ?? "Police@2025";

			await page.goto("/login");
			await page.getByLabel("Username", { exact: false }).fill(username);
			await page.getByLabel("Password", { exact: false }).fill(password);
			await page.getByRole("button", { name: /login|sign in|submit/i }).click();
			await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });

			await page.goto("/login");

			await expect(page).toHaveURL(/\/dashboard/);
		});
	});

	test.describe("Logout Functionality", () => {
		test("logout button is visible in navigation", async ({ page }) => {
			await page.goto("/dashboard");

			const userMenuTrigger = page
				.getByRole("button", { name: /user menu|account/i })
				.or(page.locator("[data-state]").filter({ hasText: /@/ }));

			await userMenuTrigger.click();

			const logoutButton = page.getByRole("menuitem", { name: /logout|sign out/i });
			await expect(logoutButton).toBeVisible();
		});

		test("logout redirects to login page and clears session", async ({ page }) => {
			await page.goto("/dashboard");

			const userMenuTrigger = page
				.getByRole("button", { name: /user menu|account/i })
				.or(page.locator("[data-state]").filter({ hasText: /@/ }));

			await userMenuTrigger.click();

			const logoutButton = page.getByRole("menuitem", { name: /logout|sign out/i });
			await logoutButton.click();

			await expect(page).toHaveURL(/\/login/, { timeout: 5000 });

			await page.goto("/dashboard");
			await expect(page).toHaveURL(/\/login/);
		});
	});

	test.describe("Password Change", () => {
		test.use({ storageState: { cookies: [], origins: [] } });

		test("displays password change form with all required fields", async ({ page }) => {
			await page.goto("/change-password");

			await expect(page.getByRole("heading", { name: /change password/i })).toBeVisible();

			await expect(page.getByLabel(/current password/i)).toBeVisible();
			await expect(page.getByLabel(/new password/i)).toBeVisible();
			await expect(page.getByLabel(/confirm password/i)).toBeVisible();

			const submitButton = page.getByRole("button", { name: /change password|submit/i });
			await expect(submitButton).toBeVisible();
			await expect(submitButton).toBeEnabled();
		});

		test("shows password requirements", async ({ page }) => {
			await page.goto("/change-password");

			await expect(page.getByText(/8 characters/i)).toBeVisible();
			await expect(page.getByText(/uppercase|lowercase|number|special/i)).toBeVisible();
		});

		test("validates password mismatch", async ({ page }) => {
			const username = process.env.TEST_USERNAME ?? "FPCIV-0001-25";
			const password = process.env.TEST_PASSWORD ?? "Police@2025";

			await page.goto("/login");
			await page.getByLabel("Username", { exact: false }).fill(username);
			await page.getByLabel("Password", { exact: false }).fill(password);
			await page.getByRole("button", { name: /login|sign in|submit/i }).click();
			await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });

			await page.goto("/change-password");

			await page.getByLabel(/current password/i).fill(password);
			await page.getByLabel(/new password/i).fill("NewPassword@123");
			await page.getByLabel(/confirm password/i).fill("DifferentPassword@123");

			await page.getByRole("button", { name: /change password|submit/i }).click();

			await expect(page.getByText(/do not match|mismatch/i)).toBeVisible();
		});

		test("validates password length requirement", async ({ page }) => {
			const username = process.env.TEST_USERNAME ?? "FPCIV-0001-25";
			const password = process.env.TEST_PASSWORD ?? "Police@2025";

			await page.goto("/login");
			await page.getByLabel("Username", { exact: false }).fill(username);
			await page.getByLabel("Password", { exact: false }).fill(password);
			await page.getByRole("button", { name: /login|sign in|submit/i }).click();
			await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });

			await page.goto("/change-password");

			await page.getByLabel(/current password/i).fill(password);
			await page.getByLabel(/new password/i).fill("Short1!");
			await page.getByLabel(/confirm password/i).fill("Short1!");

			await page.getByRole("button", { name: /change password|submit/i }).click();

			await expect(page.getByText(/too short|at least 8/i)).toBeVisible();
		});

		test("password visibility toggle works", async ({ page }) => {
			await page.goto("/change-password");

			const currentPasswordInput = page.getByLabel(/current password/i);
			const newPasswordInput = page.getByLabel(/new password/i);
			const confirmPasswordInput = page.getByLabel(/confirm password/i);

			await expect(currentPasswordInput).toHaveAttribute("type", "password");
			await expect(newPasswordInput).toHaveAttribute("type", "password");
			await expect(confirmPasswordInput).toHaveAttribute("type", "password");

			const toggleButtons = page.getByRole("button", { name: "" }).filter({ has: page.locator("svg") });
			const firstToggle = toggleButtons.first();
			await firstToggle.click();

			await expect(currentPasswordInput).toHaveAttribute("type", "text");
		});

		test("logout button is available on password change page", async ({ page }) => {
			const username = process.env.TEST_USERNAME ?? "FPCIV-0001-25";
			const password = process.env.TEST_PASSWORD ?? "Police@2025";

			await page.goto("/login");
			await page.getByLabel("Username", { exact: false }).fill(username);
			await page.getByLabel("Password", { exact: false }).fill(password);
			await page.getByRole("button", { name: /login|sign in|submit/i }).click();
			await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });

			await page.goto("/change-password");

			const logoutButton = page.getByRole("button", { name: /logout|sign out/i }).last();
			await expect(logoutButton).toBeVisible();
			await expect(logoutButton).toBeEnabled();
		});
	});

	test.describe("Protected Routes", () => {
		test.use({ storageState: { cookies: [], origins: [] } });

		test("unauthenticated users are redirected to login", async ({ page }) => {
			await page.goto("/dashboard");

			await expect(page).toHaveURL(/\/login/, { timeout: 5000 });
		});

		test("unauthenticated access to protected routes redirects to login", async ({ page }) => {
			const protectedRoutes = ["/employees", "/departments", "/users", "/roles"];

			for (const route of protectedRoutes) {
				await page.goto(route);
				await expect(page).toHaveURL(/\/login/, { timeout: 5000 });
			}
		});
	});

	test.describe("Session Persistence", () => {
		test("authenticated session persists across page reloads", async ({ page }) => {
			await page.goto("/dashboard");

			await expect(page).toHaveURL(/\/dashboard/);

			await page.reload();

			await expect(page).toHaveURL(/\/dashboard/);
			await expect(page.getByRole("heading", { name: /dashboard/i })).toBeVisible();
		});

		test("authenticated session persists across navigation", async ({ page }) => {
			await page.goto("/dashboard");

			await expect(page).toHaveURL(/\/dashboard/);

			await page.goto("/employees");

			await expect(page).not.toHaveURL(/\/login/);
		});
	});
});
