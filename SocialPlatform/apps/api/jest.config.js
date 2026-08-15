module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.ts'],
  moduleNameMapper: {
    '^@socialplatform/(.*)$': '<rootDir>/../../packages/$1/src'
  }
};
