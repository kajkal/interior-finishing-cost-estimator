import { ValidationTestData } from '../ValidationTestData';


export const emailTestValue: Record<'valid' | 'invalid', ValidationTestData<{ email: string }>[]> = {
    valid: [
        {
            data: {
                email: 'valid.email@domain.com',
            },
            expectedErrors: [],
        },
        {
            data: {
                email: 'valid_email@domain.com',
            },
            expectedErrors: [],
        },
    ],
    invalid: [
        {
            data: {
                email: 'invalid-email',
            },
            expectedErrors: [ {
                isEmail: expect.stringMatching(/email must be an email/),
            } ],
        },
        {
            data: {
                email: 'invalid.email@domain',
            },
            expectedErrors: [ {
                isEmail: expect.stringMatching(/email must be an email/),
            } ],
        },
        {
            data: {
                email: 'invalid.email.domain.com',
            },
            expectedErrors: [ {
                isEmail: expect.stringMatching(/email must be an email/),
            } ],
        },
    ],
};
