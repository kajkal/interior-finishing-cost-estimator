import ApolloClient from 'apollo-boost';

import { SessionStateManager } from '../cache/session/SessionStateManager';
import { ApolloCacheShape } from '../cache/ApolloCacheShape';
import { AuthUtils } from '../../../../utils/auth/AuthUtils';


export function initApolloClient(initialCacheState: ApolloCacheShape): ApolloClient<ApolloCacheShape> {
    const client = new ApolloClient<ApolloCacheShape>({
        uri: `${process.env.REACT_APP_SERVER_URL}/graphql`,
        credentials: 'include',
        request: AuthUtils.prepareRequest,
        resolvers: {}, // use @client with cache without using local resolvers
    });

    SessionStateManager.setSessionState(client, initialCacheState.sessionState);

    client.onClearStore(async () => {
        SessionStateManager.setDefaultSessionState(client);
    });

    return client;
}
