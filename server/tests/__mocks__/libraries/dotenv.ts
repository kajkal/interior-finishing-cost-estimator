export const MockDotenv = {
    config: jest.fn((options) => {
        jest.requireActual('dotenv').config(options);
    }),
};

jest.mock('dotenv', () => MockDotenv);
