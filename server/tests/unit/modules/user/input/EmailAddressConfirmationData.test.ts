import { sign } from 'jsonwebtoken';

import { tokenTestValue } from '../../../../__utils__/validation-utils/test-data/tokenTestData';
import { expectValidationErrors } from '../../../../__utils__/validation-utils/validationUtils';

import { EmailAddressConfirmationData } from '../../../../../src/modules/user/input/EmailAddressConfirmationData';


describe('EmailAddressConfirmationData class', () => {

    function createEmailAddressConfirmationDataObject(data: Partial<EmailAddressConfirmationData>): EmailAddressConfirmationData {
        const validDefaultData: EmailAddressConfirmationData = {
            token: sign({}, 'shhh'),
        };
        return Object.assign(new EmailAddressConfirmationData(), validDefaultData, data);
    }

    describe('token field', () => {

        it('should accept valid token', () => {
            tokenTestValue.valid.forEach(({ data, expectedErrors }) => {
                expectValidationErrors(createEmailAddressConfirmationDataObject(data), expectedErrors);
            });
        });

        it('should reject invalid token', () => {
            tokenTestValue.invalid.forEach(({ data, expectedErrors }) => {
                expectValidationErrors(createEmailAddressConfirmationDataObject(data), expectedErrors);
            });
        });

    });

});
