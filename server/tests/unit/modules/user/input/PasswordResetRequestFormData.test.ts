import { emailTestValue } from '../../../../__utils__/validation-utils/test-data/emailTestData';
import { expectValidationErrors } from '../../../../__utils__/validation-utils/validationUtils';

import { PasswordResetRequestFormData } from '../../../../../src/resolvers/user/input/PasswordResetRequestFormData';


describe('PasswordResetRequestFormData class', () => {

    function createPasswordResetRequestFormDataObject(data: Partial<PasswordResetRequestFormData>): PasswordResetRequestFormData {
        const validDefaultData: PasswordResetRequestFormData = {
            email: 'valid.email@domain.com',
        };
        return Object.assign(new PasswordResetRequestFormData(), validDefaultData, data);
    }

    describe('email field', () => {

        it('should accept valid email', () => {
            emailTestValue.valid.forEach(({ data, expectedErrors }) => {
                expectValidationErrors(createPasswordResetRequestFormDataObject(data), expectedErrors);
            });
        });

        it('should reject invalid email', () => {
            emailTestValue.invalid.forEach(({ data, expectedErrors }) => {
                expectValidationErrors(createPasswordResetRequestFormDataObject(data), expectedErrors);
            });
        });

    });

});
