import { ApolloCache } from 'apollo-cache';


export class ApolloCacheSpiesManager {

    static writeQuery: jest.SpiedFunction<typeof ApolloCache.prototype.writeQuery>;

    static setupSpies() {
        this.restoreSpies();
        this.writeQuery = jest.spyOn(ApolloCache.prototype, 'writeQuery');
    }

    private static restoreSpies() {
        this.writeQuery?.mockRestore();
    }

}
