import 'reflect-metadata';
import { sign } from 'jsonwebtoken';
import { validateSync, ValidationError } from 'class-validator';

import { DeepPartial } from '../../../../__utils__/DeepPartial';

import { EmailAddressConfirmationData } from '../../../../../src/modules/user/input/EmailAddressConfirmationData';


describe('Email address confirmation data class', () => {

    function createValidToken() {
        return sign({}, 'shhh');
    }

    function expectToReturnErrors(
        { token = createValidToken() }: Partial<EmailAddressConfirmationData>,
        expectedErrors: DeepPartial<ValidationError>[],
    ) {
        // given
        const objectToValidate = new EmailAddressConfirmationData();
        objectToValidate.token = token;

        // when
        const validationErrors = validateSync(objectToValidate);

        // then
        expect(validationErrors).toMatchObject(expectedErrors);
    }

    describe('token field', () => {

        it('should accept valid token', () => {
            expectToReturnErrors({
                token: createValidToken(),
            }, []);
        });

        it('should reject invalid token', () => {
            expectToReturnErrors({
                token: '',
            }, [ {
                constraints: {
                    isJwt: expect.stringMatching(/token must be a jwt string/),
                },
            } ]);
            expectToReturnErrors({
                token: 'invalid-token',
            }, [ {
                constraints: {
                    isJwt: expect.stringMatching(/token must be a jwt string/),
                },
            } ]);
        });

    });

});
