import { ApolloClient } from 'apollo-client';


export class ApolloClientSpiesManager {

    static clearStore: jest.SpiedFunction<typeof ApolloClient.prototype.clearStore>;

    static setupSpies() {
        this.restoreSpies();
        this.clearStore = jest.spyOn(ApolloClient.prototype, 'clearStore');
    }

    private static restoreSpies() {
        this.clearStore?.mockRestore();
    }

}
