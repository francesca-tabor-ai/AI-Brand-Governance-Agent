/** @type {import('jest').Config} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  testEnvironmentOptions: {
    customExportConditions: ["node", "node-addons"],
  },
  roots: ["<rootDir>/src"],
  testMatch: ["**/__tests__/**/*.test.ts"],
  moduleNameMapper: {
    "^@brand-governance/shared$": "<rootDir>/../shared/src",
    "^@brand-governance/shared/dist/(.*)\\.[jt]s$": "<rootDir>/../shared/src/$1",
    "^@brand-governance/shared/(.*)$": "<rootDir>/../shared/src/$1",
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
  transform: {
    "^.+\\.ts$": [
      "ts-jest",
      {
        tsconfig: "<rootDir>/tsconfig.json",
        diagnostics: { ignoreCodes: [151002] },
      },
    ],
  },
};
