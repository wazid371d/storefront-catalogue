/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: 'src',
  testMatch: ['**/tests/**/*.test.ts'],
  setupFilesAfterEnv: [],
  testTimeout: 30000,
  clearMocks: true,
};
