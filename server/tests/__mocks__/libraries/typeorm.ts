export const MockTypeORM = {
    connectToDatabase: jest.fn(),
};

jest.mock('typeorm', () => MockTypeORM);
