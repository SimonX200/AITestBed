module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/*.test.ts'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  collectCoverageFrom: ['*.ts', '!*.test.ts'],
  forceExit: true,
  detectOpenHandles: true,
};
