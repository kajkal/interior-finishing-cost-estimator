import { UnauthorizedError } from '../../components/providers/apollo/errors/UnauthorizedError';
import { TokenVerifier } from '../token/TokenVerifier';


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
     * Determines if given operation is protected (require authorization).
     */
    static isProtectedOperation(operationName?: string): boolean {
        return !AuthUtils.PUBLIC_OPERATIONS.has(operationName!);
    }

    /**
     * Verifies is given token is valid and not expired.
     */
    static verifyAccessToken(tokenToVerify: string | undefined): string | undefined {
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
    static async refreshAccessToken(): Promise<string> {
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
