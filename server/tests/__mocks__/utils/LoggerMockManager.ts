export class GraphQLLoggerMockManager {

    static info: jest.Mock;
    static warn: jest.Mock;
    static error: jest.Mock;

    static setupMocks() {
        this.info = jest.fn();
        this.warn = jest.fn();
        this.error = jest.fn();
    }

}

export class LoggerMockManager {

    static info: jest.Mock;
    static warn: jest.Mock;
    static error: jest.Mock;

    static setupMocks() {
        this.info = jest.fn();
        this.warn = jest.fn();
        this.error = jest.fn();
    }

}

jest.mock('../../../src/utils/logger', () => ({
    graphQLLogger: GraphQLLoggerMockManager,
    logger: LoggerMockManager,
}));
