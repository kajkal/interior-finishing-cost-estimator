export const mockUseTranslation = {
    // 't:' prefix is added to translation key as proof of calling transaction function
    t: (key: string): any => `t:${key}`,
};

jest.mock('react-i18next', () => ({
    useTranslation: () => mockUseTranslation,
}));
