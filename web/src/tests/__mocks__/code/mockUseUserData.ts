import { UseUserDataHookResult } from '../../../code/utils/hooks/useUserData';


export type DeepPartial<T> = {
    [P in keyof T]?: DeepPartial<T[P]>;
};

export const mockUseUserData: jest.MockedFunction<() => DeepPartial<UseUserDataHookResult>> = jest.fn();

jest.mock('../../../code/utils/hooks/useUserData', () => ({
    useUserData: mockUseUserData,
}));
