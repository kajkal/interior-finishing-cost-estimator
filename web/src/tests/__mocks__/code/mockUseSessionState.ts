import { ExtendedSessionState } from '../../../code/components/providers/apollo/cache/session/SessionStateManager';


export const mockUseSessionState: jest.MockedFunction<() => Partial<ExtendedSessionState>> = jest.fn();

jest.mock('../../../code/components/providers/apollo/cache/session/useSessionState', () => ({
    useSessionState: mockUseSessionState,
}));
