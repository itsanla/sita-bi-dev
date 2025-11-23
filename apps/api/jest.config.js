module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@repo/db$': '<rootDir>/../../packages/db/src/index.ts', // Adjust path to @repo/db
  },
};
