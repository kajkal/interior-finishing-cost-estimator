import React from 'react';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import { render } from '@testing-library/react';

import { TokenVerifierSpy } from '../../../__utils__/spies-managers/TokenVerifierSpy';

import { useVerifiedToken, VerifiedTokenFlags } from '../../../../code/utils/hooks/useVerifiedToken';


describe('useVerifiedToken hook', () => {

    beforeEach(() => {
        TokenVerifierSpy.setupSpiesAndMockImplementations();
    });

    function HookTestVessel({ flags }: { flags: VerifiedTokenFlags[] }) {
        const results = useVerifiedToken('sample-token', ...flags);
        return <div data-testid='results' data-results={JSON.stringify(results)} />;
    }

    function extractHookResults(...flags: VerifiedTokenFlags[]): [ string | null, Date | null ] {
        const { getByTestId } = render(<HookTestVessel flags={flags} />);
        return JSON.parse(getByTestId('results').dataset.results!);
    }

    it('should return null when TokenVerifier cannot extract token payload', () => {
        TokenVerifierSpy.create.mockImplementation(() => {
            throw new JsonWebTokenError('INVALID_TOKEN_PAYLOAD');
        });
        const result = extractHookResults();
        expect(result).toEqual([ null, null ]);
    });

    it('should return null when TokenVerifier cannot find subject in token payload', () => {
        TokenVerifierSpy.verifyTokenSubject.mockImplementation(() => {
            throw new JsonWebTokenError('INVALID_TOKEN_SUBJECT');
        });
        const result = extractHookResults();
        expect(result).toEqual([ null, null ]);
    });

    it('should return null when TokenVerifier find out that token is expired', () => {
        TokenVerifierSpy.verifyTokenExpiration.mockImplementation((skipThisStep = false): any => {
            if (!skipThisStep) {
                throw new TokenExpiredError('TOKEN_EXPIRED', new Date(1591979700000)); // 2020-06-12 16:35
            }
        });
        const result = extractHookResults('checkExpiration');
        expect(result).toEqual([ null, '2020-06-12T16:35:00.000Z' ]); // should be Date, type is lost in serialization
    });

    it('should return verified token (when \'checkExpiration\' flag is not added)', () => {
        TokenVerifierSpy.verifyTokenExpiration.mockImplementation((skipThisStep = false): any => {
            if (!skipThisStep) {
                throw new TokenExpiredError('TOKEN_EXPIRED', new Date());
            }
        });
        const result = extractHookResults();
        expect(result).toEqual([ 'sample-token', null ]);
    });

    it('should return verified token', () => {
        const result = extractHookResults('checkExpiration');
        expect(result).toEqual([ 'sample-token', null ]);
    });

});
