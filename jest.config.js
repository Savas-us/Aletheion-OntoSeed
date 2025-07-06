/** @type {import('jest').Config} */
const config = {
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/*.test.ts'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      useESM: true
    }]
  },
  extensionsToTreatAsEsm: ['.ts'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
};

module.exports = config;