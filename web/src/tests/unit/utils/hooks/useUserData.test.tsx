import React from 'react';
import { Cache, InMemoryCache } from '@apollo/client';
import { MockedProvider } from '@apollo/client/testing';
import { renderHook } from '@testing-library/react-hooks';

import { MeDocument, MeQuery } from '../../../../graphql/generated-types';
import { useUserData, UseUserDataHookResult } from '../../../../code/utils/hooks/useUserData';


describe('useUserData hook', () => {

    function createWrapper(cache: InMemoryCache): React.ComponentType {
        return (props) => (
            <MockedProvider cache={cache}>
                {props.children as React.ReactElement}
            </MockedProvider>
        );
    }

    const mockCacheRecords: Record<string, Cache.WriteQueryOptions<MeQuery | undefined, undefined>> = {
        notAuthenticated: {
            query: MeDocument,
            data: undefined,
        },
        authenticated: {
            query: MeDocument,
            data: {
                me: {
                    __typename: 'User',
                    name: 'Sample Name',
                    slug: 'sample-slug',
                    email: '',
                    products: [],
                    productCount: 0,
                    projects: [],
                    offers: [],
                } as MeQuery['me'],
            },
        },
    };

    it('should return empty user data object from cache', async () => {
        const cache = new InMemoryCache();
        cache.writeQuery(mockCacheRecords.notAuthenticated);
        const { result, waitForNextUpdate } = renderHook<never, UseUserDataHookResult>(() => useUserData(), {
            wrapper: createWrapper(cache),
        });

        await waitForNextUpdate();

        expect(result.current).toEqual({
            userData: undefined,
            isLoggedIn: false,
        });
    });

    it('should return mapped user data from cache', async () => {
        const cache = new InMemoryCache();
        cache.writeQuery(mockCacheRecords.authenticated);
        const { result, waitForNextUpdate } = renderHook<never, UseUserDataHookResult>(() => useUserData(), {
            wrapper: createWrapper(cache),
        });

        await waitForNextUpdate();

        expect(result.current).toEqual({
            userData: {
                name: 'Sample Name',
                slug: 'sample-slug',
                projects: [],
            },
            isLoggedIn: true,
        });
    });

});
