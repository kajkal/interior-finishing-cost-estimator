import { ApolloCache } from 'apollo-cache';


export class ApolloCacheSpiesManager {

    static writeQuery: jest.SpiedFunction<typeof ApolloCache.prototype.writeQuery>;
    static readQuery: jest.SpiedFunction<typeof ApolloCache.prototype.readQuery>;

    static setupSpies() {
        this.restoreSpies();
        this.writeQuery = jest.spyOn(ApolloCache.prototype, 'writeQuery');
        this.readQuery = jest.spyOn(ApolloCache.prototype, 'readQuery');
    }

    private static restoreSpies() {
        this.writeQuery?.mockRestore();
        this.readQuery?.mockRestore();
    }

}
