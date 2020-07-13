import { ApolloClient } from '@apollo/client';

import { SessionState, SessionStateDocument, SessionStateQuery } from '../../../../../../graphql/generated-types';
import { ApolloCacheShape } from '../ApolloCacheShape';


export class SessionStateUtils {

    static readonly DEFAULT_SESSION_SATE: SessionState = {
        __typename: 'SessionState',
        accessToken: '',
    };

    static setSessionState(client: ApolloClient<ApolloCacheShape>, newState: SessionState | undefined) {
        client.writeQuery<SessionStateQuery>({
            query: SessionStateDocument,
            data: {
                sessionState: {
                    __typename: 'SessionState',
                    ...SessionStateUtils.DEFAULT_SESSION_SATE,
                    ...newState,
                },
            },
        });
    }

    static getSessionState(client: ApolloClient<ApolloCacheShape>): SessionState {
        const { sessionState } = client.readQuery<SessionStateQuery>({ query: SessionStateDocument })!;
        return sessionState;
    }

}

