/** @type {import('jest').Config} */
const path = require("path");

const tsJestIndex = path.resolve(
  __dirname,
  "node_modules/ts-jest/dist/index.js",
);

const tsJest = require(tsJestIndex);
const { createDefaultPreset } = tsJest;

const preset = createDefaultPreset({
  tsconfig: path.resolve(__dirname, "tsconfig.json"),
});

// Override transform to use absolute path (Jest 30 + pnpm symlink workaround)
preset.transform = {
  "^.+\\.tsx?$": [
    tsJestIndex,
    { tsconfig: path.resolve(__dirname, "tsconfig.json") },
  ],
};

const config = {
  ...preset,
  roots: ["<rootDir>/src"],
  testRegex: ".*\\.spec\\.ts$",
  collectCoverageFrom: [
    "src/**/*.ts",
    "!src/**/*.module.ts",
    "!src/**/*.dto.ts",
    "!src/**/*.entity.ts",
    "!src/**/index.ts",
    "!src/**/main.ts",
  ],
  coverageDirectory: "../coverage",
  testEnvironment: "node",
  moduleNameMapper: {
    "^@sigizi/shared$": path.resolve(__dirname, "../../packages/shared/src"),
  },
};

module.exports = config;
