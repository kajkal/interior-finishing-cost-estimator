import { validate } from 'class-validator';

import { UserEntitySpiesManager } from '../../../../__mocks__/entities/UserEntitySpiesManager';

import { IsEmailAvailable } from '../../../../../src/modules/user/validators/IsEmailAvailable';
import { User } from '../../../../../src/entities/User';


describe('IsEmailAvailable custom decorator ', () => {

    beforeEach(() => {
        UserEntitySpiesManager.setupSpies();
    });

    afterEach(() => {
        UserEntitySpiesManager.restoreSpies();
    });

    class SampleClass {
        @IsEmailAvailable()
        email: string = 'sample.email@domain.com';
    }

    it('should succeed if there is no user in db with given email', async () => {
        expect.assertions(3);

        // given
        UserEntitySpiesManager.findOne.mockResolvedValue(undefined);
        const objectToValidate = new SampleClass();

        // given/when
        const validationErrors = await validate(objectToValidate);

        // then
        expect(validationErrors).toMatchObject([]);
        expect(UserEntitySpiesManager.findOne).toHaveBeenCalledTimes(1);
        expect(UserEntitySpiesManager.findOne).toHaveBeenCalledWith({ email: 'sample.email@domain.com' });
    });

    it('should fail if there is user in db with given email', async () => {
        expect.assertions(3);

        // given
        UserEntitySpiesManager.findOne.mockResolvedValue({} as User);
        const objectToValidate = new SampleClass();

        // given/when
        const validationErrors = await validate(objectToValidate);

        // then
        expect(validationErrors).toMatchObject([ {
            constraints: {
                emailAvailability: 'EMAIL_NOT_AVAILABLE',
            },
        } ]);
        expect(UserEntitySpiesManager.findOne).toHaveBeenCalledTimes(1);
        expect(UserEntitySpiesManager.findOne).toHaveBeenCalledWith({ email: 'sample.email@domain.com' });
    });

});
