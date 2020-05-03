describe('index file', () => {

    const MockConnectToDatabase = jest.fn();
    const MockCreateGraphQLServer = jest.fn();

    beforeEach(() => {
        jest.mock('../../src/loaders/mongodb', () => ({
            connectToDatabase: MockConnectToDatabase,
        }));
        jest.mock('../../src/loaders/graphql', () => ({
            createGraphQLServer: MockCreateGraphQLServer,
        }));
    });

    afterEach(() => {
        jest.resetModules();
        MockConnectToDatabase.mockReset();
        MockCreateGraphQLServer.mockReset();
    });

    it('should setup server', async () => {
        expect.assertions(2);

        // given
        MockConnectToDatabase.mockReturnValue(Promise.resolve());
        MockCreateGraphQLServer.mockReturnValue(Promise.resolve());

        // when
        await import('../../src/index');

        // then
        expect(MockConnectToDatabase).toHaveBeenCalledTimes(1);
        expect(MockCreateGraphQLServer).toHaveBeenCalledTimes(1);
    });

});
