import { sign } from 'jsonwebtoken';

import { passwordTestValue } from '../../../../__utils__/validation-utils/test-data/passwordTestData';
import { tokenTestValue } from '../../../../__utils__/validation-utils/test-data/tokenTestData';
import { expectValidationErrors } from '../../../../__utils__/validation-utils/validationUtils';

import { PasswordResetFormData } from '../../../../../src/resolvers/user/input/PasswordResetFormData';


describe('PasswordResetFormData class', () => {

    function createPasswordResetFormDataObject(data: Partial<PasswordResetFormData>): PasswordResetFormData {
        const validDefaultData: PasswordResetFormData = {
            token: sign({}, 'shhh'),
            password: 'valid password',
        };
        return Object.assign(new PasswordResetFormData(), validDefaultData, data);
    }

    describe('token field', () => {

        it('should accept valid token', () => {
            tokenTestValue.valid.forEach(({ data, expectedErrors }) => {
                expectValidationErrors(createPasswordResetFormDataObject(data), expectedErrors);
            });
        });

        it('should reject invalid token', () => {
            tokenTestValue.invalid.forEach(({ data, expectedErrors }) => {
                expectValidationErrors(createPasswordResetFormDataObject(data), expectedErrors);
            });
        });

    });

    describe('password field', () => {

        it('should accept valid password', () => {
            passwordTestValue.valid.forEach(({ data, expectedErrors }) => {
                expectValidationErrors(createPasswordResetFormDataObject(data), expectedErrors);
            });
        });

        it('should reject too short password', () => {
            passwordTestValue.tooShort.forEach(({ data, expectedErrors }) => {
                expectValidationErrors(createPasswordResetFormDataObject(data), expectedErrors);
            });
        });

        it('should reject too long password', () => {
            passwordTestValue.tooLong.forEach(({ data, expectedErrors }) => {
                expectValidationErrors(createPasswordResetFormDataObject(data), expectedErrors);
            });
        });

    });

});
