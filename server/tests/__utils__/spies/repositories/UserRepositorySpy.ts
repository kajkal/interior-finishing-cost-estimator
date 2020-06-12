import { UserRepository } from '../../../../src/repositories/UserRepository';


export class UserRepositorySpy {

    static isEmailTaken: jest.SpiedFunction<typeof UserRepository.prototype.isEmailTaken>;
    static find: jest.SpiedFunction<typeof UserRepository.prototype.find>;
    static findOne: jest.SpiedFunction<typeof UserRepository.prototype.findOne>;
    static findOneOrFail: jest.SpiedFunction<typeof UserRepository.prototype.findOneOrFail>;
    static create: jest.SpiedFunction<typeof UserRepository.prototype.create>;
    static persistAndFlush: jest.SpiedFunction<typeof UserRepository.prototype.persistAndFlush>;

    static setupSpies() {
        this.restoreSpies();
        this.isEmailTaken = jest.spyOn(UserRepository.prototype, 'isEmailTaken');
        this.find = jest.spyOn(UserRepository.prototype, 'find');
        this.findOne = jest.spyOn(UserRepository.prototype, 'findOne');
        this.findOneOrFail = jest.spyOn(UserRepository.prototype, 'findOneOrFail');
        this.create = jest.spyOn(UserRepository.prototype, 'create');
        this.persistAndFlush = jest.spyOn(UserRepository.prototype, 'persistAndFlush');
    }

    private static restoreSpies() {
        this.isEmailTaken?.mockRestore();
        this.find?.mockRestore();
        this.findOne?.mockRestore();
        this.findOneOrFail?.mockRestore();
        this.create?.mockRestore();
        this.persistAndFlush?.mockRestore();
    }

}
