import { decode } from 'jsonwebtoken';
import { Operation } from 'apollo-boost';

import { UnauthorizedError } from './UnauthorizedError';
import { JwtPayload } from './JwtPayload';


export class AuthService {

    private static readonly PUBLIC_OPERATIONS = [ 'Login', 'Register', 'Logout' ];
    private static readonly REFRESH_TOKEN_URL = `${process.env.REACT_APP_SERVER_URL}/refresh_token`;

    private accessToken: string | undefined;

    setAccessToken(token: string | undefined): void {
        this.accessToken = token;
    }

    /**
     * @throws will throw an error if cannot acquire valid access token.
     * Error thrown here could later be found in GraphQL operation result (error.networkError).
     */
    async prepareRequest(operation: Operation): Promise<void> {
        const isProtectedOperation = !AuthService.PUBLIC_OPERATIONS.includes(operation.operationName);
        console.log('%cprepareRequest', 'color: deepskyblue;', { isProtectedOperation, operation });

        if (isProtectedOperation) {
            this.accessToken = AuthService.verifyAccessToken(this.accessToken) || await AuthService.refreshAccessToken();
            operation.setContext({
                headers: {
                    authorization: `Bearer ${this.accessToken}`,
                },
            });
        }
    }

    private static verifyAccessToken(tokenToVerify: string | undefined): string | undefined {
        const jwtPayload = decode(tokenToVerify!) as JwtPayload | null;
        const currentTimestamp = (Date.now() / 1000) + 10; // + 10s as margin
        const isTokenValid = currentTimestamp <= jwtPayload?.exp!;

        console.log('%cverifyAccessToken', 'color: deepskyblue;', { isTokenValid, jwtPayload });

        return (isTokenValid) ? tokenToVerify : undefined;
    }

    /**
     * @throws will throw an error if:
     *   - server can not refresh token,
     *   - server is not accessible,
     *   - cors problems.
     */
    private static async refreshAccessToken(): Promise<string | undefined> {
        const response = await fetch(AuthService.REFRESH_TOKEN_URL, { method: 'POST', credentials: 'include' });

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

export const authService = new AuthService();
