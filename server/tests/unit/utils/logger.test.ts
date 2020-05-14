import winston from 'winston';


describe('logger objects', () => {

    beforeEach(() => {
        jest.spyOn(winston, 'createLogger');
    });

    afterEach(() => {
        jest.resetModules();
        (winston.createLogger as jest.Mock).mockRestore();
    });

    it('should create logger with correct config', async () => {
        expect.assertions(3);

        // given/when
        const { logger } = await import('../../../src/utils/logger');

        // then
        expect(logger).toBeDefined();
        expect(winston.createLogger).toHaveBeenCalledTimes(1);
        expect(winston.createLogger).toHaveBeenCalledWith(expect.objectContaining({
            transports: [
                expect.any(winston.transports.Console),
            ],
        }));
    });

    it('should transform graphql logs correctly', async () => {
        // given
        const basicLogData = {
            message: 'TEST_MESSAGE',
            level: 'info',
            info: { parentType: { name: 'Query' }, fieldName: 'queryName' },
        };
        const { graphqlLogTransformer } = await import('../../../src/utils/logger');

        // when
        const transformedWithoutJwtPayload = graphqlLogTransformer(basicLogData);
        const transformedWithJwtPayload = graphqlLogTransformer({
            ...basicLogData,
            jwtPayload: { userId: 'TEST_USER_ID' },
        });

        // then
        expect(transformedWithoutJwtPayload).toEqual({
            message: basicLogData.message,
            level: basicLogData.level,
            path: 'Query.queryName',
            userId: undefined,
        });
        expect(transformedWithJwtPayload).toEqual({
            message: basicLogData.message,
            level: basicLogData.level,
            path: 'Query.queryName',
            userId: 'TEST_USER_ID',
        });
    });

});
