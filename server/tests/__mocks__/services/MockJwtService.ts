import { JwtService } from '../../../src/services/JwtService';


export class MockJwtService {

    static generate: jest.MockedFunction<typeof JwtService.prototype.generate>;
    static verify: jest.MockedFunction<typeof JwtService.prototype.verify>;
    static invalidate: jest.MockedFunction<typeof JwtService.prototype.invalidate>;

    static setupMocks() {
        this.generate = jest.fn();
        this.verify = jest.fn();
        this.invalidate = jest.fn();
    }

    static setupSpies() {
        const instance = new JwtService();
        this.generate = jest.fn().mockImplementation(instance.generate);
        this.verify = jest.fn().mockImplementation(instance.verify);
        this.invalidate = jest.fn().mockImplementation(instance.invalidate);
    }

}
