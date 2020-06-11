export class MockMailService {

    static setApiKey = jest.fn();
    static send = jest.fn();

    static setupMocks() {
        this.setApiKey.mockReset();
        this.send.mockReset();
    }

}

jest.mock('@sendgrid/mail', () => MockMailService);
