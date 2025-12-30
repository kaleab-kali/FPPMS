import type { Page } from "@playwright/test";
import { test as base, expect } from "@playwright/test";

export const ROUTES = {
	HOME: "/",
	LOGIN: "/",
	DASHBOARD: "/dashboard",
	EMPLOYEES: "/employees",
	EMPLOYEE_DETAIL: (id: string) => `/employees/${id}`,
	EMPLOYEE_REGISTER: "/employees/register",
	DEPARTMENTS: "/organization/departments",
	CENTERS: "/organization/centers",
	RANKS: "/lookups/ranks",
	USERS: "/users",
	ROLES: "/roles",
} as const;

export const TEST_CREDENTIALS = {
	username: process.env.TEST_USERNAME ?? "FPCIV-0001-25",
	password: process.env.TEST_PASSWORD ?? "Police@2025",
} as const;

export const SELECTORS = {
	SIDEBAR: '[data-testid="sidebar"], aside, nav[aria-label="Sidebar"]',
	MAIN_CONTENT: 'main, [role="main"], #main-content',
	HEADER: 'header, [role="banner"]',
	DIALOG: '[role="dialog"]',
	TABLE: 'table, [role="table"]',
	FORM: "form",
	BUTTON: {
		PRIMARY: 'button[type="submit"], button.primary',
		CANCEL: 'button[type="button"]:has-text("Cancel")',
		SAVE: 'button:has-text("Save")',
		DELETE: 'button:has-text("Delete")',
		EDIT: 'button:has-text("Edit")',
		CREATE: 'button:has-text("Create"), button:has-text("Add"), button:has-text("New")',
	},
} as const;

export const TIMEOUTS = {
	SHORT: 3000,
	MEDIUM: 5000,
	LONG: 10000,
	NAVIGATION: 15000,
} as const;

export interface ExtendedFixtures {
	authenticatedPage: Page;
}

export const test = base.extend<ExtendedFixtures>({
	authenticatedPage: async ({ page }, use) => {
		await use(page);
	},
});

export { expect };

export const waitForTableLoad = async (page: Page): Promise<void> => {
	await page.waitForSelector(SELECTORS.TABLE, { timeout: TIMEOUTS.MEDIUM });
	await page.waitForLoadState("networkidle", { timeout: TIMEOUTS.LONG });
};

export const waitForDialogOpen = async (page: Page): Promise<void> => {
	await page.waitForSelector(SELECTORS.DIALOG, { state: "visible", timeout: TIMEOUTS.MEDIUM });
};

export const waitForDialogClose = async (page: Page): Promise<void> => {
	await page.waitForSelector(SELECTORS.DIALOG, { state: "hidden", timeout: TIMEOUTS.MEDIUM });
};

export const fillFormField = async (page: Page, label: string, value: string): Promise<void> => {
	const field = page.getByLabel(label, { exact: false });
	await field.fill(value);
};

export const selectDropdownOption = async (page: Page, label: string, option: string): Promise<void> => {
	const field = page.getByLabel(label, { exact: false });
	await field.click();
	await page.getByRole("option", { name: option, exact: false }).click();
};

export const clickButton = async (page: Page, name: string): Promise<void> => {
	await page.getByRole("button", { name, exact: false }).click();
};

export const navigateToRoute = async (page: Page, route: string): Promise<void> => {
	await page.goto(route);
	await page.waitForLoadState("networkidle", { timeout: TIMEOUTS.NAVIGATION });
};

export const assertToastVisible = async (page: Page, message: string): Promise<void> => {
	const toast = page.locator('[role="status"], .toast, [data-sonner-toast]').filter({ hasText: message });
	await expect(toast).toBeVisible({ timeout: TIMEOUTS.MEDIUM });
};

export const assertUrlContains = async (page: Page, fragment: string): Promise<void> => {
	await expect(page).toHaveURL(new RegExp(fragment));
};
