import ApolloClient from 'apollo-boost';

import { SessionState, SessionStateDocument, SessionStateQuery } from '../../../../../../graphql/generated-types';
import { ApolloCacheShape } from '../ApolloCacheShape';


export interface ExtendedSessionState extends SessionState {
    isUserLoggedIn: boolean;
}

export class SessionStateUtils {

    static readonly DEFAULT_SESSION_SATE: SessionState = {
        __typename: 'SessionState',
        accessToken: '',
    };

    static setDefaultSessionState(client: ApolloClient<ApolloCacheShape>) {
        this.setSessionState(client, SessionStateUtils.DEFAULT_SESSION_SATE);
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

    static getSessionState(client: ApolloClient<ApolloCacheShape>): SessionState {
        const { sessionState } = client.readQuery<SessionStateQuery>({ query: SessionStateDocument })!;
        return sessionState;
    }

    static extendSessionState(sessionState: SessionState): ExtendedSessionState {
        return {
            ...sessionState,
            isUserLoggedIn: Boolean(sessionState.accessToken),
        };
    }

}

