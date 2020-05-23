export class MockMailService {

    static setApiKey = jest.fn();
    static send = jest.fn();

    static setupMocks() {
        this.setApiKey = jest.fn();
        this.send = jest.fn();
    }

}

jest.mock('@sendgrid/mail', () => MockMailService);
