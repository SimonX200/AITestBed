export default {
  transform: {
    '^.+\\.(t|j)sx?$': 'esbuild-jest',
  },
  testEnvironment: 'node',
  testMatch: ['**/*.test.ts'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  verbose: true,
};
