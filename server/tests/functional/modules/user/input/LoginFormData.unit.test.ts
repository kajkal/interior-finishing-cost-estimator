import 'reflect-metadata';
import { validateSync, ValidationError } from 'class-validator';

import { LoginFormData } from '../../../../../src/modules/user/input/LoginFormData';
import { DeepPartial } from '../../../../test-utils/DeepPartial';


describe('Login form data class', () => {

    function expectToReturnErrors(
        {
            email = 'valid.email@domain.com',
            password = 'valid password',
        }: Partial<LoginFormData>,
        expectedErrors: DeepPartial<ValidationError>[],
    ) {
        // given
        const objectToValidate = new LoginFormData();
        objectToValidate.email = email;
        objectToValidate.password = password;

        // when
        const validationErrors = validateSync(objectToValidate);

        // then
        expect(validationErrors).toMatchObject(expectedErrors);
    }

    describe('email field', () => {

        it('should accept valid email', () => {
            expectToReturnErrors({
                email: 'valid.email@domain.com',
            }, []);
            expectToReturnErrors({
                email: 'valid_email@domain.com',
            }, []);
        });

        it('should reject invalid email', () => {
            expectToReturnErrors({
                email: 'invalid-email',
            }, [ {
                constraints: {
                    isEmail: expect.stringMatching(/email must be an email/),
                },
            } ]);
            expectToReturnErrors({
                email: 'invalid.email@domain',
            }, [ {
                constraints: {
                    isEmail: expect.stringMatching(/email must be an email/),
                },
            } ]);
            expectToReturnErrors({
                email: 'invalid.email.domain.com',
            }, [ {
                constraints: {
                    isEmail: expect.stringMatching(/email must be an email/),
                },
            } ]);
        });

    });

    describe('password field', () => {

        it('should accept valid password', () => {
            expectToReturnErrors({
                password: 'valid password',
            }, []);
        });

        it('should reject too short password', () => {
            expectToReturnErrors({
                password: 'aa',
            }, [ {
                constraints: {
                    length: expect.stringMatching(/password must be longer than or equal to \d+ characters/),
                },
            } ]);
        });

        it('should reject too long password', () => {
            expectToReturnErrors({
                password: 'a'.repeat(256),
            }, [ {
                constraints: {
                    length: expect.stringMatching(/password must be shorter than or equal to \d+ characters/),
                },
            } ]);
        });

    });

});
