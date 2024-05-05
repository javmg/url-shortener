module.exports = {
  verbose: true,
  modulePathIgnorePatterns: ['<rootDir>/dist'],
  projects: [
    {
      displayName: 'url-shortener',
      preset: 'ts-jest',
      testEnvironment: 'node',
      setupFiles: ['./test/jest.setup.ts'],
      testMatch: ['<rootDir>/test/**/*.spec.ts'],
    },
  ],
};
