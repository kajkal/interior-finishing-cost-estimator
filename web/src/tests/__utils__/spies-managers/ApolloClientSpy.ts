import { ApolloClient } from '@apollo/client';


export class ApolloClientSpy {

    static writeQuery: jest.SpiedFunction<typeof ApolloClient.prototype.writeQuery>;
    static readQuery: jest.SpiedFunction<typeof ApolloClient.prototype.readQuery>;
    static clearStore: jest.SpiedFunction<typeof ApolloClient.prototype.clearStore>;
    static onClearStore: jest.SpiedFunction<typeof ApolloClient.prototype.onClearStore>;

    static simulateClearStore() {
        this.onClearStore.mock.calls[ 0 ][ 0 ]();
    }

    static setupSpies() {
        this.restoreSpies();
        this.writeQuery = jest.spyOn(ApolloClient.prototype, 'writeQuery');
        this.readQuery = jest.spyOn(ApolloClient.prototype, 'readQuery');
        this.clearStore = jest.spyOn(ApolloClient.prototype, 'clearStore');
        this.onClearStore = jest.spyOn(ApolloClient.prototype, 'onClearStore');
    }

    private static restoreSpies() {
        this.writeQuery?.mockRestore();
        this.readQuery?.mockRestore();
        this.clearStore?.mockRestore();
        this.onClearStore?.mockRestore();
    }

}
