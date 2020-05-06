import * as serviceWorker from '../../../serviceWorker';


export class MockServiceWorker {

    static register: jest.MockedFunction<typeof serviceWorker.register>;
    static unregister: jest.MockedFunction<typeof serviceWorker.unregister>;

    static setupMocks() {
        this.register = jest.fn();
        this.unregister = jest.fn();
    }

}

jest.mock('../../../serviceWorker', () => MockServiceWorker);
