import { defineConfig, devices } from "@playwright/test";

const BASE_URL = process.env.BASE_URL ?? "http://localhost:5173";
const API_URL = process.env.API_URL ?? "http://localhost:3000";
const IS_CI = !!process.env.CI;

export default defineConfig({
	testDir: "./tests",
	fullyParallel: true,
	forbidOnly: IS_CI,
	retries: IS_CI ? 2 : 0,
	workers: IS_CI ? 1 : undefined,
	reporter: IS_CI ? [["github"], ["html"]] : [["html"], ["list"]],
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

	webServer: IS_CI
		? undefined
		: [
				{
					command: "npm run dev:api",
					url: API_URL,
					timeout: 120000,
					reuseExistingServer: true,
					cwd: "../..",
				},
				{
					command: "npm run dev:web",
					url: BASE_URL,
					timeout: 120000,
					reuseExistingServer: true,
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
		...(IS_CI
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
