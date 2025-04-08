// jest.config.js
module.exports = {
    preset: "ts-jest",
    testEnvironment: "jsdom",
    moduleNameMapper: {
      "^@/(.*)$": "<rootDir>/src/$1", // Soporte para importaciones con "@"
    },
    setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
    testPathIgnorePatterns: ["/node_modules/", "/.next/"],
    transform: {
      "^.+\\.tsx?$": "ts-jest",
    },
  };
  