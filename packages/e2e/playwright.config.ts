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

	webServer: process.env.CI
		? [
				{
					command: "node ../../packages/api/dist/main.js",
					url: API_URL,
					timeout: 120000,
					reuseExistingServer: false,
					env: {
						DATABASE_URL: process.env.DATABASE_URL ?? "",
						JWT_SECRET: process.env.JWT_SECRET ?? "test-secret",
						JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN ?? "1d",
						NODE_ENV: "test",
					},
				},
				{
					command: "npm run preview --workspace=packages/web",
					url: BASE_URL,
					timeout: 120000,
					reuseExistingServer: false,
					cwd: "../..",
				},
			]
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
