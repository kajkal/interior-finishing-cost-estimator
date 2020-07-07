import ApolloClient, { PresetConfig } from 'apollo-boost';


export class MockApolloClient {

    static constructorFn: jest.MockInstance<MockApolloClient, [ PresetConfig ]> = jest.fn();
    static writeQuery: jest.MockedFunction<typeof ApolloClient.prototype.writeQuery> = jest.fn();
    static readQuery: jest.MockedFunction<typeof ApolloClient.prototype.readQuery> = jest.fn();
    static clearStore: jest.MockedFunction<typeof ApolloClient.prototype.clearStore> = jest.fn();
    static onClearStore: jest.MockedFunction<typeof ApolloClient.prototype.onClearStore> = jest.fn();

    static simulateClearStore() {
        this.onClearStore.mock.calls[ 0 ][ 0 ]();
    }

    static setupMocks() {
        this.constructorFn.mockReset().mockImplementation(() => MockApolloClient);
        this.writeQuery.mockReset();
        this.readQuery.mockReset();
        this.clearStore.mockReset();
        this.onClearStore.mockReset();
    }

}

jest.mock('apollo-boost', () => ({
    __esModule: true,
    default: MockApolloClient.constructorFn,
}));
