export class GraphQLLoggerMockManager {

    static info = jest.fn();
    static warn = jest.fn();
    static error = jest.fn();

    static setupMocks() {
        this.info.mockReset();
        this.warn.mockReset();
        this.error.mockReset();
    }

}

export class LoggerMockManager {

    static info = jest.fn();
    static warn = jest.fn();
    static error = jest.fn();

    static setupMocks() {
        this.info.mockReset();
        this.warn.mockReset();
        this.error.mockReset();
    }

}
