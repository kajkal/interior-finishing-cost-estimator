import React from 'react';
import { InMemoryCache } from 'apollo-boost';
import { Cache } from 'apollo-cache/src/types/index';
import { renderHook } from '@testing-library/react-hooks';
import { MockedProvider } from '@apollo/react-testing';

import { SessionStateDocument, SessionStateQuery } from '../../../../../../../graphql/generated-types';
import { useSessionState } from '../../../../../../../code/components/providers/apollo/cache/session/useSessionState';


describe('useSessionState hook', () => {

    function createWrapper(cache: InMemoryCache): React.ComponentType {
        return (props) => (
            <MockedProvider cache={cache} resolvers={{}}>
                {props.children as React.ReactElement}
            </MockedProvider>
        );
    }

    const mockCacheRecords: Record<string, Cache.WriteQueryOptions<SessionStateQuery, undefined>> = {
        notAuthenticated: {
            query: SessionStateDocument,
            data: {
                sessionState: {
                    accessToken: '',
                    __typename: 'SessionState',
                },
            },
        },
        authenticated: {
            query: SessionStateDocument,
            data: {
                sessionState: {
                    accessToken: 'tokenValueFromCache',
                    __typename: 'SessionState',
                },
            },
        },
    };

    it('should return default session state when cache is empty', async (done) => {
        const cache = new InMemoryCache();
        const { result, waitForNextUpdate } = renderHook(() => useSessionState(), {
            wrapper: createWrapper(cache),
        });

        await waitForNextUpdate();

        expect(result.current).toEqual({
            __typename: 'SessionState',
            accessToken: '',
            isUserLoggedIn: false,
        });
        done();
    });

    it('should return not authenticated session state from cache', async (done) => {
        const cache = new InMemoryCache();
        cache.writeQuery(mockCacheRecords.notAuthenticated);
        const { result, waitForNextUpdate } = renderHook(() => useSessionState(), {
            wrapper: createWrapper(cache),
        });

        await waitForNextUpdate();

        expect(result.current).toEqual({
            __typename: 'SessionState',
            accessToken: '',
            isUserLoggedIn: false,
        });
        done();
    });

    it('should return full session state from cache', async (done) => {
        const cache = new InMemoryCache();
        cache.writeQuery(mockCacheRecords.authenticated);
        const { result, waitForNextUpdate } = renderHook(() => useSessionState(), {
            wrapper: createWrapper(cache),
        });

        await waitForNextUpdate();

        expect(result.current).toEqual({
            __typename: 'SessionState',
            accessToken: 'tokenValueFromCache',
            isUserLoggedIn: true,
        });
        done();
    });

});
