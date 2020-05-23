import jwt from 'jsonwebtoken';


export class JsonWebTokenSpiesManager {

    static sign: jest.SpiedFunction<typeof jwt.sign>;
    static verify: jest.SpiedFunction<typeof jwt.verify>;

    static setupSpies() {
        this.restoreSpies();
        this.sign = jest.spyOn(jwt, 'sign');
        this.verify = jest.spyOn(jwt, 'verify');
    }

    private static restoreSpies() {
        this.sign?.mockRestore();
        this.verify?.mockRestore();
    }

}
