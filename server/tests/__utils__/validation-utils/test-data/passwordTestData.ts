import { ValidationTestData } from '../ValidationTestData';


export const passwordTestValue: Record<'valid' | 'tooShort' | 'tooLong', ValidationTestData<{ password: string }>[]> = {
    valid: [
        {
            data: {
                password: 'valid password',
            },
            expectedErrors: [],
        },
    ],
    tooShort: [
        {
            data: {
                password: 'aa',
            },
            expectedErrors: [ {
                length: expect.stringMatching(/password must be longer than or equal to \d+ characters/),
            } ],
        },
    ],
    tooLong: [
        {
            data: {
                password: 'a'.repeat(256),
            },
            expectedErrors: [ {
                length: expect.stringMatching(/password must be shorter than or equal to \d+ characters/),
            } ],
        },
    ],
};
