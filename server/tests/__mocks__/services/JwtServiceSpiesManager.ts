import { JestMethodSpy } from '../JestMethodSpy';
import { JwtService } from '../../../src/services/JwtService';


export class JwtServiceSpiesManager {

    // static methods:
    static generate: JestMethodSpy<typeof JwtService.generate>;
    static verify: JestMethodSpy<typeof JwtService.verify>;
    static invalidate: JestMethodSpy<typeof JwtService.invalidate>;

    static setupSpies() {
        this.generate = jest.spyOn(JwtService, 'generate');
        this.verify = jest.spyOn(JwtService, 'verify');
        this.invalidate = jest.spyOn(JwtService, 'invalidate');
    }

    static restoreSpies() {
        Object.values(this).forEach((potentialSpy) => {
            if (jest.isMockFunction(potentialSpy)) {
                potentialSpy.mockRestore();
            }
        });
    }

}
