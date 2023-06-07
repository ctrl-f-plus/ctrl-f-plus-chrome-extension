/** @returns {Promise<import('jest').Config>} */
module.exports = async () => {
  return {
    preset: 'jest-puppeteer',
    transform: { '^.+\\.tsx?$': 'ts-jest' },
    // setupFilesAfterEnv: ['./jest.setup.js'],
    setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],

    // testTimeout: 60000,
    // verbose: true,

    // roots: ['<rootDir>/src', '<rootDir>/__tests__'],
    // testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.tsx?$',
    // moduleNameMapper: { '\\.(css|less|scss|sass)$': 'identity-obj-proxy' },
    // moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
    // setupFilesAfterEnv: ['./jest.setup.js'],
    // globals: {
    //   'ts-jest': {
    //     diagnostics: false,
    //   },
    // },
  };
};
