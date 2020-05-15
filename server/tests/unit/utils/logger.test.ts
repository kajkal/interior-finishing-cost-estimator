const MockLoggingWinston = jest.fn();
jest.mock('@google-cloud/logging-winston', () => ({
    LoggingWinston: MockLoggingWinston,
}));

describe('logger objects', () => {

    let originalProcessEnv: NodeJS.ProcessEnv;
    let MockCreateLogger: jest.SpyInstance;

    beforeEach(() => {
        MockCreateLogger = jest.spyOn(require('winston'), 'createLogger').mockReturnValue('LOGGER');

        originalProcessEnv = process.env;
        process.env = { ...originalProcessEnv };
    });

    afterEach(() => {
        jest.resetModules();

        MockCreateLogger.mockClear();
        MockLoggingWinston.mockClear();

        process.env = originalProcessEnv;
    });

    it('should create logger with standard config', async () => {
        expect.assertions(3);

        // given/when
        const { logger } = await import('../../../src/utils/logger');

        // then
        expect(logger).toBe('LOGGER');
        expect(MockCreateLogger).toHaveBeenCalledTimes(1);
        expect(MockCreateLogger).toHaveBeenCalledWith(expect.objectContaining({
            transports: [
                expect.any(require('winston').transports.Console),
            ],
        }));
    });

    it('should create logger with production config', async () => {
        expect.assertions(3);

        // given
        process.env = { ...originalProcessEnv, NODE_ENV: 'production' };

        // when
        const { logger } = await import('../../../src/utils/logger');

        // then
        expect(logger).toBe('LOGGER');
        expect(MockCreateLogger).toHaveBeenCalledTimes(1);
        expect(MockCreateLogger).toHaveBeenCalledWith(expect.objectContaining({
            transports: [
                expect.any(MockLoggingWinston),
            ],
        }));
    });

    it('should transform graphql logs correctly', async () => {
        expect.assertions(3);

        // given
        const basicLogData = {
            message: 'TEST_MESSAGE',
            level: 'info',
            info: { parentType: { name: 'Query' }, fieldName: 'queryName' },
        };
        const { graphqlLogTransformer } = await import('../../../src/utils/logger');

        // when
        const transformedStandardLog = graphqlLogTransformer({ ...basicLogData, info: undefined });
        const transformedWithoutJwtPayload = graphqlLogTransformer(basicLogData);
        const transformedWithJwtPayload = graphqlLogTransformer({
            ...basicLogData,
            jwtPayload: { userId: 'TEST_USER_ID' },
        });

        // then
        expect(transformedStandardLog).toStrictEqual({
            level: basicLogData.level,
            message: basicLogData.message,
            userId: undefined,
        });
        expect(transformedWithoutJwtPayload).toStrictEqual({
            level: basicLogData.level,
            message: `[Query.queryName] ${basicLogData.message}`,
            userId: undefined,
        });
        expect(transformedWithJwtPayload).toStrictEqual({
            level: basicLogData.level,
            message: `[Query.queryName] ${basicLogData.message}`,
            userId: 'TEST_USER_ID',
        });
    });

});
