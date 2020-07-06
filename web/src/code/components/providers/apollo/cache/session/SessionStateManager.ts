import ApolloClient from 'apollo-boost';
import { DataProxy } from 'apollo-cache';

import { LoginMutation, MeDocument, MeQuery, RegisterMutation, SessionState, SessionStateDocument, SessionStateQuery } from '../../../../../../graphql/generated-types';
import { ApolloCacheShape } from '../ApolloCacheShape';


export interface ExtendedSessionState extends SessionState {
    isUserLoggedIn: boolean;
}

export class SessionStateManager {

    static readonly DEFAULT_SESSION_SATE: SessionState = {
        __typename: 'SessionState',
        accessToken: '',
    };

    static setDefaultSessionState(client: ApolloClient<ApolloCacheShape>) {
        this.setSessionState(client, SessionStateManager.DEFAULT_SESSION_SATE);
    }

    static setSessionState(client: ApolloClient<ApolloCacheShape>, newState: SessionState) {
        client.writeQuery<SessionStateQuery>({
            query: SessionStateDocument,
            data: {
                sessionState: {
                    __typename: 'SessionState',
                    ...newState,
                },
            },
        });
    }

    /**
     * Unlike SessionStateManager.setSessionState will not broadcast state change - silent update.
     */
    static setSessionStateSilent(cache: DataProxy, newState: SessionState) {
        cache.writeQuery<SessionStateQuery>({
            query: SessionStateDocument,
            data: {
                sessionState: {
                    __typename: 'SessionState',
                    ...newState,
                },
            },
        });
    }

    static getSessionState(cache: DataProxy): SessionState {
        const { sessionState } = cache.readQuery<SessionStateQuery>({ query: SessionStateDocument })!;
        return sessionState;
    }

    static extendSessionState(sessionState: SessionState): ExtendedSessionState {
        return {
            ...sessionState,
            isUserLoggedIn: Boolean(sessionState.accessToken),
        };
    }

    /**
     * Login or register mutations handler.
     * Adds access token and user initial data to cache.
     */
    static handleAccessMutationResponse(cache: DataProxy, initialData: LoginMutation['login'] | RegisterMutation['register']) {
        cache.writeQuery<MeQuery>({
            query: MeDocument,
            data: {
                me: initialData.user,
            },
        });
        SessionStateManager.setSessionStateSilent(cache, {
            accessToken: initialData.accessToken,
        });
    }

}

