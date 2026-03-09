import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFiles: ['<rootDir>/tests/setup-tests.ts'],
  moduleNameMapper: {
    '@/(.*)': '<rootDir>/src/$1'
  },
  testMatch: ['**/*.spec.ts']
};

export default config;
