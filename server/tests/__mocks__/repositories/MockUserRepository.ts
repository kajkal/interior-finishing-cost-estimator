import { User } from '../../../src/entities/user/User';
import { UserRepository } from '../../../src/repositories/UserRepository';


export class MockUserRepository {

    static isEmailTaken: jest.MockedFunction<typeof UserRepository.prototype.isEmailTaken>;
    static find: jest.MockedFunction<typeof UserRepository.prototype.find>;
    static findOne: jest.MockedFunction<typeof UserRepository.prototype.findOne>;
    static findOneOrFail: jest.MockedFunction<typeof UserRepository.prototype.findOneOrFail>;
    static create: jest.MockedFunction<typeof UserRepository.prototype.create>;
    static persistAndFlush: jest.MockedFunction<typeof UserRepository.prototype.persistAndFlush>;

    static setupMocks() {
        this.isEmailTaken = jest.fn();
        this.find = jest.fn();
        this.findOne = jest.fn();
        this.findOneOrFail = jest.fn();
        this.create = jest.fn().mockImplementation((data) => Object.assign(new User(), data));
        this.persistAndFlush = jest.fn().mockImplementation(function (userToSave: User) {
            userToSave.id = `TEST_ID_FOR_${userToSave.email}`;
            return Promise.resolve(userToSave);
        });
    }

}
