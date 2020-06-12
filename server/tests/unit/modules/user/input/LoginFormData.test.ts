import { passwordTestValue } from '../../../../__utils__/validation-utils/test-data/passwordTestData';
import { emailTestValue } from '../../../../__utils__/validation-utils/test-data/emailTestData';
import { expectValidationErrors } from '../../../../__utils__/validation-utils/validationUtils';

import { LoginFormData } from '../../../../../src/modules/user/input/LoginFormData';


describe('LoginFormData class', () => {

    function createLoginFormDataObject(data: Partial<LoginFormData>): LoginFormData {
        const validDefaultData: LoginFormData = {
            email: 'valid.email@domain.com',
            password: 'valid password',
        };
        return Object.assign(new LoginFormData(), validDefaultData, data);
    }

    describe('email field', () => {

        it('should accept valid email', () => {
            emailTestValue.valid.forEach(({ data, expectedErrors }) => {
                expectValidationErrors(createLoginFormDataObject(data), expectedErrors);
            });
        });

        it('should reject invalid email', () => {
            emailTestValue.invalid.forEach(({ data, expectedErrors }) => {
                expectValidationErrors(createLoginFormDataObject(data), expectedErrors);
            });
        });

    });

    describe('password field', () => {

        it('should accept valid password', () => {
            passwordTestValue.valid.forEach(({ data, expectedErrors }) => {
                expectValidationErrors(createLoginFormDataObject(data), expectedErrors);
            });
        });

        it('should reject too short password', () => {
            passwordTestValue.tooShort.forEach(({ data, expectedErrors }) => {
                expectValidationErrors(createLoginFormDataObject(data), expectedErrors);
            });
        });

        it('should reject too long password', () => {
            passwordTestValue.tooLong.forEach(({ data, expectedErrors }) => {
                expectValidationErrors(createLoginFormDataObject(data), expectedErrors);
            });
        });

    });

});
