export class MockLogger {

    static debug = jest.fn();
    static info = jest.fn();
    static warn = jest.fn();
    static error = jest.fn();

    static setupMocks() {
        this.debug.mockReset();
        this.info.mockReset();
        this.warn.mockReset();
        this.error.mockReset();
    }

}

jest.mock('../../../src/utils/logger', () => ({
    logger: MockLogger,
}));
