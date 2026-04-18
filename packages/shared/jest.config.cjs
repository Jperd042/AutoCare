module.exports = {
  rootDir: '.',
  testEnvironment: 'node',
  testMatch: ['<rootDir>/services/__tests__/**/*.test.js'],
  collectCoverageFrom: [
    '<rootDir>/services/**/*.js',
    '!<rootDir>/services/__tests__/**',
  ],
}
