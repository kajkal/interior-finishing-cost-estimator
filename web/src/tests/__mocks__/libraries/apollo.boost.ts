export const MockApolloClientConstructor = jest.fn();

jest.mock('apollo-boost', function () {
    return MockApolloClientConstructor;
});
