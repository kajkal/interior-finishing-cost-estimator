import { expectValidationErrors } from '../../../../__utils__/validation-utils/validationUtils';

import { RegisterFormData } from '../../../../../src/resolvers/user/input/RegisterFormData';
import { LoginFormData } from '../../../../../src/resolvers/user/input/LoginFormData';


describe('RegisterFormData class', () => {

    function createRegisterFormDataObject(data: Partial<RegisterFormData>): RegisterFormData {
        const validDefaultData: RegisterFormData = {
            name: 'valid name',
            email: 'valid.email@domain.com',
            password: 'valid password',
        };
        return Object.assign(new RegisterFormData(), validDefaultData, data);
    }

    it('should inherit fields from login form data', () => {
        // when/given
        const objectToValidate = new RegisterFormData();

        // then
        expect(objectToValidate).toBeInstanceOf(LoginFormData);
    });


    describe('name field', () => {

        it('should accept valid name', () => {
            expectValidationErrors(createRegisterFormDataObject({
                name: 'valid name',
            }), []);
            expectValidationErrors(createRegisterFormDataObject({
                name: 'valid-name',
            }), []);
        });

        it('should reject too short name', () => {
            expectValidationErrors(createRegisterFormDataObject({
                name: 'aa',
            }), [ {
                length: expect.stringMatching(/name must be longer than or equal to \d+ characters/),
            } ]);
        });

        it('should reject too long name', () => {
            expectValidationErrors(createRegisterFormDataObject({
                name: 'a'.repeat(256),
            }), [ {
                length: expect.stringMatching(/name must be shorter than or equal to \d+ characters/),
            } ]);
        });

    });

});
