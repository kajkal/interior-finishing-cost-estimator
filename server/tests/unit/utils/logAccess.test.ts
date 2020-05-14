import { ResolverData } from 'type-graphql';

import { MockLogger } from '../../__mocks__/utils/logger';

import { AuthorizedContext } from '../../../src/utils/authChecker';
import { logAccess } from '../../../src/utils/logAccess';


describe('logAccess function', () => {

    beforeEach(() => {
        MockLogger.setupMocks();
    });

    it('should log access', async () => {
        expect.assertions(2);

        // given
        const mockNextFunction = jest.fn().mockReturnValue(Promise.resolve());
        const sampleAction = {
            context: {
                jwtPayload: 'INFO_TEST_VALUE',
            },
            info: 'INFO_TEST_VALUE',
        } as unknown as ResolverData<AuthorizedContext>;

        // when
        await logAccess(sampleAction, mockNextFunction);

        // then
        expect(MockLogger.info).toHaveBeenCalledTimes(1);
        expect(MockLogger.info).toHaveBeenCalledWith({
            message: 'access',
            info: sampleAction.info,
            jwtPayload: sampleAction.context.jwtPayload,
        });
    });

    it('should log access error', async () => {
        expect.assertions(3);

        // given
        const mockNextFunction = jest.fn().mockImplementation(() => {
            throw new Error('TEST_ERROR_MESSAGE');
        });
        const sampleAction = {
            context: {
                jwtPayload: 'INFO_TEST_VALUE',
            },
            info: 'INFO_TEST_VALUE',
        } as unknown as ResolverData<AuthorizedContext>;

        // when/then
        await expect(logAccess(sampleAction, mockNextFunction)).rejects.toThrow('TEST_ERROR_MESSAGE');
        expect(MockLogger.info).toHaveBeenCalledTimes(1);
        expect(MockLogger.info).toHaveBeenCalledWith({
            message: 'access-error',
            info: sampleAction.info,
            jwtPayload: sampleAction.context.jwtPayload,
            error: 'TEST_ERROR_MESSAGE',
        });
    });

});
