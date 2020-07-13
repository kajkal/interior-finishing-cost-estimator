import { UseUserDataHookResult } from '../../../code/utils/hooks/useUserData';


export const mockUseUserData: jest.MockedFunction<() => Partial<UseUserDataHookResult>> = jest.fn();

jest.mock('../../../code/utils/hooks/useUserData', () => ({
    useUserData: mockUseUserData,
}));
