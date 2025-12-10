/** @type {import('jest').Config} */
const config = {
	moduleFileExtensions: ["js", "json", "ts"],
	rootDir: "src",
	testRegex: ".*\\.spec\\.ts$",
	transform: {
		"^.+\\.(t|j)s$": "ts-jest",
	},
	resolver: "<rootDir>/../jest.resolver.cjs",
	moduleNameMapper: {
		"^#api/(.*)$": "<rootDir>/$1",
	},
	collectCoverageFrom: ["**/*.(t|j)s"],
	coverageDirectory: "../coverage",
	testEnvironment: "node",
};

module.exports = config;
