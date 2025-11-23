module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@repo/db$': '<rootDir>/../../packages/db/src/index.ts',
  },
};
