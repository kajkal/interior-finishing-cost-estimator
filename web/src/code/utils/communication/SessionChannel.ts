import { BroadcastChannel } from 'broadcast-channel';
import { OnMessageHandler } from 'broadcast-channel/types/broadcast-channel';

import { LoginMutation, RegisterMutation } from '../../../graphql/generated-types';
import { SessionActionType } from './SessionActionType';


export type SessionAction = LoginSessionAction | LogoutSessionAction;

/**
 * This action will login user on all tabs.
 */
export interface LoginSessionAction {
    type: typeof SessionActionType.LOGIN;
    initialData: LoginMutation['login'] | RegisterMutation['register'];
}

/**
 * This action will logout user from all tabs.
 */
export interface LogoutSessionAction {
    type: typeof SessionActionType.LOGOUT;
}

/**
 * Class responsible for communication between tabs in the same session.
 * Synchronizes user status (logged in/logged out) between tabs.
 */
export class SessionChannel {

    private static readonly LISTENER = new BroadcastChannel<SessionAction>('session');
    private static readonly PUBLISHER = new BroadcastChannel<SessionAction>('session');

    static addSessionEventListener(handler: OnMessageHandler<SessionAction>) {
        SessionChannel.LISTENER.addEventListener('message', handler);
    }

    static removeSessionEventListener(handler: OnMessageHandler<SessionAction>) {
        SessionChannel.LISTENER.removeEventListener('message', handler);
    }

    /**
     * @see ApolloContextProvider - session event handler
     */
    static async publishLoginSessionAction(initialData: LoginMutation['login'] | RegisterMutation['register']) {
        await SessionChannel.PUBLISHER.postMessage({
            type: SessionActionType.LOGIN,
            initialData,
        });
    }

    /**
     * @see ApolloContextProvider - session event handler
     */
    static async publishLogoutSessionAction() {
        await SessionChannel.PUBLISHER.postMessage({
            type: SessionActionType.LOGOUT,
        });
    }

}
