export const MockApolloServer = {
    applyMiddleware: jest.fn(),
};

export const MockApolloServerConstructor = jest.fn().mockReturnValue(MockApolloServer);

jest.mock('apollo-server-express', () => ({
    ApolloServer: MockApolloServerConstructor,
}));
