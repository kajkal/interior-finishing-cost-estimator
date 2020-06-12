import { sign } from 'jsonwebtoken';
import { ValidationTestData } from '../ValidationTestData';


export const tokenTestValue: Record<'valid' | 'invalid', ValidationTestData<{ token: string }>[]> = {
    valid: [
        {
            data: {
                token: sign({}, 'shhh'),
            },
            expectedErrors: [],
        },
        {
            data: {
                token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJoZWxsbyJ9._',
            },
            expectedErrors: [],
        },
    ],
    invalid: [
        {
            data: {
                token: '',
            },
            expectedErrors: [ {
                isJwt: expect.stringMatching(/token must be a jwt string/),
            } ],
        },
        {
            data: {
                token: 'invalid-token',
            },
            expectedErrors: [ {
                isJwt: expect.stringMatching(/token must be a jwt string/),
            } ],
        },
    ],
};
