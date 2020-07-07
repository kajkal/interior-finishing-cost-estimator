import { ExtendedSessionState } from '../../../code/components/providers/apollo/cache/session/SessionStateUtils';


export const mockUseSessionState: jest.MockedFunction<() => Partial<ExtendedSessionState>> = jest.fn();

jest.mock('../../../code/components/providers/apollo/cache/session/useSessionState', () => ({
    useSessionState: mockUseSessionState,
}));
