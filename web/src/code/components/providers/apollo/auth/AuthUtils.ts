import { decode } from 'jsonwebtoken';
import { InMemoryCache, Operation } from 'apollo-boost';

import { ApolloCacheManager } from '../ApolloCacheManager';
import { AccessTokenPayload } from './AccessTokenPayload';
import { UnauthorizedError } from './UnauthorizedError';


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
            const { accessToken: localAccessToken } = ApolloCacheManager.getLocalState(cache);

            const accessToken = AuthUtils.verifyAccessToken(localAccessToken) || await AuthUtils.refreshAccessToken();
            ApolloCacheManager.setLocalState(cache, { accessToken });

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
        const jwtPayload = decode(tokenToVerify!) as AccessTokenPayload | null;
        const currentTimestamp = (Date.now() / 1000) + 10; // + 10s as margin
        const isTokenValid = currentTimestamp <= jwtPayload?.exp!;

        console.log('%cverifyAccessToken', 'color: deepskyblue;', { isTokenValid, jwtPayload });

        return (isTokenValid) ? tokenToVerify : undefined;
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
