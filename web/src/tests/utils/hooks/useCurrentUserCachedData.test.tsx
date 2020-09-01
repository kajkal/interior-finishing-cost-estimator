import React from 'react';
import { renderHook } from '@testing-library/react-hooks';

import { ContextMocks, MockContextProvider } from '../../__utils__/mocks/MockContextProvider';
import { generator } from '../../__utils__/generator';

import { initApolloCache } from '../../../code/components/providers/apollo/client/initApolloClient';
import { useCurrentUserCachedData } from '../../../code/utils/hooks/useCurrentUserCachedData';


describe('useCurrentUserCachedData hook', () => {

    const sampleUser = generator.user();

    function createWrapper(mocks?: ContextMocks): React.ComponentType {
        return ({ children }) => (
            <MockContextProvider mocks={mocks}>
                {children}
            </MockContextProvider>
        );
    }

    it('should return undefined when cache is empty', async () => {
        const cache = initApolloCache();

        const { result: { current }, waitForNextUpdate } = renderHook(useCurrentUserCachedData, {
            wrapper: createWrapper({ apolloCache: cache }),
        });
        await waitForNextUpdate();
        expect(current).toBe(undefined);
    });

    it('should return user data from apollo cache', () => {
        const cache = initApolloCache();
        cache.restore({
            [ cache.identify(sampleUser)! ]: sampleUser,
            ROOT_QUERY: {
                __typename: 'Query',
                me: { __ref: cache.identify(sampleUser) },
            },
        });

        const { result: { current } } = renderHook(useCurrentUserCachedData, {
            wrapper: createWrapper({ apolloCache: cache }),
        });
        expect(current).toEqual(sampleUser);
    });

});
