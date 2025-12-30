import { defineConfig, devices } from "@playwright/test";

const BASE_URL = process.env.BASE_URL ?? "http://localhost:5173";
const API_URL = process.env.API_URL ?? "http://localhost:3000";

export default defineConfig({
	testDir: "./tests",
	fullyParallel: true,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 2 : 0,
	workers: process.env.CI ? 1 : undefined,
	reporter: [["html"], ["list"]],
	timeout: 30000,
	expect: {
		timeout: 10000,
	},
	use: {
		baseURL: BASE_URL,
		trace: "on-first-retry",
		screenshot: "only-on-failure",
		video: "retain-on-failure",
	},

	webServer: [
		{
			command: process.env.CI ? "npm run start:prod --workspace=packages/api" : "npm run dev:api",
			url: API_URL,
			timeout: 120000,
			reuseExistingServer: !process.env.CI,
			cwd: "../..",
		},
		{
			command: process.env.CI ? "npm run preview --workspace=packages/web" : "npm run dev:web",
			url: BASE_URL,
			timeout: 120000,
			reuseExistingServer: !process.env.CI,
			cwd: "../..",
		},
	],

	projects: [
		{
			name: "setup",
			testMatch: /global\.setup\.ts/,
		},
		{
			name: "chromium",
			use: {
				...devices["Desktop Chrome"],
				storageState: "playwright/.auth/user.json",
			},
			dependencies: ["setup"],
		},
		...(process.env.CI
			? []
			: [
					{
						name: "firefox",
						use: {
							...devices["Desktop Firefox"],
							storageState: "playwright/.auth/user.json",
						},
						dependencies: ["setup"],
					},
					{
						name: "webkit",
						use: {
							...devices["Desktop Safari"],
							storageState: "playwright/.auth/user.json",
						},
						dependencies: ["setup"],
					},
				]),
	],
});
