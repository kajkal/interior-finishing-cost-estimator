import { Container } from 'typedi';

import { AuthService } from '../../../src/services/auth/AuthService';
import { User } from '../../../src/entities/user/User';


/**
 * Returns [Authorization header value, access token value]
 */
export function createAccessToken(userData: Pick<User, 'id'>): [ string, string ] {
    const accessToken = Container.get(AuthService).generateAccessToken(userData);
    return [ `Bearer ${accessToken}`, accessToken ];
}
