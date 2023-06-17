module.exports = {
  preset: 'jest-puppeteer',
  testTimeout: 20000,
  // testPathIgnorePatterns: ['<rootDir>/__tests__/e2e/testSetup.ts'],
  testMatch: [
    '**/__tests__/**/*.ts',
    '!**/__tests__/e2e/testSetup.ts',
    '!**/__tests__/e2e/helper.ts',
  ],
};
