import { expect, test as setup } from "@playwright/test";

const AUTH_FILE = "playwright/.auth/user.json";

setup("authenticate", async ({ page }) => {
	const username = process.env.TEST_USERNAME ?? "FPCIV-0004-25";
	const password = process.env.TEST_PASSWORD ?? "Police@2025";

	await page.goto("/");

	await page.getByLabel("Username", { exact: false }).fill(username);
	await page.getByLabel("Password", { exact: false }).fill(password);

	await page.getByRole("button", { name: /login|sign in|submit/i }).click();

	await page.waitForURL("**/dashboard", { timeout: 10000 });

	await expect(page).toHaveURL(/\/dashboard/);

	await page.context().storageState({ path: AUTH_FILE });
});
