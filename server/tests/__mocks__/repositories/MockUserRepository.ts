import { ObjectID } from 'typeorm';
import { UserRepository } from '../../../src/repositories/UserRepository';
import { User } from '../../../src/entities/User';


export class MockUserRepository {

    static isEmailTaken: jest.MockedFunction<typeof UserRepository.prototype.isEmailTaken>;

    static find: jest.MockedFunction<typeof UserRepository.prototype.find>;
    static findOne: jest.MockedFunction<typeof UserRepository.prototype.findOne>;
    static create: jest.MockedFunction<typeof UserRepository.prototype.create>;
    static save: jest.MockedFunction<typeof UserRepository.prototype.save>;

    static setupMocks() {
        this.isEmailTaken = jest.fn();
        this.find = jest.fn();
        this.findOne = jest.fn();
        this.create = jest.fn().mockImplementation((data) => Object.assign(new User(), data));
        this.save = jest.fn().mockImplementation(function (userToSave: User) {
            userToSave.id = `TEST_ID_FOR_${userToSave.email}` as unknown as ObjectID;
            return Promise.resolve(userToSave);
        });
    }

}
