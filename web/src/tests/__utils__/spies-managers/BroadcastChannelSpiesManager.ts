import { BroadcastChannel } from 'broadcast-channel';


export class BroadcastChannelSpiesManager {

    static addEventListener: jest.SpiedFunction<typeof BroadcastChannel.prototype.addEventListener>;
    static removeEventListener: jest.SpiedFunction<typeof BroadcastChannel.prototype.removeEventListener>;
    static postMessage: jest.SpiedFunction<typeof BroadcastChannel.prototype.postMessage>;

    static setupSpies() {
        this.restoreSpies();
        this.addEventListener = jest.spyOn(BroadcastChannel.prototype, 'addEventListener');
        this.removeEventListener = jest.spyOn(BroadcastChannel.prototype, 'removeEventListener');
        this.postMessage = jest.spyOn(BroadcastChannel.prototype, 'postMessage');
    }

    private static restoreSpies() {
        this.addEventListener?.mockRestore();
        this.removeEventListener?.mockRestore();
        this.postMessage?.mockRestore();
    }

}
