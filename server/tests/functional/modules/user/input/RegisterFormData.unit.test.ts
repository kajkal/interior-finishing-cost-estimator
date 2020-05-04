import 'reflect-metadata';
import { DeepPartial } from 'typeorm';
import { validateSync, ValidationError } from 'class-validator';

import { RegisterFormData } from '../../../../../src/modules/user/input/RegisterFormData';
import { LoginFormData } from '../../../../../src/modules/user/input/LoginFormData';


describe('Register form data class', () => {

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

    it('should inherit fields from login form data', () => {
        // when/given
        const objectToValidate = new RegisterFormData();

        // then
        expect(objectToValidate).toBeInstanceOf(LoginFormData);
    });


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

});
