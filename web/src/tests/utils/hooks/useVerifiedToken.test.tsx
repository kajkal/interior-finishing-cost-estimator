import React from 'react';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import { renderHook } from '@testing-library/react-hooks';

import { TokenVerifierSpy } from '../../__utils__/spies-managers/TokenVerifierSpy';

import { useVerifiedToken } from '../../../code/utils/hooks/useVerifiedToken';


describe('useVerifiedToken hook', () => {

    beforeEach(() => {
        TokenVerifierSpy.setupSpiesAndMockImplementations();
    });

    it('should return null when TokenVerifier cannot extract token payload', () => {
        TokenVerifierSpy.create.mockImplementation(() => {
            throw new JsonWebTokenError('INVALID_TOKEN_PAYLOAD');
        });
        const { result } = renderHook(() => useVerifiedToken('sample-token'));
        expect(result.current).toEqual([ null, null ]);
    });

    it('should return null when TokenVerifier cannot find subject in token payload', () => {
        TokenVerifierSpy.verifyTokenSubject.mockImplementation(() => {
            throw new JsonWebTokenError('INVALID_TOKEN_SUBJECT');
        });
        const { result } = renderHook(() => useVerifiedToken('sample-token'));
        expect(result.current).toEqual([ null, null ]);
    });

    it('should return null when TokenVerifier find out that token is expired', () => {
        TokenVerifierSpy.verifyTokenExpiration.mockImplementation((skipThisStep = false): any => {
            if (!skipThisStep) {
                throw new TokenExpiredError('TOKEN_EXPIRED', new Date(1591979700000)); // 2020-06-12 16:35
            }
        });
        const { result } = renderHook(() => useVerifiedToken('sample-token', 'checkExpiration'));
        expect(result.current).toEqual([ null, new Date(1591979700000) ]); // 2020-06-12 16:35
    });

    it('should return verified token (when \'checkExpiration\' flag is not added)', () => {
        TokenVerifierSpy.verifyTokenExpiration.mockImplementation((skipThisStep = false): any => {
            if (!skipThisStep) {
                throw new TokenExpiredError('TOKEN_EXPIRED', new Date()); // even when token expired
            }
        });
        const { result } = renderHook(() => useVerifiedToken('sample-token'));
        expect(result.current).toEqual([ 'sample-token', null ]);
    });

    it('should return verified token', () => {
        const { result } = renderHook(() => useVerifiedToken('sample-token', 'checkExpiration'));
        expect(result.current).toEqual([ 'sample-token', null ]);
    });

});
