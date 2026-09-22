module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    testMatch: ['**/tests/**/*.e2e.test.ts'],
    moduleFileExtensions: ['ts', 'js'],
    verbose: true,
    transform: {
        '^.+\\.tsx?$': ['ts-jest', {
            tsconfig: 'tsconfig.test.json'
        }]
    },
    testTimeout: 60000
};