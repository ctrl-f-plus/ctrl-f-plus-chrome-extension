// // jest.e2e.config.js;

// module.exports = {
//   preset: 'jest-puppeteer',
//   testTimeout: 20000,
//   testPathIgnorePatterns: [
//     '<rootDir>/__tests__/e2e/testSetup.ts',
//     '<rootDir>/__tests__/e2e/helpers.ts',
//   ],
//   testMatch: [
//     // '**/__tests__/**/*.ts',
//     '**/__tests__/e2e/**/*',
//     '!**/__tests__/e2e/testSetup.ts',
//     '!**/__tests__/e2e/helper.ts',
//   ],
// };

// // '**/__tests__/e2e/**/*.test.ts', '**/__tests__/e2e/**/*.spec.ts';

module.exports = {
  preset: 'jest-puppeteer',
  testTimeout: 20000,
  testMatch: [
    '**/__tests__/e2e/**/*.(test|spec).ts', // This will ensure only files with .test.ts or .spec.ts are picked up
  ],
  testPathIgnorePatterns: [
    '<rootDir>/__tests__/e2e/testSetup.ts',
    '<rootDir>/__tests__/e2e/helpers.ts',
  ],
};
