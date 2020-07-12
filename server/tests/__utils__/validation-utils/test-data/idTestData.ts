import { ValidationTestData } from '../ValidationTestData';


export const idTestValue: Record<'valid' | 'invalid', ValidationTestData<{ id: string }>[]> = {
    valid: [
        {
            data: {
                id: '5f09e24646904045d48e5598',
            },
            expectedErrors: [],
        },
        {
            data: {
                id: '5f09e24646904045d48e5598',
            },
            expectedErrors: [],
        },
    ],
    invalid: [
        {
            data: {
                id: '',
            },
            expectedErrors: [ {
                isMongoId: 'id must be a mongodb id',
            } ],
        },
        {
            data: {
                id: 'invalid-id',
            },
            expectedErrors: [ {
                isMongoId: 'id must be a mongodb id',
            } ],
        },
    ],
};
