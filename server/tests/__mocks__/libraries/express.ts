export const MockExpress = {
    use: jest.fn(),
    post: jest.fn(),
    listen: jest.fn(),
};

// Mocked express top-level function
export const MockExpressFunction = jest.fn().mockReturnValue(MockExpress);

jest.mock('express', () => MockExpressFunction);
