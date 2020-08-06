import { Container } from 'typedi';

import { AuthService } from '../../../src/services/auth/AuthService';
import { User } from '../../../src/entities/user/User';


export function createAccessToken(userData: Pick<User, 'id'>) {
    const accessToken = Container.get(AuthService).generateAccessToken(userData);
    return {
        authHeader: `Bearer ${accessToken}`,
        tokenValue: accessToken,
    };
}

export function getAuthHeader(userData: Pick<User, 'id'>) {
    const accessToken = Container.get(AuthService).generateAccessToken(userData);
    return `Bearer ${accessToken}`;
}
