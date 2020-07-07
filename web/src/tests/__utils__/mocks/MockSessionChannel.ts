import { SessionAction, SessionChannel } from '../../../code/utils/communication/SessionChannel';


export class MockSessionChannel {

    static addSessionEventListener: jest.MockedFunction<typeof SessionChannel.addSessionEventListener> = jest.fn();
    static removeSessionEventListener: jest.MockedFunction<typeof SessionChannel.removeSessionEventListener> = jest.fn();
    static publishLoginSessionAction: jest.MockedFunction<typeof SessionChannel.publishLoginSessionAction> = jest.fn();
    static publishLogoutSessionAction: jest.MockedFunction<typeof SessionChannel.publishLogoutSessionAction> = jest.fn();

    static simulateSessionEvent(sessionEvent: SessionAction) {
        const handler = this.addSessionEventListener.mock.calls[ 0 ][ 0 ] as (action: SessionAction) => void;
        handler(sessionEvent);
    }

    static setupMocks() {
        this.addSessionEventListener.mockReset();
        this.removeSessionEventListener.mockReset();
        this.publishLogoutSessionAction.mockReset();
        this.publishLoginSessionAction.mockReset();
    }

}

jest.mock('../../../code/utils/communication/SessionChannel', () => ({
    SessionChannel: MockSessionChannel,
}));
