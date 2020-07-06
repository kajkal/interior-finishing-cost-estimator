import { ApolloCache } from 'apollo-cache';
import ApolloClient, { PresetConfig } from 'apollo-boost';


export class MockApolloInMemoryCache {

    static constructorFn: jest.MockInstance<MockApolloInMemoryCache, []>;
    static writeQuery: jest.MockedFunction<typeof ApolloCache.prototype.writeQuery>;
    static readQuery: jest.MockedFunction<typeof ApolloCache.prototype.readQuery>;

    static setupMocks() {
        this.constructorFn = jest.fn().mockImplementation(() => MockApolloInMemoryCache);
        this.writeQuery = jest.fn();
        this.readQuery = jest.fn();
    }

}

export class MockApolloClient {

    static constructorFn: jest.MockInstance<MockApolloClient, [ PresetConfig ]>;
    static writeQuery: jest.MockedFunction<typeof ApolloClient.prototype.writeQuery>;
    static onClearStore: jest.MockedFunction<typeof ApolloClient.prototype.onClearStore>;

    static simulateClearStore() {
        this.onClearStore.mock.calls[ 0 ][ 0 ]();
    }

    static setupMocks() {
        this.constructorFn = jest.fn().mockImplementation(() => MockApolloClient);
        this.writeQuery = jest.fn();
        this.onClearStore = jest.fn();
    }

}

jest.mock('apollo-boost', () => ({
    __esModule: true,
    default: MockApolloClient.constructorFn,
    InMemoryCache: MockApolloInMemoryCache.constructorFn,
}));
