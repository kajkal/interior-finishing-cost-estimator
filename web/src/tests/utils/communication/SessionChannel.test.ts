import { BroadcastChannelSpiesManager } from '../../__utils__/spies-managers/BroadcastChannelSpiesManager';
import { waitUntil } from '../../__utils__/waitUntil';

import { SessionActionType } from '../../../code/utils/communication/SessionActionType';
import { SessionChannel } from '../../../code/utils/communication/SessionChannel';
import { LoginMutation } from '../../../graphql/generated-types';


describe('SessionChannel class', () => {

    beforeEach(() => {
        BroadcastChannelSpiesManager.setupSpies();
    });

    it('should add and later remove session event lister', async () => {
        const mockListener = jest.fn();

        SessionChannel.addSessionEventListener(mockListener);
        await SessionChannel.publishLogoutSessionAction();

        expect(BroadcastChannelSpiesManager.addEventListener).toHaveBeenCalledTimes(1);
        expect(BroadcastChannelSpiesManager.addEventListener).toHaveBeenCalledWith('message', mockListener);

        SessionChannel.removeSessionEventListener(mockListener);
        await SessionChannel.publishLogoutSessionAction();

        expect(BroadcastChannelSpiesManager.removeEventListener).toHaveBeenCalledTimes(1);
        expect(BroadcastChannelSpiesManager.removeEventListener).toHaveBeenCalledWith('message', mockListener);
    });

    it('should notify listeners about login event', async () => {
        const mockListener = jest.fn();
        const sampleInitialData: LoginMutation['login'] = {
            __typename: 'InitialData',
            user: {} as LoginMutation['login']['user'],
            accessToken: 'accessTokenTestValue',
        };

        SessionChannel.addSessionEventListener(mockListener);
        await SessionChannel.publishLoginSessionAction(sampleInitialData);

        // verify if listener was notified
        await waitUntil(() => expect(mockListener).toHaveBeenCalledTimes(1));
        expect(mockListener).toHaveBeenCalledWith({
            type: SessionActionType.LOGIN,
            initialData: sampleInitialData,
        });

        SessionChannel.removeSessionEventListener(mockListener);
    });

    it('should notify listeners about logout event', async () => {
        const mockListener = jest.fn();

        SessionChannel.addSessionEventListener(mockListener);
        await SessionChannel.publishLogoutSessionAction();

        // verify if listener was notified
        await waitUntil(() => expect(mockListener).toHaveBeenCalledTimes(1));
        expect(mockListener).toHaveBeenCalledWith({
            type: SessionActionType.LOGOUT,
        });

        SessionChannel.removeSessionEventListener(mockListener);
    });

});
