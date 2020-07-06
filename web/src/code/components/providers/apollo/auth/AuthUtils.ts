import { InMemoryCache, Operation } from 'apollo-boost';

import { SessionStateManager } from '../cache/session/SessionStateManager';
import { UnauthorizedError } from '../errors/UnauthorizedError';
import { TokenVerifier } from '../../../../utils/token/TokenVerifier';


/**
 * Class with GraphQL auth related methods.
 */
export class AuthUtils {

    private static readonly PUBLIC_OPERATIONS = new Set([
        'IntrospectionQuery',
        'Login',
        'Register',
        'Logout',
        'ConfirmEmailAddress',
        'SendPasswordResetInstructions',
        'ResetPassword',
    ]);
    private static readonly REFRESH_TOKEN_URL = `${process.env.REACT_APP_SERVER_URL}/refresh_token`;

    /**
     * Prepares GraphQL operation context before sending it as request to the server.
     * If operation is protected (require authorization) auth header is added.
     *
     * @throws will throw an error if cannot acquire valid access token.
     * Error thrown here could later be found in GraphQL operation result (error.networkError).
     */
    static async prepareRequest(operation: Operation): Promise<void> {
        console.log('%cprepareRequest', 'color: deepskyblue;', operation.operationName);

        if (AuthUtils.isProtectedOperation(operation.operationName)) {
            const cache: InMemoryCache = operation.getContext().cache;
            const { accessToken: localAccessToken } = SessionStateManager.getSessionState(cache);

            const accessToken = AuthUtils.verifyAccessToken(localAccessToken) || await AuthUtils.refreshAccessToken();
            SessionStateManager.setSessionStateSilent(cache, { accessToken });

            operation.setContext({
                headers: {
                    authorization: `Bearer ${accessToken}`,
                },
            });
        }
    }

    /**
     * Determines if given operation is protected (require authorization).
     */
    private static isProtectedOperation(operationName: string): boolean {
        return !AuthUtils.PUBLIC_OPERATIONS.has(operationName);
    }

    /**
     * Verifies is given token is valid and not expired.
     */
    private static verifyAccessToken(tokenToVerify: string | undefined): string | undefined {
        try {
            TokenVerifier.create(tokenToVerify).verifyTokenExpiration();
            return tokenToVerify;
        } catch (error) {
            return undefined;
        }
    }

    /**
     * Asks the server for a refreshed access token.
     *
     * @throws will throw an error if:
     *   - server can not refresh token,
     *   - server is not accessible,
     *   - cors problems.
     */
    private static async refreshAccessToken(): Promise<string> {
        const response = await fetch(AuthUtils.REFRESH_TOKEN_URL, { method: 'POST', credentials: 'include' });

        if (response.ok) {
            const { accessToken } = await response.json();
            console.log('%crefreshAccessToken token refreshed!', 'color: deepskyblue;', { accessToken });
            return accessToken;
        }

        const { errorMessage } = await response.json();
        console.log('%crefreshAccessToken error', 'color: deepskyblue;', { errorMessage });
        throw new UnauthorizedError(errorMessage);
    }

}
