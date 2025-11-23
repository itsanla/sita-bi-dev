module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: 'src',
  moduleNameMapper: {
    '^@repo/db$': '<rootDir>/../../../packages/db/src',
  },
};
