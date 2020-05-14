export class MockLogger {

    static debug = jest.fn();
    static info = jest.fn();
    static warn = jest.fn();
    static error = jest.fn();

    static setupMocks() {
        this.debug.mockClear();
        this.info.mockClear();
        this.warn.mockClear();
        this.error.mockClear();
    }

}


jest.mock('../../../src/utils/logger', () => ({
    logger: MockLogger,
}));
