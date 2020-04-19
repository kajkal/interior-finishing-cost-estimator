// jest unit tests
// see https://jestjs.io/docs/en/configuration.html

module.exports = {

    // Indicates whether the coverage information should be collected while executing the test
    collectCoverage: true,

    // An array of glob patterns indicating a set of files for which coverage information should be collected
    collectCoverageFrom: [
        '<rootDir>/src/**/*.ts',
        '!<rootDir>/src/**/*.interface.ts',
        '!<rootDir>/src/**/*.mock.ts', //
        '!<rootDir>/src/**/*.module.ts',
        '!<rootDir>/src/**/*.spec.ts', //
        '!<rootDir>/src/**/*.test.ts', //
        '!<rootDir>/src/**/*.d.ts',
    ],

    // The directory where Jest should output its coverage files
    coverageDirectory: '<rootDir>/coverage',

    // An array of regexp pattern strings used to skip coverage collection
    coveragePathIgnorePatterns: [
        '\\\\node_modules\\\\',
    ],

    // A list of reporter names that Jest uses when writing coverage reports
    coverageReporters: [
        'lcov',
        'clover',
        'text-summary',
    ],

    // Make calling deprecated APIs throw helpful error messages
    errorOnDeprecated: true,

    // A set of global variables that need to be available in all test environments
    globals: {
        'ts-jest': {
            'diagnostics': false,
            'tsConfig': 'tsconfig.json',
        },
    },

    // An array of file extensions your modules use
    moduleFileExtensions: [
        'ts',
        'tsx',
        'js',
    ],

    // A list of paths to directories that Jest should use to search for files in
    roots: [
        '<rootDir>/tests',
        '<rootDir>/src', // for sake of coverage
    ],

    // The test environment that will be used for testing
    testEnvironment: 'node',

    // The glob patterns Jest uses to detect test files
    testMatch: [
        '**/*.test.ts',
    ],

    // // A map from regular expressions to paths to transformers
    transform: {
        '^.+\\.(ts|tsx)$': 'ts-jest',
    },

    // Indicates whether each individual test should be reported during the run
    verbose: false,

};
