const nextJest = require('next/jest')

const createJestConfig = nextJest({ dir: './' })

const customJestConfig = {
  testEnvironment: 'jsdom',
  coverageProvider: 'v8',
  workerThreads: true,
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@autocare/shared$': '<rootDir>/../../packages/shared/index.js',
    '^@autocare/shared/(.*)$': '<rootDir>/../../packages/shared/$1',
  },
}

module.exports = createJestConfig(customJestConfig)
