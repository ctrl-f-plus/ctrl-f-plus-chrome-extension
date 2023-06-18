// jest.config.js;

module.exports = {
  testEnvironment: 'jsdom',
  testTimeout: 20000,
  // transform: {
  //   '^.+\\.tsx?$': 'babel-jest',
  // },
  // testMatch: ['**/__tests__/**/*.ts', '!**/__tests__/e2e/**/*'],
  testMatch: ['**/__tests__/**/*.ts?(x)', '!**/__tests__/e2e/**/*.ts?(x)'],
};
