describe('index file', () => {

    const MockConnectToDatabase = jest.fn();
    const MockCreateApolloServer = jest.fn();
    const MockCreateExpressServer = jest.fn();

    beforeEach(() => {
        jest.mock('../../src/loaders/mongodb', () => ({
            connectToDatabase: MockConnectToDatabase,
        }));
        jest.mock('../../src/loaders/apollo', () => ({
            createApolloServer: MockCreateApolloServer,
        }));
        jest.mock('../../src/loaders/express', () => ({
            createExpressServer: MockCreateExpressServer,
        }));
    });

    afterEach(() => {
        jest.resetModules();
        MockConnectToDatabase.mockReset();
        MockCreateApolloServer.mockReset();
        MockCreateExpressServer.mockReset();
    });

    it('should setup server', async () => {
        expect.assertions(4);

        // given
        const sampleApolloServer = 'APOLLO_SERVER_TEST_VALUE';
        MockConnectToDatabase.mockImplementation(() => Promise.resolve());
        MockCreateApolloServer.mockImplementation(() => Promise.resolve(sampleApolloServer));
        MockCreateExpressServer.mockImplementation(() => Promise.resolve());

        // when
        await import('../../src/index');
        await (new Promise(setImmediate)); // waits for all promises to resolve

        // then
        expect(MockConnectToDatabase).toHaveBeenCalledTimes(1);
        expect(MockCreateApolloServer).toHaveBeenCalledTimes(1);
        expect(MockCreateExpressServer).toHaveBeenCalledTimes(1);
        expect(MockCreateExpressServer).toHaveBeenCalledWith(sampleApolloServer);
    });

});
