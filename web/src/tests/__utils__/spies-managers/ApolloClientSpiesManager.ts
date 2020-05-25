import { ApolloClient } from 'apollo-client';


export class ApolloClientSpiesManager {

    static clearStore: jest.SpiedFunction<typeof ApolloClient.prototype.clearStore>;
    static mutate: jest.SpiedFunction<typeof ApolloClient.prototype.mutate>;

    static setupSpies() {
        this.restoreSpies();
        this.clearStore = jest.spyOn(ApolloClient.prototype, 'clearStore');
        this.mutate = jest.spyOn(ApolloClient.prototype, 'mutate');
    }

    private static restoreSpies() {
        this.clearStore?.mockRestore();
        this.mutate?.mockRestore();
    }

}
