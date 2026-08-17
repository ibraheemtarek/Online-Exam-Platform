module.exports = {
  testEnvironment: "node",

  transform: {
    "^.+\\.(t|j)sx?$": ["@swc/jest"],
  },

  testMatch: [
    "**/*.test.ts",
    "**/*.spec.ts",
  ],

  testPathIgnorePatterns: [
    "/node_modules/",
    "/dist/",
  ],

  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
};