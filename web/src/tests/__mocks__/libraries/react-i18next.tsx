import React from 'react';


export function mockTFunction(key: string, options?: object) {
    // 't:' prefix is added to translation key as proof of calling transaction function
    return (options)
        ? `t:${key}:${JSON.stringify(options)}`
        : `t:${key}`;
}

export const mockUseTranslation = jest.fn().mockReturnValue({
    t: mockTFunction,
    i18n: {
        language: 'en',
    },
});

export const MockTrans = jest.fn().mockImplementation(({ i18nKey }) => (
    <div data-testid='MockTrans' data-i18n={i18nKey} />
));

jest.mock('react-i18next', () => ({
    useTranslation: mockUseTranslation,
    Trans: MockTrans,
}));
