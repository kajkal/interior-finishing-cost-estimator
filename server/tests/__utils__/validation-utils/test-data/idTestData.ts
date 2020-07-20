export function idTestValue(idFieldName: 'id' | 'projectId') {
    return {
        valid: [
            {
                data: {
                    [ idFieldName ]: '5f09e24646904045d48e5598',
                },
                expectedErrors: [],
            },
            {
                data: {
                    [ idFieldName ]: '5f09e24646904045d48e5598',
                },
                expectedErrors: [],
            },
        ],
        invalid: [
            {
                data: {
                    [ idFieldName ]: '',
                },
                expectedErrors: [ {
                    isMongoId: `${idFieldName} must be a mongodb id`,
                } ],
            },
            {
                data: {
                    [ idFieldName ]: 'invalid-id',
                },
                expectedErrors: [ {
                    isMongoId: `${idFieldName} must be a mongodb id`,
                } ],
            },
        ],
    };
}
