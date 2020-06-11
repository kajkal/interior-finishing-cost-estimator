import { JsonWebTokenSpiesManager } from '../../__utils__/spies-managers/JsonWebTokenSpiesManager';

import { TokenManager, TokenService } from '../../../src/services/TokenService';
import { TokenConfig } from '../../../src/types/token/TokenConfig';
import { config } from '../../../src/config/config';


describe('TokenService class', () => {

    const serviceUnderTest = new TokenService();

    beforeEach(() => {
        JsonWebTokenSpiesManager.setupSpies();
    });

    describe('token managers', () => {

        type TokenPayloadFromManager<M> = M extends TokenManager<infer P> ? P : never;
        const testData: [ keyof TokenService, TokenConfig<any> ][] = [
            [ 'accessToken', config.token.access.jwt ],
            [ 'refreshToken', config.token.refresh.jwt ],
            [ 'emailAddressConfirmationToken', config.token.emailAddressConfirmation.jwt ],
            [ 'passwordResetToken', config.token.passwordReset.jwt ],
        ];

        it.each(testData)('should generate and then verify %s', (managerName, expectedConfig) => {
            const tokenManager = serviceUnderTest[ managerName ];
            const initialPayload = { claim: 'value' } as unknown as TokenPayloadFromManager<typeof tokenManager>;
            const token = tokenManager.generate(initialPayload);
            const extractedPayload = tokenManager.verify(token);

            expect(token).toMatch(/^[a-zA-Z0-9\-_]+?\.[a-zA-Z0-9\-_]+?\.([a-zA-Z0-9\-_]+)?$/);
            expect(extractedPayload).toMatchObject(initialPayload);

            expect(JsonWebTokenSpiesManager.sign).toHaveBeenCalledTimes(1);
            const [ payload, signPrivateKey, options ] = JsonWebTokenSpiesManager.sign.mock.calls[ 0 ];
            expect(payload).toBe(initialPayload);
            expect(signPrivateKey).toBe(expectedConfig.privateKey);
            expect(options).toBe(expectedConfig.options);

            expect(JsonWebTokenSpiesManager.verify).toHaveBeenCalledTimes(1);
            const [ tokenToVerify, verifyPrivateKey ] = JsonWebTokenSpiesManager.verify.mock.calls[ 0 ];
            expect(tokenToVerify).toBe(token);
            expect(verifyPrivateKey).toBe(expectedConfig.privateKey);
        });

    });

});
