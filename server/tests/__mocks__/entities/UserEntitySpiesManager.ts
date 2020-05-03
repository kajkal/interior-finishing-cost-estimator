import { User } from '../../../src/entities/User';
import { JestMethodSpy } from '../JestMethodSpy';


export class UserEntitySpiesManager {

    // static methods:
    static find: JestMethodSpy<typeof User.find>;
    static findOne: JestMethodSpy<typeof User.findOne>;
    static create: JestMethodSpy<typeof User.create>;

    // instance methods:
    static save: JestMethodSpy<typeof User.prototype.save>;

    static setupSpies() {
        this.find = jest.spyOn(User, 'find');
        this.findOne = jest.spyOn(User, 'findOne');
        this.create = jest.spyOn(User, 'create').mockImplementation((data) => Object.assign(new User(), data));

        this.save = jest.spyOn(User.prototype, 'save').mockImplementation(function () {
            // @ts-ignore
            this.id = `TEST_ID_FOR_${this.email}`;
            // @ts-ignore
            return Promise.resolve(this as User);
        });
    }

    static restoreSpies() {
        Object.values(this).forEach((potentialSpy) => {
            if (jest.isMockFunction(potentialSpy)) {
                potentialSpy.mockRestore();
            }
        });
    }

}
