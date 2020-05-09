import { JwtService } from '../../../src/services/JwtService';


export class JwtServiceSpiesManager {

    static generate: jest.SpiedFunction<typeof JwtService.prototype.generate>;
    static verify: jest.SpiedFunction<typeof JwtService.prototype.verify>;
    static invalidate: jest.SpiedFunction<typeof JwtService.prototype.invalidate>;

    static setupSpies() {
        this.restoreSpies();
        this.generate = jest.spyOn(JwtService.prototype, 'generate');
        this.verify = jest.spyOn(JwtService.prototype, 'verify');
        this.invalidate = jest.spyOn(JwtService.prototype, 'invalidate');
    }

    static setupSpiesAndMockImplementations() {
        this.setupSpies();
        this.generate.mockImplementation();
        this.verify.mockImplementation();
        this.invalidate.mockImplementation();
    }

    private static restoreSpies() {
        this.generate?.mockRestore();
        this.verify?.mockRestore();
        this.invalidate?.mockRestore();
    }

}
