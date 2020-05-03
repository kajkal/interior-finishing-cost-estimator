import 'reflect-metadata';
import { DeepPartial } from 'typeorm';
import { validate, validateSync, ValidationError } from 'class-validator';

import { MockIsEmailAvailableValidator } from '../../../../__mocks__/validators/IsEmailAvailable';

import { RegisterFormData } from '../../../../../src/modules/user/input/RegisterFormData';


describe('Register form data class', () => {

    beforeEach(() => {
        MockIsEmailAvailableValidator.validate.mockResolvedValue(true);
    });

    afterEach(() => {
        MockIsEmailAvailableValidator.validate.mockClear();
        MockIsEmailAvailableValidator.defaultMessage.mockClear();
    });

    function expectToReturnErrors(
        {
            name = 'valid name',
            email = 'valid.email@domain.com',
            password = 'valid password',
        }: Partial<RegisterFormData>,
        expectedErrors: DeepPartial<ValidationError>[],
    ) {
        // given
        const objectToValidate = new RegisterFormData();
        objectToValidate.name = name;
        objectToValidate.email = email;
        objectToValidate.password = password;

        // when
        const validationErrors = validateSync(objectToValidate);

        // then
        expect(validationErrors).toMatchObject(expectedErrors);
    }

    describe('name field', () => {

        it('should accept valid name', () => {
            expectToReturnErrors({
                name: 'valid name',
            }, []);
            expectToReturnErrors({
                name: 'valid-name',
            }, []);
        });

        it('should reject too short name', () => {
            expectToReturnErrors({
                name: 'aa',
            }, [ {
                constraints: {
                    length: expect.stringMatching(/name must be longer than or equal to \d+ characters/),
                },
            } ]);
        });

        it('should reject too long name', () => {
            expectToReturnErrors({
                name: 'a'.repeat(256),
            }, [ {
                constraints: {
                    length: expect.stringMatching(/name must be shorter than or equal to \d+ characters/),
                },
            } ]);
        });

    });

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

        it('should reject not available email', async () => {
            expect.assertions(1);

            // given
            MockIsEmailAvailableValidator.validate.mockResolvedValue(false);
            MockIsEmailAvailableValidator.defaultMessage.mockReturnValue('EMAIL_NOT_AVAILABLE-ERROR_MESSAGE');
            const objectToValidate = new RegisterFormData();
            objectToValidate.name = 'valid name';
            objectToValidate.email = 'taken.email@domain.com';
            objectToValidate.password = 'valid password';

            // when
            const validationErrors = await validate(objectToValidate);

            // then
            expect(validationErrors).toMatchObject([ {
                constraints: {
                    emailAvailability: 'EMAIL_NOT_AVAILABLE-ERROR_MESSAGE',
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
