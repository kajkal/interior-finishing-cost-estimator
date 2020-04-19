import { resolve } from 'path';


export const MockDotenv = {
    config: jest.fn().mockImplementation(() => {
        const testEnvFilePath = resolve(process.cwd(), '.env.test');
        jest.requireActual('dotenv').config({ path: testEnvFilePath });
    }),
};

jest.mock('dotenv', () => MockDotenv);
