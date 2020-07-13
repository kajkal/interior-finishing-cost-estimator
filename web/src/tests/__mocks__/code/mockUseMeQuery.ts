export const mockUseMeQuery = jest.fn();

jest.mock('../../../graphql/generated-types', () => ({
    useMeQuery: mockUseMeQuery,
}));
