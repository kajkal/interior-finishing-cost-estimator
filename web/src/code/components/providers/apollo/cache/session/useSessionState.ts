import { useSessionStateQuery } from '../../../../../../graphql/generated-types';
import { ExtendedSessionState, SessionStateManager } from './SessionStateManager';


export function useSessionState(): ExtendedSessionState {
    const { data } = useSessionStateQuery({ fetchPolicy: 'cache-only' });
    return SessionStateManager.extendSessionState(data?.sessionState || SessionStateManager.DEFAULT_SESSION_SATE);
}
