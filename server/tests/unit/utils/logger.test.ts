import winston from 'winston';
import { Container } from 'typedi';

import { GraphQLLogger, Logger } from '../../../src/utils/logger';


jest.mock('fs'); // to prevent unnecessary log files creation

describe('logger objects', () => {

    beforeEach(() => {
        jest.spyOn(winston, 'createLogger');
    });

    afterEach(() => {
        jest.resetModules();
        (winston.createLogger as jest.Mock).mockRestore();
    });

    it('should create GraphQL and server loggers with correct config', async () => {
        expect.assertions(5);

        // given/when
        const graphQLLogger = Container.of('test').get(GraphQLLogger);
        const logger = Container.of('test').get(Logger);

        // then
        expect(graphQLLogger).toBeDefined();
        expect(logger).toBeDefined();
        expect(winston.createLogger).toHaveBeenCalledTimes(2);
        expect(winston.createLogger).toHaveBeenNthCalledWith(1, expect.objectContaining({
            transports: [
                expect.any(winston.transports.File),
            ],
        }));
        expect(winston.createLogger).toHaveBeenNthCalledWith(2, expect.objectContaining({
            transports: [
                expect.any(winston.transports.File),
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
