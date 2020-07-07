import { useSessionStateQuery } from '../../../../../../graphql/generated-types';
import { ExtendedSessionState, SessionStateUtils } from './SessionStateUtils';


export function useSessionState(): ExtendedSessionState {
    const { data } = useSessionStateQuery({ fetchPolicy: 'cache-only' });
    return SessionStateUtils.extendSessionState(data?.sessionState || SessionStateUtils.DEFAULT_SESSION_SATE);
}
